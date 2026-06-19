import json
import logging
import time
from typing import Any

import pika
import pika.exceptions
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pydantic import BaseModel, EmailStr, Field, ValidationError

import config
from db import create_mail_log, get_active_template, update_mail_log
from sender import send_email

logger = logging.getLogger(__name__)

jinja_env = Environment(
    loader=FileSystemLoader("templates"),
    autoescape=select_autoescape(["html"]),
)

SUBJECTS = {
    "welcome": "Welcome!",
    "email_verification": "Verify your email",
    "password_reset": "Password reset OTP",
    "notification": "Notification",
}


class MailPayload(BaseModel):
    to: EmailStr
    name: str
    data: dict[str, Any] = Field(default_factory=dict)


def render_template(template_name: str, payload: MailPayload) -> str:
    tpl = jinja_env.get_template(f"{template_name}.html")
    return tpl.render(name=payload.name, **payload.data)


def render_message(template_name: str, payload: MailPayload) -> tuple[str, str, str]:
    template_key = str(payload.data.get("template_key") or template_name)
    variables = {"name": payload.name, **payload.data}

    inline_subject = payload.data.get("subject")
    inline_html = payload.data.get("html_body")
    if isinstance(inline_subject, str) and isinstance(inline_html, str):
        return template_key, inline_subject, inline_html

    db_template = get_active_template(template_key)
    if db_template:
        subject = jinja_env.from_string(str(db_template["subject"])).render(**variables)
        html = jinja_env.from_string(str(db_template["html_body"])).render(**variables)
        return template_key, subject, html

    subject = SUBJECTS.get(template_name, "Message")
    return template_key, subject, render_template(template_name, payload)


def _sleep_with_heartbeat(connection: pika.BlockingConnection, seconds: float) -> None:
    deadline = time.monotonic() + seconds
    while True:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            break
        connection.sleep(min(1.0, remaining))


def handle_message(
    channel: pika.adapters.blocking_connection.BlockingChannel,
    method: pika.spec.Basic.Deliver,
    _properties: pika.spec.BasicProperties,
    body: bytes,
    template_name: str,
) -> None:
    try:
        raw = json.loads(body)
        payload = MailPayload.model_validate(raw)
    except (ValidationError, json.JSONDecodeError) as exc:
        logger.error("Invalid message format - sending to DLQ", exc_info=exc)
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        return

    template_key = str(payload.data.get("template_key") or template_name)
    mail_log_id = payload.data.get("mail_log_id")
    log_id = str(mail_log_id) if mail_log_id else None

    try:
        template_key, subject, html = render_message(template_name, payload)
    except Exception as exc:
        logger.error(
            "Template rendering failed - sending to DLQ",
            extra={"template_key": template_key},
            exc_info=exc,
        )
        if log_id:
            update_mail_log(log_id, status="failed", error_message=str(exc))
        else:
            log_id = create_mail_log(
                template_key=template_key,
                to_email=str(payload.to),
                subject=SUBJECTS.get(template_name, "Message"),
                status="failed",
                error_message=str(exc),
            )
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        return

    if not log_id:
        log_id = create_mail_log(
            template_key=template_key,
            to_email=str(payload.to),
            subject=subject,
            status="queued",
        )

    attempt = 0
    while attempt <= config.MAX_RETRIES:
        try:
            send_email(str(payload.to), subject, html)
            update_mail_log(log_id, status="sent")
            channel.basic_ack(delivery_tag=method.delivery_tag)
            return
        except Exception as exc:
            attempt += 1
            if attempt > config.MAX_RETRIES:
                logger.error(
                    "Max retries exceeded - sending to DLQ",
                    extra={"attempt": attempt},
                    exc_info=exc,
                )
                update_mail_log(log_id, status="failed", error_message=str(exc))
                channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return
            delay = config.RETRY_DELAYS[min(attempt - 1, len(config.RETRY_DELAYS) - 1)]
            logger.warning(
                "Send failed, retrying",
                extra={"attempt": attempt, "delay_s": delay},
                exc_info=exc,
            )
            _sleep_with_heartbeat(channel.connection, delay)


def start_consuming(connection: pika.BlockingConnection) -> None:
    channel = connection.channel()
    channel.exchange_declare(exchange=config.EXCHANGE, exchange_type="direct", durable=True)

    for queue_name, template_name in config.QUEUES.items():
        channel.queue_declare(
            queue=queue_name,
            durable=True,
            arguments={
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": config.DEAD_LETTER_QUEUE,
            },
        )
        channel.queue_bind(queue=queue_name, exchange=config.EXCHANGE, routing_key=queue_name)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(
            queue=queue_name,
            on_message_callback=lambda ch, method, props, body, tn=template_name: handle_message(
                ch, method, props, body, tn
            ),
        )

    channel.queue_declare(queue=config.DEAD_LETTER_QUEUE, durable=True)
    logger.info("Mailer consumer started - waiting for messages")
    channel.start_consuming()
