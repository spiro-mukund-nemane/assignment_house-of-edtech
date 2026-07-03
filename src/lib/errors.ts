import { ZodError, flattenError } from 'zod';
import { errorResponse } from '@/utils/api-response';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Every controller funnels its catch block through here so API errors always
// come back in the same shape and never leak a stack trace to the client.
export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return errorResponse('Validation failed', 422, flattenError(error).fieldErrors);
  }

  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode);
  }

  console.error(error);
  return errorResponse('Something went wrong. Please try again.', 500);
}
