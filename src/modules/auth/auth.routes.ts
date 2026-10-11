import { Router } from 'express';
import { validate } from '../../common/middlewares/validate';
import * as authController from './auth.controller';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);

export default router;
