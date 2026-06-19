import 'dotenv/config';

export const config = {
  port: parseInt(process.env.AUTH_PORT ?? '3001', 10),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'appdb',
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  },
  refreshToken: {
    expiresDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? '7', 10),
  },
  rabbitmqUrl: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  },
  bcryptCost: 12,
  otpTtlMs: 5 * 60 * 1000,
  otpMaxAttempts: 5,
} as const;

if (!config.jwt.secret || config.jwt.secret.length < 32) {
  throw new Error(
    'JWT_SECRET is required and must be at least 32 characters (256-bit minimum)',
  );
}

