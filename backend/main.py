import json
import math
from datetime import datetime
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, require_user
from .database import Base, engine, get_db
from .db_models import AIModel, Review, SavedComparison, User, UserFavorite
from .schemas import ModelListResponse, ModelResponse, StatsResponse
from .user_schemas import (
    FavoriteResponse,
    LoginRequest,
    ReviewCreate,
    ReviewResponse,
    SavedComparisonCreate,
    SavedComparisonResponse,
    TokenResponse,
    UserResponse,
)

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
    total_reviews = db.query(func.count(Review.id)).scalar()
    return StatsResponse(
        totalModels=total_models,
        totalProviders=total_providers,
        benchmarkedCount=benchmarked_count,
        openCount=open_count,
        totalReviews=total_reviews,
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


# --- Auth endpoints ---


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        displayName=user.display_name,
        avatarUrl=user.avatar_url,
        email=user.email,
        createdAt=user.created_at or "",
    )


@app.post("/api/auth/demo-login", response_model=TokenResponse)
def demo_login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user:
        user = User(
            username=body.username,
            display_name=body.username,
            created_at=datetime.utcnow().isoformat(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token(user.id)
    return TokenResponse(token=token, user=_user_to_response(user))


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(require_user)):
    return _user_to_response(user)


@app.post("/api/auth/logout")
def logout():
    return {"message": "Logged out successfully"}


# --- User favorites endpoints ---


@app.get("/api/user/favorites", response_model=list[FavoriteResponse])
def get_favorites(user: User = Depends(require_user), db: Session = Depends(get_db)):
    favs = db.query(UserFavorite).filter(UserFavorite.user_id == user.id).all()
    return [
        FavoriteResponse(modelId=f.model_id, createdAt=f.created_at or "")
        for f in favs
    ]


@app.post(
    "/api/user/favorites/{model_id}",
    response_model=FavoriteResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_favorite(
    model_id: str,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    existing = (
        db.query(UserFavorite)
        .filter(UserFavorite.user_id == user.id, UserFavorite.model_id == model_id)
        .first()
    )
    if existing:
        return FavoriteResponse(modelId=existing.model_id, createdAt=existing.created_at or "")
    fav = UserFavorite(
        user_id=user.id,
        model_id=model_id,
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return FavoriteResponse(modelId=fav.model_id, createdAt=fav.created_at or "")


@app.delete(
    "/api/user/favorites/{model_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_favorite(
    model_id: str,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(UserFavorite)
        .filter(UserFavorite.user_id == user.id, UserFavorite.model_id == model_id)
        .first()
    )
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Reviews endpoints ---


@app.get("/api/models/{model_id}/reviews", response_model=list[ReviewResponse])
def get_reviews(model_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(Review, User.username)
        .join(User, Review.user_id == User.id)
        .filter(Review.model_id == model_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [
        ReviewResponse(
            id=r.id,
            userId=r.user_id,
            username=username,
            modelId=r.model_id,
            rating=r.rating,
            title=r.title,
            comment=r.comment,
            createdAt=r.created_at or "",
        )
        for r, username in rows
    ]


@app.post(
    "/api/models/{model_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_review(
    model_id: str,
    body: ReviewCreate,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    existing = (
        db.query(Review)
        .filter(Review.user_id == user.id, Review.model_id == model_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You have already reviewed this model")
    review = Review(
        user_id=user.id,
        model_id=model_id,
        rating=body.rating,
        title=body.title,
        comment=body.comment,
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewResponse(
        id=review.id,
        userId=review.user_id,
        username=user.username,
        modelId=review.model_id,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        createdAt=review.created_at or "",
    )


# --- Saved comparisons endpoints ---


@app.get("/api/user/comparisons", response_model=list[SavedComparisonResponse])
def get_comparisons(user: User = Depends(require_user), db: Session = Depends(get_db)):
    rows = (
        db.query(SavedComparison)
        .filter(SavedComparison.user_id == user.id)
        .order_by(SavedComparison.created_at.desc())
        .all()
    )
    return [
        SavedComparisonResponse(
            id=c.id,
            name=c.name,
            modelIds=json.loads(c.model_ids),
            notes=c.notes,
            createdAt=c.created_at or "",
        )
        for c in rows
    ]


@app.post(
    "/api/user/comparisons",
    response_model=SavedComparisonResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_comparison(
    body: SavedComparisonCreate,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    comp = SavedComparison(
        user_id=user.id,
        name=body.name,
        model_ids=json.dumps(body.modelIds),
        notes=body.notes,
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return SavedComparisonResponse(
        id=comp.id,
        name=comp.name,
        modelIds=json.loads(comp.model_ids),
        notes=comp.notes,
        createdAt=comp.created_at or "",
    )


@app.delete(
    "/api/user/comparisons/{comparison_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comparison(
    comparison_id: int,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    comp = (
        db.query(SavedComparison)
        .filter(SavedComparison.id == comparison_id, SavedComparison.user_id == user.id)
        .first()
    )
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison not found")
    db.delete(comp)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
