"""Practical template versioning + assessment snapshot columns

Revision ID: 20260816_0900
Revises: 20260813_1200
Create Date: 2026-08-16 09:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260816_0900"
down_revision: Union[str, Sequence[str], None] = "20260813_1200"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "practical_checklist_templates",
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "practical_assessments",
        sa.Column("template_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "practical_assessments",
        sa.Column("template_version", sa.Integer(), nullable=True),
    )
    op.add_column(
        "practical_assessments",
        sa.Column("template_snapshot", sa.JSON(), nullable=True),
    )
    op.create_foreign_key(
        "fk_practical_assessments_template_id",
        "practical_assessments",
        "practical_checklist_templates",
        ["template_id"],
        ["id"],
    )
    op.alter_column("practical_checklist_templates", "version", server_default=None)


def downgrade() -> None:
    op.drop_constraint("fk_practical_assessments_template_id", "practical_assessments", type_="foreignkey")
    op.drop_column("practical_assessments", "template_snapshot")
    op.drop_column("practical_assessments", "template_version")
    op.drop_column("practical_assessments", "template_id")
    op.drop_column("practical_checklist_templates", "version")
