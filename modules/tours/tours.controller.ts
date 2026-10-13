import Tour from './tours.model';
import { AppError, catchAsync, factory, validateBody } from '../../utils';
import {
  aliasTopTours,
  filterByLocation,
  setDistanceOrigin,
} from './tours.middleware';
import { createTourSchema, updateTourSchema } from './tours.schemas';
import { GEOJSON_POINT, METERS_TO, type DistanceUnit } from './tours.constants';

const guidesPopulate = { path: 'guides', select: 'name photo role' };

const reviewsPopulate = {
  path: 'reviews',
  select: 'rating title review author createdAt',
  populate: { path: 'author', select: 'name photo' },
};

export const getAllTours = [
  filterByLocation,
  factory.getAllWithFeatures(Tour, { populate: guidesPopulate }),
];
export const getTopTours = [aliasTopTours, ...getAllTours];
export const getTour = factory.getOne(Tour, {
  populate: [guidesPopulate, reviewsPopulate],
});
export const createTour = [
  validateBody(createTourSchema),
  factory.createOne(Tour),
];
export const updateTour = [
  validateBody(updateTourSchema),
  factory.updateOne(Tour, { populate: guidesPopulate }),
];
export const deleteTour = factory.deleteOne(Tour);

export const getTourStats = catchAsync(async (req, res, next) => {
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
});

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);

  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    return next(new AppError('Year must be a valid 4-digit number', 400));
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
});

export const getDistances = [
  setDistanceOrigin,
  catchAsync(async (req, res, next) => {
    const { center, unit } = res.locals as {
      center: { lat: number; lng: number };
      unit: DistanceUnit;
    };

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: { type: GEOJSON_POINT, coordinates: [center.lng, center.lat] },
          distanceField: 'distance',
          distanceMultiplier: METERS_TO[unit],
        },
      },
      {
        $project: { distance: { $round: ['$distance', 2] }, name: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      count: distances.length,
      data: {
        distances,
      },
    });
  }),
];
