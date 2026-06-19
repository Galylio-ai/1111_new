import logging
from typing import Any

import psycopg
from psycopg.rows import dict_row

import config

logger = logging.getLogger(__name__)


def _connect() -> psycopg.Connection[dict[str, Any]]:
    return psycopg.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        dbname=config.DB_NAME,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        row_factory=dict_row,
    )


def get_active_template(template_key: str) -> dict[str, Any] | None:
    try:
        with _connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT template_key, subject, html_body
                    FROM mail_templates
                    WHERE template_key = %s AND status = 'active'
                    """,
                    (template_key,),
                )
                row = cur.fetchone()
                return dict(row) if row else None
    except Exception as exc:
        logger.warning(
            "Mail template DB lookup failed; falling back to file template",
            extra={"template_key": template_key},
            exc_info=exc,
        )
        return None


def create_mail_log(
    *,
    template_key: str | None,
    to_email: str,
    subject: str,
    status: str,
    error_message: str | None = None,
) -> str | None:
    try:
        with _connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO mail_logs (template_key, to_email, subject, status, error_message, sent_at)
                    VALUES (%s, %s, %s, %s, %s, CASE WHEN %s = 'sent' THEN now() ELSE NULL END)
                    RETURNING id
                    """,
                    (template_key, to_email, subject, status, error_message, status),
                )
                row = cur.fetchone()
                return str(row["id"]) if row else None
    except Exception as exc:
        logger.warning("Could not create mail log", exc_info=exc)
        return None


def update_mail_log(
    log_id: str | None,
    *,
    status: str,
    error_message: str | None = None,
) -> None:
    if not log_id:
        return

    try:
        with _connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE mail_logs
                    SET status = %s,
                        error_message = %s,
                        sent_at = CASE WHEN %s = 'sent' THEN now() ELSE sent_at END
                    WHERE id = %s
                    """,
                    (status, error_message, status, log_id),
                )
    except Exception as exc:
        logger.warning(
            "Could not update mail log",
            extra={"mail_log_id": log_id, "status": status},
            exc_info=exc,
        )
