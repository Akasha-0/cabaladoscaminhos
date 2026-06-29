// src/lib/w39/profile-mentor-pipeline.ts
// Profile mentor pipeline analytics: prospect → onboarding → active →
// graduated → alumni, with conversion rates, dwell windows, and
// bottleneck detection. Composes:
//   - w38/profile-alumni-showcase (AlumniLevel, MentorTier, MentorStats)
//   - w36/w36-profile-mentor-badges-v2 (mentor tenure, badge catalog)
//   - w36/w36-mentorship-graduation-flow-v2 (graduation flow state)
//   - w38/mentorship-mentor-matching-v2 (MentorProfile, MenteeProfile)
//
// Pure TS, no runtime imports. Defensive against malformed inputs.

export type PipelineStage =
  | "prospect"
  | "onboarding"
  | "active"
  | "graduated"
  | "alumni"
  | "dormant"
  | "churned";

export type BottleneckSeverity = "low" | "medium" | "high" | "critical";

export interface PipelineStageMetrics {
  stage: PipelineStage;
  count: number;
  avgDwellDays: number;
  conversionToNext: number; // 0..1, exit rate to next stage (0 if terminal)
}

export interface PipelineTransition {
  stage: PipelineStage;
  at: number; // epoch ms
  reason: string;
}

export interface PipelineFlow {
  mentorId: string;
  currentStage: PipelineStage;
  enteredAt: number; // epoch ms
  dwellDays: number;
  transitions: PipelineTransition[];
  nextMilestone: string | null;
}

export interface ConversionRate {
  fromStage: PipelineStage;
  toStage: PipelineStage;
  rate: number; // 0..1
  medianTransitionDays: number;
  dropoffReasons: { reason: string; count: number }[];
}

export interface Bottleneck {
  stage: PipelineStage;
  avgDwellDays: number;
  expectedDwellDays: number;
  severity: BottleneckSeverity;
  suggestedIntervention: string;
}

export interface PipelineSummary {
  totalActive: number;
  totalAlumni: number;
  conversionByStage: Record<PipelineStage, number>;
  topBottlenecks: Bottleneck[];
  healthyStages: PipelineStage[];
}

export interface MentorFunnel {
  cohortWeek: string; // ISO yyyy-Www
  totalOnboarded: number;
  totalActive: number;
  totalGraduated: number;
  totalAlumni: number;
  retentionRate: number; // 0..1
}

export interface MentorPipelineRecord {
  mentorId: string;
  displayName: string;
  currentStage: PipelineStage;
  stageEnteredAt: number;
  onboardedAt: number | null;
  graduationDate: number | null;
  alumniSince: number | null;
  transitions: PipelineTransition[];
  cohortWeek: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PIPELINE_ORDER: PipelineStage[] = [
  "prospect",
  "onboarding",
  "active",
  "graduated",
  "alumni",
];

export const ALL_STAGES: PipelineStage[] = [
  ...PIPELINE_ORDER,
  "dormant",
  "churned",
];

export const STAGE_INDEX: Record<PipelineStage, number> = {
  prospect: 0,
  onboarding: 1,
  active: 2,
  graduated: 3,
  alumni: 4,
  dormant: -1,
  churned: -2,
};

export const STAGE_LABELS: Record<PipelineStage, string> = {
  prospect: "Prospect",
  onboarding: "Onboarding",
  active: "Active",
  graduated: "Graduated",
  alumni: "Alumni",
  dormant: "Dormant",
  churned: "Churned",
};

export const EXPECTED_DWELL_DAYS: Record<PipelineStage, number> = {
  prospect: 14,
  onboarding: 21,
  active: 120,
  graduated: 30,
  alumni: 365,
  dormant: 60,
  churned: 0,
};

export const BOTTLENECK_THRESHOLDS: { severity: BottleneckSeverity; ratio: number }[] = [
  { severity: "critical", ratio: 3.0 },
  { severity: "high", ratio: 2.0 },
  { severity: "medium", ratio: 1.5 },
];

const STAGE_NEXT: Record<PipelineStage, PipelineStage | null> = {
  prospect: "onboarding",
  onboarding: "active",
  active: "graduated",
  graduated: "alumni",
  alumni: null,
  dormant: null,
  churned: null,
};

export const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;
export const MAX_PIPELINE_TRANSITIONS = 32;
export const MAX_DROPOFF_REASONS = 5;
export const MAX_BOTTLENECK_REPORT = 3;
export const MEDIAN_TRANSITION_DAY_CAP = 365;
export const COHORT_WEEK_REGEX = /^\d{4}-W\d{2}$/;

// ============================================================================
// UTILS — defensive runtime
// ============================================================================

export function isValidStage(stage: string): stage is PipelineStage {
  return ALL_STAGES.includes(stage as PipelineStage);
}

export function safeNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function dayDiff(from: number, to: number): number {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.max(0, Math.floor((to - from) / DAY_MS));
}

export function stageIndex(stage: PipelineStage): number {
  return STAGE_INDEX[stage];
}

export function nextStage(stage: PipelineStage): PipelineStage | null {
  return STAGE_NEXT[stage] ?? null;
}

export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function weekKeyFromEpoch(epochMs: number): string {
  if (!Number.isFinite(epochMs) || epochMs <= 0) return "1970-W01";
  const d = new Date(epochMs);
  if (Number.isNaN(d.getTime())) return "1970-W01";
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() + 3 - dayNr);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNr = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() + 3 - firstDayNr);
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
  const isoWeek = Math.max(1, Math.min(53, week));
  return `${target.getUTCFullYear()}-W${String(isoWeek).padStart(2, "0")}`;
}

