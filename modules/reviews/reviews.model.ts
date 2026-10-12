import mongoose, { type Types } from 'mongoose';
import '../users/users.model';
import Tour from '../tours/tours.model';
import { DEFAULT_RATINGS_AVERAGE } from '../tours/tours.constants';
import {
  RATING_MAX,
  RATING_MIN,
  REVIEW_MIN_LENGTH,
  REVIEW_TITLE_MAX_LENGTH,
} from './reviews.constants';

interface IReview {
  author: Types.ObjectId;
  createdAt: Date;
  rating: number;
  review: string;
  title: string;
  tour: Types.ObjectId;
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      required: [true, 'You must add a rating'],
      min: RATING_MIN,
      max: RATING_MAX,
    },
    review: {
      type: String,
      required: true,
      minLength: [
        REVIEW_MIN_LENGTH,
        `A review must have at least ${REVIEW_MIN_LENGTH} characters`,
      ],
    },
    title: {
      type: String,
      required: [true, 'A review must have a title'],
      trim: true,
      maxlength: [
        REVIEW_TITLE_MAX_LENGTH,
        `A review title must have less or equal than ${REVIEW_TITLE_MAX_LENGTH} characters`,
      ],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, author: 1 }, { unique: true });

const updateTourRatings = async (tourId: Types.ObjectId) => {
  const [stats] = await Review.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        quantity: { $sum: 1 },
        average: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.updateOne(
    { _id: tourId },
    stats
      ? {
          ratingsQuantity: stats.quantity,
          ratingsAverage: Math.round(stats.average * 10) / 10,
        }
      : { ratingsQuantity: 0, ratingsAverage: DEFAULT_RATINGS_AVERAGE },
    { timestamps: false },
  );
};

reviewSchema.post('save', async function (doc) {
  await updateTourRatings(doc.tour);
});

reviewSchema.post(/^findOneAnd/, async function (doc: IReview | null) {
  if (doc) await updateTourRatings(doc.tour);
});

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
