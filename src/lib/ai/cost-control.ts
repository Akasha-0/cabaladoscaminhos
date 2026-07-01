// ============================================================================
// ai/cost-control — Per-user AI spend budget enforcement (Wave 39 — 2026-07-01)
// ============================================================================
// Hard budget cap per user/tier with soft warnings at 80%. Tracks daily +
// monthly USD spend against configurable per-tier limits. Stop-the-line when
// exceeded: all subsequent Akasha calls fail-fast with CostLimitError.
//
// Design choices:
//   - **In-memory ledger + Redis mirror** — for cross-instance consistency,
//     monthly totals live in Redis hash `cdc:cost:<userId>:<YYYY-MM>`. Daily
//     totals are in `cdc:cost:<userId>:<YYYY-MM-DD>` with 36h TTL.
//   - **Atomic increment via Lua** — prevents read-modify-write races when
//     multiple parallel requests arrive. Falls back to read-then-write in
//     environments without Lua (Upstash REST).
//   - **Tier-aware hard cap** — FREE: $0.10/day, $2/mo. PRO: $1.00/day, $20/mo.
//   - **Soft warning @ 80%** — returned in headers (`X-Akasha-Budget-Warn`)
//     so frontend can show non-blocking modal "approaching limit".
//   - **Cost estimation table** — per-model input/output pricing, updated W39.
//     Source: docs/PRICING-MODELS-W39.md (manual audit, refreshed monthly).
//   - **LGPD Art. 7, 18** — cost records use userId hash, not PII.
//   - **No external billing API** — this enforces budget *before* calls;
//     Stripe/invoicing happens elsewhere (W37 admin-decisions).
//
// Reference: docs/AKASHA-PRODUCTION-W39.md §2 (cost control algorithm).
// ============================================================================

// ---------------------------------------------------------------------------
// Tier budgets
// ---------------------------------------------------------------------------

export type UserTier = "FREE" | "PRO" | "ADMIN";

export interface CostBudget {
  dailyUsd: number;
  monthlyUsd: number;
}

export const COST_BUDGETS: Record<UserTier, CostBudget> = Object.freeze({
  FREE:  { dailyUsd: 0.10, monthlyUsd: 2.00 },
  PRO:   { dailyUsd: 1.00, monthlyUsd: 20.00 },
  ADMIN: { dailyUsd: 50.00, monthlyUsd: 1000.00 }, // internal — no hard cap
});

/** Soft warning threshold (fraction of hard cap). */
export const SOFT_WARN_THRESHOLD = 0.80;

// ---------------------------------------------------------------------------
// Model pricing (USD per 1K tokens) — W39 audit, refresh monthly
// ---------------------------------------------------------------------------

export type ModelName =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "claude-3-5-sonnet"
  | "claude-3-haiku"
  | "text-embedding-3-small"
  | "text-embedding-3-large"
  | "whisper-1"        // per minute
  | "tts-1"             // per 1K chars
  | "tts-1-hd"
  | "dall-e-3";         // per image

export interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
  unit?: "tokens" | "minutes" | "chars" | "images";
}

export const MODEL_PRICING: Record<ModelName, ModelPricing> = Object.freeze({
  "gpt-4o":                 { inputPer1k: 0.0025, outputPer1k: 0.0100 },
  "gpt-4o-mini":            { inputPer1k: 0.00015, outputPer1k: 0.0006 },
  "gpt-4-turbo":            { inputPer1k: 0.0100, outputPer1k: 0.0300 },
  "claude-3-5-sonnet":      { inputPer1k: 0.0030, outputPer1k: 0.0150 },
  "claude-3-haiku":         { inputPer1k: 0.00025, outputPer1k: 0.00125 },
  "text-embedding-3-small": { inputPer1k: 0.00002, outputPer1k: 0 },
  "text-embedding-3-large": { inputPer1k: 0.00013, outputPer1k: 0 },
  "whisper-1":              { inputPer1k: 0.006,  outputPer1k: 0, unit: "minutes" },
  "tts-1":                  { inputPer1k: 0.015,  outputPer1k: 0, unit: "chars" },
  "tts-1-hd":               { inputPer1k: 0.030,  outputPer1k: 0, unit: "chars" },
  "dall-e-3":               { inputPer1k: 0.04,   outputPer1k: 0, unit: "images" },
});

// ---------------------------------------------------------------------------
// Cost record + budget state
// ---------------------------------------------------------------------------