export function severityForRatio(ratio: number): BottleneckSeverity {
  const sorted = [...BOTTLENECK_THRESHOLDS].sort((a, b) => b.ratio - a.ratio);
  for (const t of sorted) {
    if (ratio >= t.ratio) return t.severity;
  }
  return "low";
}

// ============================================================================
// RECORD NORMALIZATION
// ============================================================================

function parseTransitions(raw: unknown): PipelineTransition[] {
  if (!Array.isArray(raw)) return [];
  const out: PipelineTransition[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const stageStr = typeof rec["stage"] === "string" ? rec["stage"] : null;
    if (!stageStr || !isValidStage(stageStr)) continue;
    const at = safeNumber(rec["at"], 0);
    const reason = typeof rec["reason"] === "string" ? rec["reason"] : "unspecified";
    out.push({ stage: stageStr, at, reason });
    if (out.length >= MAX_PIPELINE_TRANSITIONS) break;
  }
  out.sort((a, b) => a.at - b.at);
  return out;
}

export function normalizeMentorRecord(input: unknown): MentorPipelineRecord | null {
  if (!input || typeof input !== "object") return null;
  const rec = input as Record<string, unknown>;
  if (typeof rec["mentorId"] !== "string" || rec["mentorId"].length === 0) return null;
  const stageEnteredAt = safeNumber(rec["stageEnteredAt"], Date.now());
  const onboardedAt =
    rec["onboardedAt"] === null || rec["onboardedAt"] === undefined
      ? null
      : safeNumber(rec["onboardedAt"], stageEnteredAt);
  const graduationDate =
    rec["graduationDate"] === null || rec["graduationDate"] === undefined
      ? null
      : safeNumber(rec["graduationDate"], 0);
  const alumniSince =
    rec["alumniSince"] === null || rec["alumniSince"] === undefined
      ? null
      : safeNumber(rec["alumniSince"], 0);
  const cohortWeekRaw = rec["cohortWeek"];
  const cohortWeek =
    typeof cohortWeekRaw === "string" && COHORT_WEEK_REGEX.test(cohortWeekRaw)
      ? cohortWeekRaw
      : onboardedAt !== null
        ? weekKeyFromEpoch(onboardedAt)
        : null;
  return {
    mentorId: rec["mentorId"],
    displayName:
      typeof rec["displayName"] === "string" ? rec["displayName"] : "Anonymous",
    currentStage: isValidStage(String(rec["currentStage"]))
      ? (rec["currentStage"] as PipelineStage)
      : "prospect",
    stageEnteredAt,
    onboardedAt,
    graduationDate,
    alumniSince,
    transitions: parseTransitions(rec["transitions"]),
    cohortWeek,
  };
}

// ============================================================================
// PIPELINE FLOW
// ============================================================================

function nextMilestoneFor(stage: PipelineStage, mentor: MentorPipelineRecord): string | null {
  switch (stage) {
    case "prospect": return "Complete onboarding intake";
    case "onboarding": return "Match with first mentee";
    case "active": return "Reach graduation criteria";
    case "graduated": return "Promote to alumni";
    case "alumni": return "Mentor next cohort";
    case "dormant": return "Re-engage with outreach";
    case "churned":
      return mentor.graduationDate === null ? null : "Schedule alumni re-onboarding";
  }
}

