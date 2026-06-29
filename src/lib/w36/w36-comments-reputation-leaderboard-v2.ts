/**
 * w36/comments-reputation-leaderboard-v2.ts
 *
 * PATCH of w36/comments-reputation-leaderboard.ts (cycle 36 audit fix).
 *
 * **Bug fixed (Verifier cycle 36 audit, real logic bug #1):**
 *   - Original `computeDeltas` used `delta: 0` as a sentinel for THREE
 *     semantically different cases: (a) new entry (no prior rank), (b) first
 *     snapshot (no `previous` passed), (c) returning user whose rank was
 *     unchanged. `findNewEntries` then used `delta === 0 && rank <= 10` which
 *     caught returning users who happened to keep their rank — false positives.
 *   - This v2 adds a `kind` field to `LeaderboardEntry` with explicit enum
 *     values: `"new" | "returning" | "unchanged" | "out"`. `computeDeltas`
 *     now sets `kind` deterministically; `findNewEntries` filters by
 *     `kind === "new"`. The numeric `delta` field is preserved for UI display
 *     but is no longer the source of truth for new-entry detection.
 *
 * **Compatibility:** all exports from v1 are preserved with identical names.
 * The only additive change is the new `kind` field on `LeaderboardEntry`.
 * Existing v1 consumers continue to work (the extra field is backward-
 * compatible); new consumers should prefer `kind` over `delta === 0` checks.
 *
 * Pure TS, no runtime imports. Safe to import from server / edge / tests.
 *
 * Composes (same as v1):
 *   - w35/comments-reputation-weighting (tier multipliers, decay, anti-gaming)
 *   - w29/reputation-universalista (cross-tradition reputation model)
 *   - w34/comments-moderation-appeals (filtered signal source)
 */

// ============================================================================
// TYPES
// ============================================================================

export type LeaderboardFamily =
  | "universalista" // cross-tradition contributors
  | "mentor" // mentorship-active
  | "leitor" // marketplace leitura authors
  | "streamer" // live stream hosts
  | "curador" // content curators
  | "moderador"; // community moderators

export type LeaderboardWindow = "day" | "week" | "month" | "quarter" | "all";

export type ReputationTier =
  | "novato" // 0.6x
  | "aprendiz" // 0.8x
  | "praticante" // 1.0x
  | "universalista" // 1.2x
  | "mestre"; // 1.6x

/**
 * Cycle 37 v2 NEW: explicit rank-change category. Replaces the ambiguous
 * `delta === 0` sentinel in v1.
 */
export type LeaderboardEntryKind =
  | "new" // first appearance on the leaderboard (no prior rank)
  | "returning" // was on prior leaderboard, has a new (different) rank now
  | "unchanged" // was on prior leaderboard, rank is identical
  | "out"; // was on prior leaderboard, has dropped off (filtered out)

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  family: LeaderboardFamily;
  score: number; // weighted composite score
  rawScore: number; // unweighted
  tier: ReputationTier;
  rank: number; // 1-based within family
  delta: number; // rank change vs previous window (positive = moved UP)
  kind: LeaderboardEntryKind; // NEW in v2 — disambiguates delta overload
  badges: string[]; // earned badge IDs
  highlight?: string; // optional featured reason
};

export type LeaderboardConfig = {
  topN: number; // entries per family (default 25)
  minScore: number; // filter threshold (default 1.0)
  excludeUserIds: string[]; // admins, bots, etc.
  enableDecay: boolean; // apply time decay
  decayHalfLifeHours: number; // default 72
  tieBreaker: "score" | "recency" | "alphabetical";
};

export type LeaderboardResult = {
  family: LeaderboardFamily;
  window: LeaderboardWindow;
  generatedAt: number; // epoch ms
  entries: LeaderboardEntry[];
  totalCandidates: number; // users considered
  totalFiltered: number; // users excluded
};

