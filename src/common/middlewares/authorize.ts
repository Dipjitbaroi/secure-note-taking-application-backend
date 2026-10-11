import type { RequestHandler } from 'express';
import type { Role } from '../types/role';
import { ApiError } from '../utils/ApiError';

export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to do this');
    }
    next();
  };
