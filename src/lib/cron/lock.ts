// ============================================================================
// CRON IDEMPOTENCY LOCK — In-process lock (Wave 34)
// ============================================================================
// Lock simples em memória para evitar execuções concorrentes do mesmo cron.
//
// Por que in-process?
//   - Vercel Cron roda em single-instance por região (Lambda-like)
//   - Lock distribuído (Redis) seria overkill para crons de <60s
//   - Se o deploy fizer overlap entre instâncias, o lock de DB (UPDATE)
//     é a segunda linha de defesa (cada cron usa updateMany idempotente)
//
// LGPD: este módulo é puro (sem PII) — não há risco de vazamento.
// ============================================================================

interface LockEntry {
  acquiredAt: number;
  jobId: string;
}

const locks = new Map<string, LockEntry>();

/** TTL padrão: 5 min — alinhado com o timeout de execução do Vercel. */
const DEFAULT_LOCK_TTL_MS = 5 * 60 * 1000;

/** Resultado de tryAcquire — ok=false significa "job já em andamento". */
export interface LockAcquireResult {
  ok: boolean;
  /** jobId ativo se locked (para diagnóstico em log). */
  activeJobId?: string;
  /** Idade do lock em ms (se locked). */
  heldForMs?: number;
}

/**
 * Tenta adquirir um lock in-process para a chave fornecida.
 *
 * @param key - Identificador do job (ex: "backup-database")
 * @param jobId - UUID do job atual
 * @param ttlMs - TTL opcional (default 5min)
 *
 * @example
 *   const lock = tryAcquireLock('backup-database', jobId);
 *   if (!lock.ok) return logCronSkipped(...);
 */
export function tryAcquireLock(
  key: string,
  jobId: string,
  ttlMs: number = DEFAULT_LOCK_TTL_MS
): LockAcquireResult {
  const existing = locks.get(key);
  const now = Date.now();

  if (existing && now - existing.acquiredAt < ttlMs) {
    return {
      ok: false,
      activeJobId: existing.jobId,
      heldForMs: now - existing.acquiredAt,
    };
  }

  // Lock stale (TTL expirado) ou livre → sobrescreve
  locks.set(key, { acquiredAt: now, jobId });
  return { ok: true };
}

/** Libera o lock — chamar sempre no finally do handler. */
export function releaseLock(key: string, jobId: string): void {
  const existing = locks.get(key);
  if (existing && existing.jobId === jobId) {
    locks.delete(key);
  }
}

/** Cleanup de locks stale (chamado periodicamente, opcional). */
export function sweepStaleLocks(ttlMs: number = DEFAULT_LOCK_TTL_MS): number {
  const now = Date.now();
  let swept = 0;
  for (const [key, entry] of locks.entries()) {
    if (now - entry.acquiredAt >= ttlMs) {
      locks.delete(key);
      swept += 1;
    }
  }
  return swept;
}