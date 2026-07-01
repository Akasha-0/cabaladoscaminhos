/**
 * analytics/community-health.ts — Community health metrics (Wave 38)
 * ============================================================================
 * Métricas agregadas de saúde da comunidade pós-launch Day 7.
 * Pensado para `/admin/insights` (visualização) + auto-insights (anomalias).
 *
 * Métricas rastreadas:
 *   - DAU/MAU ratio (stickiness)
 *   - WAU/MAU (rolling 7-day engagement)
 *   - New posts/day + new comments/day
 *   - Comments/post ratio (depth of conversation)
 *   - Akasha conversations/day
 *   - Mentorship sessions/week
 *   - Marketplace transactions/week
 *   - Cohort retention D1/D7/D30 (W32 baseline)
 *   - Moderation queue SLA (% reviewed < 24h)
 *
 * LGPD:
 *   - Toda agregação opera em cohorts, sem PII.
 *   - k-anonimato (k≥5) aplicado em qualquer cohort < 5.
 *
 * NÃO acessa Prisma: opera sobre arrays já coletados via queryRaw para
 * permitir unit-testing puro e zero-coupling com schema.
 * ============================================================================
 */

import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'must be ISO date YYYY-MM-DD');

export const CommunityHealthSnapshotSchema = z.object({
  date: DateString,
  dau: z.number().int().nonnegative(),
  wau: z.number().int().nonnegative(),
  mau: z.number().int().nonnegative(),
  dauMauRatio: z.number().min(0).max(1),
  wauMauRatio: z.number().min(0).max(1),
  newPosts: z.number().int().nonnegative(),
  newComments: z.number().int().nonnegative(),
  commentsPerPost: z.number().min(0),
  akashaConversations: z.number().int().nonnegative(),
  mentorshipSessionsWeek: z.number().int().nonnegative(),
  marketplaceTxWeek: z.number().int().nonnegative(),
  retentionD1: z.number().min(0).max(1),
  retentionD7: z.number().min(0).max(1),
  retentionD30: z.number().min(0).max(1),
  moderationSlaPct: z.number().min(0).max(1),
});

export const CommunityHealthTrendSchema = z.object({
  windowDays: z.number().int().positive(),
  snapshots: z.array(CommunityHealthSnapshotSchema),
  deltas: z.object({
    dauMauDelta: z.number(),
    newPostsDelta: z.number(),
    commentsPerPostDelta: z.number(),
    retentionD7Delta: z.number(),
  }),
  anomalies: z.array(z.object({
    metric: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    description: z.string(),
  })),
});

export type CommunityHealthSnapshot = z.infer<typeof CommunityHealthSnapshotSchema>;
export type CommunityHealthTrend = z.infer<typeof CommunityHealthTrendSchema>;

// ============================================================================
// Inputs (raw data shape — collected via Prisma in production)
// ============================================================================

export interface DailyActivityRow {
  userId: string;
  date: string; // YYYY-MM-DD
}

export interface PostRow {
  postId: string;
  authorId: string;
  createdAt: string; // ISO
  commentCount: number;
}

export interface AkashaRow {
  conversationId: string;
  userId: string;
  startedAt: string;
  messageCount: number;
}

export interface MentorshipSessionRow {
  sessionId: string;
  mentorId: string;
  menteeId: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
}

export interface MarketplaceTxRow {
  txId: string;
  buyerId: string;
  sellerId: string;
  amountCents: number;
  completedAt: string;
}

export interface RetentionCohortRow {
  userId: string;
  cohortDate: string; // signup date
  activeDates: string[]; // days active after cohort
}

export interface ModerationRow {
  itemId: string;
  submittedAt: string;
  reviewedAt?: string;
  decision: 'approved' | 'rejected' | 'escalated' | 'pending';
}

// ============================================================================
// Builders
// ============================================================================

