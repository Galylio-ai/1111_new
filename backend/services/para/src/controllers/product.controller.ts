import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';

const id = (req: Request) => Number(req.params.id);

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await productService.createProduct(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await productService.listProducts(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await productService.getProductById(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await productService.updateProduct(id(req), req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveProduct(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await productService.archiveProduct(id(req)) });
  } catch (err) {
    next(err);
  }
}
