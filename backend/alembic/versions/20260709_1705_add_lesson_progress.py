"""Align missing columns: lesson_progress, cec_renewal_date, certificate/exam fields

Revision ID: 20260709_1705
Revises: 20260709_0551
Create Date: 2026-07-09 17:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260709_1705"
down_revision: Union[str, Sequence[str], None] = "20260709_0551"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "lesson_progress" not in inspector.get_table_names():
        op.create_table(
            "lesson_progress",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
            sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False),
            sa.Column("completed", sa.Boolean(), server_default=sa.false(), nullable=False),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index("ix_lesson_progress_id", "lesson_progress", ["id"])
        op.create_index("ix_lesson_progress_user_id", "lesson_progress", ["user_id"])
        op.create_index("ix_lesson_progress_lesson_id", "lesson_progress", ["lesson_id"])

    if "coach_attributes" in inspector.get_table_names():
        coach_cols = {c["name"] for c in inspector.get_columns("coach_attributes")}
        if "cec_renewal_date" not in coach_cols:
            op.add_column(
                "coach_attributes",
                sa.Column("cec_renewal_date", sa.DateTime(timezone=True), nullable=True),
            )

    if "certificates" in inspector.get_table_names():
        cert_cols = {c["name"] for c in inspector.get_columns("certificates")}
        if "attempt_id" not in cert_cols:
            op.add_column(
                "certificates",
                sa.Column("attempt_id", sa.Integer(), sa.ForeignKey("exam_attempts.id"), nullable=True),
            )
        if "certification_level" not in cert_cols:
            op.add_column(
                "certificates",
                sa.Column("certification_level", sa.String(), nullable=True, server_default="Level 1 — Human Readiness Coach"),
            )

    if "exam_attempts" in inspector.get_table_names():
        attempt_cols = {c["name"] for c in inspector.get_columns("exam_attempts")}
        if "question_snapshot" not in attempt_cols:
            op.add_column("exam_attempts", sa.Column("question_snapshot", sa.JSON(), nullable=True))
        if "approved_by_id" not in attempt_cols:
            op.add_column(
                "exam_attempts",
                sa.Column("approved_by_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            )
        if "approved_at" not in attempt_cols:
            op.add_column("exam_attempts", sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True))
        # Make legacy NOT NULL columns optional to match current models
        try:
            op.alter_column("exam_attempts", "session_id", nullable=True)
        except Exception:
            pass
        if "config_id" in attempt_cols:
            try:
                op.alter_column("exam_attempts", "config_id", nullable=True)
            except Exception:
                pass


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "exam_attempts" in inspector.get_table_names():
        cols = {c["name"] for c in inspector.get_columns("exam_attempts")}
        if "approved_at" in cols:
            op.drop_column("exam_attempts", "approved_at")
        if "approved_by_id" in cols:
            op.drop_column("exam_attempts", "approved_by_id")
        if "question_snapshot" in cols:
            op.drop_column("exam_attempts", "question_snapshot")

    if "certificates" in inspector.get_table_names():
        cols = {c["name"] for c in inspector.get_columns("certificates")}
        if "certification_level" in cols:
            op.drop_column("certificates", "certification_level")
        if "attempt_id" in cols:
            op.drop_column("certificates", "attempt_id")

    if "coach_attributes" in inspector.get_table_names():
        cols = {c["name"] for c in inspector.get_columns("coach_attributes")}
        if "cec_renewal_date" in cols:
            op.drop_column("coach_attributes", "cec_renewal_date")

    if "lesson_progress" in inspector.get_table_names():
        op.drop_index("ix_lesson_progress_lesson_id", table_name="lesson_progress")
        op.drop_index("ix_lesson_progress_user_id", table_name="lesson_progress")
        op.drop_index("ix_lesson_progress_id", table_name="lesson_progress")
        op.drop_table("lesson_progress")
