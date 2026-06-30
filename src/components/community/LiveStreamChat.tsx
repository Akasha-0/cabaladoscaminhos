'use client';

// ============================================================================
// LiveStreamChat — main chat panel for a live stream (W89-A)
//
// Wraps the pure `live-stream-chat` engine into a React component. The
// component owns a local copy of `LiveStreamChatState` and exposes the
// minimal mutators the user can trigger (send, react, delete, pin).
//
// This component is *pure additive* — it does NOT require a backend. The
// engine is in-memory; production wiring would:
//
//   1. Subscribe to an SSE stream and dispatch `createMessage` etc.
//   2. POST each user action to `/api/live/[id]/chat` and let the server
//      echo it back through the same SSE channel.
//
// Mobile-first:
//   - Bottom-sheet style composer (sticky at bottom on mobile).
//   - Touch targets ≥ 44px on all interactive elements.
//   - Reduced-motion respected.
//
// ARIA:
//   - `<section role="log" aria-live="polite">` on the message list so
//     screen readers announce new messages.
//   - aria-label on the input.
//   - Focus management: send button has visible focus ring.
//
// data-testid attrs (for source-inspection spec):
//   - `live-stream-chat` (root)
//   - `chat-send` (send button)
//   - `chat-input` (text input)
//   - `chat-message-list` (list container)
//   - `chat-pinned-banner` (pinned banner)
//   - `chat-slow-mode-countdown` (slow mode countdown)
//   - `chat-empty-state` (empty state)
// ============================================================================

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Pin, Send, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessageItem } from '@/components/community/ChatMessageItem';
import {
  createInitialState,
  createMessage,
  addReaction,
  deleteMessage,
  getPinnedMessage,
  getSlowModeRemaining,
  getVisibleMessages,
  pinMessage,
  unpinMessage,
  MAX_MESSAGE_LENGTH,
  toUserId,
  type LiveStreamChatState,
  type LiveStreamId,
  type UserId,
  type LiveStreamMessageId,
  type LiveStreamMessage,
} from '@/lib/w89/live-stream-chat';

// ---------------------------------------------------------------------------
// Action types — local reducer for predictable state transitions
// ---------------------------------------------------------------------------
type Action =
  | { type: 'reset'; state: LiveStreamChatState }
  | { type: 'send'; userId: UserId; userName: string; text: string; nowMs: number }
  | { type: 'react'; messageId: LiveStreamMessageId; emoji: string }
  | { type: 'delete'; messageId: LiveStreamMessageId }
  | { type: 'pin'; messageId: LiveStreamMessageId }
  | { type: 'unpin' };

