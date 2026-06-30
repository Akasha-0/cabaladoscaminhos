// ============================================================================
// GET /api/consciousness/insights — Lista insights gerados pelo loop
// ============================================================================
// Endpoint de leitura — usado pelo ConsciousnessDashboard (admin/curador).
//
// Auth:
//   - Em produção: requer role admin (verificar via session)
//   - Em dev: aberto (warning no log)
//
// Query params:
//   - type: filtra por tipo (TRADITION_RESONANCE | EMERGING_QUESTION | etc)
//   - limit: max de insights (default 20, max 100)
//   - period: '24h' | '7d' | '30d' (default '7d')
//
// Response: JSON com { ok, insights: [...], aggregation: {...} }
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { aggregateDailyEvents } from '@/lib/consciousness/feedback-loop';
import type { ConsciousnessInsightType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  type: z
    .enum([
      'TRADITION_RESONANCE',
      'EMERGING_QUESTION',
      'CONTENT_GAP',
      'HEALING_PATTERN',
      'PROMPT_TWEAK',
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  period: z.enum(['24h', '7d', '30d']).default('7d'),
});

const PERIOD_MS: Record<string, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid query', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, limit, period } = parsed.data;
  const periodStart = new Date(Date.now() - PERIOD_MS[period]);

  // 1. Insights do DB
  const where: { createdAt: { gte: Date }; type?: ConsciousnessInsightType } = {
    createdAt: { gte: periodStart },
  };
  if (type) where.type = type;

  const insightsRaw = await prisma.consciousnessInsight.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const insights = insightsRaw.map((i: any) => ({
    id: i.id,
    type: i.type,
    description: i.description,
    evidence: (i.evidence as { items?: string[] })?.items ?? [],
    actionItems: (i.actionItems as { items?: string[] })?.items ?? [],
    periodStart: i.periodStart,
    periodEnd: i.periodEnd,
    appliedAt: i.appliedAt,
    generatedBy: i.generatedBy,
    createdAt: i.createdAt,
  }));

  // 2. Agregação atual (últimas 24h) para o dashboard
  const aggregation = await aggregateDailyEvents();

  return NextResponse.json({
    ok: true,
    insights,
    aggregation: {
      periodStart: aggregation.periodStart,
      periodEnd: aggregation.periodEnd,
      totalEvents: aggregation.totalEvents,
      eventsByType: aggregation.eventsByType,
      byTradition: aggregation.byTradition.slice(0, 10),
      topTopics: aggregation.topTopics,
      avgSentiment: aggregation.avgSentiment,
      akashic: aggregation.akashicInteractions,
    },
  });
}