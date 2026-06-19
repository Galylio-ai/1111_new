import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as v from '../validators/catalog.validators';
import * as ctrl from '../controllers/product.controller';

const router = Router();

router.post('/', validate(v.createProductSchema), ctrl.createProduct);
router.get('/', validate(v.paginationSchema, 'query'), ctrl.listProducts);
router.get('/:id', validate(v.idParamSchema, 'params'), ctrl.getProductById);
router.patch('/:id', validate(v.idParamSchema, 'params'), validate(v.updateProductSchema), ctrl.updateProduct);
router.patch('/:id/archive', validate(v.idParamSchema, 'params'), ctrl.archiveProduct);

export default router;
