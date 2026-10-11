import rateLimit from 'express-rate-limit';
import { AppError } from './appError';

const MINUTE = 60 * 1000;

const createLimiter = ({
  windowMs,
  limit,
  message,
  skipSuccessfulRequests = false,
}: {
  windowMs: number;
  limit: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res, next) => next(new AppError(message, 429)),
  });

export const apiLimiter = createLimiter({
  windowMs: 15 * MINUTE,
  limit: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes.',
});

export const authLimiter = createLimiter({
  windowMs: 15 * MINUTE,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many failed attempts, please try again in 15 minutes.',
});

export const forgotPasswordLimiter = createLimiter({
  windowMs: 60 * MINUTE,
  limit: 5,
  message: 'Too many password reset requests, please try again in an hour.',
});
