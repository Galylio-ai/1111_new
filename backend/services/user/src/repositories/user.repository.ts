import type { Knex } from 'knex';
import { db } from '../db';
import { User, UserRole } from '../entities/user.entities';

type DbConnection = Knex | Knex.Transaction;

const SAFE_COLUMNS = [
  'id',
  'full_name',
  'email',
  'phone',
  'google_id',
  'avatar_url',
  'role',
  'state',
  'is_email_verified',
  'is_active',
  'created_at',
  'updated_at',
] as const;

export type UserListFilters = {
  role?: UserRole;
  is_active?: boolean;
  is_email_verified?: boolean;
  page?: number;
  limit?: number;
};

function connection(conn?: DbConnection): DbConnection {
  return conn ?? db;
}

function safeColumns() {
  return SAFE_COLUMNS.map((column) => `auth.users.${column}`);
}

export function transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
  return db.transaction(callback);
}

export async function createUser(
  input: Partial<User> & { password_hash?: string | null },
  conn?: DbConnection,
): Promise<User> {
  const [user] = await connection(conn)('auth.users').insert(input).returning(SAFE_COLUMNS);
  return user as User;
}

export async function findById(id: string, conn?: DbConnection): Promise<User | null> {
  const user = await connection(conn)('auth.users').where({ id }).select(safeColumns()).first();
  return (user as User | undefined) ?? null;
}

export async function findByEmailOrPhone(
  input: { email?: string | null; phone?: string | null },
  excludeId?: string,
  conn?: DbConnection,
): Promise<User | null> {
  const cx = connection(conn);
  const query = cx('auth.users').select(safeColumns());
  query.where((builder) => {
    if (input.email) builder.orWhere({ email: input.email });
    if (input.phone) builder.orWhere({ phone: input.phone });
  });
  if (excludeId) query.whereNot({ id: excludeId });
  const user = await query.first();
  return (user as User | undefined) ?? null;
}

export async function listUsers(filters: UserListFilters = {}, conn?: DbConnection) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const cx = connection(conn);
  const base = cx('auth.users');
  if (filters.role) base.where({ role: filters.role });
  if (filters.is_active !== undefined) base.where({ is_active: filters.is_active });
  if (filters.is_email_verified !== undefined) {
    base.where({ is_email_verified: filters.is_email_verified });
  }
  const [[{ count }], users] = await Promise.all([
    base.clone().count<{ count: string }[]>('id as count'),
    base.clone().select(safeColumns()).orderBy('created_at', 'desc').limit(limit).offset((page - 1) * limit),
  ]);

  return { users: users as User[], total: Number(count), page, limit };
}

export async function updateUser(
  id: string,
  patch: Partial<User> & { password_hash?: string },
  conn?: DbConnection,
): Promise<User | null> {
  const [user] = await connection(conn)('auth.users')
    .where({ id })
    .update({ ...patch, updated_at: new Date() })
    .returning(SAFE_COLUMNS);
  return (user as User | undefined) ?? null;
}

export async function countActiveSuperAdmins(conn?: DbConnection): Promise<number> {
  const [{ count }] = await connection(conn)('auth.users')
    .where({ role: 'super_admin', is_active: true })
    .count<{ count: string }[]>('id as count');
  return Number(count);
}

export async function revokeRefreshTokens(userId: string, conn?: DbConnection): Promise<void> {
  await connection(conn)('auth.refresh_tokens')
    .where({ user_id: userId, revoked: false })
    .update({ revoked: true });
}
