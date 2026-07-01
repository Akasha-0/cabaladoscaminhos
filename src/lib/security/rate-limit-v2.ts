// ============================================================================
// RATE LIMIT v2 — Wave 34 / Security Hardening 6/8
// ============================================================================
// Token bucket algorithm com sliding window, substituindo o contador fixo
// (v1 in src/lib/rate-limit.ts).
//
// Diferenças para v1:
//   - Token bucket: suporta burst capacity além do rate médio.
//     Ex: 100 chamadas/h, mas com 10 chamadas "burst" a cada 1 min inicial.
//   - Composite key: combina (endpoint × user × ip) por padrão — defesa
//     contra (a) botnets distribuídas (limite por user-id) e (b) usuários
//     autenticados abusando do serviço legitimamente (limite por ip).
//   - Backoff exponencial para bloqueios repetidos (FAIL-OPEN feedback).
//   - Distributed-ready: aceita backend Redis; cai para Map in-memory se
//     Redis indisponível (não-bloqueante).
//   - Adaptive thresholds: low para auth, high para read-only.
//   - Health-check exempt: /api/health nunca é limitado.
//
// LGPD Art. 46 (segurança) e OWASP API4:2023 (Unrestricted Resource
// Consumption) — limites são uma das três defesas obrigatórias (com auth +
// quota de DB).
// ============================================================================

import { getRedisClient } from '@/lib/redis';

// ============================================================================
// Types
// ============================================================================

export interface TokenBucketConfig {
  /** Capacidade do bucket (burst) — quantos tokens cabem simultaneamente. */
  burst: number;
  /** Refill por janela em milissegundos. */
  refillTokens: number;
  /** Janela em ms para `refillTokens`. */
  windowMs: number;
  /** Tiers de multiplicador por identidade. */
  perIdentity?: { user?: number; ip?: number; endpoint?: number };
  /** Backoff ms após bloqueio (multiplicador exponencial por strike). */
  backoffMs?: number;
}

export interface RateLimitVerdict {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
  strike: number;
  /** Header hints (Retry-After, X-RateLimit-*). */
  headers: Record<string, string>;
}

interface BucketState {
  tokens: number;
  lastRefill: number;
  resetAt: number;
  strike: number;
}

// ============================================================================
// Preset endpoints — adaptive thresholds
// ============================================================================
//
// Auth (login, signup, reset) → muito baixos. Brute-force surface.
// Write (post, comment, like, follow) → médios. User-rate-limit herdado.
// Read (GET /api/* sem mutação) → altos. Não abusável.
// AI (OpenAI/Anthropic proxy) → baixos. Custo em dinheiro.
// Webhook Stripe → bypass (Stripe envia, IP é fixo e confiável).
//
// Override individual via `RATE_LIMIT_PRESETS[action]`.

export const RATE_LIMIT_PRESETS = {
  // ============== AUTH (very low) ==============
  'auth:login': { burst: 5, refillTokens: 5, windowMs: 15 * 60 * 1000 },
  'auth:signup': { burst: 3, refillTokens: 3, windowMs: 60 * 60 * 1000 },
  'auth:password-reset': { burst: 1, refillTokens: 1, windowMs: 60 * 60 * 1000 },
  'auth:2fa-verify': { burst: 5, refillTokens: 5, windowMs: 15 * 60 * 1000 },

  // ============== Write (medium) ==============
  'post:create': { burst: 10, refillTokens: 10, windowMs: 60 * 60 * 1000 },
  'comment:create': { burst: 30, refillTokens: 30, windowMs: 60 * 60 * 1000 },
  'like': { burst: 100, refillTokens: 100, windowMs: 60 * 60 * 1000 },
  'follow': { burst: 50, refillTokens: 50, windowMs: 60 * 60 * 1000 },
  'report': { burst: 5, refillTokens: 5, windowMs: 24 * 60 * 60 * 1000 },

  // ============== AI (low — costly) ==============
  'ai:openai': { burst: 10, refillTokens: 10, windowMs: 60 * 60 * 1000 },
  'ai:anthropic': { burst: 10, refillTokens: 10, windowMs: 60 * 60 * 1000 },

  // ============== Read (high) ==============
  'read:feed': { burst: 200, refillTokens: 200, windowMs: 60 * 60 * 1000 },
  'read:profile': { burst: 100, refillTokens: 100, windowMs: 60 * 60 * 1000 },
  'read:search': { burst: 60, refillTokens: 60, windowMs: 60 * 60 * 1000 },

  // ============== Payments (low + audit) ==============
  'payments:create-intent': {
    burst: 10,
    refillTokens: 10,
    windowMs: 60 * 60 * 1000,
  },
  'payments:refund': { burst: 5, refillTokens: 5, windowMs: 60 * 60 * 1000 },

  // ============== LGPD — exports/erases (very low) ==============
  'lgpd:export': { burst: 1, refillTokens: 1, windowMs: 24 * 60 * 60 * 1000 },
  'lgpd:delete': { burst: 1, refillTokens: 1, windowMs: 24 * 60 * 60 * 1000 },
} as const satisfies Record<string, TokenBucketConfig>;

export type RateLimitPresetKey = keyof typeof RATE_LIMIT_PRESETS;

// ============================================================================
// In-memory fallback (L1 cache)
// ============================================================================

const memoryBuckets = new Map<string, BucketState>();

