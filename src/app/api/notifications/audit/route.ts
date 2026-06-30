// ============================================================================
// API /api/notifications/audit — auditoria LGPD do user (W30)
// ============================================================================
// GET /api/notifications/audit?limit=50&decision=SKIPPED_LGPD
//
// Retorna o histórico de decisões do scheduler para o user autenticado.
// Útil para: (a) o user ver por que recebeu/pulou algo; (b) export LGPD Art. 18 V.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';

export const dynamic = 'force-dynamic';

// ============================================================================
// Schema
// ============================================================================

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  decision: z
    .enum([
      'SENT', 'DEFERRED', 'BATCHED',
      'SKIPPED_PREF', 'SKIPPED_DND', 'SKIPPED_SACRED',
      'SKIPPED_FREQ', 'SKIPPED_LGPD', 'SKIPPED_ETHICS', 'FAILED',
    ])
    .optional(),
  since: z.coerce.date().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = QuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { limit, decision, since } = parsed.data;

    const where: {
      userId: string;
      decision?: string;
      createdAt?: { gte: Date };
    } = { userId: viewer.id };
    if (decision) where.decision = decision;
    if (since) where.createdAt = { gte: since };

    const rows = await prisma.notificationEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        decision: true,
        decisionReason: true,
        channel: true,
        scheduledFor: true,
        sentAt: true,
        experimentVariant: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // LGPD Art. 18 V — exportação inclui também eventos SENT para auditoria
    const summary = {
      total: rows.length,
      byDecision: rows.reduce<Record<string, number>>((acc: any, r: any) => {
        acc[r.decision] = (acc[r.decision] ?? 0) + 1;
        return acc;
      }, {}),
    };

    return NextResponse.json({
      items: rows.map((r: any) => ({
        id: r.id,
        type: r.type,
        decision: r.decision,
        reason: r.decisionReason,
        channel: r.channel,
        scheduledFor: r.scheduledFor.toISOString(),
        sentAt: r.sentAt?.toISOString() ?? null,
        experimentVariant: r.experimentVariant,
        createdAt: r.createdAt.toISOString(),
        expiresAt: r.expiresAt.toISOString(),
      })),
      summary,
    });
  } catch (err) {
    console.error('[api/notifications/audit][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao listar auditoria' },
      { status: 500 }
    );
  }
}
