from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.db.models import User, Profile, LearnerProfile, UserRole, PasswordResetToken
from app.schemas.user import UserCreate, UserResponse
from app.schemas.admin import ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.core.config import settings
from app.core.rate_limit import limiter, client_ip
from pydantic import BaseModel

router = APIRouter()


class RefreshRequest(BaseModel):
    refresh_token: str


def _hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, request: Request, db: AsyncSession = Depends(get_db)):
    limiter.check(f"register:{client_ip(request)}", settings.RATE_LIMIT_REGISTER_PER_MINUTE)
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
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    # Rate key is IP+email so one IP cannot burn another user's budget as easily.
    limiter.check(
        f"login:{client_ip(request)}:{form_data.username.lower()}",
        settings.RATE_LIMIT_LOGIN_PER_MINUTE,
    )
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    # Same message for missing user vs bad password (no account enumeration).
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
    # Re-check active/deleted so revoked accounts cannot mint new access tokens.
    if not user or not user.is_active or user.deleted_at is not None:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    # No refresh rotation yet — only a new access token is returned.
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Issue a one-time reset token. Email delivery not wired — raw token only in non-production."""
    limiter.check(f"forgot:{client_ip(request)}", settings.RATE_LIMIT_LOGIN_PER_MINUTE)
    generic = {"message": "If that email exists, a reset token has been issued."}
    result = await db.execute(
        select(User).where(User.email == body.email.lower(), User.deleted_at.is_(None), User.is_active.is_(True))
    )
    user = result.scalars().first()
    if not user:
        return generic
    raw = secrets.token_urlsafe(32)
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=_hash_reset_token(raw),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
    )
    await db.commit()
    if settings.is_production:
        return generic
    return {**generic, "reset_token": raw, "expires_in_minutes": 60}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, request: Request, db: AsyncSession = Depends(get_db)):
    limiter.check(f"reset:{client_ip(request)}", settings.RATE_LIMIT_LOGIN_PER_MINUTE)
    if len(body.password) < 10:
        raise HTTPException(status_code=400, detail="Password must be at least 10 characters")
    token_hash = _hash_reset_token(body.token)
    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
        )
    )
    row = result.scalars().first()
    now = datetime.now(timezone.utc)
    if not row or row.expires_at < now:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user_result = await db.execute(select(User).where(User.id == row.user_id, User.deleted_at.is_(None)))
    user = user_result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user.password_hash = get_password_hash(body.password)
    row.used_at = now
    await db.commit()
    return {"message": "Password updated"}
