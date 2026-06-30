'use client';

// ============================================================================
// LeaderboardTable — Full sortable table (cycle 91 W91-B)
// ============================================================================
// Paginated, sortable leaderboard with all 4 metric columns and a derived
// "universalista" score column. Filterable by tradition via tabs.
//
// Accessibility:
//   - <table> with proper <thead>, <tbody>, <th scope="col"> and sortable
//     headers (aria-sort)
//   - Tab-navigation-friendly sort buttons (44px touch targets)
//   - Pagination as <nav aria-label="Paginação"> with prev/next + page buttons
//   - Mobile-first: cards collapse to a stacked layout below sm:
//
// Sacred-cultural compliance:
//   - 5 tradition tabs, each rendering the verbatim PT-BR label
//   - NO banned vocabulary in copy
//   - Universalista framing in headings
// ============================================================================

import React, { useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  buildLeaderboard,
  asPageNumber,
  asPageSize,
  TRADICAO_LABELS,
  TRADICAO_ACCENT_CLASSES,
  TRADICAO_BADGES,
  type LeaderboardEntry,
  type LeaderboardFilters,
  type PageRequest,
  type ScoredEntry,
  type TraditionId,
} from '@/lib/w91/reputation-leaderboard-engine';
import { cn } from '@/lib/utils';

export type SortKey =
  | 'score'
  | 'posts'
  | 'helpfulReactions'
  | 'crossTraditionReads'
  | 'mentorshipGiven'
  | 'traditionBreadth'
  | 'displayName';

export interface LeaderboardTableProps {
  /** Pre-fetched entries (server-rendered). */
  readonly entries: ReadonlyArray<LeaderboardEntry>;
  /** Initial page size. Default 20. */
  readonly initialPageSize?: number;
  /** Initial tradition filter; undefined = all. */
  readonly initialTradition?: TraditionId | 'all';
  /** ISO timestamp for the generatedAt field on the leaderboard result. */
  readonly generatedAt: string;
  /** Class for outer wrapper. */
  readonly className?: string;
}

const DEFAULT_PAGE_SIZE = 20;
const SORT_KEYS: ReadonlyArray<SortKey> = [
  'score',
  'posts',
  'helpfulReactions',
  'crossTraditionReads',
  'mentorshipGiven',
  'traditionBreadth',
  'displayName',
];

const SORT_LABELS_PT: Readonly<Record<SortKey, string>> = Object.freeze({
  score: 'Universalista',
  posts: 'Posts',
  helpfulReactions: 'Reações úteis',
  crossTraditionReads: 'Leituras cruzadas',
  mentorshipGiven: 'Mentorias',
  traditionBreadth: 'Tradições',
  displayName: 'Nome',
}) as Readonly<Record<SortKey, string>>;

// Helper — value extractor for sort key
function sortValueOf(entry: ScoredEntry, key: SortKey): number | string {
  switch (key) {
    case 'score':
      return entry.score;
    case 'posts':
      return entry.metrics.posts;
    case 'helpfulReactions':
      return entry.metrics.helpfulReactions;
    case 'crossTraditionReads':
      return entry.metrics.crossTraditionReads;
    case 'mentorshipGiven':
      return entry.metrics.mentorshipGiven;
    case 'traditionBreadth':
      return entry.traditionBreadth;
    case 'displayName':
      return entry.displayName;
  }
}

