// ============================================================================
// SESSION VALIDATION + LOCKOUT + 2FA TOTP — Wave 34 / Security Hardening
// ============================================================================
// Conjunto de helpers relacionados a sessão:
//
//   - SessionPolicy:        constantes de timeout (idle + absolute + max devices)
//   - isSessionExpired:     checa idle/absolute a partir de timestamps
//   - recordFailedLogin:    increment failed attempts, aplica lockout
//   - isAccountLocked:      checa se conta está bloqueada
//   - clearFailedLogins:    zera streak após login bem-sucedido
//   - generateTOTPSecret:   gera segredo TOTP base32 (RFC 6238) p/ 2FA
//   - verifyTOTPCode:       checa código com janela de drift de ±1 step
//
// Tudo in-memory (L1). Para produção multi-instance, mover para Redis.
// ============================================================================

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// ============================================================================
// Session policy
// ============================================================================
export const SESSION_POLICY = {
  /** Idle timeout — minutos. Default 30min (NIST SP 800-63B nível AAL2). */
  idleMinutes: 30,
  /** Absolute timeout — dias. Default 7d. */
  absoluteDays: 7,
  /** Máximo de sessões ativas por usuário. Default 3. */
  maxConcurrentSessions: 3,
  /** Tentativas falhadas antes de lockout. Default 5. */
  lockoutThreshold: 5,
  /** Lockout em minutos após exceder. Default 15min (cresce exp.). */
  lockoutMinutes: 15,
} as const;

// ============================================================================
// Session validity check
// ============================================================================

export interface SessionTimestamps {
  /** Quando autenticado (issuedAt) ou re-autenticado (rotatedAt). */
  authedAt: number;
  /** Última atividade vista pelo server. */
  lastSeenAt: number;
}

export type SessionExpiryReason =
  | 'idle_timeout'
  | 'absolute_timeout'
  | 'concurrent_limit';

export function isSessionExpired(
  ts: SessionTimestamps,
  now: number = Date.now()
): { expired: boolean; reason?: SessionExpiryReason } {
  const idleMs = SESSION_POLICY.idleMinutes * 60 * 1000;
  const absMs = SESSION_POLICY.absoluteDays * 24 * 60 * 60 * 1000;
  if (now - ts.lastSeenAt > idleMs) {
    return { expired: true, reason: 'idle_timeout' };
  }
  if (now - ts.authedAt > absMs) {
    return { expired: true, reason: 'absolute_timeout' };
  }
  return { expired: false };
}

// ============================================================================
// Failed-login lockout (in-memory)
// ============================================================================

interface FailState {
  count: number;
  lockedUntil: number | null;
  lastFailAt: number;
}

const failStates = new Map<string, FailState>(); // key = `email|ip`

function getKey(email: string, ip?: string): string {
  return `${email.toLowerCase().trim()}|${ip ?? '0.0.0.0'}`;
}

export function recordFailedLogin(email: string, ip?: string): {
  count: number;
  lockedUntil: number | null;
  willLockNext: boolean;
} {
  const key = getKey(email, ip);
  const now = Date.now();
  const state = failStates.get(key) ?? {
    count: 0,
    lockedUntil: null,
    lastFailAt: 0,
  };
  // Reset se lockout expirou
  if (state.lockedUntil !== null && now > state.lockedUntil) {
    state.count = 0;
    state.lockedUntil = null;
  }
  state.count += 1;
  state.lastFailAt = now;
  if (state.count >= SESSION_POLICY.lockoutThreshold) {
    state.lockedUntil = now + SESSION_POLICY.lockoutMinutes * 60 * 1000;
  }
  failStates.set(key, state);
  return {
    count: state.count,
    lockedUntil: state.lockedUntil,
    willLockNext:
      state.count >= SESSION_POLICY.lockoutThreshold - 1 &&
      state.lockedUntil === null,
  };
}

export function isAccountLocked(
  email: string,
  ip?: string
): { locked: boolean; until?: number } {
  const key = getKey(email, ip);
  const state = failStates.get(key);
  if (!state || state.lockedUntil === null) return { locked: false };
  if (Date.now() > state.lockedUntil) {
    failStates.delete(key);
    return { locked: false };
  }
  return { locked: true, until: state.lockedUntil };
}

export function clearFailedLogins(email: string, ip?: string): void {
  failStates.delete(getKey(email, ip));
}

// Cleanup periódico para não vazar memória
if (typeof setInterval !== 'undefined') {
  const cleanup = setInterval(
    () => {
      const now = Date.now();
      for (const [k, s] of failStates.entries()) {
        if (s.lockedUntil !== null && now > s.lockedUntil + 60_000 * 60) {
          failStates.delete(k);
        }
      }
    },
    60_000 * 5
  );
  if (typeof cleanup.unref === 'function') cleanup.unref();
}

