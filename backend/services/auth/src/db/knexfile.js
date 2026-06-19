require('dotenv').config({ path: '../../../../.env' });

module.exports = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  migrations: {
    directory: '../../../../shared/db/migrations',
    tableName: 'knex_migrations',
    schemaName: 'public',
  },
};
