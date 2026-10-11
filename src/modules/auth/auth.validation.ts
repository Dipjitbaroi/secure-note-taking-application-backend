import { z } from 'zod';
import { createUserSchema, password } from '../users/user.validation';

// Public sign-up always creates a normal user — role can't be chosen here.
export const registerSchema = createUserSchema.omit({ role: true });

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: password,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  });

// For clients that can't use the cookie (Postman, mobile, another domain).
// The cookie still takes priority when both are present.
export const refreshTokenSchema = z
  .object({ refreshToken: z.string().min(1).optional() })
  .default({});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
