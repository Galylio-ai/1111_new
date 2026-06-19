import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';

const id = (req: Request) => Number(req.params.id);

export async function overview(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await analyticsService.getOverview(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function shopSummary(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await analyticsService.getShopSummary(id(req), req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function productQuality(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await analyticsService.getProductQualityReport(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function prices(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await analyticsService.getPriceIntelligence(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function categories(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await analyticsService.getCategoryAnalytics(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function brands(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await analyticsService.getBrandAnalytics(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function staleData(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await analyticsService.getStaleDataReport(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function topDiscounts(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await analyticsService.getTopDiscounts(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function priceDrops(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await analyticsService.getPriceDrops(req.query as never) });
  } catch (err) {
    next(err);
  }
}
