import 'dotenv/config';
import path from 'path';

export const config = {
  port: parseInt(process.env.USER_PORT ?? '3002', 10),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'appdb',
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
  },
  uploadPath: process.env.UPLOAD_PATH ?? path.join(process.cwd(), 'uploads'),
  maxAvatarSizeMb: parseInt(process.env.MAX_AVATAR_SIZE_MB ?? '5', 10),
} as const;
