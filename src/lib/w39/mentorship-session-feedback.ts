// src/lib/w39/mentorship-session-feedback.ts
// Cycle 39 — mentorship session feedback aggregation. Composes with
// w33 (session detail), w35 (goal progress), w38 (mentor profile).
// Pure TypeScript: no I/O, no DOM, caller-supplied `now`.

export type FeedbackSource = "mentee" | "mentor" | "self_reflection" | "peer";
export type TrendDirection = "improving" | "declining" | "stable" | "insufficient_data";
export type SeverityLevel = "low" | "moderate" | "high" | "critical";

export interface SessionFeedback {
  readonly sessionId: string;
  readonly mentorId: string;
  readonly menteeId: string;
  readonly rating: number; // 0..5
  readonly goalProgress: number; // 0..100
  readonly weakAreas: ReadonlyArray<string>;
  readonly strengths: ReadonlyArray<string>;
  readonly comments: string;
  readonly submittedAt: number;
  readonly source?: FeedbackSource;
  readonly goalIds?: ReadonlyArray<string>;
}

export interface WeakArea {
  readonly area: string;
  readonly severity: SeverityLevel;
  readonly occurrences: number;
  readonly firstSeen: number;
  readonly lastSeen: number;
  readonly suggestedResources: ReadonlyArray<string>;
}

export interface StrengthArea {
  readonly area: string;
  readonly occurrences: number;
  readonly firstSeen: number;
  readonly lastSeen: number;
}

export interface MentorRollup {
  readonly mentorId: string;
  readonly totalSessions: number;
  readonly avgRating: number;
  readonly totalMentees: number;
  readonly weakAreaFrequency: ReadonlyArray<WeakArea>;
  readonly strongAreaFrequency: ReadonlyArray<StrengthArea>;
  readonly goalCoverageRate: number;
  readonly compositeScore: number;
}

export interface MenteeRollup {
  readonly menteeId: string;
  readonly totalSessions: number;
  readonly mentorCount: number;
  readonly weakAreas: ReadonlyArray<WeakArea>;
  readonly improvementRate: number;
  readonly currentMentorIds: ReadonlyArray<string>;
  readonly lastTouchedAt: number | null;
}

export interface GoalCoverage {
  readonly goalId: string;
  readonly mentorCount: number;
  readonly totalMentions: number;
  readonly lastTouchedAt: number | null;
  readonly coverageScore: number;
  readonly mentorIds: ReadonlyArray<string>;
}

export interface FeedbackWindow {
  readonly start: number;
  readonly end: number;
  readonly sessionCount: number;
  readonly distinctMentors: number;
  readonly distinctMentees: number;
}

export interface WeakAreaDetectionOptions {
  readonly minOccurrences: number;
  readonly severityWeights?: Readonly<Record<SeverityLevel, number>>;
  readonly bucketWindowDays?: number;
  readonly resourceCatalog?: ReadonlyArray<{ area: string; resource: string }>;
}

export interface MentorEffectivenessRow {
  readonly mentorId: string;
  readonly compositeScore: number;
  readonly avgRating: number;
  readonly goalCoverageRate: number;
  readonly weakAreaRate: number;
  readonly sessionCount: number;
  readonly rank: number;
}

export interface TrendBucket {
  readonly periodStart: number;
  readonly periodEnd: number;
  readonly avgRating: number;
  readonly avgGoalProgress: number;
  readonly sessionCount: number;
  readonly weakAreaCount: number;
}

export interface FeedbackTrend {
  readonly direction: TrendDirection;
  readonly buckets: ReadonlyArray<TrendBucket>;
  readonly ratingDelta: number;
  readonly progressDelta: number;
  readonly confidence: number;
}

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const DEFAULT_TREND_PERIOD_DAYS = 14;
export const DEFAULT_TREND_BUCKET_COUNT = 4;
export const DEFAULT_SEVERITY_WEIGHTS: Readonly<Record<SeverityLevel, number>> = {
  low: 0.25, moderate: 0.5, high: 0.85, critical: 1,
};
export const DEFAULT_RESOURCE_CATALOG: ReadonlyArray<{ area: string; resource: string }> = [
  { area: "consistency", resource: "Daily Reflection Streaks (w34)" },
  { area: "consistency", resource: "Voice practice prompts (w35)" },
  { area: "reading_comprehension", resource: "Read Passage template (w35)" },
  { area: "ritual_practice", resource: "Ritual Practice template (w35)" },
  { area: "ritual_practice", resource: "Shadow mentor session (w35)" },
  { area: "group_engagement", resource: "Share with community (w35)" },
  { area: "group_engagement", resource: "Profile alumni showcase (w38)" },
  { area: "voice_pronunciation", resource: "Voice practice prompt (w35)" },
  { area: "voice_pronunciation", resource: "Audio chapter clip (w38)" },
  { area: "study_habits", resource: "Study session template (w35)" },
  { area: "study_habits", resource: "Apply to life template (w35)" },
  { area: "time_management", resource: "Cadence suggestions (w35)" },
  { area: "self_confidence", resource: "Low experience match notes (w38)" },
  { area: "self_confidence", resource: "Goal achievement summary" },
  { area: "integration", resource: "Apply to life template (w35)" },
];
export const EFFECTIVENESS_WEIGHTS = { rating: 0.45, coverage: 0.3, weakAreaPenalty: 0.25 } as const;

