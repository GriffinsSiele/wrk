from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class PracticalChecklistItem(BaseModel):
    key: str
    label: str
    required: bool = True


class PracticalChecklistTemplateCreate(BaseModel):
    name: str = "Level 1 Practical"
    certification_level: str = "Level 1"
    is_active: bool = True
    items: List[PracticalChecklistItem]
    min_required_pass: Optional[int] = None


class PracticalChecklistTemplateUpdate(BaseModel):
    name: Optional[str] = None
    certification_level: Optional[str] = None
    is_active: Optional[bool] = None
    items: Optional[List[PracticalChecklistItem]] = None
    min_required_pass: Optional[int] = None


class PracticalChecklistTemplateResponse(BaseModel):
    id: int
    name: str
    certification_level: str
    is_active: bool
    items: List[Dict[str, Any]]
    min_required_pass: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PracticalAssessmentCreate(BaseModel):
    user_id: int
    certification_level: str = "Level 1"
    checklist_result: Optional[Dict[str, Any]] = None
    result: str = Field(description="PASS or FAIL")
    notes: Optional[str] = None
    template_id: Optional[int] = None


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
