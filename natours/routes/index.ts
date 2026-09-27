import { Router } from 'express';
import tourRouter from '../modules/tours/tours.routes';

const router = Router();

router.use('/tours', tourRouter);

export default router;
