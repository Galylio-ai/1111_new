import knex from 'knex';
import { config } from '../config';

export const db = knex({
  client: 'postgresql',
  connection: config.db,
  pool: { min: 2, max: 10 },
  searchPath: ['auth', 'public'],
});
