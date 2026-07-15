from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
from app.db.session import get_db
from app.db.models import User, Profile, LearnerProfile, UserRole
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_refresh_token
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="The user with this email already exists")
    full_name = f"{user_in.first_name} {user_in.last_name}".strip()
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=UserRole.LEARNER,
        full_name=full_name,
    )
    db.add(user)
    await db.flush()
    profile = Profile(user_id=user.id, first_name=user_in.first_name, last_name=user_in.last_name)
    db.add(profile)
    db.add(LearnerProfile(user_id=user.id, progress_percentage=0))
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active or user.deleted_at is not None:
        raise HTTPException(status_code=403, detail="Account is disabled")
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": user.email})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh")
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_refresh_token(body.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    email = payload.get("sub")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user or not user.is_active or user.deleted_at is not None:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}
