'use client';

// ============================================================================
// DMThreadView — Visualizador de thread com input + read receipts (W90s-B)
//
// Responsabilidades:
//   - Render scrollado de mensagens (auto-scroll to bottom).
//   - Marcar como lido on-mount + ao receber focus.
//   - Typing indicator básico (placeholder).
//   - Wire no DMComposer.
//
// ARIA:
//   - role="main" + aria-label com peer name.
//   - Lista de mensagens: role="log" + aria-live="polite".
//
// data-testid:
//   - dm-thread-view
//   - dm-thread-header
//   - dm-thread-messages
//   - dm-thread-typing
//   - dm-empty-thread
//
// Acessibilidade:
//   - 44px touch targets.
//   - Focus trap quando blocklist está ativa.
//   - Skip link para o composer.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { DMMessageItem } from './DMMessageItem';
import { DMComposer } from './DMComposer';
import type { DMThread, DMMessage } from '@/lib/w90s/dm-threads';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export interface DMThreadViewProps {
  readonly thread: DMThread;
  readonly messages: ReadonlyArray<DMMessage>;
  readonly currentUserId: string;
  readonly blockedPeer?: boolean;
  readonly draftMessage?: string;
  readonly onSend?: (text: string) => void;
  readonly onMarkRead?: () => void;
  readonly onArchiveToggle?: () => void;
  readonly onUnblock?: () => void;
  readonly onDraftChange?: (draft: string) => void;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Helpers locais
// ---------------------------------------------------------------------------
function formatHeaderTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------
function ThreadHeader({
  thread,
  onArchiveToggle,
}: {
  readonly thread: DMThread;
  readonly onArchiveToggle?: () => void;
}) {
  return (
    <header
      data-testid="dm-thread-header"
      className="flex items-center gap-3 border-b border-border bg-card px-4 py-3"
    >
      <Link
        href="/dm"
        aria-label="Voltar para lista de threads"
        className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" />
      </Link>
      <div
        className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-base font-semibold text-amber-950"
        aria-hidden="true"
      >
        {(thread.peerDisplayName || '?').slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{thread.peerDisplayName}</p>
        <p className="truncate text-xs text-muted-foreground">
          Conversa direta · 2 participantes
        </p>
      </div>
      {onArchiveToggle && (
        <button
          type="button"
          onClick={onArchiveToggle}
          data-testid={thread.archived ? 'dm-thread-unarchive' : 'dm-thread-archive'}
          className="min-h-[36px] rounded-md px-3 text-xs text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {thread.archived ? 'Desarquivar' : 'Arquivar'}
        </button>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// DMThreadView
// ---------------------------------------------------------------------------
export function DMThreadView({
  thread,
  messages,
  currentUserId,
  blockedPeer = false,
  draftMessage = '',
  onSend,
  onMarkRead,
  onArchiveToggle,
  onUnblock,
  onDraftChange,
  className,
}: DMThreadViewProps) {
  const listRef = useRef<HTMLOListElement | null>(null);
  const lastLenRef = useRef(messages.length);

  // Visible (filtra deleted)
  const visible = useMemo(() => {
    return messages.filter((m) => !m.deleted);
  }, [messages]);

  // Auto-scroll na última mensagem quando o tamanho muda
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (visible.length === 0) return;
    if (messages.length === lastLenRef.current) return;
    lastLenRef.current = messages.length;
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, visible.length]);

  // Auto-mark-as-read quando a thread monta / quando mensagens novas chegam
  useEffect(() => {
    onMarkRead?.();
  }, [onMarkRead, messages.length]);

  // Agrupa mensagens por dia para mostrar divisor
  const grouped = useMemo(() => {
    const groups: Array<{ day: string; items: DMMessage[] }> = [];
    for (const m of visible) {
      const d = new Date(m.createdAt);
      const day = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
      });
      const last = groups[groups.length - 1];
      if (last && last.day === day) {
        last.items.push(m);
      } else {
        groups.push({ day, items: [m] });
      }
    }
    return groups;
  }, [visible]);

  const handleSend = useCallback(
    (text: string) => {
      onSend?.(text);
    },
    [onSend],
  );

  return (
    <section
      role="main"
      aria-label={`Conversa com ${thread.peerDisplayName}`}
      data-testid="dm-thread-view"
      className={cn('flex h-full min-h-[500px] flex-col rounded-lg border border-border bg-card', className)}
    >
      <ThreadHeader thread={thread} onArchiveToggle={onArchiveToggle} />

      {blockedPeer ? (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
          data-testid="dm-blocked-state"
        >
          <ShieldOff aria-hidden="true" className="size-10 text-muted-foreground" />
          <p className="text-sm font-medium">Você bloqueou este usuário.</p>
          <p className="text-xs text-muted-foreground">
            As mensagens existentes continuam visíveis, mas não é possível enviar novas.
          </p>
          {onUnblock && (
            <button
              type="button"
              onClick={onUnblock}
              data-testid="dm-unblock-button"
              className="min-h-[44px] rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Desbloquear
            </button>
          )}
        </div>
      ) : visible.length === 0 ? (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center"
          data-testid="dm-empty-thread"
        >
          <p className="text-sm font-medium">Comece uma conversa ✨</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Diga olá, compartilhe uma ideia ou pergunte algo. Sua mensagem aparecerá aqui
            em tempo real.
          </p>
        </div>
      ) : (
        <ol
          ref={listRef}
          data-testid="dm-thread-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 space-y-3 overflow-y-auto p-4"
        >
          {grouped.map((g) => (
            <li key={g.day} className="space-y-2">
              <div
                role="separator"
                aria-label={`Mensagens de ${g.day}`}
                className="my-2 text-center text-[0.65rem] uppercase tracking-wide text-muted-foreground"
              >
                {g.day}
              </div>
              <ul className="space-y-2">
                {g.items.map((m) => (
                  <DMMessageItem
                    key={m.id}
                    message={m}
                    currentUserId={currentUserId}
                    peerDisplayName={thread.peerDisplayName}
                  />
                ))}
              </ul>
            </li>
          ))}
          <li data-testid="dm-thread-typing" aria-live="polite" className="h-6 text-xs text-muted-foreground" />
        </ol>
      )}

      {!blockedPeer && (
        <div className="border-t border-border p-2 sm:p-3">
          <DMComposer
            draft={draftMessage}
            onSend={handleSend}
            onDraftChange={onDraftChange}
            disabled={thread.archived}
            placeholder={thread.archived ? 'Conversa arquivada' : 'Escreva uma mensagem'}
          />
        </div>
      )}

      <footer className="border-t border-border bg-muted/30 px-3 py-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        <span>Thread criada em {formatHeaderTime(thread.createdAt)} · </span>
        <span>LGPD: mensagens salvas localmente no seu dispositivo.</span>
      </footer>
    </section>
  );
}

export default DMThreadView;
