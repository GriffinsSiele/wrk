from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.db.session import get_db
from app.db.models import User, UserRole
from app.schemas.token import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def _role_value(user: User) -> str:
    return getattr(user.role, "value", str(user.role)).lower()


async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},)
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # None = legacy tokens minted before type claim; reject refresh masquerading as access.
        if payload.get("type") not in (None, "access"):
            raise credentials_exception
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.email == token_data.email))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    # Soft-deleted / disabled accounts cannot use otherwise-valid JWTs.
    if not user.is_active or user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive or deleted",
            headers={"WWW-Authenticate": "Bearer"},)
    return user


async def get_current_user_optional(
    db: AsyncSession = Depends(get_db),
    token: str | None = Depends(oauth2_scheme_optional),
) -> User | None:
    """Auth when a Bearer token is present; anonymous otherwise (course catalogue)."""
    if not token:
        return None
    try:
        return await get_current_user(db=db, token=token)
    except HTTPException:
        return None


async def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    if _role_value(current_user) != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user


async def get_current_active_coach(current_user: User = Depends(get_current_user)) -> User:
    """Coach portal routes, admin may also inspect."""
    role = _role_value(current_user)
    if role not in (UserRole.COACH.value, UserRole.ADMIN.value):
        raise HTTPException(status_code=403, detail="Coach access required")
    return current_user
