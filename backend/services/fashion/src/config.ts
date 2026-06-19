import 'dotenv/config';

const dbPrefix = 'FASHION';

function env(name: string, fallback = ''): string {
  return process.env[`${dbPrefix}_${name}`] ?? process.env[name] ?? fallback;
}

export const config = {
  serviceName: 'fashion',
  port: parseInt(process.env.FASHION_PORT ?? '3007', 10),
  db: {
    host: env('DB_HOST', 'localhost'),
    port: parseInt(env('DB_PORT', '5432'), 10),
    database: env('DB_NAME', 'fashion_db'),
    user: env('DB_USER', ''),
    password: env('DB_PASSWORD', ''),
  },
} as const;
