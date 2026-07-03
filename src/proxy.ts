// Next.js 16 renamed the middleware file convention to "proxy"; the
// src/middleware/ folder (per the project's architecture) still holds the
// reusable guard functions this composes once the auth feature adds them.
export { auth as proxy } from '@/lib/auth/auth';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
