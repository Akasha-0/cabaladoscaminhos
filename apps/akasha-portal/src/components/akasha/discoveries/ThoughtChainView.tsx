'use client';

/**
 * ThoughtChainView — Wave 23.2 (UI Cadeia Viva).
 *
 * Timeline visual de 5 steps que mostra como a IA chegou num Discovery.
 * É o "ver a consciência pensando" — Zelador precisa ENXERGAR o raciocínio
 * (não só o resultado final).
 *
 * Steps (mobile-first stack vertical, 360px):
 *   ① Inputs              — chips dos pilares + trânsito + chain IDs
 *   ② Reasoning           — 2-3 frases (chain-of-thought)
 *   ③ Papers cited        — PaperChip por LiteraturePaper (Wave 21.1)
 *   ④ Related discoveries — chips com link pra cada chain retrieval
 *   ⑤ Convergence         — verdade universal (ConvergenceBadge)
 *
 * Integração (Wave 23.2):
 *   - /atendimento/[sessionId] (Wave 22.2) — abre o chain do discovery ativo.
 *   - /admin/discoveries  (Wave 21.2)      — auditoria de cadeias.
 *   - MandalaAuthorityBlock                 — complemento ao authority prompt.
 *
 * ADR-013 (Wave 23): universalista + visceral. Mostramos TODOS os pilares
 * que contribuíram (5 Pilares + literature) sem favoritismo.
 *
 * Mode de uso:
 *   - Modo "fetch" (default): client island faz GET /api/discoveries/[id]
 *     e renderiza o view-model. Loading/error states internos.
 *   - Modo "view-model": caller passa `model` direto (testes, ou SSR).
 *
 * Performance: render < 200ms (paper preview ≤ 200 chars, sem fetch
 * bloqueante). Lista de related cap em 5 (Wave 20.2 limit).
 */
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Lightbulb,
  Loader2,
  Network,
  Sparkles,
} from 'lucide-react';

import { useTranslation } from '@/i18n';
import { cn } from '@/lib/shared/utils';

import { ConvergenceBadge } from './ConvergenceBadge';
import { PaperChip } from './PaperChip';
import type { ThoughtChainViewModel } from './shared';
import {
  SOURCE_DISPLAY,
  sourceLabel,
  type DiscoverySource,
} from './sources';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface ThoughtChainViewProps {
  /** Discovery ID — quando `model` não é passado, faz fetch. */
  discoveryId: string;
  /**
   * View-model opcional. Se fornecido, skip fetch e renderiza direto
   * (usado por testes e por SSR que já carregou o model).
   */
  model?: ThoughtChainViewModel;
  /**
   * Locale para labels i18n (default = 'pt-BR').
   * Override é necessário em SSR pra evitar mismatch com hydration.
   */
  locale?: string;
  /** Optional className for layout integration. */
  className?: string;
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: ThoughtChainViewModel };

// ─── Helper components (steps internos) ─────────────────────────────────────

interface StepHeaderProps {
  /** Step number 1..5. */
  index: 1 | 2 | 3 | 4 | 5;
  /** Step title key (e.g. 'discoveries.chain.inputs'). */
  titleKey: string;
  /** Step description key (opcional). */
  descriptionKey?: string;
  /** Step icon. */
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  /** Translation function. */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Optional suffix (e.g. "(3)" — paper count). */
  suffix?: string;
}

function StepHeader({
  index,
  titleKey,
  descriptionKey,
  icon: Icon,
  t,
  suffix,
}: StepHeaderProps) {
  return (
    <header className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300 ring-1 ring-slate-700"
      >
        {index}
      </span>
      <Icon className="h-4 w-4 text-slate-400" aria-hidden={true} />
      <h3 className="text-sm font-semibold text-slate-200">
        {t(titleKey)}
        {suffix ? (
          <span className="ml-1 text-slate-400">({suffix})</span>
        ) : null}
      </h3>
      {descriptionKey ? (
        <span className="sr-only">{t(descriptionKey)}</span>
      ) : null}
    </header>
  );
}

interface ConnectorProps {
  /** Whether this connector should render. */
  visible: boolean;
}

function Connector({ visible }: ConnectorProps) {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      data-testid="step-connector"
      className="ml-3.5 h-4 w-px bg-gradient-to-b from-slate-700 to-slate-800"
    />
  );
}

// ─── Step 1: Inputs ─────────────────────────────────────────────────────────

interface StepInputsProps {
  inputs: ThoughtChainViewModel['inputs'];
  locale: string;
  t: StepHeaderProps['t'];
}

