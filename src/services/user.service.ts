import { AppError } from '@/lib/errors';
import { hashPassword } from '@/lib/password';
import { userRepository } from '@/repositories/user.repository';
import type { User } from '@/models/user';
import type { CreateUserInput, UpdateUserRoleInput } from '@/validators/user.validator';
import type { PublicUser } from '@/types/user';

function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export const userService = {
  async listUsers(): Promise<PublicUser[]> {
    const users = await userRepository.findAll();
    return users.map(toPublicUser);
  },

  async createUser(input: CreateUserInput): Promise<PublicUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, 'An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    return toPublicUser(user);
  },

  async updateUserRole(userId: string, requesterId: string, input: UpdateUserRoleInput): Promise<void> {
    if (userId === requesterId) {
      throw new AppError(400, 'You cannot change your own role');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await userRepository.updateRole(userId, input.role);
  },
};
