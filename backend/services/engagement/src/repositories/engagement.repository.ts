import type { Knex } from 'knex';
import { db } from '../db';
import { Alert, AlertType, CatalogDomain, Favorite } from '../entities/engagement.entities';

type DbConnection = Knex | Knex.Transaction;

function connection(conn?: DbConnection): DbConnection {
  return conn ?? db;
}

export async function findFavoriteByUserAndProduct(
  userId: string,
  catalogDomain: CatalogDomain,
  productId: number,
  conn?: DbConnection,
): Promise<Favorite | null> {
  const row = await connection(conn)('favorites')
    .where({ user_id: userId, catalog_domain: catalogDomain, product_id: productId })
    .first();
  return (row as Favorite | undefined) ?? null;
}

export async function createFavorite(
  input: Omit<Favorite, 'id' | 'created_at'>,
  conn?: DbConnection,
): Promise<Favorite> {
  const [row] = await connection(conn)('favorites').insert(input).returning('*');
  return row as Favorite;
}

export async function listFavoritesByUser(userId: string, conn?: DbConnection): Promise<Favorite[]> {
  const rows = await connection(conn)('favorites')
    .where({ user_id: userId })
    .select('*')
    .orderBy('created_at', 'desc');
  return rows as Favorite[];
}

export async function findFavoriteByIdForUser(
  userId: string,
  id: string,
  conn?: DbConnection,
): Promise<Favorite | null> {
  const row = await connection(conn)('favorites').where({ id, user_id: userId }).first();
  return (row as Favorite | undefined) ?? null;
}

export async function deleteFavoriteByIdForUser(
  userId: string,
  id: string,
  conn?: DbConnection,
): Promise<number> {
  return connection(conn)('favorites').where({ id, user_id: userId }).delete();
}

export async function findAlertByUserProductAndType(
  userId: string,
  catalogDomain: CatalogDomain,
  productId: number,
  alertType: AlertType,
  conn?: DbConnection,
): Promise<Alert | null> {
  const row = await connection(conn)('alerts')
    .where({
      user_id: userId,
      catalog_domain: catalogDomain,
      product_id: productId,
      alert_type: alertType,
    })
    .first();
  return (row as Alert | undefined) ?? null;
}

export async function findAlertByUserProductTypeExcludingId(
  userId: string,
  catalogDomain: CatalogDomain,
  productId: number,
  alertType: AlertType,
  excludedId: string,
  conn?: DbConnection,
): Promise<Alert | null> {
  const row = await connection(conn)('alerts')
    .where({
      user_id: userId,
      catalog_domain: catalogDomain,
      product_id: productId,
      alert_type: alertType,
    })
    .whereNot({ id: excludedId })
    .first();
  return (row as Alert | undefined) ?? null;
}

export async function createAlert(input: Omit<Alert, 'id' | 'created_at'>, conn?: DbConnection): Promise<Alert> {
  const [row] = await connection(conn)('alerts').insert(input).returning('*');
  return row as Alert;
}

export async function listAlertsByUser(userId: string, conn?: DbConnection): Promise<Alert[]> {
  const rows = await connection(conn)('alerts')
    .where({ user_id: userId })
    .select('*')
    .orderBy('created_at', 'desc');
  return rows as Alert[];
}

export async function findAlertByIdForUser(userId: string, id: string, conn?: DbConnection): Promise<Alert | null> {
  const row = await connection(conn)('alerts').where({ id, user_id: userId }).first();
  return (row as Alert | undefined) ?? null;
}

export async function updateAlertByIdForUser(
  userId: string,
  id: string,
  input: Pick<Alert, 'alert_type'>,
  conn?: DbConnection,
): Promise<Alert | null> {
  const [row] = await connection(conn)('alerts')
    .where({ id, user_id: userId })
    .update(input)
    .returning('*');
  return (row as Alert | undefined) ?? null;
}

export async function deleteAlertByIdForUser(userId: string, id: string, conn?: DbConnection): Promise<number> {
  return connection(conn)('alerts').where({ id, user_id: userId }).delete();
}
