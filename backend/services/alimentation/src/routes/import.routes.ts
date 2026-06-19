import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as v from '../validators/import.validators';
import * as ctrl from '../controllers/import.controller';

const router = Router();

router.post('/preview', validate(v.importPayloadSchema), ctrl.previewImport);
router.post('/run', validate(v.importPayloadSchema), ctrl.runImport);
router.get('/:id', validate(v.idParamSchema, 'params'), ctrl.getImportJobById);
router.get(
  '/:id/errors',
  validate(v.idParamSchema, 'params'),
  validate(v.paginationSchema, 'query'),
  ctrl.listImportErrors,
);

export default router;