export type ReputationSignals = {
  userId: string;
  displayName: string;
  family: LeaderboardFamily;
  tier: ReputationTier;
  baseScore: number; // from w35 weighting
  weightedScore: number; // from w35 weighting
  earnedAt: number; // epoch ms of last signal
  badges: string[];
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const REPUTATION_TIERS: readonly ReputationTier[] = [
  "novato",
  "aprendiz",
  "praticante",
  "universalista",
  "mestre",
] as const;

export const TIER_MULTIPLIERS: Record<ReputationTier, number> = {
  novato: 0.6,
  aprendiz: 0.8,
  praticante: 1.0,
  universalista: 1.2,
  mestre: 1.6,
};

export const DEFAULT_LEADERBOARD_CONFIG: LeaderboardConfig = {
  topN: 25,
  minScore: 1.0,
  excludeUserIds: [],
  enableDecay: true,
  decayHalfLifeHours: 72,
  tieBreaker: "score",
};

export const WINDOW_HOURS: Record<LeaderboardWindow, number | null> = {
  day: 24,
  week: 24 * 7,
  month: 24 * 30,
  quarter: 24 * 90,
  all: null,
};

export const ALL_FAMILIES: readonly LeaderboardFamily[] = [
  "universalista",
  "mentor",
  "leitor",
  "streamer",
  "curador",
  "moderador",
] as const;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Filter signals by leaderboard window (lookback).
 */
export function filterByWindow(
  signals: ReputationSignals[],
  window: LeaderboardWindow,
  now: number,
): ReputationSignals[] {
  const hours = WINDOW_HOURS[window];
  if (hours === null) return [...signals];
  const cutoff = now - hours * 3600 * 1000;
  return signals.filter((s) => s.earnedAt >= cutoff);
}

/**
 * Apply time decay to weighted scores (log half-life).
 * score' = score * 0.5^(ageHours / halfLife)
 */
export function applyDecay(
  signal: ReputationSignals,
  halfLifeHours: number,
  now: number,
): number {
  const ageMs = Math.max(0, now - signal.earnedAt);
  const ageHours = ageMs / (3600 * 1000);
  return signal.weightedScore * Math.pow(0.5, ageHours / halfLifeHours);
}

/**
 * Filter out excluded users and below-threshold scores.
 */
export function filterCandidates(
  signals: ReputationSignals[],
  config: LeaderboardConfig,
): ReputationSignals[] {
  const excluded = new Set(config.excludeUserIds);
  return signals.filter((s) => {
    if (excluded.has(s.userId)) return false;
    if (s.weightedScore < config.minScore) return false;
    return true;
  });
}

/**
 * Group candidates by family.
 */
export function groupByFamily(
  signals: ReputationSignals[],
): Map<LeaderboardFamily, ReputationSignals[]> {
  const groups = new Map<LeaderboardFamily, ReputationSignals[]>();
  for (const s of signals) {
    const arr = groups.get(s.family) ?? [];
    arr.push(s);
    groups.set(s.family, arr);
  }
  return groups;
}

/**
 * Sort candidates by score (with tie-breaker) and assign rank hints.
 */
export function sortCandidates(
  signals: ReputationSignals[],
  config: LeaderboardConfig,
  now: number,
): ReputationSignals[] {
  const tieBreak = (a: ReputationSignals, b: ReputationSignals): number => {
    switch (config.tieBreaker) {
      case "recency":
        return b.earnedAt - a.earnedAt;
      case "alphabetical":
        return a.displayName.localeCompare(b.displayName);
      case "score":
      default:
        return b.weightedScore - a.weightedScore;
    }
  };
  const sorted = [...signals].sort((a, b) => {
    const primary = config.enableDecay
      ? applyDecay(b, config.decayHalfLifeHours, now) -
        applyDecay(a, config.decayHalfLifeHours, now)
      : b.weightedScore - a.weightedScore;
    return primary !== 0 ? primary : tieBreak(a, b);
  });
  return sorted;
}

/**
 * Compute rank delta and `kind` vs a previous leaderboard snapshot.
 *
 * v2 fix: assigns `kind` explicitly so callers can distinguish new entries
 * from unchanged-rank returning users without inspecting `delta`.
 *
 * - `previous === null` → all current entries are `kind: "new"`
 * - user not in previous → `kind: "new"`
 * - user in previous with same rank → `kind: "unchanged"`
 * - user in previous with different rank → `kind: "returning"`
 *   (note: `out` is assigned by callers, not here, because we don't see the
 *   prior→current diff at this layer)
 */
export function computeDeltas(
  current: LeaderboardEntry[],
  previous: LeaderboardEntry[] | null,
): LeaderboardEntry[] {
  if (!previous) {
    return current.map((e) => ({ ...e, delta: 0, kind: "new" as const }));
  }
  const prevRanks = new Map(previous.map((e) => [e.userId, e.rank] as const));
  return current.map((e) => {
    const prev = prevRanks.get(e.userId);
    if (prev === undefined) {
      return { ...e, delta: 0, kind: "new" as const };
    }
    if (prev === e.rank) {
      return { ...e, delta: 0, kind: "unchanged" as const };
    }
    // positive delta = moved UP (e.g. 5 -> 2 = +3)
    return { ...e, delta: prev - e.rank, kind: "returning" as const };
  });
}

/**
 * Build a single family's leaderboard.
 */
export function buildFamilyLeaderboard(
  family: LeaderboardFamily,
  signals: ReputationSignals[],
  window: LeaderboardWindow,
  config: LeaderboardConfig,
  now: number,
  previous: LeaderboardEntry[] | null,
): LeaderboardResult {
  const familySignals = signals.filter((s) => s.family === family);
  const filtered = filterCandidates(familySignals, config);
  const windowed = filterByWindow(filtered, window, now);
  const sorted = sortCandidates(windowed, config, now);
  const topN = sorted.slice(0, config.topN);
  const entries: LeaderboardEntry[] = topN.map((s, i) => ({
    userId: s.userId,
    displayName: s.displayName,
    family: s.family,
    score: config.enableDecay
      ? applyDecay(s, config.decayHalfLifeHours, now)
      : s.weightedScore,
    rawScore: s.baseScore,
    tier: s.tier,
    rank: i + 1,
    delta: 0,
    // v2: new entries are "new" until computeDeltas runs and may upgrade
    // some of them to "returning" if a previous snapshot exists.
    kind: "new" as const,
    badges: s.badges,
  }));
  const withDeltas = computeDeltas(entries, previous);
  return {
    family,
    window,
    generatedAt: now,
    entries: withDeltas,
    totalCandidates: familySignals.length,
    totalFiltered: familySignals.length - windowed.length,
  };
}

/**
 * Build leaderboards for all families in a single pass.
 */
export function buildAllLeaderboards(
  signals: ReputationSignals[],
  window: LeaderboardWindow,
  config: Partial<LeaderboardConfig>,
  now: number,
  previousByFamily?: Partial<Record<LeaderboardFamily, LeaderboardEntry[]>>,
): LeaderboardResult[] {
  const cfg: LeaderboardConfig = { ...DEFAULT_LEADERBOARD_CONFIG, ...config };
  return ALL_FAMILIES.map((fam) =>
    buildFamilyLeaderboard(
      fam,
      signals,
      window,
      cfg,
      now,
      previousByFamily?.[fam] ?? null,
    ),
  );
}

/**
 * Find a specific user's rank across all families.
 */
export function findUserRanks(
  userId: string,
  results: LeaderboardResult[],
): { family: LeaderboardFamily; rank: number; score: number }[] {
  const found: { family: LeaderboardFamily; rank: number; score: number }[] = [];
  for (const r of results) {
    const entry = r.entries.find((e) => e.userId === userId);
    if (entry) {
      found.push({
        family: r.family,
        rank: entry.rank,
        score: entry.score,
      });
    }
  }
  return found;
}

/**
 * Find users who moved up significantly (climbers).
 * v2: also requires `kind === "returning"` so we don't return unchanged entries.
 */
export function findClimbers(
  results: LeaderboardResult[],
  minDelta: number = 5,
): LeaderboardEntry[] {
  const climbers: LeaderboardEntry[] = [];
  for (const r of results) {
    for (const e of r.entries) {
      if (e.kind === "returning" && e.delta >= minDelta) climbers.push(e);
    }
  }
  climbers.sort((a, b) => b.delta - a.delta);
  return climbers;
}

/**
 * Find new entries — v2: filters by `kind === "new"` instead of `delta === 0`.
 * This is the bugfix: returning users who happened to keep their rank are no
 * longer falsely reported as "new".
 */
export function findNewEntries(results: LeaderboardResult[]): LeaderboardEntry[] {
  const fresh: LeaderboardEntry[] = [];
  for (const r of results) {
    for (const e of r.entries) {
      if (e.kind === "new" && e.rank <= 10) {
        fresh.push(e);
      }
    }
  }
  return fresh;
}

/**
 * Generate a shareable highlight string for a top entry.
 */
export function buildEntryHighlight(
  entry: LeaderboardEntry,
  result: LeaderboardResult,
): string {
  if (entry.kind === "new") return "✨ Estreia no ranking";
  if (entry.delta >= 10) return "🚀 Maior subida do período";
  if (entry.delta >= 5) return `📈 Subiu ${entry.delta} posições`;
  if (entry.rank === 1) return "👑 Líder da família";
  if (entry.badges.length >= 3) return `🏅 ${entry.badges.length} distintivos`;
  return `${result.family} • #${entry.rank}`;
}

/**
 * Summarize a leaderboard for display.
 */
export function summarizeLeaderboard(result: LeaderboardResult): {
  family: string;
  window: string;
  topThree: string[];
  climberCount: number;
  newEntryCount: number;
  averageScore: number;
} {
  const topThree = result.entries.slice(0, 3).map(
    (e) => `#${e.rank} ${e.displayName} (${e.score.toFixed(1)})`,
  );
  const climbers = result.entries.filter((e) => e.kind === "returning").length;
  const newEntries = result.entries.filter((e) => e.kind === "new").length;
  const avg =
    result.entries.length > 0
      ? result.entries.reduce((sum, e) => sum + e.score, 0) /
        result.entries.length
      : 0;
  return {
    family: result.family,
    window: result.window,
    topThree,
    climberCount: climbers,
    newEntryCount: newEntries,
    averageScore: Math.round(avg * 100) / 100,
  };
}

/**
 * Validate a leaderboard config.
 */
export function validateLeaderboardConfig(config: Partial<LeaderboardConfig>): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (config.topN !== undefined && (config.topN < 1 || config.topN > 200)) {
    errors.push("topN must be between 1 and 200");
  }
  if (config.minScore !== undefined && config.minScore < 0) {
    errors.push("minScore must be >= 0");
  }
  if (
    config.decayHalfLifeHours !== undefined &&
    config.decayHalfLifeHours <= 0
  ) {
    errors.push("decayHalfLifeHours must be > 0");
  }
  if (
    config.tieBreaker !== undefined &&
    !["score", "recency", "alphabetical"].includes(config.tieBreaker)
  ) {
    errors.push("tieBreaker must be score, recency, or alphabetical");
  }
  return { ok: errors.length === 0, errors };
}
