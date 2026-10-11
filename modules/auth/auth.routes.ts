import { Router } from 'express';
import {
  forgotPassword,
  login,
  resetPassword,
  signup,
  updatePassword,
} from './auth.controller';
import { protect } from './auth.middleware';
import { authLimiter, forgotPasswordLimiter } from '../../utils';

const router = Router();

router.route('/signup').post(authLimiter, signup);
router.route('/login').post(authLimiter, login);

router.route('/forgotPassword').post(forgotPasswordLimiter, forgotPassword);
router.route('/resetPassword/:token').patch(authLimiter, resetPassword);
router.route('/updatePassword').patch(protect, authLimiter, updatePassword);

export default router;