export function computePipelineFlow(
  mentor: MentorPipelineRecord | null,
  history: PipelineTransition[] | null,
  now?: number,
): PipelineFlow {
  const nowMs = Number.isFinite(now) ? (now as number) : Date.now();
  if (!mentor) {
    return {
      mentorId: "unknown",
      currentStage: "prospect",
      enteredAt: nowMs,
      dwellDays: 0,
      transitions: [],
      nextMilestone: null,
    };
  }
  const transitions =
    history && history.length > 0 ? history : mentor.transitions;
  const lastTransition =
    transitions.length > 0 ? transitions[transitions.length - 1] : null;
  const enteredAt =
    mentor.stageEnteredAt > 0
      ? mentor.stageEnteredAt
      : lastTransition
        ? lastTransition.at
        : (mentor.onboardedAt ?? nowMs);
  return {
    mentorId: mentor.mentorId,
    currentStage: mentor.currentStage,
    enteredAt,
    dwellDays: dayDiff(enteredAt, nowMs),
    transitions,
    nextMilestone: nextMilestoneFor(mentor.currentStage, mentor),
  };
}

// ============================================================================
// STAGE METRICS & CONVERSION
// ============================================================================

type Buckets = Record<PipelineStage, { total: number; totalDwell: number }>;

function emptyBuckets(): Buckets {
  return {
    prospect: { total: 0, totalDwell: 0 },
    onboarding: { total: 0, totalDwell: 0 },
    active: { total: 0, totalDwell: 0 },
    graduated: { total: 0, totalDwell: 0 },
    alumni: { total: 0, totalDwell: 0 },
    dormant: { total: 0, totalDwell: 0 },
    churned: { total: 0, totalDwell: 0 },
  };
}

function cumulativeAfterStage(buckets: Buckets, stage: PipelineStage): number {
  const idx = STAGE_INDEX[stage];
  if (idx < 0) return 0;
  let total = 0;
  for (const s of PIPELINE_ORDER) {
    if (STAGE_INDEX[s] > idx) total += buckets[s].total;
  }
  return total;
}

export function computeStageMetrics(
  mentors: ReadonlyArray<MentorPipelineRecord | null | undefined>,
  now?: number,
): PipelineStageMetrics[] {
  const nowMs = Number.isFinite(now) ? (now as number) : Date.now();
  const safe = mentors.filter((m): m is MentorPipelineRecord => m !== null && m !== undefined);
  const buckets = emptyBuckets();
  for (const m of safe) {
    const enteredAt = m.stageEnteredAt > 0 ? m.stageEnteredAt : (m.onboardedAt ?? nowMs);
    const dwell = dayDiff(enteredAt, nowMs);
    buckets[m.currentStage].total += 1;
    buckets[m.currentStage].totalDwell += dwell;
  }
  return ALL_STAGES.map((stage): PipelineStageMetrics => {
    const b = buckets[stage];
    const nxt = STAGE_NEXT[stage];
    let conversion = 0;
    if (nxt !== null && b.total > 0) {
      const cumulativeAfter = cumulativeAfterStage(buckets, nxt);
      if (cumulativeAfter > 0) {
        conversion = clamp01(cumulativeAfter / (b.total + cumulativeAfter));
      }
    }
    return {
      stage,
      count: b.total,
      avgDwellDays: b.total === 0 ? 0 : Math.round(b.totalDwell / b.total),
      conversionToNext: conversion,
    };
  });
}

