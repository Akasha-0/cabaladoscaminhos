'use client';

/**
 * KnowledgeBrowserClient — Wave 28.6
 *
 * Client island raiz do /literature Knowledge Browser. Responsabilidades:
 *
 *   ① Filters bar — 4 filtros (year, pilar, journal, hasPractice) +
 *      "limpar filtros". Cada mudança → router.push com novos
 *      searchParams (URL = source-of-truth, deep-linkable).
 *   ② Results list — papers filtrados, mobile-first stack vertical
 *      (cards), grid ≥ 640px. Citation count + practice badge visíveis.
 *   ③ Drill-down — click em paper → expande card com:
 *      - Abstract completo
 *      - Related discoveries (fetch GET /api/literature/[id]/discoveries)
 *      - Related sessions (fetch GET /api/literature/[id]/sessions)
 *      - View-source link (DOI/fullTextUrl)
 *
 * Universalista+visceral (ADR-013): papers como diálogo das 5 vozes da
 * sabedoria, com badge de prática Akasha. Visceral, não acadêmico.
 *
 * LGPD: 0 PII no DOM. fetch é só a /api/literature/* (auth-gated,
 * cookies forwarded via credentials: 'include'). Sem email/nome/CPF.
 *
 * i18n: `literature.*` namespace (28 chaves — Wave 28.6).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  Filter,
  Sparkles,
  X,
} from 'lucide-react';

import { getTranslations } from '@/lib/i18n';
import type { Pilar } from '@/lib/grimoire/significados-curados';

import type {
  LiteratureFacets,
  LiteratureFilters,
  LiteraturePaperDTO,
} from './LiteraturePapersAdapter';
import { PILLAR_COLORS, PILLAR_ORDER } from '../diario/types';

// ─── Tipos do drill-down (server-shape via /api/literature/*) ───────────────

/** Discovery que citou o paper (Wave 27.5 shape). */
interface PaperDiscoveryRef {
  id: string;
  verdadeUniversal: string;
  akashaType: string | null;
  feedback: 'up' | 'down' | 'neutral';
  citedAt: string;
  citationContext: string;
}

/** Sessão em que o paper apareceu (Wave 27.5 shape). */
interface PaperSessionRef {
  id: string;
  caminhanteLabel: string;
  tipo: 'Apresentacao' | 'Leitura' | 'Ritual' | 'Aconselhamento' | 'Integracao';
  status: 'aberta' | 'fechada';
  abertoEm: string;
  fechadoEm: string | null;
  excerpt: string;
}

type DrillState =
  | { kind: 'idle' }
  | { kind: 'loading'; paperId: string }
  | {
      kind: 'ready';
      paperId: string;
      discoveries: PaperDiscoveryRef[];
      sessions: PaperSessionRef[];
    }
  | { kind: 'error'; paperId: string; message: string };

// ─── Constantes de UI ───────────────────────────────────────────────────────

const ABSTRACT_TRUNCATE = 200;
const FILTER_FORM_ID = 'literature-filter-form';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface KnowledgeBrowserClientProps {
  locale: string;
  papers: LiteraturePaperDTO[];
  facets: LiteratureFacets;
  activeFilters: LiteratureFilters;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max).trimEnd()}…`;
}

function buildHref(paper: LiteraturePaperDTO): string {
  if (paper.fullTextUrl) return paper.fullTextUrl;
  if (paper.doi) return `https://doi.org/${paper.doi}`;
  return '#';
}

function formatYear(year: number): string {
  return String(year);
}

/**
 * Serializa filtros em URLSearchParams para deep-linking via router.push.
 * Omite valores default ('all' / undefined) para manter a URL limpa.
 */
