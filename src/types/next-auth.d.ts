import type { DefaultSession } from 'next-auth';
import type { Role } from '@/constants/roles';

declare module 'next-auth' {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }
}

// next-auth/jwt re-exports its JWT type from @auth/core/jwt via `export *`,
// so augmenting next-auth/jwt directly doesn't merge — augment the source.
declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}
