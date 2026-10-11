import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError';

// Slows down password guessing and sign-up spam: 10 attempts per IP every 15 minutes.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'Too many attempts, please try again later'));
  },
});
