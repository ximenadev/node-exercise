import mongoose, { type Query, type Types } from 'mongoose';
import '../users/users.model';

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
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      minLength: [20, 'A review must have at least 20 characters'],
    },
    title: {
      type: String,
      required: [true, 'A review must have a title'],
      trim: true,
      maxlength: [
        20,
        'A review title must have less or equal than 20 characters',
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

reviewSchema.pre(/^find/, function (this: Query<unknown, IReview>) {
  const projection = this.projection() ?? {};
  const pickedFields = Object.values(projection).some(value => value);
  if (!pickedFields || 'author' in projection) {
    this.populate({ path: 'author', select: 'name photo' });
  }
});

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
