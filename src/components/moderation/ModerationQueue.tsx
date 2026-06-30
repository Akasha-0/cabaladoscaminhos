'use client';

// ============================================================================
// ModerationQueue — Dashboard do cuidador (community_steward)
// ============================================================================
// Lista de comentários sinalizados com filtros (status / reason / datas).
// Mobile: cards. Desktop: table.
//
// Acessibilidade:
//  - role="region" + aria-labelledby
//  - Tabs com role="tablist" / role="tab" / aria-selected
//  - Filtro: aria-live="polite" para mudanças de contagem
//  - Touch targets ≥ 44px
//
// Tom de voz: SEM strike/warning/mute/ban. SEM contagem de "speed".
// Empty state acolhedor: "✨ Nenhum comentário pendente — obrigado por cuidar
// da comunidade com presença."
// ============================================================================

import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { Loader2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TriagePanel } from './TriagePanel';
import {
  type CommentId,
  type FlagFilters,
  type FlagStatus,
  type ReportReason,
  type User,
  REPORT_REASONS,
  REASON_LABELS,
  STATUS_LABELS,
} from '@/lib/w92/comments-moderation';

// ----------------------------------------------------------------------------

const LIMIT = 20;

const PT_NULL_COPY = {
  filtersTitle: 'Filtros',
  refresh: 'Atualizar',
  pending: 'Aguardando cuidado',
  triaged: 'Vistos',
  all: 'Todos',
  emptyTitle: '✨ Nada pendente no momento',
  emptyBody:
    'Obrigado por cuidar da comunidade com presença. Volte mais tarde se alguém precisar.',
  loading: 'Carregando com calma…',
  errorBody: (msg: string) => `Não foi possível carregar agora. ${msg}`,
  retry: 'Tentar de novo',
  count: (n: number) => `${n} ${n === 1 ? 'item' : 'itens'}`,
  commentBy: (name: string) => `por ${name}`,
  ageAt: (iso: string) => `há instantes`,
  reportsHeading: 'Sinalizações',
  openTriage: 'Cuidar',
};

type Tab = 'PENDING' | 'TRIAGED' | 'ALL';

// ----------------------------------------------------------------------------

export interface ModerationQueueProps {
  /** Cuidador logado (já validado pelo server gate). */
  steward: User;
  /** Service factories — recebem store injetado pra evitar fetches. */
  initialItems: ReadonlyArray<ReturnType<typeof mapServerItem>>;
  total: number;
  /** Função de fetch quando paginação / refetch é necessária. */
  onLoad: (filters: FlagFilters) => Promise<{
    items: ReadonlyArray<ReturnType<typeof mapServerItem>>;
    total: number;
  }>;
  className?: string;
}

/** Item shape serializável do server → client. */
export interface ServerFlagItem {
  commentId: string;
  authorId: string;
  authorDisplayName: string;
  excerpt: string;
  status: FlagStatus;
  reportReasons: ReadonlyArray<{ reason: ReportReason; count: number }>;
  ageMs: number; // calculado server-side
  firstFlaggedAt: string;
}

/** Map server shape → engine shape. Mantido simples para evitar libs externas. */
function mapServerItem(s: ServerFlagItem) {
  return {
    commentId: s.commentId as CommentId,
    authorId: s.authorId,
    authorDisplayName: s.authorDisplayName,
    excerpt: s.excerpt,
    status: s.status,
    reportReasons: s.reportReasons,
    ageMs: s.ageMs,
    firstFlaggedAt: s.firstFlaggedAt,
  };
}

function formatAge(ms: number): string {
  const sec = Math.max(1, Math.round(ms / 1000));
  if (sec < 60) return `há ${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} d`;
}

// ----------------------------------------------------------------------------

