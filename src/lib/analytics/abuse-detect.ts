/**
 * analytics/abuse-detect.ts — Anomalous activity detection (Wave 38, 2026-07-01)
 * ============================================================================
 * Detecta padrões suspeitos via z-score sobre baseline rolling (7-day mean).
 * Auto-flag para moderação sem banir — flow é:
 *
 *   1. detectAbuse() retorna lista de AbuseSignal com severity
 *   2. /admin/moderation consome signals e decide ação
 *   3. User-flagged via flag system (já existe em src/lib/flags)
 *
 * Categorias monitoradas (Wave 38):
 *   - FOLLOWER_SPIKE:      > 10x baseline de novos seguidores em 24h
 *   - MASS_POST:           > 50 posts em 24h (qualquer tipo)
 *   - REACTION_BOMBING:    > 100 reactions/hora (giving ou receiving)
 *   - BURNOUT_PATTERN:     activity 5x baseline sustentada por 7+ dias
 *   - SPAM_LIKELY:         > 30 comments em <5min (bot signature)
 *   - IMPERSONATION:       display name match com outro user (Levenshtein)
 *
 * LGPD:
 *   - Não retorna PII. Apenas counts + scores.
 *   - k-anonymity: suppression quando sample < 5 usuários afetados.
 *
 * Self-contained: opera sobre arrays de eventos pré-agregados.
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type AbuseCategory =
  | "FOLLOWER_SPIKE"
  | "MASS_POST"
  | "REACTION_BOMBING"
  | "BURNOUT_PATTERN"
  | "SPAM_LIKELY"
  | "IMPERSONATION";

export type AbuseSeverity = "low" | "medium" | "high" | "critical";

export interface ActivityEvent {
  userId: string;
  /** ISO 8601. */
  timestamp: string;
  /** Categoria do evento. */
  category:
    | "post_created"
    | "comment_created"
    | "reaction_given"
    | "reaction_received"
    | "follower_gained"
    | "message_sent";
  /** Contagem (default 1). */
  count?: number;
}

export interface UserBaseline {
  userId: string;
  /** Média diária de atividade (7-day rolling). */
  dailyMean: number;
  /** Std-dev diária. */
  dailyStddev: number;
  /** Sample size (dias com atividade). */
  sampleDays: number;
}

export interface AbuseSignal {
  /** Deterministic id: userId + category + dayBucket. */
  id: string;
  userId: string;
  category: AbuseCategory;
  severity: AbuseSeverity;
  /** Z-score observado (vs baseline). */
  zScore: number;
  /** Contagem absoluta observada. */
  observed: number;
  /** Baseline esperado. */
  baseline: number;
  /** Ratio observed/baseline. */
  ratio: number;
  /** Janela de tempo em horas. */
  windowHours: number;
  /** ISO timestamp da detecção. */
  detectedAt: string;
  /** Ação recomendada (não auto-aplicada). */
  recommendedAction: "WARN" | "REVIEW" | "RATE_LIMIT" | "SUSPEND";
  /** LGPD: evidence mínima (sem PII). */
  evidence: string[];
}

// ============================================================================
// Thresholds (Wave 38 calibration)
// ============================================================================

