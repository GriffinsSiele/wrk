"""
One-shot schema alignment: add any columns present on SQLAlchemy models
but missing in the live Postgres schema. Safe / idempotent.
"""
from __future__ import annotations

import asyncio

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.db.base import Base
import app.db.models  # noqa: F401, register models


async def align() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        def _sync_align(sync_conn):
            inspector = inspect(sync_conn)
            existing_tables = set(inspector.get_table_names())
            for table in Base.metadata.sorted_tables:
                if table.name not in existing_tables:
                    print(f"CREATE TABLE {table.name}")
                    table.create(sync_conn, checkfirst=True)
                    continue
                existing_cols = {c["name"] for c in inspector.get_columns(table.name)}
                for col in table.columns:
                    if col.name in existing_cols:
                        continue
                    col_type = col.type.compile(dialect=sync_conn.dialect)
                    nullable = "NULL" if col.nullable else "NOT NULL"
                    default = ""
                    if col.server_default is not None:
                        default = f" DEFAULT {col.server_default.arg}" if hasattr(col.server_default, "arg") else ""
                    # Prefer nullable adds for safety on existing rows
                    sql = f'ALTER TABLE "{table.name}" ADD COLUMN "{col.name}" {col_type} NULL'
                    print(sql)
                    sync_conn.execute(text(sql))

        await conn.run_sync(_sync_align)
    await engine.dispose()
    print("Schema alignment complete.")


if __name__ == "__main__":
    asyncio.run(align())