export function ModerationQueue({
  steward,
  initialItems,
  total: initialTotal,
  onLoad,
  className,
}: ModerationQueueProps) {
  const [tab, setTab] = useState<Tab>('PENDING');
  const [reasonFilter, setReasonFilter] = useState<ReportReason | 'ALL'>('ALL');
  const [items, setItems] = useState(() => initialItems.map(mapServerItem));
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [openCommentId, setOpenCommentId] = useState<CommentId | null>(null);

  const load = useCallback(
    async (next?: Partial<{ tab: Tab; reason: ReportReason | 'ALL' }>) => {
      const useTab = next?.tab ?? tab;
      const useReason = next?.reason ?? reasonFilter;
      setLoading(true);
      setError(null);
      try {
        const filters: FlagFilters = {
          page: { limit: LIMIT, offset: 0 },
          ...(useTab === 'PENDING' && { status: ['PENDING'] }),
          ...(useTab === 'TRIAGED' && {
            status: ['TRIAGED_HIDDEN', 'TRIAGED_RESTORED', 'TRIAGED_NO_ACTION'],
          }),
          ...(useReason !== 'ALL' && { reasons: [useReason] }),
        };
        const result = await onLoad(filters);
        setItems(result.items.map(mapServerItem));
        setTotal(result.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    },
    [onLoad, reasonFilter, tab]
  );

  const handleTab = useCallback(
    (next: Tab) => {
      setTab(next);
      startTransition(() => {
        void load({ tab: next });
      });
    },
    [load]
  );

  const handleReason = useCallback(
    (next: ReportReason | 'ALL') => {
      setReasonFilter(next);
      startTransition(() => {
        void load({ reason: next });
      });
    },
    [load]
  );

  const handleTriageDone = useCallback(
    (commentId: CommentId) => {
      setOpenCommentId(null);
      // remove da lista local sem refetch (otimista)
      setItems((prev) => prev.filter((i) => i.commentId !== commentId));
      setTotal((t) => Math.max(0, t - 1));
    },
    []
  );

  const openItem = useMemo(
    () => items.find((i) => i.commentId === openCommentId) ?? null,
    [items, openCommentId]
  );

  return (
    <section
      className={cn('space-y-5', className)}
      aria-labelledby="queue-heading"
      role="region"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1
            id="queue-heading"
            className="text-xl sm:text-2xl font-semibold text-slate-100 flex items-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            Cuidado da comunidade
          </h1>
          <p
            className="text-sm text-slate-400 mt-1"
            aria-live="polite"
            aria-atomic
          >
            {PT_NULL_COPY.count(total)} no recorte atual
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void load()}
          disabled={loading}
          className="min-h-[44px] min-w-[44px] text-slate-300 hover:bg-slate-800/50"
          aria-label={PT_NULL_COPY.refresh}
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </Button>
      </header>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Status dos itens"
        className="inline-flex rounded-xl border border-slate-800 bg-slate-950/40 p-1 gap-1"
      >
        {(
          [
            { value: 'PENDING', label: PT_NULL_COPY.pending },
            { value: 'TRIAGED', label: PT_NULL_COPY.triaged },
            { value: 'ALL', label: PT_NULL_COPY.all },
          ] as const
        ).map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => handleTab(t.value)}
            className={cn(
              'min-h-[44px] px-3.5 rounded-lg text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
              tab === t.value
                ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Reason filter chips */}
      <div role="group" aria-label="Motivo" className="flex flex-wrap gap-2">
        <FilterChip
          active={reasonFilter === 'ALL'}
          label="Todos os motivos"
          onClick={() => handleReason('ALL')}
        />
        {REPORT_REASONS.map((r) => (
          <FilterChip
            key={r}
            active={reasonFilter === r}
            label={REASON_LABELS[r]}
            onClick={() => handleReason(r)}
          />
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && items.length === 0 && (
        <p
          role="status"
          className="text-sm text-slate-400 py-6 text-center flex items-center justify-center gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          {PT_NULL_COPY.loading}
        </p>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-300">{PT_NULL_COPY.errorBody(error)}</p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void load()}
              className="mt-2 min-h-[44px] text-red-200 hover:bg-red-500/20"
            >
              {PT_NULL_COPY.retry}
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !error && (
        <div className="py-12 text-center">
          <p className="text-lg text-slate-200">{PT_NULL_COPY.emptyTitle}</p>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            {PT_NULL_COPY.emptyBody}
          </p>
        </div>
      )}

      {/* List — cards on mobile, table on md+ */}
      {items.length > 0 && (
        <>
          {/* Mobile cards */}
          <ul className="md:hidden space-y-3" aria-label="Comentários sinalizados">
            {items.map((item) => (
              <li key={item.commentId}>
                <QueueCard
                  item={item}
                  onOpen={() => setOpenCommentId(item.commentId)}
                />
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Comentário</th>
                  <th className="text-left px-4 py-3 font-medium">Autor</th>
                  <th className="text-left px-4 py-3 font-medium">Sinalizações</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Idade</th>
                  <th className="px-4 py-3 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item) => (
                  <tr key={item.commentId} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 text-slate-200 max-w-[420px]">
                      <p className="line-clamp-2">{item.excerpt}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.authorDisplayName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.reportReasons.map((r) => (
                          <span
                            key={r.reason}
                            className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200"
                          >
                            {REASON_LABELS[r.reason]} · {r.count}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {STATUS_LABELS[item.status]}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatAge(item.ageMs)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        onClick={() => setOpenCommentId(item.commentId)}
                        className="min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950"
                      >
                        {PT_NULL_COPY.openTriage}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Triage panel (modal-ish) */}
      {openItem && (
        <TriagePanel
          commentId={openItem.commentId}
          steward={steward}
          initialItem={openItem}
          onClose={() => setOpenCommentId(null)}
          onDone={handleTriageDone}
        />
      )}
    </section>
  );
}

// ----------------------------------------------------------------------------

interface FilterChipProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

function FilterChip({ active, label, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-[44px] px-3.5 py-2 rounded-full text-xs transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
        active
          ? 'bg-amber-500 text-slate-950 border border-amber-400'
          : 'bg-slate-900/40 text-slate-300 border border-slate-800 hover:border-slate-700'
      )}
    >
      {label}
    </button>
  );
}

interface QueueCardProps {
  item: ReturnType<typeof mapServerItem>;
  onOpen: () => void;
}

function QueueCard({ item, onOpen }: QueueCardProps) {
  return (
    <article
      role="article"
      aria-label="Comentário sinalizado"
      className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3"
    >
      <p className="text-sm text-slate-200 line-clamp-3">{item.excerpt}</p>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{PT_NULL_COPY.commentBy(item.authorDisplayName)}</span>
        <span>{formatAge(item.ageMs)}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {item.reportReasons.map((r) => (
          <span
            key={r.reason}
            className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200"
          >
            {REASON_LABELS[r.reason]} · {r.count}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          {STATUS_LABELS[item.status]}
        </span>
        <Button
          type="button"
          onClick={onOpen}
          className="min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950"
        >
          {PT_NULL_COPY.openTriage}
        </Button>
      </div>
    </article>
  );
}

// Re-export pra server pages usarem o mapeamento consistente.
export { mapServerItem };

