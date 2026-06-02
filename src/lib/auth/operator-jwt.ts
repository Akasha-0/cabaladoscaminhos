// src/lib/auth/operator-jwt.ts
// Helpers de JWT para a sessão do Operator — Fase 8 + Fase 15 (refresh).
//
// Estratégia de token (Fase 15):
//   - ACCESS token: 15min, cookie httpOnly 'cockpit_session'
//   - REFRESH token: 30d, cookie httpOnly 'cockpit_refresh'
//   - Payload: { sub, role, type: 'access' | 'refresh' }
//
// Renovar = POST /api/operator/auth/refresh com o cookie de refresh.
// Rotação: cada refresh emite novo access E novo refresh; revoga o anterior.
// Detecção de reuso: refresh revogado usado → revoga TODAS as sessões
// do operator (sinal de roubo).
//
// Por que dois cookies separados? Isolamento de superfície de ataque:
//   - Cookie de access é enviado em toda request → risco XSS maior
//     (mitigado por httpOnly + sameSite=lax)
//   - Cookie de refresh só vai no endpoint /refresh → 99% do tempo fica
//     "parado". Se XSS, atacante só consegue refresh uma vez antes da
//     rotação detectar reuso e revogar tudo.

import jwt from 'jsonwebtoken';

// ============================================================================
// Constantes
// ============================================================================

/** Cookie do access token (curta duração, 15min). */
export const OPERATOR_TOKEN_COOKIE = 'cockpit_session';
/** Cookie do refresh token (longa duração, 30d). */
export const OPERATOR_REFRESH_COOKIE = 'cockpit_refresh';

/** TTL do access token: 15 minutos. */
export const OPERATOR_ACCESS_TTL_SECONDS = 15 * 60;
/** TTL do refresh token: 30 dias. */
export const OPERATOR_REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * @deprecated Mantido só para retrocompat com Fase 13 (cleanupExpiredSessions
 * e testes antigos). Em código novo, use `OPERATOR_ACCESS_TTL_SECONDS`.
 */
export const OPERATOR_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const OPERATOR_ACCESS_TTL_DESCRIPTION = '15m';
const OPERATOR_REFRESH_TTL_DESCRIPTION = '30d';

// ============================================================================
// Cookie helpers
// ============================================================================

function cookieOptions(opts: { maxAge: number }): Record<string, unknown> {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: opts.maxAge,
  };
}

function clearCookieOptions(): Record<string, unknown> {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  };
}

// ============================================================================
// Tipos
// ============================================================================

export type OperatorTokenType = 'access' | 'refresh';

export interface OperatorTokenPayload {
  /** Operator ID (= JWT `sub`). */
  sub: string;
  /** 'OPERATOR' | 'ADMIN' — embutido para checagem rápida sem DB. */
  role: 'OPERATOR' | 'ADMIN';
  /** 'access' | 'refresh' — Fase 15: distingue os dois tipos. */
  type: OperatorTokenType;
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
 * Assina um ACCESS token (curta duração, 15min).
 * Use em login + após cada refresh bem-sucedido.
 */
export function signOperatorAccessToken(operator: {
  id: string;
  role: 'OPERATOR' | 'ADMIN';
}): string {
  const payload: OperatorTokenPayload = {
    sub: operator.id,
    role: operator.role,
    type: 'access',
  };
  return jwt.sign(payload, getSecret(), {
    algorithm: 'HS256',
    expiresIn: OPERATOR_ACCESS_TTL_SECONDS,
  });
}

/**
 * Assina um REFRESH token (longa duração, 30d).
 * Use em login + após cada refresh bem-sucedido (rotação).
 */
export function signOperatorRefreshToken(operator: {
  id: string;
  role: 'OPERATOR' | 'ADMIN';
}): string {
  const payload: OperatorTokenPayload = {
    sub: operator.id,
    role: operator.role,
    type: 'refresh',
  };
  return jwt.sign(payload, getSecret(), {
    algorithm: 'HS256',
    expiresIn: OPERATOR_REFRESH_TTL_SECONDS,
  });
}

/**
 * @deprecated Mantido só para retrocompat com Fase 13 (criava token
 * genérico de 7d). Em código novo, use `signOperatorAccessToken` ou
 * `signOperatorRefreshToken`.
 */
export function signOperatorToken(operator: {
  id: string;
  role: 'OPERATOR' | 'ADMIN';
}): string {
  // Assina como access por padrão — preserva comportamento de Fase 13
  // (cookie cockpit_session, 7d). Migrar para 15min nas próximas fases.
  return signOperatorAccessToken(operator);
}

/**
 * Verifica um JWT e devolve o payload decodificado, ou `null` se inválido
 * (expirado, assinatura incorreta, malformado). NUNCA lança — sempre
 * retorna `null` em caso de falha para uso em guards.
 *
 * Se `expectedType` for passado, também checa o claim `type` — útil
 * em /me (só aceita access) e /refresh (só aceita refresh).
 */
export function verifyOperatorToken(
  token: string | null | undefined,
  expectedType?: OperatorTokenType
): OperatorTokenPayload | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
    if (typeof decoded !== 'object' || decoded === null) return null;
    const obj = decoded as Record<string, unknown>;
    if (typeof obj.sub !== 'string') return null;
    if (obj.role !== 'OPERATOR' && obj.role !== 'ADMIN') return null;
    // Fase 15: type claim é obrigatório. Tokens antigos sem type
    // (assinados em Fase 8/13) são rejeitados — Phase 14+ só emite
    // tokens com type. (Bcrypt bcrypt, etc — segurança > compat.)
    if (obj.type !== 'access' && obj.type !== 'refresh') return null;
    if (expectedType && obj.type !== expectedType) return null;
    return obj as OperatorTokenPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// Cookie helpers (NextResponse cookies API)
// ============================================================================

/**
 * Seta o cookie de access token no response (15min).
 */
export function setOperatorSessionCookie(
  response: { cookies: { set: (name: string, value: string, opts?: Record<string, unknown>) => void } },
  token: string
): void {
  response.cookies.set(OPERATOR_TOKEN_COOKIE, token, cookieOptions({ maxAge: OPERATOR_ACCESS_TTL_SECONDS }));
}

/**
 * Seta o cookie de refresh token no response (30d).
 */
export function setOperatorRefreshCookie(
  response: { cookies: { set: (name: string, value: string, opts?: Record<string, unknown>) => void } },
  token: string
): void {
  response.cookies.set(OPERATOR_REFRESH_COOKIE, token, cookieOptions({ maxAge: OPERATOR_REFRESH_TTL_SECONDS }));
}

/**
 * Limpa o cookie de access no response.
 */
export function clearOperatorSessionCookie(response: {
  cookies: { set: (name: string, value: string, opts?: Record<string, unknown>) => void };
}): void {
  response.cookies.set(OPERATOR_TOKEN_COOKIE, '', clearCookieOptions());
}

/**
 * Limpa o cookie de refresh no response.
 */
export function clearOperatorRefreshCookie(response: {
  cookies: { set: (name: string, value: string, opts?: Record<string, unknown>) => void };
}): void {
  response.cookies.set(OPERATOR_REFRESH_COOKIE, '', clearCookieOptions());
}

// Re-exports for back-compat
export { OPERATOR_ACCESS_TTL_SECONDS as OPERATOR_ACCESS_TTL };
export { OPERATOR_REFRESH_TTL_SECONDS as OPERATOR_REFRESH_TTL };
