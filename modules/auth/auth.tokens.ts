import type { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { UserDocument } from '../users/users.model';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

export const createAndSendToken = (
  user: UserDocument,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user.id);
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
