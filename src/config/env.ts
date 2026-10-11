import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET should be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET should be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  // comma separated, e.g. "http://localhost:5173,https://my-app.vercel.app"
  CLIENT_URL: z
    .string()
    .default('http://localhost:5173')
    .transform((v) => v.split(',').map((url) => url.trim()).filter(Boolean)),
  // "none" is needed when the frontend is served from a different site than the API
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('strict'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
