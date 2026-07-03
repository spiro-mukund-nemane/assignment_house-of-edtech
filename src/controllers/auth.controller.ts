import type { NextRequest } from 'next/server';
import { signupSchema } from '@/validators/auth.validator';
import { authService } from '@/services/auth.service';
import { successResponse } from '@/utils/api-response';
import { handleApiError } from '@/lib/errors';

export async function signup(req: NextRequest) {
  try {
    const body = await req.json();
    const input = signupSchema.parse(body);
    const user = await authService.registerUser(input);
    return successResponse(user, 'Account created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