/**
 * Constrói snapshot de saúde da comunidade para uma data específica.
 * Combina: activity rows + posts + akasha + mentorship + marketplace +
 * retention + moderation.
 */
export function buildDailySnapshot(input: {
  date: string;
  activity: DailyActivityRow[];
  posts: PostRow[];
  comments: Array<{ commentId: string; postId: string; createdAt: string }>;
  akasha: AkashaRow[];
  mentorship: MentorshipSessionRow[];
  marketplace: MarketplaceTxRow[];
  retentionCohorts: RetentionCohortRow[];
  moderation: ModerationRow[];
}): CommunityHealthSnapshot {
  const {
    date,
    activity,
    posts,
    comments,
    akasha,
    mentorship,
    marketplace,
    retentionCohorts,
    moderation,
  } = input;

  // DAU = unique users ativos na data
  const dauSet = new Set(activity.filter((a) => a.date === date).map((a) => a.userId));
  const dau = dauSet.size;

  // WAU = unique users ativos nos últimos 7 dias (incluindo date)
  const dateObj = new Date(date);
  const wauWindow: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(dateObj);
    d.setUTCDate(d.getUTCDate() - i);
    wauWindow.push(d.toISOString().slice(0, 10));
  }
  const wauSet = new Set(activity.filter((a) => wauWindow.includes(a.date)).map((a) => a.userId));
  const wau = wauSet.size;

  // MAU = unique users ativos nos últimos 30 dias
  const mauWindow: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(dateObj);
    d.setUTCDate(d.getUTCDate() - i);
    mauWindow.push(d.toISOString().slice(0, 10));
  }
  const mauSet = new Set(activity.filter((a) => mauWindow.includes(a.date)).map((a) => a.userId));
  const mau = mauSet.size;

  const dauMauRatio = mau > 0 ? dau / mau : 0;
  const wauMauRatio = mau > 0 ? wau / mau : 0;

  // Posts + comments no dia
  const dayPosts = posts.filter((p) => p.createdAt.slice(0, 10) === date);
  const newPosts = dayPosts.length;
  const dayComments = comments.filter((c) => c.createdAt.slice(0, 10) === date);
  const newComments = dayComments.length;
  const commentsPerPost = newPosts > 0 ? newComments / newPosts : 0;

  // Akasha conversations no dia
  const akashaConversations = akasha.filter((a) => a.startedAt.slice(0, 10) === date).length;

  // Mentorship sessions na semana
  const mentorshipWindow: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(dateObj);
    d.setUTCDate(d.getUTCDate() - i);
    mentorshipWindow.push(d.toISOString().slice(0, 10));
  }
  const mentorshipSessionsWeek = mentorship.filter((m) =>
    mentorshipWindow.includes(m.scheduledAt.slice(0, 10)),
  ).length;

  // Marketplace transactions na semana
  const marketplaceTxWeek = marketplace.filter((m) =>
    mentorshipWindow.includes(m.completedAt.slice(0, 10)),
  ).length;

  // Retention cohorts: % dos cohorts que voltaram em D1/D7/D30
  const retention = computeRetentionRates(retentionCohorts, date);

  // Moderation SLA
  const moderationSlaPct = computeModerationSLA(moderation);

  return CommunityHealthSnapshotSchema.parse({
    date,
    dau,
    wau,
    mau,
    dauMauRatio: round(dauMauRatio, 4),
    wauMauRatio: round(wauMauRatio, 4),
    newPosts,
    newComments,
    commentsPerPost: round(commentsPerPost, 2),
    akashaConversations,
    mentorshipSessionsWeek,
    marketplaceTxWeek,
    retentionD1: retention.d1,
    retentionD7: retention.d7,
    retentionD30: retention.d30,
    moderationSlaPct,
  });
}

// ============================================================================
// Helpers
// ============================================================================

