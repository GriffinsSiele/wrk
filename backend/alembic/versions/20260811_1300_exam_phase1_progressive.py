"""Add Phase 1 progressive exam attempt columns

Revision ID: 20260811_1300
Revises: 20260709_1705
Create Date: 2026-08-11 13:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260811_1300"
down_revision: Union[str, Sequence[str], None] = "20260810_1418"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "exam_attempts" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("exam_attempts")}
    additions = [
        ("current_index", sa.Column("current_index", sa.Integer(), server_default="0", nullable=False)),
        ("question_started_at", sa.Column("question_started_at", sa.DateTime(timezone=True), nullable=True)),
        ("seconds_per_question", sa.Column("seconds_per_question", sa.Integer(), server_default="90", nullable=False)),
        ("paused_at", sa.Column("paused_at", sa.DateTime(timezone=True), nullable=True)),
        ("total_pause_seconds", sa.Column("total_pause_seconds", sa.Integer(), server_default="0", nullable=False)),
        ("anomaly_flags", sa.Column("anomaly_flags", sa.JSON(), nullable=True)),
        ("needs_admin_review", sa.Column("needs_admin_review", sa.Boolean(), server_default=sa.false(), nullable=False)),
    ]
    for name, col in additions:
        if name not in cols:
            op.add_column("exam_attempts", col)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "exam_attempts" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("exam_attempts")}
    for name in (
        "needs_admin_review",
        "anomaly_flags",
        "total_pause_seconds",
        "paused_at",
        "seconds_per_question",
        "question_started_at",
        "current_index",
    ):
        if name in cols:
            op.drop_column("exam_attempts", name)
