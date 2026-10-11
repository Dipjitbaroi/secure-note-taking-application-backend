import type { Request, Response } from 'express';
import type { PaginationQuery } from '../../common/utils/pagination';
import * as noteService from './note.service';
import type { AllNotesQuery } from './note.validation';

export async function create(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await noteService.createNote(req.user!.id, req.body) });
}

export async function listMine(req: Request, res: Response) {
  const query = req.query as unknown as PaginationQuery;
  res.json({ success: true, data: await noteService.listMyNotes(req.user!.id, query) });
}

export async function listAll(req: Request, res: Response) {
  const query = req.query as unknown as AllNotesQuery;
  res.json({ success: true, data: await noteService.listAllNotes(query) });
}

export async function getById(req: Request, res: Response) {
  res.json({ success: true, data: await noteService.getNote(req.params.id as string, req.user!) });
}

export async function update(req: Request, res: Response) {
  const data = await noteService.updateNote(req.params.id as string, req.user!.id, req.body);
  res.json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  await noteService.deleteNote(req.params.id as string, req.user!.id);
  res.status(204).end();
}
