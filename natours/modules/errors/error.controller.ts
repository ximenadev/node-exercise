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
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Copy descriptors (not values): message is non-enumerable and name can be read-only
    let error: AppError = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err),
    );

    if (error.name === 'CastError')
      error = handleCastErrorDB(error as unknown as MongooseError.CastError);
    if ((error as unknown as DuplicateKeyError).code === 11000)
      error = handleDuplicateFieldsDB(error as unknown as DuplicateKeyError);
    if ((error as unknown as { type?: string }).type === 'entity.parse.failed')
      error = handleJSONParseError();
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(
        error as unknown as MongooseError.ValidationError,
      );

    sendErrorProd(error, res);
  }
};
