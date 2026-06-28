// ============================================================================
// GET/POST /api/cron/process-email-queue — drena queue de email_jobs (Wave 20)
// ============================================================================
// Roda a cada 15min via Vercel Cron (configurar em vercel.json):
//   { "path": "/api/cron/process-email-queue", "schedule": "*\/15 * * * *" }
//
// Fluxo:
//   1. SELECT pending jobs WHERE scheduledFor <= now() LIMIT 25
//   2. Para cada job: sendEmail → markSent | markFailed (com backoff)
//   3. Retorna stats (sent/failed/skipped + queue stats agregadas)
//
// Auth: header Authorization: Bearer ${CRON_SECRET}
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email/send';
import { getQueueStats } from '@/lib/email/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s — processa até ~100 emails

// ============================================================================
// Auth — Vercel Cron envia Authorization: Bearer ${CRON_SECRET}
// ============================================================================

function isAuthorized(request: NextRequest): boolean {
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[api/cron/process-email-queue] CRON_SECRET não definido; modo dev permissive');
      return true;
    }
    return false;
  }
  return provided === expected;
}

// ============================================================================
// Handler (GET ou POST — Vercel Cron usa GET por padrão)
// ============================================================================

async function runQueue(batchSize = 25) {
  const result = await processEmailQueue(batchSize);
  const stats = await getQueueStats();
  return {
    ok: true,
    processed: result.picked,
    sent: result.sent,
    failed: result.failed,
    skipped: result.skipped,
    errors: result.errors.slice(0, 10), // limita tamanho da resposta
    queue: stats,
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }
  try {
    const result = await runQueue();
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/cron/process-email-queue][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao processar queue de emails' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }
  try {
    const result = await runQueue();
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/cron/process-email-queue][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao processar queue de emails' },
      { status: 500 }
    );
  }
}
