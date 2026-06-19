import knex from 'knex';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

async function runMigrations(): Promise<void> {
  const migrationsDir =
    process.env.MIGRATIONS_DIR ?? path.join(__dirname, '../../migrations');
  const connection = knex({
    client: 'postgresql',
    connection: config.db,
    migrations: {
      directory: migrationsDir,
      tableName: 'knex_migrations',
      schemaName: 'public',
    },
  });

  try {
    await connection.migrate.latest();
    logger.info('Migrations complete');
  } finally {
    await connection.destroy();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
