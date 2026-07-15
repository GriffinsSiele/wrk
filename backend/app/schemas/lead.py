from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    organisation: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None

class LeadResponse(LeadCreate):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class LeadStatusUpdate(BaseModel):
    status: str
