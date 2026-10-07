import { Router } from 'express';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from './tours.controller';

const router = Router();

// router.param('id', checkID);
// router.route('/').get(getAllTours).post(checkBody, createTour);

router.route('/').get(getAllTours).post(createTour);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
