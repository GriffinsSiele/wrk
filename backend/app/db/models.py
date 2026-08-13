import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (Column, Integer, String, Boolean, DateTime,
    ForeignKey, Enum, Text, JSON)
from sqlalchemy.orm import relationship
from .base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    LEARNER = "learner"
    COACH = "coach"


class AssignmentStatus(str, enum.Enum):
    PENDING = "pending"
    OFFERED = "offered"  # legacy alias retained for existing rows
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    DECLINED = "declined"


class ExamStatus(str, enum.Enum):
    BOOKED = "booked"
    PASSED = "passed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class CertificateStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"


class PracticalResult(str, enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"


class AgreementType(str, enum.Enum):
    NDA = "NDA"
    CODE_OF_CONDUCT = "CODE_OF_CONDUCT"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)  # hashed_password equivalent
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.LEARNER, nullable=False)
    is_active = Column(Boolean, default=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    anonymised_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    profile = relationship("Profile", back_populates="user", uselist=False)
    learner_profile = relationship("LearnerProfile", back_populates="user", uselist=False)
    coach_attributes = relationship("CoachAttribute", back_populates="user", uselist=False)
    enrollments = relationship("CourseEnrollment", back_populates="user")
    exam_registrations = relationship("ExamRegistration", back_populates="user")
    exam_attempts = relationship("ExamAttempt", back_populates="user", foreign_keys="ExamAttempt.user_id")
    certificates = relationship("Certificate", back_populates="user")
    practical_assessments = relationship("PracticalAssessment",
        back_populates="user",
        foreign_keys="PracticalAssessment.user_id",)
    coach_agreements = relationship("CoachAgreement", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    phone = Column(String, nullable=True)

    user = relationship("User", back_populates="profile")


class LearnerProfile(Base):
    """1:1 learner tracking as specified in Phase 1 schema."""
    __tablename__ = "learner_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    enrollment_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    progress_percentage = Column(Integer, default=0)

    user = relationship("User", back_populates="learner_profile")


class CoachAttribute(Base):
    """Coach profile / talent-pool attributes (coach_profiles in schema doc)."""
    __tablename__ = "coach_attributes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    specialty = Column(String, nullable=True)
    focus_area = Column(String, nullable=True)
    emirate = Column(String, nullable=True)  # location_emirate
    languages = Column(JSON, default=list)
    availability_status = Column(Boolean, default=True)
    travel_willingness = Column(Boolean, default=True)
    certification_level = Column(String, nullable=True)
    placement_eligible = Column(Boolean, default=False)
    cec_credits = Column(Integer, default=0)
    cec_status = Column(String, nullable=True)
    cec_renewal_date = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="coach_attributes")
    assignments = relationship("ProjectAssignment", back_populates="coach")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    thumbnail = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.order")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    order = Column(Integer, default=0)

    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order")
    quizzes = relationship("Quiz", back_populates="module", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    bunny_video_id = Column(String, nullable=True)  # video_url / Bunny.net id
    content = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    duration_seconds = Column(Integer, nullable=True)

    module = relationship("Module", back_populates="lessons")
    materials = relationship("Material", back_populates="lesson", cascade="all, delete-orphan")
    progress_records = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    file_url = Column(String, nullable=False)

    lesson = relationship("Lesson", back_populates="materials")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    lesson = relationship("Lesson", back_populates="progress_records")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    questions = Column(JSON, nullable=False)

    module = relationship("Module", back_populates="quizzes")


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    progress = Column(Integer, default=0)
    status = Column(String, default="active")
    enrolled_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class ExamConfig(Base):
    __tablename__ = "exam_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="Default")
    certification_level = Column(String, nullable=True, default="Level 1")
    pass_mark = Column(Integer, default=70)
    time_limit_minutes = Column(Integer, default=60)
    max_attempts = Column(Integer, default=3)
    randomise_questions = Column(Boolean, default=True)
    question_count = Column(Integer, default=40)
    proctoring_level = Column(String, default="basic")
    # Integrity + timers: seconds_per_question, one_way, shuffle_options,
    # max_disconnect_pause_seconds, submit_grace_minutes, anomaly_review_threshold
    config_json = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class QuestionBank(Base):
    __tablename__ = "question_bank"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_option = Column(String, nullable=False)
    pillar_tag = Column(String, nullable=True)
    difficulty = Column(String, default="medium")
    is_active = Column(Boolean, default=True)


class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, default="Certification Exam")
    date = Column(DateTime(timezone=True), nullable=False)
    is_online = Column(Boolean, default=True)
    location = Column(String, nullable=True)
    capacity = Column(Integer, default=30)
    exam_config_id = Column(Integer, ForeignKey("exam_configs.id"), nullable=True)

    config = relationship("ExamConfig")
    registrations = relationship("ExamRegistration", back_populates="session", cascade="all, delete-orphan")
    attempts = relationship("ExamAttempt", back_populates="session")


class ExamRegistration(Base):
    __tablename__ = "exam_registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(Integer, ForeignKey("exam_sessions.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(ExamStatus), default=ExamStatus.BOOKED)
    registered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="exam_registrations")
    session = relationship("ExamSession", back_populates="registrations")


