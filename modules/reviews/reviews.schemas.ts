import { z } from 'zod';
import { RATING_MAX, RATING_MIN } from './reviews.constants';

const RATING_RANGE_MESSAGE = `Rating must be between ${RATING_MIN} and ${RATING_MAX}`;

const requiredString = (field: string, message: string) =>
  z.string({
    error: issue =>
      issue.input === undefined ? message : `${field} must be a string`,
  });

export const createReviewSchema = z.object({
  rating: z
    .number({
      error: issue =>
        issue.input === undefined
          ? 'You must add a rating'
          : 'rating must be a number',
    })
    .min(RATING_MIN, RATING_RANGE_MESSAGE)
    .max(RATING_MAX, RATING_RANGE_MESSAGE),
  review: requiredString('review', 'You must write a review'),
  title: requiredString('title', 'A review must have a title'),
  tour: z
    .string({ error: 'tour must be a tour id' })
    .regex(/^[0-9a-fA-F]{24}$/, 'tour must be a tour id')
    .optional(),
});

export const updateReviewSchema = createReviewSchema
  .omit({ tour: true })
  .partial();