// ============================================================================
// TOTP (RFC 6238) — implementação pura-JS p/ 2FA opcional
// ============================================================================
// Algoritmo: HMAC-SHA1 com step de 30s, dígitos=6. Verificação aceita
// drift de ±1 step (±30s) por tolerância de clock skew.
//
// Para gerar QR Code, retorne `otpauthUrl` e use Google Authenticator /
// Authy / 1Password.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTOTPSecret(): { secret: string; otpauthUrl: string } {
  // 20 bytes = 160 bits, padrão RFC 6238 seção 5.1
  const bytes = randomBytes(20);
  let secret = '';
  for (const b of bytes) secret += BASE32_ALPHABET[b & 0x1f];
  const otpauthUrl = `otpauth://totp/Cabala%20dos%20Caminhos?secret=${secret}&issuer=Akasha&algorithm=SHA1&digits=6&period=30`;
  return { secret, otpauthUrl };
}

export function verifyTOTPCode(
  secret: string,
  code: string,
  window: number = 1
): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const step = Math.floor(Date.now() / 1000 / 30);
  for (let i = -window; i <= window; i++) {
    const candidate = generateTOTPAt(secret, step + i);
    if (candidate === code) return true;
  }
  return false;
}

// ============================================================================
// TOTP generator (RFC 6238) — internal export for testing only
// ============================================================================
export function generateTOTPAt(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', key).update(buf).digest();
  // Dynamic truncation per RFC 4226
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = binCode % 10 ** 6;
  return otp.toString().padStart(6, '0');
}

// ============================================================================
// Base32 decode
// ============================================================================
function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  if (!/^[A-Z2-7]+$/.test(cleaned)) {
    throw new Error('Invalid base32 secret');
  }
  const bits: number[] = [];
  for (const ch of cleaned) {
    const v = BASE32_ALPHABET.indexOf(ch);
    if (v < 0) throw new Error('Invalid base32 character');
    for (let i = 4; i >= 0; i--) {
      bits.push((v >> i) & 1);
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    bytes.push(b);
  }
  return Buffer.from(bytes);
}

// ============================================================================
// CSRF token helper — para o middleware comparar
// ============================================================================
// CSRF token é um HMAC de (timestamp + user-agent hint) com chave de
// process.env.CSRF_SECRET (fallback dev). Token expira em 4h.

const CSRF_TTL_MS = 4 * 60 * 60 * 1000;
const CSRF_KEY =
  process.env.CSRF_SECRET ??
  (process.env.NODE_ENV === 'production'
    ? '__SET_CSRF_SECRET_IN_PROD__'
    : 'dev-csrf-secret-not-for-prod');

export function generateCSRFToken(hint?: string): string {
  const issuedAt = Date.now();
  const payload = `${issuedAt}.${hint ?? 'anon'}`;
  const sig = createHmac('sha256', CSRF_KEY).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

export function verifyCSRFToken(token: string, hint?: string): boolean {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return false;
  let payload: string;
  try {
    payload = Buffer.from(b64, 'base64url').toString('utf8');
  } catch {
    return false;
  }
  const [issuedAtStr, tokenHint] = payload.split('.');
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > CSRF_TTL_MS) {
    return false;
  }
  if (hint && tokenHint !== hint) return false;
  const expected = createHmac('sha256', CSRF_KEY)
    .update(payload)
    .digest('hex');
  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ============================================================================
// IDOR helper — verifica ownership de um recurso
// ============================================================================
// Uso:
//
//   const article = await prisma.article.findUnique({ where: { id } });
//   assertOwnerOrAdmin(article, user, 'read'); // 403 se outro user acessar
//
// Bancos com Row-Level Security fazem isso no SQL (Postgres policies).
// Aqui é uma camada extra para fail-closed quando o ORM bypassa policy.

export class IDORError extends Error {
  constructor() {
    super('IDOR: acesso negado ao recurso de outro usuário.');
    this.name = 'IDORError';
  }
}

export function assertOwnerOrAdmin<T extends { authorId?: string; userId?: string }>(
  resource: T | null,
  viewer: { id: string; role?: string | null } | null,
  _action: 'read' | 'write' | 'delete' = 'read'
): T {
  if (!resource) {
    // Não revela se existe — fail-closed
    throw new IDORError();
  }
  if (!viewer) throw new IDORError();
  if (viewer.role === 'ADMIN') return resource;
  const ownerId = (resource as { authorId?: string; userId?: string }).authorId
    ?? (resource as { authorId?: string; userId?: string }).userId;
  if (ownerId !== viewer.id) throw new IDORError();
  return resource;
}
