import type { NextFunction, Request, Response } from 'express';

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Express 5 re-parses req.query on every access, so mutations are lost
  res.locals.query = {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };
  next();
};
