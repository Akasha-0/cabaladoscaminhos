// src/lib/w38/comments-reputation-trending-v2.ts
// Week-over-week rank trajectory + prediction + trending detection.
// Composes: w36/w36-comments-reputation-leaderboard-v2 (LeaderboardEntryKind, buildLeaderboard),
//           w35/comments-reputation-weighting (WeightingConfig, sortWeighted, WeightedComment),
//           w29/reputation-universalista (TIER_ORDER, REPUTATION_TIERS),
//           w32/comments-moderation-ui (flagged/removed counts per user)

export type LeaderboardEntryKind = "new" | "returning" | "unchanged" | "out";

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
  prevRank: number | null;
  kind: LeaderboardEntryKind;
  commentCount: number;
  flaggedCount: number;
  removedCount: number;
}

export interface WeightedComment {
  commentId: string;
  userId: string;
  weightedScore: number;
  createdAt: number;
}

export type WeekIndex = number;
export type IsoDate = string;

export interface WeeklySnapshot {
  weekIndex: WeekIndex;
  weekStartIso: IsoDate;
  entries: LeaderboardEntry[];
}

export type TrendDirection = "climbing" | "falling" | "stable" | "volatile";
export type TrendingClass = "viral" | "breakout" | "sustained" | "declining" | "dormant" | "steady" | "new";

export interface RankDelta {
  userId: string;
  fromRank: number | null;
  toRank: number | null;
  delta: number;
  momentum: number;
}

export interface UserTrajectory {
  userId: string;
  displayName: string;
  deltas: RankDelta[];
  direction: TrendDirection;
  currentRank: number | null;
  bestRank: number | null;
  worstRank: number | null;
  weeksOnBoard: number;
}

export interface TrendingUser {
  userId: string;
  displayName: string;
  klass: TrendingClass;
  score: number;
  currentRank: number | null;
  prevRank: number | null;
  weeklyScores: number[];
}

export interface ForecastPoint {
  userId: string;
  displayName: string;
  predictedNextRank: number;
  predictedDelta: number;
  confidence: number;
  method: "linear" | "naive" | "na";
}

export interface CohortGroup {
  cohort: "new" | "returning" | "persistent" | "departed";
  userIds: string[];
  avgScore: number;
  medianRank: number;
}

export interface TrendingReport {
  generatedAt: number;
  weekCount: number;
  latestWeek: WeekIndex;
  trajectories: UserTrajectory[];
  trending: TrendingUser[];
  forecasts: ForecastPoint[];
  cohorts: CohortGroup[];
}

export const TRENDING_VIRAL_THRESHOLD = 0.8;
export const TRENDING_BREAKOUT_MIN_JUMP = 10;
export const TRENDING_BREAKOUT_MIN_WEEKS = 3;
export const TRENDING_SUSTAINED_MIN_WEEKS = 4;
export const TRENDING_SUSTAINED_MIN_SCORE = 0.5;
export const TRENDING_DECLINING_DROP_THRESHOLD = 8;
export const TRENDING_DORMANT_WEEKS = 6;
export const VOLATILE_DELTA_THRESHOLD = 6;
export const FORECAST_MIN_WEEKS = 3;
export const FORECAST_MAX_RANK = 1000;
export const COHORT_PERSISTENT_MIN_WEEKS = 4;

