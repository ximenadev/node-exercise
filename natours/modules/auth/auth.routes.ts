import { Router } from 'express';
import { signup } from './auth.controller';

const router = Router();

router.route('/signup').post(signup);

export default router;
