// ============================================================================
// GET /api/me/analytics — Personal analytics for the authenticated user
// ============================================================================
// Returns: personal stats, tradition breakdown, practice patterns,
// engagement score, weekly trend. LGPD Art. 18 (transparência + acesso).
//
// Auth: requires session (cookie). Only returns data for the caller.
//
// Cache: s-maxage=120, stale-while-revalidate=600 (personal dashboard).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ok, fail, ErrorCode, handleError } from '@/lib/community/api';
import { createClient } from '@/lib/supabase/server';
import {
  computeEngagementScore,
  type UserActivityCounts,
  type EngagementScore,
} from '@/lib/analytics/engagement-score';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface PersonalAnalytics {
  userId: string;
  periodDays: number;
  counts: UserActivityCounts;
  engagement: EngagementScore;
  weeklyTrend: Array<{ week: string; posts: number; comments: number; reactions: number }>;
  traditionBreakdown: Array<{ tradition: string; percent: number; count: number }>;
  practicePatterns: {
    timeOfDay: Array<{ hour: number; count: number }>;
    dayOfWeek: Array<{ day: number; count: number }>;
  };
  streakDays: number;
  generatedAt: string;
}

/**
 * Demo data generator — in production, this would query Prisma for
 * Post / Comment / Reaction / Akasha / Mentorship / Marketplace tables.
 * Kept deterministic + LGPD-compliant (returns only data for caller).
 */
function loadDemoPersonalAnalytics(userId: string, periodDays: number): PersonalAnalytics {
  // Seed by userId for reproducibility (no PII leakage)
  const seed = userId
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const counts: UserActivityCounts = {
    userId,
    postsAuthored: Math.floor(rng() * 30) + 5,
    commentsAuthored: Math.floor(rng() * 80) + 10,
    reactionsReceived: Math.floor(rng() * 200) + 20,
    akashaConversations: Math.floor(rng() * 15) + 1,
    mentorshipSessions: Math.floor(rng() * 3),
    marketplaceActivity: Math.floor(rng() * 5),
    preferredTradition: pickTradition(rng),
    primaryPlatform: rng() > 0.6 ? 'mobile' : 'desktop',
  };

  const engagement = computeEngagementScore(counts);

  // Weekly trend (8 weeks)
  const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
    const w = isoWeekMinus(7 - i);
    return {
      week: w,
      posts: Math.floor(rng() * 6),
      comments: Math.floor(rng() * 12),
      reactions: Math.floor(rng() * 25),
    };
  });

  // Tradition breakdown
  const TRADITIONS = ['umbanda', 'candomble', 'espiritismo', 'budismo', 'catolicismo', 'umbanda_omeg'];
  const traditionBreakdown = TRADITIONS.slice(0, 5).map((t) => {
    const count = Math.floor(rng() * 20);
    return { tradition: t, count, percent: 0 };
  });
  const totalTrad = traditionBreakdown.reduce((a, b) => a + b.count, 0) || 1;
  for (const t of traditionBreakdown) t.percent = Math.round((t.count / totalTrad) * 100);

  // Practice patterns (24h x 7d)
  const timeOfDay = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: Math.floor(rng() * 10) + (h >= 18 && h <= 23 ? 8 : 0), // peak evening
  }));
  const dayOfWeek = Array.from({ length: 7 }, (_, d) => ({
    day: d,
    count: Math.floor(rng() * 15) + (d === 0 || d === 6 ? 8 : 0), // peak weekend
  }));

  return {
    userId,
    periodDays,
    counts,
    engagement,
    weeklyTrend,
    traditionBreakdown,
    practicePatterns: { timeOfDay, dayOfWeek },
    streakDays: Math.floor(rng() * 14),
    generatedAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return fail(503, ErrorCode.INTERNAL_ERROR, 'Auth indisponível');
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Sessão necessária');
    }

    const periodDays = Math.min(
      90,
      Math.max(7, Number(request.nextUrl.searchParams.get('days')) || 30)
    );

    const data = loadDemoPersonalAnalytics(user.id, periodDays);

    return ok(data, {
      meta: { userId: user.id, periodDays },
      cache: { sMaxage: 120, staleWhileRevalidate: 600 },
    });
  } catch (err) {
    return handleError(err);
  }
}

// ============================================================================
// Helpers
// ============================================================================

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickTradition(rng: () => number): string {
  const TRADITIONS = ['umbanda', 'candomble', 'espiritismo', 'budismo', 'catolicismo'];
  return TRADITIONS[Math.floor(rng() * TRADITIONS.length)];
}

function isoWeekMinus(weeksAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - weeksAgo * 7);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}