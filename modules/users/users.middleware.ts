import type { NextFunction, Request, Response } from 'express';
import { AppError, uploadImage, uploadSingleImage } from '../../utils';
import { USER_PHOTO_FOLDER, USER_PHOTO_SIZE } from './users.constants';

export const setMeId = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user!.id;
  next();
};

export const forbidPasswordUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body?.password || req.body?.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /auth/updatePassword.',
        400,
      ),
    );
  }
  next();
};

export const uploadUserPhoto = uploadSingleImage('photo');

export const saveUserPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file) return next();

  req.body.photo = await uploadImage(req.file.buffer, {
    public_id: `${USER_PHOTO_FOLDER}/${req.user!.id}`,
    overwrite: true,
    invalidate: true,
    format: 'jpg',
    transformation: [
      {
        width: USER_PHOTO_SIZE,
        height: USER_PHOTO_SIZE,
        crop: 'fill',
        gravity: 'auto',
      },
      { quality: 'auto' },
    ],
  });
  next();
};