function computeDropoffReasons(
  transitions: PipelineTransition[],
  fromStage: PipelineStage,
  toStage: PipelineStage,
): { reason: string; count: number }[] {
  const counts = new Map<string, number>();
  let seenFrom = false;
  for (const t of transitions) {
    if (t.stage === fromStage) {
      seenFrom = true;
      continue;
    }
    if (seenFrom && t.stage !== toStage) {
      counts.set(t.reason, (counts.get(t.reason) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_DROPOFF_REASONS)
    .map(([reason, count]) => ({ reason, count }));
}

export function computeConversionRates(
  metrics: ReadonlyArray<PipelineStageMetrics | null | undefined>,
  transitions?: ReadonlyArray<PipelineTransition | null | undefined>,
): ConversionRate[] {
  const safeMetrics = metrics.filter(
    (m): m is PipelineStageMetrics => m !== null && m !== undefined,
  );
  const safeTransitions = (transitions ?? []).filter(
    (t): t is PipelineTransition => t !== null && t !== undefined,
  );
  const out: ConversionRate[] = [];
  for (const m of safeMetrics) {
    const nxt = STAGE_NEXT[m.stage];
    if (nxt === null) continue;
    const sourceIdx = safeTransitions.findIndex((t) => t.stage === m.stage);
    const targetIdx = safeTransitions.findIndex((t) => t.stage === nxt);
    const transitionDays: number[] = [m.avgDwellDays];
    if (sourceIdx >= 0 && targetIdx > sourceIdx) {
      transitionDays.push(
        dayDiff(safeTransitions[sourceIdx].at, safeTransitions[targetIdx].at),
      );
    }
    out.push({
      fromStage: m.stage,
      toStage: nxt,
      rate: m.conversionToNext,
      medianTransitionDays: Math.min(MEDIAN_TRANSITION_DAY_CAP, median(transitionDays)),
      dropoffReasons: computeDropoffReasons(safeTransitions, m.stage, nxt),
    });
  }
  return out;
}

// ============================================================================
// BOTTLENECK DETECTION
// ============================================================================

function suggestIntervention(stage: PipelineStage, severity: BottleneckSeverity): string {
  const verb =
    severity === "critical" ? "urgent" : severity === "high" ? "prompt" : "routine";
  switch (stage) {
    case "prospect":
      return `Trigger ${verb} onboarding-outreach campaign`;
    case "onboarding":
      return `${verb} review of onboarding friction; consider pairing mentor with concierge`;
    case "active":
      return `${verb} wellness check-in; assess mentee load and graduation readiness`;
    case "graduated":
      return `${verb} alumni-handoff ceremony scheduling`;
    case "alumni":
      return `${verb} reactivation program; consider spotlight or special project invite`;
    case "dormant":
      return `Re-engagement drip sequence — ${verb} priority`;
    case "churned":
      return `Win-back campaign (${verb})`;
  }
}

const SEVERITY_RANK: Record<BottleneckSeverity, number> = {
  critical: 3,
  high: 2,
  medium: 1,
  low: 0,
};

export function detectBottlenecks(
  metrics: ReadonlyArray<PipelineStageMetrics | null | undefined>,
  expectedDwellDays?: Partial<Record<PipelineStage, number>>,
): Bottleneck[] {
  const safe = metrics.filter(
    (m): m is PipelineStageMetrics => m !== null && m !== undefined,
  );
  const expected = expectedDwellDays ?? EXPECTED_DWELL_DAYS;
  const bottlenecks: Bottleneck[] = [];
  for (const m of safe) {
    const exp = expected[m.stage] ?? EXPECTED_DWELL_DAYS[m.stage];
    if (exp <= 0 || m.count === 0) continue;
    const ratio = m.avgDwellDays / exp;
    const severity = severityForRatio(ratio);
    if (severity === "low" && ratio < 1.5) continue;
    bottlenecks.push({
      stage: m.stage,
      avgDwellDays: m.avgDwellDays,
      expectedDwellDays: exp,
      severity,
      suggestedIntervention: suggestIntervention(m.stage, severity),
    });
  }
  return bottlenecks.sort((a, b) => {
    const sevDiff = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (sevDiff !== 0) return sevDiff;
    const aRatio = a.avgDwellDays / Math.max(1, a.expectedDwellDays);
    const bRatio = b.avgDwellDays / Math.max(1, b.expectedDwellDays);
    return bRatio - aRatio;
  });
}

// ============================================================================
// SUMMARY & FUNNEL
// ============================================================================

export function summarizePipeline(
  mentors: ReadonlyArray<MentorPipelineRecord | null | undefined>,
  now?: number,
): PipelineSummary {
  const safe = mentors.filter(
    (m): m is MentorPipelineRecord => m !== null && m !== undefined,
  );
  const metrics = computeStageMetrics(safe, now);
  const bottlenecks = detectBottlenecks(metrics);
  const conversionByStage: Record<PipelineStage, number> = {
    prospect: 0,
    onboarding: 0,
    active: 0,
    graduated: 0,
    alumni: 0,
    dormant: 0,
    churned: 0,
  };
  let totalActive = 0;
  let totalAlumni = 0;
  for (const m of metrics) {
    conversionByStage[m.stage] = m.conversionToNext;
    if (m.stage === "active") totalActive = m.count;
    if (m.stage === "alumni") totalAlumni = m.count;
  }
  const bottleneckStages = new Set(bottlenecks.map((b) => b.stage));
  const healthyStages: PipelineStage[] = [];
  for (const m of metrics) {
    if (m.count === 0) continue;
    if (!bottleneckStages.has(m.stage) && STAGE_NEXT[m.stage] !== null) {
      healthyStages.push(m.stage);
    }
  }
  return {
    totalActive,
    totalAlumni,
    conversionByStage,
    topBottlenecks: bottlenecks.slice(0, MAX_BOTTLENECK_REPORT),
    healthyStages,
  };
}

export function buildMentorFunnel(
  mentors: ReadonlyArray<MentorPipelineRecord | null | undefined>,
): MentorFunnel[] {
  const safe = mentors.filter(
    (m): m is MentorPipelineRecord => m !== null && m !== undefined,
  );
  const buckets = new Map<
    string,
    { onboarded: number; active: number; graduated: number; alumni: number }
  >();
  for (const m of safe) {
    const wk = m.cohortWeek ?? weekKeyFromEpoch(m.onboardedAt ?? m.stageEnteredAt);
    const b = buckets.get(wk) ?? { onboarded: 0, active: 0, graduated: 0, alumni: 0 };
    if (
      m.onboardedAt !== null ||
      STAGE_INDEX[m.currentStage] >= STAGE_INDEX.onboarding
    ) {
      b.onboarded += 1;
    }
    if (STAGE_INDEX[m.currentStage] >= STAGE_INDEX.active) b.active += 1;
    if (m.currentStage === "graduated" || m.currentStage === "alumni") b.graduated += 1;
    if (m.currentStage === "alumni") b.alumni += 1;
    buckets.set(wk, b);
  }
  return Array.from(buckets.keys())
    .sort()
    .map((cohortWeek): MentorFunnel => {
      const b = buckets.get(cohortWeek)!;
      const denom = b.onboarded === 0 ? 1 : b.onboarded;
      return {
        cohortWeek,
        totalOnboarded: b.onboarded,
        totalActive: b.active,
        totalGraduated: b.graduated,
        totalAlumni: b.alumni,
        retentionRate: clamp01((b.active + b.alumni) / denom),
      };
    });
}

// ============================================================================
// REPORTING HELPERS
// ============================================================================

export function formatPipelineStage(stage: PipelineStage): string {
  return STAGE_LABELS[stage] ?? stage;
}

export function describeFlow(flow: PipelineFlow): string {
  return [
    `flow[${flow.mentorId}]: stage=${formatPipelineStage(flow.currentStage)}`,
    `dwell=${flow.dwellDays}d`,
    `transitions=${flow.transitions.length}`,
    `next=${flow.nextMilestone ?? "—"}`,
  ].join(" | ");
}

export function describeSummary(summary: PipelineSummary): string {
  return [
    `summary: active=${summary.totalActive}`,
    `alumni=${summary.totalAlumni}`,
    `bottlenecks=${summary.topBottlenecks.length}`,
    `healthy=${summary.healthyStages.length}`,
  ].join(" | ");
}

export function describeBottleneck(b: Bottleneck): string {
  return [
    `bottleneck[${b.stage}]: actual=${b.avgDwellDays}d`,
    `expected=${b.expectedDwellDays}d`,
    `severity=${b.severity}`,
    `→ ${b.suggestedIntervention}`,
  ].join(" | ");
}

export function describeConversion(c: ConversionRate): string {
  return [
    `${c.fromStage}→${c.toStage}`,
    `rate=${(c.rate * 100).toFixed(1)}%`,
    `median=${c.medianTransitionDays}d`,
    `dropoffs=${c.dropoffReasons.length}`,
  ].join(" | ");
}

export interface PipelineReport {
  metrics: PipelineStageMetrics[];
  conversion: ConversionRate[];
  bottlenecks: Bottleneck[];
  summary: PipelineSummary;
  funnel: MentorFunnel[];
}

export function buildPipelineReport(
  mentors: ReadonlyArray<MentorPipelineRecord | null | undefined>,
  transitionsByMentor?: Map<string, PipelineTransition[]>,
  now?: number,
): PipelineReport {
  const safe = mentors.filter(
    (m): m is MentorPipelineRecord => m !== null && m !== undefined,
  );
  const metrics = computeStageMetrics(safe, now);
  const allTransitions: PipelineTransition[] = [];
  if (transitionsByMentor) {
    for (const t of transitionsByMentor.values()) {
      if (Array.isArray(t)) allTransitions.push(...t);
    }
  } else {
    for (const m of safe) {
      if (Array.isArray(m.transitions)) allTransitions.push(...m.transitions);
    }
  }
  return {
    metrics,
    conversion: computeConversionRates(metrics, allTransitions),
    bottlenecks: detectBottlenecks(metrics),
    summary: summarizePipeline(safe, now),
    funnel: buildMentorFunnel(safe),
  };
}
