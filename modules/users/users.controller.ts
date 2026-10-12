import { catchAsync, factory, validateBody } from '../../utils';
import { forbidPasswordUpdate, setMeId } from './users.middleware';
import { updateMeSchema, updateUserSchema } from './users.schemas';
import User from './users.model';

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user!.id, { active: false });

  res.status(204).send();
});

export const getUser = factory.getOne(User);
export const getMe = [setMeId, getUser];

export const updateMe = [
  forbidPasswordUpdate,
  validateBody(updateMeSchema),
  setMeId,
  factory.updateOne(User),
];

export const updateUser = [
  validateBody(updateUserSchema),
  factory.updateOne(User),
];

export const deleteUser = factory.deleteOne(User);
