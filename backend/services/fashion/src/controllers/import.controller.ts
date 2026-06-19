import { Request, Response, NextFunction } from 'express';
import * as importService from '../services/import.service';

export async function previewImport(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await importService.previewImport(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function runImport(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await importService.runImport(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function getImportJobById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await importService.getImportJobById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function listImportErrors(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await importService.listImportErrors(req.params.id, req.query as never),
    });
  } catch (err) {
    next(err);
  }
}
