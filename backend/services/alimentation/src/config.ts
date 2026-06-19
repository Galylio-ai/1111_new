import 'dotenv/config';

const dbPrefix = 'ALIMENTATION';

function env(name: string, fallback = ''): string {
  return process.env[`${dbPrefix}_${name}`] ?? process.env[name] ?? fallback;
}

export const config = {
  serviceName: 'alimentation',
  port: parseInt(process.env.ALIMENTATION_PORT ?? '3005', 10),
  db: {
    host: env('DB_HOST', 'localhost'),
    port: parseInt(env('DB_PORT', '5432'), 10),
    database: env('DB_NAME', 'alimentation_db'),
    user: env('DB_USER', ''),
    password: env('DB_PASSWORD', ''),
  },
} as const;
