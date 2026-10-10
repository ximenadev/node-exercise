import { Router } from 'express';
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from './users.controller';
import { filterBody } from './users.middleware';
import { protect, restrictTo } from '../auth/auth.middleware';

const router = Router();

router.use(protect, restrictTo('admin'));

router.route('/').get(getAllUsers);
router
  .route('/:id')
  .get(getUser)
  .patch(filterBody('name', 'email', 'role'), updateUser)
  .delete(deleteUser);

export default router;
