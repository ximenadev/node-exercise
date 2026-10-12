import { Router } from 'express';
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  signup,
  updatePassword,
} from './auth.controller';
import { protect } from './auth.middleware';
import { authLimiter, forgotPasswordLimiter, validateBody } from '../../utils';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  updatePasswordSchema,
} from './auth.schemas';

const router = Router();

router.route('/signup').post(authLimiter, validateBody(signupSchema), signup);
router.route('/login').post(authLimiter, validateBody(loginSchema), login);
router.route('/logout').post(logout);

router
  .route('/forgotPassword')
  .post(
    forgotPasswordLimiter,
    validateBody(forgotPasswordSchema),
    forgotPassword,
  );
router
  .route('/resetPassword/:token')
  .patch(authLimiter, validateBody(resetPasswordSchema), resetPassword);
router
  .route('/updatePassword')
  .patch(
    protect,
    authLimiter,
    validateBody(updatePasswordSchema),
    updatePassword,
  );

export default router;
