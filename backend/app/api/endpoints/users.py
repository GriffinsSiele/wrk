from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional
from app.db.session import get_db
from app.db.models import User, Profile
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).options(selectinload(User.profile)).where(User.id == current_user.id))
    user = result.scalars().first()
    p = user.profile
    return {
        "id": user.id, "email": user.email, "role": user.role.value, "is_active": user.is_active,
        "first_name": p.first_name if p else None, "last_name": p.last_name if p else None,
        "bio": p.bio if p else None, "phone": p.phone if p else None, "avatar_url": p.avatar_url if p else None,
    }

@router.patch("/me/profile")
async def update_my_profile(updates: ProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for field, value in updates.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    await db.commit()
    return {"message": "Profile updated"}
