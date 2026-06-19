import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as v from '../validators/catalog.validators';
import * as ctrl from '../controllers/brand.controller';

const router = Router();

router.post('/', validate(v.createBrandSchema), ctrl.createBrand);
router.get('/', validate(v.paginationSchema, 'query'), ctrl.listBrands);
router.get('/:id', validate(v.idParamSchema, 'params'), ctrl.getBrandById);
router.patch('/:id', validate(v.idParamSchema, 'params'), validate(v.updateBrandSchema), ctrl.updateBrand);
router.patch('/:id/archive', validate(v.idParamSchema, 'params'), ctrl.archiveBrand);

export default router;
