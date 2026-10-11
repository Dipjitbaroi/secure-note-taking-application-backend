import type { RequestHandler } from 'express';
import type { Role } from '../types/role';
import * as httpError from '../utils/httpError';

export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw httpError.unauthorized();
    if (!roles.includes(req.user.role)) {
      throw httpError.forbidden('You do not have permission to do this');
    }
    next();
  };
