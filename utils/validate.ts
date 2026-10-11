import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from './appError';

export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const messages = new Set(result.error.issues.map(issue => issue.message));
      return next(
        new AppError(`Invalid input data. ${[...messages].join('. ')}`, 400),
      );
    }

    req.body = result.data;
    next();
  };
