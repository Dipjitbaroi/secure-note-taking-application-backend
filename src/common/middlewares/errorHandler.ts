import type { ErrorRequestHandler, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ZodError, z } from 'zod';
import { env } from '../../config/env';
import { ApiError } from '../utils/ApiError';

export const notFound: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    details = z.flattenError(err).fieldErrors;
  } else if (err instanceof jwt.TokenExpiredError) {
    status = 401;
    message = 'Token expired';
  } else if (err instanceof jwt.JsonWebTokenError) {
    status = 401;
    message = 'Invalid token';
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err?.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue ?? {}).join(', ') || 'Value'} already exists`;
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }

  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.NODE_ENV === 'development' && status === 500 ? { stack: err?.stack } : {}),
  });
};
