import { Request, Response, NextFunction } from 'express';
import * as shopService from '../services/shop.service';

const id = (req: Request) => Number(req.params.id);

export async function createShop(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await shopService.createShop(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listShops(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await shopService.listShops(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getShopById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await shopService.getShopById(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function updateShop(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await shopService.updateShop(id(req), req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveShop(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await shopService.archiveShop(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function getShopCatalogue(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await shopService.getShopCatalogue(id(req)) });
  } catch (err) {
    next(err);
  }
}
