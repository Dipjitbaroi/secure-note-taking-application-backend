import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFound } from './common/middlewares/errorHandler';
import { env } from './config/env';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
