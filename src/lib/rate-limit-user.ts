// ============================================================================
// USER-BASED RATE LIMIT — Wave 11
// ============================================================================
// Complementa o `checkRateLimit` (que é por IP) com limites por usuário
// autenticado. A motivação é que o rate limit por IP é ineficaz quando:
//   - Múltiplos usuários compartilham IP (NAT, empresa, mobile carrier)
//   - Atacante usa botnet distribuída
//   - Usuário autenticado abusando do serviço legitimamente
//
// Limites definidos (Wave 11 — Caio):
//   - post-create:      10 / hora
//   - comment-create:   30 / hora
//   - like:            100 / hora
//   - follow:           50 / hora
//
// Trocar para Upstash Redis em produção (Wave 12 backlog — ver SECURITY-AUDIT F7).
// ============================================================================

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface UserRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  limit: number;
}

export type UserRateLimitAction =
  | 'post-create'
  | 'comment-create'
  | 'like'
  | 'follow';

const LIMITS: Record<UserRateLimitAction, { maxRequests: number; windowMs: number }> = {
  'post-create':    { maxRequests: 10,  windowMs: 60 * 60 * 1000 }, // 10/h
  'comment-create': { maxRequests: 30,  windowMs: 60 * 60 * 1000 }, // 30/h
  'like':           { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100/h
  'follow':         { maxRequests: 50,  windowMs: 60 * 60 * 1000 }, // 50/h
};

export function getRateLimitConfig(action: UserRateLimitAction) {
  return LIMITS[action];
}

/**
 * Verifica se um usuário pode executar `action`. Retorna `{ allowed, remaining, resetIn }`.
 * Use o `allowed === false` para responder 429 + headers `Retry-After`.
 *
 * @example
 *   const rl = checkUserRateLimit(viewer.id, 'post-create');
 *   if (!rl.allowed) return fail(429, ErrorCode.RATE_LIMIT_EXCEEDED, `...`);
 */
export function checkUserRateLimit(
  userId: string,
  action: UserRateLimitAction
): UserRateLimitResult {
  const { maxRequests, windowMs } = LIMITS[action];
  const now = Date.now();
  const key = `user:${action}:${userId}`;
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: windowMs,
      limit: maxRequests,
    };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: bucket.resetAt - now,
      limit: maxRequests,
    };
  }

  bucket.count++;
  return {
    allowed: true,
    remaining: maxRequests - bucket.count,
    resetIn: bucket.resetAt - now,
    limit: maxRequests,
  };
}

// ============================================================================
// Cleanup periódico (mesmo padrão de rate-limit.ts original)
// ============================================================================

if (typeof setInterval !== 'undefined') {
  const cleanup = setInterval(
    () => {
      const now = Date.now();
      for (const [k, b] of buckets.entries()) {
        if (now > b.resetAt) buckets.delete(k);
      }
    },
    5 * 60_000
  );
  if (typeof cleanup.unref === 'function') cleanup.unref();
}

// ============================================================================
// Helper de resposta — formato consistente com api.ts fail()
// ============================================================================

export function userRateLimitMessage(
  action: UserRateLimitAction,
  resetInMs: number
): string {
  const minutes = Math.ceil(resetInMs / 60_000);
  return `Limite de ${action} atingido. Tente novamente em ~${minutes} min.`;
}