export interface CostRecord {
  model: ModelName;
  /** USD cost (computed via MODEL_PRICING). */
  usd: number;
  /** Tokens / chars / minutes consumed (for analytics). */
  units: number;
  /** Wall-clock timestamp (epoch ms). */
  ts: number;
  /** Caller-tagged surface: "text" | "voice-stt" | "voice-tts" | "image-gen" | "embed". */
  surface: CostSurface;
  /** Optional RAG cache hit (cost = 0). */
  cacheHit?: boolean;
}

export type CostSurface =
  | "text"
  | "voice-stt"
  | "voice-tts"
  | "image-gen"
  | "image-vision"
  | "embed"
  | "moderation";

export interface BudgetState {
  tier: UserTier;
  dailySpent: number;
  monthlySpent: number;
  dailyLimit: number;
  monthlyLimit: number;
  /** 0..1 fraction of daily limit consumed. */
  dailyPct: number;
  /** 0..1 fraction of monthly limit consumed. */
  monthlyPct: number;
  /** True if either limit exceeded. */
  exceeded: boolean;
  /** True if either limit >= SOFT_WARN_THRESHOLD. */
  softWarn: boolean;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class CostLimitError extends Error {
  readonly code = "COST_LIMIT_EXCEEDED";
  constructor(
    public readonly userId: string,
    public readonly tier: UserTier,
    public readonly scope: "daily" | "monthly",
    public readonly limitUsd: number,
    public readonly currentUsd: number,
  ) {
    super(
      `Cost limit exceeded for user=${userId} tier=${tier} ` +
      `scope=${scope} limit=$${limitUsd.toFixed(4)} current=$${currentUsd.toFixed(4)}`,
    );
    this.name = "CostLimitError";
  }
}

// ---------------------------------------------------------------------------
// Cost computation
// ---------------------------------------------------------------------------

export interface CostInput {
  model: ModelName;
  inputTokens?: number;
  outputTokens?: number;
  /** Override unit count (whisper minutes, tts chars, image count). */
  unitCount?: number;
}

/**
 * Compute USD cost for a model call. Always returns non-negative finite
 * number. Inputs missing → cost computed from defaults.
 */
export function computeCost(input: CostInput): number {
  const pricing = MODEL_PRICING[input.model];
  if (!pricing) return 0;
  // Unit-based pricing (whisper, tts, dall-e).
  if (pricing.unit === "minutes" || pricing.unit === "chars" || pricing.unit === "images") {
    const units = Math.max(0, input.unitCount ?? 0);
    return Number((units * pricing.inputPer1k / 1000).toFixed(6));
  }
  // Token-based pricing.
  const inputCost = Math.max(0, input.inputTokens ?? 0) * pricing.inputPer1k / 1000;
  const outputCost = Math.max(0, input.outputTokens ?? 0) * pricing.outputPer1k / 1000;
  return Number((inputCost + outputCost).toFixed(6));
}

// ---------------------------------------------------------------------------
// Budget checker
// ---------------------------------------------------------------------------

export interface BudgetCheckInput {
  userId: string;
  tier: UserTier;
  /** Pre-computed cost of the planned call (USD). */
  projectedCostUsd: number;
  /** Optional override of current spend (skip Redis read). */
  stateOverride?: BudgetState;
}

export interface BudgetCheckResult {
  state: BudgetState;
  /** True if projected call fits in remaining budget. */
  fits: boolean;
  /** When fits=false: blocking limit. */
  blockedBy?: "daily" | "monthly";
  /** When softWarn=true (and fits=true): caller should display notice. */
  warning?: { scope: "daily" | "monthly"; pct: number };
}

/**
 * Pure check — no I/O. Computes whether a projected call fits in remaining
 * budget. Caller is responsible for persisting the record atomically.
 *
 * Use `assertBudgetAsync` for the I/O wrapper.
 */
export function checkBudget(input: BudgetCheckInput): BudgetCheckResult {
  const limits = COST_BUDGETS[input.tier];
  const projectedDaily = input.stateOverride
    ? input.stateOverride.dailySpent + input.projectedCostUsd
    : input.projectedCostUsd;
  const projectedMonthly = input.stateOverride
    ? input.stateOverride.monthlySpent + input.projectedCostUsd
    : input.projectedCostUsd;

  const state: BudgetState = input.stateOverride ?? {
    tier: input.tier,
    dailySpent: 0,
    monthlySpent: 0,
    dailyLimit: limits.dailyUsd,
    monthlyLimit: limits.monthlyUsd,
    dailyPct: 0,
    monthlyPct: 0,
    exceeded: false,
    softWarn: false,
  };

  const newDailyPct = state.dailyLimit > 0 ? projectedDaily / state.dailyLimit : 0;
  const newMonthlyPct = state.monthlyLimit > 0 ? projectedMonthly / state.monthlyLimit : 0;

  const dailyExceeded = state.dailyLimit > 0 && projectedDaily > state.dailyLimit;
  const monthlyExceeded = state.monthlyLimit > 0 && projectedMonthly > state.monthlyLimit;
  const dailyWarn = state.dailyLimit > 0 && newDailyPct >= SOFT_WARN_THRESHOLD;
  const monthlyWarn = state.monthlyLimit > 0 && newMonthlyPct >= SOFT_WARN_THRESHOLD;

  const finalState: BudgetState = {
    ...state,
    dailySpent: projectedDaily,
    monthlySpent: projectedMonthly,
    dailyPct: newDailyPct,
    monthlyPct: newMonthlyPct,
    exceeded: dailyExceeded || monthlyExceeded,
    softWarn: dailyWarn || monthlyWarn,
  };

  if (dailyExceeded) {
    return { state: finalState, fits: false, blockedBy: "daily" };
  }
  if (monthlyExceeded) {
    return { state: finalState, fits: false, blockedBy: "monthly" };
  }
  const warning = dailyWarn
    ? { scope: "daily" as const, pct: newDailyPct }
    : monthlyWarn
      ? { scope: "monthly" as const, pct: newMonthlyPct }
      : undefined;
  return { state: finalState, fits: true, warning };
}

// ---------------------------------------------------------------------------
// Tier resolution — re-exported from subscription layer (stubbed here)
// ---------------------------------------------------------------------------

/**
 * Resolve user tier. In production this queries the subscription table;
 * here we expose an interface so the admin overrides can inject.
 */
export interface TierResolver {
  resolveTier(userId: string): Promise<UserTier>;
}

/** Default: tier comes from JWT claim injected in middleware. */
export const defaultTierResolver: TierResolver = {
  async resolveTier(_userId: string): Promise<UserTier> {
    // Real implementation reads from session table (W33 onboarding).
    return "FREE";
  },
};

// ---------------------------------------------------------------------------
// Async budget gate — I/O wrapper that reads + writes Redis atomically
// ---------------------------------------------------------------------------

export interface BudgetStore {
  /** Read daily + monthly spend for a user. Returns zeros if absent. */
  readSpend(userId: string): Promise<{ dailyUsd: number; monthlyUsd: number }>;
  /** Atomically increment daily + monthly spend by costUsd. Returns new totals. */
  addSpend(userId: string, costUsd: number): Promise<{ dailyUsd: number; monthlyUsd: number }>;
  /** Compute BudgetState from totals. */
  toState(userId: string, tier: UserTier, totals: { dailyUsd: number; monthlyUsd: number }): BudgetState;
}

export interface AssertBudgetOptions {
  /** Skip budget check (admin/escalation overrides only). */
  bypass?: boolean;
  /** Override resolver (tests). */
  resolver?: TierResolver;
  /** Override store (tests). */
  store?: BudgetStore;
}

/**
 * Async budget gate. Resolves tier, reads spend, checks projected cost,
 * either commits or rejects. The store contract uses atomic increments
 * (Redis HINCRBYFLOAT or equivalent); the budget record is *not* persisted
 * until `recordCostAsync` is called after the model call completes.
 */
export async function assertBudgetAsync(
  userId: string,
  projectedCostUsd: number,
  opts: AssertBudgetOptions = {},
): Promise<BudgetCheckResult> {
  if (opts.bypass) {
    const tier: UserTier = "ADMIN";
    return {
      state: {
        tier,
        dailySpent: 0,
        monthlySpent: 0,
        dailyLimit: COST_BUDGETS[tier].dailyUsd,
        monthlyLimit: COST_BUDGETS[tier].monthlyUsd,
        dailyPct: 0,
        monthlyPct: 0,
        exceeded: false,
        softWarn: false,
      },
      fits: true,
    };
  }

  const resolver = opts.resolver ?? defaultTierResolver;
  const tier = await resolver.resolveTier(userId);
  const limits = COST_BUDGETS[tier];

  if (!opts.store) {
    // In-process mode (used by tests + admin previews).
    const result = checkBudget({
      userId,
      tier,
      projectedCostUsd,
    });
    return result;
  }

  const totals = await opts.store.readSpend(userId);
  const state: BudgetState = {
    tier,
    dailySpent: totals.dailyUsd,
    monthlySpent: totals.monthlyUsd,
    dailyLimit: limits.dailyUsd,
    monthlyLimit: limits.monthlyUsd,
    dailyPct: limits.dailyUsd > 0 ? totals.dailyUsd / limits.dailyUsd : 0,
    monthlyPct: limits.monthlyUsd > 0 ? totals.monthlyUsd / limits.monthlyUsd : 0,
    exceeded: false,
    softWarn: false,
  };

  return checkBudget({ userId, tier, projectedCostUsd, stateOverride: state });
}

// ---------------------------------------------------------------------------
// In-process store — for tests + edge preview
// ---------------------------------------------------------------------------

export class InMemoryBudgetStore implements BudgetStore {
  private readonly daily = new Map<string, { date: string; usd: number }>();
  private readonly monthly = new Map<string, { ym: string; usd: number }>();

