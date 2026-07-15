from pydantic import BaseModel
from typing import Optional, List

class CoachAttributeBase(BaseModel):
    specialty: Optional[str] = None
    focus_area: Optional[str] = None
    emirate: Optional[str] = None
    languages: Optional[List[str]] = None
    availability_status: Optional[bool] = None
    travel_willingness: Optional[bool] = None
    certification_level: Optional[str] = None
    placement_eligible: Optional[bool] = None
    cec_credits: Optional[int] = None
    cec_status: Optional[str] = None

class CoachAttributeResponse(CoachAttributeBase):
    id: int
    user_id: Optional[int] = None
    class Config:
        from_attributes = True

class CoachProfile(BaseModel):
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class CoachResponse(BaseModel):
    id: int
    email: str
    profile: Optional[CoachProfile] = None
    coach_attributes: Optional[CoachAttributeResponse] = None
    class Config:
        from_attributes = True
