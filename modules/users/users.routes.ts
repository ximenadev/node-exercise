import { Router } from 'express';
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from './users.controller';
import { forbidPasswordUpdate, setMeId } from './users.middleware';
import { updateMeSchema, updateUserSchema } from './users.schemas';
import { protect, restrictTo } from '../auth/auth.middleware';
import { validateBody } from '../../utils';

const router = Router();

router.use(protect);

router.patch(
  '/updateMe',
  forbidPasswordUpdate,
  validateBody(updateMeSchema),
  setMeId,
  updateUser,
);

router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
router
  .route('/:id')
  .get(getUser)
  .patch(validateBody(updateUserSchema), updateUser)
  .delete(deleteUser);

export default router;
