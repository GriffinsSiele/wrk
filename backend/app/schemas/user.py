from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True
