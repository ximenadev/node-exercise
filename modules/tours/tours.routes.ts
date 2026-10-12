import { Router } from 'express';
import {
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from './tours.controller';
import { aliasTopTours } from './tours.middleware';
import { createTourSchema, updateTourSchema } from './tours.schemas';
import { protect, restrictTo } from '../auth/auth.middleware';
import { validateBody } from '../../utils';
import reviewRouter from '../reviews/reviews.routes';

const router = Router();

// router.param('id', checkID);
// router.route('/').get(getAllTours).post(checkBody, createTour);

router.use(protect);

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(getAllTours)
  .post(validateBody(createTourSchema), createTour);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router
  .route('/:id')
  .get(getTour)
  .patch(validateBody(updateTourSchema), updateTour)
  .delete(restrictTo('admin', 'lead-guide'), deleteTour);

export default router;