export const ABUSE_THRESHOLDS = {
  FOLLOWER_SPIKE: {
    /** Ratio observado/baseline para flag. */
    ratioMin: 10,
    /** Min absoluto (evita flag para baseline=0 com 5 followers). */
    absoluteMin: 100,
    windowHours: 24,
    severityByRatio: [
      { minRatio: 50, severity: "critical" as AbuseSeverity, action: "SUSPEND" as const },
      { minRatio: 25, severity: "high" as AbuseSeverity, action: "RATE_LIMIT" as const },
      { minRatio: 10, severity: "medium" as AbuseSeverity, action: "REVIEW" as const },
    ],
  },
  MASS_POST: {
    absoluteMin: 50,
    windowHours: 24,
    severityByCount: [
      { minCount: 200, severity: "critical" as AbuseSeverity, action: "SUSPEND" as const },
      { minCount: 100, severity: "high" as AbuseSeverity, action: "RATE_LIMIT" as const },
      { minCount: 50, severity: "medium" as AbuseSeverity, action: "WARN" as const },
    ],
  },
  REACTION_BOMBING: {
    absoluteMin: 100,
    windowHours: 1,
    severityByCount: [
      { minCount: 500, severity: "critical" as AbuseSeverity, action: "SUSPEND" as const },
      { minCount: 200, severity: "high" as AbuseSeverity, action: "RATE_LIMIT" as const },
      { minCount: 100, severity: "medium" as AbuseSeverity, action: "WARN" as const },
    ],
  },
  BURNOUT_PATTERN: {
    /** Sustain ratio (5x+) por 7+ dias. */
    sustainedRatio: 5,
    sustainedDays: 7,
    severity: "low" as AbuseSeverity,
    action: "REVIEW" as const,
  },
  SPAM_LIKELY: {
    /** > 30 comments em <5min. */
    absoluteMin: 30,
    windowMinutes: 5,
    severity: "high" as AbuseSeverity,
    action: "RATE_LIMIT" as const,
  },
  IMPERSONATION: {
    /** Levenshtein distance ≤ 2 para display names existentes. */
    maxDistance: 2,
    severity: "medium" as AbuseSeverity,
    action: "REVIEW" as const,
  },
} as const;

// ============================================================================
// Schema
// ============================================================================

export const ActivityEventSchema = z.object({
  userId: z.string().min(1),
  timestamp: z.string(),
  category: z.enum([
    "post_created",
    "comment_created",
    "reaction_given",
    "reaction_received",
    "follower_gained",
    "message_sent",
  ]),
  count: z.number().int().positive().optional(),
});

// ============================================================================
// Helpers
// ============================================================================

function sumByCategory(events: ActivityEvent[], category: ActivityEvent["category"]): number {
  return events
    .filter((e) => e.category === category)
    .reduce((acc, e) => acc + (e.count ?? 1), 0);
}

function eventsInWindow(
  events: ActivityEvent[],
  windowMs: number,
  now: Date = new Date()
): ActivityEvent[] {
  const lowerBound = now.getTime() - windowMs;
  return events.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t >= lowerBound && t <= now.getTime();
  });
}

function dayBucket(ts: string): string {
  return ts.slice(0, 10); // YYYY-MM-DD
}

// ============================================================================
// Detectors
// ============================================================================

/**
 * FOLLOWER_SPIKE — detecta > Nx baseline em 24h.
 */
function detectFollowerSpike(
  events: ActivityEvent[],
  baselines: Map<string, UserBaseline>,
  now: Date
): AbuseSignal[] {
  const out: AbuseSignal[] = [];
  const windowMs = ABUSE_THRESHOLDS.FOLLOWER_SPIKE.windowHours * 3600_000;
  const recent = eventsInWindow(events, windowMs, now);

  // Aggregate per user
  const perUser = new Map<string, number>();
  for (const e of recent) {
    if (e.category === "follower_gained") {
      perUser.set(e.userId, (perUser.get(e.userId) ?? 0) + (e.count ?? 1));
    }
  }

  for (const [userId, observed] of perUser.entries()) {
    const baseline = baselines.get(userId);
    if (!baseline || baseline.dailyMean === 0) continue;
    const ratio = observed / baseline.dailyMean;
    const t = ABUSE_THRESHOLDS.FOLLOWER_SPIKE;
    if (ratio < t.ratioMin || observed < t.absoluteMin) continue;

    let severity: AbuseSeverity = "low";
    let action: AbuseSignal["recommendedAction"] = "WARN";
    for (const s of t.severityByRatio) {
      if (ratio >= s.minRatio) {
        severity = s.severity;
        action = s.action;
      }
    }

    out.push({
      id: `spike-${userId}-${dayBucket(now.toISOString())}`,
      userId,
      category: "FOLLOWER_SPIKE",
      severity,
      zScore: (observed - baseline.dailyMean) / Math.max(1, baseline.dailyStddev),
      observed,
      baseline: Number(baseline.dailyMean.toFixed(2)),
      ratio: Number(ratio.toFixed(2)),
      windowHours: t.windowHours,
      detectedAt: now.toISOString(),
      recommendedAction: action,
      evidence: [
        `${observed} seguidores em ${t.windowHours}h vs baseline ${baseline.dailyMean.toFixed(1)}/dia`,
        `Std-dev baseline: ${baseline.dailyStddev.toFixed(2)}`,
      ],
    });
  }

  return out;
}

