import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';

const id = (req: Request) => Number(req.params.id);

export async function createTopCategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await categoryService.createTopCategory(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listTopCategories(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.listTopCategories(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getTopCategoryById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.getTopCategoryById(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function updateTopCategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.updateTopCategory(id(req), req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveTopCategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.archiveTopCategory(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function createLowCategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await categoryService.createLowCategory(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listLowCategories(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.listLowCategories(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getLowCategoryById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.getLowCategoryById(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function updateLowCategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.updateLowCategory(id(req), req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveLowCategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.archiveLowCategory(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function moveLowCategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await categoryService.moveLowCategory(id(req), Number(req.body.top_category_id)),
    });
  } catch (err) {
    next(err);
  }
}

export async function createSubcategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await categoryService.createSubcategory(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listSubcategories(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.listSubcategories(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getSubcategoryById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.getSubcategoryById(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function updateSubcategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.updateSubcategory(id(req), req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveSubcategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.archiveSubcategory(id(req)) });
  } catch (err) {
    next(err);
  }
}

export async function moveSubcategory(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await categoryService.moveSubcategory(id(req), Number(req.body.low_category_id)),
    });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryTree(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await categoryService.getCategoryTree() });
  } catch (err) {
    next(err);
  }
}
