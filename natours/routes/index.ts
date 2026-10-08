import { Router } from 'express';
import tourRouter from '../modules/tours/tours.routes';
import authRouter from '../modules/auth/auth.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/tours', tourRouter);

export default router;
