import knex from 'knex';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

async function runMigrations(): Promise<void> {
  const migrationsDir = process.env.MIGRATIONS_DIR ?? path.join(__dirname, '../../migrations');

  const db = knex({
    client: 'postgresql',
    connection: config.db,
    migrations: {
      directory: migrationsDir,
      tableName: 'knex_migrations',
      schemaName: 'public',
    },
  });

  try {
    await db.migrate.latest();
    logger.info('Migrations complete');
  } finally {
    await db.destroy();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
