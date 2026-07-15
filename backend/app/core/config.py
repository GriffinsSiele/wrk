from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Olynixx Academy API"
    DATABASE_URL: str = "sqlite+aiosqlite:///./olynixx.db"
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    REFRESH_SECRET_KEY: str = "change-me-refresh-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BUNNY_LIBRARY_ID: str = ""
    BUNNY_API_KEY: str = ""
    BUNNY_CDN_HOSTNAME: str = ""
    BUNNY_TOKEN_AUTH_KEY: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    EXAM_PASS_MARK: int = 70
    EXAM_TIME_LIMIT_MINUTES: int = 60
    EXAM_MAX_ATTEMPTS: int = 3
    EXAM_RANDOMISE: bool = True
    EXAM_DELIVERY_MODE: str = "online"

    class Config:
        env_file = ".env"

settings = Settings()