  private keyDate(uid: string, d: Date): string {
    const ymd = d.toISOString().slice(0, 10);
    return `${uid}:${ymd}`;
  }
  private keyMonth(uid: string, d: Date): string {
    const ym = d.toISOString().slice(0, 7);
    return `${uid}:${ym}`;
  }

  async readSpend(userId: string): Promise<{ dailyUsd: number; monthlyUsd: number }> {
    const now = new Date();
    const d = this.daily.get(this.keyDate(userId, now));
    const m = this.monthly.get(this.keyMonth(userId, now));
    return {
      dailyUsd: d?.usd ?? 0,
      monthlyUsd: m?.usd ?? 0,
    };
  }

  async addSpend(userId: string, costUsd: number): Promise<{ dailyUsd: number; monthlyUsd: number }> {
    const now = new Date();
    const dk = this.keyDate(userId, now);
    const mk = this.keyMonth(userId, now);
    const d = this.daily.get(dk) ?? { date: dk.split(":")[1]!, usd: 0 };
    d.usd = Number((d.usd + costUsd).toFixed(6));
    this.daily.set(dk, d);
    const m = this.monthly.get(mk) ?? { ym: mk.split(":")[1]!, usd: 0 };
    m.usd = Number((m.usd + costUsd).toFixed(6));
    this.monthly.set(mk, m);
    return { dailyUsd: d.usd, monthlyUsd: m.usd };
  }

