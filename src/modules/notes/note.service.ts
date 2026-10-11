import * as httpError from '../../common/utils/httpError';
import { getSkip, paginated, type PaginationQuery } from '../../common/utils/pagination';
import type { Role } from '../../common/types/role';
import { Note } from './note.model';
import type { AllNotesQuery, CreateNoteInput, UpdateNoteInput } from './note.validation';

export async function createNote(ownerId: string, input: CreateNoteInput) {
  const note = await Note.create({ ...input, owner: ownerId });
  return note.toJSON();
}

export async function listMyNotes(ownerId: string, query: PaginationQuery) {
  const filter = { owner: ownerId };
  const [items, total] = await Promise.all([
    Note.find(filter).sort({ _id: -1 }).skip(getSkip(query)).limit(query.limit).lean(),
    Note.countDocuments(filter),
  ]);
  return paginated(items, total, query);
}

export async function listAllNotes({ owner, ...query }: AllNotesQuery) {
  const filter = owner ? { owner } : {};
  const [items, total] = await Promise.all([
    Note.find(filter)
      .sort({ _id: -1 })
      .skip(getSkip(query))
      .limit(query.limit)
      .populate('owner', 'name email')
      .lean(),
    owner ? Note.countDocuments(filter) : Note.estimatedDocumentCount(),
  ]);
  return paginated(items, total, query);
}

export async function getNote(id: string, requester: { id: string; role: Role }) {
  const note = await Note.findById(id).lean();
  // 404 rather than 403 so other users can't probe which note ids exist
  if (!note || (requester.role !== 'admin' && String(note.owner) !== requester.id)) {
    throw httpError.notFound('Note not found');
  }
  return note;
}

// Only the owner can change or delete a note — admins can view everyone's notes, not edit them.
export async function updateNote(id: string, ownerId: string, input: UpdateNoteInput) {
  const note = await Note.findOneAndUpdate({ _id: id, owner: ownerId }, input, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  if (!note) throw httpError.notFound('Note not found');
  return note;
}

export async function deleteNote(id: string, ownerId: string) {
  const note = await Note.findOneAndDelete({ _id: id, owner: ownerId }).lean();
  if (!note) throw httpError.notFound('Note not found');
}
