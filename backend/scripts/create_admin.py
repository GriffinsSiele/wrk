"""Create or reset a production admin user (no demo seed).

Usage (inside the backend container / Railway shell):

  python scripts/create_admin.py --email you@olynixx.com --password 'StrongPass!' --name 'Your Name'

Or with env vars:

  ADMIN_EMAIL=you@olynixx.com ADMIN_PASSWORD='StrongPass!' python scripts/create_admin.py
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path

# Allow running as `python scripts/create_admin.py` from /app or backend/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.models import ExamConfig, Profile, User, UserRole
from app.db.session import AsyncSessionLocal


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Create or update an admin user for Olynixx Praxis")
    p.add_argument("--email", default=os.environ.get("ADMIN_EMAIL"), help="Admin email")
    p.add_argument("--password", default=os.environ.get("ADMIN_PASSWORD"), help="Admin password")
    p.add_argument("--name", default=os.environ.get("ADMIN_NAME", "Olynixx Admin"), help="Full name")
    p.add_argument(
        "--skip-exam-config",
        action="store_true",
        help="Do not create a default Level 1 ExamConfig if none exists",
    )
    return p.parse_args()


async def main() -> int:
    args = _parse_args()
    email = (args.email or "").strip().lower()
    password = args.password or ""
    name = (args.name or "Olynixx Admin").strip()

    if not email or "@" not in email:
        print("ERROR: provide --email or ADMIN_EMAIL")
        return 1
    if len(password) < 10:
        print("ERROR: password must be at least 10 characters (--password or ADMIN_PASSWORD)")
        return 1
    if password in {"admin123", "password", "Password123", "changeme"}:
        print("ERROR: refuse weak/default password")
        return 1

    async with AsyncSessionLocal() as session:
        existing = await session.scalar(select(User).where(User.email == email))
        if existing:
            existing.password_hash = get_password_hash(password)
            existing.role = UserRole.ADMIN
            existing.is_active = True
            existing.deleted_at = None
            existing.full_name = name
            print(f"Updated existing user to admin: {email}")
        else:
            user = User(
                email=email,
                password_hash=get_password_hash(password),
                role=UserRole.ADMIN,
                full_name=name,
                is_active=True,
            )
            session.add(user)
            await session.flush()
            parts = name.split(None, 1)
            session.add(
                Profile(
                    user_id=user.id,
                    first_name=parts[0] if parts else "Admin",
                    last_name=parts[1] if len(parts) > 1 else "",
                    bio="System Administrator",
                )
            )
            print(f"Created admin: {email}")

        if not args.skip_exam_config:
            has_cfg = await session.scalar(select(ExamConfig.id).limit(1))
            if not has_cfg:
                session.add(
                    ExamConfig(
                        name="Level 1 Written Exam",
                        certification_level="Level 1",
                        pass_mark=78,
                        time_limit_minutes=60,
                        max_attempts=3,
                        question_count=40,
                        proctoring_level="basic",
                    )
                )
                print("Created default Level 1 ExamConfig")

        await session.commit()

    print("Done. Log in via https://olynixx-academy.vercel.app/ after Vercel points at this API.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
