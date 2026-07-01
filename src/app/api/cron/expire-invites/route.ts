// ============================================================================
// CRON — /api/cron/expire-invites (Wave 33 — 2026-07-01)
// ============================================================================
// Move convites beta cujo expiresAt já passou para status=EXPIRED.
// Complementa `expireOverdueInvites()` em src/lib/beta/invites.ts
// (já idempotente via updateMany).
//
// Schedule recomendado: a cada 6h via Vercel Cron (vercel.json):
//   { "path": "/api/cron/expire-invites", "schedule": "0 */6 * * *" }
//
// Segurança:
//   - Authorization: Bearer ${CRON_SECRET}
//   - Em dev (NODE_ENV != production), CRON_SECRET ausente = permissive
//
// LGPD:
//   - Nenhum PII no response (apenas counts agregados)
//   - Audit log via AuditAction.INVITE_EXPIRED_BATCH no metadata
//
// Idempotência:
//   - updateMany com where status IN (PENDING,SENT,OPENED) AND expiresAt<now
//   - Segunda execução no mesmo intervalo: count=0 (sem efeito colateral)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { expireOverdueInvites } from '@/lib/beta/invites';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30; // 30s — updateMany é barato

// ============================================================================
// Auth — Vercel Cron envia Authorization: Bearer ${CRON_SECRET}
// ============================================================================

function isAuthorized(request: NextRequest): boolean {
  const provided = request.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '');
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        '[api/cron/expire-invites] CRON_SECRET não definido; modo dev permissive'
      );
      return true;
    }
    return false;
  }
  return provided === expected;
}

// ============================================================================
// Handler — GET ou POST (Vercel Cron usa GET por padrão)
// ============================================================================

async function runExpireInvites(): Promise<{
  ok: true;
  expiredCount: number;
  durationMs: number;
  ranAt: string;
}> {
  const start = Date.now();
  const ranAt = new Date();

  const expiredCount = await expireOverdueInvites(ranAt);

  const durationMs = Date.now() - start;

  // Audit log agregado (LGPD Art. 37) — somente metadados, sem PII
  await logAudit({
    action: 'INVITE_EXPIRED_BATCH',
    actorId: null, // system event, no actor
    metadata: {
      expiredCount,
      durationMs,
      ranAt: ranAt.toISOString(),
      source: 'cron:expire-invites',
    },
  }).catch((err: unknown) => {
    // Audit log é best-effort — não falhar cron se log falhar
    // eslint-disable-next-line no-console
    console.error('[api/cron/expire-invites] audit log falhou:', err);
  });

  return {
    ok: true,
    expiredCount,
    durationMs,
    ranAt: ranAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }
  try {
    const result = await runExpireInvites();
    return NextResponse.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/cron/expire-invites][GET] error', err);
    return NextResponse.json(
      {
        error: 'Erro ao expirar convites',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }
  try {
    const result = await runExpireInvites();
    return NextResponse.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/cron/expire-invites][POST] error', err);
    return NextResponse.json(
      {
        error: 'Erro ao expirar convites',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}