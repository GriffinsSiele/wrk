from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

_docs_url = "/docs" if settings.docs_enabled else None
_redoc_url = "/redoc" if settings.docs_enabled else None
_openapi_url = "/openapi.json" if settings.docs_enabled else None

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url=_docs_url,
    redoc_url=_redoc_url,
    openapi_url=_openapi_url,
)

_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.api import api_router

app.include_router(api_router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to Olynixx Praxis API", "environment": settings.ENVIRONMENT}


@app.get("/health")
def health():
    """Liveness/readiness probe for Azure Container Apps / load balancers."""
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "docs": settings.docs_enabled,
    }