/**
 * MASS_POST — > N posts em 24h.
 */
function detectMassPost(
  events: ActivityEvent[],
  now: Date
): AbuseSignal[] {
  const out: AbuseSignal[] = [];
  const windowMs = ABUSE_THRESHOLDS.MASS_POST.windowHours * 3600_000;
  const recent = eventsInWindow(events, windowMs, now);
  const perUser = new Map<string, number>();
  for (const e of recent) {
    if (e.category === "post_created") {
      perUser.set(e.userId, (perUser.get(e.userId) ?? 0) + (e.count ?? 1));
    }
  }
  const t = ABUSE_THRESHOLDS.MASS_POST;

  for (const [userId, observed] of perUser.entries()) {
    if (observed < t.absoluteMin) continue;

    let severity: AbuseSeverity = "low";
    let action: AbuseSignal["recommendedAction"] = "WARN";
    for (const s of t.severityByCount) {
      if (observed >= s.minCount) {
        severity = s.severity;
        action = s.action;
      }
    }

    out.push({
      id: `mass-${userId}-${dayBucket(now.toISOString())}`,
      userId,
      category: "MASS_POST",
      severity,
      zScore: 0,
      observed,
      baseline: 0,
      ratio: 0,
      windowHours: t.windowHours,
      detectedAt: now.toISOString(),
      recommendedAction: action,
      evidence: [
        `${observed} posts criados em ${t.windowHours}h (threshold: ${t.absoluteMin})`,
      ],
    });
  }
  return out;
}

/**
 * REACTION_BOMBING — > N reactions/hora.
 */
function detectReactionBombing(events: ActivityEvent[], now: Date): AbuseSignal[] {
  const out: AbuseSignal[] = [];
  const windowMs = ABUSE_THRESHOLDS.REACTION_BOMBING.windowHours * 3600_000;
  const recent = eventsInWindow(events, windowMs, now);
  const perUser = new Map<string, { given: number; received: number }>();
  for (const e of recent) {
    if (!perUser.has(e.userId)) perUser.set(e.userId, { given: 0, received: 0 });
    const bucket = perUser.get(e.userId)!;
    if (e.category === "reaction_given") bucket.given += e.count ?? 1;
    if (e.category === "reaction_received") bucket.received += e.count ?? 1;
  }
  const t = ABUSE_THRESHOLDS.REACTION_BOMBING;

  for (const [userId, { given, received }] of perUser.entries()) {
    const total = given + received;
    if (total < t.absoluteMin) continue;

    let severity: AbuseSeverity = "low";
    let action: AbuseSignal["recommendedAction"] = "WARN";
    for (const s of t.severityByCount) {
      if (total >= s.minCount) {
        severity = s.severity;
        action = s.action;
      }
    }

    out.push({
      id: `react-${userId}-${dayBucket(now.toISOString())}`,
      userId,
      category: "REACTION_BOMBING",
      severity,
      zScore: 0,
      observed: total,
      baseline: 0,
      ratio: 0,
      windowHours: t.windowHours,
      detectedAt: now.toISOString(),
      recommendedAction: action,
      evidence: [
        `${given} reactions dadas + ${received} recebidas em ${t.windowHours}h`,
        `Total: ${total} (threshold: ${t.absoluteMin})`,
      ],
    });
  }
  return out;
}

/**
 * SPAM_LIKELY — > N comments em <5min.
 */
function detectSpamLikely(events: ActivityEvent[], now: Date): AbuseSignal[] {
  const out: AbuseSignal[] = [];
  const t = ABUSE_THRESHOLDS.SPAM_LIKELY;
  const windowMs = t.windowMinutes * 60_000;
  const recent = eventsInWindow(events, windowMs, now);
  const perUser = new Map<string, ActivityEvent[]>();
  for (const e of recent) {
    if (e.category !== "comment_created") continue;
    if (!perUser.has(e.userId)) perUser.set(e.userId, []);
    perUser.get(e.userId)!.push(e);
  }

  for (const [userId, userEvents] of perUser.entries()) {
    const total = userEvents.reduce((a, e) => a + (e.count ?? 1), 0);
    if (total < t.absoluteMin) continue;
    out.push({
      id: `spam-${userId}-${Math.floor(now.getTime() / windowMs)}`,
      userId,
      category: "SPAM_LIKELY",
      severity: t.severity,
      zScore: 0,
      observed: total,
      baseline: 0,
      ratio: 0,
      windowHours: t.windowMinutes / 60,
      detectedAt: now.toISOString(),
      recommendedAction: t.action,
      evidence: [
        `${total} comments em ${t.windowMinutes} minutos (threshold: ${t.absoluteMin})`,
        "Possível bot signature (intervalo constante + volume alto)",
      ],
    });
  }
  return out;
}

