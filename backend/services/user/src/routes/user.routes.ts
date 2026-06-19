import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { avatarUpload } from '../middleware/upload';
import * as v from '../validators/user.validators';
import * as ctrl from '../controllers/user.controller';

const router = Router();

router.use(requireAuth);

router.get('/me', ctrl.getMe);
router.patch('/me', validate(v.updateMeSchema), ctrl.updateMe);
router.post('/me/avatar', avatarUpload.single('avatar'), ctrl.uploadAvatar);

router.post('/admins', requireRole('super_admin'), validate(v.createAdminUserSchema), ctrl.createStaffUser);
router.get('/', requireRole('admin', 'super_admin'), validate(v.paginationSchema, 'query'), ctrl.listUsers);
router.get('/:id', requireRole('admin', 'super_admin'), validate(v.uuidParamSchema, 'params'), ctrl.getUserById);
router.patch('/:id', requireRole('admin', 'super_admin'), validate(v.uuidParamSchema, 'params'), validate(v.adminUpdateUserSchema), ctrl.updateUserByAdmin);
router.patch('/:id/role', requireRole('super_admin'), validate(v.uuidParamSchema, 'params'), validate(v.changeRoleSchema), ctrl.changeRole);
router.patch('/:id/deactivate', requireRole('admin', 'super_admin'), validate(v.uuidParamSchema, 'params'), ctrl.deactivateUser);
router.patch('/:id/reactivate', requireRole('super_admin'), validate(v.uuidParamSchema, 'params'), ctrl.reactivateUser);
router.patch('/:id/email-verification', requireRole('admin', 'super_admin'), validate(v.uuidParamSchema, 'params'), validate(v.emailVerificationSchema), ctrl.setEmailVerification);
router.patch('/:id/password', requireRole('admin', 'super_admin'), validate(v.uuidParamSchema, 'params'), validate(v.adminResetPasswordSchema), ctrl.resetPasswordByAdmin);
router.post('/:id/revoke-sessions', requireRole('admin', 'super_admin'), validate(v.uuidParamSchema, 'params'), ctrl.revokeSessions);
router.delete('/:id', requireRole('admin', 'super_admin'), validate(v.uuidParamSchema, 'params'), ctrl.softDelete);

export default router;
