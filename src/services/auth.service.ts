import { AppError } from '@/lib/errors';
import { hashPassword, verifyPassword } from '@/lib/password';
import { userRepository } from '@/repositories/user.repository';
import { ROLES } from '@/constants/roles';
import type { User } from '@/models/user';
import type { SignupInput } from '@/validators/auth.validator';
import type { PublicUser } from '@/types/user';

function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export const authService = {
  async registerUser(input: SignupInput): Promise<PublicUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, 'An account with this email already exists');
    }

    // Self-signup gets the least-privileged role that can still create and
    // edit its own documents. Only an existing Owner can promote someone to
    // Owner, via the user-management screen — never automatically.
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: ROLES.EDITOR,
    });

    return toPublicUser(user);
  },

  async verifyCredentials(email: string, password: string): Promise<PublicUser | null> {
    const user = await userRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) return null;

    return toPublicUser(user);
  },
};
