import 'dotenv/config';

export const config = {
  serviceName: 'mailer-api',
  port: parseInt(process.env.MAILER_API_PORT ?? '3006', 10),
  jwtSecret: process.env.JWT_SECRET ?? '',
  rabbitmqUrl: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'appdb',
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
  },
} as const;

if (!config.jwtSecret || config.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET is required and must be at least 32 characters');
}
