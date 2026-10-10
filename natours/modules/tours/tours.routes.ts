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
import { protect, restrictTo } from '../auth/auth.middleware';

const router = Router();

// router.param('id', checkID);
// router.route('/').get(getAllTours).post(checkBody, createTour);

router.use(protect);

router.route('/').get(getAllTours).post(createTour);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(restrictTo('admin', 'lead-guide'), deleteTour);

export default router;
