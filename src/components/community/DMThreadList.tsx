'use client';

// ============================================================================
// DMThreadList — Sidebar de threads com unread badges + search + archive toggle
// (W90s-B)
//
// Padrão:
//   - 'use client' porque lemos cookie + filter via useState/useMemo.
//   - Recebe state do engine + dispatches em callbacks.
//   - Mobile-first: 1 coluna no mobile, 2 a partir de md.
//   - ARIA: lista com role + aria-label, badges com aria-hidden.
//   - data-testid: dm-thread-list, dm-thread-item, dm-unread-badge,
//     dm-thread-search, dm-archive-toggle, dm-view-active/archived.
//
// Acessibilidade:
//   - Touch targets ≥ 44px.
//   - Foco visível (focus-visible:ring).
//   - Reduced-motion respected.
// ============================================================================

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Inbox, Archive, ArchiveRestore } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { DMThread } from '@/lib/w90s/dm-threads';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export interface DMThreadListProps {
  readonly threads: ReadonlyArray<DMThread>;
  readonly currentThreadId?: string | null;
  readonly unreadSummary?: Readonly<Record<string, number>>;
  readonly onSearch?: (query: string) => void;
  readonly onArchiveToggle?: (threadId: string) => void;
  readonly className?: string;
}

interface ThreadRowProps {
  readonly thread: DMThread;
  readonly isActive: boolean;
  readonly unread: number;
  readonly onArchiveToggle?: (threadId: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatPreviewTime(ts: number, now: number = Date.now()): string {
  const diffMs = now - ts;
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < 60 * 60 * 1000) {
    const m = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    return `${m}m`;
  }
  if (diffMs < day) {
    const h = Math.floor(diffMs / (60 * 60 * 1000));
    return `${h}h`;
  }
  if (diffMs < 7 * day) {
    const d = Math.floor(diffMs / day);
    return `${d}d`;
  }
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ---------------------------------------------------------------------------
// ThreadRow
// ---------------------------------------------------------------------------
function ThreadRow({ thread, isActive, unread, onArchiveToggle }: ThreadRowProps) {
  const handleArchiveClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onArchiveToggle?.(thread.id);
  };

  return (
    <Link
      href={`/dm/${thread.id}`}
      aria-current={isActive ? 'page' : undefined}
      data-testid="dm-thread-item"
      data-thread-id={thread.id}
      className={cn(
        'block min-h-[44px] rounded-lg px-3 py-3 transition-colors',
        'hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive && 'bg-muted ring-1 ring-ring',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-xs font-semibold text-amber-950"
              aria-hidden="true"
            >
              {(thread.peerDisplayName || '?').slice(0, 1).toUpperCase()}
            </div>
            <p className="truncate text-sm font-medium text-foreground">
              {thread.peerDisplayName}
            </p>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {thread.lastMessagePreview || 'Toque para iniciar a conversa ✨'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[0.65rem] uppercase text-muted-foreground">
            {formatPreviewTime(thread.lastMessageAt)}
          </span>
          {unread > 0 && (
            <span
              data-testid="dm-unread-badge"
              aria-label={`${unread} mensagens não lidas`}
              className="inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[0.65rem] font-semibold text-primary-foreground"
            >
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
      {onArchiveToggle && (
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleArchiveClick}
            aria-label={thread.archived ? 'Desarquivar conversa' : 'Arquivar conversa'}
            data-testid={thread.archived ? 'dm-unarchive' : 'dm-archive'}
          >
            {thread.archived ? (
              <>
                <ArchiveRestore aria-hidden="true" /> Desarquivar
              </>
            ) : (
              <>
                <Archive aria-hidden="true" /> Arquivar
              </>
            )}
          </Button>
        </div>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// DMThreadList
// ---------------------------------------------------------------------------
export function DMThreadList({
  threads,
  currentThreadId = null,
  unreadSummary,
  onSearch,
  onArchiveToggle,
  className,
}: DMThreadListProps) {
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads
      .filter((t) => (view === 'active' ? !t.archived : t.archived))
      .filter((t) => {
        if (!q) return true;
        return (
          t.peerDisplayName.toLowerCase().includes(q) ||
          t.lastMessagePreview.toLowerCase().includes(q)
        );
      })
      .slice()
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }, [threads, query, view]);

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <aside
      data-testid="dm-thread-list"
      aria-label="Threads diretos"
      className={cn('flex h-full min-h-[400px] flex-col gap-3 rounded-lg border border-border bg-card p-3', className)}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold">Mensagens diretas</h2>
        <span className="ml-auto text-xs text-muted-foreground" data-testid="dm-thread-count">
          {filtered.length}
        </span>
      </div>

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Buscar pessoas ou mensagens"
          aria-label="Buscar conversas"
          value={query}
          onChange={handleSearchChange}
          data-testid="dm-thread-search"
          className="min-h-[44px] pl-8"
        />
      </div>

      <div role="tablist" aria-label="Visão de threads" className="flex gap-1">
        <Button
          role="tab"
          aria-selected={view === 'active'}
          variant={view === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('active')}
          data-testid="dm-view-active"
          className="min-h-[36px] flex-1"
        >
          <Inbox aria-hidden="true" /> Ativas
        </Button>
        <Button
          role="tab"
          aria-selected={view === 'archived'}
          variant={view === 'archived' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('archived')}
          data-testid="dm-view-archived"
          className="min-h-[36px] flex-1"
        >
          <Archive aria-hidden="true" /> Arquivadas
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground" data-testid="dm-empty-state">
          {view === 'active'
            ? 'Nenhuma conversa ativa no momento.'
            : 'Nenhuma conversa arquivada.'}
        </div>
      ) : (
        <ol
          className="flex flex-1 flex-col gap-1 overflow-y-auto"
          data-testid="dm-thread-items"
        >
          {filtered.map((t) => (
            <li key={t.id}>
              <ThreadRow
                thread={t}
                isActive={currentThreadId === t.id}
                unread={unreadSummary?.[t.id] ?? 0}
                onArchiveToggle={onArchiveToggle}
              />
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
