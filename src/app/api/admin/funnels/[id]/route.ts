// ============================================================================
// GET /api/admin/funnels/[id] — Single funnel with conversion + drop-off (Wave 38)
// ============================================================================
// Supports: ACQUISITION | ACTIVATION | ENGAGEMENT | MONETIZATION | RETENTION
// Auth: admin only.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import {
  computeFunnel,
  type FunnelId,
  type FunnelEvent,
  type FunnelResult,
} from '@/lib/analytics/funnels';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_FUNNELS: FunnelId[] = [
  'ACQUISITION',
  'ACTIVATION',
  'ENGAGEMENT',
  'MONETIZATION',
  'RETENTION',
];

function loadDemoEvents(funnelId: FunnelId): FunnelEvent[] {
  const events: FunnelEvent[] = [];
  const now = Date.now();
  const userCount = 100 + Math.floor(Math.random() * 50);

  // Per-funnel event pattern
  const PATTERNS: Record<FunnelId, Array<{ event: string; prob: number; offsetMin: number }>> = {
    ACQUISITION: [
      { event: 'page_viewed', prob: 1.0, offsetMin: 0 },
      { event: 'funnel_cta_click', prob: 0.4, offsetMin: 2 },
      { event: 'user_signed_up', prob: 0.25, offsetMin: 5 },
    ],
    ACTIVATION: [
      { event: 'user_signed_up', prob: 1.0, offsetMin: 0 },
      { event: 'onboarding_completed', prob: 0.7, offsetMin: 30 },
      { event: 'post_created', prob: 0.45, offsetMin: 60 * 24 },
      { event: 'post_liked', prob: 0.3, offsetMin: 60 * 25 },
    ],
    ENGAGEMENT: [
      { event: 'post_created', prob: 1.0, offsetMin: 0 },
      { event: 'feed_viewed', prob: 0.85, offsetMin: 10 },
      { event: 'akashic_chat_opened', prob: 0.35, offsetMin: 60 * 6 },
      { event: 'akashic_message_sent', prob: 0.28, offsetMin: 60 * 7 },
    ],
    MONETIZATION: [
      { event: 'akashic_message_sent', prob: 1.0, offsetMin: 0 },
      { event: 'marketplace_listing_viewed', prob: 0.45, offsetMin: 60 * 24 },
      { event: 'marketplace_purchase_intent', prob: 0.15, offsetMin: 60 * 26 },
      { event: 'marketplace_purchase_intent', prob: 0.1, offsetMin: 60 * 27 },
    ],
    RETENTION: [
      { event: 'marketplace_purchase_intent', prob: 1.0, offsetMin: 0 },
      { event: 'page_viewed', prob: 0.55, offsetMin: 60 * 24 * 7 },
      { event: 'marketplace_purchase_intent', prob: 0.25, offsetMin: 60 * 24 * 10 },
    ],
  };

  const pattern = PATTERNS[funnelId];
  for (let i = 0; i < userCount; i++) {
    const userId = `u-${funnelId}-${i}`;
    let anchor = now - Math.random() * 7 * 86400_000;
    for (const step of pattern) {
      if (Math.random() > step.prob) continue;
      anchor += step.offsetMin * 60_000;
      events.push({
        userId,
        event: step.event,
        properties: step.event === 'marketplace_purchase_intent' ? { status: 'succeeded' } : {},
        timestamp: new Date(anchor).toISOString(),
      });
    }
  }
  return events;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(403, ErrorCode.FORBIDDEN, `Admin required (${session.reason})`);
    }

    const { id: rawId } = await params;
    const funnelId = rawId.toUpperCase() as FunnelId;
    if (!VALID_FUNNELS.includes(funnelId)) {
      return fail(
        400,
        ErrorCode.BAD_REQUEST,
        `Funil inválido: ${rawId}. Válidos: ${VALID_FUNNELS.join(', ')}`
      );
    }

    const events = loadDemoEvents(funnelId);
    const result: FunnelResult = computeFunnel({ funnelId, events });

    // Time-to-conversion (simulated): minutes from first event to last
    const timeToConversion: Record<string, number> = {};
    for (const row of result.rows) {
      if (row.step.order === 1) continue;
      // Simulate based on windowMinutes
      timeToConversion[row.step.name] = Math.round(row.step.windowMinutes * 0.6);
    }

    // Drop-off reasons (top 3 — simulated)
    const dropOffReasons = [
      'UX friction (campos confusos, validação)',
      'Carga cognitiva (muita informação na tela)',
      'Intenção sem follow-through (curiosidade passageira)',
    ];

    return ok(
      { result, timeToConversion, dropOffReasons },
      {
        meta: { funnelId, stepCount: result.rows.length },
        cache: { sMaxage: 60, staleWhileRevalidate: 300 },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}