"""Admin-configurable practical checklist templates + password reset tokens

Revision ID: 20260813_1200
Revises: 20260811_1300
Create Date: 2026-08-13 12:00:00.000000
"""

import json
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260813_1200"
down_revision: Union[str, Sequence[str], None] = "20260811_1300"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_DEFAULT_ITEMS = [
    {"key": "intake_protocol", "label": "Intake protocol", "required": True},
    {"key": "readiness_scoring", "label": "Readiness scoring", "required": True},
    {"key": "recovery_plan", "label": "Recovery plan", "required": True},
    {"key": "load_management", "label": "Load management", "required": True},
    {"key": "client_communication", "label": "Client communication", "required": True},
    {"key": "scope_boundaries", "label": "Scope boundaries", "required": True},
    {"key": "documentation", "label": "Documentation", "required": True},
    {"key": "safety_escalation", "label": "Safety escalation", "required": True},
    {"key": "session_structure", "label": "Session structure", "required": False},
    {"key": "measurement_review", "label": "Measurement review", "required": False},
    {"key": "feedback_loop", "label": "Feedback loop", "required": False},
    {"key": "ethics", "label": "Ethics", "required": True},
    {"key": "professionalism", "label": "Professionalism", "required": True},
    {"key": "closing_protocol", "label": "Closing protocol", "required": False},
]


def upgrade() -> None:
    op.create_table(
        "practical_checklist_templates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("certification_level", sa.String(), nullable=False, server_default="Level 1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("items", sa.JSON(), nullable=False),
        sa.Column("min_required_pass", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_password_reset_tokens_token_hash", "password_reset_tokens", ["token_hash"], unique=True)

    # Bind JSON as a parameter so SQLAlchemy does not treat ":true" as a bind name.
    op.execute(
        sa.text(
            """
            INSERT INTO practical_checklist_templates
              (name, certification_level, is_active, items, min_required_pass)
            VALUES
              (:name, :certification_level, true, CAST(:items AS json), NULL)
            """
        ).bindparams(
            sa.bindparam("name", "Level 1 Practical"),
            sa.bindparam("certification_level", "Level 1"),
            sa.bindparam("items", json.dumps(_DEFAULT_ITEMS)),
        )
    )


def downgrade() -> None:
    op.drop_index("ix_password_reset_tokens_token_hash", table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")
    op.drop_table("practical_checklist_templates")
