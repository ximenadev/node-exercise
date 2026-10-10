import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { AppError } from '../../utils';

interface DuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

const handleCastErrorDB = (err: MongooseError.CastError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: DuplicateKeyError) => {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : '';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: MongooseError.ValidationError) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJSONParseError = () =>
  new AppError('Invalid JSON in request body', 400);

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleTokenExpiredError = (err: { expiredAt: Date }) =>
  new AppError(
    `Your token expired at ${err.expiredAt}. Please log in again!`,
    401,
  );

const normalizeError = (error: AppError): AppError => {
  const err = error as unknown as DuplicateKeyError & { type?: string };

  if (err.code === 11000) return handleDuplicateFieldsDB(err);
  if (err.type === 'entity.parse.failed') return handleJSONParseError();

  switch (err.name) {
    case 'CastError':
      return handleCastErrorDB(err as unknown as MongooseError.CastError);
    case 'ValidationError':
      return handleValidationErrorDB(
        err as unknown as MongooseError.ValidationError,
      );
    case 'JsonWebTokenError':
      return handleJWTError();
    case 'TokenExpiredError':
      return handleTokenExpiredError(err as unknown as { expiredAt: Date });
    default:
      return error;
  }
};

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message,
    });
  } else {
    console.error('ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong, please try again later.',
    });
  }
};

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    const error = normalizeError(err);
    if (error !== err) error.stack = err.stack;
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Copy descriptors (not values): message is non-enumerable and name can be read-only
    const error: AppError = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err),
    );

    sendErrorProd(normalizeError(error), res);
  }
};
