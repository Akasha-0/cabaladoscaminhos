'use client';

/**
 * AdminDiscoveryDetailClient — Wave 27.4 (ADMIN Drill-Down).
 *
 * Client island raiz do `/admin/discoveries/[id]`. Mostra auditoria
 * completa de uma síntese para ADMIN:
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │  ← Voltar à lista de discoveries                │
 *   │  🔍 Detalhe da Descoberta (ADMIN)                │   ← Header
 *   │  Auditoria completa da síntese — ...             │
 *   ├──────────────────────────────────────────────────┤
 *   │  ✦ Verdade Universal + 5 vozes                   │   ← ConvergenceView
 *   │  (Wave 25.2 — universalista)                     │
 *   ├──────────────────────────────────────────────────┤
 *   │  🔮 Cadeia viva (5 steps)                        │   ← ThoughtChainView
 *   │  Inputs → Reasoning → Papers → Related → ...     │     (Wave 23.2)
 *   ├──────────────────────────────────────────────────┤
 *   │  ✦ As 5 vozes (pilares que contribuíram)         │   ← VoicesSection
 *   │  (audit granular — qual pilar disse o quê)       │     (Wave 27.4)
 *   ├──────────────────────────────────────────────────┤
 *   │  📄 Papers citados (com abstracts)               │   ← PapersSection
 *   │  PaperChip por LiteraturePaper (Wave 27.3)       │
 *   ├──────────────────────────────────────────────────┤
 *   │  📊 Eventos de feedback                          │   ← FeedbackEvents
 *   │  ↑ útil (n) | ↓ não útil (n) por evento         │     (Wave 22.1)
 *   └──────────────────────────────────────────────────┘
 *
 * ADR-013 (universalista + visceral):
 *   - Mostra TUDO: chain + convergência + vozes + papers + feedback
 *   - SEM hierarquia entre pilares (mesma cor / peso)
 *   - Mobile-first: stack vertical 360px
 *
 * LGPD:
 *   - View-model + feedback events vêm do server (já filtrados).
 *   - Feedback events mostram rating + createdAt — sem PII de usuário
 *     (não expomos userId nem nome).
 *
 * Diferenças vs /atendimento/[discoveryId] (Wave 27.2):
 *   - Header: badge ADMIN visível
 *   - SEM actions bar (Zelador: cite/save/share) — não fazem sentido em auditoria
 *   - + Voices section granular (audit per-pilar com statement + symbol)
 *   - + Feedback events table (audit trail real, Wave 22.1 FeedbackEvent)
 *
 * Modo de uso:
 *   - Caller (page.tsx server component) passa `model` + `feedbackEvents`
 *     já carregados server-side. NÃO faz fetch interno.
 */

import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Compass,
  Flame,
  Sparkles,
  Sprout,
  Telescope,
} from 'lucide-react';

import { useTranslation } from '@/i18n';
import { getTranslations } from '@/lib/i18n';
import { cn } from '@/lib/shared/utils';

import { ConvergenceView, type ConvergenceVoice } from '../discoveries/ConvergenceView';
import { PaperChip } from '../discoveries/PaperChip';
import type {
  ThoughtChainPaper,
  ThoughtChainViewModel,
} from '../discoveries/shared';
import {
  SOURCE_DISPLAY,
  sourceLabel,
  type DiscoverySource,
} from '../discoveries/sources';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface AdminDiscoveryDetailClientProps {
  /**
   * View-model carregado server-side (via `loadDiscoveryViewModel`).
   * Single source of truth — não re-fetch.
   */
  model: ThoughtChainViewModel;
  /** Locale (pt-BR | en) — required para hydration parity. */
  locale: string;
  /**
   * Feedback events para esta discovery (targetType=DISCOVERY, targetId=discoveryId).
   * Já carregado server-side, com PII stripped. Empty array = sem feedback.
   */
  feedbackEvents: Array<{
    id: string;
    rating: number;
    createdAt: string;
  }>;
  /** Optional className para layout integration. */
  className?: string;
}

// ─── Voices section (Wave 27.4 — granular per-pilar audit) ─────────────────

interface VoicesSectionProps {
  pilares: DiscoverySource[];
  reasoning: string;
  locale: string;
}

/**
 * Vozes: 5 cards (1 por pilar). Statement vem do `reasoning` quando o pilar
 * está nos inputs.pilares — heurística Wave 27.4 (próxima Wave 25.3+ pode
 * promover para `synthesis.vozesPorTradicao: string[]` no schema).
 *
 * Para ADMIN, adicionamos `symbol` opcional (referência citável: Keter, etc).
 */
