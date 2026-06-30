/**
 * ════════════════════════════════════════════════════════════════════════════
 * W93-A — REPUTATION CARD · MOBILE-FIRST UI
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 93 · 2026-06-30
 *
 * Card que mostra:
 *   - Snapshot da reputação de uma pessoa (5 eixos)
 *   - Status LGPD (opt-in/pending/opted-out)
 *   - Total de atribuições (sem PII)
 *   - Botão de opt-out (LGPD)
 *   - Botão de opt-in (LGPD)
 *
 * Mobile-first:
 *   - min 44px tap targets (Apple HIG / Material)
 *   - aria-live para mudanças de score
 *   - aria-label descritivo em cada eixo
 *   - Reduced-motion respeitado
 *
 * Sem ranking. Sem comparação. Sem número único. 5 eixos sempre.
 *
 * Durable lessons applied:
 *   - 'use client' directive (Next.js 14 App Router)
 *   - pt-BR strings (sem i18n acoplado aqui)
 *   - Termos sagrados preservados
 *   - cycle 92 lesson #11: ARIA labels descritivos
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AXIS_LABELS_PT_BR, AXIS_GLYPHS, TREND_LABELS_PT_BR } from '@/lib/w93/reputation-engine';
import type {
  ReputationAxis,
  ReputationSnapshot,
  ConsentStatus,
} from '@/lib/w93/reputation-types';

// ════════════════════════════════════════════════════════════════════════════
// PROPS
// ════════════════════════════════════════════════════════════════════════════

export interface ReputationCardProps {
  /** Snapshot LGPD-safe — gerado pelo engine. */
  readonly snapshot: ReputationSnapshot;
  /** Handler de opt-in (LGPD). Recebe personId para confirmar. */
  readonly onOptIn?: (personId: string) => void;
  /** Handler de opt-out (LGPD). Recebe personId para confirmar. */
  readonly onOptOut?: (personId: string) => void;
  /** Mostrar controles de consent (false = read-only display). */
  readonly showConsentControls?: boolean;
  /** Classe adicional. */
  readonly className?: string;
  /** Compact mode (sem histórico detalhado). */
  readonly compact?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const CONSENT_LABEL: Readonly<Record<ConsentStatus, string>> = {
  'opted-in': 'Opt-in ativo · você pode ser avaliada',
  'opted-out': 'Opt-out · nenhuma atribuição é exibida',
  pending: 'Consentimento pendente',
};

const CONSENT_TONE: Readonly<Record<ConsentStatus, string>> = {
  'opted-in': 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300',
  'opted-out': 'border-slate-500/40 bg-slate-500/5 text-slate-300',
  pending: 'border-amber-500/40 bg-amber-500/5 text-amber-300',
};