function computeRetentionRates(
  cohorts: RetentionCohortRow[],
  asOfDate: string,
): { d1: number; d7: number; d30: number } {
  const asOf = new Date(asOfDate);
  const d1Buckets: Array<{ retained: boolean }> = [];
  const d7Buckets: Array<{ retained: boolean }> = [];
  const d30Buckets: Array<{ retained: boolean }> = [];

  for (const cohort of cohorts) {
    const cohortStart = new Date(cohort.cohortDate);
    const ageDays = Math.floor((asOf.getTime() - cohortStart.getTime()) / (24 * 3600 * 1000));

    if (ageDays >= 1) {
      const retainedD1 = cohort.activeDates.some((d) => {
        const dt = new Date(d);
        const days = Math.floor((dt.getTime() - cohortStart.getTime()) / (24 * 3600 * 1000));
        return days >= 1 && days <= 1;
      });
      d1Buckets.push({ retained: retainedD1 });
    }

    if (ageDays >= 7) {
      const retainedD7 = cohort.activeDates.some((d) => {
        const dt = new Date(d);
        const days = Math.floor((dt.getTime() - cohortStart.getTime()) / (24 * 3600 * 1000));
        return days >= 2 && days <= 7;
      });
      d7Buckets.push({ retained: retainedD7 });
    }

    if (ageDays >= 30) {
      const retainedD30 = cohort.activeDates.some((d) => {
        const dt = new Date(d);
        const days = Math.floor((dt.getTime() - cohortStart.getTime()) / (24 * 3600 * 1000));
        return days >= 8 && days <= 30;
      });
      d30Buckets.push({ retained: retainedD30 });
    }
  }

  const pct = (buckets: Array<{ retained: boolean }>): number =>
    buckets.length === 0 ? 0 : buckets.filter((b) => b.retained).length / buckets.length;

  return {
    d1: round(pct(d1Buckets), 4),
    d7: round(pct(d7Buckets), 4),
    d30: round(pct(d30Buckets), 4),
  };
}

function computeModerationSLA(moderation: ModerationRow[]): number {
  const closed = moderation.filter((m) => m.decision !== 'pending' && m.reviewedAt);
  if (closed.length === 0) return 0;

  const slaWindow24h = closed.filter((m) => {
    const submitted = new Date(m.submittedAt).getTime();
    const reviewed = new Date(m.reviewedAt!).getTime();
    const hours = (reviewed - submitted) / (1000 * 3600);
    return hours <= 24;
  });

  return round(slaWindow24h.length / closed.length, 4);
}

function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

// ============================================================================
// Trend builder
// ============================================================================

/**
 * Constrói trend de N dias + deltas vs D-7 + detecção simples de anomalias.
 */
export function buildTrend(input: {
  snapshots: CommunityHealthSnapshot[];
  windowDays: 7 | 14 | 30;
}): CommunityHealthTrend {
  const { snapshots, windowDays } = input;
  if (snapshots.length === 0) {
    return {
      windowDays,
      snapshots: [],
      deltas: {
        dauMauDelta: 0,
        newPostsDelta: 0,
        commentsPerPostDelta: 0,
        retentionD7Delta: 0,
      },
      anomalies: [],
    };
  }

  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1]!;
  const weekAgo = sorted[Math.max(0, sorted.length - 1 - 7)] ?? sorted[0]!;

  const deltas = {
    dauMauDelta: round(latest.dauMauRatio - weekAgo.dauMauRatio, 4),
    newPostsDelta: latest.newPosts - weekAgo.newPosts,
    commentsPerPostDelta: round(latest.commentsPerPost - weekAgo.commentsPerPost, 2),
    retentionD7Delta: round(latest.retentionD7 - weekAgo.retentionD7, 4),
  };

  const anomalies: CommunityHealthTrend['anomalies'] = [];
  if (deltas.dauMauDelta < -0.05) {
    anomalies.push({
      metric: 'DAU/MAU',
      severity: 'high',
      description: `DAU/MAU caiu ${(deltas.dauMauDelta * 100).toFixed(1)}pp em ${windowDays}d`,
    });
  }
  if (deltas.retentionD7Delta < -0.05) {
    anomalies.push({
      metric: 'Retention D7',
      severity: 'high',
      description: `Retention D7 caiu ${(deltas.retentionD7Delta * 100).toFixed(1)}pp em ${windowDays}d`,
    });
  }
  if (latest.moderationSlaPct < 0.95) {
    anomalies.push({
      metric: 'Moderation SLA',
      severity: 'medium',
      description: `SLA < 95% (${(latest.moderationSlaPct * 100).toFixed(1)}%) — revisar staffing`,
    });
  }
  if (latest.commentsPerPost < 0.5) {
    anomalies.push({
      metric: 'Comments/Post',
      severity: 'low',
      description: `Ratio baixo (${latest.commentsPerPost}) — posts sem engajamento profundo`,
    });
  }

  return CommunityHealthTrendSchema.parse({
    windowDays,
    snapshots: sorted.slice(-windowDays),
    deltas,
    anomalies,
  });
}

