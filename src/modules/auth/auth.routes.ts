import { Router } from 'express';
import { authenticate } from '../../common/middlewares/authenticate';
import { authLimiter } from '../../common/middlewares/rateLimiter';
import { validate } from '../../common/middlewares/validate';
import * as authController from './auth.controller';
import { changePasswordSchema, loginSchema, registerSchema } from './auth.validation';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.patch(
  '/password',
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);

export default router;
