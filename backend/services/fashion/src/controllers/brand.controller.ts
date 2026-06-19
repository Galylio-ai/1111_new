import { Request, Response, NextFunction } from 'express';
import * as brandService from '../services/brand.service';

const id = (req: Request) => Number(req.params.id);

export async function createBrand(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await brandService.createBrand(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listBrands(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await brandService.listBrands(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getBrandById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await brandService.getBrandById(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function updateBrand(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await brandService.updateBrand(id(req), req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveBrand(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await brandService.archiveBrand(id(req)) });
  } catch (err) {
    next(err);
  }
}
