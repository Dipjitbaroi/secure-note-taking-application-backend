import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import type { Role } from '../types/role';

export interface TokenPayload {
  sub: string;
  role: Role;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
