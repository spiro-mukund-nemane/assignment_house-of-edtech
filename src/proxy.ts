// Next.js 16 renamed the middleware file convention to "proxy"; the
// src/middleware/ folder (per the project's architecture) still holds the
// reusable guard functions this composes once the auth feature adds them.
//
// Deliberately imports the proxy-safe base config (auth.config.ts), NOT
// '@/lib/auth/auth' — that file's Credentials provider pulls in bcrypt and
// Sequelize, which breaks this separately-compiled bundle at runtime with
// "Please install pg package manually" even though Proxy runs on the
// Node.js runtime. See auth.config.ts for the full explanation.
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

const proxyAuth = NextAuth(authConfig);

export const proxy = proxyAuth.auth;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
