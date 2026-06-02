// src/lib/auth/operator-jwt.ts
// Helpers de JWT para a sessão do Operator (Fase 8).
// Single-access-token, 7d de validade (Doc 04 §1, Fase 8).
//
// Estratégia de token:
//   - Payload: { sub: operatorId, role, iat, exp }
//   - Assinado com HS256 + JWT_SECRET (env, obrigatório em prod).
//   - Verificado a cada request via `verifyOperatorToken`.
//
// Renovar = login de novo (decisão Fase 8: trade-off simplicidade ×
// invalidação. Para invalidação imediata, lista de revogados no Redis
// pode entrar depois — out-of-scope agora).

import jwt from 'jsonwebtoken';

// ============================================================================
// Constantes
// ============================================================================

export const OPERATOR_TOKEN_COOKIE = 'cockpit_session';
export const OPERATOR_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias
export const OPERATOR_TOKEN_TTL_DESCRIPTION = '7d';

const COOKIE_OPTIONS_BASE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: OPERATOR_TOKEN_TTL_SECONDS,
};

/** `secure: true` em produção, `false` em dev — computado lazy p/ que
 * mudar NODE_ENV em runtime (ex.: testes) tenha efeito. */
function cookieOptions(opts: { maxAge?: number } = {}): Record<string, unknown> {
  return {
    ...COOKIE_OPTIONS_BASE,
    secure: process.env.NODE_ENV === 'production',
    maxAge: opts.maxAge ?? COOKIE_OPTIONS_BASE.maxAge,
  };
}

// ============================================================================
// Tipos
// ============================================================================

export interface OperatorTokenPayload {
  /** Operator ID (= JWT `sub`). */
  sub: string;
  /** 'OPERATOR' | 'ADMIN' — embutido para checagem rápida sem DB. */
  role: 'OPERATOR' | 'ADMIN';
  /** Issued-at (unix seconds). */
  iat?: number;
  /** Expiration (unix seconds). */
  exp?: number;
}

// ============================================================================
// Erros
// ============================================================================

/** Erro lançado quando o secret não está configurado (em prod). */
export class JwtSecretMissingError extends Error {
  constructor() {
    super(
      'JWT_SECRET não está configurado. Defina a env var antes de iniciar o servidor.'
    );
    this.name = 'JwtSecretMissingError';
  }
}

// ============================================================================
// Secret
// ============================================================================

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new JwtSecretMissingError();
    }
    // Em dev/test, usa um fallback MAS avisa (segurança: nunca vai pra prod).
    if (typeof console !== 'undefined') {
      console.warn(
        '[operator-jwt] JWT_SECRET ausente — usando fallback DEV ONLY. ' +
          'Defina JWT_SECRET antes de subir para produção.'
      );
    }
    return 'dev-only-fallback-secret-do-not-use-in-prod';
  }
  return secret;
}

// ============================================================================
// Sign / Verify
// ============================================================================

/**
 * Assina um JWT para o Operator.
 * Lança `JwtSecretMissingError` se `JWT_SECRET` ausente em produção.
 */
export function signOperatorToken(operator: {
  id: string;
  role: 'OPERATOR' | 'ADMIN';
}): string {
  const payload: OperatorTokenPayload = {
    sub: operator.id,
    role: operator.role,
  };
  return jwt.sign(payload, getSecret(), {
    algorithm: 'HS256',
    expiresIn: OPERATOR_TOKEN_TTL_SECONDS,
  });
}

/**
 * Verifica um JWT e devolve o payload decodificado, ou `null` se inválido
 * (expirado, assinatura incorreta, malformado). NUNCA lança — sempre
 * retorna `null` em caso de falha para uso em guards.
 */
export function verifyOperatorToken(token: string | null | undefined): OperatorTokenPayload | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
    if (typeof decoded !== 'object' || decoded === null) return null;
    if (typeof (decoded as Record<string, unknown>).sub !== 'string') return null;
    const role = (decoded as Record<string, unknown>).role;
    if (role !== 'OPERATOR' && role !== 'ADMIN') return null;
    return decoded as OperatorTokenPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// Cookie helpers (NextResponse cookies API)
// ============================================================================

/**
 * Seta o cookie de sessão no response. Use em NextResponse.
 */
export function setOperatorSessionCookie(
  response: { cookies: { set: (name: string, value: string, opts?: Record<string, unknown>) => void } },
  token: string
): void {
  response.cookies.set(OPERATOR_TOKEN_COOKIE, token, cookieOptions());
}

/**
 * Limpa o cookie de sessão no response.
 */
export function clearOperatorSessionCookie(response: {
  cookies: { set: (name: string, value: string, opts?: Record<string, unknown>) => void };
}): void {
  response.cookies.set(OPERATOR_TOKEN_COOKIE, '', cookieOptions({ maxAge: 0 }));
}
