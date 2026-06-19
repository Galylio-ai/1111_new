import { Request, Response, NextFunction } from 'express';
import * as service from '../services/web-control.service';
import { WebMediaAsset } from '../entities/web-control.entities';
import { AppError } from '../utils/errors';
import { validateAndRenameMedia } from '../middleware/mediaUpload';

export async function createBanner(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await service.createBanner(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listBanners(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.listBanners(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getBannerById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getBannerById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function updateBanner(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.updateBanner(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveBanner(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.archiveBanner(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function createSection(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await service.createSection(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listSections(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.listSections(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getSectionById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getSectionById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function updateSection(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.updateSection(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveSection(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.archiveSection(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function createSectionItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await service.createSectionItem(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listSectionItems(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.listSectionItems(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getSectionItemById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getSectionItemById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function updateSectionItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.updateSectionItem(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

export async function deleteSectionItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.deleteSectionItem(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function createFooterGroup(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await service.createFooterGroup(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listFooterGroups(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.listFooterGroups(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getFooterGroupById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getFooterGroupById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function updateFooterGroup(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.updateFooterGroup(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveFooterGroup(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.archiveFooterGroup(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function createFooterLink(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await service.createFooterLink(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listFooterLinks(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.listFooterLinks(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getFooterLinkById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getFooterLinkById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function updateFooterLink(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.updateFooterLink(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveFooterLink(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.archiveFooterLink(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function upsertSetting(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.upsertSetting(req.params.key, req.body.value) });
  } catch (err) {
    next(err);
  }
}

export async function listSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.listSettings() });
  } catch (err) {
    next(err);
  }
}

export async function getSettingByKey(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getSettingByKey(req.params.key) });
  } catch (err) {
    next(err);
  }
}

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, 'Media file is required');
    const file = await validateAndRenameMedia(req.file);
    const actorId = typeof req.headers['x-user-id'] === 'string' ? req.headers['x-user-id'] : null;
    const media = await service.createMediaAsset({
      filename: file.filename,
      original_name: file.originalname,
      mime_type: file.mimetype as WebMediaAsset['mime_type'],
      size_bytes: file.size,
      url: file.url,
      uploaded_by: actorId,
      status: 'active',
    });
    res.status(201).json({ success: true, data: media });
  } catch (err) {
    next(err);
  }
}

export async function listMedia(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.listMediaAssets(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getMediaById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getMediaAssetById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function archiveMedia(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.archiveMediaAsset(req.params.id) });
  } catch (err) {
    next(err);
  }
}
