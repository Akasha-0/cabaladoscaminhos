// ============================================================================
// API /api/notifications/v2/digests — preview do digest diário/semanal/mensal
// ============================================================================
// POST   — gera preview do digest para o user (não envia, só monta)
// GET    — lista configs suportadas (daily/weekly/monthly)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireViewer } from '@/lib/community/auth';
import { fail, handleError, ok } from '@/lib/community/api';
import {
  buildDailyDigest,
  buildWeeklyDigest,
  buildMonthlyDigest,
  type DigestKind,
  type DigestInput,
} from '@/lib/notifications/v2';

export const dynamic = 'force-dynamic';

const VALID_KINDS = new Set<DigestKind>(['DAILY', 'WEEKLY', 'MONTHLY']);

export async function POST(req: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, 'UNAUTHORIZED', 'Não autenticado');
    }

    let body: { kind: DigestKind; input?: Partial<DigestInput> };
    try {
      body = (await req.json()) as { kind: DigestKind; input?: Partial<DigestInput> };
    } catch {
      return fail(400, 'INVALID_JSON', 'Body inválido');
    }

    if (!VALID_KINDS.has(body.kind)) {
      return fail(400, 'INVALID_KIND', `kind deve ser DAILY/WEEKLY/MONTHLY`);
    }

    // Defaults se o caller não envia input
    const input: DigestInput = {
      userId: viewer.id,
      periodStart: body.input?.periodStart ?? new Date(Date.now() - 86_400_000).toISOString(),
      periodEnd: body.input?.periodEnd ?? new Date().toISOString(),
      mentions: body.input?.mentions ?? [],
      replies: body.input?.replies ?? [],
      follows: body.input?.follows ?? 0,
      akashaMilestones: body.input?.akashaMilestones ?? [],
      marketplaceEarnings: body.input?.marketplaceEarnings ?? 0,
      newPosts: body.input?.newPosts ?? [],
      unreadCount: body.input?.unreadCount ?? 0,
      locale: body.input?.locale ?? 'pt-BR',
      timezone: body.input?.timezone ?? 'America/Sao_Paulo',
    };

    const digest =
      body.kind === 'DAILY'
        ? buildDailyDigest(input)
        : body.kind === 'WEEKLY'
        ? buildWeeklyDigest(input)
        : buildMonthlyDigest(input);

    return ok({ userId: viewer.id, kind: body.kind, digest });
  } catch (err) {
    return handleError(err);
  }
}

export async function GET() {
  return ok({
    supportedKinds: ['DAILY', 'WEEKLY', 'MONTHLY'] as DigestKind[],
    defaults: {
      daily: '08:00 local time',
      weekly: 'Domingo 09:00 local time',
      monthly: 'Dia 1 09:00 local time',
    },
  });
}
