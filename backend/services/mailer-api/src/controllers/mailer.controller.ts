import { Request, Response, NextFunction } from 'express';
import * as mailerService from '../services/mailer.service';

export async function createTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await mailerService.createTemplate(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await mailerService.listTemplates(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getTemplateById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await mailerService.getTemplateById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await mailerService.updateTemplate(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

export async function archiveTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await mailerService.archiveTemplate(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function previewTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await mailerService.previewTemplate(req.params.id, req.body.variables),
    });
  } catch (err) {
    next(err);
  }
}

export async function testSendTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await mailerService.testSendTemplate(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

export async function listLogs(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await mailerService.listLogs(req.query as never) });
  } catch (err) {
    next(err);
  }
}

export async function getLogById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await mailerService.getLogById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function retryLog(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await mailerService.retryLog(req.params.id) });
  } catch (err) {
    next(err);
  }
}
