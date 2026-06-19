import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ADMIN_ONLY_PATH_PREFIXES, PUBLIC_AUTH_PATHS, PUBLIC_PATH_PREFIXES } from '../config/routes';
import { logger } from '../utils/logger';

interface JwtPayload {
  sub: string;
  role: string;
  jti: string;
}

const PUBLIC_PATHS = new Set<string>(PUBLIC_AUTH_PATHS);

function isPublicPath(path: string): boolean {
  return (
    PUBLIC_PATHS.has(path) ||
    PUBLIC_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  );
}

export function jwtMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (isPublicPath(req.path)) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
    }) as JwtPayload;
    req.headers['x-user-id'] = payload.sub;
    req.headers['x-user-role'] = payload.role;
    next();
  } catch (err) {
    logger.warn('JWT verification failed', { error: (err as Error).message, path: req.path });
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function isAdminOnlyPath(path: string): boolean {
  return ADMIN_ONLY_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function adminOnlyMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!isAdminOnlyPath(req.path)) {
    next();
    return;
  }

  const role = req.headers['x-user-role'];
  if (role === 'admin' || role === 'super_admin') {
    next();
    return;
  }

  res.status(403).json({ success: false, message: 'Forbidden' });
}
