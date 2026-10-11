import { z } from 'zod';
import { objectId } from '../../common/utils/objectId';
import { paginationQuery } from '../../common/utils/pagination';

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(20_000).default(''),
});

export const updateNoteSchema = createNoteSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');

export const allNotesQuery = paginationQuery.extend({
  owner: objectId.optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type AllNotesQuery = z.infer<typeof allNotesQuery>;
