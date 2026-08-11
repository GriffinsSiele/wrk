"""Bridge stub: certificate holder_name (applied historically; file restored)

Revision ID: 20260810_1418
Revises: 20260709_1705
Create Date: 2026-08-10 14:18:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260810_1418"
down_revision: Union[str, Sequence[str], None] = "20260709_1705"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "certificates" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("certificates")}
    if "holder_name" not in cols:
        op.add_column("certificates", sa.Column("holder_name", sa.String(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "certificates" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("certificates")}
    if "holder_name" in cols:
        op.drop_column("certificates", "holder_name")
