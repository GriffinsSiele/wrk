from pydantic_settings import BaseSettings


_DEFAULT_SECRET = "change-me-in-production-use-openssl-rand-hex-32"
_DEFAULT_REFRESH = "change-me-refresh-secret-key"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Olynixx Praxis API"
    ENVIRONMENT: str = "development"  # development | staging | production
    DATABASE_URL: str = "sqlite+aiosqlite:///./olynixx.db"
    SECRET_KEY: str = _DEFAULT_SECRET
    REFRESH_SECRET_KEY: str = _DEFAULT_REFRESH
    ALGORITHM: str = "HS256"
    # Align with frontend auth cookie (24h) until refresh-token flow is wired client-side.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BUNNY_LIBRARY_ID: str = ""
    BUNNY_API_KEY: str = ""
    BUNNY_CDN_HOSTNAME: str = ""
    BUNNY_TOKEN_AUTH_KEY: str = ""
    # Optional, only needed if you run async workers. Phase 1 PDF generation is synchronous.
    REDIS_URL: str = ""
    CELERY_BROKER_URL: str = ""
    # Working defaults until REPs UAE issues a proctoring/exam-security spec.
    # Admin ExamConfig rows override these per session. Do not treat as locked.
    EXAM_PASS_MARK: int = 78
    EXAM_QUESTION_COUNT: int = 40
    EXAM_TIME_LIMIT_MINUTES: int = 60
    EXAM_MAX_ATTEMPTS: int = 3
    EXAM_RANDOMISE: bool = True
    EXAM_DELIVERY_MODE: str = "online"
    # Demo stacks may return the raw reset token in the API response.
    # Production must keep this false and deliver tokens by email.
    RESET_TOKEN_RETURN_IN_RESPONSE: bool = False
    # Grace minutes after time_limit before submit is rejected (clock skew / network).
    EXAM_SUBMIT_GRACE_MINUTES: int = 2
    # Phase 1 integrity (Jef): 90s/question, one-way, resume on disconnect.
    EXAM_SECONDS_PER_QUESTION: int = 90
    # Cap on accumulated per-question pause during disconnects (overall 60m still runs).
    EXAM_MAX_DISCONNECT_PAUSE_SECONDS: int = 300
    # Comma-separated browser origins allowed to call the API directly (forms should prefer the Next proxy).
    CORS_ORIGINS: str = "http://localhost:3000"
    SQL_ECHO: bool = False
    ENABLE_DOCS: bool | None = None  # None = auto (off in production)
    RATE_LIMIT_LOGIN_PER_MINUTE: int = 20
    RATE_LIMIT_REGISTER_PER_MINUTE: int = 10
    RATE_LIMIT_LEADS_PER_MINUTE: int = 15
    CERTIFICATE_STORAGE_DIR: str = "storage/certificates"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def docs_enabled(self) -> bool:
        if self.ENABLE_DOCS is not None:
            return self.ENABLE_DOCS
        return not self.is_production

    @property
    def sql_echo_enabled(self) -> bool:
        if self.is_production:
            return False
        return self.SQL_ECHO

    def validate_for_runtime(self) -> None:
        """Refuse to boot production with placeholder secrets or SQLite."""
        if not self.is_production:
            return
        weak = []
        if self.SECRET_KEY in {_DEFAULT_SECRET, "supersecretkey", "secret"} or len(self.SECRET_KEY) < 32:
            weak.append("SECRET_KEY")
        if self.REFRESH_SECRET_KEY in {_DEFAULT_REFRESH, "supersecretkey"} or len(self.REFRESH_SECRET_KEY) < 32:
            weak.append("REFRESH_SECRET_KEY")
        if self.SECRET_KEY == self.REFRESH_SECRET_KEY:
            weak.append("SECRET_KEY must differ from REFRESH_SECRET_KEY")
        if self.DATABASE_URL.startswith("sqlite"):
            weak.append("DATABASE_URL (SQLite not allowed in production)")
        if "postgres:postgres@" in self.DATABASE_URL or "postgresql+asyncpg://postgres:postgres@" in self.DATABASE_URL:
            weak.append("DATABASE_URL (default postgres/postgres credentials)")
        if weak:
            raise RuntimeError(
                "Production misconfiguration: " + ", ".join(weak) + ". Set strong secrets before deploy."
            )

    class Config:
        env_file = ".env"


settings = Settings()
settings.validate_for_runtime()
