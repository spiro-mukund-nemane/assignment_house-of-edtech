import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { authService } from '@/services/auth.service';
import { loginSchema } from '@/validators/auth.validator';

// Full config for route handlers and Server Components — adds the
// Credentials provider (and therefore bcrypt + Sequelize) on top of the
// proxy-safe base config. Never import this file from src/proxy.ts.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await authService.verifyCredentials(parsed.data.email, parsed.data.password);
        return user;
      },
    }),
  ],
});
