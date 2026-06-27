// ============================================================================
// API HELPERS — Builders de resposta e validação Zod
// ============================================================================
// Funções utilitárias usadas por TODAS as rotas de API para garantir
// shape consistente e logging estruturado.
// ============================================================================

import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import type { ApiError, ApiMeta, ApiResponse } from './types';

/**
 * Gera um trace ID curto pra correlacionar logs.
 * Não é um UUID completo — só pra debug rápido.
 */
export function newTraceId(): string {
  return `ts_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Resposta de sucesso. */
export function ok<T>(data: T, meta?: ApiMeta, init?: ResponseInit): NextResponse {
  const body: ApiResponse<T> = { data, error: null, meta: meta ?? null };
  return NextResponse.json(body, { status: 200, ...init });
}

/** 201 Created. */
export function created<T>(data: T, meta?: ApiMeta): NextResponse {
  const body: ApiResponse<T> = { data, error: null, meta: meta ?? null };
  return NextResponse.json(body, { status: 201 });
}

/** 204 No Content — usado em DELETE/PATCH sem payload de retorno. */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/** Erro genérico com status customizado. */
export function err(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>,
): NextResponse {
  const error: ApiError = { code, message, ...(details ? { details } : {}) };
  const body: ApiResponse<null> = { data: null, error, meta: null };
  return NextResponse.json(body, { status });
}

/** 400 Bad Request — usado para erros de validação Zod ou input inválido. */
export function badRequest(message: string, details?: Record<string, unknown>): NextResponse {
  return err('BAD_REQUEST', message, 400, details);
}

/** 401 Unauthorized — usuário não autenticado. */
export function unauthorized(message = 'Autenticação necessária'): NextResponse {
  return err('UNAUTHORIZED', message, 401);
}

/** 403 Forbidden — autenticado mas sem permissão. */
export function forbidden(message = 'Sem permissão para esta ação'): NextResponse {
  return err('FORBIDDEN', message, 403);
}

/** 404 Not Found. */
export function notFound(message = 'Recurso não encontrado'): NextResponse {
  return err('NOT_FOUND', message, 404);
}

/** 409 Conflict — ex.: like duplicado. */
export function conflict(message: string): NextResponse {
  return err('CONFLICT', message, 409);
}

/** 422 Unprocessable Entity — semântica (diferente de validação de formato). */
export function unprocessable(message: string, details?: Record<string, unknown>): NextResponse {
  return err('UNPROCESSABLE', message, 422, details);
}

/** 429 Too Many Requests — rate limit estourado. */
export function tooManyRequests(
  message: string,
  resetAt: string,
  remaining: number,
): NextResponse {
  const body: ApiResponse<null> = {
    data: null,
    error: { code: 'RATE_LIMITED', message, details: { resetAt, remaining } },
    meta: null,
  };
  return NextResponse.json(body, {
    status: 429,
    headers: {
      'Retry-After': Math.max(0, Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000)).toString(),
      'X-RateLimit-Remaining': remaining.toString(),
    },
  });
}

/** 500 Internal Server Error — sempre loga o stack. */
export function internal(error: unknown, traceId?: string): NextResponse {
  const message = error instanceof Error ? error.message : 'Erro interno do servidor';
  // Log estruturado pra rastrear em produção
  // eslint-disable-next-line no-console
  console.error('[api]', { traceId, err: message, stack: error instanceof Error ? error.stack : undefined });
  return err('INTERNAL', 'Erro interno do servidor', 500, traceId ? { traceId } : undefined);
}

/**
 * Valida input com Zod. Retorna o dado validado ou uma resposta 400 pronta.
 *
 * @example
 *   const parsed = parseInput(schema, await request.json());
 *   if (parsed instanceof NextResponse) return parsed;
 *   // usar parsed.content, etc.
 */
export function parseInput<T>(
  schema: ZodSchema<T>,
  input: unknown,
): T | NextResponse {
  const result = schema.safeParse(input);
  if (!result.success) {
    return badRequest('Dados inválidos', {
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    });
  }
  return result.data;
}

/**
 * Helper pra parsear ZodError lançado manualmente.
 */
export function handleZodError(error: ZodError): NextResponse {
  return badRequest('Dados inválidos', {
    issues: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  });
}
