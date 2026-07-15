from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class PracticalAssessmentCreate(BaseModel):
    user_id: int
    certification_level: str = "Level 1"
    checklist_result: Optional[Dict[str, Any]] = None
    result: str = Field(description="PASS or FAIL")
    notes: Optional[str] = None


class PracticalAssessmentResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    assessor_id: Optional[int] = None
    certification_level: Optional[str] = None
    checklist_result: Optional[Dict[str, Any]] = None
    result: str
    notes: Optional[str] = None
    assessed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CoachAgreementResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    agreement_type: str
    version: str
    signed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CoachAgreementSign(BaseModel):
    agreement_type: str
    version: str = "1.0"


class OperatorCreate(BaseModel):
    name: str
    licence_status: str = "active"
    industry: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    emirate: Optional[str] = None


class OperatorResponse(OperatorCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
