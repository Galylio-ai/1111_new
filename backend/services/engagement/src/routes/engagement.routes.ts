import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as v from '../validators/engagement.validators';
import * as ctrl from '../controllers/engagement.controller';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'engagement' } });
});

router.use(requireAuth);

router.post('/favorites', validate(v.favoriteInputSchema), ctrl.createFavorite);
router.get('/favorites', ctrl.listFavorites);
router.get('/favorites/:id', validate(v.uuidParamSchema, 'params'), ctrl.getFavorite);
router.delete('/favorites/:id', validate(v.uuidParamSchema, 'params'), ctrl.deleteFavorite);

router.post('/alerts', validate(v.alertInputSchema), ctrl.createAlert);
router.get('/alerts', ctrl.listAlerts);
router.get('/alerts/:id', validate(v.uuidParamSchema, 'params'), ctrl.getAlert);
router.patch('/alerts/:id', validate(v.uuidParamSchema, 'params'), validate(v.updateAlertSchema), ctrl.updateAlert);
router.delete('/alerts/:id', validate(v.uuidParamSchema, 'params'), ctrl.deleteAlert);

export default router;
