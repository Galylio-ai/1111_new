import 'dotenv/config';

const dbPrefix = 'RETAIL';

function env(name: string, fallback = ''): string {
  return process.env[`${dbPrefix}_${name}`] ?? process.env[name] ?? fallback;
}

export const config = {
  serviceName: 'retail',
  port: parseInt(process.env.RETAIL_PORT ?? '3003', 10),
  db: {
    host: env('DB_HOST', 'localhost'),
    port: parseInt(env('DB_PORT', '5432'), 10),
    database: env('DB_NAME', 'retail_db'),
    user: env('DB_USER', ''),
    password: env('DB_PASSWORD', ''),
  },
} as const;
