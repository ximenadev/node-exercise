import { Router } from 'express';
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from './users.controller';
import { filterBody, forbidPasswordUpdate, setMeId } from './users.middleware';
import { protect, restrictTo } from '../auth/auth.middleware';

const router = Router();

router.use(protect);

router.patch(
  '/updateMe',
  forbidPasswordUpdate,
  filterBody('name', 'email'),
  setMeId,
  updateUser,
);

router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
router
  .route('/:id')
  .get(getUser)
  .patch(filterBody('name', 'email', 'role'), updateUser)
  .delete(deleteUser);

export default router;
