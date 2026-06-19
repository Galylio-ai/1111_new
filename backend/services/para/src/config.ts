import 'dotenv/config';

const dbPrefix = 'PARA';

function env(name: string, fallback = ''): string {
  return process.env[`${dbPrefix}_${name}`] ?? process.env[name] ?? fallback;
}

export const config = {
  serviceName: 'para',
  port: parseInt(process.env.PARA_PORT ?? '3004', 10),
  db: {
    host: env('DB_HOST', 'localhost'),
    port: parseInt(env('DB_PORT', '5432'), 10),
    database: env('DB_NAME', 'para_db'),
    user: env('DB_USER', ''),
    password: env('DB_PASSWORD', ''),
  },
} as const;
