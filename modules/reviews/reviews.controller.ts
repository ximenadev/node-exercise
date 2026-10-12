import { factory, validateBody } from '../../utils';
import Review from './reviews.model';
import { createReviewSchema, updateReviewSchema } from './reviews.schemas';
import { checkReviewOwnership, setTourAndAuthor } from './reviews.middleware';

export const getAllReviews = factory.getAllWithFeatures(Review);

export const createReview = [
  validateBody(createReviewSchema),
  setTourAndAuthor,
  factory.createOne(Review),
];

export const getReview = factory.getOne(Review);

export const updateReview = [
  checkReviewOwnership,
  validateBody(updateReviewSchema),
  factory.updateOne(Review),
];

export const deleteReview = [checkReviewOwnership, factory.deleteOne(Review)];
