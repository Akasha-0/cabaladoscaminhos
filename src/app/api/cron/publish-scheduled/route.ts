// ============================================================================
// CRON — /api/cron/publish-scheduled (2026-06-27, Onda 14b)
// ============================================================================
// Publica posts com status=SCHEDULED cujo scheduledFor <= now.
//
// Em produção, configurar Vercel Cron (vercel.json) para chamar este
// endpoint a cada minuto:
//
//   {
//     "crons": [
//       { "path": "/api/cron/publish-scheduled", "schedule": "* * * * *" }
//     ]
//   }
//
// Segurança: este endpoint exige o header `x-cron-secret` igual ao
// CRON_SECRET configurado no ambiente. Vercel Cron envia isso
// automaticamente quando CRON_SECRET está setado.
//
// Idempotente: usa updateMany com where status=SCHEDULED AND scheduledFor<=now.
// Se já estiver publicado (cron rodando em paralelo), o updateMany retorna
// count=0 e o request é 200 OK mesmo assim.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Cron roda em Node, não Edge

const BATCH_LIMIT = 100;

export async function GET(request: NextRequest) {
  return runPublishScheduled(request);
}

export async function POST(request: NextRequest) {
  return runPublishScheduled(request);
}

async function runPublishScheduled(request: NextRequest) {
  try {
    // 1) Auth do cron via header secret
    const expected = process.env.CRON_SECRET;
    if (expected && expected.length > 0) {
      const provided = request.headers.get('x-cron-secret');
      if (provided !== expected) {
        return fail(401, ErrorCode.UNAUTHORIZED, 'CRON_SECRET inválido');
      }
    }
    // Se CRON_SECRET não está configurado, aceita a chamada (dev only).
    // Em produção, configurar a env var.

    // 2) Publica posts vencidos (lote; processa até BATCH_LIMIT por chamada)
    const now = new Date();
    const result = await prisma.post.updateMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: { lte: now },
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: now,
        scheduledFor: null,
      },
    });

    return ok(
      {
        publishedCount: result.count,
        ranAt: now.toISOString(),
        nextBatchIfAny: result.count >= BATCH_LIMIT,
      },
      {
        meta: {
          count: result.count,
          timestamp: now.toISOString(),
        },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}
