import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  google_id: string | null;
  avatar_url: string | null;
  role: string;
  state: string;
  is_email_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const SAFE_COLUMNS: (keyof User)[] = [
  'id', 'full_name', 'email', 'phone', 'google_id', 'avatar_url',
  'role', 'state', 'is_email_verified', 'is_active', 'created_at', 'updated_at',
];

function safeColumns() {
  return SAFE_COLUMNS.map((c) => `auth.users.${c}`);
}

function unlinkIfPresent(filePath: string): void {
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      logger.warn('Failed to delete avatar file', { path: filePath, error: err.message });
    }
  });
}

function fileBaseName(filePath: string): string {
  return path.posix.basename(filePath.replace(/\\/g, '/'));
}

function avatarFilePath(fileName: string): string {
  if (config.uploadPath.includes('\\')) {
    return path.win32.join(config.uploadPath, 'avatars', fileName);
  }

  return path.join(config.uploadPath, 'avatars', fileName);
}

function equivalentFilePath(left: string, right: string): boolean {
  return left.replace(/\\/g, '/') === right.replace(/\\/g, '/');
}

export async function getMe(userId: string): Promise<User> {
  const user = await db('auth.users')
    .where({ id: userId, is_active: true })
    .select(safeColumns())
    .first();
  if (!user) throw new AppError(404, 'User not found');
  return user as User;
}

export async function updateMe(
  userId: string,
  body: { full_name?: string; phone?: string; state?: string },
): Promise<User> {
  if (body.phone) {
    const conflict = await db('auth.users')
      .where({ phone: body.phone })
      .whereNot({ id: userId })
      .first();
    if (conflict) throw new AppError(409, 'Phone already in use');
  }

  const [user] = await db('auth.users')
    .where({ id: userId, is_active: true })
    .update({ ...body, updated_at: new Date() })
    .returning(SAFE_COLUMNS);

  if (!user) throw new AppError(404, 'User not found');
  return user as User;
}

export async function updateAvatar(userId: string, file: Express.Multer.File): Promise<string> {
  const avatar_url = `/uploads/avatars/${fileBaseName(file.path)}`;

  const prev = (await db('auth.users')
    .where({ id: userId, is_active: true })
    .select('avatar_url')
    .first()) as
    | { avatar_url: string | null }
    | undefined;

  if (!prev) {
    unlinkIfPresent(file.path);
    throw new AppError(404, 'User not found');
  }

  const updated = await db('auth.users')
    .where({ id: userId, is_active: true })
    .update({ avatar_url, updated_at: new Date() });

  if (!updated) {
    unlinkIfPresent(file.path);
    throw new AppError(404, 'User not found');
  }

  if (prev?.avatar_url?.startsWith('/uploads/avatars/')) {
    const oldPath = avatarFilePath(fileBaseName(prev.avatar_url));
    if (!equivalentFilePath(oldPath, file.path)) {
      unlinkIfPresent(oldPath);
    }
  }

  return avatar_url;
}

export async function getUserById(id: string): Promise<User> {
  const user = await db('auth.users')
    .where({ id })
    .select(safeColumns())
    .first();
  if (!user) throw new AppError(404, 'User not found');
  return user as User;
}

export async function listUsers(
  page: number,
  limit: number,
): Promise<{ users: User[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;
  const [{ count }] = await db('auth.users').count('id as count');
  const users = await db('auth.users')
    .select(safeColumns())
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);
  return { users: users as User[], total: parseInt(String(count), 10), page, limit };
}

export async function changeRole(userId: string, role: string): Promise<User> {
  const [user] = await db('auth.users')
    .where({ id: userId })
    .update({ role, updated_at: new Date() })
    .returning(SAFE_COLUMNS);
  if (!user) throw new AppError(404, 'User not found');
  return user as User;
}

export async function softDelete(userId: string): Promise<void> {
  const updated = await db('auth.users')
    .where({ id: userId })
    .update({ is_active: false, updated_at: new Date() });
  if (!updated) throw new AppError(404, 'User not found');
}
