"""Phase 1 schema alignment: practicals, agreements, operators, soft-delete, cert status

Revision ID: 20260709_0551
Revises: 20260706_1505
Create Date: 2026-07-09 05:51:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260709_0551"
down_revision: Union[str, Sequence[str], None] = "20260706_1505"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    if not _has_table(inspector, table_name):
        return False
    return any(col["name"] == column_name for col in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # --- users soft-delete + full_name ---
    if not _has_column(inspector, "users", "full_name"):
        op.add_column("users", sa.Column("full_name", sa.String(), nullable=True))
    if not _has_column(inspector, "users", "deleted_at"):
        op.add_column("users", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    if not _has_column(inspector, "users", "anonymised_at"):
        op.add_column("users", sa.Column("anonymised_at", sa.DateTime(timezone=True), nullable=True))

    # Backfill full_name from profiles where possible
    if _has_table(inspector, "profiles"):
        op.execute(
            """
            UPDATE users u
            SET full_name = TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')))
            FROM profiles p
            WHERE p.user_id = u.id AND (u.full_name IS NULL OR u.full_name = '')
            """
        )

    # --- learner_profiles ---
    if not _has_table(inspector, "learner_profiles"):
        op.create_table(
            "learner_profiles",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), unique=True),
            sa.Column("enrollment_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("progress_percentage", sa.Integer(), server_default="0"),
        )
        op.execute(
            """
            INSERT INTO learner_profiles (user_id, enrollment_date, progress_percentage)
            SELECT u.id, u.created_at, COALESCE((
                SELECT MAX(ce.progress) FROM course_enrollments ce WHERE ce.user_id = u.id
            ), 0)
            FROM users u
            WHERE u.role::text = 'LEARNER'
            ON CONFLICT DO NOTHING
            """
        )

    # --- coach_attributes placement + cec_credits ---
    if _has_column(inspector, "coach_attributes", "id"):
        if not _has_column(inspector, "coach_attributes", "placement_eligible"):
            op.add_column(
                "coach_attributes",
                sa.Column("placement_eligible", sa.Boolean(), nullable=False, server_default=sa.false()),
            )
            op.alter_column("coach_attributes", "placement_eligible", server_default=None)
        if not _has_column(inspector, "coach_attributes", "cec_credits"):
            op.add_column(
                "coach_attributes",
                sa.Column("cec_credits", sa.Integer(), nullable=False, server_default="0"),
            )
            op.alter_column("coach_attributes", "cec_credits", server_default=None)

    # --- exam_configs ---
    if _has_table(inspector, "exam_configs"):
        if not _has_column(inspector, "exam_configs", "certification_level"):
            op.add_column(
                "exam_configs",
                sa.Column("certification_level", sa.String(), nullable=True, server_default="Level 1"),
            )
        if not _has_column(inspector, "exam_configs", "config_json"):
            op.add_column("exam_configs", sa.Column("config_json", sa.JSON(), nullable=True))

    # --- practical_assessments ---
    if not _has_table(inspector, "practical_assessments"):
        op.create_table(
            "practical_assessments",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
            sa.Column("assessor_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
            sa.Column("certification_level", sa.String(), nullable=True, server_default="Level 1"),
            sa.Column("checklist_result", sa.JSON(), nullable=True),
            sa.Column("result", sa.String(), nullable=False),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("assessed_at", sa.DateTime(timezone=True), nullable=True),
        )

    # --- certificates status + practical link ---
    if _has_table(inspector, "certificates"):
        if not _has_column(inspector, "certificates", "status"):
            op.add_column(
                "certificates",
                sa.Column("status", sa.String(), nullable=False, server_default="ACTIVE"),
            )
            op.alter_column("certificates", "status", server_default=None)
        if not _has_column(inspector, "certificates", "practical_assessment_id"):
            op.add_column(
                "certificates",
                sa.Column(
                    "practical_assessment_id",
                    sa.Integer(),
                    sa.ForeignKey("practical_assessments.id"),
                    nullable=True,
                ),
            )

    # --- operators (migrate from clients if present) ---
    if not _has_table(inspector, "operators"):
        op.create_table(
            "operators",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("licence_status", sa.String(), server_default="active"),
            sa.Column("industry", sa.String(), nullable=True),
            sa.Column("contact_email", sa.String(), nullable=True),
            sa.Column("contact_phone", sa.String(), nullable=True),
            sa.Column("emirate", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        )
        if _has_table(inspector, "clients"):
            op.execute(
                """
                INSERT INTO operators (id, name, licence_status, industry, contact_email, contact_phone, emirate, created_at)
                SELECT id, name, 'active', industry, contact_email, contact_phone, emirate, NOW()
                FROM clients
                """
            )
            # Keep sequence in sync
            op.execute(
                """
                SELECT setval(pg_get_serial_sequence('operators', 'id'), COALESCE((SELECT MAX(id) FROM operators), 1), true)
                """
            )

    # --- projects: operator_id + client_name ---
    if _has_table(inspector, "projects"):
        if not _has_column(inspector, "projects", "operator_id"):
            op.add_column(
                "projects",
                sa.Column("operator_id", sa.Integer(), sa.ForeignKey("operators.id"), nullable=True),
            )
            if _has_column(inspector, "projects", "client_id"):
                op.execute("UPDATE projects SET operator_id = client_id WHERE operator_id IS NULL")
        if not _has_column(inspector, "projects", "client_name"):
            op.add_column("projects", sa.Column("client_name", sa.String(), nullable=True))
            if _has_table(inspector, "operators"):
                op.execute(
                    """
                    UPDATE projects p
                    SET client_name = o.name
                    FROM operators o
                    WHERE p.operator_id = o.id AND (p.client_name IS NULL OR p.client_name = '')
                    """
                )

    # --- coach_agreements ---
    if not _has_table(inspector, "coach_agreements"):
        op.create_table(
            "coach_agreements",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
            sa.Column("agreement_type", sa.String(), nullable=False),
            sa.Column("version", sa.String(), nullable=False, server_default="1.0"),
            sa.Column("signed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        )

    # --- assignment status: map offered -> pending where helpful (keep enum values) ---
    # Ensure pending exists in assignmentstatus enum if using native PG enums
    try:
        op.execute("ALTER TYPE assignmentstatus ADD VALUE IF NOT EXISTS 'pending'")
        op.execute("ALTER TYPE assignmentstatus ADD VALUE IF NOT EXISTS 'PENDING'")
    except Exception:
        pass


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "coach_agreements"):
        op.drop_table("coach_agreements")
    if _has_column(inspector, "projects", "client_name"):
        op.drop_column("projects", "client_name")
    if _has_column(inspector, "projects", "operator_id"):
        op.drop_column("projects", "operator_id")
    if _has_table(inspector, "operators") and not _has_table(inspector, "clients"):
        op.drop_table("operators")
    if _has_column(inspector, "certificates", "practical_assessment_id"):
        op.drop_column("certificates", "practical_assessment_id")
    if _has_column(inspector, "certificates", "status"):
        op.drop_column("certificates", "status")
    if _has_table(inspector, "practical_assessments"):
        op.drop_table("practical_assessments")
    if _has_column(inspector, "exam_configs", "config_json"):
        op.drop_column("exam_configs", "config_json")
    if _has_column(inspector, "exam_configs", "certification_level"):
        op.drop_column("exam_configs", "certification_level")
    if _has_column(inspector, "coach_attributes", "cec_credits"):
        op.drop_column("coach_attributes", "cec_credits")
    if _has_column(inspector, "coach_attributes", "placement_eligible"):
        op.drop_column("coach_attributes", "placement_eligible")
    if _has_table(inspector, "learner_profiles"):
        op.drop_table("learner_profiles")
    if _has_column(inspector, "users", "anonymised_at"):
        op.drop_column("users", "anonymised_at")
    if _has_column(inspector, "users", "deleted_at"):
        op.drop_column("users", "deleted_at")
    if _has_column(inspector, "users", "full_name"):
        op.drop_column("users", "full_name")
