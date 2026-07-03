import { AppError } from '@/lib/errors';
import type { Role } from '@/constants/roles';
import type { Session } from 'next-auth';

// Controllers call this to enforce role-based authorization on top of the
// session Auth.js already verified — never trust a role sent by the client.
export function requireRole(session: Session | null, allowedRoles: Role[]) {
  if (!session?.user) {
    throw new AppError(401, 'You must be signed in to perform this action');
  }

  if (!allowedRoles.includes(session.user.role)) {
    throw new AppError(403, 'You do not have permission to perform this action');
  }

  return session.user;
}
