"""Configuration management for CodeArmour AI Backend"""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "CodeArmour AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    SECRET_KEY: str = "your-super-secret-key-change-in-production"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ML Model
    MODEL_NAME: str = "microsoft/codebert-base"
    MODEL_PATH: str = "./ml/models/codebert-vulnerability"
    MODEL_CHECKPOINT_PATH: Optional[str] = None
    MAX_TOKEN_LENGTH: int = 512
    MAX_SEQ_LENGTH: int = 512
    CONFIDENCE_THRESHOLD: float = 0.7
    BATCH_SIZE: int = 8

    # Hugging Face
    HF_TOKEN: str = ""

    # Logging
    LOG_LEVEL: str = "INFO"

    # Feedback Learning / MLOps
    FEEDBACK_THRESHOLD: int = 100
    AUTO_RETRAIN: bool = True
    FEEDBACK_MIN_SAMPLES_PER_LABEL: int = 5
    FEEDBACK_FALSE_POSITIVE_SUPPRESSION_RATE: float = 0.7
    FEEDBACK_CORRECTION_MIN_CONFIDENCE: float = 0.6
    FEEDBACK_POLICY_PATH: str = "./ml/data/processed/feedback_policy.json"
    FEEDBACK_EVENTS_PATH: str = "./ml/data/processed/feedback_training_events.jsonl"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