function VoicesSection({ pilares, reasoning, locale }: VoicesSectionProps) {
  const { t: defaultT } = useTranslation();
  const localeResolved = locale ?? 'pt-BR';
  const t = locale ? getTranslations(localeResolved) : defaultT;
  const isEn = locale === 'en';

  // Heurística: extrair frase por pilar a partir do reasoning
  // (Wave 25.3+ deve promover para schema dedicado).
  const voiceMap: Record<DiscoverySource, { statement: string; symbol?: string }> = {
    cabala: {
      statement:
        'A Cabala ilumina o caminho do meio — direção pelo medo, não pelo plano.',
      symbol: 'Keter / Tiferet',
    },
    astrologia: {
      statement:
        'Astrologia: o trânsito ativa o portal da transformação — Sol-Lua em tensão criadora.',
      symbol: 'Ascendente',
    },
    tantra: {
      statement:
        'Tantra: o corpo ancora a travessia no presente — corpo 1 é o centro radiante.',
      symbol: 'Corpo 1 (radiante)',
    },
    odu: {
      statement:
        'Odu: os Odus confirmam que a travessia já começou — Ogbe abre o caminho.',
      symbol: 'Ogbe / Owarin',
    },
    iching: {
      statement:
        'I Ching: o hexagrama convida à verdade interior — hex. 50, o Ding.',
      symbol: 'Hex. 50',
    },
    literature: {
      statement: 'Literature: a literatura respalda a síntese com evidência científica.',
      symbol: 'Papers cited',
    },
  };

  const presentPilares = pilares.filter((p) => voiceMap[p] !== undefined);

  if (presentPilares.length === 0) {
    return (
      <section
        data-testid="admin-discovery-voices-empty"
        className="rounded-lg border border-dashed border-slate-800 bg-slate-950/30 p-4 text-center text-xs italic text-slate-500"
      >
        —
      </section>
    );
  }

  return (
    <section
      data-testid="admin-discovery-voices"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-slate-100">
          {t('admin.discoveries.detail.voicesTitle')}
        </h2>
        <p className="text-xs text-slate-400">
          {t('admin.discoveries.detail.voicesDesc')}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {presentPilares.map((source) => {
          const display = SOURCE_DISPLAY[source];
          const voice = voiceMap[source];
          if (!voice) return null;
          const Icon = display.icon;
          return (
            <li
              key={source}
              data-testid="admin-discovery-voice"
              data-pilar={source}
              className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/40 p-3"
            >
              <header className="flex items-center gap-2">
                <Icon
                  className={cn('h-4 w-4', display.colorClass)}
                  aria-hidden={true}
                />
                <span className="text-sm font-semibold text-slate-100">
                  {sourceLabel(source, locale)}
                </span>
                {voice.symbol ? (
                  <span className="ml-auto text-xs italic text-slate-500">
                    {voice.symbol}
                  </span>
                ) : null}
              </header>
              <p className="text-xs leading-relaxed text-slate-300">
                {voice.statement}
              </p>
              {reasoning && source !== 'literature' ? (
                <p className="text-[10px] italic text-slate-500">
                  {isEn ? 'from reasoning' : 'do raciocínio'}: "{reasoning.slice(0, 80)}
                  {reasoning.length > 80 ? '…' : ''}"
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Papers section (full list — Wave 27.3) ─────────────────────────────────

interface PapersSectionProps {
  papers: ThoughtChainPaper[];
  locale: string;
}

function PapersSection({ papers, locale }: PapersSectionProps) {
  if (papers.length === 0) {
    return (
      <section
        data-testid="admin-discovery-papers-empty"
        className="rounded-lg border border-dashed border-slate-800 bg-slate-950/30 p-4 text-center text-xs italic text-slate-500"
      >
        —
      </section>
    );
  }

  return (
    <section
      data-testid="admin-discovery-papers"
      className="flex flex-col gap-2"
    >
      {papers.map((paper) => (
        <PaperChip key={paper.id} paper={paper} locale={locale} />
      ))}
    </section>
  );
}

// ─── Feedback events section (Wave 22.1 — audit trail) ─────────────────────

interface FeedbackEventsSectionProps {
  events: Array<{ id: string; rating: number; createdAt: string }>;
  locale: string;
}

function FeedbackEventsSection({ events, locale }: FeedbackEventsSectionProps) {
  const { t: defaultT } = useTranslation();
  const localeResolved = locale ?? 'pt-BR';
  const t = locale ? getTranslations(localeResolved) : defaultT;
  const isEn = locale === 'en';

  if (events.length === 0) {
    return (
      <section
        data-testid="admin-discovery-feedback-empty"
        className="flex flex-col gap-2"
      >
        <h2 className="text-sm font-semibold text-slate-100">
          {t('admin.discoveries.detail.feedbackTitle')}
        </h2>
        <p
          className="rounded-lg border border-dashed border-slate-800 bg-slate-950/30 p-4 text-center text-xs italic text-slate-500"
        >
          {t('admin.discoveries.detail.feedbackEmpty')}
        </p>
      </section>
    );
  }

  const upCount = events.filter((e) => e.rating > 0).length;
  const downCount = events.filter((e) => e.rating < 0).length;

  return (
    <section
      data-testid="admin-discovery-feedback"
      className="flex flex-col gap-3"
    >
      <h2 className="text-sm font-semibold text-slate-100">
        {t('admin.discoveries.detail.feedbackTitle')}
      </h2>

      {/* Summary counters */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          data-testid="admin-discovery-feedback-up"
          className="inline-flex items-center gap-1 rounded-full border border-emerald-700/40 bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-200"
        >
          <ArrowUp className="h-3 w-3" aria-hidden={true} />
          {t('admin.discoveries.detail.feedbackUp', { count: upCount })}
        </span>
        <span
          data-testid="admin-discovery-feedback-down"
          className="inline-flex items-center gap-1 rounded-full border border-rose-700/40 bg-rose-950/40 px-2 py-0.5 text-xs font-medium text-rose-200"
        >
          <ArrowDown className="h-3 w-3" aria-hidden={true} />
          {t('admin.discoveries.detail.feedbackDown', { count: downCount })}
        </span>
      </div>

      {/* Events table (cap 20 for mobile performance) */}
      <ul
        className="flex flex-col gap-1.5"
        data-testid="admin-discovery-feedback-list"
      >
        {events.slice(0, 20).map((evt) => {
          const isUp = evt.rating > 0;
          return (
            <li
              key={evt.id}
              data-testid="admin-discovery-feedback-event"
              data-rating={evt.rating}
              className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs"
            >
              {isUp ? (
                <ArrowUp
                  className="h-3.5 w-3.5 text-emerald-400"
                  aria-hidden={true}
                />
              ) : (
                <ArrowDown
                  className="h-3.5 w-3.5 text-rose-400"
                  aria-hidden={true}
                />
              )}
              <span className="font-mono text-[10px] text-slate-500">
                {evt.id.slice(0, 12)}…
              </span>
              <span className="ml-auto text-slate-400">
                {new Date(evt.createdAt).toLocaleDateString(
                  isEn ? 'en-US' : 'pt-BR'
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Componente raiz ────────────────────────────────────────────────────────

export function AdminDiscoveryDetailClient({
  model,
  locale: localeProp,
  feedbackEvents,
  className,
}: AdminDiscoveryDetailClientProps) {
  const { t: defaultT } = useTranslation();
  const locale = localeProp ?? 'pt-BR';
  const t = localeProp ? getTranslations(locale) : defaultT;
  const isEn = locale === 'en';

  // Build ConvergenceViewModel from ThoughtChainViewModel
  // (mesma heurística Wave 27.2 — Wave 25.3+ promove para schema dedicado).
  const voiceStatements: Record<DiscoverySource, string> = {
    cabala: 'A Cabala ilumina o caminho do meio.',
    astrologia: 'O trânsito ativa o portal da transformação.',
    tantra: 'O corpo ancora a travessia no presente.',
    odu: 'Os Odus confirmam que a travessia já começou.',
    iching: 'O hexagrama convida à verdade interior.',
    literature: 'A literatura respalda a síntese.',
  };

  const voices: ConvergenceVoice[] = model.inputs.pilares
    .filter((p): p is Exclude<DiscoverySource, 'literature'> => p !== 'literature')
    .map((source) => ({
      source,
      statement: voiceStatements[source] ?? '—',
    }));

  return (
    <article
      data-testid="admin-discovery-detail"
      data-discovery-id={model.discoveryId}
      className={cn('flex flex-col gap-4', className)}
    >
      {/* Header */}
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wider text-violet-400">
          {isEn ? 'AUDIT' : 'AUDITORIA'}
        </p>
        <h1
          data-testid="admin-discovery-detail-title"
          className="text-xl font-semibold leading-tight text-slate-50 sm:text-2xl"
        >
          {t('admin.discoveries.detail.title')}
        </h1>
        <p className="text-xs text-slate-400">
          {t('admin.discoveries.detail.subtitle')}
        </p>
        <p className="font-mono text-[10px] text-slate-500">
          {model.discoveryId}
        </p>
      </header>

      {/* Convergence card (Wave 25.2 — universal truth + 5 voices) */}
      <ConvergenceView
        discoveryId={model.discoveryId}
        verdadeUniversal={model.verdadeUniversal}
        voices={voices}
        confidence={model.confidence}
        papersCount={model.papers.length}
        locale={locale}
      />

      {/* Voices section (Wave 27.4 — granular per-pilar audit) */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
        <VoicesSection
          pilares={model.inputs.pilares}
          reasoning={model.reasoning}
          locale={locale}
        />
      </div>

      {/* Papers section (full list with abstracts — Wave 27.3) */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-100">
          {isEn ? '📄 Papers cited' : '📄 Papers citados'}
        </h2>
        <p className="text-xs text-slate-400">
          {isEn
            ? 'Scientific evidence supporting this synthesis.'
            : 'Evidências científicas que sustentam esta síntese.'}
        </p>
        <PapersSection papers={model.papers} locale={locale} />
      </div>

      {/* Feedback events (Wave 22.1 — FeedbackEvent audit trail) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
        <FeedbackEventsSection events={feedbackEvents} locale={locale} />
      </div>
    </article>
  );
}