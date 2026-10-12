import { Router } from 'express';
import { protect, restrictTo } from '../auth/auth.middleware';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  updateReview,
} from './reviews.controller';
import { filterByTour } from './reviews.middleware';

const router = Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(filterByTour, getAllReviews)
  .post(restrictTo('user'), createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

export default router;
