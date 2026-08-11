import logging
from datetime import datetime, timezone

from app.services.certificate_pdf import ensure_certificate_pdf

logger = logging.getLogger(__name__)


def generate_certificate_pdf(
    *,
    holder_name: str,
    certification_level: str,
    verification_code: str,
    issued_at: datetime | None = None,
    valid_until: datetime | None = None,
    cohort_line: str | None = None,
    force: bool = False,
) -> str:
    """Generate a Praxis certificate PDF and return its filesystem path."""
    logger.info("Generating certificate PDF for %s (%s)", holder_name, verification_code)
    path = ensure_certificate_pdf(
        holder_name=holder_name,
        certification_level=certification_level,
        verification_code=verification_code,
        issued_at=issued_at or datetime.now(timezone.utc),
        valid_until=valid_until,
        cohort_line=cohort_line,
        force=force,
    )
    return str(path)
