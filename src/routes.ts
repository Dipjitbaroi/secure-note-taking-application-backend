import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import noteRoutes from './modules/notes/note.routes';
import postRoutes from './modules/posts/post.routes';
import userRoutes from './modules/users/user.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notes', noteRoutes);
router.use('/posts', postRoutes);

export default router;
