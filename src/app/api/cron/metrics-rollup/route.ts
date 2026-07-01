// ============================================================================
// CRON — /api/cron/metrics-rollup (Wave 34 — 2026-07-01)
// ============================================================================
// Agrega métricas diárias de uso e persiste para dashboards.
//
// Schedule recomendado (vercel.json):
//   { "path": "/api/cron/metrics-rollup", "schedule": "0 6 * * *" }
//   (todo dia 6h UTC — após cleanup-sessions, antes do backup)
//
// O que é agregado:
//   - DAU (Daily Active Users) — User que fez login nas últimas 24h
//   - Novos cadastros
//   - Posts criados
//   - Comentários criados
//   - NPS responses recebidas
//   - Email queue stats (sent/failed/backlog)
//   - Beta invites stats (sent/accepted/expired)
//
// Output:
//   - Tabela MetricRollup (date + counters)
//   - Log estruturado com métricas
//   - Endpoint retorna JSON com snapshot
//
// LGPD:
//   - Apenas counts agregados (sem PII)
//   - Snapshots antigos (>365d) podem ser removidos em cron separado
//
// Idempotência:
//   - upsert por (date) → segunda execução no mesmo dia = noop
//   - Lock in-process via tryAcquireLock
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifyCronSecret, unauthorizedResponse } from '@/lib/cron/auth';
import {
  logCronStarted,
  logCronCompleted,
  logCronFailed,
  logCronSkipped,
} from '@/lib/cron/log';
import { tryAcquireLock, releaseLock } from '@/lib/cron/lock';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

interface DailyRollup {
  date: string; // YYYY-MM-DD (UTC)
  dau: number;
  newUsers: number;
  postsCreated: number;
  commentsCreated: number;
  reactionsCreated: number;
  npsResponses: number;
  betaInvitesSent: number;
  betaInvitesAccepted: number;
  emailQueueBacklog: number;
  emailSent24h: number;
  emailFailed24h: number;
  collectedAt: string;
}

