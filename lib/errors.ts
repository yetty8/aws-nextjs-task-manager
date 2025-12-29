// lib/errors.ts
import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  
  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message,
        ...(error.details && { details: error.details }) 
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
};