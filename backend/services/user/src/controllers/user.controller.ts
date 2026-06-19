import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import * as adminUserService from '../services/adminUser.service';
import { validateAndRenameAvatar } from '../middleware/upload';
import { Actor } from '../entities/user.entities';

function actorFrom(req: Request): Actor {
  return {
    id: req.headers['x-user-id'] as string,
    role: req.headers['x-user-role'] as Actor['role'],
  };
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string;
    const user = await userService.getMe(userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string;
    const user = await userService.updateMe(userId, req.body);
    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    const validated = await validateAndRenameAvatar(req.file, userId);
    const avatar_url = await userService.updateAvatar(userId, validated);
    res.json({ success: true, data: { avatar_url }, message: 'Avatar updated' });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminUserService.getUserById(actorFrom(req), req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminUserService.listUsers(actorFrom(req), req.query as never);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function changeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminUserService.changeRole(actorFrom(req), req.params.id, req.body.role);
    res.json({ success: true, data: user, message: 'Role updated' });
  } catch (err) {
    next(err);
  }
}

export async function softDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminUserService.deactivateUser(actorFrom(req), req.params.id);
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
}

export async function createStaffUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminUserService.createStaffUser(actorFrom(req), req.body);
    res.status(201).json({ success: true, data: user, message: 'Staff user created' });
  } catch (err) {
    next(err);
  }
}

export async function updateUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminUserService.updateUser(actorFrom(req), req.params.id, req.body);
    res.json({ success: true, data: user, message: 'User updated' });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminUserService.deactivateUser(actorFrom(req), req.params.id);
    res.json({ success: true, data: user, message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
}

export async function reactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminUserService.reactivateUser(actorFrom(req), req.params.id);
    res.json({ success: true, data: user, message: 'User reactivated' });
  } catch (err) {
    next(err);
  }
}

export async function setEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminUserService.setEmailVerification(
      actorFrom(req),
      req.params.id,
      req.body.is_email_verified,
    );
    res.json({ success: true, data: user, message: 'Email verification updated' });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminUserService.resetPassword(actorFrom(req), req.params.id, req.body.password);
    res.json({ success: true, message: 'Password reset and sessions revoked' });
  } catch (err) {
    next(err);
  }
}

export async function revokeSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminUserService.revokeSessions(actorFrom(req), req.params.id);
    res.json({ success: true, message: 'Sessions revoked' });
  } catch (err) {
    next(err);
  }
}
