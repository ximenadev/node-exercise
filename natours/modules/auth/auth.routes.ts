import { Router } from 'express';
import {
  forgotPassword,
  login,
  resetPassword,
  signup,
  updatePassword,
} from './auth.controller';
import { protect } from './auth.middleware';

const router = Router();

router.route('/signup').post(signup);
router.route('/login').post(login);

router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updatePassword').patch(protect, updatePassword);

export default router;
