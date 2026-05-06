// lib/error-handler.ts
import { NextResponse } from 'next/server';
import { ApiError } from './apiError';

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message, statusCode: error.statusCode },
      { status: error.statusCode }
    );
  }

  console.error('Unhandled Error:', error);
  return NextResponse.json(
    { message: 'Internal Server Error', statusCode: 500 },
    { status: 500 }
  );
}