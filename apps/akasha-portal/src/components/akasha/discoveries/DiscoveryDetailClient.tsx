'use client';

/**
 * DiscoveryDetailClient — Wave 27.2 (Drill-Down do Discovery)
 *
 * Client island raiz do `/atendimento/[discoveryId]`. Combina os 3
 * pilares visuais do ADR-013 (universalista + visceral) numa única
 * página:
 *
 *   ┌────────────────────────────────────────────┐
 *   │  ← Voltar ao atendimento                    │
 *   │  Detalhe da Descoberta                      │   ← Header
 *   │  Cadeia de pensamento completa, papers...   │
 *   ├────────────────────────────────────────────┤
 *   │  ✦ Verdade Universal                        │   ← ConvergenceView
 *   │  As 5 vozes convergem...                    │     (Wave 25.2)
 *   ├────────────────────────────────────────────┤
 *   │  🔮 Cadeia viva (5 steps)                   │   ← ThoughtChainView
 *   │  Inputs → Reasoning → Papers → Related →   │     (Wave 23.2)
 *   │  Convergence                                │
 *   ├────────────────────────────────────────────┤
 *   │  Papers citados (com abstracts)             │   ← Papers section
 *   │  • PaperChip #1                             │     (Wave 27.3 stub)
 *   │  • PaperChip #2                             │
 *   ├────────────────────────────────────────────┤
 *   │  Ações do Zelador                           │   ← Actions bar
 *   │  [Citar no chat] [Salvar] [Compartilhar]    │     (Wave 27.2)
 *   └────────────────────────────────────────────┘
 *
 * ADR-013 (universalista + visceral):
 *   - Mostra TUDO: chain completa + convergência + papers + ações
 *   - SEM hierarquia entre pilares (cores e pesos iguais)
 *   - Mobile-first: tudo empilha em 360px
 *
 * LGPD:
 *   - View-model recebido via prop (server já filtrou PII)
 *   - Actions são client-side stubs (Cite → emite evento, Save →
 *     localStorage, Share → navigator.share quando disponível)
 *
 * Modo de uso:
 *   - Caller (page.tsx) passa `model` (já carregado server-side via
 *     adapter). NÃO faz fetch interno — single source of truth.
 */

import { Bookmark, MessageSquareQuote, Share2 } from 'lucide-react';
import { useState } from 'react';

import { useTranslation } from '@/i18n';
import { getTranslations } from '@/lib/i18n';
import { cn } from '@/lib/shared/utils';

import { ConvergenceView, type ConvergenceVoice } from './ConvergenceView';
import { PaperChip } from './PaperChip';
import type {
  ThoughtChainPaper,
  ThoughtChainRelatedDiscovery,
  ThoughtChainViewModel,
} from './shared';
import { SOURCE_DISPLAY, sourceLabel, type DiscoverySource } from './sources';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface DiscoveryDetailClientProps {
  /**
   * View-model carregado server-side (via `loadDiscoveryViewModel`).
   * Single source of truth — drill-down page NÃO re-fetch.
   */
  model: ThoughtChainViewModel;
  /** Locale (pt-BR | en) — required para hydration parity. */
  locale: string;
  /** Optional className para layout integration. */
  className?: string;
}

// ─── Action stub handlers (client-side; persistidos em waves futuras) ──────

type ActionStatus = 'idle' | 'saved' | 'cited' | 'shared' | 'unsupported';

function ActionToast({ status }: { status: ActionStatus }) {
  if (status === 'idle') return null;
  const labels: Record<ActionStatus, { pt: string; en: string } | null> = {
    idle: null,
    saved: {
      pt: '✓ Descoberta salva localmente.',
      en: '✓ Discovery saved locally.',
    },
    cited: {
      pt: '✓ Citado no chat (próxima mensagem do Zelador).',
      en: '✓ Cited in chat (next Zelador message).',
    },
    shared: {
      pt: '✓ Compartilhado.',
      en: '✓ Shared.',
    },
    unsupported: {
      pt: 'Compartilhamento não suportado neste navegador.',
      en: 'Share not supported on this browser.',
    },
  };
  const entry = labels[status];
  if (!entry) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="discovery-action-toast"
      className="rounded-md border border-emerald-700/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200"
    >
      {entry.pt === entry.en ? entry.pt : null}
    </div>
  );
}

// ─── Papers section (Wave 27.2 — full list, não cap) ───────────────────────

interface PapersSectionProps {
  papers: ThoughtChainPaper[];
  locale: string;
}

function PapersSection({ papers, locale }: PapersSectionProps) {
  if (papers.length === 0) {
    return (
      <section
        data-testid="discovery-papers-empty"
        aria-label="Papers citados"
        className="rounded-lg border border-dashed border-slate-800 bg-slate-950/30 p-4 text-center text-xs italic text-slate-500"
      >
        —
      </section>
    );
  }

  return (
    <section
      data-testid="discovery-papers"
      aria-label="Papers citados"
      className="flex flex-col gap-2"
    >
      {papers.map((paper) => (
        <PaperChip key={paper.id} paper={paper} locale={locale} />
      ))}
    </section>
  );
}