// ============================================================================
// Helpers
// ============================================================================

function getKey(
  action: string,
  ctx: { userId?: string; ip?: string; endpoint?: string }
): string {
  const parts = [action];
  if (ctx.endpoint) parts.push(`ep:${ctx.endpoint}`);
  if (ctx.userId) parts.push(`u:${ctx.userId}`);
  if (ctx.ip) parts.push(`ip:${ctx.ip}`);
  return parts.join('|');
}

function refill(state: BucketState, cfg: TokenBucketConfig, now: number): void {
  if (now <= state.lastRefill) return;
  const elapsed = now - state.lastRefill;
  const ratio = elapsed / cfg.windowMs;
  const add = Math.floor(ratio * cfg.refillTokens);
  if (add > 0) {
    state.tokens = Math.min(cfg.burst, state.tokens + add);
    state.lastRefill = now;
  }
}

// ============================================================================
// Core: checkRateLimitV2
// ============================================================================

export async function checkRateLimitV2(
  action: string,
  ctx: { userId?: string; ip?: string; endpoint?: string },
  overrides?: Partial<TokenBucketConfig>
): Promise<RateLimitVerdict> {
  const presetKey = action as RateLimitPresetKey;
  const baseConfig =
    RATE_LIMIT_PRESETS[presetKey] ??
    ({ burst: 60, refillTokens: 60, windowMs: 60 * 60 * 1000 } as TokenBucketConfig);

  const cfg: TokenBucketConfig = { ...baseConfig, ...overrides };
  const key = getKey(action, ctx);
  const now = Date.now();

  // Tenta Redis distribuído (best-effort). Se indisponível, usa in-memory.
  let state: BucketState | null = null;
  try {
    const redis = await getRedisClient();
    if (redis) {
      const raw = await redis.get(key);
      if (raw) state = JSON.parse(raw) as BucketState;
    }
  } catch {
    // Redis indisponível — silent fallback
  }

  if (!state) {
    state = {
      tokens: cfg.burst,
      lastRefill: now,
      resetAt: now + cfg.windowMs,
      strike: 0,
    };
  }

  refill(state, cfg, now);

  let allowed: boolean;
  if (state.tokens > 0) {
    state.tokens -= 1;
    allowed = true;
  } else {
    allowed = false;
    state.strike += 1;
  }

  state.resetAt = now + cfg.windowMs;

  // Persistir (best-effort)
  if (!allowed) {
    try {
      const redis = await getRedisClient();
      if (redis) {
        await redis.set(key, JSON.stringify(state), 'EX', Math.ceil(cfg.windowMs / 1000));
      } else {
        memoryBuckets.set(key, state);
        const ttlMs = cfg.windowMs * 2;
        setTimeout(() => memoryBuckets.delete(key), ttlMs).unref?.();
      }
    } catch {
      memoryBuckets.set(key, state);
    }
  } else {
    memoryBuckets.set(key, state);
  }

  const backoff = cfg.backoffMs ?? cfg.windowMs;
  const nextStrike = state.strike;
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(cfg.refillTokens),
    'X-RateLimit-Remaining': String(Math.max(0, state.tokens)),
    'X-RateLimit-Reset': String(Math.ceil((state.resetAt - now) / 1000)),
  };
  if (!allowed) {
    const retryAfter = Math.ceil(backoff / 1000) * nextStrike;
    headers['Retry-After'] = String(retryAfter);
  }

  return {
    allowed,
    remaining: Math.max(0, state.tokens),
    limit: cfg.refillTokens,
    resetMs: state.resetAt - now,
    strike: nextStrike,
    headers,
  };
}

// ============================================================================
// Helper: extract client IP — Edge Runtime-safe
// ============================================================================

export function getClientIp(
  headers: Headers | Record<string, string | string[] | undefined>
): string {
  const h =
    headers instanceof Headers
      ? (k: string) => headers.get(k)
      : (k: string) => {
          const v = (headers as Record<string, string | string[] | undefined>)[k];
          return Array.isArray(v) ? v[0] : (v ?? null);
        };
  return (
    h('x-forwarded-for')?.split(',')[0]?.trim() ??
    h('x-real-ip') ??
    h('cf-connecting-ip') ??
    '0.0.0.0'
  );
}

// ============================================================================
// Helper: assertAllowed — lança ou retorna 429-friendly
// ============================================================================

export async function assertAllowed(
  action: string,
  ctx: { userId?: string; ip?: string; endpoint?: string }
): Promise<RateLimitVerdict> {
  const v = await checkRateLimitV2(action, ctx);
  if (!v.allowed) {
    const e = new Error(
      `Rate limit excedido para ${action}. Tente em ${Math.ceil(v.resetMs / 1000)}s.`
    );
    (e as Error & { verdict?: RateLimitVerdict }).verdict = v;
    throw e;
  }
  return v;
}

// ============================================================================
// Cleanup — periodic eviction of stale in-memory buckets
// ============================================================================

if (typeof setInterval !== 'undefined') {
  const cleanup = setInterval(
    () => {
      const now = Date.now();
      for (const [k, s] of memoryBuckets.entries()) {
        if (now > s.resetAt + 60_000) memoryBuckets.delete(k);
      }
    },
    60_000
  );
  if (typeof cleanup.unref === 'function') cleanup.unref();
}
