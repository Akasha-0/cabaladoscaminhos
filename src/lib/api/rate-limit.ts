// ============================================================================
// RATE LIMIT — Limitador in-memory por user/IP
// ============================================================================
// Estratégia simples em memória para esta sprint. Em produção multi-instância,
// migrar para Redis (já temos ioredis como dependência).
//
// Implementa um sliding window de 60s com limite configurável.
// ============================================================================

interface RateLimitEntry {
  /** Timestamps (ms) das últimas requisições */
  timestamps: number[];
}

/** Store global — persiste entre hot reloads no dev. */
const store: Map<string, RateLimitEntry> = (globalThis as unknown as {
  __rateLimitStore?: Map<string, RateLimitEntry>;
}).__rateLimitStore ?? new Map();

(globalThis as unknown as { __rateLimitStore?: Map<string, RateLimitEntry> }).__rateLimitStore = store;

/** Limpa entradas antigas periodicamente (proteção contra memory leak). */
const CLEANUP_INTERVAL_MS = 60_000;
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < 5 * 60_000);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS).unref?.();
}

export interface RateLimitConfig {
  /** Identificador único (ex.: `user:abc123`, `ip:1.2.3.4`) */
  key: string;
  /** Limite de requisições na janela */
  limit: number;
  /** Janela em ms (default 60_000 = 1 min) */
  windowMs?: number;
}

export interface RateLimitResult {
  /** Requisição permitida? */
  allowed: boolean;
  /** Requisições restantes na janela atual */
  remaining: number;
  /** Momento em que a janela reseta (ISO) */
  resetAt: Date;
}

/**
 * Verifica se uma requisição está dentro do limite.
 * Implementação sliding window — janela móvel, não fixa.
 */
export function checkRateLimit({ key, limit, windowMs = 60_000 }: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps fora da janela
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0]!;
    const resetAt = new Date(oldest + windowMs);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetAt: new Date(now + windowMs),
  };
}

/** Helper para extrair IP do request (best-effort). */
export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
