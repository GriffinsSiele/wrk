from pydantic import BaseModel
from typing import Optional
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
    class Config:
        from_attributes = True

class CertificateVerifyResponse(BaseModel):
    valid: bool
    holder_name: Optional[str] = None
    certification_level: Optional[str] = None
    issued_at: Optional[datetime] = None
    status: Optional[str] = None
