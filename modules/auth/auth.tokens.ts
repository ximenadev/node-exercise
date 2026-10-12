import type { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { UserDocument } from '../users/users.model';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export const clearAuthCookie = (res: Response) =>
  res.clearCookie('jwt', cookieOptions);

export const createAndSendToken = (
  user: UserDocument,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user.id);

  res.cookie('jwt', token, {
    ...cookieOptions,
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
  });

  // select: false doesn't apply to create(), so drop the hash before responding
  user.password = undefined as never;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
