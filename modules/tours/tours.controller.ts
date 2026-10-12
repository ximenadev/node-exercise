import Tour from './tours.model';
import { AppError, catchAsync, factory } from '../../utils';

const guidesPopulate = { path: 'guides', select: 'name photo role' };

const reviewsPopulate = {
  path: 'reviews',
  select: 'rating title review author createdAt',
  populate: { path: 'author', select: 'name photo' },
};

export const getAllTours = factory.getAllWithFeatures(Tour, {
  populate: guidesPopulate,
});
export const getTour = factory.getOne(Tour, {
  populate: [guidesPopulate, reviewsPopulate],
});
export const createTour = factory.createOne(Tour);
export const updateTour = factory.updateOne(Tour, { populate: guidesPopulate });
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
