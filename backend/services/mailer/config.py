import os
from dotenv import load_dotenv

load_dotenv()

RABBITMQ_URL: str = os.environ.get("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")

DB_HOST: str = os.environ.get("DB_HOST", "localhost")
DB_PORT: int = int(os.environ.get("DB_PORT", "5432"))
DB_NAME: str = os.environ.get("DB_NAME", "appdb")
DB_USER: str = os.environ.get("DB_USER", "")
DB_PASSWORD: str = os.environ.get("DB_PASSWORD", "")

SMTP_HOST: str = os.environ.get("SMTP_HOST", "")
SMTP_PORT: int = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER: str = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD: str = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM: str = os.environ.get("SMTP_FROM", "noreply@example.com")
SMTP_USE_TLS: bool = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"
SMTP_USE_SSL: bool = os.environ.get("SMTP_USE_SSL", "false").lower() == "true"

EXCHANGE = "mailer.exchange"
QUEUES = {
    "mail.welcome": "welcome",
    "mail.verification": "email_verification",
    "mail.password_reset": "password_reset",
    "mail.notification": "notification",
}
DEAD_LETTER_QUEUE = "mail.dead_letter"

MAX_RETRIES = 3
RETRY_DELAYS = [5, 25, 125]  # seconds — exponential backoff
