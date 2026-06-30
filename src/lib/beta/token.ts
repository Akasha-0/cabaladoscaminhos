// ============================================================================
// BETA INVITE TOKENS — Wave 32 (2026-06-30)
// ============================================================================
// Geração e verificação de tokens canônicos para o sistema de convites beta.
//
// Modelo de segurança:
//   1. Token bruto = 32 bytes random (base64url, ~43 chars) + assinatura HMAC
//      → nunca persistido; só viaja no email e no cookie/URL de aceite
//   2. DB armazena apenas o hash HMAC (UNIQUE) — comprometer o DB não revela
//      tokens válidos
//   3. Validação: hash(token_bruto) === token_db → OK
//   4. Falha fechada: qualquer divergência retorna INVALID (sem detalhe)
//
// LGPD:
//   - token bruto é secret-like; nunca logar plaintext em produção
//   - logs só registram hash + 4 últimos chars (ex: "...aB3k") para debug
//
// Constantes de expiração (em dias) por onda:
//   - Wave 1 (founders):    14d (mais tempo para fechar indicações)
//   - Wave 2 (community):  10d
//   - Wave 3 (soft launch): 7d
// ============================================================================

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// ============================================================================
// Tipos
// ============================================================================

export interface TokenParts {
  /** Token bruto que vai no email + URL (43 chars base64url). */
  plaintext: string;
  /** Hash HMAC-SHA256 persistido no DB (64 chars hex). */
  hash: string;
}

export type TokenValidation =
  | { ok: true }
  | { ok: false; reason: 'invalid_format' | 'hash_mismatch' | 'tampered' };

// ============================================================================
// Config
// ============================================================================

/**
 * Chave HMAC. Em produção, defina BETA_INVITE_HMAC_KEY via env (>= 32 bytes).
 * Fallback dev: derivar uma chave estável a partir de outras envs já presentes
 * (não é secret real; só evita "undefined" em testes locais).
 */
function getHmacKey(): string {
  const envKey = process.env.BETA_INVITE_HMAC_KEY;
  if (envKey && envKey.length >= 32) return envKey;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'BETA_INVITE_HMAC_KEY ausente ou < 32 chars em produção. ' +
        'Defina via .env antes de iniciar convites beta.'
    );
  }
  // Dev fallback — derivado de outras envs para ser estável entre reloads
  return `dev-key:${process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) ?? 'cabala-dev-2026'}`;
}

/**
 * Expiração em dias por onda (Wave 32 spec — configurável por env override).
 */
export function getExpiresInDays(wave: 1 | 2 | 3): number {
  const envOverride = process.env.BETA_INVITE_EXPIRES_DAYS;
  if (envOverride) {
    const parsed = parseInt(envOverride, 10);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 90) return parsed;
  }
  switch (wave) {
    case 1:
      return 14;
    case 2:
      return 10;
    case 3:
      return 7;
    default:
      return 7;
  }
}

// ============================================================================
// Hash
// ============================================================================

/**
 * Assina o plaintext com HMAC-SHA256 e devolve hash hex (64 chars).
 */
function hmac(plaintext: string): string {
  return createHmac('sha256', getHmacKey()).update(plaintext).digest('hex');
}

// ============================================================================
// API pública
// ============================================================================

/**
 * Gera um par (plaintext, hash) para um novo convite.
 * Use o `plaintext` na URL /convite/[token] enviada por email; persista o
 * `hash` no DB (campo BetaInvite.token).
 */
export function generateInviteToken(): TokenParts {
  // 32 bytes → 43 chars base64url sem padding
  const random = randomBytes(32).toString('base64url');
  const plaintext = random;
  const hash = hmac(plaintext);
  return { plaintext, hash };
}

/**
 * Assina um plaintext arbitrário (uso em cookie de aceite, se necessário).
 */
export function signToken(plaintext: string): string {
  return hmac(plaintext);
}

/**
 * Valida um plaintext contra um hash armazenado. Usa comparação constant-time
 * para evitar timing attacks.
 */
export function validateInviteToken(
  plaintext: string,
  storedHash: string
): TokenValidation {
  if (!plaintext || !storedHash) return { ok: false, reason: 'invalid_format' };
  // base64url = [A-Za-z0-9_-]; aceita 32+ chars
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(plaintext)) {
    return { ok: false, reason: 'invalid_format' };
  }
  if (!/^[a-f0-9]{64}$/.test(storedHash)) {
    return { ok: false, reason: 'tampered' };
  }
  const computed = hmac(plaintext);
  // Mesma length antes de timingSafeEqual
  if (computed.length !== storedHash.length) {
    return { ok: false, reason: 'hash_mismatch' };
  }
  try {
    const ok = timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'));
    return ok ? { ok: true } : { ok: false, reason: 'hash_mismatch' };
  } catch {
    return { ok: false, reason: 'tampered' };
  }
}

/**
 * Hash determinístico do token plaintext para logging/analytics (LGPD-safe).
 * Não expõe o token mas permite correlação entre requests.
 */
export function tokenFingerprint(plaintext: string): string {
  return hmac(plaintext).slice(0, 12);
}

/**
 * Versão "display-only" para admin UI: mostra primeiros 4 + últimos 4 chars
 * do hash, suficiente para identificar sem expor.
 */
export function hashDisplay(hash: string): string {
  if (hash.length < 8) return '****';
  return `${hash.slice(0, 4)}…${hash.slice(-4)}`;
}