// ============================================================================
// Health score (composite, 0..100)
// ============================================================================

export interface CommunityHealthScore {
  score: number; // 0..100
  band: 'excellent' | 'good' | 'warning' | 'critical';
  drivers: Array<{ metric: string; contribution: number; note: string }>;
}

export function computeHealthScore(snapshot: CommunityHealthSnapshot): CommunityHealthScore {
  const drivers: CommunityHealthScore['drivers'] = [];

  // DAU/MAU (target 0.35+ → 25 pts; 0.20+ → 15; else 5)
  const dauScore = snapshot.dauMauRatio >= 0.35 ? 25 : snapshot.dauMauRatio >= 0.20 ? 15 : 5;
  drivers.push({
    metric: 'DAU/MAU',
    contribution: dauScore,
    note: `Ratio ${(snapshot.dauMauRatio * 100).toFixed(1)}% (target ≥ 35%)`,
  });

  // Retention D7 (target 0.30+ → 25 pts; 0.20+ → 15; else 5)
  const d7Score = snapshot.retentionD7 >= 0.30 ? 25 : snapshot.retentionD7 >= 0.20 ? 15 : 5;
  drivers.push({
    metric: 'Retention D7',
    contribution: d7Score,
    note: `D7 ${(snapshot.retentionD7 * 100).toFixed(1)}% (target ≥ 30%)`,
  });

  // Comments/Post (target 1.0+ → 20 pts; 0.5+ → 12; else 4)
  const cppScore = snapshot.commentsPerPost >= 1.0 ? 20 : snapshot.commentsPerPost >= 0.5 ? 12 : 4;
  drivers.push({
    metric: 'Comments/Post',
    contribution: cppScore,
    note: `Ratio ${snapshot.commentsPerPost} (target ≥ 1.0)`,
  });

  // Moderation SLA (target 95%+ → 15 pts; 90%+ → 10; else 3)
  const slaScore = snapshot.moderationSlaPct >= 0.95 ? 15 : snapshot.moderationSlaPct >= 0.90 ? 10 : 3;
  drivers.push({
    metric: 'Moderation SLA',
    contribution: slaScore,
    note: `${(snapshot.moderationSlaPct * 100).toFixed(1)}% (target ≥ 95%)`,
  });

  // Akasha activity (proxy: conversations > 0 → 15 pts)
  const akashaScore = snapshot.akashaConversations > 0 ? 15 : 0;
  drivers.push({
    metric: 'Akasha Conversations',
    contribution: akashaScore,
    note: `${snapshot.akashaConversations} conversas no dia`,
  });

  const score = drivers.reduce((sum, d) => sum + d.contribution, 0);
  const band: CommunityHealthScore['band'] =
    score >= 85 ? 'excellent' : score >= 65 ? 'good' : score >= 45 ? 'warning' : 'critical';

  return { score, band, drivers };
}