import { Router } from 'express';
import {
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTopTours,
  getTour,
  getTourStats,
  updateTour,
} from './tours.controller';
import { protect, restrictTo } from '../auth/auth.middleware';
import reviewRouter from '../reviews/reviews.routes';

const router = Router();

router.route('/').get(getAllTours).post(protect, createTour);

router.use(protect);

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(getTopTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(restrictTo('admin', 'lead-guide'), deleteTour);

export default router;
