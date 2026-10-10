import type { NextFunction, Request, Response } from 'express';

export const filterBody =
  (...allowedFields: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = Object.fromEntries(
      Object.entries(req.body ?? {}).filter(([field]) =>
        allowedFields.includes(field),
      ),
    );
    next();
  };