// ---------- AGGREGATION --------------------------------------------------

export function aggregateFeedback(
  feedbacks: ReadonlyArray<SessionFeedback>,
  window: FeedbackWindow | null,
): { mentors: ReadonlyArray<MentorRollup>; mentees: ReadonlyArray<MenteeRollup> } {
  const filtered = filterByWindow(feedbacks, window);
  return { mentors: rollupMentors(filtered), mentees: rollupMentees(filtered) };
}

export function filterByWindow(
  feedbacks: ReadonlyArray<SessionFeedback>,
  window: FeedbackWindow | null,
): ReadonlyArray<SessionFeedback> {
  if (!window) return feedbacks;
  const { start, end } = window;
  return feedbacks.filter((f) => f.submittedAt >= start && f.submittedAt <= end);
}

export function buildWindow(
  feedbacks: ReadonlyArray<SessionFeedback>,
  start: number,
  end: number,
): FeedbackWindow {
  const inRange = feedbacks.filter((f) => f.submittedAt >= start && f.submittedAt <= end);
  const mentors = new Set<string>();
  const mentees = new Set<string>();
  for (const f of inRange) { mentors.add(f.mentorId); mentees.add(f.menteeId); }
  return { start, end, sessionCount: inRange.length, distinctMentors: mentors.size, distinctMentees: mentees.size };
}

export function rollupMentors(
  feedbacks: ReadonlyArray<SessionFeedback>,
): ReadonlyArray<MentorRollup> {
  const byMentor = new Map<string, SessionFeedback[]>();
  for (const f of feedbacks) {
    const arr = byMentor.get(f.mentorId) ?? [];
    arr.push(f as SessionFeedback);
    byMentor.set(f.mentorId, arr);
  }
  const rollups: MentorRollup[] = [];
  for (const [mentorId, list] of byMentor) {
    const mentees = new Set<string>();
    let ratingSum = 0;
    let ratingCount = 0;
    let progressSum = 0;
    let progressCount = 0;
    const weakSeen = new Map<string, { first: number; last: number }>();
    const strongSeen = new Map<string, { first: number; last: number }>();
    for (const f of list) {
      mentees.add(f.menteeId);
      if (isFiniteRating(f.rating)) { ratingSum += f.rating; ratingCount += 1; }
      if (isFiniteProgress(f.goalProgress)) { progressSum += f.goalProgress; progressCount += 1; }
      for (const a of f.weakAreas) trackExtremes(weakSeen, a, f.submittedAt);
      for (const a of f.strengths) trackExtremes(strongSeen, a, f.submittedAt);
    }
    const weakAreaFrequency = Array.from(weakSeen.entries()).map(([area, range]) => {
      const occurrences = countOccurrences(list, "weakAreas", area);
      return buildWeakArea(area, occurrences, range, list.length);
    });
    const strongAreaFrequency = Array.from(strongSeen.entries()).map(([area, range]) => ({
      area,
      occurrences: countOccurrences(list, "strengths", area),
      firstSeen: range.first,
      lastSeen: range.last,
    }));
    const avgRating = ratingCount === 0 ? 0 : ratingSum / ratingCount;
    const goalCoverageRate = progressCount === 0 ? 0 : clampUnit(progressSum / (progressCount * 100));
    rollups.push({
      mentorId,
      totalSessions: list.length,
      avgRating: round2(avgRating),
      totalMentees: mentees.size,
      weakAreaFrequency,
      strongAreaFrequency,
      goalCoverageRate: round3(goalCoverageRate),
      compositeScore: round3(computeMentorComposite(avgRating, goalCoverageRate, weakAreaFrequency.length, list.length)),
    });
  }
  return rollups.sort((a, b) => b.compositeScore - a.compositeScore);
}

