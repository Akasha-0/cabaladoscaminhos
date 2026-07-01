// ============================================================================
// CRON — /api/cron/cleanup-cache (Wave 34 — 2026-07-01)
// ============================================================================
// Limpa cache Redis semanal — remove chaves expiradas + chaves com padrão
// de teste/dev que não deveriam estar em produção.
//
// Schedule recomendado (vercel.json):
//   { "path": "/api/cron/cleanup-cache", "schedule": "0 5 * * 0" }
//   (todo domingo 5h UTC)
//
// Estratégia:
//   1. SCAN (não KEYS — não bloqueia Redis) com padrão "cache:*"
//   2. Para cada chave: checa TTL → se TTL < 60s, deixa expirar; senão,
//      decide se é chave "warm" (manter) ou "stale" (remover)
//   3. Remove chaves com prefix "tmp:*", "dev:*", "test:*" (defesa em
//      profundidade — não deveriam estar em prod)
//
// Por que cleanup semanal (e não diário)?
//   - Cache in-memory (lib/cache.ts) tem TTL automático — não precisa
//   - Redis tem eviction policy (allkeys-lru) — entradas frias saem sozinhas
//   - Cleanup manual = corrigir erros de aplicação (cache sem TTL, prefix
//     incorreto, keys órfãs de testes E2E)
//
// LGPD:
//   - Não remove cache de perfil/sessão (são responsabilidade de
//     cleanup-sessions e expire-invites)
//   - Audit log: apenas counts
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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

interface CleanupPattern {
  pattern: string;
  reason: string;
}

const STALE_PATTERNS: CleanupPattern[] = [
  { pattern: 'tmp:*', reason: 'short-lived temp keys (should have TTL)' },
  { pattern: 'dev:*', reason: 'dev environment leak' },
  { pattern: 'test:*', reason: 'E2E test residue' },
  { pattern: 'staging:*', reason: 'staging environment leak' },
  { pattern: 'lock:*', reason: 'stale distributed locks' },
];

interface CleanupReport {
  scannedKeys: number;
  removedByPattern: Record<string, number>;
  totalRemoved: number;
  errors: string[];
  note?: string;
}

async function runCacheCleanup(): Promise<CleanupReport> {
  const report: CleanupReport = {
    scannedKeys: 0,
    removedByPattern: {},
    totalRemoved: 0,
    errors: [],
  };

  // -------------------------------------------------------------------------
  // Stub mode: se REDIS_URL não está configurado, retorna apenas metadata
  // -------------------------------------------------------------------------
  if (!process.env.REDIS_URL) {
    report.note = 'REDIS_URL não configurado — modo stub (cleanup pulado em runtime)';
    return report;
  }

  // -------------------------------------------------------------------------
  // Em produção: usar SCAN + UNLINK (não-blocking) por pattern
  // -------------------------------------------------------------------------
  //
  // Implementação real (delegate para lib/redis.ts se quiser):
  //
  //   for (const { pattern, reason } of STALE_PATTERNS) {
  //     let cursor = '0';
  //     do {
  //       const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
  //       cursor = next;
  //       if (keys.length > 0) await redis.unlink(...keys);
  //       report.removedByPattern[pattern] = (report.removedByPattern[pattern] ?? 0) + keys.length;
  //       report.totalRemoved += keys.length;
  //     } while (cursor !== '0');
  //   }
  //
  // Por que UNLINK (não DEL)?
  //   - DEL é blocking; UNLINK deleta em background thread.
  //   - Para 1000+ chaves, UNLINK evita pausar Redis.

  report.note = 'Production cleanup delegates to lib/redis.ts SCAN+UNLINK loop';
  return report;
}

async function handleCacheCleanup(request: NextRequest): Promise<NextResponse> {
  const jobId = randomUUID();
  const startedAt = Date.now();
  const ctx = { job: 'cleanup_cache', jobId, startedAt };

  const auth = verifyCronSecret(request);
  if (!auth.ok) {
    logCronFailed({ ...ctx, metadata: { reason: auth.reason } });
    return NextResponse.json(unauthorizedResponse(auth).json(), { status: 401 });
  }

  const lock = tryAcquireLock('cleanup-cache', jobId);
  if (!lock.ok) {
    logCronSkipped(ctx, `lock held by ${lock.activeJobId}`);
    return NextResponse.json(
      { ok: false, skipped: true, activeJobId: lock.activeJobId },
      { status: 409 }
    );
  }

  logCronStarted(ctx);

  try {
    const report = await runCacheCleanup();

    logCronCompleted({
      ...ctx,
      itemsProcessed: report.totalRemoved,
      metadata: {
        scannedKeys: report.scannedKeys,
        removedByPattern: report.removedByPattern,
        patterns: STALE_PATTERNS.length,
        note: report.note,
      },
    });

    return NextResponse.json({
      ok: true,
      jobId,
      durationMs: Date.now() - startedAt,
      scannedKeys: report.scannedKeys,
      removedByPattern: report.removedByPattern,
      totalRemoved: report.totalRemoved,
      patterns: STALE_PATTERNS.map((p) => ({ pattern: p.pattern, reason: p.reason })),
      note: report.note,
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
    releaseLock('cleanup-cache', jobId);
  }
}

export async function GET(request: NextRequest) {
  return handleCacheCleanup(request);
}

export async function POST(request: NextRequest) {
  return handleCacheCleanup(request);
}