import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils';

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
