import { Request, Response, NextFunction } from 'express';
import * as engagementService from '../services/engagement.service';
import { AppError } from '../utils/errors';

function userIdFrom(req: Request): string {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string') throw new AppError(401, 'Invalid or expired token');
  return userId;
}

export async function createFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await engagementService.createFavorite(userIdFrom(req), req.body),
    });
  } catch (err) {
    next(err);
  }
}

export async function listFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await engagementService.listFavorites(userIdFrom(req)) });
  } catch (err) {
    next(err);
  }
}

export async function getFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await engagementService.getFavorite(userIdFrom(req), req.params.id),
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await engagementService.deleteFavorite(userIdFrom(req), req.params.id),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAlert(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await engagementService.createAlert(userIdFrom(req), req.body),
    });
  } catch (err) {
    next(err);
  }
}

export async function listAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await engagementService.listAlerts(userIdFrom(req)) });
  } catch (err) {
    next(err);
  }
}

export async function getAlert(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await engagementService.getAlert(userIdFrom(req), req.params.id),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAlert(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await engagementService.updateAlert(userIdFrom(req), req.params.id, req.body),
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAlert(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await engagementService.deleteAlert(userIdFrom(req), req.params.id),
    });
  } catch (err) {
    next(err);
  }
}
