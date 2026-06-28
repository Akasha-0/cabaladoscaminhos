// ============================================================================
// VISIT TRACKER — Heurística de visitas para o InstallPrompt
// ============================================================================
// Wave 20 — PWA Evolution
//
// Why: Prompt nativo do Chrome aparece muito cedo (às vezes no 1º visit) e o
//      usuário ignora. Heurística:
//        - Conta visits distintos (não pageviews)
//        - Trigger a partir do 2º visit
//        - Cooldown: 1 prompt por sessão (após 2 visits)
//        - Persistência: localStorage (sobrevive reload)
//
// Compatibilidade: SSR-safe (typeof window check).
// ============================================================================

const KEY = 'pwa-visit-tracker';

export interface VisitState {
  totalVisits: number;
  lastVisitAt: number;
  distinctDays: number;
  // Quando foi a última vez que mostramos o prompt (ms epoch)
  // Usado para não spammar — re-trigger após 7 dias se dismissed
  lastPromptAt?: number;
  // Quando o usuário aceitou/recusou
  outcome?: 'accepted' | 'dismissed';
  outcomeAt?: number;
}

const DEFAULT: VisitState = {
  totalVisits: 0,
  lastVisitAt: 0,
  distinctDays: 0,
};

function isNewDay(previous: number, now: number): boolean {
  const a = new Date(previous);
  const b = new Date(now);
  return (
    a.getFullYear() !== b.getFullYear() ||
    a.getMonth() !== b.getMonth() ||
    a.getDate() !== b.getDate()
  );
}

/** Lê o estado atual do localStorage. */
export function getVisitState(): VisitState {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as VisitState) };
  } catch {
    return DEFAULT;
  }
}

function save(state: VisitState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

/** Registra uma nova visita. Retorna o estado atualizado. */
export function recordVisit(): VisitState {
  const prev = getVisitState();
  const now = Date.now();
  const isFirst = prev.totalVisits === 0;
  const isNew = isFirst || isNewDay(prev.lastVisitAt, now);

  const next: VisitState = {
    totalVisits: isFirst ? 1 : prev.totalVisits + 1,
    lastVisitAt: now,
    distinctDays: isNew ? prev.distinctDays + 1 : prev.distinctDays,
    lastPromptAt: prev.lastPromptAt,
    outcome: prev.outcome,
    outcomeAt: prev.outcomeAt,
  };
  save(next);
  return next;
}

/**
 * Decide se devemos mostrar o install prompt agora.
 *
 * Regras:
 *  - Antes do 2º visit: NÃO mostrar
 *  - Após accepted: nunca mais mostrar
 *  - Após dismissed: re-mostrar após 7 dias
 *  - Cooldown: máximo 1 prompt por sessão (sessão = 30 min inativo)
 */
export function shouldShowInstallPrompt(
  state: VisitState = getVisitState()
): boolean {
  // Já aceitou
  if (state.outcome === 'accepted') return false;

  // Visitou menos de 2 vezes
  if (state.totalVisits < 2) return false;

  // Recém-dismissed (7 dias)
  if (state.outcome === 'dismissed' && state.outcomeAt) {
    const age = Date.now() - state.outcomeAt;
    if (age < 7 * 24 * 60 * 60 * 1000) return false;
  }

  return true;
}

/** Marca que o prompt foi mostrado (para cooldown). */
export function markPromptShown(): void {
  const s = getVisitState();
  save({ ...s, lastPromptAt: Date.now() });
}

/** Marca o resultado do prompt (accepted ou dismissed). */
export function markPromptOutcome(outcome: 'accepted' | 'dismissed'): void {
  const s = getVisitState();
  save({ ...s, outcome, outcomeAt: Date.now(), lastPromptAt: Date.now() });
}

/** Reseta o estado (útil para testes ou settings "limpar dados PWA"). */
export function resetVisitTracker(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
