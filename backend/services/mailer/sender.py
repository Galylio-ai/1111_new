import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid

import config

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html_body: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = config.SMTP_FROM
    msg["To"] = to
    from_domain = config.SMTP_FROM.split("@")[-1] if "@" in config.SMTP_FROM else "1111.tn"
    msg["Message-ID"] = make_msgid(domain=from_domain)
    msg["Date"] = formatdate(localtime=True)
    msg.attach(MIMEText(html_body, "html"))

    # Open a fresh connection per email — cPanel closes idle SSL sockets
    # after ~5 minutes so a cached connection causes SMTPServerDisconnected.
    if config.SMTP_USE_SSL:
        server = smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT,
                                   context=ssl.create_default_context())
    else:
        server = smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT)
        server.ehlo()
        if config.SMTP_USE_TLS:
            server.starttls(context=ssl.create_default_context())

    try:
        server.login(config.SMTP_USER, config.SMTP_PASSWORD)
        server.sendmail(config.SMTP_FROM, to, msg.as_string())
        logger.info("Email sent", extra={"to": to, "subject": subject})
    finally:
        try:
            server.quit()
        except Exception:
            pass