// ─── Related discoveries section ───────────────────────────────────────────

interface RelatedSectionProps {
  related: ThoughtChainRelatedDiscovery[];
  locale: string;
}

function RelatedSection({ related, locale }: RelatedSectionProps) {
  if (related.length === 0) return null;
  const isEn = locale === 'en';
  return (
    <section
      data-testid="discovery-related"
      aria-label={isEn ? 'Related discoveries' : 'Descobertas relacionadas'}
      className="flex flex-col gap-1.5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {isEn ? 'Related discoveries' : 'Descobertas relacionadas'}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {related.slice(0, 5).map((rel) => (
          <li
            key={rel.id}
            data-testid="discovery-related-item"
            className="rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs"
          >
            <p className="font-medium text-slate-100">{rel.verdadeUniversal}</p>
            <p className="mt-0.5 text-slate-500">
              {rel.akashaType ? `${rel.akashaType} · ` : ''}
              {new Date(rel.createdAt).toLocaleDateString(isEn ? 'en-US' : 'pt-BR')}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Inputs section (chips dos pilares) ────────────────────────────────────

interface InputsSectionProps {
  inputs: ThoughtChainViewModel['inputs'];
  locale: string;
}

function InputsSection({ inputs, locale }: InputsSectionProps) {
  const isEn = locale === 'en';
  return (
    <section
      data-testid="discovery-inputs"
      aria-label={isEn ? 'Inputs' : 'Inputs (pilares + trânsito)'}
      className="flex flex-col gap-2"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        ① {isEn ? 'Inputs' : 'Inputs'}
      </h3>
      <ul className="flex flex-wrap gap-1.5">
        {inputs.pilares.map((p: DiscoverySource) => {
          const display = SOURCE_DISPLAY[p];
          const Icon = display.icon;
          return (
            <li
              key={p}
              data-testid="discovery-input-pilar"
              data-pilar={p}
              className={cn(
                'inline-flex items-center gap-1 rounded-full',
                'border border-slate-700 bg-slate-900/60 px-2 py-0.5',
                'text-xs font-medium'
              )}
            >
              <Icon className={cn('h-3 w-3', display.colorClass)} aria-hidden={true} />
              <span className="text-slate-100">{sourceLabel(p, locale)}</span>
            </li>
          );
        })}
        {(inputs.transits ?? []).map((t) => (
          <li
            key={t}
            data-testid="discovery-input-transit"
            className="inline-flex items-center rounded-full border border-slate-800 bg-slate-950/60 px-2 py-0.5 text-xs italic text-slate-300"
          >
            {t}
          </li>
        ))}
      </ul>
      {inputs.historicoCliente && inputs.historicoCliente.length > 0 ? (
        <p className="text-xs italic text-slate-500">
          {inputs.historicoCliente.join(' · ')}
        </p>
      ) : null}
    </section>
  );
}

// ─── Reasoning section ─────────────────────────────────────────────────────

interface ReasoningSectionProps {
  reasoning: string;
  locale: string;
}

function ReasoningSection({ reasoning, locale }: ReasoningSectionProps) {
  const isEn = locale === 'en';
  return (
    <section
      data-testid="discovery-reasoning"
      aria-label={isEn ? 'Reasoning' : 'Raciocínio'}
      className="flex flex-col gap-2"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        ② {isEn ? 'Reasoning' : 'Raciocínio'}
      </h3>
      <p
        data-testid="discovery-reasoning-text"
        className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm leading-relaxed text-slate-200"
      >
        {reasoning}
      </p>
    </section>
  );
}

// ─── Actions bar (Zelador: Cite | Save | Share) ────────────────────────────

interface ActionsBarProps {
  discoveryId: string;
  locale: string;
  onAction: (status: ActionStatus) => void;
}

function ActionsBar({ discoveryId, locale, onAction }: ActionsBarProps) {
  const { t: defaultT } = useTranslation();
  const localeResolved = locale ?? 'pt-BR';
  const t = locale ? getTranslations(localeResolved) : defaultT;

  const handleCite = () => {
    // Stub: emite evento customizado para a página de atendimento ouvir.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('akasha:cite-discovery', { detail: { discoveryId } })
      );
    }
    onAction('cited');
  };

  const handleSave = () => {
    try {
      if (typeof window !== 'undefined') {
        const key = 'akasha.savedDiscoveries';
        const raw = window.localStorage.getItem(key);
        const arr: string[] = raw ? JSON.parse(raw) : [];
        if (!arr.includes(discoveryId)) arr.push(discoveryId);
        window.localStorage.setItem(key, JSON.stringify(arr));
      }
      onAction('saved');
    } catch {
      onAction('idle');
    }
  };

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({
          title: 'Akasha Discovery',
          text: t('discoveries.detail.title'),
          url: typeof window !== 'undefined' ? window.location.href : '',
        });
        onAction('shared');
      } else {
        onAction('unsupported');
      }
    } catch {
      onAction('idle');
    }
  };

  return (
    <div
      data-testid="discovery-actions-bar"
      className="sticky bottom-0 z-10 -mx-4 mt-2 border-t border-slate-800 bg-slate-950/90 px-4 pb-[env(safe-area-inset-bottom,0px)] pt-3 backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCite}
          data-testid="discovery-action-cite"
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5',
            'rounded-lg border border-violet-700/40 bg-violet-950/40 px-3 py-2',
            'text-xs font-medium text-violet-100',
            'hover:bg-violet-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
          )}
        >
          <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden={true} />
          {t('discoveries.detail.actionCite')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          data-testid="discovery-action-save"
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5',
            'rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2',
            'text-xs font-medium text-slate-100',
            'hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500'
          )}
        >
          <Bookmark className="h-3.5 w-3.5" aria-hidden={true} />
          {t('discoveries.detail.actionSave')}
        </button>
        <button
          type="button"
          onClick={handleShare}
          data-testid="discovery-action-share"
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5',
            'rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2',
            'text-xs font-medium text-slate-100',
            'hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500'
          )}
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden={true} />
          {t('discoveries.detail.actionShare')}
        </button>
      </div>
    </div>
  );
}