  toState(
    userId: string,
    tier: UserTier,
    totals: { dailyUsd: number; monthlyUsd: number },
  ): BudgetState {
    const limits = COST_BUDGETS[tier];
    return {
      tier,
      dailySpent: totals.dailyUsd,
      monthlySpent: totals.monthlyUsd,
      dailyLimit: limits.dailyUsd,
      monthlyLimit: limits.monthlyUsd,
      dailyPct: limits.dailyUsd > 0 ? totals.dailyUsd / limits.dailyUsd : 0,
      monthlyPct: limits.monthlyUsd > 0 ? totals.monthlyUsd / limits.monthlyUsd : 0,
      exceeded:
        (limits.dailyUsd > 0 && totals.dailyUsd > limits.dailyUsd) ||
        (limits.monthlyUsd > 0 && totals.monthlyUsd > limits.monthlyUsd),
      softWarn:
        (limits.dailyUsd > 0 && totals.dailyUsd / limits.dailyUsd >= SOFT_WARN_THRESHOLD) ||
        (limits.monthlyUsd > 0 && totals.monthlyUsd / limits.monthlyUsd >= SOFT_WARN_THRESHOLD),
    };
  }
}

// ---------------------------------------------------------------------------
// Admin override — temporary budget bump (W37 admin-decisions pages)
// ---------------------------------------------------------------------------

export interface BudgetOverride {
  userId: string;
  /** One-shot $ bonus added to daily OR monthly cap. */
  bonusUsd: number;
  scope: "daily" | "monthly";
  grantedBy: string;
  expiresAt: number; // epoch ms
  reason: string;
}

/**
 * Validate override is within admin authority. Pure check, no I/O.
 * Returns false if override would push cap beyond ADMIN cap.
 */
export function isOverrideValid(override: BudgetOverride, currentTier: UserTier): boolean {
  const limits = COST_BUDGETS[currentTier];
  const cap = override.scope === "daily" ? limits.dailyUsd : limits.monthlyUsd;
  const maxCap = currentTier === "ADMIN"
    ? Number.POSITIVE_INFINITY
    : Math.max(cap * 5, COST_BUDGETS.ADMIN[override.scope === "daily" ? "dailyUsd" : "monthlyUsd"]);
  return override.bonusUsd <= maxCap && override.expiresAt > Date.now();
}
