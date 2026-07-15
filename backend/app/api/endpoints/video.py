import hashlib
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.db.models import Lesson, User
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()

@router.get("/{lesson_id}/token")
async def get_video_token(lesson_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalars().first()
    if not lesson or not lesson.bunny_video_id:
        raise HTTPException(status_code=404, detail="Video not found")
    if not settings.BUNNY_TOKEN_AUTH_KEY or not settings.BUNNY_CDN_HOSTNAME:
        return {"url": f"https://example-bunny-stream.b-cdn.net/{lesson.bunny_video_id}/playlist.m3u8", "expires": None}
    expiry = int(time.time()) + 3600
    path = f"/{lesson.bunny_video_id}/playlist.m3u8"
    token = hashlib.sha256((settings.BUNNY_TOKEN_AUTH_KEY + path + str(expiry)).encode()).hexdigest()
    url = f"https://{settings.BUNNY_CDN_HOSTNAME}{path}?token={token}&expires={expiry}"
    return {"url": url, "expires": expiry}
