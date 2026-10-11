import type { RequestHandler } from 'express';
import { User } from '../../modules/users/user.model';
import * as httpError from '../utils/httpError';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw httpError.unauthorized('Missing access token');
  }

  const payload = verifyAccessToken(header.slice(7));

  // Check the user still exists and use the current role from the DB,
  // so deleted users or demoted admins can't keep using an old token.
  const user = await User.findById(payload.sub).select('role +tokenVersion').lean();
  if (!user) {
    throw httpError.unauthorized('User no longer exists');
  }
  if (user.tokenVersion !== payload.tv) {
    throw httpError.unauthorized('Session expired, please log in again');
  }

  req.user = { id: String(user._id), role: user.role };
  next();
};
