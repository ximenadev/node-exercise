import type { NextFunction, Request, Response } from 'express';
import Tour from '../tours/tours.model';
import Review from './reviews.model';
import { AppError, catchAsync } from '../../utils';

export const filterByTour = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.params.tourId) res.locals.query = { tour: req.params.tourId };
  next();
};

export const setTourAndAuthor = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401),
    );
  }

  const tourId = (req.params.tourId as string | undefined) ?? req.body.tour;

  if (tourId && !(await Tour.exists({ _id: tourId }))) {
    return next(new AppError('No tour found with that ID', 404));
  }

  req.body.tour = tourId;
  req.body.author = req.user.id;
  next();
});

export const checkReviewOwnership = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401),
    );
  }

  if (req.user.role === 'admin') return next();

  const id = req.params.id as string;

  if (await Review.exists({ _id: id, author: req.user.id })) return next();

  if (!(await Review.exists({ _id: id }))) {
    return next(new AppError('No review found with that ID', 404));
  }

  next(new AppError('You can only change or delete your own reviews', 403));
});
