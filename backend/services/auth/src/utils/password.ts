import bcrypt from 'bcrypt';
import { config } from '../config';

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, config.bcryptCost);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export function compareToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
