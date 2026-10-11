import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
