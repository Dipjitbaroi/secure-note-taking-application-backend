import type { Request, Response } from 'express';
import type { PaginationQuery } from '../../common/utils/pagination';
import * as postService from './post.service';

export async function create(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await postService.createPost(req.user!.id, req.body) });
}

export async function list(req: Request, res: Response) {
  const query = req.query as unknown as PaginationQuery;
  res.json({ success: true, data: await postService.listPosts(query) });
}

export async function getById(req: Request, res: Response) {
  res.json({ success: true, data: await postService.getPost(req.params.id as string) });
}

export async function listByUser(req: Request, res: Response) {
  const query = req.query as unknown as PaginationQuery;
  const data = await postService.getPostsByUser(req.params.userId as string, query);
  res.json({ success: true, data });
}

export async function update(req: Request, res: Response) {
  const data = await postService.updatePost(req.params.id as string, req.user!.id, req.body);
  res.json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  await postService.deletePost(req.params.id as string, req.user!);
  res.status(204).end();
}
