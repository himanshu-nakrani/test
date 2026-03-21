import json
from typing import Optional

from pydantic import BaseModel, computed_field, model_validator


class PricingResponse(BaseModel):
    input: str
    output: str
    free: bool = False
    inputPerMillion: Optional[float] = None
    outputPerMillion: Optional[float] = None


class BenchmarksResponse(BaseModel):
    mmlu: Optional[float] = None
    humanEval: Optional[float] = None
    gsm8k: Optional[float] = None
    mtBench: Optional[float] = None


class LatencyInfoResponse(BaseModel):
    label: Optional[str] = None
    ttfb: Optional[str] = None
    tokensPerSec: Optional[str] = None


class RateLimitsResponse(BaseModel):
    rpm: Optional[str] = None
    tpm: Optional[str] = None


class ModelResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    name: str
    provider: str
    providerColor: str
    description: str
    longDescription: str
    categories: list[str]
    parameters: str
    contextWindow: str
    contextTokens: Optional[int] = None
    releaseDate: str
    lastUpdated: Optional[str] = None
    pricing: PricingResponse
    pricingTier: str
    license: str
    strengths: list[str]
    limitations: list[str]
    useCases: list[str]
    apiEndpoint: str
    documentationUrl: str
    isNew: bool = False
    isFeatured: bool = False
    inputModalities: Optional[list[str]] = None
    outputModalities: Optional[list[str]] = None
    latency: Optional[str] = None
    latencyInfo: Optional[LatencyInfoResponse] = None
    benchmarks: Optional[BenchmarksResponse] = None
    tags: Optional[list[str]] = None
    modelSize: Optional[str] = None
    rateLimits: Optional[RateLimitsResponse] = None

    @model_validator(mode="before")
    @classmethod
    def transform_from_orm(cls, data):
        if hasattr(data, "__table__"):
            return _orm_to_dict(data)
        return data


def _parse_json_field(val: Optional[str]) -> Optional[list]:
    if val is None:
        return None
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return []


def _orm_to_dict(obj) -> dict:
    d = {}
    d["id"] = obj.id
    d["name"] = obj.name
    d["provider"] = obj.provider
    d["providerColor"] = obj.provider_color
    d["description"] = obj.description
    d["longDescription"] = obj.long_description
    d["categories"] = _parse_json_field(obj.categories) or []
    d["parameters"] = obj.parameters
    d["contextWindow"] = obj.context_window
    d["contextTokens"] = obj.context_tokens
    d["releaseDate"] = obj.release_date
    d["lastUpdated"] = obj.last_updated
    d["pricing"] = PricingResponse(
        input=obj.pricing_input,
        output=obj.pricing_output,
        free=obj.pricing_free or False,
        inputPerMillion=obj.pricing_input_per_million,
        outputPerMillion=obj.pricing_output_per_million,
    )
    d["pricingTier"] = obj.pricing_tier
    d["license"] = obj.license
    d["strengths"] = _parse_json_field(obj.strengths) or []
    d["limitations"] = _parse_json_field(obj.limitations) or []
    d["useCases"] = _parse_json_field(obj.use_cases) or []
    d["apiEndpoint"] = obj.api_endpoint
    d["documentationUrl"] = obj.documentation_url
    d["isNew"] = obj.is_new or False
    d["isFeatured"] = obj.is_featured or False
    d["inputModalities"] = _parse_json_field(obj.input_modalities)
    d["outputModalities"] = _parse_json_field(obj.output_modalities)
    d["latency"] = obj.latency
    d["modelSize"] = obj.model_size
    d["tags"] = _parse_json_field(obj.tags)

    if obj.latency or obj.latency_ttfb or obj.latency_tokens_per_sec:
        d["latencyInfo"] = LatencyInfoResponse(
            label=obj.latency,
            ttfb=obj.latency_ttfb,
            tokensPerSec=obj.latency_tokens_per_sec,
        )
    else:
        d["latencyInfo"] = None

    if any(
        v is not None
        for v in [
            obj.benchmarks_mmlu,
            obj.benchmarks_human_eval,
            obj.benchmarks_gsm8k,
            obj.benchmarks_mt_bench,
        ]
    ):
        d["benchmarks"] = BenchmarksResponse(
            mmlu=obj.benchmarks_mmlu,
            humanEval=obj.benchmarks_human_eval,
            gsm8k=obj.benchmarks_gsm8k,
            mtBench=obj.benchmarks_mt_bench,
        )
    else:
        d["benchmarks"] = None

    if obj.rate_limit_rpm or obj.rate_limit_tpm:
        d["rateLimits"] = RateLimitsResponse(
            rpm=obj.rate_limit_rpm,
            tpm=obj.rate_limit_tpm,
        )
    else:
        d["rateLimits"] = None

    return d


class ModelListResponse(BaseModel):
    models: list[ModelResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class StatsResponse(BaseModel):
    totalModels: int
    totalProviders: int
    benchmarkedCount: int
    openCount: int
    totalReviews: int = 0
