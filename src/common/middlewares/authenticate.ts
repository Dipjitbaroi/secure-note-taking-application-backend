import type { RequestHandler } from 'express';
import { User } from '../../modules/users/user.model';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing access token');
  }

  const payload = verifyToken(header.slice(7));

  // Check the user still exists and use the current role from the DB,
  // so deleted users or demoted admins can't keep using an old token.
  const user = await User.findById(payload.sub).select('role').lean();
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  req.user = { id: String(user._id), role: user.role };
  next();
};
