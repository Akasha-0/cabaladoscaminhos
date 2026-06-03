// ============================================================
// BASE API ROUTE HELPERS - CABALA DOS CAMINHOS
// ============================================================
// Standardized API route utilities with:
// - Request validation (Zod)
// - Rate limiting
// - Response helpers
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================
// ERROR CODES (duplicated from error-handling for standalone use)
// ============================================================

export const ErrorCode = {
  AUTH_UNAUTHORIZED: 1005,
  VALIDATION_ERROR: 2001,
  RESOURCE_NOT_FOUND: 3001,
  RATE_LIMIT_EXCEEDED: 4001,
  INTERNAL_ERROR: 5001,
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

// ============================================================
// VALIDATION HELPERS
// ============================================================

export interface ValidatedRequest<T> {
  data: T;
  error: { message: string; code: ErrorCodeType } | null;
}

/**
 * Parse and validate request body with Zod schema
 */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): ValidatedRequest<T> {
  const result = schema.safeParse(body);
  
  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      data: null as unknown as T,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: firstError?.message || 'Dados inválidos',
      },
    };
  }
  
  return { data: result.data, error: null };
}

/**
 * Parse and validate query parameters with Zod schema
 */
function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string>
): ValidatedRequest<T> {
  const result = schema.safeParse(params);
  
  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      data: null as unknown as T,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: firstError?.message || 'Parâmetros inválidos',
      },
    };
  }
  
  return { data: result.data, error: null };
}

// ============================================================
// RATE LIMITING
// ============================================================

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRequestRateLimit(
  request: NextRequest,
  options: {
    maxRequests?: number;
    windowMs?: number;
  } = {}
): RateLimitResult {
  const { maxRequests = 100, windowMs = 60000 } = options;
  
  const identifier = extractIp(request);
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
}

function extractIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ============================================================
// RESPONSE HELPERS
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCodeType;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export function successResponse<T>(
  data: T,
  options?: { meta?: Record<string, unknown> }
): { body: ApiResponse<T>; status: number; headers?: Record<string, string> } {
  return {
    body: {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...options?.meta,
      },
    },
    status: 200,
  };
}

export function errorResponse(
  error: { code: ErrorCodeType; message: string; statusCode?: number }
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: error.statusCode || 500 }
  );
}

// ============================================================
// AUTH HELPER (Basic version - extend as needed)
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
}

// fallow-ignore-next-line unused-type
export interface AuthResult {
  user: AuthUser | null;
  error: { code: ErrorCodeType; message: string } | null;
}

/**
 * Extract user from request (JWT or Supabase)
 */
async function getAuthUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Try to get from cookie (simplified - extend with actual JWT/Supabase validation)
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    
    if (!tokenMatch) {
      return { user: null, error: null }; // Not authenticated, but not an error
    }

    // For now, just return a placeholder - extend with actual auth validation
    // This should be replaced with proper JWT/Supabase validation
    return { user: null, error: null };
  } catch {
    return { user: null, error: null };
  }
}

// ============================================================
// REQUEST ID HELPER
// ============================================================

function getRequestId(request: NextRequest): string {
  return (
    request.headers.get('x-request-id') ||
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  );
}
