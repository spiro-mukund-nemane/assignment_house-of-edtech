import { NextResponse } from 'next/server';

interface ApiResponseBody<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
}

export function successResponse<T>(data: T, message = 'Success', status = 200) {
  return NextResponse.json<ApiResponseBody<T>>({ success: true, message, data, errors: null }, { status });
}

export function errorResponse(
  message: string,
  status = 400,
  errors: Record<string, string[]> | null = null,
) {
  return NextResponse.json<ApiResponseBody<null>>({ success: false, message, data: null, errors }, { status });
}
