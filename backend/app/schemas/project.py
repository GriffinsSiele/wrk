from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClientCreate(BaseModel):
    """Backward-compatible operator create payload."""
    name: str
    industry: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    emirate: Optional[str] = None
    licence_status: str = "active"

class ClientResponse(ClientCreate):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Schema aliases matching architecture naming
OperatorCreate = ClientCreate
OperatorResponse = ClientResponse

class ProjectCreate(BaseModel):
    client_id: Optional[int] = None  # maps to operator_id
    operator_id: Optional[int] = None
    client_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    project_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str = "active"

class ProjectResponse(BaseModel):
    id: int
    client_id: Optional[int] = None
    operator_id: Optional[int] = None
    client_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    project_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str = "active"
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class AssignmentCreate(BaseModel):
    coach_id: int
    notes: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: int
    project_id: int
    coach_id: Optional[int] = None
    status: str
    assigned_at: datetime
    responded_at: Optional[datetime] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

class AssignmentStatusUpdate(BaseModel):
    status: str
