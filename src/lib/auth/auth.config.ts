import type { NextAuthConfig } from 'next-auth';
import { env } from '@/config/env';

// Proxy-safe base config — deliberately has no providers. src/proxy.ts is
// compiled as a separate bundle from route handlers/Server Components, and
// Next.js's serverExternalPackages setting (which lets sequelize/pg skip
// bundling) does not extend to that bundle. Importing the Credentials
// provider here (which needs bcrypt + Sequelize for authorize()) drags
// those into the proxy bundle and breaks it at runtime with
// "Please install pg package manually" — even though Proxy itself runs on
// the Node.js runtime. src/lib/auth/auth.ts adds the real provider on top
// of this for route handlers and Server Components.
export const authConfig = {
  secret: env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
