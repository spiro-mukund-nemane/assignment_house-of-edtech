import { z } from 'zod';
import { ROLES } from '@/constants/roles';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email('Enter a valid email address').max(255).toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  role: z.enum([ROLES.OWNER, ROLES.EDITOR, ROLES.VIEWER] as const),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserRoleSchema = z.object({
  role: z.enum([ROLES.OWNER, ROLES.EDITOR, ROLES.VIEWER] as const),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
