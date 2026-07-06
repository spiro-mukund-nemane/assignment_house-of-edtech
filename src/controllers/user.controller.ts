import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { requireRole } from '@/middleware/require-role';
import { handleApiError } from '@/lib/errors';
import { successResponse } from '@/utils/api-response';
import { createUserSchema, updateUserRoleSchema } from '@/validators/user.validator';
import { userService } from '@/services/user.service';
import { ROLES } from '@/constants/roles';

type RouteParams = { params: Promise<{ id: string }> };

export async function list() {
  try {
    const session = await auth();
    requireRole(session, [ROLES.OWNER]);
    const users = await userService.listUsers();
    return successResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function create(req: NextRequest) {
  try {
    const session = await auth();
    requireRole(session, [ROLES.OWNER]);
    const body = await req.json();
    const input = createUserSchema.parse(body);
    const user = await userService.createUser(input);
    return successResponse(user, 'User created', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateRole(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const requester = requireRole(session, [ROLES.OWNER]);
    const { id } = await params;
    const body = await req.json();
    const input = updateUserRoleSchema.parse(body);
    await userService.updateUserRole(id, requester.id, input);
    return successResponse(null, 'Role updated');
  } catch (error) {
    return handleApiError(error);
  }
}
