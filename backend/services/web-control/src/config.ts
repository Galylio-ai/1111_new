import 'dotenv/config';
import path from 'path';

export const config = {
  serviceName: 'web-control',
  port: parseInt(process.env.WEB_CONTROL_PORT ?? '3009', 10),
  jwtSecret: process.env.JWT_SECRET ?? '',
  uploadPath: process.env.UPLOAD_PATH ?? path.join(process.cwd(), 'uploads'),
  maxMediaSizeMb: parseInt(process.env.MAX_MEDIA_SIZE_MB ?? '8', 10),
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
