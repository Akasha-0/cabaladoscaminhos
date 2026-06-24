import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

// ============================================================================
// Constantes
// ============================================================================

export const AKASHA_TOKEN_COOKIE = '__Host-akasha_session';
export const AKASHA_REFRESH_COOKIE = '__Host-akasha_refresh';

const AKASHA_TOKEN_ISSUER = 'akasha';
const AKASHA_TOKEN_AUDIENCE = 'akasha-portal';
const AKASHA_ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
const AKASHA_REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

/** Tamanho mínimo do JWT_SECRET (bytes). < 32 chars = HS256 fraco. */
const JWT_SECRET_MIN_LENGTH = 32;

// ============================================================================
// Tipos
// ============================================================================

export type AkashaTokenType = 'access' | 'refresh';

export interface AkashaTokenPayload {
  sub: string;
  email: string;
  type: AkashaTokenType;
  /** Presente apenas em refresh tokens — UUID único para identificação stateless. */
  jti?: string;
  iat?: number;
  exp?: number;
}

/** Erro lançado quando JWT_SECRET não está configurado. */
export class AkashaJwtSecretMissingError extends Error {
  constructor() {
    super('JWT_SECRET não está configurado. Defina a env var antes de iniciar o servidor.');
    this.name = 'AkashaJwtSecretMissingError';
  }
}

// ============================================================================
// Cookie helpers
// ============================================================================

function cookieOptions(opts: {
  maxAge: number;
  sameSite?: 'lax' | 'strict';
}): Record<string, unknown> {
  return {
    httpOnly: true,
    sameSite: (opts.sameSite ?? 'lax') as 'lax' | 'strict',
    path: '/',
    // __Host- prefix exige Secure: cookies Akasha são sempre HTTPS,
    // mesmo em dev (proxy local de TLS ou staging em https).
    secure: true,
    maxAge: opts.maxAge,
    priority: 'medium' as const,
  };
}

function clearCookieOptions(): Record<string, unknown> {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
    secure: true,
    maxAge: 0,
  };
}

// ============================================================================
// Secret
// ============================================================================

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < JWT_SECRET_MIN_LENGTH) {
    throw new AkashaJwtSecretMissingError();
  }
  return secret;
}

// ============================================================================
// Sign / Verify
// ============================================================================

export function signAkashaAccessToken(user: { id: string; email: string }): string {
  const payload: AkashaTokenPayload = { sub: user.id, email: user.email, type: 'access' };
  return jwt.sign(payload, getSecret(), {
    algorithm: 'HS256',
    expiresIn: AKASHA_ACCESS_TTL_SECONDS,
    issuer: AKASHA_TOKEN_ISSUER,
    audience: AKASHA_TOKEN_AUDIENCE,
  });
}

export function signAkashaRefreshToken(user: { id: string; email: string }): string {
  // jti = UUID único por token; permite detecção de reuso no futuro
  // sem necessidade de armazenar no DB (abordagem stateless).
  const payload: AkashaTokenPayload = {
    sub: user.id,
    email: user.email,
    type: 'refresh',
    jti: crypto.randomUUID(),
  };
  return jwt.sign(payload, getSecret(), {
    algorithm: 'HS256',
    expiresIn: AKASHA_REFRESH_TTL_SECONDS,
    issuer: AKASHA_TOKEN_ISSUER,
    audience: AKASHA_TOKEN_AUDIENCE,
  });
}

/**
 * Verifica um JWT e devolve o payload, ou `null` se inválido/expirado.
 * NUNCA lança — sempre retorna `null` em caso de falha.
 */
export function verifyAkashaToken(
  token: string | null | undefined,
  expectedType?: AkashaTokenType
): AkashaTokenPayload | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getSecret(), {
      algorithms: ['HS256'],
      issuer: AKASHA_TOKEN_ISSUER,
      audience: AKASHA_TOKEN_AUDIENCE,
    });
    if (typeof decoded !== 'object' || decoded === null) return null;
    const obj = decoded as Record<string, unknown>;
    if (typeof obj.sub !== 'string') return null;
    if (typeof obj.email !== 'string') return null;
    if (obj.type !== 'access' && obj.type !== 'refresh') return null;
    if (expectedType && obj.type !== expectedType) return null;
    return obj as unknown as AkashaTokenPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// Cookie setters / clearers (NextResponse cookies API)
// ============================================================================

type CookieResponse = {
  cookies: { set: (name: string, value: string, opts?: Record<string, unknown>) => void };
};

// NOTE: sameSite='lax' (not 'strict') is intentional.
// 'strict' prevents the browser from sending the cookie during 303/307 redirect
// navigations initiated by the server (e.g., auth refresh 303 redirect).
// Lax sends the cookie on top-level cross-origin navigations but blocks subrequests.
// The cookie is httpOnly (JS cannot read it) and the token is cryptographically
// signed — CSRF risk is minimal for an auth session cookie.
export function setAkashaSessionCookie(response: CookieResponse, token: string): void {
  response.cookies.set(
    AKASHA_TOKEN_COOKIE,
    token,
    cookieOptions({ maxAge: AKASHA_ACCESS_TTL_SECONDS, sameSite: 'lax' })
  );
}

export function setAkashaRefreshCookie(response: CookieResponse, token: string): void {
  // sameSite: 'lax' is intentional — refresh token must be sent with POST
  // redirect from Edge middleware to /auth/refresh on same origin.
  // Strict would block the redirect POST, breaking token refresh.
  response.cookies.set(
    AKASHA_REFRESH_COOKIE,
    token,
    cookieOptions({ maxAge: AKASHA_REFRESH_TTL_SECONDS, sameSite: 'lax' })
  );
}

export function clearAkashaSessionCookie(response: CookieResponse): void {
  response.cookies.set(AKASHA_TOKEN_COOKIE, '', clearCookieOptions());
}

export function clearAkashaRefreshCookie(response: CookieResponse): void {
  response.cookies.set(AKASHA_REFRESH_COOKIE, '', clearCookieOptions());
}