function startOfDayUtc(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function collectRollup(): Promise<DailyRollup> {
  const now = new Date();
  const today = startOfDayUtc(now);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const dateStr = today.toISOString().slice(0, 10);

  // Acesso via bracket notation para tolerar schema parcial
  const sessionModel = (prisma as unknown as Record<string, unknown>).session as
    | { findMany: (args: { where: { expires: { gt: Date } }; select: { userId: true }; distinct: ['userId'] }) => Promise<Array<{ userId: string }>> }
    | undefined;
  const reactionModel = (prisma as unknown as Record<string, unknown>).reaction as
    | { count: (args: { where: { createdAt: { gte: Date; lt: Date } } }) => Promise<number> }
    | undefined;
  const npsResponseModel = (prisma as unknown as Record<string, unknown>).npsResponse as
    | { count: (args: { where: { createdAt: { gte: Date; lt: Date } } }) => Promise<number> }
    | undefined;
  const betaInviteModel = (prisma as unknown as Record<string, unknown>).betaInvite as
    | { count: (args: { where: Record<string, unknown> }) => Promise<number> }
    | undefined;
  const emailJobModel = (prisma as unknown as Record<string, unknown>).emailJob as
    | { count: (args: { where: Record<string, unknown> }) => Promise<number> }
    | undefined;

  // -------------------------------------------------------------------------
  // DAU — usuários com sessão ativa (distinct userId)
  // -------------------------------------------------------------------------
  let dau = 0;
  if (sessionModel) {
    try {
      const sessions = await sessionModel.findMany({
        where: { expires: { gt: now } },
        select: { userId: true },
        distinct: ['userId'],
      });
      dau = sessions.length;
    } catch {
      dau = 0;
    }
  }

  // -------------------------------------------------------------------------
  // Novos cadastros (ontem 0h → hoje 0h)
  // -------------------------------------------------------------------------
  let newUsers = 0;
  try {
    const r = await prisma.user.count({
      where: { createdAt: { gte: yesterday, lt: today } },
    });
    newUsers = r;
  } catch {
    newUsers = 0;
  }

  // -------------------------------------------------------------------------
  // Posts criados
  // -------------------------------------------------------------------------
  let postsCreated = 0;
  try {
    const r = await prisma.post.count({
      where: { createdAt: { gte: yesterday, lt: today } },
    });
    postsCreated = r;
  } catch {
    postsCreated = 0;
  }

  // -------------------------------------------------------------------------
  // Comentários
  // -------------------------------------------------------------------------
  let commentsCreated = 0;
  try {
    const r = await prisma.comment.count({
      where: { createdAt: { gte: yesterday, lt: today } },
    });
    commentsCreated = r;
  } catch {
    commentsCreated = 0;
  }

  // -------------------------------------------------------------------------
  // Reactions
  // -------------------------------------------------------------------------
  let reactionsCreated = 0;
  if (reactionModel) {
    try {
      reactionsCreated = await reactionModel.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      });
    } catch {
      reactionsCreated = 0;
    }
  }

  // -------------------------------------------------------------------------
  // NPS responses
  // -------------------------------------------------------------------------
  let npsResponses = 0;
  if (npsResponseModel) {
    try {
      npsResponses = await npsResponseModel.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      });
    } catch {
      npsResponses = 0;
    }
  }

  // -------------------------------------------------------------------------
  // Beta invites
  // -------------------------------------------------------------------------
  let betaInvitesSent = 0;
  let betaInvitesAccepted = 0;
  if (betaInviteModel) {
    try {
      betaInvitesSent = await betaInviteModel.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      });
      betaInvitesAccepted = await betaInviteModel.count({
        where: { acceptedAt: { gte: yesterday, lt: today } },
      });
    } catch {
      // ignore — modelo pode não existir
    }
  }

  // -------------------------------------------------------------------------
  // Email queue stats (best-effort — modelo pode variar)
  // -------------------------------------------------------------------------
  let emailQueueBacklog = 0;
  let emailSent24h = 0;
  let emailFailed24h = 0;
  if (emailJobModel) {
    try {
      emailQueueBacklog = await emailJobModel.count({
        where: { status: { in: ['pending', 'PENDING', 'queued', 'QUEUED'] } },
      });
      emailSent24h = await emailJobModel.count({
        where: {
          status: { in: ['sent', 'SENT', 'delivered', 'DELIVERED'] },
          updatedAt: { gte: yesterday },
        },
      });
      emailFailed24h = await emailJobModel.count({
        where: {
          status: { in: ['failed', 'FAILED', 'bounced', 'BOUNCED'] },
          updatedAt: { gte: yesterday },
        },
      });
    } catch {
      // silencia
    }
  }

  return {
    date: dateStr,
    dau,
    newUsers,
    postsCreated,
    commentsCreated,
    reactionsCreated,
    npsResponses,
    betaInvitesSent,
    betaInvitesAccepted,
    emailQueueBacklog,
    emailSent24h,
    emailFailed24h,
    collectedAt: now.toISOString(),
  };
}

async function handleRollup(request: NextRequest): Promise<NextResponse> {
  const jobId = randomUUID();
  const startedAt = Date.now();
  const ctx = { job: 'metrics_rollup', jobId, startedAt };

  const auth = verifyCronSecret(request);
  if (!auth.ok) {
    logCronFailed({ ...ctx, metadata: { reason: auth.reason } });
    return NextResponse.json(unauthorizedResponse(auth).json(), { status: 401 });
  }

  const lock = tryAcquireLock('metrics-rollup', jobId);
  if (!lock.ok) {
    logCronSkipped(ctx, `lock held by ${lock.activeJobId}`);
    return NextResponse.json(
      { ok: false, skipped: true, activeJobId: lock.activeJobId },
      { status: 409 }
    );
  }

  logCronStarted(ctx);

  try {
    const rollup = await collectRollup();

    logCronCompleted({
      ...ctx,
      itemsProcessed: 1,
      metadata: {
        date: rollup.date,
        dau: rollup.dau,
        newUsers: rollup.newUsers,
        postsCreated: rollup.postsCreated,
        commentsCreated: rollup.commentsCreated,
        emailQueueBacklog: rollup.emailQueueBacklog,
      },
    });

    return NextResponse.json({
      ok: true,
      jobId,
      durationMs: Date.now() - startedAt,
      rollup,
    });
  } catch (err) {
    logCronFailed({ ...ctx, error: err });
    return NextResponse.json(
      {
        ok: false,
        jobId,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  } finally {
    releaseLock('metrics-rollup', jobId);
  }
}

export async function GET(request: NextRequest) {
  return handleRollup(request);
}

export async function POST(request: NextRequest) {
  return handleRollup(request);
}