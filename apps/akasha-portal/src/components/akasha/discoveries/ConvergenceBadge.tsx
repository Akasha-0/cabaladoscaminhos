'use client';

/**
 * ConvergenceBadge — Wave 23.2 (UI Cadeia Viva).
 *
 * Destaque visual da "verdade universal" — Step 5 do ThoughtChainView.
 *
 * É o ponto de CONVERGÊNCIA onde os 5 pilares + literatura + chains
 * anteriores + trânsito + histórico do cliente AGIRAM juntos.
 *
 * Universalista+visceral (ADR-013):
 *   - Truth visualmente centralizada (anel radiante + halo).
 *   - ≤ 15 palavras (regra Wave 20.2 — não vira parágrafo).
 *   - Sem "✨ místico" — usa Sparkles + glow discreto que remete à ideia
 *     de "ponto onde tudo se encontra".
 *
 * Acessibilidade:
 *   - role="status" (anuncia mudança, mas não interrompe).
 *   - aria-live="polite" — Screen reader anuncia a verdade.
 *   - Decorado: aria-hidden=true no emoji/sparkle; texto real no <p>.
 */
import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/shared/utils';

export interface ConvergenceBadgeProps {
  /** Verdade universal (≤ 15 palavras). */
  verdadeUniversal: string;
  /** Confiança da síntese 0-1 (mostra como mini-badge "confiança XX%"). */
  confidence: number;
  /** Locale para o label "confiança" (pt-BR | en). */
  locale?: string;
  className?: string;
}

function confidenceLabel(confidence: number, locale: string): string {
  const pct = Math.round(confidence * 100);
  if (locale === 'en') return `confidence ${pct}%`;
  return `confiança ${pct}%`;
}

export function ConvergenceBadge({
  verdadeUniversal,
  confidence,
  locale = 'pt-BR',
  className,
}: ConvergenceBadgeProps) {
  return (
    <aside
      data-testid="convergence-badge"
      role="status"
      aria-live="polite"
      className={cn(
        'relative overflow-hidden rounded-xl border border-violet-700/40',
        'bg-gradient-to-br from-violet-950/60 via-slate-900 to-violet-950/40',
        'px-4 py-4 shadow-[0_0_24px_-12px_rgba(139,92,246,0.6)]',
        className
      )}
    >
      {/* Halo decorativo (não-semântico) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_60%)]"
      />

      <div className="relative flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-900/60 ring-1 ring-violet-500/40"
        >
          <Sparkles className="h-4 w-4 text-violet-300" />
        </span>

        <div className="min-w-0 flex-1">
          <header className="mb-1 flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-violet-300">
              {locale === 'en' ? 'Convergence' : 'Convergência'}
            </h4>
            <span className="rounded-full bg-violet-900/60 px-2 py-0.5 text-[10px] font-medium text-violet-200 ring-1 ring-violet-700/40">
              {confidenceLabel(confidence, locale)}
            </span>
          </header>

          <p
            data-testid="convergence-truth"
            className="text-base font-medium leading-snug text-slate-50 sm:text-lg"
          >
            <span aria-hidden="true" className="mr-1 text-violet-400">
              ✦
            </span>
            {verdadeUniversal}
          </p>
        </div>
      </div>
    </aside>
  );
}