export function rollupMentees(
  feedbacks: ReadonlyArray<SessionFeedback>,
): ReadonlyArray<MenteeRollup> {
  const byMentee = new Map<string, SessionFeedback[]>();
  for (const f of feedbacks) {
    const arr = byMentee.get(f.menteeId) ?? [];
    arr.push(f as SessionFeedback);
    byMentee.set(f.menteeId, arr);
  }
  const rollups: MenteeRollup[] = [];
  for (const [menteeId, list] of byMentee) {
    const mentors = new Set<string>();
    const weakTally = new Map<string, { first: number; last: number; occurrences: number }>();
    let lastTouched: number | null = null;
    for (const f of list) {
      mentors.add(f.mentorId);
      for (const a of f.weakAreas) {
        const key = a.toLowerCase().trim();
        if (!key) continue;
        const v = weakTally.get(key) ?? { first: f.submittedAt, last: f.submittedAt, occurrences: 0 };
        v.first = Math.min(v.first, f.submittedAt);
        v.last = Math.max(v.last, f.submittedAt);
        v.occurrences += 1;
        weakTally.set(key, v);
      }
      if (lastTouched === null || f.submittedAt > lastTouched) lastTouched = f.submittedAt;
    }
    const weakAreas = Array.from(weakTally.entries()).map(([area, info]) =>
      buildWeakArea(area, info.occurrences, { first: info.first, last: info.last }, list.length),
    );
    rollups.push({
      menteeId,
      totalSessions: list.length,
      mentorCount: mentors.size,
      weakAreas,
      improvementRate: round3(computeMenteeImprovement(list)),
      currentMentorIds: [...mentors],
      lastTouchedAt: lastTouched,
    });
  }
  return rollups.sort((a, b) => b.totalSessions - a.totalSessions);
}

// ---------- WEAK-AREA DETECTION -----------------------------------------

export function detectWeakAreas(
  rollup: ReadonlyArray<MentorRollup> | MentorRollup,
  opts: WeakAreaDetectionOptions,
): ReadonlyArray<WeakArea> {
  const mentors = Array.isArray(rollup) ? rollup : [rollup];
  const min = Math.max(1, opts.minOccurrences);
  const bucket = (opts.bucketWindowDays ?? 30) * MS_PER_DAY;
  const catalog = opts.resourceCatalog ?? DEFAULT_RESOURCE_CATALOG;
  const tally = new Map<string, {
    occurrences: number;
    mentorIds: Set<string>;
    firstSeen: number;
    lastSeen: number;
    severityVote: SeverityLevel;
  }>();
  for (const m of mentors) {
    for (const w of m.weakAreaFrequency) {
      if (w.occurrences < min) continue;
      const cur = tally.get(w.area) ?? {
        occurrences: 0,
        mentorIds: new Set<string>(),
        firstSeen: w.firstSeen,
        lastSeen: w.lastSeen,
        severityVote: w.severity,
      };
      cur.occurrences += w.occurrences;
      cur.mentorIds.add(m.mentorId);
      cur.firstSeen = Math.min(cur.firstSeen, w.firstSeen);
      cur.lastSeen = Math.max(cur.lastSeen, w.lastSeen);
      if (severityRank(w.severity) > severityRank(cur.severityVote)) cur.severityVote = w.severity;
      tally.set(w.area, cur);
    }
  }
  const out: WeakArea[] = [];
  for (const [area, info] of tally) {
    const spread = (info.lastSeen - info.firstSeen) / Math.max(1, bucket);
    const severity: SeverityLevel =
      info.occurrences >= 5 || (spread >= 3 && info.occurrences >= 3) ? "critical"
        : info.occurrences >= 3 || spread >= 2 ? "high"
        : info.occurrences >= 2 ? "moderate"
        : "low";
    out.push({
      area,
      severity,
      occurrences: info.occurrences,
      firstSeen: info.firstSeen,
      lastSeen: info.lastSeen,
      suggestedResources: suggestResourcesFromCatalog(area, catalog),
    });
  }
  return out.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.occurrences - a.occurrences);
}

// ---------- GOAL COVERAGE ------------------------------------------------

