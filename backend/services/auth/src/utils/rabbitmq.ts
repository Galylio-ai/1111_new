import amqplib, { ChannelModel, Channel } from 'amqplib';
import { config } from '../config';
import { logger } from './logger';

const EXCHANGE = 'mailer.exchange';
const QUEUES = ['mail.welcome', 'mail.verification', 'mail.password_reset', 'mail.notification'];

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

async function setup(): Promise<void> {
  const conn = await amqplib.connect(config.rabbitmqUrl);

  conn.on('close', () => {
    logger.warn('RabbitMQ connection closed — scheduling reconnect');
    connection = null;
    channel = null;
    scheduleReconnect();
  });

  conn.on('error', (err: Error) => {
    logger.error('RabbitMQ connection error', { error: err.message });
  });

  const ch = await conn.createChannel();

  ch.on('close', () => {
    logger.warn('RabbitMQ channel closed');
    channel = null;
  });

  ch.on('error', (err: Error) => {
    logger.error('RabbitMQ channel error', { error: err.message });
    channel = null;
  });

  await ch.assertExchange(EXCHANGE, 'direct', { durable: true });

  for (const queue of QUEUES) {
    await ch.assertQueue(queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': 'mail.dead_letter',
      },
    });
    await ch.bindQueue(queue, EXCHANGE, queue);
  }

  await ch.assertQueue('mail.dead_letter', { durable: true });

  connection = conn;
  channel = ch;
  logger.info('RabbitMQ connected and exchange/queues ready');
}

function scheduleReconnect(): void {
  if (reconnectTimer) return; // already pending
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await setup();
    } catch (err) {
      logger.error('RabbitMQ reconnect failed — retrying in 5 s', {
        error: (err as Error).message,
      });
      scheduleReconnect();
    }
  }, 5000);
}

export async function connectRabbitMQ(): Promise<void> {
  await setup();
}

export async function publishMail(
  routingKey: string,
  payload: { to: string; name: string; data: Record<string, unknown> },
): Promise<void> {
  if (!channel) {
    logger.warn('RabbitMQ channel not ready; skipping mail publish', {
      routingKey,
      to: payload.to,
    });
    return;
  }
  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
    contentType: 'application/json',
  });
}
