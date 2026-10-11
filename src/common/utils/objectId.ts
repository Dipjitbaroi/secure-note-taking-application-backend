import { isValidObjectId, Types } from 'mongoose';
import { z } from 'zod';

export const objectId = z.string().refine((v) => isValidObjectId(v), 'Invalid id');

export const idParam = z.object({ id: objectId });

export function toObjectId(id: string) {
  return new Types.ObjectId(id);
}