export function getGoalCoverage(
  feedbacks: ReadonlyArray<SessionFeedback>,
  goalIds: ReadonlyArray<string>,
): ReadonlyArray<GoalCoverage> {
  const target = new Set<string>(goalIds);
  const byGoal = new Map<string, { mentions: number; mentors: Set<string>; last: number | null }>();
  for (const g of goalIds) byGoal.set(g, { mentions: 0, mentors: new Set<string>(), last: null });
  for (const f of feedbacks) {
    if (!f.goalIds) continue;
    for (const gid of f.goalIds) {
      if (!target.has(gid)) continue;
      const v = byGoal.get(gid);
      if (!v) continue;
      v.mentions += 1;
      v.mentors.add(f.mentorId);
      if (v.last === null || f.submittedAt > v.last) v.last = f.submittedAt;
    }
  }
  const out: GoalCoverage[] = [];
  for (const [goalId, info] of byGoal) {
    const mentor = Math.min(1, info.mentors.size / 2);
    const mention = Math.min(1, info.mentions / 3);
    out.push({
      goalId,
      mentorCount: info.mentors.size,
      totalMentions: info.mentions,
      lastTouchedAt: info.last,
      coverageScore: round3(clampUnit(0.6 * mentor + 0.4 * mention)),
      mentorIds: [...info.mentors],
    });
  }
  return out.sort((a, b) => b.coverageScore - a.coverageScore);
}

// ---------- MENTOR EFFECTIVENESS ----------------------------------------

export function compareMentorEffectiveness(
  rollups: ReadonlyArray<MentorRollup>,
): ReadonlyArray<MentorEffectivenessRow> {
  const rows: MentorEffectivenessRow[] = rollups.map((r) => ({
    mentorId: r.mentorId,
    compositeScore: r.compositeScore,
    avgRating: r.avgRating,
    goalCoverageRate: r.goalCoverageRate,
    weakAreaRate: round3(r.totalSessions === 0 ? 0 : r.weakAreaFrequency.length / r.totalSessions),
    sessionCount: r.totalSessions,
    rank: 0,
  }));
  rows.sort((a, b) => b.compositeScore - a.compositeScore);
  return rows.map((row, idx) => ({ ...row, rank: idx + 1 }));
}

// ---------- TREND --------------------------------------------------------

export function feedbackTrend(
  feedbacks: ReadonlyArray<SessionFeedback>,
  periodDays: number = DEFAULT_TREND_PERIOD_DAYS,
  bucketCount: number = DEFAULT_TREND_BUCKET_COUNT,
  now: number = Date.now(),
): FeedbackTrend {
  if (feedbacks.length === 0 || bucketCount < 1) return emptyTrend();
  const safeBuckets = Math.max(1, Math.floor(bucketCount));
  const bucketMs = Math.max(1, periodDays) * MS_PER_DAY;
  const windowMs = bucketMs * safeBuckets;
  const start = now - windowMs;
  const inWindow = feedbacks.filter((f) => f.submittedAt >= start && f.submittedAt <= now);
  if (inWindow.length === 0) return emptyTrend();
  const buckets: TrendBucket[] = [];
  for (let i = 0; i < safeBuckets; i++) {
    const periodStart = start + i * bucketMs;
    const periodEnd = i === safeBuckets - 1 ? now : periodStart + bucketMs;
    const slice = inWindow.filter((f) => f.submittedAt >= periodStart && f.submittedAt <= periodEnd);
    let ratingSum = 0; let ratingN = 0; let progSum = 0; let progN = 0; let weakCount = 0;
    for (const f of slice) {
      if (isFiniteRating(f.rating)) { ratingSum += f.rating; ratingN += 1; }
      if (isFiniteProgress(f.goalProgress)) { progSum += f.goalProgress; progN += 1; }
      weakCount += countStrings(f.weakAreas);
    }
    buckets.push({
      periodStart,
      periodEnd,
      avgRating: round2(ratingN === 0 ? 0 : ratingSum / ratingN),
      avgGoalProgress: round2(progN === 0 ? 0 : progSum / progN),
      sessionCount: slice.length,
      weakAreaCount: weakCount,
    });
  }
  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  const ratingDelta = last.avgRating - first.avgRating;
  const progressDelta = last.avgGoalProgress - first.avgGoalProgress;
  const ratingSlope = ratingDelta / Math.max(1, bucketMs * (buckets.length - 1));
  const direction: TrendDirection =
    ratingSlope > 0.0000008 ? "improving" : ratingSlope < -0.0000008 ? "declining" : "stable";
  return {
    direction,
    buckets,
    ratingDelta: round2(ratingDelta),
    progressDelta: round2(progressDelta),
    confidence: round3(Math.min(1, inWindow.length / 10)),
  };
}

function emptyTrend(): FeedbackTrend {
  return { direction: "insufficient_data", buckets: [], ratingDelta: 0, progressDelta: 0, confidence: 0 };
}