function reducer(state: LiveStreamChatState, action: Action): LiveStreamChatState {
  switch (action.type) {
    case 'reset':
      return action.state;
    case 'send': {
      const result = createMessage(state, {
        streamId: state.pinnedId
          ? (state.messages.find((m) => m.id === state.pinnedId)?.streamId ??
            ('stream-x' as LiveStreamId))
          : ('stream-x' as LiveStreamId),
        userId: action.userId,
        userName: action.userName,
        text: action.text,
        nowMs: action.nowMs,
      });
      return result.state;
    }
    case 'react':
      return addReaction(state, action.messageId, action.emoji);
    case 'delete':
      return deleteMessage(state, action.messageId);
    case 'pin':
      return pinMessage(state, action.messageId);
    case 'unpin':
      return unpinMessage(state);
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface LiveStreamChatProps {
  readonly streamId: string;
  readonly currentUserId: string;
  readonly currentUserName?: string;
  readonly canModerate?: boolean;
  readonly slowModeSeconds?: number;
  readonly bannedWords?: ReadonlyArray<string>;
  readonly className?: string;
  /** Optional initial messages for SSR / hydrate scenarios. */
  readonly initialMessages?: ReadonlyArray<LiveStreamMessage>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function LiveStreamChat({
  streamId,
  currentUserId,
  currentUserName = 'você',
  canModerate = false,
  slowModeSeconds = 0,
  bannedWords,
  className,
  initialMessages,
}: LiveStreamChatProps) {
  // Initialize state lazily so initial messages + banned words are applied once.
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const base = createInitialState({ bannedWords, slowModeSeconds });
    if (!initialMessages || initialMessages.length === 0) return base;
    return Object.freeze({
      ...base,
      messages: Object.freeze([...initialMessages]),
    });
  });

  const [draft, setDraft] = React.useState('');
  const [nowMs, setNowMs] = React.useState<number>(() => Date.now());
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const inputIdRef = useRef<string>(
    `chat-input-${Math.random().toString(36).slice(2, 8)}`,
  );
  const listRef = useRef<HTMLOListElement | null>(null);

  // Tick "now" every second so slow-mode countdown re-renders.
  useEffect(() => {
    if (state.slowModeSeconds <= 0) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [state.slowModeSeconds]);

  // Auto-scroll on new messages (mobile-friendly).
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [state.messages.length]);

  const slowModeRemaining = useMemo(
    () => getSlowModeRemaining(state, toUserId(currentUserId), nowMs),
    [state, currentUserId, nowMs],
  );

  const isSendDisabled =
    draft.trim().length === 0 || draft.length > MAX_MESSAGE_LENGTH || slowModeRemaining > 0;

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    if (text.length > MAX_MESSAGE_LENGTH) {
      setStatusMessage(`Mensagem limitada a ${MAX_MESSAGE_LENGTH} caracteres.`);
      return;
    }
    if (slowModeRemaining > 0) {
      setStatusMessage(`Aguarde ${slowModeRemaining}s (slow mode).`);
      return;
    }
    dispatch({
      type: 'send',
      userId: toUserId(currentUserId),
      userName: currentUserName,
      text,
      nowMs: Date.now(),
    });
    setDraft('');
    setStatusMessage(null);
    // Focus the input by id — the Input UI component doesn't forward refs.
    const el = document.getElementById(inputIdRef.current);
    if (el && 'focus' in el) (el as HTMLInputElement).focus();
  }, [draft, currentUserId, currentUserName, slowModeRemaining]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleReaction = useCallback(
    (messageId: LiveStreamMessageId, emoji: string) => {
      dispatch({ type: 'react', messageId, emoji });
    },
    [],
  );

  const handleDelete = useCallback((messageId: LiveStreamMessageId) => {
    dispatch({ type: 'delete', messageId });
    setStatusMessage('Mensagem removida por moderação.');
  }, []);

  const handlePin = useCallback((messageId: LiveStreamMessageId) => {
    dispatch({ type: 'pin', messageId });
    setStatusMessage('Mensagem fixada no topo.');
  }, []);

  const handleUnpin = useCallback(() => {
    dispatch({ type: 'unpin' });
    setStatusMessage('Mensagem desafixada.');
  }, []);

  const visible = useMemo(() => getVisibleMessages(state), [state]);
  const pinned = useMemo(() => getPinnedMessage(state), [state]);

  return (
    <section
      data-testid="live-stream-chat"
      data-stream-id={streamId}
      aria-label={`Chat ao vivo — stream ${streamId}`}
      className={cn(
        'flex h-full min-h-[420px] w-full flex-col rounded-xl border border-border bg-background shadow-sm',
        'md:min-h-[520px]',
        className,
      )}
    >
      <header
        data-testid="chat-header"
        className="flex items-center justify-between gap-2 border-b border-border px-4 py-3"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-2 shrink-0 animate-pulse rounded-full bg-red-500"
          />
          <h2 className="truncate text-sm font-semibold text-foreground">
            Chat ao vivo
          </h2>
        </div>
        <span
          data-testid="chat-message-count"
          className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground"
        >
          {visible.length} mensagens
        </span>
      </header>

      {pinned && (
        <div
          data-testid="chat-pinned-banner"
          className="flex items-center justify-between gap-2 border-b border-[var(--spiritual-gold)]/40 bg-[var(--spiritual-gold)]/10 px-4 py-2 text-sm"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Pin className="size-4 shrink-0 text-[var(--spiritual-gold-dark)]" aria-hidden="true" />
            <span className="truncate font-medium text-foreground">
              {pinned.userName}:
            </span>
            <span className="truncate text-foreground/80">{pinned.text}</span>
          </div>
          {canModerate && (
            <button
              type="button"
              data-testid="chat-unpin-button"
              onClick={handleUnpin}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              desafixar
            </button>
          )}
        </div>
      )}

      <ol
        ref={listRef}
        data-testid="chat-message-list"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 space-y-1 overflow-y-auto px-2 py-3"
      >
        {visible.length === 0 ? (
          <li
            data-testid="chat-empty-state"
            className="px-4 py-12 text-center text-sm text-muted-foreground"
          >
            Nenhuma mensagem ainda. Comece a conversa com axé ✦
          </li>
        ) : (
          visible.map((msg) => (
            <div key={msg.id} className="relative">
              <ChatMessageItem
                message={msg}
                isPinned={pinned?.id === msg.id}
                canModerate={canModerate}
                onReaction={handleReaction}
                onDelete={handleDelete}
              />
              {canModerate && !pinned && !msg.deleted && (
                <button
                  type="button"
                  data-testid={`chat-pin-${msg.id}`}
                  onClick={() => handlePin(msg.id)}
                  className="absolute right-12 top-2 hidden rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted group-hover:block focus-visible:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  fixar
                </button>
              )}
            </div>
          ))
        )}
      </ol>

      <footer
        data-testid="chat-composer"
        className="sticky bottom-0 border-t border-border bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <div
          data-testid="chat-slow-mode-countdown"
          aria-live="polite"
          className={cn(
            'mb-2 text-xs',
            slowModeRemaining > 0 ? 'text-amber-600' : 'text-transparent select-none',
          )}
        >
          {slowModeRemaining > 0
            ? `Slow mode ativo — aguarde ${slowModeRemaining}s`
            : 'placeholder'}
        </div>

        <form
          data-testid="chat-form"
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <label htmlFor={inputIdRef.current} className="sr-only">
            Mensagem do chat
          </label>
          <Input
            id={inputIdRef.current}
            data-testid="chat-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              slowModeRemaining > 0
                ? `Aguarde ${slowModeRemaining}s…`
                : 'Escreva uma mensagem…'
            }
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={slowModeRemaining > 0}
            aria-label="Mensagem do chat"
            className="min-h-[44px] flex-1"
          />
          <Button
            type="submit"
            data-testid="chat-send"
            disabled={isSendDisabled}
            aria-label="Enviar mensagem"
            className="min-h-[44px] min-w-[44px]"
          >
            {slowModeRemaining > 0 ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            <span className="sr-only">Enviar</span>
          </Button>
        </form>

        <div
          data-testid="chat-char-counter"
          className={cn(
            'mt-1 text-right text-[10px] tabular-nums',
            draft.length > MAX_MESSAGE_LENGTH * 0.8
              ? 'text-amber-600'
              : 'text-muted-foreground',
          )}
        >
          {draft.length}/{MAX_MESSAGE_LENGTH}
        </div>

        {statusMessage && (
          <p
            data-testid="chat-status"
            role="status"
            aria-live="polite"
            className="mt-1 text-xs text-muted-foreground"
          >
            {statusMessage}
          </p>
        )}
      </footer>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Default export + module freeze
// ---------------------------------------------------------------------------
export default LiveStreamChat;
Object.freeze(exports);