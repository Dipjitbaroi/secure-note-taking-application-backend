import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

router.use('/auth', authRoutes);

export default router;
