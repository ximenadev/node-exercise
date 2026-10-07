import type { NextFunction, Request, Response } from 'express';
import Tour from './tours.model';
import { type QueryString, APIFeatures } from '../../utils/apiFeatures';

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

export const getAllTours = async (req: Request, res: Response) => {
  try {
    const queryString = { ...req.query, ...res.locals.query } as QueryString;
    const features = new APIFeatures(Tour.find(), queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      count: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(404).json({
        status: 'fail',
        message: err,
      });
  }
};

export const getTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(404).json({
        status: 'fail',
        message: err,
      });
  }
};

export const createTour = async (req: Request, res: Response) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        status: 'fail',
        message: err,
      });
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        status: 'fail',
        message: err,
      });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        status: 'fail',
        message: err,
      });
  }
};

export const getTourStats = async (req: Request, res: Response) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        status: 'fail',
        message: err,
      });
  }
};

export const getMonthlyPlan = async (req: Request, res: Response) => {
  try {
    const year = Number(req.params.year);

    if (!Number.isInteger(year) || year < 1000 || year > 9999) {
      res.status(400).json({
        status: 'fail',
        message: 'Year must be a valid 4-digit number',
      });
      return;
    }

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        status: 'fail',
        message: err,
      });
  }
};
