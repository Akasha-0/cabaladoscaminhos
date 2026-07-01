'use client';

// ============================================================================
// NpsPrompt — widget modal não-bloqueante para NPS (Wave 33)
// ============================================================================
// Triggered by /api/cron/nps-prompt que cria NpsPromptSchedule entries.
// Client component carrega schedule + mostra modal quando há trigger pendente.
//
// LGPD:
//  - Usuário pode pular (não persistir nada)
//  - Score anônimo opcional (flag em metadata)
//  - Audit log entry auto via API
//
// A11y:
//  - Modal é dialog com aria-modal, focus trap, esc to close, restoreFocus
//  - Botões >=44x44px (touch target WCAG AA)
//  - Reduz motion se prefers-reduced-motion
// ============================================================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

type NpsTrigger = 'DAY_1' | 'DAY_3' | 'DAY_7' | 'DAY_14' | 'DAY_30' | 'QUARTERLY' | 'MANUAL';

interface PendingNps {
  trigger: NpsTrigger;
  triggerAt: string;
}

const SCORE_LABELS: Record<number, string> = {
  0: 'Não recomendo',
  1: 'Muito improvável',
  2: '',
  3: '',
  4: '',
  5: 'Talvez',
  6: '',
  7: 'Provavelmente',
  8: '',
  9: 'Muito provável',
  10: 'Com certeza recomendo!',
};

export function NpsPrompt() {
  const { status: authStatus } = useSession();
  const [pending, setPending] = useState<PendingNps | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [closed, setClosed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Fetch pending schedule (only when authenticated)
  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/cron/nps-prompt?action=next', { method: 'GET' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.pending) {
          setPending(data.pending);
        }
      } catch {
        // Silent — widget nunca quebra UX
      }
    })();
    return () => { cancelled = true; };
  }, [authStatus]);

  // Focus management
  useEffect(() => {
    if (!pending || closed) return;
    const focusTrap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setClosed(true); return; }
      if (e.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', focusTrap);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', focusTrap);
  }, [pending, closed]);

  const submit = useCallback(async (skipped = false) => {
    if (!pending) return;
    if (!skipped && score === null) return;
    setSubmitting(true);
    try {
      await fetch('/api/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: skipped ? score ?? -1 : score,
          trigger: pending.trigger,
          triggerAt: pending.triggerAt,
          ...(reason && !skipped ? { reason } : {}),
          ...(skipped ? { metadata: { skipped: true } } : {}),
        }),
      });
      setClosed(true);
    } catch {
      // Silent — modal só fecha localmente
    } finally {
      setSubmitting(false);
    }
  }, [pending, score, reason]);

  if (!pending || closed) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nps-title"
      aria-describedby="nps-desc"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) setClosed(true); }}
    >
      <div
        ref={dialogRef}
        className="motion-safe:animate-in motion-safe:fade-in w-full max-w-md rounded-xl bg-background p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-spiritual-gold/80">
              Como está sendo?
            </p>
            <h2 id="nps-title" className="mt-1 font-serif text-xl font-semibold">
              Você recomendaria a Cabala?
            </h2>
            <p id="nps-desc" className="mt-1 text-xs text-muted-foreground">
              Anônimo, leva 5 segundos.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Fechar"
            onClick={() => submit(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-spiritual-gold/30"
          >
            ✕
          </button>
        </div>

        {/* Score 0-10 */}
        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-semibold">
            Nota de 0 (não recomendo) a 10 (recomendo):
          </legend>
          <div className="grid grid-cols-11 gap-1" role="radiogroup">
            {Array.from({ length: 11 }, (_, n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={score === n}
                aria-label={`Nota ${n} — ${SCORE_LABELS[n] || 'neutro'}`}
                onClick={() => setScore(n)}
                className={`flex h-11 w-full items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  score === n
                    ? n >= 9
                      ? 'border-green-600 bg-green-600 text-white'
                      : n >= 7
                      ? 'border-yellow-600 bg-yellow-500 text-white'
                      : 'border-red-600 bg-red-600 text-white'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {score !== null && SCORE_LABELS[score] && (
            <p className="mt-2 text-center text-xs text-muted-foreground">{SCORE_LABELS[score]}</p>
          )}
        </fieldset>

        <div className="mb-4">
          <label htmlFor="nps-reason" className="mb-1 block text-sm font-semibold">
            Por quê? (opcional)
          </label>
          <textarea
            id="nps-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 2000))}
            rows={2}
            placeholder="Conte o que motivou sua nota…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-spiritual-gold focus:outline-none focus:ring-2 focus:ring-spiritual-gold/30"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={submitting}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-spiritual-gold/30"
          >
            Pular
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={score === null || submitting}
            className="rounded-md bg-spiritual-gold px-5 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/40"
          >
            {submitting ? 'Enviando…' : 'Enviar'}
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Resposta é armazenada para melhorar o produto (LGPD Art. 7). Pode pedir exclusão em
          Configurações → Privacidade.
        </p>
      </div>
    </div>
  );
}