export function ReputationCard({
  snapshot,
  onOptIn,
  onOptOut,
  showConsentControls = true,
  className,
  compact = false,
}: ReputationCardProps): React.ReactElement {
  // Trend detection label (pt-BR)
  const trendText = (axis: ReputationAxis, trend: string): string => {
    const label = AXIS_LABELS_PT_BR[axis];
    const trendLabel = TREND_LABELS_PT_BR[trend as keyof typeof TREND_LABELS_PT_BR] ?? trend;
    return `${label}: ${trendLabel}`;
  };

  return (
    <article
      className={cn(
        'rounded-2xl border border-violet-500/20 bg-slate-900/60 backdrop-blur-sm',
        'p-4 sm:p-6 shadow-lg shadow-violet-900/10',
        'motion-reduce:transition-none',
        className,
      )}
      aria-labelledby={`rep-card-title-${snapshot.personId}`}
      aria-live="polite"
      aria-atomic="false"
      data-testid="reputation-card"
    >
      {/* Header */}
      <header className="mb-4">
        <h2
          id={`rep-card-title-${snapshot.personId}`}
          className="text-lg sm:text-xl font-semibold text-violet-200"
        >
          Reputação universalista
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          5 eixos · sem número único · sem ranking entre tradições
        </p>
      </header>

      {/* LGPD Consent status */}
      <div
        className={cn(
          'mb-4 rounded-lg border px-3 py-2 text-xs',
          CONSENT_TONE[snapshot.consentStatus],
        )}
        role="status"
        aria-label={`Status de consentimento: ${CONSENT_LABEL[snapshot.consentStatus]}`}
        data-testid="consent-status"
      >
        <span className="font-medium">LGPD ·</span>{' '}
        {CONSENT_LABEL[snapshot.consentStatus]}
      </div>

      {/* 5-axis grid */}
      <ul
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
        role="list"
        aria-label="Cinco eixos de reputação"
      >
        {snapshot.axes.map((a) => (
          <li
            key={a.axis}
            className={cn(
              'rounded-xl border border-violet-500/20 bg-slate-800/40',
              'p-3 flex items-center gap-3',
              'min-h-[44px]', // tap target
            )}
            aria-label={trendText(a.axis, a.trend)}
            data-testid={`axis-${a.axis}`}
          >
            <span
              className="text-2xl shrink-0"
              aria-hidden="true"
              data-testid={`axis-glyph-${a.axis}`}
            >
              {AXIS_GLYPHS[a.axis]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-violet-100 truncate">
                {AXIS_LABELS_PT_BR[a.axis]}
              </div>
              <div className="text-xs text-slate-400">
                {a.count === 0 ? (
                  <span>Sem atribuições</span>
                ) : (
                  <span>
                    {Math.round(a.rawScore)} / 100 · {a.count}{' '}
                    {a.count === 1 ? 'atribuição' : 'atribuições'}
                  </span>
                )}
              </div>
            </div>
            {/* Trend indicator */}
            <span
              className={cn(
                'shrink-0 w-2 h-2 rounded-full',
                a.trend === 'rising' && 'bg-emerald-400',
                a.trend === 'stable' && 'bg-slate-400',
                a.trend === 'falling' && 'bg-rose-400',
                a.trend === 'new' && 'bg-amber-400',
              )}
              aria-hidden="true"
              title={TREND_LABELS_PT_BR[a.trend]}
            />
          </li>
        ))}
      </ul>

      {/* Meta — só se não-compact */}
      {!compact && (
        <dl
          className="grid grid-cols-2 gap-3 mb-4 text-xs"
          aria-label="Metadados de reputação"
        >
          <div>
            <dt className="text-slate-400">Total de atribuições</dt>
            <dd
              className="text-violet-100 font-medium tabular-nums"
              data-testid="total-attributions"
            >
              {snapshot.totalAttributions}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Retenção</dt>
            <dd className="text-violet-100 font-medium tabular-nums">
              {snapshot.retentionDays} dias
            </dd>
          </div>
        </dl>
      )}

      {/* LGPD Consent controls — 44px min */}
      {showConsentControls && (
        <div
          className="flex flex-col sm:flex-row gap-2"
          role="group"
          aria-label="Controles LGPD de consentimento"
        >
          {snapshot.consentStatus !== 'opted-in' && onOptIn && (
            <button
              type="button"
              onClick={() => onOptIn(snapshot.personId as string)}
              className={cn(
                'min-h-[44px] px-4 rounded-lg',
                'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700',
                'text-white text-sm font-medium',
                'transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400',
              )}
              aria-label="Opt-in para ser avaliada na reputação universalista"
              data-testid="btn-opt-in"
            >
              Aceitar ser avaliada
            </button>
          )}
          {snapshot.consentStatus !== 'opted-out' && onOptOut && (
            <button
              type="button"
              onClick={() => onOptOut(snapshot.personId as string)}
              className={cn(
                'min-h-[44px] px-4 rounded-lg',
                'bg-slate-700 hover:bg-slate-600 active:bg-slate-800',
                'text-slate-100 text-sm font-medium',
                'transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400',
              )}
              aria-label="Opt-out — remover todas as atribuições e parar de ser avaliada"
              data-testid="btn-opt-out"
            >
              Sair da reputação
            </button>
          )}
        </div>
      )}
    </article>
  );
}