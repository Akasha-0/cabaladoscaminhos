// ============================================================
// API ERROR HANDLER - CABALA DOS CAMINHOS
// ============================================================
// Standardized error handling for API routes.
//
// Clone group: 978fc990 (204 lines, 28 instances)
// Pattern: API route try-catch with error handling
// ============================================================

import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
export interface APIError {
  code?: string;
  message: string;
  status?: number;
}

/**
 * Handle API errors and return standardized NextResponse
 */
export function handleAPIError(
  error: unknown,
  options: {
    /** Custom message override */
    message?: string;
    /** Default status code (default: 500) */
    statusCode?: number;
    /** Include stack trace in development */
    includeStack?: boolean;
  } = {}
): NextResponse {
  const { message, statusCode = 500, includeStack = process.env.NODE_ENV === 'development' } = options;

  // Handle Zod validation errors
  if (isZodError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: message || 'Validation failed',
        details: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    );
  }

  // Handle known error types
  if (error instanceof Error) {
    const response: Record<string, unknown> = {
      success: false,
      error: message || error.message,
      code: 'INTERNAL_ERROR',
    };

    if (includeStack) {
      response.stack = error.stack;
    }

    return NextResponse.json(response, { status: statusCode });
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: message || 'Erro interno',
      code: 'UNKNOWN_ERROR',
    },
    { status: statusCode }
  );
}

function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'flatten' in error &&
    typeof (error as ZodError).flatten === 'function'
  );
}

function authError(message = 'Usuário não autenticado'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'AUTH_ERROR',
    },
    { status: 401 }
  );
}

function validationError(
  error: unknown,
  message = 'Dados inválidos'
): NextResponse {
  if (isZodError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        details: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'VALIDATION_ERROR',
    },
    { status: 400 }
  );
}

/**
 * Create not found error response
 */
function notFoundError(resource: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} não encontrado`,
      code: 'NOT_FOUND',
    },
    { status: 404 }
  );
}

function withErrorHandling<T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T,
  options?: Parameters<typeof handleAPIError>[1]
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error, options);
    }
  }) as T;
}
