from sqlalchemy import Boolean, Column, Float, Integer, String, Text

from .database import Base


class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False, index=True)
    provider_color = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    long_description = Column(Text, nullable=False)
    categories = Column(String, nullable=False)  # JSON as string
    parameters = Column(String, nullable=False)
    context_window = Column(String, nullable=False)
    context_tokens = Column(Integer, nullable=True)
    release_date = Column(String, nullable=False)
    last_updated = Column(String, nullable=True)
    pricing_input = Column(String, nullable=False)
    pricing_output = Column(String, nullable=False)
    pricing_input_per_million = Column(Float, nullable=True)
    pricing_output_per_million = Column(Float, nullable=True)
    pricing_free = Column(Boolean, default=False)
    pricing_tier = Column(String, nullable=False)
    license = Column(String, nullable=False)
    strengths = Column(String, nullable=False)  # JSON as string
    limitations = Column(String, nullable=False)  # JSON as string
    use_cases = Column(String, nullable=False)  # JSON as string
    api_endpoint = Column(String, nullable=False)
    documentation_url = Column(String, nullable=False)
    is_new = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    input_modalities = Column(String, nullable=True)  # JSON as string
    output_modalities = Column(String, nullable=True)  # JSON as string
    latency = Column(String, nullable=True)
    latency_ttfb = Column(String, nullable=True)
    latency_tokens_per_sec = Column(String, nullable=True)
    benchmarks_mmlu = Column(Float, nullable=True)
    benchmarks_human_eval = Column(Float, nullable=True)
    benchmarks_gsm8k = Column(Float, nullable=True)
    benchmarks_mt_bench = Column(Float, nullable=True)
    tags = Column(String, nullable=True)  # JSON as string
    model_size = Column(String, nullable=True)
    rate_limit_rpm = Column(String, nullable=True)
    rate_limit_tpm = Column(String, nullable=True)
