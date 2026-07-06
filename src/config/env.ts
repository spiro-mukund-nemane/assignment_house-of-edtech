import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Either DATABASE_URL (a single connection string — what Neon/Vercel
    // provide) or the discrete DB_* vars (used for local development against
    // a plain local Postgres install) must be present.
    DATABASE_URL: z.url().optional(),
    DB_HOST: z.string().min(1).optional(),
    DB_PORT: z.coerce.number().int().positive().default(5432),
    DB_NAME: z.string().min(1).optional(),
    DB_USER: z.string().min(1).optional(),
    DB_PASSWORD: z.string().min(1).optional(),

    AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required for Auth.js'),
    NEXTAUTH_URL: z.url().optional(),

    // Optional until the Socket.IO server (a separate deploy) exists.
    SOCKET_SERVER_URL: z.url().optional(),
  })
  .refine((data) => data.DATABASE_URL ?? (data.DB_HOST && data.DB_NAME && data.DB_USER && data.DB_PASSWORD), {
    message: 'Set either DATABASE_URL, or all of DB_HOST/DB_NAME/DB_USER/DB_PASSWORD',
  });

// Parsed once at module load so a misconfigured environment fails at
// startup instead of surfacing as an obscure error mid-request.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', z.treeifyError(parsed.error));
  throw new Error('Invalid environment configuration. Check .env against .env.example.');
}

export const env = parsed.data;
