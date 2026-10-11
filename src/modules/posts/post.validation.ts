import { z } from 'zod';
import { objectId } from '../../common/utils/objectId';

export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(20_000),
});

export const updatePostSchema = createPostSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');

export const userIdParam = z.object({ userId: objectId });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
