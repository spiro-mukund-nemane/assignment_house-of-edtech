import { auth } from '@/lib/auth/auth';
import { AppError } from '@/lib/errors';

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new AppError(401, 'You must be signed in to perform this action');
  }
  return session.user;
}
