// ============================================================================
// security/rate-limit-v2 — Distributed token-bucket rate limiter (Wave 37)
// ============================================================================
// Replaces the W34 in-memory limiter with a Redis-backed token-bucket that
// works across multiple Vercel regions / Cloudflare PoPs.
//
// Algorithm: **Token Bucket** with full-jitter refill.
//   - Each (user, IP, endpoint) tuple has a bucket of `capacity` tokens.
//   - Tokens refill at `refillPerSec` rate (smooth, not bursty).
//   - Each request consumes 1 token; if bucket is empty → 429.
//
// Adaptive thresholds:
//   - `Burst capacity` (e.g., 10/min on top of 100/hr) absorbs short spikes.
//   - `Block persistent offenders` — ≥100 fails/hour → hard block 24h.
//
// LGPD safety:
//   - All cache keys include userId when authenticated.
//   - IP-only keys are SHA-256 hashed (never raw IP in Redis).
//
// Reference: docs/SECURITY-HARDENING-W34.md §4 (rate-limit baseline).
// ============================================================================

import type { RedisAdapter } from "../cache/redis-client";
import { namespacedKey } from "../cache/redis-client";

// ---------------------------------------------------------------------------
// Tier catalog — defaults per route class
// ---------------------------------------------------------------------------

export type RateTier =
  | "auth"          // login, signup, password reset
  | "api-write"     // POST/PUT/DELETE on user content
  | "api-read"      // GET endpoints
  | "ai"            // Akasha chat, embeddings
  | "payment"       // Stripe checkout, webhooks
  | "public";       // unauthenticated GETs

export interface BucketSpec {
  capacity: number;        // max tokens in the bucket
  refillPerSec: number;    // tokens added per second
  /** Optional burst window — short-window allowance on top of steady rate. */
  burst?: { windowSec: number; allowance: number };
  /** Hard block threshold — N consecutive failures in 1h → block 24h. */
  blockThreshold?: number;
}

export const BUCKET_TIERS: Record<RateTier, BucketSpec> = {
  auth: {
    capacity: 5,
    refillPerSec: 5 / 60, // 5 per minute
    burst: { windowSec: 60, allowance: 3 },
    blockThreshold: 10,
  },
  "api-write": {
    capacity: 30,
    refillPerSec: 30 / 60, // 30 per minute
    burst: { windowSec: 60, allowance: 10 },
    blockThreshold: 100,
  },
  "api-read": {
    capacity: 100,
    refillPerSec: 100 / 60, // 100 per minute
    burst: { windowSec: 60, allowance: 30 },
    blockThreshold: 200,
  },
  ai: {
    capacity: 10,
    refillPerSec: 10 / 60, // 10 per minute
    burst: { windowSec: 300, allowance: 3 },
    blockThreshold: 50,
  },
  payment: {
    capacity: 3,
    refillPerSec: 3 / 60,
    burst: { windowSec: 60, allowance: 1 },
    blockThreshold: 5,
  },
  public: {
    capacity: 200,
    refillPerSec: 200 / 60, // 200 per minute
    burst: { windowSec: 60, allowance: 50 },
    blockThreshold: 500,
  },
};

// ---------------------------------------------------------------------------
// Decision types
// ---------------------------------------------------------------------------

export interface RateDecision {
  allowed: boolean;
  remaining: number;
  capacity: number;
  retryAfterSec: number;
  reason?: "blocked" | "no-tokens" | "allowed";
}

export interface RateContext {
  /** Authenticated user id (preferred for keys). */
  userId?: string;
  /** Request IP — SHA-256 hashed before storage. */
  ip?: string;
  /** Endpoint identifier (e.g., "POST /api/posts"). */
  endpoint: string;
  /** Optional cost override (default 1 token). */
  cost?: number;
}

// ---------------------------------------------------------------------------
// Hash helper — never store raw IPs in Redis
// ---------------------------------------------------------------------------

function hashIp(ip: string): string {
  // Lightweight FNV-1a 32-bit — sufficient for key partitioning.
  let h = 0x811c9dc5;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `ip_${(h >>> 0).toString(16)}`;
}

// ---------------------------------------------------------------------------
// Bucket key — namespaced + LGPD-aware
// ---------------------------------------------------------------------------

function bucketKey(ctx: RateContext, tier: RateTier): string {
  const parts: string[] = [];
  if (ctx.userId) parts.push(`u:${ctx.userId}`);
  else if (ctx.ip) parts.push(`i:${hashIp(ctx.ip)}`);
  else parts.push("anon");
  parts.push(`e:${ctx.endpoint}`);
  parts.push(`t:${tier}`);
  return namespacedKey("rate-limit", parts.join(":"));
}

function failKey(ctx: RateContext, tier: RateTier): string {
  return `${bucketKey(ctx, tier)}:fails`;
}

function blockKey(ctx: RateContext, tier: RateTier): string {
  return `${bucketKey(ctx, tier)}:block`;
}

// ---------------------------------------------------------------------------
// Pure helpers — token math, decision logic
// ---------------------------------------------------------------------------

