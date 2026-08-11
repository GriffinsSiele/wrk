"""
Rich Phase-1 demo seed for Olynixx Praxis portals.

Usage:
  docker-compose exec backend python seed.py
  docker-compose exec backend python seed.py --force   # wipe demo rows & reseed

Seed modes (SEED_MODE env):
  demo     (default), full cohort + multi-week dated activity for live charts
  minimal           , bootstrap admin only (safe for production bootstrap)
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone

import bcrypt
from sqlalchemy import delete, select, text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.models import (AgreementType,
    AssignmentStatus,
    Certificate,
    CertificateStatus,
    CoachAgreement,
    CoachAttribute,
    Course,
    CourseEnrollment,
    ExamAttempt,
    ExamConfig,
    ExamRegistration,
    ExamSession,
    ExamStatus,
    Lead,
    LearnerProfile,
    Lesson,
    LessonProgress,
    Module,
    Operator,
    PracticalAssessment,
    PracticalResult,
    Profile,
    Project,
    ProjectAssignment,
    QuestionBank,
    Quiz,
    User,
    UserRole,)

DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

NOW = datetime.now(timezone.utc)
SEED_MODE = os.environ.get("SEED_MODE", "demo").strip().lower()


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def days_ago(n: int) -> datetime:
    return NOW - timedelta(days=n)


def weeks_ago(n: int) -> datetime:
    return NOW - timedelta(weeks=n)


async def wipe_demo_data(session) -> None:
    """Clear application tables so seed can rebuild (keeps alembic_version)."""
    # Discover existing tables so missing relations don't abort the wipe
    result = await session.execute(text("""
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
              AND tablename <> 'alembic_version'
            """))
    existing = {row[0] for row in result.fetchall()}
    preferred = [
        "project_assignments",
        "projects",
        "operators",
        "clients",
        "certificates",
        "practical_assessments",
        "exam_attempts",
        "exam_registrations",
        "exam_sessions",
        "exam_configs",
        "question_bank",
        "lesson_progress",
        "materials",
        "quizzes",
        "lessons",
        "modules",
        "course_enrollments",
        "courses",
        "coach_agreements",
        "coach_attributes",
        "learner_profiles",
        "profiles",
        "leads",
        "users",
    ]
    to_truncate = [t for t in preferred if t in existing]
    if not to_truncate:
        print("No application tables found to truncate.")
        return
    quoted = ", ".join(to_truncate)
    await session.execute(text(f"TRUNCATE TABLE {quoted} RESTART IDENTITY CASCADE"))
    await session.commit()
    print(f"Truncated: {', '.join(to_truncate)}")


async def seed_minimal(force: bool = False) -> None:
    """Production-safe bootstrap: one admin account only."""
    async with AsyncSessionLocal() as session:
        existing_admin = await session.scalar(select(User.id).where(User.email == "admin@olynixx.com"))
        if existing_admin and not force:
            print("Minimal seed: admin already exists. Use --force to wipe and recreate.")
            return
        if existing_admin and force:
            await wipe_demo_data(session)

        admin = User(email="admin@olynixx.com",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            full_name="Olynixx Admin",
            created_at=NOW,)
        session.add(admin)
        await session.flush()
        session.add(Profile(user_id=admin.id, first_name="Olynixx", last_name="Admin", bio="System Administrator"))
        session.add(ExamConfig(name="Level 1 Written Exam",
                certification_level="Level 1",
                pass_mark=70,
                time_limit_minutes=60,
                max_attempts=3,
                question_count=10,
                proctoring_level="basic",))
        await session.commit()
        print("Minimal seed complete: admin@olynixx.com / admin123")
        print("Change this password before any production use.")


async def seed_data(force: bool = False, mode: str | None = None) -> None:
    active_mode = (mode or SEED_MODE).strip().lower()
    if active_mode == "minimal":
        await seed_minimal(force=force)
        return

    async with AsyncSessionLocal() as session:
        existing_admin = await session.scalar(select(User.id).where(User.email == "admin@olynixx.com"))
        if existing_admin and not force:
            print("Seed users already exist. Re-run with --force to rebuild demo data.")
            return
        if existing_admin and force:
            await wipe_demo_data(session)

        # ── Users ──────────────────────────────────────────────
        admin = User(email="admin@olynixx.com",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            full_name="Olynixx Admin",
            created_at=weeks_ago(12),)
        session.add(admin)
        await session.flush()
        session.add(Profile(user_id=admin.id, first_name="Olynixx", last_name="Admin", bio="System Administrator"))

        coach_defs = [
            {
                "email": "coach@olynixx.com",
                "password": "coach123",
                "first": "Sarah",
                "last": "Connor",
                "bio": "Experienced recovery coach based in Dubai.",
                "phone": "+971501234567",
                "specialty": "Recovery",
                "focus": "Executive Recovery",
                "emirate": "Dubai",
                "languages": ["English", "Arabic"],
                "level": "Level 2",
                "cec": 12,
                "cec_status": "Current",
                "available": True,
                "placement": True,
                "sign_agreements": True,
                "cert": True,
            },
            {
                "email": "ahmed@olynixx.com",
                "password": "coach123",
                "first": "Ahmed",
                "last": "Al Rashid",
                "bio": "Performance specialist in Abu Dhabi.",
                "phone": "+971502345678",
                "specialty": "Performance",
                "focus": "Sport Performance",
                "emirate": "Abu Dhabi",
                "languages": ["English", "Arabic"],
                "level": "Level 3",
                "cec": 18,
                "cec_status": "Current",
                "available": True,
                "placement": True,
                "sign_agreements": True,
                "cert": True,
            },
            {
                "email": "fatima@olynixx.com",
                "password": "coach123",
                "first": "Fatima",
                "last": "Hassan",
                "bio": "Readiness coach focused on community programmes.",
                "phone": "+971503456789",
                "specialty": "Readiness",
                "focus": "Community Readiness",
                "emirate": "Sharjah",
                "languages": ["English", "Arabic", "Urdu"],
                "level": "Level 1",
                "cec": 4,
                "cec_status": "Due",
                "available": False,
                "placement": False,
                "sign_agreements": False,
                "cert": False,
            },
            {
                "email": "marcus@olynixx.com",
                "password": "coach123",
                "first": "Marcus",
                "last": "Cole",
                "bio": "HRV and autonomic coaching specialist.",
                "phone": "+971504567890",
                "specialty": "HRV Coaching",
                "focus": "Corporate Wellness",
                "emirate": "Dubai",
                "languages": ["English"],
                "level": "Level 2",
                "cec": 9,
                "cec_status": "Current",
                "available": True,
                "placement": False,
                "sign_agreements": True,
                "cert": False,
            },
            {
                "email": "layla@olynixx.com",
                "password": "coach123",
                "first": "Layla",
                "last": "Mansour",
                "bio": "Workplace wellbeing facilitator.",
                "phone": "+971505678901",
                "specialty": "Workplace Wellbeing",
                "focus": "Corporate Wellness",
                "emirate": "Abu Dhabi",
                "languages": ["English", "Arabic", "French"],
                "level": "Level 2",
                "cec": 14,
                "cec_status": "Current",
                "available": True,
                "placement": True,
                "sign_agreements": True,
                "cert": True,
            },
        ]

        coach_attrs: dict[str, CoachAttribute] = {}
        coach_users: dict[str, User] = {}
        for i, c in enumerate(coach_defs):
            user = User(email=c["email"],
                password_hash=get_password_hash(c["password"]),
                role=UserRole.COACH,
                full_name=f"{c['first']} {c['last']}",
                created_at=weeks_ago(10 - i),)
            session.add(user)
            await session.flush()
            session.add(Profile(user_id=user.id,
                    first_name=c["first"],
                    last_name=c["last"],
                    bio=c["bio"],
                    phone=c["phone"],))
            attrs = CoachAttribute(user_id=user.id,
                specialty=c["specialty"],
                focus_area=c["focus"],
                emirate=c["emirate"],
                languages=c["languages"],
                certification_level=c["level"],
                cec_status=c["cec_status"],
                cec_credits=c["cec"],
                cec_renewal_date=NOW + timedelta(days=180),
                placement_eligible=c["placement"],
                availability_status=c["available"],
                travel_willingness=True,)
            session.add(attrs)
            await session.flush()
            coach_attrs[c["email"]] = attrs
            coach_users[c["email"]] = user

            if c["sign_agreements"]:
                session.add(CoachAgreement(user_id=user.id,
                        agreement_type=AgreementType.NDA,
                        version="1.0",
                        signed_at=days_ago(40 - i),))
                session.add(CoachAgreement(user_id=user.id,
                        agreement_type=AgreementType.CODE_OF_CONDUCT,
                        version="1.0",
                        signed_at=days_ago(39 - i),))
            if c["cert"]:
                session.add(Certificate(user_id=user.id,
                        certification_level=f"{c['level']}, Certified Coach",
                        status=CertificateStatus.ACTIVE,
                        verification_code=f"SEEDCOACH{i+1:04d}CERT",
                        issued_at=weeks_ago(8 - i),))

        learner_defs = [
            {"email": "learner@olynixx.com", "password": "learner123", "first": "John", "last": "Doe", "progress": 28},
            {"email": "maya@olynixx.com", "password": "learner123", "first": "Maya", "last": "Khan", "progress": 55},
            {"email": "omar@olynixx.com", "password": "learner123", "first": "Omar", "last": "Said", "progress": 72},
            {"email": "nina@olynixx.com", "password": "learner123", "first": "Nina", "last": "Petrov", "progress": 90},
            {"email": "james@olynixx.com", "password": "learner123", "first": "James", "last": "Wright", "progress": 12},
            {"email": "aisha@olynixx.com", "password": "learner123", "first": "Aisha", "last": "Noor", "progress": 40},
        ]
        learners: dict[str, User] = {}
        for i, l in enumerate(learner_defs):
            user = User(email=l["email"],
                password_hash=get_password_hash(l["password"]),
                role=UserRole.LEARNER,
                full_name=f"{l['first']} {l['last']}",
                created_at=weeks_ago(9 - i),)
            session.add(user)
            await session.flush()
            session.add(Profile(user_id=user.id,
                    first_name=l["first"],
                    last_name=l["last"],
                    bio="Aspiring human performance coach.",))
            session.add(LearnerProfile(user_id=user.id,
                    enrollment_date=weeks_ago(8 - i),
                    progress_percentage=l["progress"],))
            learners[l["email"]] = user

        # ── Course content ─────────────────────────────────────
        course = Course(title="Human Readiness Certification (Level 1)",
            description="Foundational specialisation in Human Readiness and Recovery, measure capacity, then set the input.",
            is_published=True,
            created_at=weeks_ago(11),)
        session.add(course)
        await session.flush()

        modules_spec = [
            ("Module 1: The Physiology of Readiness", [
                "Lesson 1.1: Autonomic Nervous System",
                "Lesson 1.2: HRV Foundations",
                "Lesson 1.3: Stress Load Mapping",
            ]),
            ("Module 2: Recovery", [
                "Lesson 2.1: Sleep Architecture",
                "Lesson 2.2: Recovery Protocols",
                "Lesson 2.3: Monitoring Cadence",
            ]),
            ("Module 3: Coaching Practice", [
                "Lesson 3.1: Intake & Assessment",
                "Lesson 3.2: Programme Design",
            ]),
        ]
        all_lessons: list[Lesson] = []
        module_ids: list[int] = []
        for mi, (mtitle, lessons) in enumerate(modules_spec, start=1):
            mod = Module(course_id=course.id, title=mtitle, order=mi)
            session.add(mod)
            await session.flush()
            module_ids.append(mod.id)
            for li, ltitle in enumerate(lessons, start=1):
                lesson = Lesson(module_id=mod.id,
                    title=ltitle,
                    order=li,
                    content=f"Demo content for {ltitle}.",
                    duration_seconds=720 + mi * 60 + li * 30,)
                session.add(lesson)
                await session.flush()
                all_lessons.append(lesson)

        # Quiz on module 1
        session.add(Quiz(module_id=module_ids[0],
                questions=[
                    {
                        "id": "q1",
                        "text": "Which system governs fight-or-flight responses?",
                        "options": ["Sympathetic", "Parasympathetic", "Somatic", "Enteric"],
                        "correct_option": "Sympathetic",
                        "option_a": "Sympathetic",
                        "option_b": "Parasympathetic",
                        "option_c": "Somatic",
                        "option_d": "Enteric",
                    },
                    {
                        "id": "q2",
                        "text": "HRV primarily reflects which capacity?",
                        "options": ["Autonomic flexibility", "VO2 max", "Muscle mass", "Bone density"],
                        "correct_option": "Autonomic flexibility",
                        "option_a": "Autonomic flexibility",
                        "option_b": "VO2 max",
                        "option_c": "Muscle mass",
                        "option_d": "Bone density",
                    },
                    {
                        "id": "q3",
                        "text": "A dual-gate certification requires:",
                        "options": [
                            "Written exam + practical PASS",
                            "Written exam only",
                            "Practical only",
                            "Attendance certificate",
                        ],
                        "correct_option": "Written exam + practical PASS",
                        "option_a": "Written exam + practical PASS",
                        "option_b": "Written exam only",
                        "option_c": "Practical only",
                        "option_d": "Attendance certificate",
                    },
                ],))

        # Seeded progress % drives which lessons are marked complete (dashboard later syncs %).
        for i, (email, user) in enumerate(learners.items()):
            progress = learner_defs[i]["progress"]
            session.add(CourseEnrollment(user_id=user.id,
                    course_id=course.id,
                    progress=progress,
                    status="active" if progress < 100 else "completed",
                    enrolled_at=weeks_ago(8 - i),))
            complete_count = max(1, int(len(all_lessons) * progress / 100))
            for li, lesson in enumerate(all_lessons[:complete_count]):
                # Spread across ~8 weeks; keep a few completions in the last 6 days for daily charts.
                if li < 3:
                    completed_at = days_ago(max(0, 5 - li - (i % 2)))
                else:
                    completed_at = days_ago(8 + li * 4 + i * 2)
                session.add(LessonProgress(user_id=user.id,
                        lesson_id=lesson.id,
                        completed=True,
                        completed_at=completed_at,))

        # ── Exam stack ─────────────────────────────────────────
        exam_config = ExamConfig(name="Level 1 Written Exam",
            certification_level="Level 1",
            pass_mark=70,
            time_limit_minutes=60,
            max_attempts=3,
            question_count=10,
            proctoring_level="basic",)
        session.add(exam_config)
        await session.flush()

        questions = [
            ("What does HRV measure?", "Heart rate variability", "Blood pressure", "VO2", "Lactate", "A", "Physiology"),
            ("Sympathetic activation is associated with:", "Fight-or-flight", "Rest-and-digest", "Sleep onset", "Digestion", "A", "Physiology"),
            ("A practical assessment result of PASS means:", "Skill gate cleared", "Written only", "CEC complete", "Lead converted", "A", "Certification"),
            ("Placement eligibility requires:", "Active cert + agreements", "Email only", "Lead form", "Quiz score", "A", "Compliance"),
            ("Recovery protocols primarily target:", "Allostatic load", "Max strength", "Sprint speed", "Bone density", "A", "Recovery"),
            ("Parasympathetic tone supports:", "Rest and recovery", "Sprint power", "Cortisol spike", "Dehydration", "A", "Physiology"),
            ("CEC credits are used for:", "Credential renewal", "Project billing", "Lead scoring", "Exam booking", "A", "Compliance"),
            ("Online written exam is one gate of:", "Dual-gate certification", "Project dispatch", "Lead nurture", "Operator licence", "A", "Certification"),
            ("Coach NDA must be:", "Signed before placement", "Optional", "Admin-only", "Learner-only", "A", "Compliance"),
            ("Readiness coaching focuses on:", "Human performance capacity", "Tax filing", "Hardware sales", "SEO", "A", "Coaching"),
        ]
        for text_q, a, b, c, d, correct, tag in questions:
            session.add(QuestionBank(text=text_q,
                    option_a=a,
                    option_b=b,
                    option_c=c,
                    option_d=d,
                    correct_option=correct,
                    pillar_tag=tag,
                    difficulty="medium",
                    is_active=True,))

        past_session = ExamSession(title="Level 1 Online Written, March Cohort",
            date=days_ago(21),
            is_online=True,
            location="Online",
            capacity=40,
            exam_config_id=exam_config.id,)
        upcoming_session = ExamSession(title="Level 1 Online Written, July Cohort",
            date=NOW + timedelta(days=14),
            is_online=True,
            location="Online",
            capacity=40,
            exam_config_id=exam_config.id,)
        session.add_all([past_session, upcoming_session])
        await session.flush()

        # Registrations + attempts for advanced learners
        john = learners["learner@olynixx.com"]
        maya = learners["maya@olynixx.com"]
        omar = learners["omar@olynixx.com"]
        nina = learners["nina@olynixx.com"]

        session.add(ExamRegistration(user_id=john.id, session_id=past_session.id, status=ExamStatus.PASSED, registered_at=days_ago(5)))
        session.add(ExamRegistration(user_id=maya.id, session_id=past_session.id, status=ExamStatus.PASSED, registered_at=days_ago(30)))
        session.add(ExamRegistration(user_id=omar.id, session_id=past_session.id, status=ExamStatus.PASSED, registered_at=days_ago(28)))
        session.add(ExamRegistration(user_id=nina.id, session_id=past_session.id, status=ExamStatus.PASSED, registered_at=days_ago(25)))

        # Demo primary learner: full dual-gate + certificate so portal download can be tested.
        john_attempt = ExamAttempt(user_id=john.id,
            session_id=past_session.id,
            started_at=days_ago(6),
            submitted_at=days_ago(6),
            score=88,
            passed=True,
            approved_by_id=admin.id,
            approved_at=days_ago(5),
            answers={},)
        maya_attempt = ExamAttempt(user_id=maya.id,
            session_id=past_session.id,
            started_at=days_ago(20),
            submitted_at=days_ago(20),
            score=82,
            passed=True,
            approved_by_id=admin.id,
            approved_at=days_ago(19),
            answers={},)
        omar_attempt = ExamAttempt(user_id=omar.id,
            session_id=past_session.id,
            started_at=days_ago(18),
            submitted_at=days_ago(18),
            score=76,
            passed=True,
            approved_by_id=admin.id,
            approved_at=days_ago(17),
            answers={},)
        nina_attempt = ExamAttempt(user_id=nina.id,
            session_id=past_session.id,
            started_at=days_ago(15),
            submitted_at=days_ago(15),
            score=91,
            passed=True,
            approved_by_id=admin.id,
            approved_at=days_ago(14),
            answers={},)
        # Passed but not approved, fixture for the admin exam approval queue.
        pending_attempt = ExamAttempt(user_id=learners["aisha@olynixx.com"].id,
            session_id=past_session.id,
            started_at=days_ago(2),
            submitted_at=days_ago(2),
            score=74,
            passed=True,
            answers={},)
        session.add_all([john_attempt, maya_attempt, omar_attempt, nina_attempt, pending_attempt])
        await session.flush()

        # Practicals + learner certificates (dual-gate)
        for learner_user, attempt, level in [
            (john, john_attempt, "Level 1"),
            (maya, maya_attempt, "Level 1"),
            (omar, omar_attempt, "Level 1"),
            (nina, nina_attempt, "Level 1"),
        ]:
            practical = PracticalAssessment(user_id=learner_user.id,
                assessor_id=admin.id,
                certification_level=level,
                checklist_result={"intake": "PASS", "demo": "PASS", "safety": "PASS"},
                result=PracticalResult.PASS,
                notes="Demo practical PASS",
                assessed_at=days_ago(12),)
            session.add(practical)
            await session.flush()
            session.add(Certificate(user_id=learner_user.id,
                    attempt_id=attempt.id,
                    practical_assessment_id=practical.id,
                    certification_level=f"{level}, Human Readiness Coach",
                    status=CertificateStatus.ACTIVE,
                    verification_code=f"SEEDLRN{learner_user.id:04d}CERT",
                    issued_at=days_ago(10),
                    pdf_url=None,))

        # One FAIL practical for variety
        session.add(PracticalAssessment(user_id=learners["james@olynixx.com"].id,
                assessor_id=admin.id,
                certification_level="Level 1",
                checklist_result={"intake": "PASS", "demo": "FAIL"},
                result=PracticalResult.FAIL,
                notes="Needs retake on coaching demo",
                assessed_at=days_ago(5),))

        # ── Operators / projects / assignments ─────────────────
        operators_spec = [
            ("PureHealth Corporate", "Healthcare", "Abu Dhabi", "contact@purehealth.ae"),
            ("Emirates Sport Institute", "Sport", "Dubai", "ops@esi.ae"),
            ("Gulf Executive Club", "Corporate", "Dubai", "hello@gec.ae"),
            ("Community Readiness Hub", "Community", "Sharjah", "hub@crh.ae"),
        ]
        operators: list[Operator] = []
        for name, industry, emirate, email in operators_spec:
            op = Operator(name=name,
                licence_status="active",
                industry=industry,
                contact_email=email,
                emirate=emirate,
                created_at=weeks_ago(9),)
            session.add(op)
            await session.flush()
            # Keep legacy clients table in sync for projects.client_id FK
            await session.execute(text("""
                    INSERT INTO clients (id, name, industry, contact_email, contact_phone, emirate)
                    VALUES (:id, :name, :industry, :email, NULL, :emirate)
                    ON CONFLICT (id) DO UPDATE SET
                      name = EXCLUDED.name,
                      industry = EXCLUDED.industry,
                      contact_email = EXCLUDED.contact_email,
                      emirate = EXCLUDED.emirate
                    """),
                {"id": op.id, "name": name, "industry": industry, "email": email, "emirate": emirate},)
            await session.execute(text("SELECT setval(pg_get_serial_sequence('clients', 'id'), COALESCE((SELECT MAX(id) FROM clients), 1), true)"))
            operators.append(op)

        projects_spec = [
            (0, "Executive Wellness Programme", "Corporate Wellness", "active", weeks_ago(6)),
            (1, "Athlete Recovery Sprint", "Sport Performance", "active", weeks_ago(5)),
            (2, "C-Suite Recovery Retainer", "Executive Recovery", "active", weeks_ago(4)),
            (3, "Community Readiness Labs", "Community Readiness", "active", weeks_ago(3)),
            (0, "Workplace Wellbeing Pilot", "Corporate Wellness", "completed", weeks_ago(8)),
        ]
        projects: list[Project] = []
        for op_idx, title, ptype, status, created in projects_spec:
            proj = Project(operator_id=operators[op_idx].id,
                client_name=operators[op_idx].name,
                title=title,
                description=f"Demo project: {title}",
                project_type=ptype,
                status=status,
                start_date=created,
                end_date=created + timedelta(days=84),
                created_at=created,)
            session.add(proj)
            await session.flush()
            # Legacy client_id column still present in some DBs
            await session.execute(text("UPDATE projects SET client_id = :cid WHERE id = :pid"),
                {"cid": operators[op_idx].id, "pid": proj.id},)
            projects.append(proj)

        sarah = coach_attrs["coach@olynixx.com"]
        ahmed = coach_attrs["ahmed@olynixx.com"]
        layla = coach_attrs["layla@olynixx.com"]
        marcus = coach_attrs["marcus@olynixx.com"]

        assignments = [
            (projects[0], sarah, AssignmentStatus.ACCEPTED, days_ago(2), days_ago(1), "Active PureHealth"),
            (projects[1], ahmed, AssignmentStatus.ACCEPTED, days_ago(14), days_ago(13), "Accepted sport track"),
            (projects[2], layla, AssignmentStatus.ACCEPTED, days_ago(10), days_ago(9), "Executive retainer live"),
            (projects[3], marcus, AssignmentStatus.DECLINED, days_ago(8), days_ago(7), "Schedule conflict"),
            (projects[4], sarah, AssignmentStatus.COMPLETED, weeks_ago(8), weeks_ago(8) + timedelta(days=2), "Pilot closed"),
            (projects[1], layla, AssignmentStatus.COMPLETED, weeks_ago(6), weeks_ago(6) + timedelta(days=2), "Support block done"),
            (projects[0], ahmed, AssignmentStatus.ACCEPTED, days_ago(20), days_ago(19), "Secondary coach"),
            (projects[2], sarah, AssignmentStatus.PENDING, days_ago(1), None, "Overflow pending"),
            (projects[3], ahmed, AssignmentStatus.COMPLETED, weeks_ago(5), weeks_ago(5) + timedelta(days=1), "Community block"),
            (projects[4], layla, AssignmentStatus.COMPLETED, weeks_ago(4), weeks_ago(4) + timedelta(days=3), "Wellbeing close"),
            (projects[1], sarah, AssignmentStatus.COMPLETED, weeks_ago(3), weeks_ago(3) + timedelta(days=2), "Sport sprint wrap"),
            (projects[0], marcus, AssignmentStatus.COMPLETED, weeks_ago(2), weeks_ago(2) + timedelta(days=1), "Corporate close"),
            (projects[2], ahmed, AssignmentStatus.COMPLETED, weeks_ago(1), weeks_ago(1) + timedelta(days=2), "Retainer milestone"),
            (projects[3], sarah, AssignmentStatus.COMPLETED, days_ago(4), days_ago(3), "Recent community close"),
        ]
        for project, coach, status, assigned, responded, notes in assignments:
            session.add(ProjectAssignment(project_id=project.id,
                    coach_id=coach.id,
                    status=status,
                    assigned_at=assigned,
                    responded_at=responded,
                    notes=notes,))

        # ── Leads ──────────────────────────────────────────────
        leads = [
            ("Rania Al Mazrouei", "rania@adnoc.ae", "ADNOC", "new", weeks_ago(1)),
            ("Tom Bradley", "tom@mubadala.ae", "Mubadala", "contacted", weeks_ago(2)),
            ("Sara Chen", "sara@etihad.ae", "Etihad", "converted", weeks_ago(3)),
            ("Hassan Qureshi", "hassan@du.ae", "du Telecom", "new", days_ago(4)),
            ("Elena Rossi", "elena@emaar.ae", "Emaar", "contacted", days_ago(9)),
            ("Yusuf Ali", "yusuf@fab.ae", "FAB", "new", days_ago(2)),
            ("Priya Nair", "priya@dpworld.ae", "DP World", "converted", weeks_ago(4)),
            ("Chris Nolan", "chris@adports.ae", "AD Ports", "new", days_ago(1)),
        ]
        for name, email, org, status, created in leads:
            session.add(Lead(name=name,
                    email=email,
                    organisation=org,
                    phone="+971500000000",
                    message="Interested in corporate readiness programme.",
                    status=status,
                    created_at=created,))

        await session.commit()
        print(f"Database seeded successfully (SEED_MODE={active_mode}) with rich Phase 1 demo data.")
        print("Logins: admin@olynixx.com / admin123 | coach@olynixx.com / coach123 | learner@olynixx.com / learner123")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Wipe and reseed demo data")
    parser.add_argument("--mode",
        choices=["demo", "minimal"],
        default=None,
        help="Override SEED_MODE env (demo|minimal)",)
    args = parser.parse_args()
    try:
        asyncio.run(seed_data(force=args.force, mode=args.mode))
    except Exception as e:
        print(f"Seed failed: {e}", file=sys.stderr)
        raise
