'use client';

/**
 * DiscoveryCard — Wave 22.2 Zelador Attendance UI
 *
 * Card de insight da IA que aparece na coluna direita (desktop) ou
 * tab "Insights" (mobile) de /atendimento.
 *
 * Visual:
 *   ┌────────────────────────────────────────────────┐
 *   │  🔮  CABALA · Iluminador · 11       rank 92%   │
 *   │  Propósito é direção                            │
 *   │  "Caminho de Vida 11 — O Iluminador..."         │
 *   │                              [Citar] [👍] [👎] │
 *   └────────────────────────────────────────────────┘
 *
 * Por que cards individuais (não lista):
 *   - O Zelador precisa escanear visualmente QUAL Pilar gerou cada
 *     insight (universalista = nunca esconder a fonte).
 *   - Ações (citar/rate) ficam por card — não em bulk.
 *
 * Thumbs up/down:
 *   - Estado vazio: outline (padrão Wave 13.5).
 *   - Estado voted: filled, na cor do pilar.
 *   - Sem persistência aqui (parent AttendanceClient trackea).
 */

import { Sparkles, ThumbsDown, ThumbsUp, Quote } from 'lucide-react';

import type {
  AttendanceDiscovery,
  AttendanceRating,
  DiscoverySource,
} from '../shared';

// ─────────────────────────────────────────────────────────────────────────────
// Cores por Pilar — universalista + visceral (cor = reconhecimento rápido)
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_META: Record<
  DiscoverySource,
  { label: string; emoji: string; color: string; bg: string }
> = {
  cabala: {
    label: 'Cabala',
    emoji: '✡',
    color: 'text-purple-300',
    bg: 'bg-purple-500/10 border-purple-400/30',
  },
  astrologia: {
    label: 'Astrologia',
    emoji: '☉',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10 border-amber-400/30',
  },
  tantra: {
    label: 'Tantra',
    emoji: '🕉',
    color: 'text-pink-300',
    bg: 'bg-pink-500/10 border-pink-400/30',
  },
  odu: {
    label: 'Odu',
    emoji: '⚡',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10 border-emerald-400/30',
  },
  iching: {
    label: 'I Ching',
    emoji: '☯',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10 border-cyan-400/30',
  },
  literature: {
    label: 'Literatura',
    emoji: '📚',
    color: 'text-slate-300',
    bg: 'bg-slate-500/10 border-slate-400/30',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// i18n labels (parent passa via props para manter widget puro)
// ─────────────────────────────────────────────────────────────────────────────

export interface DiscoveryCardLabels {
  pillarLabel: string;
  cited: string;
  upvoted: string;
  downvoted: string;
}

export interface DiscoveryCardProps {
  discovery: AttendanceDiscovery;
  locale: string;
  /** Rating atual (controlado pelo parent — optimistic UI). */
  currentRating?: AttendanceRating | null;
  labels: DiscoveryCardLabels;
  onCite?: (discoveryId: string) => void;
  onRate?: (discoveryId: string, rating: AttendanceRating) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DiscoveryCard({
  discovery,
  locale: _locale,
  currentRating,
  labels,
  onCite,
  onRate,
}: DiscoveryCardProps) {
  const meta = SOURCE_META[discovery.source];
  const rankPct = Math.round(discovery.rankScore * 100);

  return (
    <article
      className={`rounded-2xl border ${meta.bg} p-4 flex flex-col gap-2 transition-colors`}
      data-testid="attendance-discovery-card"
      data-discovery-id={discovery.id}
      data-source={discovery.source}
    >
      {/* Header — pilar + símbolo + rank */}
      <header className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.15em] border ${meta.bg} ${meta.color}`}
            data-testid="discovery-source-badge"
          >
            <Sparkles className="w-3 h-3" aria-hidden />
            {meta.emoji} {labels.pillarLabel}: {meta.label}
          </span>
          {discovery.symbolRef && (
            <span
              className="text-[10px] text-ak-text-subtle truncate"
              data-testid="discovery-symbol-ref"
            >
              · {discovery.symbolRef}
            </span>
          )}
        </div>
        <span
          className="text-[10px] text-ak-text-subtle tabular-nums shrink-0"
          data-testid="discovery-rank"
          aria-label={`Rank ${rankPct} por cento`}
        >
          {rankPct}%
        </span>
      </header>

      {/* Body — título + excerto */}
      <div className="flex flex-col gap-1">
        <h3
          className="text-sm md:text-base text-ak-text-primary font-medium leading-snug m-0"
          data-testid="discovery-title"
        >
          {discovery.title}
        </h3>
        <p
          className="text-xs text-ak-text-secondary leading-relaxed m-0"
          data-testid="discovery-excerpt"
        >
          {discovery.excerpt}
        </p>
      </div>

      {/* Footer — ações + timestamp */}
      <footer className="flex items-center justify-between gap-2 mt-1">
        <span
          className="text-[10px] text-ak-text-subtle"
          data-testid="discovery-timestamp"
        >
          {formatRelative(discovery.createdAt)}
        </span>

        <div className="flex items-center gap-1">
          {onCite && (
            <button
              type="button"
              onClick={() => onCite(discovery.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-ak-text-secondary hover:text-ak-text-primary hover:bg-white/5 transition-colors"
              aria-label="Citar este insight"
              data-testid="discovery-cite-button"
            >
              <Quote className="w-3.5 h-3.5" aria-hidden />
              <span className="hidden sm:inline">Citar</span>
            </button>
          )}
          {onRate && (
            <>
              <button
                type="button"
                onClick={() => onRate(discovery.id, 'up')}
                className={`p-1.5 rounded-md transition-colors ${
                  currentRating === 'up'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-ak-text-subtle hover:text-emerald-300 hover:bg-emerald-500/10'
                }`}
                aria-label={labels.upvoted}
                data-testid="discovery-upvote"
                data-active={currentRating === 'up'}
              >
                <ThumbsUp className="w-3.5 h-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onRate(discovery.id, 'down')}
                className={`p-1.5 rounded-md transition-colors ${
                  currentRating === 'down'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'text-ak-text-subtle hover:text-rose-300 hover:bg-rose-500/10'
                }`}
                aria-label={labels.downvoted}
                data-testid="discovery-downvote"
                data-active={currentRating === 'down'}
              >
                <ThumbsDown className="w-3.5 h-3.5" aria-hidden />
              </button>
            </>
          )}
        </div>
      </footer>
    </article>
  );
}

export default DiscoveryCard;
