import { z } from 'zod';
import { createUserSchema } from '../users/user.validation';

// Public sign-up always creates a normal user — role can't be chosen here.
export const registerSchema = createUserSchema.omit({ role: true });

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