class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(Integer, ForeignKey("exam_sessions.id"), nullable=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    answers = Column(JSON, nullable=True)
    question_snapshot = Column(JSON, nullable=True)
    score = Column(Integer, nullable=True)
    passed = Column(Boolean, nullable=True)
    ip_address = Column(String, nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    # Phase 1 progressive delivery (one-at-a-time, 90s locks, resume)
    current_index = Column(Integer, default=0, nullable=False)
    question_started_at = Column(DateTime(timezone=True), nullable=True)
    seconds_per_question = Column(Integer, default=90, nullable=False)
    paused_at = Column(DateTime(timezone=True), nullable=True)
    total_pause_seconds = Column(Integer, default=0, nullable=False)
    anomaly_flags = Column(JSON, nullable=True)
    needs_admin_review = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="exam_attempts", foreign_keys=[user_id])
    session = relationship("ExamSession", back_populates="attempts")
    certificate = relationship("Certificate", back_populates="attempt", uselist=False)


class PracticalAssessment(Base):
    __tablename__ = "practical_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assessor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    certification_level = Column(String, default="Level 1")
    checklist_result = Column(JSON, nullable=True)
    # VARCHAR enum (not PG native) for simpler migrations across environments.
    result = Column(Enum(PracticalResult, native_enum=False), nullable=False)
    notes = Column(Text, nullable=True)
    assessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="practical_assessments", foreign_keys=[user_id])
    assessor = relationship("User", foreign_keys=[assessor_id])


class PracticalChecklistTemplate(Base):
    """Admin-defined practical checklist + pass criteria (not hardcoded in UI)."""
    __tablename__ = "practical_checklist_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="Level 1 Practical")
    certification_level = Column(String, nullable=False, default="Level 1")
    is_active = Column(Boolean, default=True, nullable=False)
    # [{ "key": "intake_protocol", "label": "Intake protocol", "required": true }, ...]
    items = Column(JSON, nullable=False, default=list)
    # Minimum required items that must be checked for PASS (null = all required items)
    min_required_pass = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String, nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    attempt_id = Column(Integer, ForeignKey("exam_attempts.id"), nullable=True)
    practical_assessment_id = Column(Integer, ForeignKey("practical_assessments.id"), nullable=True)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    verification_code = Column(String,
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4()).replace("-", "")[:16].upper(),)
    pdf_url = Column(String, nullable=True)
    certification_level = Column(String, default="Level 1: Human Readiness Coach")
    status = Column(Enum(CertificateStatus, native_enum=False), default=CertificateStatus.ACTIVE, nullable=False)

    user = relationship("User", back_populates="certificates")
    attempt = relationship("ExamAttempt", back_populates="certificate")
    practical_assessment = relationship("PracticalAssessment")


class Operator(Base):
    """Commercial entities / licence holders (replaces clients naming in schema)."""
    __tablename__ = "operators"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    licence_status = Column(String, default="active")
    industry = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    emirate = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    projects = relationship("Project", back_populates="operator")


# Backward-compatible alias used by existing imports/seed until fully migrated
Client = Operator


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    operator_id = Column(Integer, ForeignKey("operators.id"), nullable=True)
    client_name = Column(String, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    operator = relationship("Operator", back_populates="projects")
    assignments = relationship("ProjectAssignment", back_populates="project", cascade="all, delete-orphan")

    @property
    def client_id(self):
        return self.operator_id

    @client_id.setter
    def client_id(self, value):
        self.operator_id = value


class ProjectAssignment(Base):
    __tablename__ = "project_assignments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    coach_id = Column(Integer, ForeignKey("coach_attributes.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.PENDING)
    assigned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    responded_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    project = relationship("Project", back_populates="assignments")
    coach = relationship("CoachAttribute", back_populates="assignments")


class CoachAgreement(Base):
    __tablename__ = "coach_agreements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    agreement_type = Column(Enum(AgreementType, native_enum=False), nullable=False)
    version = Column(String, nullable=False, default="1.0")
    signed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="coach_agreements")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    organisation = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String, default="new")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
