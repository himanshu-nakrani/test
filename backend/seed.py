"""Seed the SQLite database from public/api/models.json."""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.database import Base, SessionLocal, engine
from backend.db_models import AIModel, User

MODELS_JSON = os.path.join(
    os.path.dirname(__file__), "..", "public", "api", "models.json"
)


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with open(MODELS_JSON, "r") as f:
        models = json.load(f)

    db = SessionLocal()
    try:
        for m in models:
            pricing = m.get("pricing", {})
            benchmarks = m.get("benchmarks", {}) or {}
            latency_info = m.get("latencyInfo", {}) or {}
            rate_limits = m.get("rateLimits", {}) or {}

            row = AIModel(
                id=m["id"],
                name=m["name"],
                provider=m["provider"],
                provider_color=m["providerColor"],
                description=m["description"],
                long_description=m["longDescription"],
                categories=json.dumps(m.get("categories", [])),
                parameters=m["parameters"],
                context_window=m["contextWindow"],
                context_tokens=m.get("contextTokens"),
                release_date=m["releaseDate"],
                last_updated=m.get("lastUpdated"),
                pricing_input=pricing.get("input", ""),
                pricing_output=pricing.get("output", ""),
                pricing_input_per_million=pricing.get("inputPerMillion"),
                pricing_output_per_million=pricing.get("outputPerMillion"),
                pricing_free=pricing.get("free", False),
                pricing_tier=m["pricingTier"],
                license=m["license"],
                strengths=json.dumps(m.get("strengths", [])),
                limitations=json.dumps(m.get("limitations", [])),
                use_cases=json.dumps(m.get("useCases", [])),
                api_endpoint=m["apiEndpoint"],
                documentation_url=m["documentationUrl"],
                is_new=m.get("isNew", False),
                is_featured=m.get("isFeatured", False),
                input_modalities=json.dumps(m.get("inputModalities"))
                if m.get("inputModalities")
                else None,
                output_modalities=json.dumps(m.get("outputModalities"))
                if m.get("outputModalities")
                else None,
                latency=m.get("latency"),
                latency_ttfb=latency_info.get("ttfb"),
                latency_tokens_per_sec=latency_info.get("tokensPerSec"),
                benchmarks_mmlu=benchmarks.get("mmlu"),
                benchmarks_human_eval=benchmarks.get("humanEval"),
                benchmarks_gsm8k=benchmarks.get("gsm8k"),
                benchmarks_mt_bench=benchmarks.get("mtBench"),
                tags=json.dumps(m.get("tags")) if m.get("tags") else None,
                model_size=m.get("modelSize"),
                rate_limit_rpm=rate_limits.get("rpm"),
                rate_limit_tpm=rate_limits.get("tpm"),
            )
            db.add(row)

        demo_user = User(
            username="demo",
            display_name="Demo User",
        )
        db.add(demo_user)

        db.commit()
        print(f"Seeded {len(models)} models and 1 demo user into the database.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
