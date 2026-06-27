// ============================================================================
// POSTS RATE LIMITER — In-memory, 10 posts/min por usuário
// ============================================================================
// Limite focado em evitar spam de criação de post. Suficiente para o MVP;
// trocar por Redis/Upstash em produção (já temos ioredis instalado).
// ============================================================================

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export function checkPostRateLimit(
  userId: string,
  options: { maxRequests?: number; windowMs?: number } = {}
): RateLimitResult {
  const { maxRequests = 10, windowMs = 60_000 } = options;
  const now = Date.now();
  const key = `post:${userId}`;
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: windowMs,
    };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: bucket.resetAt - now,
    };
  }

  bucket.count++;
  return {
    allowed: true,
    remaining: maxRequests - bucket.count,
    resetIn: bucket.resetAt - now,
  };
}

// Limpeza periódica para evitar leak de memória
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
  // Permite que o processo encerre mesmo com o interval rodando
  if (typeof cleanup.unref === 'function') cleanup.unref();
}