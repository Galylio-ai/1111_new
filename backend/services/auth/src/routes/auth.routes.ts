import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as v from '../validators/auth.validators';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(v.registerSchema), ctrl.register);
router.post('/login', validate(v.loginSchema), ctrl.login);
router.post('/google', validate(v.googleSchema), ctrl.googleAuth);
router.post('/refresh', validate(v.refreshSchema), ctrl.refreshToken);
router.post('/logout', validate(v.logoutSchema), ctrl.logout);
router.post('/verify-email', validate(v.verifyEmailSchema), ctrl.verifyEmail);
router.post('/resend-otp', ctrl.resendOtp);
router.post('/forgot-password', validate(v.forgotPasswordSchema), ctrl.forgotPassword);
router.post('/reset-password', validate(v.resetPasswordSchema), ctrl.resetPassword);

export default router;