export function filtersToQuery(filters: LiteratureFilters): string {
  const params = new URLSearchParams();
  if (filters.year !== undefined) params.set('year', String(filters.year));
  if (filters.pilar && filters.pilar !== 'all') params.set('pilar', filters.pilar);
  if (filters.journal && filters.journal !== 'all') params.set('journal', filters.journal);
  if (filters.hasPractice !== undefined) params.set('hasPractice', String(filters.hasPractice));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ─── Sub-componentes internos (módulos) ─────────────────────────────────────

interface PaperCardProps {
  paper: LiteraturePaperDTO;
  locale: string;
  isOpen: boolean;
  drillState: DrillState;
  onToggle: () => void;
}

function PaperCard({ paper, locale, isOpen, drillState, onToggle }: PaperCardProps) {
  const t = getTranslations(locale);
  const href = buildHref(paper);
  const isExternal = href !== '#';
  const color = PILLAR_COLORS[paper.pilar];
  const hasPractice = paper.practiceField != null;

  const isLoadingThis = drillState.kind === 'loading' && drillState.paperId === paper.paperId;
  const isErrorThis = drillState.kind === 'error' && drillState.paperId === paper.paperId;
  const isReadyThis = drillState.kind === 'ready' && drillState.paperId === paper.paperId;

  return (
    <article
      data-testid={`literature-paper-${paper.paperId}`}
      data-paper-id={paper.paperId}
      data-pilar={paper.pilar}
      data-has-practice={hasPractice ? 'true' : 'false'}
      className={[
        'rounded-xl border bg-[rgba(11,14,28,0.72)] p-4 backdrop-blur-xl transition-colors',
        isOpen
          ? 'border-[#7C5CFF]/45 shadow-[0_0_20px_rgba(124,92,255,0.12)]'
          : 'border-[#141A33] hover:border-[#5C6691]/40',
      ].join(' ')}
    >
      {/* Header: título + meta + pillar dot */}
      <header className="flex items-start gap-3">
        <BookOpen
          className="mt-0.5 h-4 w-4 shrink-0 text-[#A7AECF]"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-[0.92rem] font-medium leading-snug text-[#F4F5FF]">
            {paper.title}
          </h3>
          <p className="mt-1 text-[0.72rem] leading-relaxed text-[#A7AECF]">
            <span className="text-[#F4F5FF]/90">
              {paper.authors.slice(0, 3).join(', ')}
              {paper.authors.length > 3 ? ' et al.' : ''}
            </span>
            <span className="mx-1 text-[#5C6691]">·</span>
            <span>{formatYear(paper.year)}</span>
            <span className="mx-1 text-[#5C6691]">·</span>
            <span>{paper.journal}</span>
          </p>
          {/* DOI/open-access line */}
          {paper.doi ? (
            <p className="mt-1 truncate font-mono text-[0.65rem] text-[#5C6691]">
              DOI: {paper.doi}
            </p>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          title={paper.pilar}
          className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      </header>

      {/* Practice + citation + badge row */}
      <footer className="mt-3 flex flex-wrap items-center gap-2 text-[0.66rem]">
        <span className="rounded-full bg-[rgba(124,92,255,0.12)] px-2 py-0.5 font-medium uppercase tracking-wider text-[#7C5CFF]">
          {paper.pilar}
        </span>
        <span className="rounded-full bg-[rgba(45,212,191,0.12)] px-2 py-0.5 font-medium uppercase tracking-wider text-[#2DD4BF]">
          {t('literature.badgePeerReviewed')}
        </span>
        {hasPractice ? (
          <span
            data-testid={`literature-paper-${paper.paperId}-practice`}
            className="inline-flex items-center gap-1 rounded-full bg-[rgba(240,180,41,0.12)] px-2 py-0.5 font-medium uppercase tracking-wider text-[#F0B429]"
          >
            <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
            {t('literature.paperHasPractice')} · {paper.practiceField}
          </span>
        ) : (
          <span className="rounded-full border border-dashed border-[#141A33] px-2 py-0.5 text-[#5C6691]">
            {t('literature.paperNoPractice')}
          </span>
        )}
        <span className="ml-auto text-[0.66rem] text-[#5C6691]">
          {paper.citationCount}×
        </span>
      </footer>

      {/* Expand / collapse */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`literature-paper-details-${paper.paperId}`}
        className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-[#7C5CFF]/30 bg-[rgba(124,92,255,0.08)] px-3 py-2 text-[0.72rem] font-medium text-[#9D86FF] hover:bg-[rgba(124,92,255,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
      >
        <span>
          {isOpen ? t('literature.closeDetails') : t('literature.openDetails')}
        </span>
        <ChevronRight
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Drill-down panel */}
      {isOpen ? (
        <section
          id={`literature-paper-details-${paper.paperId}`}
          data-testid={`literature-paper-details-${paper.paperId}`}
          className="mt-3 flex flex-col gap-3 border-t border-[#141A33] pt-3"
        >
          {/* Abstract */}
          <div>
            <h4 className="mb-1 text-[0.66rem] font-cinzel uppercase tracking-[0.15em] text-[#5C6691]">
              {t('literature.paperAbstract')}
            </h4>
            <p className="text-[0.78rem] leading-relaxed text-[#F4F5FF]/90">
              {truncate(paper.abstract, ABSTRACT_TRUNCATE)}
            </p>
          </div>

          {/* View source */}
          {isExternal ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`literature-paper-${paper.paperId}-source`}
              className="inline-flex w-fit items-center gap-1.5 rounded-md border border-[#2DD4BF]/30 bg-[rgba(45,212,191,0.08)] px-3 py-1.5 text-[0.7rem] font-medium text-[#2DD4BF] hover:bg-[rgba(45,212,191,0.16)]"
            >
              {t('literature.paperViewSource')}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ) : null}

          {/* Loading / error / ready state for cross-refs */}
          {isLoadingThis ? (
            <p
              data-testid={`literature-paper-${paper.paperId}-loading`}
              className="text-[0.7rem] italic text-[#5C6691]"
            >
              {t('literature.loadingDetails')}
            </p>
          ) : null}
          {isErrorThis ? (
            <p
              data-testid={`literature-paper-${paper.paperId}-error`}
              className="text-[0.7rem] text-[#FB5781]"
            >
              {drillState.message}
            </p>
          ) : null}
          {isReadyThis ? (
            <div className="flex flex-col gap-3">
              {/* Related discoveries */}
              <div>
                <h4 className="mb-1.5 text-[0.66rem] font-cinzel uppercase tracking-[0.15em] text-[#5C6691]">
                  {t('literature.paperRelatedDiscoveries')}{' '}
                  <span className="ml-1 text-[#A7AECF]">
                    ({drillState.discoveries.length})
                  </span>
                </h4>
                {drillState.discoveries.length === 0 ? (
                  <p className="text-[0.7rem] italic text-[#5C6691]">
                    {t('literature.paperDiscoveriesEmpty')}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5" role="list">
                    {drillState.discoveries.map((d) => (
                      <li
                        key={d.id}
                        className="rounded-md border border-[#141A33] bg-[rgba(11,14,28,0.55)] p-2"
                      >
                        <p className="text-[0.72rem] leading-snug text-[#F4F5FF]">
                          {d.verdadeUniversal}
                        </p>
                        <p className="mt-0.5 text-[0.62rem] text-[#5C6691]">
                          {d.akashaType ?? '—'}
                          <span className="mx-1">·</span>
                          {d.feedback}
                          <span className="mx-1">·</span>
                          {new Date(d.citedAt).toLocaleDateString(locale)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Related sessions */}
              <div>
                <h4 className="mb-1.5 text-[0.66rem] font-cinzel uppercase tracking-[0.15em] text-[#5C6691]">
                  {t('literature.paperRelatedSessions')}{' '}
                  <span className="ml-1 text-[#A7AECF]">
                    ({drillState.sessions.length})
                  </span>
                </h4>
                {drillState.sessions.length === 0 ? (
                  <p className="text-[0.7rem] italic text-[#5C6691]">
                    {t('literature.paperSessionsEmpty')}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5" role="list">
                    {drillState.sessions.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-md border border-[#141A33] bg-[rgba(11,14,28,0.55)] p-2"
                      >
                        <p className="text-[0.7rem] leading-snug text-[#F4F5FF]">
                          {s.caminhanteLabel} · {s.tipo} · {s.status}
                        </p>
                        <p className="mt-0.5 truncate text-[0.62rem] text-[#5C6691]">
                          {s.excerpt}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}

interface FiltersBarProps {
  facets: LiteratureFacets;
  activeFilters: LiteratureFilters;
  locale: string;
  onChange: (next: LiteratureFilters) => void;
  onClear: () => void;
}

function FiltersBar({
  facets,
  activeFilters,
  locale,
  onChange,
  onClear,
}: FiltersBarProps) {
  const t = getTranslations(locale);
  const pilarValue = activeFilters.pilar ?? 'all';
  const journalValue = activeFilters.journal ?? 'all';
  const yearValue = activeFilters.year !== undefined ? String(activeFilters.year) : 'all';
  const hasPracticeValue =
    activeFilters.hasPractice === undefined
      ? 'all'
      : activeFilters.hasPractice
        ? 'true'
        : 'false';

  return (
    <form
      id={FILTER_FORM_ID}
      data-testid="literature-filters"
      className="rounded-xl border border-[#7C5CFF]/25 bg-[rgba(11,14,28,0.72)] p-4 backdrop-blur-xl"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[0.78rem] font-cinzel uppercase tracking-[0.15em] text-[#7C5CFF]">
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          {t('literature.filtersTitle')}
        </h2>
        <button
          type="button"
          onClick={onClear}
          data-testid="literature-filters-clear"
          className="inline-flex items-center gap-1 rounded-md border border-[#141A33] bg-transparent px-2 py-1 text-[0.66rem] font-medium text-[#A7AECF] hover:border-[#FB5781]/40 hover:text-[#FB5781]"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          {t('literature.filterClear')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Year */}
        <label className="flex flex-col gap-1 text-[0.66rem] uppercase tracking-wider text-[#5C6691]">
          <span>{t('literature.filterYear')}</span>
          <select
            data-testid="literature-filter-year"
            value={yearValue}
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...activeFilters,
                year: v === 'all' ? undefined : Number(v),
              });
            }}
            className="rounded-md border border-[#141A33] bg-[#06070F] px-2 py-1.5 text-[0.8rem] text-[#F4F5FF] focus:border-[#7C5CFF]/45 focus:outline-none"
          >
            <option value="all">{t('literature.filterAll')}</option>
            {facets.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        {/* Pilar */}
        <label className="flex flex-col gap-1 text-[0.66rem] uppercase tracking-wider text-[#5C6691]">
          <span>{t('literature.filterPilar')}</span>
          <select
            data-testid="literature-filter-pilar"
            value={pilarValue}
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...activeFilters,
                pilar: v === 'all' ? 'all' : (v as Pilar),
              });
            }}
            className="rounded-md border border-[#141A33] bg-[#06070F] px-2 py-1.5 text-[0.8rem] text-[#F4F5FF] focus:border-[#7C5CFF]/45 focus:outline-none"
          >
            <option value="all">{t('literature.filterAll')}</option>
            {PILLAR_ORDER.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        {/* Journal */}
        <label className="flex flex-col gap-1 text-[0.66rem] uppercase tracking-wider text-[#5C6691]">
          <span>{t('literature.filterJournal')}</span>
          <select
            data-testid="literature-filter-journal"
            value={journalValue}
            onChange={(e) =>
              onChange({
                ...activeFilters,
                journal: e.target.value === 'all' ? 'all' : e.target.value,
              })
            }
            className="rounded-md border border-[#141A33] bg-[#06070F] px-2 py-1.5 text-[0.8rem] text-[#F4F5FF] focus:border-[#7C5CFF]/45 focus:outline-none"
          >
            <option value="all">{t('literature.filterAll')}</option>
            {facets.journals.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </label>

        {/* Has practice */}
        <label className="flex flex-col gap-1 text-[0.66rem] uppercase tracking-wider text-[#5C6691]">
          <span>{t('literature.filterHasPractice')}</span>
          <select
            data-testid="literature-filter-haspractice"
            value={hasPracticeValue}
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...activeFilters,
                hasPractice:
                  v === 'all' ? undefined : v === 'true' ? true : false,
              });
            }}
            className="rounded-md border border-[#141A33] bg-[#06070F] px-2 py-1.5 text-[0.8rem] text-[#F4F5FF] focus:border-[#7C5CFF]/45 focus:outline-none"
          >
            <option value="all">{t('literature.filterAll')}</option>
            <option value="true">{t('literature.paperHasPractice')}</option>
            <option value="false">{t('literature.paperNoPractice')}</option>
          </select>
        </label>
      </div>
    </form>
  );
}

// ─── Componente raiz ────────────────────────────────────────────────────────

export function KnowledgeBrowserClient({
  locale,
  papers,
  facets,
  activeFilters,
}: KnowledgeBrowserClientProps) {
  const t = getTranslations(locale);
  const router = useRouter();
  const pathname = usePathname();

  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [drillState, setDrillState] = useState<DrillState>({ kind: 'idle' });
  const fetchedRef = useRef<Set<string>>(new Set());

  const totalLabel = useMemo(
    () => t('literature.resultsCount', { count: papers.length }),
    [t, papers.length]
  );

  const pushFilters = useCallback(
    (next: LiteratureFilters) => {
      const qs = filtersToQuery(next);
      router.push(`${pathname}${qs}`);
    },
    [router, pathname]
  );

  const handleClear = useCallback(() => {
    pushFilters({});
  }, [pushFilters]);

  const handleToggle = useCallback(
    async (paperId: string) => {
      const isClosing = expandedPaperId === paperId;
      if (isClosing) {
        setExpandedPaperId(null);
        return;
      }
      setExpandedPaperId(paperId);

      // Se já fetched, não refazer.
      if (fetchedRef.current.has(paperId)) {
        return;
      }
      fetchedRef.current.add(paperId);

      setDrillState({ kind: 'loading', paperId });
      try {
        const [dRes, sRes] = await Promise.all([
          fetch(`/api/literature/${encodeURIComponent(paperId)}/discoveries`, {
            credentials: 'include',
          }),
          fetch(`/api/literature/${encodeURIComponent(paperId)}/sessions`, {
            credentials: 'include',
          }),
        ]);
        if (!dRes.ok || !sRes.ok) {
          throw new Error(
            `drill-down fetch failed: disc=${dRes.status}, sess=${sRes.status}`
          );
        }
        const dJson = (await dRes.json()) as { discoveries: PaperDiscoveryRef[] };
        const sJson = (await sRes.json()) as { sessions: PaperSessionRef[] };
        setDrillState({
          kind: 'ready',
          paperId,
          discoveries: dJson.discoveries ?? [],
          sessions: sJson.sessions ?? [],
        });
      } catch (err) {
        setDrillState({
          kind: 'error',
          paperId,
          message:
            err instanceof Error ? err.message : 'drill-down fetch failed',
        });
      }
    },
    [expandedPaperId]
  );

  // Reset drill-down quando papers mudam (filtros alterados).
  useEffect(() => {
    setExpandedPaperId(null);
    setDrillState({ kind: 'idle' });
    fetchedRef.current.clear();
  }, [papers]);

  return (
    <main
      data-testid="literature-root"
      className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8"
    >
      {/* Hero */}
      <header data-testid="literature-hero" className="mb-6">
        <h1
          data-testid="literature-page-title"
          className="font-cinzel text-[1.4rem] font-medium tracking-wide text-[#F4F5FF] sm:text-[1.6rem]"
        >
          {t('literature.pageTitle')}
        </h1>
        <p className="mt-1 text-[0.85rem] leading-relaxed text-[#A7AECF]">
          {t('literature.pageSubtitle')}
        </p>
        <p className="mt-1 text-[0.72rem] leading-relaxed text-[#5C6691]">
          {t('literature.pageDescription')}
        </p>
      </header>

      {/* Filters */}
      <div className="mb-5">
        <FiltersBar
          facets={facets}
          activeFilters={activeFilters}
          locale={locale}
          onChange={pushFilters}
          onClear={handleClear}
        />
      </div>

      {/* Results count */}
      <p
        data-testid="literature-results-count"
        className="mb-3 text-[0.72rem] uppercase tracking-wider text-[#5C6691]"
      >
        {totalLabel}
      </p>

      {/* Papers grid */}
      {papers.length === 0 ? (
        <p
          data-testid="literature-empty"
          className="rounded-xl border border-dashed border-[#141A33] bg-[rgba(11,14,28,0.4)] p-6 text-center text-[0.85rem] text-[#A7AECF]"
        >
          {t('literature.emptyState')}
        </p>
      ) : (
        <div
          data-testid="literature-results"
          className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4"
        >
          {papers.map((paper) => (
            <PaperCard
              key={paper.paperId}
              paper={paper}
              locale={locale}
              isOpen={expandedPaperId === paper.paperId}
              drillState={drillState}
              onToggle={() => handleToggle(paper.paperId)}
            />
          ))}
        </div>
      )}

      {/* Back-to-mandala breadcrumb */}
      <nav className="mt-8 text-center text-[0.66rem] text-[#5C6691]">
        <Link
          href={`/${locale}/mandala`}
          className="inline-flex items-center gap-1 hover:text-[#9D86FF]"
        >
          ← {t('literature.pageTitle')}
        </Link>
      </nav>
    </main>
  );
}