// ---------- INTERNAL -----------------------------------------------------

function trackExtremes(
  store: Map<string, { first: number; last: number }>,
  raw: string,
  ts: number,
): void {
  const key = raw.toLowerCase().trim();
  if (!key) return;
  const v = store.get(key) ?? { first: ts, last: ts };
  v.first = Math.min(v.first, ts);
  v.last = Math.max(v.last, ts);
  store.set(key, v);
}

function countOccurrences(
  list: ReadonlyArray<SessionFeedback>,
  field: "weakAreas" | "strengths",
  area: string,
): number {
  let n = 0;
  for (const f of list) {
    for (const a of f[field]) if (a.toLowerCase().trim() === area) { n += 1; break; }
  }
  return n;
}

function buildWeakArea(
  area: string,
  occurrences: number,
  range: { first: number; last: number },
  totalForMentor: number,
): WeakArea {
  const ratio = totalForMentor === 0 ? 0 : occurrences / totalForMentor;
  const severity: SeverityLevel =
    occurrences >= 3 || ratio >= 0.5 ? "critical"
    : occurrences >= 2 || ratio >= 0.34 ? "high"
    : occurrences === 1 && ratio >= 0.34 ? "moderate"
    : "low";
  return {
    area, severity, occurrences,
    firstSeen: range.first, lastSeen: range.last,
    suggestedResources: suggestResourcesFromCatalog(area, DEFAULT_RESOURCE_CATALOG),
  };
}

function isFiniteRating(n: number): boolean {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 5;
}
function isFiniteProgress(n: number): boolean {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100;
}
function countStrings(arr: ReadonlyArray<string>): number {
  let n = 0;
  for (const s of arr) if (typeof s === "string" && s.trim().length > 0) n++;
  return n;
}
function clampUnit(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
}
function round2(n: number): number {
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}
function round3(n: number): number {
  return Number.isFinite(n) ? Math.round(n * 1000) / 1000 : 0;
}
function severityRank(s: SeverityLevel): number {
  switch (s) { case "low": return 0; case "moderate": return 1; case "high": return 2; case "critical": return 3; }
}
function suggestResourcesFromCatalog(
  area: string,
  catalog: ReadonlyArray<{ area: string; resource: string }>,
): ReadonlyArray<string> {
  const key = area.toLowerCase().trim();
  const out: string[] = [];
  for (const row of catalog) if (row.area.toLowerCase().trim() === key) out.push(row.resource);
  return out;
}
function computeMentorComposite(
  avgRating: number,
  goalCoverageRate: number,
  weakAreaCount: number,
  sessionCount: number,
): number {
  const ratingScore = clampUnit(avgRating / 5);
  const coverageScore = clampUnit(goalCoverageRate);
  const penalty = sessionCount === 0 ? 0 : clampUnit(weakAreaCount / sessionCount);
  return clampUnit(
    ratingScore * EFFECTIVENESS_WEIGHTS.rating +
      coverageScore * EFFECTIVENESS_WEIGHTS.coverage -
      penalty * EFFECTIVENESS_WEIGHTS.weakAreaPenalty,
  );
}
function computeMenteeImprovement(feedbacks: ReadonlyArray<SessionFeedback>): number {
  if (feedbacks.length === 0) return 0;
  const sorted = [...feedbacks].sort((a, b) => a.submittedAt - b.submittedAt);
  const mid = Math.ceil(sorted.length / 2);
  const ratingDelta = (avgRatingOf(sorted.slice(mid)) - avgRatingOf(sorted.slice(0, mid))) / 5;
  const progressDelta = (avgProgress(sorted.slice(mid)) - avgProgress(sorted.slice(0, mid))) / 100;
  return clampUnit(0.5 + 0.5 * (ratingDelta + progressDelta));
}
function avgProgress(feedbacks: ReadonlyArray<SessionFeedback>): number {
  if (feedbacks.length === 0) return 0;
  let sum = 0; let n = 0;
  for (const f of feedbacks) if (isFiniteProgress(f.goalProgress)) { sum += f.goalProgress; n += 1; }
  return n === 0 ? 0 : sum / n;
}
function avgRatingOf(feedbacks: ReadonlyArray<SessionFeedback>): number {
  if (feedbacks.length === 0) return 0;
  let sum = 0; let n = 0;
  for (const f of feedbacks) if (isFiniteRating(f.rating)) { sum += f.rating; n += 1; }
  return n === 0 ? 0 : sum / n;
}
