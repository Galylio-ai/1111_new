import logging
import time

import pika
import pika.exceptions

import config
from consumer import start_consuming

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

RECONNECT_DELAY = 5


def connect_with_retry() -> pika.BlockingConnection:
    while True:
        try:
            params = pika.URLParameters(config.RABBITMQ_URL)
            params.heartbeat = 600
            params.blocked_connection_timeout = 300
            conn = pika.BlockingConnection(params)
            logger.info("Connected to RabbitMQ")
            return conn
        except pika.exceptions.AMQPConnectionError as exc:
            logger.warning(
                "RabbitMQ not ready, retrying in %ds",
                RECONNECT_DELAY,
                exc_info=exc,
            )
            time.sleep(RECONNECT_DELAY)


def main() -> None:
    while True:
        connection = connect_with_retry()
        try:
            start_consuming(connection)
        except pika.exceptions.AMQPConnectionError as exc:
            logger.error("Connection lost, reconnecting", exc_info=exc)
        except KeyboardInterrupt:
            logger.info("Shutting down")
            connection.close()
            break


if __name__ == "__main__":
    main()
