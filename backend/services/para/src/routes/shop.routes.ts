import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as v from '../validators/catalog.validators';
import * as ctrl from '../controllers/shop.controller';

const router = Router();

router.post('/', validate(v.createShopSchema), ctrl.createShop);
router.get('/', validate(v.paginationSchema, 'query'), ctrl.listShops);
router.get('/:id/catalogue', validate(v.idParamSchema, 'params'), ctrl.getShopCatalogue);
router.get('/:id', validate(v.idParamSchema, 'params'), ctrl.getShopById);
router.patch('/:id', validate(v.idParamSchema, 'params'), validate(v.updateShopSchema), ctrl.updateShop);
router.patch('/:id/archive', validate(v.idParamSchema, 'params'), ctrl.archiveShop);

export default router;
