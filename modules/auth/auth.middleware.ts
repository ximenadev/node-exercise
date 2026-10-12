import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../users/users.model';
import { AppError, catchAsync } from '../../utils';
import { NextFunction, Response, Request } from 'express';

export const protect = catchAsync(async (req, res, next) => {
  const [scheme, bearer] = req.headers.authorization?.split(' ') ?? [];
  const token = scheme === 'Bearer' && bearer ? bearer : req.cookies?.jwt;

  if (typeof token !== 'string' || !token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401),
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat!)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401),
    );
  }

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );
    }
    next();
  };
};
