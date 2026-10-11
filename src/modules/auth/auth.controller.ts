import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env';
import * as authService from './auth.service';

const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production' || env.COOKIE_SAME_SITE === 'none',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api/v1/auth',
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

function sendAuth(
  res: Response,
  status: number,
  { refreshToken, ...data }: { refreshToken: string; accessToken: string; user?: unknown },
) {
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  res.status(status).json({ success: true, data });
}

export async function register(req: Request, res: Response) {
  sendAuth(res, 201, await authService.register(req.body));
}

export async function login(req: Request, res: Response) {
  sendAuth(res, 200, await authService.login(req.body));
}

export async function refresh(req: Request, res: Response) {
  sendAuth(res, 200, await authService.refresh(req.cookies?.[REFRESH_COOKIE]));
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  const { maxAge: _maxAge, ...clearOptions } = refreshCookieOptions;
  res.clearCookie(REFRESH_COOKIE, clearOptions);
  res.status(204).end();
}

export async function changePassword(req: Request, res: Response) {
  sendAuth(res, 200, await authService.changePassword(req.user!.id, req.body));
}
