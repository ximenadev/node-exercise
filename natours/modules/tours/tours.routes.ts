import { Router } from 'express';
import {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
} from './tours.controller';

const router = Router();

// router.param('id', checkID);
// router.route('/').get(getAllTours).post(checkBody, createTour);

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
