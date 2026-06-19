import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as v from '../validators/catalog.validators';
import * as ctrl from '../controllers/category.controller';

const router = Router();

router.get('/tree', ctrl.getCategoryTree);

router.post('/top', validate(v.createTopCategorySchema), ctrl.createTopCategory);
router.get('/top', validate(v.paginationSchema, 'query'), ctrl.listTopCategories);
router.get('/top/:id', validate(v.idParamSchema, 'params'), ctrl.getTopCategoryById);
router.patch(
  '/top/:id',
  validate(v.idParamSchema, 'params'),
  validate(v.updateTopCategorySchema),
  ctrl.updateTopCategory,
);
router.patch('/top/:id/archive', validate(v.idParamSchema, 'params'), ctrl.archiveTopCategory);

router.post('/low', validate(v.createLowCategorySchema), ctrl.createLowCategory);
router.get('/low', validate(v.paginationSchema, 'query'), ctrl.listLowCategories);
router.get('/low/:id', validate(v.idParamSchema, 'params'), ctrl.getLowCategoryById);
router.patch(
  '/low/:id',
  validate(v.idParamSchema, 'params'),
  validate(v.updateLowCategorySchema),
  ctrl.updateLowCategory,
);
router.patch('/low/:id/archive', validate(v.idParamSchema, 'params'), ctrl.archiveLowCategory);
router.patch(
  '/low/:id/move',
  validate(v.idParamSchema, 'params'),
  validate(v.moveLowCategorySchema),
  ctrl.moveLowCategory,
);

router.post('/sub', validate(v.createSubcategorySchema), ctrl.createSubcategory);
router.get('/sub', validate(v.paginationSchema, 'query'), ctrl.listSubcategories);
router.get('/sub/:id', validate(v.idParamSchema, 'params'), ctrl.getSubcategoryById);
router.patch(
  '/sub/:id',
  validate(v.idParamSchema, 'params'),
  validate(v.updateSubcategorySchema),
  ctrl.updateSubcategory,
);
router.patch('/sub/:id/archive', validate(v.idParamSchema, 'params'), ctrl.archiveSubcategory);
router.patch(
  '/sub/:id/move',
  validate(v.idParamSchema, 'params'),
  validate(v.moveSubcategorySchema),
  ctrl.moveSubcategory,
);

export default router;