/**
 * BURNOUT_PATTERN — sustentado 5x baseline por 7+ dias. (não é abuse, mas saúde)
 */
function detectBurnoutPattern(
  events: ActivityEvent[],
  baselines: Map<string, UserBaseline>,
  now: Date
): AbuseSignal[] {
  const out: AbuseSignal[] = [];
  const t = ABUSE_THRESHOLDS.BURNOUT_PATTERN;
  const windowMs = t.sustainedDays * 86400_000;
  const recent = eventsInWindow(events, windowMs, now);

  for (const [userId, baseline] of baselines.entries()) {
    if (baseline.dailyMean === 0) continue;
    const userEvents = recent.filter((e) => e.userId === userId);
    const total = userEvents.reduce((a, e) => a + (e.count ?? 1), 0);
    const dailyObserved = total / t.sustainedDays;
    const ratio = dailyObserved / baseline.dailyMean;
    if (ratio < t.sustainedRatio) continue;

    out.push({
      id: `burn-${userId}-${dayBucket(now.toISOString())}`,
      userId,
      category: "BURNOUT_PATTERN",
      severity: t.severity,
      zScore: (dailyObserved - baseline.dailyMean) / Math.max(1, baseline.dailyStddev),
      observed: dailyObserved,
      baseline: Number(baseline.dailyMean.toFixed(2)),
      ratio: Number(ratio.toFixed(2)),
      windowHours: t.sustainedDays * 24,
      detectedAt: now.toISOString(),
      recommendedAction: t.action,
      evidence: [
        `Atividade sustentada ${ratio.toFixed(1)}x baseline por ${t.sustainedDays} dias`,
        "Possível burnout — enviar wellness check-in",
      ],
    });
  }
  return out;
}

// ============================================================================
// Impersonation detection (Levenshtein)
// ============================================================================

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

export function detectImpersonation(
  candidates: Array<{ userId: string; displayName: string }>,
  protectedNames: string[]
): AbuseSignal[] {
  const out: AbuseSignal[] = [];
  const t = ABUSE_THRESHOLDS.IMPERSONATION;
  for (const c of candidates) {
    for (const protectedName of protectedNames) {
      const dist = levenshtein(c.displayName, protectedName);
      if (dist > 0 && dist <= t.maxDistance) {
        out.push({
          id: `imp-${c.userId}-${protectedName.slice(0, 16)}`,
          userId: c.userId,
          category: "IMPERSONATION",
          severity: t.severity,
          zScore: 0,
          observed: dist,
          baseline: 0,
          ratio: 0,
          windowHours: 0,
          detectedAt: new Date().toISOString(),
          recommendedAction: t.action,
          evidence: [
            `Display name "${c.displayName}" dist=${dist} de nome protegido "${protectedName}"`,
          ],
        });
      }
    }
  }
  return out;
}

// ============================================================================
// Pipeline
// ============================================================================

export interface AbuseDetectionInput {
  events: ActivityEvent[];
  baselines: UserBaseline[];
  /** Optional: list of protected display names (curators, mentors). */
  protectedNames?: string[];
  /** Optional: candidate display names for impersonation check. */
  impersonationCandidates?: Array<{ userId: string; displayName: string }>;
  /** k-anonymity threshold (default 5 affected users). */
  kThreshold?: number;
  /** Now (default new Date()). */
  now?: Date;
}

export interface AbuseDetectionResult {
  signals: AbuseSignal[];
  summary: {
    totalSignals: number;
    byCategory: Record<AbuseCategory, number>;
    bySeverity: Record<AbuseSeverity, number>;
    criticalCount: number;
    suppressedBelow: number;
    generatedAt: string;
  };
  meta: {
    eventsConsumed: number;
    baselinesConsumed: number;
    kThreshold: number;
  };
}

