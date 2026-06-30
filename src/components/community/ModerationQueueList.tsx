'use client';

// ============================================================================
// ModerationQueueList — Lista paginada com tabs por status
// ============================================================================
// Componente 'use client' para a fila de moderação. Recebe a fila completa
// do Server Component e gerencia filtros + paginação localmente.
//
// Acessibilidade:
//  - Tabs com role="tablist" / role="tab"
//  - aria-live="polite" no banner de estatísticas
//  - 44px touch targets nos botões de paginação
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  type ModerationQueueItem,
  type QueueStatus,
  type UserId,
  filterByStatus,
  getQueueStats,
} from '@/lib/w90/comments-moderation';
import { ModerationQueueItem as ModerationQueueItemCard } from './ModerationQueueItem';

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

export interface ModerationQueueListProps {
  items: ReadonlyArray<ModerationQueueItem>;
  currentModeratorId: UserId;
  onAction: (id: string, action: 'approve' | 'reject' | 'escalate', note: string) => void;
}

const PAGE_SIZE = 10;
const STATUSES: ReadonlyArray<{ value: QueueStatus; label: string }> = [
  { value: 'pending', label: 'Aguardando' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Rejeitados' },
  { value: 'escalated', label: 'Escalados' },
];

// ----------------------------------------------------------------------------
// Componente
// ----------------------------------------------------------------------------

export function ModerationQueueList({
  items,
  currentModeratorId,
  onAction,
}: ModerationQueueListProps) {
  const [activeTab, setActiveTab] = useState<QueueStatus>('pending');
  const [page, setPage] = useState<number>(1);

  const stats = useMemo(() => getQueueStats(items), [items]);

  const filtered = useMemo(
    () => filterByStatus(items, activeTab),
    [items, activeTab],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = useMemo(
    () => filtered.slice(pageStart, pageStart + PAGE_SIZE),
    [filtered, pageStart],
  );

  const handleApprove = useCallback(
    (id: string, note: string) => onAction(id, 'approve', note),
    [onAction],
  );
  const handleReject = useCallback(
    (id: string, note: string) => onAction(id, 'reject', note),
    [onAction],
  );
  const handleEscalate = useCallback(
    (id: string, note: string) => onAction(id, 'escalate', note),
    [onAction],
  );

  return (
    <section
      data-testid="queue-list"
      aria-label="Fila de moderação"
      className="space-y-4"
    >
      {/* Banner de estatísticas */}
      <div
        role="status"
        aria-live="polite"
        className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs sm:grid-cols-4"
      >
        <div>
          <p className="font-semibold text-slate-700">Total</p>
          <p className="text-lg text-slate-900">{stats.total}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-700">Pendentes</p>
          <p className="text-lg text-amber-700">{stats.pending}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-700">Aprovados</p>
          <p className="text-lg text-emerald-700">{stats.approved}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-700">Rejeitados</p>
          <p className="text-lg text-rose-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Tabs por status */}
      <div role="tablist" aria-label="Filtrar por status" className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const isActive = s.value === activeTab;
          const count = filterByStatus(items, s.value).length;
          return (
            <button
              key={s.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="queue-list-panel"
              data-testid={`queue-tab-${s.value}`}
              onClick={() => {
                setActiveTab(s.value);
                setPage(1);
              }}
              className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {s.label}{' '}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div
        id="queue-list-panel"
        role="tabpanel"
        aria-label={`Itens com status ${activeTab}`}
        className="space-y-3"
      >
        {pageItems.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Nenhum item com status "{activeTab}" no momento.
          </p>
        ) : (
          pageItems.map((item) => (
            <ModerationQueueItemCard
              key={item.id}
              item={item}
              currentModeratorId={currentModeratorId}
              onApprove={handleApprove}
              onReject={handleReject}
              onEscalate={handleEscalate}
            />
          ))
        )}
      </div>

      {/* Paginação */}
      {filtered.length > PAGE_SIZE && (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3"
        >
          <Button
            data-testid="queue-page-prev"
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Anterior
          </Button>
          <p className="text-sm text-slate-600">
            Página {safePage} de {totalPages}
          </p>
          <Button
            data-testid="queue-page-next"
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Próxima página"
          >
            Próxima
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </nav>
      )}
    </section>
  );
}

export default ModerationQueueList;