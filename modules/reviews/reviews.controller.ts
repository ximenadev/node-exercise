import { factory, validateBody } from '../../utils';
import Review from './reviews.model';
import { createReviewSchema, updateReviewSchema } from './reviews.schemas';
import { checkReviewOwnership, setTourAndAuthor } from './reviews.middleware';

const authorPopulate = { path: 'author', select: 'name photo' };

export const getAllReviews = factory.getAllWithFeatures(Review, {
  populate: authorPopulate,
});

export const createReview = [
  validateBody(createReviewSchema),
  setTourAndAuthor,
  factory.createOne(Review),
];

export const getReview = factory.getOne(Review, { populate: authorPopulate });

export const updateReview = [
  checkReviewOwnership,
  validateBody(updateReviewSchema),
  factory.updateOne(Review, { populate: authorPopulate }),
];

export const deleteReview = [checkReviewOwnership, factory.deleteOne(Review)];
