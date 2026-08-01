"""One-off: give demo learner written pass + certificate for portal testing."""
import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.db.models import (User,
    ExamAttempt,
    ExamSession,
    ExamRegistration,
    ExamStatus,
    PracticalAssessment,
    PracticalResult,
    Certificate,
    CertificateStatus,)
from app.services.certificate_pdf import ensure_certificate_pdf


async def main() -> None:
    async with AsyncSessionLocal() as db:
        user = (await db.execute(select(User)
                .options(selectinload(User.profile))
                .where(User.email == "learner@olynixx.com"))).scalars().first()
        if not user:
            raise SystemExit("learner not found")

        now = datetime.now(timezone.utc)
        session = (await db.execute(select(ExamSession).order_by(ExamSession.id.asc()))).scalars().first()
        session_id = session.id if session else None

        regs = (await db.execute(select(ExamRegistration).where(ExamRegistration.user_id == user.id))).scalars().all()
        if not regs and session_id:
            db.add(ExamRegistration(user_id=user.id,
                    session_id=session_id,
                    status=ExamStatus.PASSED,
                    registered_at=now - timedelta(days=5),))
        else:
            for r in regs:
                r.status = ExamStatus.PASSED

        attempts = (await db.execute(select(ExamAttempt).where(ExamAttempt.user_id == user.id))).scalars().all()
        attempt = next((a for a in attempts if a.passed), None)
        if not attempt:
            attempt = ExamAttempt(user_id=user.id,
                session_id=session_id,
                started_at=now - timedelta(days=4),
                submitted_at=now - timedelta(days=4),
                score=88,
                passed=True,
                approved_at=now - timedelta(days=3),
                answers={},)
            db.add(attempt)
            await db.flush()
        else:
            attempt.passed = True
            attempt.score = attempt.score or 88
            if not attempt.approved_at:
                attempt.approved_at = now - timedelta(days=3)
            if not attempt.submitted_at:
                attempt.submitted_at = now - timedelta(days=4)

        practicals = (await db.execute(select(PracticalAssessment).where(PracticalAssessment.user_id == user.id))).scalars().all()
        practical = next((p for p in practicals if p.result == PracticalResult.PASS), None)
        if not practical:
            practical = PracticalAssessment(user_id=user.id,
                certification_level="Level 1",
                checklist_result={"intake": "PASS", "demo": "PASS", "safety": "PASS"},
                result=PracticalResult.PASS,
                notes="Demo practical PASS for John",
                assessed_at=now - timedelta(days=2),)
            db.add(practical)
            await db.flush()

        certs = (await db.execute(select(Certificate).where(Certificate.user_id == user.id))).scalars().all()
        cert = certs[0] if certs else None
        if not cert:
            cert = Certificate(user_id=user.id,
                attempt_id=attempt.id,
                practical_assessment_id=practical.id,
                certification_level="Level 1: Human Readiness Coach",
                status=CertificateStatus.ACTIVE,
                verification_code="SEEDLRNJOHN0001",
                issued_at=now - timedelta(days=1),)
            db.add(cert)
            await db.flush()

        profile = user.profile
        holder = user.full_name or (f"{profile.first_name} {profile.last_name}".strip() if profile else user.email)
        ensure_certificate_pdf(holder_name=holder,
            certification_level=cert.certification_level,
            verification_code=cert.verification_code,
            issued_at=cert.issued_at or now,
            force=True,)
        cert.pdf_url = f"/api/certificates/{cert.id}/pdf"
        await db.commit()
        print(f"OK user={user.id} attempt={attempt.id} practical={practical.id} "
            f"cert={cert.id} code={cert.verification_code} pdf={cert.pdf_url}")


if __name__ == "__main__":
    asyncio.run(main())
