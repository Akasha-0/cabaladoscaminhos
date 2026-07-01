// ============================================================================
// /api/cron/nps-prompt — cron + lookup de NPS pendente
// ============================================================================
// POST (cron): varre usuários ativos, calcula qual trigger (DAY_1/3/7/14/30)
// está pendente, e atualiza NpsPromptSchedule.triggersShown.
// GET (cliente): retorna qual trigger está pendente PARA O USUÁRIO LOGADO
// (lê schedule, sem revelar outros users).
//
// Auth POST: header `x-cron-secret` matches process.env.CRON_SECRET.
// Auth GET: sessão autenticada.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/options';
import { nextNpsTrigger, auditFeedback, NpsTrigger } from '@/lib/feedback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TRIGGER_LIST: NpsTrigger[] = ['DAY_1', 'DAY_3', 'DAY_7', 'DAY_14', 'DAY_30'];

// GET: o que está pendente para o usuário atual?
export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ pending: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, optOutSurveys: true },
  });
  if (!user || user.optOutSurveys) {
    return NextResponse.json({ pending: null, reason: user?.optOutSurveys ? 'opted_out' : 'no_user' });
  }

  const schedule = await prisma.npsPromptSchedule.findUnique({ where: { userId } });
  const now = new Date();
  const triggersShown = schedule?.triggersShown ?? [];

  // Respeitar pause opt-out
  if (schedule?.pausedUntil && schedule.pausedUntil > now) {
    return NextResponse.json({ pending: null, reason: 'paused' });
  }

  // Não re-promptar nos próximos 30 dias do último
  if (schedule?.lastPromptedAt) {
    const sinceLast = (now.getTime() - schedule.lastPromptedAt.getTime()) / 86400000;
    if (sinceLast < 7) {
      return NextResponse.json({ pending: null, reason: 'too_recent' });
    }
  }

  const next = nextNpsTrigger(user.createdAt, triggersShown, now);
  if (!next) {
    return NextResponse.json({ pending: null, reason: 'all_done' });
  }

  return NextResponse.json({
    pending: {
      trigger: next.trigger,
      triggerAt: next.triggerAt.toISOString(),
    },
  });
}

// POST: cron job que atualiza triggersShown
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'CRON_SECRET ausente ou inválido.' },
      { status: 401 },
    );
  }

  // Para cada usuário criado em janela razoável (last 60 days), calcular trigger
  const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: cutoff } },
    select: { id: true, createdAt: true },
    take: 1000,
  });

  const now = new Date();
  let updated = 0;
  let promptsTriggered = 0;

  for (const user of users) {
    const schedule = await prisma.npsPromptSchedule.findUnique({ where: { userId: user.id } });
    const triggersShown = schedule?.triggersShown ?? [];
    const next = nextNpsTrigger(user.createdAt, triggersShown, now);
    if (!next) continue;

    // Marcar trigger como exibido (cliente decide se mostra)
    await prisma.npsPromptSchedule.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        triggersShown: [next.trigger],
        lastPromptedAt: now,
      },
      update: {
        triggersShown: Array.from(new Set([...triggersShown, next.trigger])),
        lastPromptedAt: now,
      },
    });
    promptsTriggered += 1;
    updated += 1;

    await auditFeedback(null, 'NPS_TRIGGER_SCHEDULED', user.id, {
      trigger: next.trigger,
      triggerAt: next.triggerAt.toISOString(),
      cycle: TRIGGER_LIST.indexOf(next.trigger),
    });
  }

  return NextResponse.json({
    ok: true,
    scanned: users.length,
    updated,
    promptsTriggered,
    ranAt: now.toISOString(),
  });
}
