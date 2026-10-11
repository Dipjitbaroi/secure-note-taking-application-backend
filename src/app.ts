import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFound } from './common/middlewares/errorHandler';
import { connectDB } from './config/db';
import { env } from './config/env';
import routes from './routes';

const app = express();

// Behind Vercel's (or any) proxy: use X-Forwarded-For for the client IP,
// which the rate limiter relies on.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
