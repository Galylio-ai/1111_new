import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as v from '../validators/mailer.validators';
import * as ctrl from '../controllers/mailer.controller';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin', 'super_admin'));

router.post('/templates', validate(v.createTemplateSchema), ctrl.createTemplate);
router.get('/templates', validate(v.templateListQuerySchema, 'query'), ctrl.listTemplates);
router.get('/templates/:id', validate(v.uuidParamSchema, 'params'), ctrl.getTemplateById);
router.patch(
  '/templates/:id',
  validate(v.uuidParamSchema, 'params'),
  validate(v.updateTemplateSchema),
  ctrl.updateTemplate,
);
router.patch('/templates/:id/archive', validate(v.uuidParamSchema, 'params'), ctrl.archiveTemplate);
router.post(
  '/templates/:id/preview',
  validate(v.uuidParamSchema, 'params'),
  validate(v.previewTemplateSchema),
  ctrl.previewTemplate,
);
router.post(
  '/templates/:id/test-send',
  validate(v.uuidParamSchema, 'params'),
  validate(v.testSendSchema),
  ctrl.testSendTemplate,
);
router.get('/logs', validate(v.logListQuerySchema, 'query'), ctrl.listLogs);
router.get('/logs/:id', validate(v.uuidParamSchema, 'params'), ctrl.getLogById);
router.post('/logs/:id/retry', validate(v.uuidParamSchema, 'params'), ctrl.retryLog);

export default router;
