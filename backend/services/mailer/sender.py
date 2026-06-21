import logging
import smtplib
import ssl
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid

import config

logger = logging.getLogger(__name__)

_conn: smtplib.SMTP | None = None
_lock = threading.Lock()


def _build() -> smtplib.SMTP:
    if config.SMTP_USE_SSL:
        ctx = ssl.create_default_context()
        server = smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT, context=ctx)
    else:
        server = smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT)
        server.ehlo()
        if config.SMTP_USE_TLS:
            server.starttls(context=ssl.create_default_context())
    server.login(config.SMTP_USER, config.SMTP_PASSWORD)
    return server


def _get() -> smtplib.SMTP:
    global _conn
    if _conn is not None:
        try:
            _conn.noop()
        except Exception:
            _conn = None
    if _conn is None:
        _conn = _build()
    return _conn


def send_email(to: str, subject: str, html_body: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = config.SMTP_FROM
    msg["To"] = to
    # RFC 5322 requires Message-ID and Date; Gmail rejects (550-5.7.1) messages
    # that lack a valid Message-ID. Derive the Message-ID domain from the FROM
    # address so it matches the sending domain (better deliverability).
    from_domain = config.SMTP_FROM.split("@")[-1] if "@" in config.SMTP_FROM else "1111.tn"
    msg["Message-ID"] = make_msgid(domain=from_domain)
    msg["Date"] = formatdate(localtime=True)
    msg.attach(MIMEText(html_body, "html"))

    with _lock:
        server = _get()
        server.sendmail(config.SMTP_FROM, to, msg.as_string())

    logger.info("Email sent", extra={"to": to, "subject": subject})
