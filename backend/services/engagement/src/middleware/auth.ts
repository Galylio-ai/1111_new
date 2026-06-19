import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface JwtPayload {
  sub: string;
  role: string;
  jti: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const forwardedUserId = req.headers['x-user-id'];
  const forwardedRole = req.headers['x-user-role'];
  if (typeof forwardedUserId === 'string') {
    req.headers['x-user-id'] = forwardedUserId;
    if (typeof forwardedRole === 'string') req.headers['x-user-role'] = forwardedRole;
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), config.jwtSecret, {
      algorithms: ['HS256'],
    }) as JwtPayload;
    req.headers['x-user-id'] = payload.sub;
    req.headers['x-user-role'] = payload.role;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
