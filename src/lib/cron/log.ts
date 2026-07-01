// ============================================================================
// CRON STRUCTURED LOGGING — Wave 34
// ============================================================================
// Log JSON estruturado para todos os endpoints /api/cron/*.
//
// Padrão de eventos (sufixos padronizados para alerting):
//   - cron_<name>_started
//   - cron_<name>_completed
//   - cron_<name>_failed
//   - cron_<name>_skipped
//
// Cada evento inclui:
//   - jobId (uuid v4 — correlação)
//   - durationMs
//   - itemsProcessed
//   - errorStack (apenas em failed)
//   - timestamp ISO
//
// LGPD:
//   - Nunca logar PII (email, nome, telefone, IP, userId puro)
//   - Usar hashUserId() (FNV-1a) se correlacionar por user for necessário
//
// Output:
//   - console.log em dev (JSON.stringify com cores)
//   - console.log em prod (JSON puro — coletado por Vercel/Datadog)
// ============================================================================

import { randomUUID } from 'crypto';

export interface CronLogContext {
  job: string;
  jobId?: string;
  startedAt?: number;
  itemsProcessed?: number;
  error?: unknown;
  metadata?: Record<string, unknown>;
}

/** Formato de log canônico — JSON puro para parse externo. */
export interface CronLogEntry {
  level: 'info' | 'warn' | 'error';
  event: string;
  job: string;
  jobId: string;
  timestamp: string;
  durationMs?: number;
  itemsProcessed?: number;
  errorMessage?: string;
  errorStack?: string;
  metadata?: Record<string, unknown>;
}

/** Hash FNV-1a 32-bit determinístico — para correlação LGPD-safe. */
export function hashForLog(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash =
      (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Emite log JSON estruturado em stdout. */
function emit(entry: CronLogEntry): void {
  const json = JSON.stringify(entry);
  if (entry.level === 'error') {
    // eslint-disable-next-line no-console
    console.error(json);
  } else if (entry.level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(json);
  } else {
    // eslint-disable-next-line no-console
    console.log(json);
  }
}

function makeEntry(
  ctx: CronLogContext,
  event: string,
  level: CronLogEntry['level'] = 'info'
): CronLogEntry {
  const jobId = ctx.jobId ?? randomUUID();
  const durationMs =
    ctx.startedAt !== undefined ? Date.now() - ctx.startedAt : undefined;

  const entry: CronLogEntry = {
    level,
    event,
    job: ctx.job,
    jobId,
    timestamp: new Date().toISOString(),
  };

  if (durationMs !== undefined) entry.durationMs = durationMs;
  if (ctx.itemsProcessed !== undefined) entry.itemsProcessed = ctx.itemsProcessed;
  if (ctx.metadata !== undefined) entry.metadata = ctx.metadata;

  if (ctx.error !== undefined) {
    const err = ctx.error as { message?: string; stack?: string };
    entry.errorMessage = err?.message ?? String(ctx.error);
    if (err?.stack) entry.errorStack = err.stack.split('\n').slice(0, 8).join('\n');
  }

  return entry;
}

/** Log: cron_X_started — emitido no início do handler. */
export function logCronStarted(ctx: CronLogContext): string {
  const jobId = ctx.jobId ?? randomUUID();
  const entry = makeEntry({ ...ctx, jobId }, `cron_${ctx.job}_started`, 'info');
  emit(entry);
  return jobId;
}

/** Log: cron_X_completed — emitido no fim bem-sucedido. */
export function logCronCompleted(ctx: CronLogContext): void {
  emit(makeEntry(ctx, `cron_${ctx.job}_completed`, 'info'));
}

/** Log: cron_X_failed — emitido em caso de erro. */
export function logCronFailed(ctx: CronLogContext): void {
  emit(makeEntry(ctx, `cron_${ctx.job}_failed`, 'error'));
}

/** Log: cron_X_skipped — emitido quando lock está ativo (idempotência). */
export function logCronSkipped(ctx: CronLogContext, reason: string): void {
  emit(makeEntry({ ...ctx, metadata: { ...ctx.metadata, skipReason: reason } }, `cron_${ctx.job}_skipped`, 'warn'));
}