export function LeaderboardTable({
  entries,
  initialPageSize = DEFAULT_PAGE_SIZE,
  initialTradition = 'all',
  generatedAt,
  className,
}: LeaderboardTableProps) {
  const [tradition, setTradition] = useState<TraditionId | 'all'>(
    initialTradition
  );
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);

  const filters: LeaderboardFilters = useMemo(() => {
    if (tradition === 'all') return {};
    return { traditions: [tradition] };
  }, [tradition]);

  const result = useMemo(() => {
    const pageReq: PageRequest = {
      page: asPageNumber(page),
      pageSize: asPageSize(initialPageSize),
    };
    const built = buildLeaderboard({
      entries,
      filters,
      page: pageReq,
      now: generatedAt,
    });
    // Apply custom client-side sort
    const sorted = [...built.page.entries].sort((a, b) => {
      const av = sortValueOf(a, sortKey);
      const bv = sortValueOf(b, sortKey);
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), 'pt-BR');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return Object.freeze({
      ...built,
      page: Object.freeze({
        ...built.page,
        entries: Object.freeze(sorted) as ReadonlyArray<ScoredEntry>,
      }) as typeof built.page,
    });
  }, [entries, filters, page, initialPageSize, sortKey, sortDir, generatedAt]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('desc');
      }
    },
    [sortKey]
  );

  const handleTraditionChange = useCallback((next: TraditionId | 'all') => {
    setTradition(next);
    setPage(1);
  }, []);

  const totalPages = result.page.totalPages;
  const pageEntries = result.page.entries;

  return (
    <section
      data-testid="leaderboard-table"
      aria-label="Tabela de reconhecimento universalista"
      className={cn(
        'rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm overflow-hidden',
        className
      )}
    >
      {/* Tradition filter tabs */}
      <div
        data-testid="leaderboard-table-tradition-tabs"
        role="tablist"
        aria-label="Filtrar por tradição"
        className="flex flex-wrap gap-1 p-3 border-b border-slate-800/60"
      >
        <TraditionTab
          id="all"
          label="Todas as tradições"
          active={tradition === 'all'}
          onSelect={handleTraditionChange}
        />
        {(['candomble', 'umbanda', 'ifa', 'cabala', 'astrologia'] as ReadonlyArray<TraditionId>).map(
          (t) => (
            <TraditionTab
              key={t}
              id={t}
              label={TRADICAO_LABELS[t] ?? t}
              active={tradition === t}
              onSelect={handleTraditionChange}
            />
          )
        )}
      </div>

      {/* Mobile-stacked card list (below sm:) */}
      <div className="sm:hidden divide-y divide-slate-800/40">
        {pageEntries.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400" data-testid="leaderboard-table-empty">
            Sem contribuições neste recorte ainda.
          </p>
        ) : (
          pageEntries.map((entry, idx) => (
            <MobileLeaderboardCard
              key={entry.userId}
              entry={entry}
              rank={(page - 1) * initialPageSize + idx + 1}
            />
          ))
        )}
      </div>

      {/* Desktop table (sm and up) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-slate-200" data-testid="leaderboard-table-element">
          <thead className="bg-slate-950/80 border-b border-slate-800/60">
            <tr>
              <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-300 w-12">
                #
              </th>
              <SortableTh
                sortKey="displayName"
                currentKey={sortKey}
                dir={sortDir}
                onClick={handleSort}
                className="text-left"
              >
                {SORT_LABELS_PT.displayName}
              </SortableTh>
              <th scope="col" className="text-left px-3 py-2 font-semibold text-slate-300">
                Tradição principal
              </th>
              {(['posts', 'helpfulReactions', 'crossTraditionReads', 'mentorshipGiven'] as const).map(
                (k) => (
                  <SortableTh
                    key={k}
                    sortKey={k}
                    currentKey={sortKey}
                    dir={sortDir}
                    onClick={handleSort}
                    className="text-right"
                  >
                    {SORT_LABELS_PT[k]}
                  </SortableTh>
                )
              )}
              <SortableTh
                sortKey="traditionBreadth"
                currentKey={sortKey}
                dir={sortDir}
                onClick={handleSort}
                className="text-right"
              >
                {SORT_LABELS_PT.traditionBreadth}
              </SortableTh>
              <SortableTh
                sortKey="score"
                currentKey={sortKey}
                dir={sortDir}
                onClick={handleSort}
                className="text-right"
              >
                {SORT_LABELS_PT.score}
              </SortableTh>
            </tr>
          </thead>
          <tbody>
            {pageEntries.length === 0 ? (
              <tr>
                <td
                  colSpan={SORT_KEYS.length + 3}
                  className="text-center py-8 text-slate-400"
                  data-testid="leaderboard-table-empty"
                >
                  Sem contribuições neste recorte ainda.
                </td>
              </tr>
            ) : (
              pageEntries.map((entry, idx) => (
                <DesktopLeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  rank={(page - 1) * initialPageSize + idx + 1}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <nav
        aria-label="Paginação"
        data-testid="leaderboard-table-pagination"
        className="flex items-center justify-between gap-2 px-3 py-3 border-t border-slate-800/60 text-xs text-slate-300"
      >
        <button
          type="button"
          data-testid="leaderboard-table-prev"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] focus:outline-none focus:ring-2 focus:ring-violet-400/60"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Anterior
        </button>
        <span data-testid="leaderboard-table-page-info" className="tabular-nums">
          Página {page} de {totalPages} · {result.page.totalEntries} contribuidores
        </span>
        <button
          type="button"
          data-testid="leaderboard-table-next"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] focus:outline-none focus:ring-2 focus:ring-violet-400/60"
        >
          Próxima <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </nav>
    </section>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface TraditionTabProps {
  readonly id: TraditionId | 'all';
  readonly label: string;
  readonly active: boolean;
  readonly onSelect: (id: TraditionId | 'all') => void;
}

function TraditionTab({ id, label, active, onSelect }: TraditionTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-testid={`leaderboard-table-tradition-tab-${id}`}
      onClick={() => onSelect(id)}
      className={cn(
        'px-3 py-2 rounded-full text-xs border min-h-[44px] focus:outline-none focus:ring-2 focus:ring-violet-400/60',
        active
          ? 'bg-violet-500/20 border-violet-400/60 text-violet-100'
          : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/80'
      )}
    >
      {label}
    </button>
  );
}

interface SortableThProps {
  readonly sortKey: SortKey;
  readonly currentKey: SortKey;
  readonly dir: 'asc' | 'desc';
  readonly onClick: (k: SortKey) => void;
  readonly className?: string;
  readonly children: React.ReactNode;
}

function SortableTh({
  sortKey,
  currentKey,
  dir,
  onClick,
  className,
  children,
}: SortableThProps) {
  const isActive = sortKey === currentKey;
  const ariaSort: 'ascending' | 'descending' | 'none' = isActive
    ? dir === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';
  const Icon = !isActive ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={cn('px-3 py-2 font-semibold text-slate-300', className)}
    >
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        data-testid={`leaderboard-table-sort-${sortKey}`}
        className="inline-flex items-center gap-1 hover:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400/60 rounded px-1 py-0.5 min-h-[28px]"
      >
        {children}
        <Icon className="w-3 h-3" aria-hidden="true" />
      </button>
    </th>
  );
}

interface MobileLeaderboardCardProps {
  readonly entry: ScoredEntry;
  readonly rank: number;
}

function MobileLeaderboardCard({ entry, rank }: MobileLeaderboardCardProps) {
  const accent =
    TRADICAO_ACCENT_CLASSES[entry.primaryTradition] ??
    'border-slate-700/50 bg-slate-800/40 text-slate-200';
  const badge = TRADICAO_BADGES[entry.primaryTradition] ?? entry.primaryTradition;
  return (
    <article
      data-testid={`leaderboard-table-card-${rank}`}
      className="p-3 flex items-start gap-3"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-slate-800/80 text-slate-300 shrink-0" aria-label={`Posição ${rank}`}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-100 font-semibold truncate" data-testid="leaderboard-table-name">
          {entry.displayName}
        </p>
        <span
          className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] border mt-0.5',
            accent
          )}
        >
          {badge}
        </span>
        <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300">
          <dt className="text-slate-500">Posts</dt>
          <dd className="text-right tabular-nums">{entry.metrics.posts}</dd>
          <dt className="text-slate-500">Reações úteis</dt>
          <dd className="text-right tabular-nums">{entry.metrics.helpfulReactions}</dd>
          <dt className="text-slate-500">Leituras cruzadas</dt>
          <dd className="text-right tabular-nums">{entry.metrics.crossTraditionReads}</dd>
          <dt className="text-slate-500">Mentorias</dt>
          <dd className="text-right tabular-nums">{entry.metrics.mentorshipGiven}</dd>
        </dl>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-slate-400">Universalista</p>
        <p className="text-base font-bold text-amber-200 tabular-nums" data-testid="leaderboard-table-score">
          {entry.score}
        </p>
      </div>
    </article>
  );
}

interface DesktopLeaderboardRowProps {
  readonly entry: ScoredEntry;
  readonly rank: number;
}

function DesktopLeaderboardRow({ entry, rank }: DesktopLeaderboardRowProps) {
  const accent =
    TRADICAO_ACCENT_CLASSES[entry.primaryTradition] ??
    'border-slate-700/50 bg-slate-800/40 text-slate-200';
  const badge = TRADICAO_BADGES[entry.primaryTradition] ?? entry.primaryTradition;
  return (
    <tr
      data-testid={`leaderboard-table-row-${rank}`}
      className="border-t border-slate-800/40 hover:bg-slate-800/30 transition-colors"
    >
      <td className="px-3 py-2 text-slate-300 tabular-nums">{rank}</td>
      <td className="px-3 py-2 text-slate-100 font-medium" data-testid="leaderboard-table-name">
        {entry.displayName}
      </td>
      <td className="px-3 py-2">
        <span
          className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] border',
            accent
          )}
        >
          {badge}
        </span>
      </td>
      <td className="px-3 py-2 text-right tabular-nums">{entry.metrics.posts}</td>
      <td className="px-3 py-2 text-right tabular-nums">{entry.metrics.helpfulReactions}</td>
      <td className="px-3 py-2 text-right tabular-nums">{entry.metrics.crossTraditionReads}</td>
      <td className="px-3 py-2 text-right tabular-nums">{entry.metrics.mentorshipGiven}</td>
      <td className="px-3 py-2 text-right tabular-nums">{entry.traditionBreadth}</td>
      <td
        className="px-3 py-2 text-right font-bold text-amber-200 tabular-nums"
        data-testid="leaderboard-table-score"
      >
        {entry.score}
      </td>
    </tr>
  );
}

export default LeaderboardTable;