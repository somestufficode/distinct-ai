import { NextResponse } from 'next/server';

export function successResponse(data: any, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, message },
    { status }
  );
}

export function errorResponse(message: string, status = 500, error?: any) {
  console.error(`API Error: ${message}`, error);
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}

export function validationErrorResponse(errors: Record<string, string>) {
  return NextResponse.json(
    { success: false, message: 'Validation error', errors },
    { status: 400 }
  );
} 