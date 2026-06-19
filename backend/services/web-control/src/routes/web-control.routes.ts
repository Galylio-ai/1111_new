import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { mediaUpload } from '../middleware/mediaUpload';
import { validate } from '../middleware/validate';
import * as v from '../validators/web-control.validators';
import * as ctrl from '../controllers/web-control.controller';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'web-control' } });
});

router.use(requireAuth);
router.use(requireRole('admin', 'super_admin'));

router.post('/banners', validate(v.createBannerSchema), ctrl.createBanner);
router.get('/banners', validate(v.paginationSchema, 'query'), ctrl.listBanners);
router.get('/banners/:id', validate(v.uuidParamSchema, 'params'), ctrl.getBannerById);
router.patch('/banners/:id', validate(v.uuidParamSchema, 'params'), validate(v.updateBannerSchema), ctrl.updateBanner);
router.patch('/banners/:id/archive', validate(v.uuidParamSchema, 'params'), ctrl.archiveBanner);

router.post('/sections', validate(v.createSectionSchema), ctrl.createSection);
router.get('/sections', validate(v.paginationSchema, 'query'), ctrl.listSections);
router.get('/sections/:id', validate(v.uuidParamSchema, 'params'), ctrl.getSectionById);
router.patch('/sections/:id', validate(v.uuidParamSchema, 'params'), validate(v.updateSectionSchema), ctrl.updateSection);
router.patch('/sections/:id/archive', validate(v.uuidParamSchema, 'params'), ctrl.archiveSection);

router.post('/section-items', validate(v.createSectionItemSchema), ctrl.createSectionItem);
router.get('/section-items', validate(v.sectionItemListQuerySchema, 'query'), ctrl.listSectionItems);
router.get('/section-items/:id', validate(v.uuidParamSchema, 'params'), ctrl.getSectionItemById);
router.patch(
  '/section-items/:id',
  validate(v.uuidParamSchema, 'params'),
  validate(v.updateSectionItemSchema),
  ctrl.updateSectionItem,
);
router.delete('/section-items/:id', validate(v.uuidParamSchema, 'params'), ctrl.deleteSectionItem);

router.post('/footer-groups', validate(v.createFooterGroupSchema), ctrl.createFooterGroup);
router.get('/footer-groups', validate(v.paginationSchema, 'query'), ctrl.listFooterGroups);
router.get('/footer-groups/:id', validate(v.uuidParamSchema, 'params'), ctrl.getFooterGroupById);
router.patch(
  '/footer-groups/:id',
  validate(v.uuidParamSchema, 'params'),
  validate(v.updateFooterGroupSchema),
  ctrl.updateFooterGroup,
);
router.patch('/footer-groups/:id/archive', validate(v.uuidParamSchema, 'params'), ctrl.archiveFooterGroup);

router.post('/footer-links', validate(v.createFooterLinkSchema), ctrl.createFooterLink);
router.get('/footer-links', validate(v.footerLinkListQuerySchema, 'query'), ctrl.listFooterLinks);
router.get('/footer-links/:id', validate(v.uuidParamSchema, 'params'), ctrl.getFooterLinkById);
router.patch(
  '/footer-links/:id',
  validate(v.uuidParamSchema, 'params'),
  validate(v.updateFooterLinkSchema),
  ctrl.updateFooterLink,
);
router.patch('/footer-links/:id/archive', validate(v.uuidParamSchema, 'params'), ctrl.archiveFooterLink);

router.get('/settings', ctrl.listSettings);
router.get('/settings/:key', validate(v.keyParamSchema, 'params'), ctrl.getSettingByKey);
router.put('/settings/:key', validate(v.keyParamSchema, 'params'), validate(v.upsertSettingSchema), ctrl.upsertSetting);

router.post('/media', mediaUpload.single('file'), ctrl.uploadMedia);
router.get('/media', validate(v.mediaListQuerySchema, 'query'), ctrl.listMedia);
router.get('/media/:id', validate(v.uuidParamSchema, 'params'), ctrl.getMediaById);
router.patch('/media/:id/archive', validate(v.uuidParamSchema, 'params'), ctrl.archiveMedia);

export default router;
