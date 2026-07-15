import logging

logger = logging.getLogger(__name__)


def generate_certificate_pdf(attempt_id: int, user_id: int) -> str:
    """Generate a PDF certificate for a passed exam attempt."""
    logger.info(f"Generating certificate PDF for attempt {attempt_id}, user {user_id}")
    # TODO: Implement PDF generation with reportlab or weasyprint
    return f"certificates/cert_{attempt_id}.pdf"
