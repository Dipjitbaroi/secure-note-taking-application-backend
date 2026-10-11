import type { Request, Response } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await authService.register(req.body) });
}

export async function login(req: Request, res: Response) {
  res.json({ success: true, data: await authService.login(req.body) });
}
