import amqplib, { ChannelModel, Channel } from 'amqplib';
import { config } from '../config';
import { logger } from './logger';

const EXCHANGE = 'mailer.exchange';
let connection: ChannelModel | null = null;
let channel: Channel | null = null;

async function setup(): Promise<void> {
  const conn = await amqplib.connect(config.rabbitmqUrl);
  const ch = await conn.createChannel();
  await ch.assertExchange(EXCHANGE, 'direct', { durable: true });
  connection = conn;
  channel = ch;
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

export async function closeRabbitMQ(): Promise<void> {
  await channel?.close();
  await connection?.close();
}
