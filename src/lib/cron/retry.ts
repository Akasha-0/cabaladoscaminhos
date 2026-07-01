// ============================================================================
// CRON RETRY POLICY — Exponential backoff (Wave 34)
// ============================================================================
// Backoff padrão para cron jobs:
//   - Attempt 1: immediate (0s)
//   - Attempt 2: 1 min
//   - Attempt 3: 5 min
//   - Attempt 4: 30 min
//   - Após 4 falhas: alert on-call (PagerDuty/Opsgenie webhook)
//
// Por que este padrão?
//   - Crons idempotentes rodam em intervalo fixo (15min, 1h, 1 dia).
//     Retry dentro do mesmo tick não ajuda — espera-se o PRÓXIMO tick.
//   - Aqui, "retry" significa: o backoff é documentado como guia para o
//     agendador (ex: Vercel Cron `retry: { attempts: 4, ... }`) e para
//     consumidores externos (ex: GitHub Actions retry strategy).
//
// LGPD: este módulo é puro (sem PII) — não há risco de vazamento.
// ============================================================================

export const CRON_RETRY_POLICY = {
  attempts: 4,
  backoff: {
    /** Delay em segundos entre cada tentativa */
    delays: [0, 60, 300, 1800] as const,
    /** Política exponencial */
    strategy: 'exponential' as const,
  },
  /** Após exceder `attempts`, alerta on-call via ALERT_WEBHOOK_URL */
  alertOnFinalFailure: true,
} as const;

export interface RetryDecision {
  shouldRetry: boolean;
  /** Delay em ms antes da próxima tentativa (0 = imediato) */
  delayMs: number;
  /** Tentativa atual (1-indexed) */
  attempt: number;
  /** Se true, alerta on-call após esta falha */
  isFinalFailure: boolean;
}

/**
 * Calcula a decisão de retry baseada no número da tentativa atual.
 *
 * @param attempt - 1-indexed (1 = primeira tentativa, 2 = segundo retry, ...)
 * @returns Decisão com shouldRetry, delayMs, isFinalFailure
 *
 * @example
 *   const decision = decideRetry(1);
 *   // { shouldRetry: true, delayMs: 0, attempt: 1, isFinalFailure: false }
 *
 *   const decision = decideRetry(5);
 *   // { shouldRetry: false, delayMs: 0, attempt: 5, isFinalFailure: true }
 */
export function decideRetry(attempt: number): RetryDecision {
  const { attempts, backoff } = CRON_RETRY_POLICY;
  const isFinalFailure = attempt >= attempts;

  if (isFinalFailure) {
    return { shouldRetry: false, delayMs: 0, attempt, isFinalFailure: true };
  }

  // attempt 1 → delay 0s, attempt 2 → 60s, attempt 3 → 5min, attempt 4 → 30min
  const delaySeconds = backoff.delays[attempt - 1] ?? 0;
  return {
    shouldRetry: true,
    delayMs: delaySeconds * 1000,
    attempt,
    isFinalFailure: false,
  };
}

/**
 * Wrapper que executa uma função com retry exponencial.
 *
 * ATENÇÃO: só use este wrapper para jobs de curta duração (< 60s).
 * Para jobs longos, prefira agendar o próximo tick e usar decideRetry()
 * diretamente.
 *
 * @param fn - Função assíncrona a ser executada
 * @param onFinalFailure - Callback opcional quando esgotam as tentativas
 * @returns Resultado da função bem-sucedida ou último erro
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  onFinalFailure?: (lastError: unknown) => void | Promise<void>
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= CRON_RETRY_POLICY.attempts; attempt++) {
    const decision = decideRetry(attempt);

    if (decision.delayMs > 0) {
      await sleep(decision.delayMs);
    }

    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      const next = decideRetry(attempt + 1);
      if (!next.shouldRetry) {
        if (onFinalFailure) await onFinalFailure(err);
        throw err;
      }
    }
  }

  // unreachable, mas TS exige
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}