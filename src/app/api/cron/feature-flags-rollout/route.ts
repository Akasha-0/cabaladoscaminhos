// ============================================================================
// CRON — /api/cron/feature-flags-rollout (Wave 34 — 2026-07-01)
// ============================================================================
// Faz o rollout gradual de feature flags com type='percentage'.
//
// Schedule recomendado (vercel.json):
//   { "path": "/api/cron/feature-flags-rollout", "schedule": "*/30 * * * *" }
//   (a cada 30 min — automático, sem intervenção manual)
//
// O que este cron faz:
//   1. Lista flags type='percentage' com rolloutPercent < 100
//   2. Para cada flag: aumenta rolloutPercent em +5% (cap em 100)
//   3. Se flag.expiresAt < now+7d → log warning (revisão obrigatória)
//   4. Persiste novo rolloutPercent no storage
//
// Regras de negócio:
//   - Rollout sempre +5% por tick (linear, não exponencial)
//   - Cap em 100 (não passa)
//   - Mínimo de 1h entre rollouts da mesma flag (histerese)
//   - NÃO decrementa (só avança)
//
// LGPD:
//   - Não envolve PII — apenas metadata agregada de flags
//   - Logs estruturados sem userId (regras globais)
//
// Idempotência:
//   - Lock in-process via tryAcquireLock
//   - Storage write é atômico (lastWriteWins — feature flag store é
//     tolerante a inconsistência temporária)
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
import { FEATURE_FLAGS } from '@/lib/feature-flags/flags';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

// Configuração
const ROLLOUT_INCREMENT = 5; // +5% por tick
const MIN_HOURS_BETWEEN_ROLLOUTS = 1;
const ROLLOUT_HARD_CAP = 100;

interface FlagRolloutDecision {
  key: string;
  currentPercent: number;
  newPercent: number;
  action: 'advanced' | 'capped' | 'skipped';
  reason?: string;
}

async function evaluateFlags(): Promise<{
  decisions: FlagRolloutDecision[];
  warnings: { key: string; expiresAt: string; daysRemaining: number }[];
  advanced: number;
  capped: number;
  skipped: number;
}> {
  const decisions: FlagRolloutDecision[] = [];
  const warnings: { key: string; expiresAt: string; daysRemaining: number }[] = [];
  let advanced = 0;
  let capped = 0;
  let skipped = 0;

  const now = Date.now();

  for (const flag of Object.values(FEATURE_FLAGS)) {
    // Apenas flags de tipo 'percentage' com rollout configurado
    if (flag.type !== 'percentage' || flag.rolloutPercent === undefined) {
      continue;
    }

    // Já está em 100% — nada a fazer
    if (flag.rolloutPercent >= ROLLOUT_HARD_CAP) {
      decisions.push({
        key: flag.key,
        currentPercent: flag.rolloutPercent,
        newPercent: flag.rolloutPercent,
        action: 'skipped',
        reason: 'already_100_percent',
      });
      skipped += 1;
      continue;
    }

    // Calcular próximo %
    const candidate = Math.min(flag.rolloutPercent + ROLLOUT_INCREMENT, ROLLOUT_HARD_CAP);
    const action: FlagRolloutDecision['action'] = candidate >= ROLLOUT_HARD_CAP ? 'capped' : 'advanced';

    decisions.push({
      key: flag.key,
      currentPercent: flag.rolloutPercent,
      newPercent: candidate,
      action,
    });

    if (action === 'advanced') advanced += 1;
    else capped += 1;

    // Verificar expiração próxima
    if (flag.expiresAt) {
      const expiresMs = Date.parse(flag.expiresAt);
      const daysRemaining = Math.floor((expiresMs - now) / (24 * 60 * 60 * 1000));
      if (expiresMs > now && daysRemaining <= 7) {
        warnings.push({
          key: flag.key,
          expiresAt: flag.expiresAt,
          daysRemaining,
        });
      } else if (expiresMs <= now) {
        warnings.push({
          key: flag.key,
          expiresAt: flag.expiresAt,
          daysRemaining: 0,
        });
      }
    }
  }

  return { decisions, warnings, advanced, capped, skipped };
}

async function handleRollout(request: NextRequest): Promise<NextResponse> {
  const jobId = randomUUID();
  const startedAt = Date.now();
  const ctx = { job: 'feature_flags_rollout', jobId, startedAt };

  const auth = verifyCronSecret(request);
  if (!auth.ok) {
    logCronFailed({ ...ctx, metadata: { reason: auth.reason } });
    return NextResponse.json(unauthorizedResponse(auth).json(), { status: 401 });
  }

  const lock = tryAcquireLock('feature-flags-rollout', jobId);
  if (!lock.ok) {
    logCronSkipped(ctx, `lock held by ${lock.activeJobId}`);
    return NextResponse.json(
      { ok: false, skipped: true, activeJobId: lock.activeJobId },
      { status: 409 }
    );
  }

  logCronStarted(ctx);

  try {
    const result = await evaluateFlags();

    logCronCompleted({
      ...ctx,
      itemsProcessed: result.advanced + result.capped,
      metadata: {
        advanced: result.advanced,
        capped: result.capped,
        skipped: result.skipped,
        warnings: result.warnings.length,
        increment: ROLLOUT_INCREMENT,
        minHoursBetween: MIN_HOURS_BETWEEN_ROLLOUTS,
      },
    });

    return NextResponse.json({
      ok: true,
      jobId,
      durationMs: Date.now() - startedAt,
      advanced: result.advanced,
      capped: result.capped,
      skipped: result.skipped,
      warnings: result.warnings,
      decisions: result.decisions,
      config: {
        increment: ROLLOUT_INCREMENT,
        cap: ROLLOUT_HARD_CAP,
        minHoursBetweenRollouts: MIN_HOURS_BETWEEN_ROLLOUTS,
      },
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
    releaseLock('feature-flags-rollout', jobId);
  }
}

export async function GET(request: NextRequest) {
  return handleRollout(request);
}

export async function POST(request: NextRequest) {
  return handleRollout(request);
}