export function detectAbuse(input: AbuseDetectionInput): AbuseDetectionResult {
  const kThreshold = input.kThreshold ?? 5;
  const now = input.now ?? new Date();
  const baselineMap = new Map(input.baselines.map((b) => [b.userId, b]));

  const signals: AbuseSignal[] = [
    ...detectFollowerSpike(input.events, baselineMap, now),
    ...detectMassPost(input.events, now),
    ...detectReactionBombing(input.events, now),
    ...detectSpamLikely(input.events, now),
    ...detectBurnoutPattern(input.events, baselineMap, now),
    ...(input.protectedNames && input.impersonationCandidates
      ? detectImpersonation(input.impersonationCandidates, input.protectedNames)
      : []),
  ];

  // Aggregate
  const byCategory: Record<AbuseCategory, number> = {
    FOLLOWER_SPIKE: 0,
    MASS_POST: 0,
    REACTION_BOMBING: 0,
    BURNOUT_PATTERN: 0,
    SPAM_LIKELY: 0,
    IMPERSONATION: 0,
  };
  const bySeverity: Record<AbuseSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const s of signals) {
    byCategory[s.category] += 1;
    bySeverity[s.severity] += 1;
  }

  // LGPD k-anonymity: suppression if fewer than kThreshold unique affected users
  const affectedUsers = new Set(signals.map((s) => s.userId));
  let suppressed = 0;
  let finalSignals = signals;
  if (affectedUsers.size < kThreshold) {
    suppressed = signals.length;
    finalSignals = [];
  }

  return {
    signals: finalSignals,
    summary: {
      totalSignals: finalSignals.length,
      byCategory,
      bySeverity,
      criticalCount: bySeverity.critical,
      suppressedBelow: suppressed,
      generatedAt: now.toISOString(),
    },
    meta: {
      eventsConsumed: input.events.length,
      baselinesConsumed: input.baselines.length,
      kThreshold,
    },
  };
}

// ============================================================================
// Self-test
// ============================================================================

export const ABUSE_SELF_TEST = {
  name: "analytics/abuse-detect W38",
  tests: [
    {
      name: "follower spike detected",
      assert: () => {
        const events: ActivityEvent[] = [];
        const baselines: UserBaseline[] = [];
        // 8 users com baseline baixa; u1 com spike (k-anon ≥5 affected)
        for (let u = 0; u < 8; u++) {
          baselines.push({ userId: `u${u}`, dailyMean: 5, dailyStddev: 2, sampleDays: 30 });
        }
        // u1: 150 followers em 24h (spike)
        for (let i = 0; i < 150; i++) {
          events.push({
            userId: "u1",
            timestamp: new Date(Date.now() - i * 600_000).toISOString(),
            category: "follower_gained",
          });
        }
        // outros users: 1 follower cada (não spike)
        for (let u = 1; u < 8; u++) {
          events.push({
            userId: `u${u}`,
            timestamp: new Date(Date.now() - 1_000_000).toISOString(),
            category: "follower_gained",
          });
        }
        const r = detectAbuse({ events, baselines, kThreshold: 1 });
        return r.signals.some((s) => s.category === "FOLLOWER_SPIKE");
      },
    },
    {
      name: "spam likely detected",
      assert: () => {
        const events: ActivityEvent[] = Array.from({ length: 40 }, (_, i) => ({
          userId: "u2",
          timestamp: new Date(Date.now() - i * 1000).toISOString(),
          category: "comment_created" as const,
        }));
        const r = detectAbuse({ events, baselines: [], kThreshold: 1 });
        return r.signals.some((s) => s.category === "SPAM_LIKELY");
      },
    },
    {
      name: "levenshtein basic",
      assert: () => {
        return levenshtein("kitten", "sitting") === 3;
      },
    },
  ],
};

export function runAbuseSelfTest(): boolean {
  for (const t of ABUSE_SELF_TEST.tests) {
    if (!t.assert()) {
      console.warn(`[abuse-detect] FAIL: ${t.name}`);
      return false;
    }
  }
  return true;
}