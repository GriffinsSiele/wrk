from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.db.session import get_db
from app.db.models import User
from app.schemas.token import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Note: does not re-check is_active/deleted_at; login/refresh gate those.
async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.email == token_data.email))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    # UserRole is str-backed; comparing to "admin" matches ORM enum values.
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
