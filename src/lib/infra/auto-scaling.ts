// ============================================================================
// infra/auto-scaling — Auto-scaling policy matrix (Wave 37)
// ============================================================================
// Documents + programmatically models the auto-scaling posture for every
// stateful dependency of cabaladoscaminhos. The codebase runs on a hybrid
// serverless stack — Vercel (app) + Supabase (Postgres) + Upstash (Redis)
// + OpenAI (AI) + Stripe (payments) — and each layer has its own scaling
// knobs.
//
// Reference: docs/PERFORMANCE-PHASE-2-W36.md §10 (scaling posture).
// ============================================================================

// ---------------------------------------------------------------------------
// Vercel — serverless functions (app runtime)
// ---------------------------------------------------------------------------

export interface VercelScalingPolicy {
  /** Concurrent requests per lambda instance (concurrency knob). */
  concurrency: number;
  /** Memory allocation (MB). 1024 default; up to 3009 for Pro. */
  memoryMb: number;
  /** Max execution duration (s). 10 for Hobby, 60 for Pro, 900 for Enterprise. */
  maxDurationSec: number;
  /** Region preference — closest to user base. */
  preferredRegions: string[];
  /** Whether the function runs in Edge runtime (faster cold start, no Node APIs). */
  edge: boolean;
}

export const VERCEL_SCALING: VercelScalingPolicy = {
  concurrency: 1, // Vercel default; tune per function if needed
  memoryMb: 1024,
  maxDurationSec: 30, // Most API routes; long-running use Edge or worker
  preferredRegions: ["gru1", "iad1"],
  edge: false,
};

/** Stream-heavy routes (Akasha chat) — bump memory + duration. */
export const VERCEL_SCALING_AKASHA: VercelScalingPolicy = {
  concurrency: 1,
  memoryMb: 3009, // Pro max
  maxDurationSec: 60,
  preferredRegions: ["gru1", "iad1"],
  edge: false,
};

/** Edge runtime for geo-low-latency reads. */
export const VERCEL_SCALING_EDGE: VercelScalingPolicy = {
  concurrency: 50, // Edge supports higher concurrency
  memoryMb: 128,
  maxDurationSec: 30,
  preferredRegions: ["gru1", "iad1", "fra1"],
  edge: true,
};

// ---------------------------------------------------------------------------
// Supabase — Postgres + Storage
// ---------------------------------------------------------------------------

export interface SupabaseScalingPolicy {
  /** Tier reference — affects max_connections, IOPS, replicas. */
  tier: "free" | "pro" | "team" | "enterprise";
  /** Connection pool size (PgBouncer). */
  poolSize: number;
  /** Read replica enabled. */
  readReplica: boolean;
  /** Storage bucket — auto-scales but has quota per tier. */
  storageGbCap: number;
  /** Plan level — Pro adds connection pooler + PITR. */
  pointInTimeRecovery: boolean;
}

export const SUPABASE_SCALING: SupabaseScalingPolicy = {
  tier: "pro",
  poolSize: 20,
  readReplica: true,
  storageGbCap: 100,
  pointInTimeRecovery: true, // W34 DR requirement
};

/** Compute max_connections for a given tier. */
export function maxConnections(tier: SupabaseScalingPolicy["tier"]): number {
  switch (tier) {
    case "free": return 60;
    case "pro": return 200;
    case "team": return 400;
    case "enterprise": return 1000;
  }
}

// ---------------------------------------------------------------------------
// Upstash — Redis (REST API)
// ---------------------------------------------------------------------------

export interface UpstashScalingPolicy {
  /** Pay-per-request vs. fixed plan. */
  plan: "pay-as-you-go" | "fixed";
  /** Max daily requests — pay-as-you-go has no hard cap but bills surge. */
  dailyRequestsCap: number;
  /** Max memory (MB) — fixed plan tiers (256, 512, 1GB, 2GB, ...). */
  memoryMb: number;
  /** Eviction policy — fixed plans support `allkeys-lru`. */
  eviction: "allkeys-lru" | "allkeys-lfu" | "volatile-lru" | "noeviction";
  /** TLS required. */
  tls: boolean;
}

export const UPSTASH_SCALING: UpstashScalingPolicy = {
  plan: "pay-as-you-go",
  dailyRequestsCap: 10_000_000, // 10M/day headroom for 100x baseline
  memoryMb: 2048, // 2GB cap per W37 spec
  eviction: "allkeys-lru",
  tls: true,
};

// ---------------------------------------------------------------------------
// OpenAI — AI rate limits
// ---------------------------------------------------------------------------

