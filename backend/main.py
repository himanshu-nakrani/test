import json
import math
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .db_models import AIModel
from .schemas import ModelListResponse, ModelResponse, StatsResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NeuralAtlas API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/models", response_model=ModelListResponse)
def list_models(
    search: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    pricing_tier: Optional[str] = Query(None),
    license: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(AIModel)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                AIModel.name.ilike(term),
                AIModel.description.ilike(term),
                AIModel.provider.ilike(term),
            )
        )

    if provider:
        query = query.filter(AIModel.provider == provider)

    if category:
        query = query.filter(AIModel.categories.contains(f'"{category}"'))

    if pricing_tier:
        query = query.filter(AIModel.pricing_tier == pricing_tier)

    if license:
        query = query.filter(AIModel.license == license)

    if sort_by == "name":
        query = query.order_by(AIModel.name)
    elif sort_by == "provider":
        query = query.order_by(AIModel.provider, AIModel.name)
    elif sort_by == "date":
        query = query.order_by(AIModel.release_date.desc())
    elif sort_by == "context":
        query = query.order_by(AIModel.context_tokens.desc().nullslast())
    elif sort_by == "price":
        query = query.order_by(
            AIModel.pricing_input_per_million.asc().nullslast()
        )
    else:
        query = query.order_by(AIModel.name)

    total = query.count()
    total_pages = max(1, math.ceil(total / per_page))
    offset = (page - 1) * per_page
    models = query.offset(offset).limit(per_page).all()

    return ModelListResponse(
        models=[ModelResponse.model_validate(m) for m in models],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@app.get("/api/models/{model_id}", response_model=ModelResponse)
def get_model(model_id: str, db: Session = Depends(get_db)):
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return ModelResponse.model_validate(model)


@app.get("/api/providers")
def list_providers(db: Session = Depends(get_db)):
    rows = (
        db.query(AIModel.provider)
        .distinct()
        .order_by(AIModel.provider)
        .all()
    )
    return [r[0] for r in rows]


@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total_models = db.query(func.count(AIModel.id)).scalar()
    total_providers = db.query(func.count(func.distinct(AIModel.provider))).scalar()
    benchmarked_count = (
        db.query(func.count(AIModel.id))
        .filter(AIModel.benchmarks_mmlu.isnot(None))
        .scalar()
    )
    open_count = (
        db.query(func.count(AIModel.id))
        .filter(AIModel.license.in_(["open-source", "open-weights"]))
        .scalar()
    )
    return StatsResponse(
        totalModels=total_models,
        totalProviders=total_providers,
        benchmarkedCount=benchmarked_count,
        openCount=open_count,
    )


@app.get("/api/models/{model_id}/related", response_model=list[ModelResponse])
def get_related_models(model_id: str, db: Session = Depends(get_db)):
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    categories = json.loads(model.categories) if model.categories else []

    related_query = db.query(AIModel).filter(AIModel.id != model_id)

    same_provider = related_query.filter(
        AIModel.provider == model.provider
    ).all()

    category_models = []
    if categories:
        for cat in categories:
            cat_results = (
                related_query.filter(AIModel.categories.contains(f'"{cat}"'))
                .all()
            )
            category_models.extend(cat_results)

    seen_ids = set()
    related = []
    for m in same_provider + category_models:
        if m.id not in seen_ids:
            seen_ids.add(m.id)
            related.append(m)
        if len(related) >= 6:
            break

    return [ModelResponse.model_validate(m) for m in related]
