from pydantic import BaseModel, field_validator
from typing import Optional, Any
from datetime import datetime

class CertificateResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    issued_at: datetime
    verification_code: str
    pdf_url: Optional[str] = None
    certification_level: str
    status: str = "ACTIVE"
    practical_assessment_id: Optional[int] = None

    @field_validator("status", mode="before")
    @classmethod
    def coerce_status(cls, value: Any) -> str:
        # ORM may return Enum or NULL depending on migration/native_enum settings.
        if value is None:
            return "ACTIVE"
        return value.value if hasattr(value, "value") else str(value)

    class Config:
        from_attributes = True

class CertificateVerifyResponse(BaseModel):
    valid: bool
    holder_name: Optional[str] = None
    certification_level: Optional[str] = None
    issued_at: Optional[datetime] = None
    status: Optional[str] = None