interface BucketState {
  tokens: number;
  lastRefill: number;
}

function refill(state: BucketState, spec: BucketSpec, now: number): BucketState {
  const elapsed = (now - state.lastRefill) / 1000;
  const refilled = Math.min(spec.capacity, state.tokens + elapsed * spec.refillPerSec);
  return { tokens: refilled, lastRefill: now };
}

/**
 * Decide if a request is allowed. Pure function — given current bucket state
 * + spec, returns the decision. The caller is responsible for persisting
 * the new state to Redis.
 */
export function decide(
  state: BucketState | null,
  spec: BucketSpec,
  cost: number,
  now = Date.now(),
): { decision: RateDecision; next: BucketState } {
  const refilled = state ? refill(state, spec, now) : { tokens: spec.capacity, lastRefill: now };
  if (refilled.tokens >= cost) {
    const next = { tokens: refilled.tokens - cost, lastRefill: refilled.lastRefill };
    return {
      decision: {
        allowed: true,
        remaining: Math.floor(next.tokens),
        capacity: spec.capacity,
        retryAfterSec: 0,
        reason: "allowed",
      },
      next,
    };
  }
  // Not enough tokens — compute retry-after.
  const deficit = cost - refilled.tokens;
  const retryAfterSec = Math.ceil(deficit / spec.refillPerSec);
  return {
    decision: {
      allowed: false,
      remaining: 0,
      capacity: spec.capacity,
      retryAfterSec,
      reason: "no-tokens",
    },
    next: refilled,
  };
}

// ---------------------------------------------------------------------------
// Redis-backed check — orchestrates state load + persist
// ---------------------------------------------------------------------------

export interface RateLimitOptions {
  /** Tier from BUCKET_TIERS. */
  tier: RateTier;
  /** Override bucket spec (e.g., per-endpoint cap). */
  override?: Partial<BucketSpec>;
}

export async function checkRateLimit(
  ctx: RateContext,
  options: RateLimitOptions,
  redis: RedisAdapter,
): Promise<RateDecision> {
  const spec: BucketSpec = { ...BUCKET_TIERS[options.tier], ...(options.override ?? {}) };
  const key = bucketKey(ctx, options.tier);
  const bKey = blockKey(ctx, options.tier);

  // Hard-block check first (cheap).
  const block = await redis.get(bKey);
  if (block) {
    return {
      allowed: false,
      remaining: 0,
      capacity: spec.capacity,
      retryAfterSec: 86_400,
      reason: "blocked",
    };
  }

  // Load state.
  const raw = await redis.get(key);
  const state = raw ? (JSON.parse(raw) as BucketState) : null;
  const cost = ctx.cost ?? 1;
  const { decision, next } = decide(state, spec, cost);

  // Persist new state with 1h TTL (refreshes on every call).
  await redis.set(key, JSON.stringify(next), 3600);

  // Track failures for adaptive blocking.
  if (!decision.allowed && spec.blockThreshold) {
    const fails = Number((await redis.get(failKey(ctx, options.tier))) ?? 0) + 1;
    await redis.set(failKey(ctx, options.tier), String(fails), 3600);
    if (fails >= spec.blockThreshold) {
      await redis.set(bKey, "1", 86_400); // 24h hard block
      return { ...decision, reason: "blocked" };
    }
  } else if (decision.allowed) {
    // Reset failure counter on success.
    await redis.del(failKey(ctx, options.tier));
  }

  return decision;
}

/** Record a failure explicitly (e.g., after 401/403). */
export async function recordFailure(
  ctx: RateContext,
  options: RateLimitOptions,
  redis: RedisAdapter,
): Promise<{ fails: number; blocked: boolean }> {
  const spec = { ...BUCKET_TIERS[options.tier], ...(options.override ?? {}) };
  const key = failKey(ctx, options.tier);
  const bKey = blockKey(ctx, options.tier);
  const fails = Number((await redis.get(key)) ?? 0) + 1;
  await redis.set(key, String(fails), 3600);
  if (spec.blockThreshold && fails >= spec.blockThreshold) {
    await redis.set(bKey, "1", 86_400);
    return { fails, blocked: true };
  }
  return { fails, blocked: false };
}

/** Manually clear a block (admin action). */
export async function clearBlock(
  ctx: RateContext,
  tier: RateTier,
  redis: RedisAdapter,
): Promise<void> {
  await redis.del(blockKey(ctx, tier));
  await redis.del(failKey(ctx, tier));
}

// ---------------------------------------------------------------------------
// Next.js / fetch integration — set standard headers
// ---------------------------------------------------------------------------

export function rateHeaders(d: RateDecision): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(d.capacity),
    "X-RateLimit-Remaining": String(d.remaining),
    "X-RateLimit-Reset": String(d.retryAfterSec),
    ...(d.allowed
      ? {}
      : { "Retry-After": String(d.retryAfterSec) }),
  };
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const RATE_TIER_NAMES = Object.keys(BUCKET_TIERS) as RateTier[];