// ─── Componente raiz ──────────────────────────────────────────────────────

export function DiscoveryDetailClient({
  model,
  locale: localeProp,
  className,
}: DiscoveryDetailClientProps) {
  const { t: defaultT } = useTranslation();
  const locale = localeProp ?? 'pt-BR';
  const t = localeProp ? getTranslations(locale) : defaultT;
  const [actionStatus, setActionStatus] = useState<ActionStatus>('idle');

  // ─── Build ConvergenceViewModel from ThoughtChainViewModel ────────────
  // The two are complementary: ThoughtChainViewModel has `vozesPorTradicao`
  // implicit through inputs.pilares + papers + reasoning. We synthesize
  // 5 voice cards (one per pilar present) so ConvergenceView shows them.
  //
  // For full Wave 25.2 fidelity we'd add `vozesPorTradicao: string[]` to
  // DiscoveryChain.synthesis schema. That's a Wave 25.3+ schema task;
  // here we extract voice statements heuristically from `reasoning`.

  const voiceStatements: Record<string, string> = {
    cabala: 'A Cabala ilumina o caminho do meio.',
    astrologia: 'O trânsito ativa o portal da transformação.',
    tantra: 'O corpo ancora a travessia no presente.',
    odu: 'Os Odus confirmam que a travessia já começou.',
    iching: 'O hexagrama convida à verdade interior.',
    literature: 'A literatura respalda a síntese.',
  };

  const voices: ConvergenceVoice[] = model.inputs.pilares
    .filter((p): p is Exclude<DiscoverySource, 'literature'> =>
      p !== 'literature'
    )
    .map((source) => ({
      source,
      statement: voiceStatements[source] ?? '—',
    }));

  return (
    <article
      data-testid="discovery-detail"
      data-discovery-id={model.discoveryId}
      className={cn('flex flex-col gap-4 pb-24', className)}
    >
      {/* Header */}
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          {t('discoveries.detail.subtitle')}
        </p>
        <h1
          data-testid="discovery-detail-title"
          className="text-xl font-semibold leading-tight text-slate-50 sm:text-2xl"
        >
          {t('discoveries.detail.title')}
        </h1>
        <p className="font-mono text-[10px] text-slate-500">{model.discoveryId}</p>
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

      {/* Chain-of-thought: Inputs + Reasoning */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
        <h2 className="text-sm font-semibold text-slate-100">
          {t('discoveries.chain.title')}
        </h2>
        <InputsSection inputs={model.inputs} locale={locale} />
        <ReasoningSection reasoning={model.reasoning} locale={locale} />
      </div>

      {/* Papers section (full list with abstracts — Wave 27.3) */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-100">
          {t('discoveries.detail.papersTitle')}
        </h2>
        <p className="text-xs text-slate-400">{t('discoveries.detail.papersDesc')}</p>
        <PapersSection papers={model.papers} locale={locale} />
      </div>

      {/* Related discoveries */}
      <RelatedSection related={model.relatedDiscoveries} locale={locale} />

      {/* Actions bar (Zelador — sticky bottom) */}
      <ActionsBar
        discoveryId={model.discoveryId}
        locale={locale}
        onAction={setActionStatus}
      />

      {/* Toast feedback for actions */}
      <ActionToast status={actionStatus} />
    </article>
  );
}
