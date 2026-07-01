// ============================================================================
// GET /api/streaming/[eventId]/viewers — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// Returns aggregate viewer analytics for a live event.
// Host-only — used by the host dashboard to monitor concurrent viewers,
// chat engagement, and quality distribution in real time.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { aggregateTopCountries, aggregateVariantDistribution, computePeakConcurrency } from '@/lib/streaming/analytics';
import type { EventAnalytics, ViewerSession } from '@/lib/streaming/analytics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  eventId: string;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const { eventId } = await ctx.params;
  if (!eventId) {
    return NextResponse.json({ error: 'eventId é obrigatório' }, { status: 400 });
  }
  // In production: load from analytics aggregator (Redis + Postgres).
  const mockSessions: readonly ViewerSession[] = buildMockSessions(eventId);
  const concurrentViewers = mockSessions.length;
  const peakConcurrentViewers = computePeakConcurrency(mockSessions.map((s) => ({ ts: new Date(s.startedAt).getTime() })));
  const totalWatchedSeconds = mockSessions.reduce((sum, s) => sum + s.watchedSeconds, 0);
  const totalUniqueViewers = new Set(mockSessions.map((s) => s.sessionId)).size;
  const topCountries = aggregateTopCountries(mockSessions);
  const variantSplit = aggregateVariantDistribution(mockSessions);
  const analytics: EventAnalytics = {
    eventId,
    title: `Roda ao vivo — ${eventId.slice(0, 6)}`,
    isLive: true,
    concurrentViewers,
    peakConcurrentViewers,
    totalUniqueViewers,
    totalWatchedHours: Math.round((totalWatchedSeconds / 3600) * 10) / 10,
    avgWatchedMinutes: concurrentViewers > 0
      ? Math.round((totalWatchedSeconds / concurrentViewers / 60) * 10) / 10
      : 0,
    deviceSplit: countDeviceSplit(mockSessions),
    topCountries,
    variantSplit,
    chatEngagement: {
      totalMessages: 287,
      peakMessagesPerMinute: 34,
      uniqueContributors: 42,
    },
    reactionsBreakdown: {
      heart: 612,
      fire: 138,
      sparkles: 95,
      om: 47,
      lotus: 22,
    },
    retentionCurve: [0.84, 0.71, 0.62, 0.58],
  };
  return NextResponse.json({ ok: true, data: analytics });
}

function buildMockSessions(eventId: string): readonly ViewerSession[] {
  const categories: ViewerSession['deviceCategory'][] = ['mobile', 'desktop', 'tablet', 'tv'];
  const countries = ['BR', 'BR', 'BR', 'PT', 'US', 'AO', 'MZ'];
  const arr: ViewerSession[] = [];
  for (let i = 0; i < 47; i++) {
    arr.push({
      sessionId: `s-${eventId}-${i}`,
      eventId,
      kind: 'live',
      startedAt: new Date(Date.now() - i * 60_000).toISOString(),
      watchedSeconds: 120 + i * 30,
      lastVariantIndex: i % 4,
      milestones: i % 9 === 0 ? ['fullscreen'] : [],
      deviceCategory: categories[i % categories.length]!,
      countryCode: countries[i % countries.length]!,
      regionCode: 'SP',
    });
  }
  return Object.freeze(arr);
}

function countDeviceSplit(sessions: readonly ViewerSession[]): Readonly<Record<ViewerSession['deviceCategory'], number>> {
  const counts: Record<ViewerSession['deviceCategory'], number> = {
    mobile: 0, desktop: 0, tablet: 0, tv: 0, unknown: 0,
  };
  for (const s of sessions) counts[s.deviceCategory] += 1;
  return Object.freeze(counts);
}
