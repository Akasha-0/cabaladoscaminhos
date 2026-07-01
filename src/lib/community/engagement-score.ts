// ============================================================================
// ENGAGEMENT SCORING — Weekly, anonymized, no PII
// ============================================================================
// Wave 38 — Community Programs 4/8
//
// Purpose: surface "active contributor" recognition (top 10%) without
// gamification anti-patterns (rank, level, leaderboard shame).
//
// LGPD: This module NEVER stores PII. Only counts. User attribution happens
// server-side at award time; the stored record is (userId, weekKey, counts).
//
// Weights (canonical — change via ADR):
//   posts               × 1.0   (criação de conteúdo)
//   comments            × 0.5   (engajamento)
//   reactionsReceived   × 0.3   (validação social)
//   akashaConversations × 2.0   (IA co-evoluindo)
//   mentorshipSessions  × 3.0   (transmissão 1:1)
//   marketplaceTx       × 2.5   (economia espiritual)
//   challengeParticipation × 1.5 (prática estruturada)
//   eventRsvps          × 0.7   (presença)
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ENGAGEMENT_WEIGHTS = {
  posts: 1.0,
  comments: 0.5,
  reactionsReceived: 0.3,
  akashaConversations: 2.0,
  mentorshipSessions: 3.0,
  marketplaceTx: 2.5,
  challengeParticipation: 1.5,
  eventRsvps: 0.7,
} as const;

export type EngagementCounts = {
  posts: number;
  comments: number;
  reactionsReceived: number;
  akashaConversations: number;
  mentorshipSessions: number;
  marketplaceTx: number;
  challengeParticipation: number;
  eventRsvps: number;
};

// ============================================================================
// weekKeyFromDate: returns ISO week key like "2026-W27"
// ============================================================================

export function weekKeyFromDate(d: Date = new Date()): string {
  // ISO 8601 week number
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

// ============================================================================
// calculateTotal — pure function, given counts → weighted total
// ============================================================================

export function calculateTotal(c: EngagementCounts): number {
  return (
    c.posts * ENGAGEMENT_WEIGHTS.posts +
    c.comments * ENGAGEMENT_WEIGHTS.comments +
    c.reactionsReceived * ENGAGEMENT_WEIGHTS.reactionsReceived +
    c.akashaConversations * ENGAGEMENT_WEIGHTS.akashaConversations +
    c.mentorshipSessions * ENGAGEMENT_WEIGHTS.mentorshipSessions +
    c.marketplaceTx * ENGAGEMENT_WEIGHTS.marketplaceTx +
    c.challengeParticipation * ENGAGEMENT_WEIGHTS.challengeParticipation +
    c.eventRsvps * ENGAGEMENT_WEIGHTS.eventRsvps
  );
}

// ============================================================================
// computeAndStore — server-only: aggregate counts for a user+week, write
// ============================================================================

export async function computeAndStore(
  userId: string,
  weekKey: string = weekKeyFromDate(),
): Promise<{ totalScore: number; isTop10Percent: boolean }> {
  // Compute counts from source tables
  const [posts, comments, reactionsReceived, akashaConvs, mentorSess, mpTx, challengeParts, eventRsvps] =
    await Promise.all([
      prisma.post.count({
        where: {
          authorId: userId,
          createdAt: { gte: weekStart(weekKey), lt: weekEnd(weekKey) },
        },
      }),
      prisma.comment.count({
        where: {
          authorId: userId,
          createdAt: { gte: weekStart(weekKey), lt: weekEnd(weekKey) },
        },
      }),
      prisma.reaction.count({
        where: {
          targetAuthorId: userId, // reactions ON user's posts/comments
          createdAt: { gte: weekStart(weekKey), lt: weekEnd(weekKey) },
        },
      }),
      prisma.aiConversation.count({
        where: {
          userId,
          createdAt: { gte: weekStart(weekKey), lt: weekEnd(weekKey) },
        },
      }),
      prisma.mentorshipMessage.count({
        where: {
          mentorship: { mentorId: userId },
          createdAt: { gte: weekStart(weekKey), lt: weekEnd(weekKey) },
        },
      }),
      prisma.marketplaceTransaction?.count({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
          createdAt: { gte: weekStart(weekKey), lt: weekEnd(weekKey) },
        },
      }) ?? 0,
      prisma.challengeParticipation.count({
        where: {
          userId,
          createdAt: { gte: weekStart(weekKey), lt: weekEnd(weekKey) },
        },
      }),
      prisma.eventParticipant.count({
        where: {
          userId,
          rsvpStatus: 'GOING',
          createdAt: { gte: weekStart(weekKey), lt: weekEnd(weekKey) },
        },
      }),
    ]);

  const counts: EngagementCounts = {
    posts,
    comments,
    reactionsReceived,
    akashaConversations: akashaConvs,
    mentorshipSessions: mentorSess,
    marketplaceTx: mpTx,
    challengeParticipation: challengeParts,
    eventRsvps,
  };

  const totalScore = calculateTotal(counts);

  // Upsert
  await prisma.engagementScore.upsert({
    where: { userId_weekKey: { userId, weekKey } },
    create: {
      userId,
      weekKey,
      ...counts,
      totalScore,
      isTop10Percent: false, // calculated in second pass
    },
    update: {
      ...counts,
      totalScore,
    },
  });

  // Second pass: flag top 10% (sample-based for performance)
  const topThreshold = await getTop10Threshold(weekKey);
  const isTop10Percent = totalScore >= topThreshold;

  if (isTop10Percent) {
    await prisma.engagementScore.update({
      where: { userId_weekKey: { userId, weekKey } },
      data: { isTop10Percent: true },
    });
  }

  return { totalScore, isTop10Percent };
}

async function getTop10Threshold(weekKey: string): Promise<number> {
  // 90th percentile of all users' totals for this week
  const all = await prisma.engagementScore.findMany({
    where: { weekKey },
    select: { totalScore: true },
    orderBy: { totalScore: 'desc' },
  });
  if (all.length === 0) return 0;
  const idx = Math.floor(all.length * 0.1);
  return all[idx]?.totalScore ?? 0;
}

function weekStart(weekKey: string): Date {
  // "2026-W27" → Monday 00:00 UTC
  const [year, week] = weekKey.split('-W').map(Number);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
  return new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
}

function weekEnd(weekKey: string): Date {
  return new Date(weekStart(weekKey).getTime() + 7 * 86400000);
}

// ============================================================================
// isActiveContributor — top 10% check (no PII, just userId in / out)
// ============================================================================

export async function isActiveContributor(
  userId: string,
  weekKey: string = weekKeyFromDate(),
): Promise<boolean> {
  const row = await prisma.engagementScore.findUnique({
    where: { userId_weekKey: { userId, weekKey } },
    select: { isTop10Percent: true },
  });
  return row?.isTop10Percent ?? false;
}
