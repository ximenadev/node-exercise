import { Router } from 'express';
import tourRouter from '../modules/tours/tours.routes';
import authRouter from '../modules/auth/auth.routes';
import userRouter from '../modules/users/users.routes';
import reviewRouter from '../modules/reviews/reviews.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/tours', tourRouter);
router.use('/reviews', reviewRouter);

export default router;
