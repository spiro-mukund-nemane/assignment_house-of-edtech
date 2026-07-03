import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),

  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required for Auth.js'),
  NEXTAUTH_URL: z.url().optional(),

  SOCKET_SERVER_URL: z.url(),
});

// Parsed once at module load so a misconfigured environment fails at
// startup instead of surfacing as an obscure error mid-request.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', z.treeifyError(parsed.error));
  throw new Error('Invalid environment configuration. Check .env against .env.example.');
}

export const env = parsed.data;