export interface OpenAiScalingPolicy {
  /** Per-model TPM (tokens per minute). Tier 1 defaults. */
  tokensPerMinute: number;
  /** Per-model RPM (requests per minute). */
  requestsPerMinute: number;
  /** Concurrent requests we allow via our internal queue. */
  concurrency: number;
  /** Fallback model when primary is rate-limited. */
  fallbackModel: string;
  /** Circuit breaker — after N consecutive failures, pause for cooldown. */
  circuitBreaker: { failureThreshold: number; cooldownSec: number };
}

export const OPENAI_SCALING_GPT4: OpenAiScalingPolicy = {
  tokensPerMinute: 30_000,
  requestsPerMinute: 500,
  concurrency: 8,
  fallbackModel: "gpt-4o-mini",
  circuitBreaker: { failureThreshold: 10, cooldownSec: 60 },
};

export const OPENAI_SCALING_GPT4O_MINI: OpenAiScalingPolicy = {
  tokensPerMinute: 200_000,
  requestsPerMinute: 500,
  concurrency: 16,
  fallbackModel: "gpt-3.5-turbo",
  circuitBreaker: { failureThreshold: 20, cooldownSec: 30 },
};

// ---------------------------------------------------------------------------
// Stripe — payments
// ---------------------------------------------------------------------------

export interface StripeScalingPolicy {
  /** Per-account API rate limit (writes/sec). */
  writesPerSec: number;
  /** Read requests per sec. */
  readsPerSec: number;
  /** Webhook concurrency. */
  webhookConcurrency: number;
  /** Retry policy — Stripe recommends exponential with jitter. */
  retry: { maxAttempts: number; baseMs: number; maxMs: number };
}

export const STRIPE_SCALING: StripeScalingPolicy = {
  writesPerSec: 100,
  readsPerSec: 100,
  webhookConcurrency: 8,
  retry: { maxAttempts: 5, baseMs: 1_000, maxMs: 30_000 },
};

// ---------------------------------------------------------------------------
// Circuit breaker — generic implementation reusable across providers
// ---------------------------------------------------------------------------

export interface CircuitState {
  failures: number;
  state: "closed" | "open" | "half-open";
  openedAt: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownSec: number;
  halfOpenAfterSec: number;
}

export function createCircuitBreaker(cfg: CircuitBreakerConfig) {
  let state: CircuitState = { failures: 0, state: "closed", openedAt: 0 };

  return {
    /** Wrap a call; throws if circuit is open. */
    async exec<T>(fn: () => Promise<T>): Promise<T> {
      if (state.state === "open") {
        const elapsed = (Date.now() - state.openedAt) / 1000;
        if (elapsed > cfg.halfOpenAfterSec) {
          state = { ...state, state: "half-open" };
        } else {
          throw new Error("circuit-open");
        }
      }
      try {
        const result = await fn();
        if (state.state === "half-open") {
          state = { failures: 0, state: "closed", openedAt: 0 };
        }
        return result;
      } catch (err) {
        state = {
          failures: state.failures + 1,
          state: state.failures + 1 >= cfg.failureThreshold ? "open" : state.state,
          openedAt: Date.now(),
        };
        throw err;
      }
    },
    /** Read-only state for monitoring. */
    snapshot(): CircuitState {
      return { ...state };
    },
    /** Force-close (admin recovery). */
    reset(): void {
      state = { failures: 0, state: "closed", openedAt: 0 };
    },
  };
}

// ---------------------------------------------------------------------------
// Capacity planning — 10x load headroom
// ---------------------------------------------------------------------------

export interface CapacityPlan {
  /** Current baseline (1x). */
  baselineRps: number;
  /** Target for 10x load. */
  targetRps: number;
  /** Per-component headroom (%). */
  components: Array<{ name: string; currentCapacity: number; needed: number; headroom: number }>;
}

export function planFor10x(baselineRps: number): CapacityPlan {
  const target = baselineRps * 10;
  return {
    baselineRps,
    targetRps: target,
    components: [
      { name: "Vercel Functions", currentCapacity: 1_000, needed: target, headroom: 100 }, // auto-scale
      { name: "Supabase Pool", currentCapacity: 200, needed: Math.ceil(target / 5), headroom: 25 },
      { name: "Upstash Redis", currentCapacity: 50_000, needed: target * 2, headroom: 100 }, // pay-as-you-go
      { name: "OpenAI GPT-4o", currentCapacity: 500, needed: Math.ceil(target / 10), headroom: 20 },
      { name: "Stripe API", currentCapacity: 100, needed: Math.ceil(target / 100), headroom: 50 },
    ],
  };
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const SCALING_POLICIES = {
  vercel: VERCEL_SCALING,
  supabase: SUPABASE_SCALING,
  upstash: UPSTASH_SCALING,
  openai: OPENAI_SCALING_GPT4,
  stripe: STRIPE_SCALING,
} as const;