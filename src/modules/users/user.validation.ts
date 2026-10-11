import { z } from 'zod';
import { ROLES } from '../../common/types/role';
import { paginationQuery } from '../../common/utils/pagination';

const interests = z
  .array(z.string().trim().toLowerCase().min(1).max(50))
  .max(20)
  .transform((list) => [...new Set(list)]);

export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().toLowerCase(),
  password,
  role: z.enum(ROLES).default('user'),
  interests: interests.default([]),
});

export const updateUserSchema = createUserSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    interests,
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');

export const interestGroupsQuery = paginationQuery.extend({
  interest: z.string().trim().toLowerCase().min(1).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type InterestGroupsQuery = z.infer<typeof interestGroupsQuery>;
