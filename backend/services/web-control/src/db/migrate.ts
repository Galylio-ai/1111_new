import { db } from './index';
import { logger } from '../utils/logger';

async function migrate() {
  try {
    await db.migrate.latest({
      directory: './migrations',
    });
    logger.info('Web-control migrations completed');
    await db.destroy();
  } catch (err) {
    logger.error('Web-control migration failed', { error: (err as Error).message });
    await db.destroy();
    process.exit(1);
  }
}

migrate();