export function isoWeekStart(now: number): IsoDate {
  const d = new Date(now);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function weekIndexFromIso(iso: IsoDate, epochIso: IsoDate): WeekIndex {
  const a = Date.parse(iso + "T00:00:00Z");
  const b = Date.parse(epochIso + "T00:00:00Z");
  if (Number.isNaN(a) || Number.isNaN(b) || a < b) return 0;
  return Math.floor((a - b) / (7 * 24 * 60 * 60 * 1000));
}

export function buildSnapshot(
  weekIndex: WeekIndex,
  weekStartIso: IsoDate,
  entries: LeaderboardEntry[],
): WeeklySnapshot {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  return { weekIndex, weekStartIso, entries: sorted };
}

export function lookupEntry(snapshot: WeeklySnapshot, userId: string): LeaderboardEntry | null {
  for (const e of snapshot.entries) {
    if (e.userId === userId) return e;
  }
  return null;
}

export function computeMomentum(snapshots: WeeklySnapshot[], userId: string): number {
  if (snapshots.length < 2) return 0;
  const recent = snapshots.slice(-4);
  let sum = 0;
  let weight = 0;
  for (let i = 1; i < recent.length; i++) {
    const a = lookupEntry(recent[i - 1], userId);
    const b = lookupEntry(recent[i], userId);
    if (!a || !b) continue;
    const d = a.rank - b.rank;
    const w = i;
    sum += d * w;
    weight += w;
  }
  return weight === 0 ? 0 : sum / weight;
}

export function computeDeltas(snapshots: WeeklySnapshot[]): RankDelta[] {
  if (snapshots.length === 0) return [];
  const latest = snapshots[snapshots.length - 1];
  const prev = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
  const userIds = new Set<string>();
  for (const s of snapshots) for (const e of s.entries) userIds.add(e.userId);
  const deltas: RankDelta[] = [];
  for (const uid of userIds) {
    const cur = lookupEntry(latest, uid);
    const prv = prev ? lookupEntry(prev, uid) : null;
    const fromRank = prv ? prv.rank : null;
    const toRank = cur ? cur.rank : null;
    let delta = 0;
    if (fromRank !== null && toRank !== null) delta = fromRank - toRank;
    else if (toRank !== null) delta = 0;
    else if (fromRank !== null) delta = fromRank;
    const momentum = computeMomentum(snapshots, uid);
    deltas.push({ userId: uid, fromRank, toRank, delta, momentum });
  }
  return deltas;
}

export function classifyDirection(deltas: RankDelta[]): TrendDirection {
  if (deltas.length === 0) return "stable";
  const maxAbs = Math.max(...deltas.map((d) => Math.abs(d.delta)));
  if (maxAbs >= VOLATILE_DELTA_THRESHOLD) {
    const signChanges = deltas.reduce((acc, d, i) => {
      if (i === 0) return acc;
      const prev = deltas[i - 1];
      return acc + (Math.sign(prev.delta) !== Math.sign(d.delta) && d.delta !== 0 && prev.delta !== 0 ? 1 : 0);
    }, 0);
    if (signChanges >= 2) return "volatile";
  }
  const totalDelta = deltas.reduce((s, d) => s + d.delta, 0);
  if (totalDelta > 1) return "climbing";
  if (totalDelta < -1) return "falling";
  return "stable";
}

export function buildTrajectory(
  userId: string,
  displayName: string,
  snapshots: WeeklySnapshot[],
): UserTrajectory {
  const deltas: RankDelta[] = [];
  for (let i = 1; i < snapshots.length; i++) {
    const a = lookupEntry(snapshots[i - 1], userId);
    const b = lookupEntry(snapshots[i], userId);
    deltas.push({
      userId,
      fromRank: a ? a.rank : null,
      toRank: b ? b.rank : null,
      delta: a && b ? a.rank - b.rank : a ? a.rank : 0,
      momentum: 0,
    });
  }
  const ranks = snapshots
    .map((s) => lookupEntry(s, userId))
    .filter((e): e is LeaderboardEntry => e !== null)
    .map((e) => e.rank);
  const direction = classifyDirection(deltas);
  const currentRank = ranks.length > 0 ? ranks[ranks.length - 1] : null;
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;
  const worstRank = ranks.length > 0 ? Math.max(...ranks) : null;
  return {
    userId,
    displayName,
    deltas,
    direction,
    currentRank,
    bestRank,
    worstRank,
    weeksOnBoard: ranks.length,
  };
}

export function weeklyScores(snapshots: WeeklySnapshot[], userId: string): number[] {
  return snapshots.map((s) => {
    const e = lookupEntry(s, userId);
    return e ? e.score : 0;
  });
}

export function detectTrendingClass(
  scores: number[],
  currentRank: number | null,
  prevRank: number | null,
): TrendingClass {
  if (scores.length === 0 || currentRank === null) return "dormant";
  if (prevRank === null) {
    if (currentRank <= 20) return "breakout";
    return "new";
  }
  const recent = scores.slice(-TRENDING_SUSTAINED_MIN_WEEKS);
  if (recent.length === 0) return "steady";
  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const jump = prevRank - currentRank;
  if (recentAvg >= TRENDING_VIRAL_THRESHOLD && jump >= TRENDING_BREAKOUT_MIN_JUMP) return "viral";
  if (jump >= TRENDING_BREAKOUT_MIN_JUMP && recent.length >= TRENDING_BREAKOUT_MIN_WEEKS) return "breakout";
  if (recent.length >= TRENDING_SUSTAINED_MIN_WEEKS && recentAvg >= TRENDING_SUSTAINED_MIN_SCORE) return "sustained";
  if (jump <= -TRENDING_DECLINING_DROP_THRESHOLD) return "declining";
  if (scores.length >= TRENDING_DORMANT_WEEKS && recentAvg < 0.1) return "dormant";
  return "steady";
}

export function trendingScore(klass: TrendingClass, jump: number, recentAvg: number): number {
  let base = 0;
  switch (klass) {
    case "viral": base = 0.95; break;
    case "breakout": base = 0.8; break;
    case "sustained": base = 0.65; break;
    case "declining": base = 0.3; break;
    case "dormant": base = 0.05; break;
    case "steady": base = 0.4; break;
    case "new": base = 0.5; break;
  }
  const jumpBoost = Math.max(0, Math.min(0.05, Math.abs(jump) * 0.005));
  const scoreBoost = Math.max(0, Math.min(0.05, recentAvg * 0.05));
  return Math.min(1, base + jumpBoost + scoreBoost);
}

export function buildTrendingUsers(
  snapshots: WeeklySnapshot[],
  limit: number = 20,
): TrendingUser[] {
  if (snapshots.length === 0) return [];
  const latest = snapshots[snapshots.length - 1];
  const prev = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
  const out: TrendingUser[] = [];
  for (const entry of latest.entries) {
    const prevEntry = prev ? lookupEntry(prev, entry.userId) : null;
    const scores = weeklyScores(snapshots, entry.userId);
    const klass = detectTrendingClass(scores, entry.rank, prevEntry ? prevEntry.rank : null);
    const jump = prevEntry ? prevEntry.rank - entry.rank : 0;
    const recent = scores.slice(-4);
    const recentAvg = recent.length === 0 ? 0 : recent.reduce((s, v) => s + v, 0) / recent.length;
    const score = trendingScore(klass, jump, recentAvg);
    out.push({
      userId: entry.userId,
      displayName: entry.displayName,
      klass,
      score,
      currentRank: entry.rank,
      prevRank: prevEntry ? prevEntry.rank : null,
      weeklyScores: scores,
    });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

export function linearForecast(scores: number[]): { predicted: number; confidence: number } | null {
  if (scores.length < FORECAST_MIN_WEEKS) return null;
  const n = scores.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = scores.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (scores[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  if (den === 0) return null;
  const slope = num / den;
  const intercept = meanY - slope * meanX;
  const predicted = Math.max(0, Math.min(1, slope * n + intercept));
  const residuals: number[] = [];
  for (let i = 0; i < n; i++) {
    const yhat = slope * xs[i] + intercept;
    residuals.push(scores[i] - yhat);
  }
  const sse = residuals.reduce((s, v) => s + v * v, 0);
  const variance = sse / n;
  const confidence = Math.max(0, Math.min(1, 1 - Math.sqrt(variance)));
  return { predicted, confidence };
}

export function naiveForecast(scores: number[]): { predicted: number; confidence: number } | null {
  if (scores.length < 1) return null;
  const last = scores[scores.length - 1];
  const confidence = Math.max(0, Math.min(1, scores.length / 8));
  return { predicted: last, confidence };
}

export function buildForecasts(snapshots: WeeklySnapshot[]): ForecastPoint[] {
  if (snapshots.length === 0) return [];
  const latest = snapshots[snapshots.length - 1];
  const out: ForecastPoint[] = [];
  for (const entry of latest.entries) {
    const scores = weeklyScores(snapshots, entry.userId);
    const linear = linearForecast(scores);
    const naive = naiveForecast(scores);
    let method: ForecastPoint["method"] = "na";
    let predictedScore = 0;
    let confidence = 0;
    if (linear && linear.confidence >= 0.6) {
      method = "linear";
      predictedScore = linear.predicted;
      confidence = linear.confidence;
    } else if (naive) {
      method = "naive";
      predictedScore = naive.predicted;
      confidence = naive.confidence;
    }
    if (method === "na") continue;
    const predictedRank = Math.max(
      1,
      Math.min(FORECAST_MAX_RANK, Math.round(1 / Math.max(0.01, predictedScore))),
    );
    const predictedDelta = entry.rank - predictedRank;
    out.push({
      userId: entry.userId,
      displayName: entry.displayName,
      predictedNextRank: predictedRank,
      predictedDelta,
      confidence,
      method,
    });
  }
  out.sort((a, b) => b.confidence - a.confidence);
  return out;
}

export function buildCohorts(snapshots: WeeklySnapshot[]): CohortGroup[] {
  if (snapshots.length === 0) return [];
  const latest = snapshots[snapshots.length - 1];
  const prev = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
  const newUsers: string[] = [];
  const returningUsers: string[] = [];
  const persistentUsers: string[] = [];
  const departedUsers: string[] = [];
  for (const entry of latest.entries) {
    const weeksOnBoard = snapshots.reduce((acc, s) => acc + (lookupEntry(s, entry.userId) ? 1 : 0), 0);
    if (weeksOnBoard <= 1) newUsers.push(entry.userId);
    else if (prev && lookupEntry(prev, entry.userId)) {
      if (weeksOnBoard >= COHORT_PERSISTENT_MIN_WEEKS) persistentUsers.push(entry.userId);
      else returningUsers.push(entry.userId);
    } else {
      returningUsers.push(entry.userId);
    }
  }
  if (prev) {
    for (const e of prev.entries) {
      if (!lookupEntry(latest, e.userId)) departedUsers.push(e.userId);
    }
  }
  const groups: CohortGroup[] = [];
  for (const [cohort, ids] of [
    ["new", newUsers],
    ["returning", returningUsers],
    ["persistent", persistentUsers],
    ["departed", departedUsers],
  ] as const) {
    if (ids.length === 0) continue;
    const sumScores = ids.reduce((s, uid) => {
      const e = lookupEntry(latest, uid);
      return s + (e ? e.score : 0);
    }, 0);
    const ranks = ids
      .map((uid) => lookupEntry(latest, uid))
      .filter((e): e is LeaderboardEntry => e !== null)
      .map((e) => e.rank)
      .sort((a, b) => a - b);
    const medianRank = ranks.length === 0 ? 0 : ranks[Math.floor(ranks.length / 2)];
    groups.push({
      cohort,
      userIds: ids,
      avgScore: sumScores / ids.length,
      medianRank,
    });
  }
  return groups;
}

export function buildTrendingReport(snapshots: WeeklySnapshot[], now: number): TrendingReport {
  if (snapshots.length === 0) {
    return {
      generatedAt: now,
      weekCount: 0,
      latestWeek: 0,
      trajectories: [],
      trending: [],
      forecasts: [],
      cohorts: [],
    };
  }
  const latest = snapshots[snapshots.length - 1];
  const trajectories: UserTrajectory[] = latest.entries.map((e) =>
    buildTrajectory(e.userId, e.displayName, snapshots),
  );
  const trending = buildTrendingUsers(snapshots, 20);
  const forecasts = buildForecasts(snapshots);
  const cohorts = buildCohorts(snapshots);
  return {
    generatedAt: now,
    weekCount: snapshots.length,
    latestWeek: latest.weekIndex,
    trajectories,
    trending,
    forecasts,
    cohorts,
  };
}

export function summarizeTrendingReport(report: TrendingReport): string {
  if (report.weekCount === 0) return "trending: no data";
  const trendingCounts = report.trending.reduce<Record<TrendingClass, number>>(
    (acc, t) => {
      acc[t.klass] = (acc[t.klass] || 0) + 1;
      return acc;
    },
    { viral: 0, breakout: 0, sustained: 0, declining: 0, dormant: 0, steady: 0, new: 0 },
  );
  const cohortSizes = report.cohorts.map((c) => `${c.cohort}=${c.userIds.length}`).join(",");
  return [
    `trending: weeks=${report.weekCount}`,
    `latest=${report.latestWeek}`,
    `trending[V/B/S/D/Dm/St]=${trendingCounts.viral}/${trendingCounts.breakout}/${trendingCounts.sustained}/${trendingCounts.declining}/${trendingCounts.dormant}/${trendingCounts.steady}`,
    `forecasts=${report.forecasts.length}`,
    `cohorts=${cohortSizes || "none"}`,
  ].join(" | ");
}