function StepInputs({ inputs, locale, t }: StepInputsProps) {
  const pillars = inputs.pilares ?? [];
  const transits = inputs.transits ?? [];
  const relatedIds = inputs.relatedChainIds ?? [];
  const hasAny =
    pillars.length > 0 || transits.length > 0 || relatedIds.length > 0;

  return (
    <section
      data-testid="chain-step-inputs"
      aria-labelledby="chain-step-inputs-title"
      className="rounded-lg border border-slate-800 bg-slate-900/40 p-3"
    >
      <StepHeader
        index={1}
        titleKey="discoveries.chain.inputs"
        descriptionKey="discoveries.chain.inputsDesc"
        icon={Network}
        t={t}
      />
      {!hasAny ? (
        <p className="mt-2 text-xs italic text-slate-500">
          {t('discoveries.chain.emptyInputs')}
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pillars.map((source: DiscoverySource) => {
            const display = SOURCE_DISPLAY[source];
            const Icon = display.icon;
            return (
              <span
                key={`pillar-${source}`}
                data-testid={`pillar-chip-${source}`}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-1',
                  'bg-slate-800 text-xs font-medium ring-1 ring-slate-700'
                )}
              >
                <Icon
                  className={cn('h-3 w-3', display.colorClass)}
                  aria-hidden={true}
                />
                <span className="text-slate-100">{sourceLabel(source, locale)}</span>
              </span>
            );
          })}
          {transits.map((transit) => (
            <span
              key={`transit-${transit}`}
              data-testid="transit-chip"
              className="rounded-full bg-amber-950/40 px-2 py-1 text-xs font-medium text-amber-200 ring-1 ring-amber-800/40"
            >
              ↻ {transit}
            </span>
          ))}
          {relatedIds.map((id) => (
            <span
              key={`related-${id}`}
              data-testid="related-chain-id"
              className="rounded-full bg-slate-800 px-2 py-1 text-xs font-mono text-slate-300 ring-1 ring-slate-700"
            >
              ⇠ {id}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Step 2: Reasoning ──────────────────────────────────────────────────────

interface StepReasoningProps {
  reasoning: string;
  t: StepHeaderProps['t'];
}

function StepReasoning({ reasoning, t }: StepReasoningProps) {
  return (
    <section
      data-testid="chain-step-reasoning"
      aria-labelledby="chain-step-reasoning-title"
      className="rounded-lg border border-slate-800 bg-slate-900/40 p-3"
    >
      <StepHeader
        index={2}
        titleKey="discoveries.chain.reasoning"
        descriptionKey="discoveries.chain.reasoningDesc"
        icon={Brain}
        t={t}
      />
      <blockquote className="mt-2 border-l-2 border-slate-700 pl-3 text-sm italic leading-relaxed text-slate-300">
        “{reasoning}”
      </blockquote>
    </section>
  );
}

// ─── Step 3: Papers ─────────────────────────────────────────────────────────

interface StepPapersProps {
  papers: ThoughtChainViewModel['papers'];
  locale: string;
  t: StepHeaderProps['t'];
}

function StepPapers({ papers, locale, t }: StepPapersProps) {
  const count = papers.length;
  return (
    <section
      data-testid="chain-step-papers"
      aria-labelledby="chain-step-papers-title"
      className="rounded-lg border border-slate-800 bg-slate-900/40 p-3"
    >
      <StepHeader
        index={3}
        titleKey="discoveries.chain.papers"
        descriptionKey="discoveries.chain.papersDesc"
        icon={BookOpen}
        t={t}
        suffix={count > 0 ? String(count) : undefined}
      />
      {count === 0 ? (
        <p className="mt-2 text-xs italic text-slate-500">
          {t('discoveries.chain.emptyPapers')}
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {papers.map((paper) => (
            <PaperChip
              key={paper.id}
              paper={paper}
              locale={locale}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Step 4: Related discoveries ───────────────────────────────────────────

interface StepRelatedProps {
  related: ThoughtChainViewModel['relatedDiscoveries'];
  locale: string;
  t: StepHeaderProps['t'];
}

function StepRelated({ related, locale, t }: StepRelatedProps) {
  const count = related.length;
  return (
    <section
      data-testid="chain-step-related"
      aria-labelledby="chain-step-related-title"
      className="rounded-lg border border-slate-800 bg-slate-900/40 p-3"
    >
      <StepHeader
        index={4}
        titleKey="discoveries.chain.related"
        descriptionKey="discoveries.chain.relatedDesc"
        icon={ArrowRight}
        t={t}
        suffix={count > 0 ? String(count) : undefined}
      />
      {count === 0 ? (
        <p className="mt-2 text-xs italic text-slate-500">
          {t('discoveries.chain.emptyRelated')}
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {related.map((r) => (
            <li key={r.id} data-testid="related-discovery-row">
              <a
                href={`/${locale}/admin/discoveries?focus=${encodeURIComponent(r.id)}`}
                className={cn(
                  'flex items-start gap-2 rounded-md px-2 py-1.5',
                  'hover:bg-slate-800/60 focus:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-slate-500'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full',
                    r.feedback === 'up' && 'bg-emerald-400',
                    r.feedback === 'down' && 'bg-rose-400',
                    r.feedback === 'neutral' && 'bg-slate-500'
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-200">
                    {r.verdadeUniversal}
                  </p>
                  {r.akashaType ? (
                    <p className="text-xs text-slate-500">
                      {r.akashaType}
                    </p>
                  ) : null}
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {r.id.slice(0, 8)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Step 5: Convergence ────────────────────────────────────────────────────

interface StepConvergenceProps {
  verdadeUniversal: string;
  confidence: number;
  locale: string;
}

function StepConvergence({
  verdadeUniversal,
  confidence,
  locale,
}: StepConvergenceProps) {
  return (
    <section
      data-testid="chain-step-convergence"
      aria-labelledby="chain-step-convergence-title"
    >
      <header className="mb-2 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-900/40 text-xs font-bold text-violet-200 ring-1 ring-violet-700/40"
        >
          5
        </span>
        <Lightbulb
          className="h-4 w-4 text-violet-300"
          aria-hidden={true}
        />
        <h3 className="text-sm font-semibold text-slate-200">
          {locale === 'en' ? 'Convergence' : 'Convergência'}
        </h3>
      </header>
      <ConvergenceBadge
        verdadeUniversal={verdadeUniversal}
        confidence={confidence}
        locale={locale}
      />
    </section>
  );
}

// ─── Componente raiz ────────────────────────────────────────────────────────

const RELATED_VISIBLE_LIMIT = 5;

function clampRelated(
  related: ThoughtChainViewModel['relatedDiscoveries']
): ThoughtChainViewModel['relatedDiscoveries'] {
  return related.slice(0, RELATED_VISIBLE_LIMIT);
}

export function ThoughtChainView({
  discoveryId,
  model,
  locale: localeProp,
  className,
}: ThoughtChainViewProps) {
  const { t } = useTranslation();
  const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });

  // Fetch quando nem `model` é passado.
  useEffect(() => {
    if (model) {
      setFetchState({ status: 'ready', data: model });
      return;
    }
    if (fetchState.status === 'loading' || fetchState.status === 'ready') {
      return;
    }
    let cancelled = false;
    setFetchState({ status: 'loading' });
    fetch(`/api/discoveries/${encodeURIComponent(discoveryId)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json: ThoughtChainViewModel) => {
        if (cancelled) return;
        setFetchState({ status: 'ready', data: json });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchState({
          status: 'error',
          error: err instanceof Error ? err.message : 'unknown',
        });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoveryId, model]);

  const data = useMemo<ThoughtChainViewModel | null>(() => {
    if (fetchState.status === 'ready') return fetchState.data;
    return null;
  }, [fetchState]);

  const locale = localeProp ?? data?.locale ?? 'pt-BR';

  // ── Render: loading
  if (fetchState.status === 'loading' || fetchState.status === 'idle') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex items-center justify-center gap-2 rounded-lg',
          'border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400',
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span>{t('discoveries.chain.loading')}</span>
      </div>
    );
  }

  // ── Render: error
  if (fetchState.status === 'error') {
    return (
      <div
        role="alert"
        data-testid="chain-error"
        className={cn(
          'rounded-lg border border-rose-800/40 bg-rose-950/30 p-3',
          'text-sm text-rose-200',
          className
        )}
      >
        {t('discoveries.chain.error', { message: fetchState.error })}
      </div>
    );
  }

  if (!data) return null;

  const related = clampRelated(data.relatedDiscoveries);

  return (
    <article
      data-testid="thought-chain-view"
      data-discovery-id={data.discoveryId}
      aria-labelledby="thought-chain-view-title"
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-slate-800',
        'bg-slate-950/60 p-3 sm:p-4',
        className
      )}
    >
      <header className="mb-1 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-900/40 ring-1 ring-violet-700/40"
        >
          <Sparkles className="h-4 w-4 text-violet-300" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="thought-chain-view-title"
            className="text-base font-semibold leading-tight text-slate-50"
          >
            {t('discoveries.chain.title')}
          </h2>
          <p className="text-xs text-slate-400">{data.headline}</p>
        </div>
      </header>

      <div className="flex flex-col">
        <StepInputs
          inputs={data.inputs}
          locale={locale}
          t={t}
        />
        <Connector visible />
        <StepReasoning reasoning={data.reasoning} t={t} />
        <Connector visible />
        <StepPapers papers={data.papers} locale={locale} t={t} />
        <Connector visible />
        <StepRelated related={related} locale={locale} t={t} />
        <Connector visible />
        <StepConvergence
          verdadeUniversal={data.verdadeUniversal}
          confidence={data.confidence}
          locale={locale}
        />
      </div>
    </article>
  );
}