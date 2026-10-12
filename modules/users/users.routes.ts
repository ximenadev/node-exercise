import { Router } from 'express';
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  updateMe,
  updateUser,
} from './users.controller';
import { protect, restrictTo } from '../auth/auth.middleware';

const router = Router();

router.use(protect);

router.route('/me').get(getMe);
router.route('/updateMe').patch(updateMe);
router.route('/deleteMe').delete(deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
