// ============================================================================
// W72 Auth Pages — Server-side bootstrap helpers
// ----------------------------------------------------------------------------
// Initializes the w68 auth-session-engine HMAC secrets and shared user
// registry. Idempotent — safe to call from any API route.
//
// Engine init is required because the w68 session-engine / password-recovery
// store a single secret in module-scope state. Production swaps in env vars;
// for now we derive from a fallback so dev works out of the box.
// ============================================================================

import { setSessionHmacSecret } from '../auth/session-engine.ts';
import { setPasswordResetSecret } from '../auth/password-recovery.ts';
import { setOAuthStateSecret } from '../auth/oauth-callback.ts';

let _bootstrapped = false;

function deriveDevSecret(label: string): string {
  // Deterministic dev fallback. Production MUST set env var.
  const seed = `w72-dev-${label}-cabala-dos-caminhos-2026`;
  return seed;
}

export function bootstrapAuthEngines(force = false): void {
  if (_bootstrapped && !force) return;
  const sessionSecret =
    process.env.SESSION_HMAC_SECRET ?? deriveDevSecret('session');
  if (sessionSecret.length >= 16) setSessionHmacSecret(sessionSecret);
  const resetSecret =
    process.env.PASSWORD_RESET_SECRET ?? deriveDevSecret('reset');
  if (resetSecret.length >= 16) setPasswordResetSecret(resetSecret);
  const oauthSecret =
    process.env.OAUTH_STATE_SECRET ?? deriveDevSecret('oauth');
  if (oauthSecret.length >= 16) setOAuthStateSecret(oauthSecret);
  _bootstrapped = true;
}

// Email verification token store (in-memory). Production swaps for Prisma.
const _emailVerificationTokens = new Map<string, { userId: string; email: string; createdAt: number; consumedAt: number | null }>();
const _emailVerificationRate = new Map<string, number>(); // email -> last sent

export interface IssueEmailVerificationInput {
  readonly userId: string;
  readonly email: string;
  readonly ttlMs?: number;
}

export interface EmailVerificationRecord {
  readonly token: string;
  readonly userId: string;
  readonly email: string;
  readonly expiresAt: number;
}

function nextId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function issueEmailVerificationToken(input: IssueEmailVerificationInput): EmailVerificationRecord {
  const ttl = input.ttlMs ?? 1000 * 60 * 60 * 24; // 24h
  const id = nextId();
  const token = `evt_${id}`;
  const expiresAt = Date.now() + ttl;
  _emailVerificationTokens.set(id, {
    userId: input.userId,
    email: input.email,
    createdAt: Date.now(),
    consumedAt: null,
  });
  return { token, userId: input.userId, email: input.email, expiresAt };
}

export function consumeEmailVerificationToken(token: string): { ok: boolean; reason?: string; userId?: string; email?: string } {
  if (typeof token !== 'string' || !token.startsWith('evt_')) {
    return { ok: false, reason: 'format' };
  }
  const id = token.slice(4);
  const rec = _emailVerificationTokens.get(id);
  if (!rec) return { ok: false, reason: 'not_found' };
  if (rec.consumedAt) return { ok: false, reason: 'consumed' };
  rec.consumedAt = Date.now();
  return { ok: true, userId: rec.userId, email: rec.email };
}

export function rateLimitEmailVerification(email: string, windowMs: number = 60_000): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const last = _emailVerificationRate.get(email) ?? 0;
  if (now - last < windowMs) {
    return { allowed: false, retryAfterSeconds: Math.ceil((windowMs - (now - last)) / 1000) };
  }
  _emailVerificationRate.set(email, now);
  return { allowed: true, retryAfterSeconds: 0 };
}

export const __ALL_EXPORTS = {
  functions: [
    'bootstrapAuthEngines',
    'issueEmailVerificationToken',
    'consumeEmailVerificationToken',
    'rateLimitEmailVerification',
  ],
} as const;
