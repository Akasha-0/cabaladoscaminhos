// ============================================================================
// API RESPONSE HELPERS — Envelope padronizado {data, error, meta}
// ============================================================================
// Mantém o shape consistente em todos endpoints. Use os helpers em vez de
// NextResponse.json cru.
// ============================================================================

import { NextResponse } from 'next/server';

export interface ApiSuccess<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId?: string;
    nextCursor?: string | null;
    total?: number;
    [key: string]: unknown;
  };
}

export interface ApiError {
  error: {
    code: number;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

export const ErrorCode = {
  BAD_REQUEST: 4000,
  UNAUTHORIZED: 4001,
  FORBIDDEN: 4003,
  NOT_FOUND: 4004,
  VALIDATION_ERROR: 4002,
  RATE_LIMIT_EXCEEDED: 4029,
  CONFLICT: 4009,
  INTERNAL_ERROR: 5000,
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export function ok<T>(
  data: T,
  init?: {
    status?: number;
    meta?: Record<string, unknown>;
    /**
     * Optional cache headers. Common patterns:
     *  - `{ sMaxage: 300, staleWhileRevalidate: 60 }` for edge-cached JSON
     *  - `{ private: true, maxAge: 0 }` for user-specific data
     *  - `{ noStore: true }` for sensitive mutations
     */
    cache?: {
      sMaxage?: number;
      maxAge?: number;
      staleWhileRevalidate?: number;
      private?: boolean;
      noStore?: boolean;
    };
  }
) {
  const meta: ApiSuccess<T>['meta'] = {
    timestamp: new Date().toISOString(),
    ...(init?.meta ?? {}),
  };
  const headers = buildCacheHeader(init?.cache);
  return NextResponse.json<ApiSuccess<T>>(
    { data, meta },
    { status: init?.status ?? 200, headers },
  );
}

/**
 * Build a `Cache-Control` header value from a typed options bag.
 * Defaults are conservative (no-store). Only declare what you mean.
 */
export function buildCacheHeader(opts?: {
  sMaxage?: number;
  maxAge?: number;
  staleWhileRevalidate?: number;
  private?: boolean;
  noStore?: boolean;
}): Record<string, string> {
  if (!opts) return { 'Cache-Control': 'no-store' };
  if (opts.noStore) return { 'Cache-Control': 'no-store' };
  const parts: string[] = [];
  if (opts.private) parts.push('private');
  else parts.push('public');
  if (typeof opts.maxAge === 'number') parts.push(`max-age=${opts.maxAge}`);
  if (typeof opts.sMaxage === 'number') parts.push(`s-maxage=${opts.sMaxage}`);
  if (typeof opts.staleWhileRevalidate === 'number')
    parts.push(`stale-while-revalidate=${opts.staleWhileRevalidate}`);
  return { 'Cache-Control': parts.join(', ') };
}

export function fail(
  status: number,
  code: ErrorCodeType,
  message: string,
  details?: unknown
) {
  return NextResponse.json<ApiError>(
    {
      error: { code, message, details },
      meta: { timestamp: new Date().toISOString() },
    },
    { status }
  );
}

export function fromZodError(error: unknown) {
  // Zod error tem .issues e .flatten()
  if (
    error &&
    typeof error === 'object' &&
    'issues' in (error as Record<string, unknown>)
  ) {
    const issues = (error as { issues: unknown }).issues;
    return fail(400, ErrorCode.VALIDATION_ERROR, 'Dados inválidos', { issues });
  }
  return fail(500, ErrorCode.INTERNAL_ERROR, 'Erro inesperado');
}

export function handleError(err: unknown, context?: string) {
  if (
    err &&
    typeof err === 'object' &&
    'name' in (err as Record<string, unknown>)
  ) {
    const e = err as { name?: string; message?: string; statusCode?: number };
    if (e.name === 'PostNotFoundError') {
      return fail(404, ErrorCode.NOT_FOUND, e.message ?? 'Post não encontrado');
    }
    if (e.name === 'PostForbiddenError') {
      return fail(403, ErrorCode.FORBIDDEN, e.message ?? 'Acesso negado');
    }
    if (e.name === 'ValidationError') {
      return fail(400, ErrorCode.VALIDATION_ERROR, e.message ?? 'Dados inválidos');
    }
    if (e.name === 'AuthError' || e.statusCode === 401) {
      return fail(401, ErrorCode.UNAUTHORIZED, e.message ?? 'Não autenticado');
    }
  }
  // Erro inesperado
  if (context) {
    console.error(`[community-api] erro inesperado (${context}):`, err);
  } else {
    console.error('[community-api] erro inesperado:', err);
  }
  return fail(500, ErrorCode.INTERNAL_ERROR, 'Erro interno do servidor');
}