import type { Request, Response } from 'express';
import type { PaginationQuery } from '../../common/utils/pagination';
import * as userService from './user.service';
import type { InterestGroupsQuery } from './user.validation';

export async function getMe(req: Request, res: Response) {
  res.json({ success: true, data: await userService.getUserById(req.user!.id) });
}

export async function updateMe(req: Request, res: Response) {
  res.json({ success: true, data: await userService.updateUser(req.user!.id, req.body) });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await userService.createUser(req.body) });
}

export async function list(req: Request, res: Response) {
  const query = req.query as unknown as PaginationQuery;
  res.json({ success: true, data: await userService.listUsers(query) });
}

export async function getById(req: Request, res: Response) {
  res.json({ success: true, data: await userService.getUserById(req.params.id as string) });
}

export async function update(req: Request, res: Response) {
  const data = await userService.updateUser(req.params.id as string, req.body);
  res.json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  await userService.deleteUser(req.params.id as string, req.user!.id);
  res.status(204).end();
}

export async function groupByInterest(req: Request, res: Response) {
  const query = req.query as unknown as InterestGroupsQuery;
  res.json({ success: true, data: await userService.groupUsersByInterest(query) });
}
