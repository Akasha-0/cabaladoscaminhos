'use client';

// ============================================================================
// LiveStreamChatExt — W90s-A main chat panel (extends W89-A)
//
// Wraps the W90s-A engine (live-stream-chat-ext.ts) into a React component.
// Owns a local `LiveStreamChatExtState`. The component is *pure additive* —
// it does NOT require a backend. Production wiring would:
//   1. Subscribe to an SSE stream and dispatch `appendMessage` etc.
//   2. POST each user action to `/api/live-ext/[id]/chat` and let the
//      server echo it back through the same SSE channel.
//
// What this adds over W89-A's LiveStreamChat:
//   - ReactionPicker (5 canonical emojis) inline per message
//   - ViewerCount badge at the top
//   - ModerationMenu (mute / hide) inline per message for moderators
//   - "r" keyboard shortcut to open reaction picker on focused message
//   - Hidden messages render as "[mensagem oculta pela moderação]"
//
// Mobile-first:
//   - Bottom-sheet style composer
//   - Touch targets ≥ 44px
//   - Reduced motion respected
//
// ARIA:
//   - `<section role="log" aria-live="polite">` on message list
//   - role="region" on root
//   - aria-label on input + status regions
//
// data-testid (for source-inspection):
//   - live-stream-chat-ext (root)
//   - chat-message-{id}
//   - chat-reaction-{emoji}
//   - chat-moderation-{id}
// ============================================================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

import {
  W90S_REACTION_EMOJIS,
  addReaction,
  appendMessage,
  autoRestoreExpiredHides,
  createInitialExtState,
  decrementViewerCount,
  getMuteEntry,
  hideMessage,
  incrementViewerCount,
  isUserMuted,
  muteUser,
  removeReaction,
  setViewerCount,
  toggleReaction,
  undoHideMessage,
  unmuteUser,
  getVisibleExtMessages,
} from '@/lib/w90s/live-stream-chat-ext';
import type { LiveStreamChatExtState } from '@/lib/w90s/live-stream-chat-ext';
import { toMessageId, toStreamId, toUserId } from '@/lib/w89/live-stream-chat';
import type {
  LiveStreamMessageId,
  LiveStreamId,
  UserId,
} from '@/lib/w89/live-stream-chat';

import { LiveStreamReactionPicker as ReactionPicker } from './LiveStreamReactionPicker';
import { ViewerCount } from './ViewerCount';
import { ModerationMenu } from './ModerationMenu';

// ---------------------------------------------------------------------------
// Reducer — wraps engine mutators into React-friendly dispatch
// ---------------------------------------------------------------------------
type Action =
  | { type: 'append'; input: Parameters<typeof appendMessage>[1] }
  | {
      type: 'react';
      messageId: LiveStreamMessageId;
      emoji: string;
    }
  | {
      type: 'unreact';
      messageId: LiveStreamMessageId;
      emoji: string;
    }
  | {
      type: 'toggle-react';
      messageId: LiveStreamMessageId;
      emoji: string;
    }
  | {
      type: 'mute';
      userId: UserId;
      moderatorId: UserId;
      reason: string;
      nowMs: number;
    }
  | { type: 'unmute'; userId: UserId; nowMs: number }
  | {
      type: 'hide';
      messageId: LiveStreamMessageId;
      moderatorId: UserId;
      nowMs: number;
    }
  | { type: 'undo-hide'; messageId: LiveStreamMessageId; nowMs: number }
  | { type: 'viewer-in'; delta?: number; nowMs?: number }
  | { type: 'viewer-out'; delta?: number; nowMs?: number }
  | { type: 'viewer-set'; count: number; nowMs?: number }
  | { type: 'tick'; nowMs: number };

function reducer(state: LiveStreamChatExtState, action: Action): LiveStreamChatExtState {
  switch (action.type) {
    case 'append': {
      const r = appendMessage(state, action.input);
      return r.state;
    }
    case 'react': {
      const r = addReaction(state, action.messageId, action.emoji, Date.now());
      return r.state;
    }
    case 'unreact': {
      const r = removeReaction(state, action.messageId, action.emoji, Date.now());
      return r.state;
    }
    case 'toggle-react': {
      const r = toggleReaction(state, action.messageId, action.emoji, Date.now());
      return r.state;
    }
    case 'mute': {
      const r = muteUser(state, {
        userId: action.userId,
        moderatorId: action.moderatorId,
        reason: action.reason,
        nowMs: action.nowMs,
      });
      return r.state;
    }
    case 'unmute': {
      return unmuteUser(state, action.userId, action.nowMs);
    }
    case 'hide': {
      const r = hideMessage(state, {
        messageId: action.messageId,
        moderatorId: action.moderatorId,
        nowMs: action.nowMs,
      });
      return r.state;
    }
    case 'undo-hide': {
      const r = undoHideMessage(state, action.messageId, action.nowMs);
      return r.state;
    }
    case 'viewer-in': {
      return incrementViewerCount(state, action.delta ?? 1, action.nowMs ?? Date.now());
    }
    case 'viewer-out': {
      return decrementViewerCount(state, action.delta ?? 1, action.nowMs ?? Date.now());
    }
    case 'viewer-set': {
      return setViewerCount(state, action.count, action.nowMs ?? Date.now());
    }
    case 'tick': {
      return autoRestoreExpiredHides(state, action.nowMs);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtTime(ms: number): string {
  try {
    return new Date(ms).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function totalReactions(m: {
  reactions: ReadonlyArray<{ count: number }>;
}): number {
  return m.reactions.reduce((sum, r) => sum + r.count, 0);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export interface LiveStreamChatExtProps {
  readonly streamId: LiveStreamId;
  readonly currentUserId: UserId;
  readonly currentUserName: string;
  readonly isModerator?: boolean;
  /** Initial viewer count for hydration. Default 0. */
  readonly initialViewerCount?: number;
  /** Seed messages (e.g. from SSR). */
  readonly initialMessages?: ReadonlyArray<{
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: number;
  }>;
  readonly className?: string;
}

export function LiveStreamChatExt({
  streamId,
  currentUserId,
  currentUserName,
  isModerator = false,
  initialViewerCount = 0,
  initialMessages = [],
  className,
}: LiveStreamChatExtProps) {
  // Build initial state from props
  const initialState = useMemo(() => {
    let s = createInitialExtState({
      streamId,
      viewerCount: initialViewerCount,
      nowMs: Date.now(),
    });
    for (const m of initialMessages) {
      const r = appendMessage(s, {
        id: toMessageId(m.id),
        streamId,
        userId: toUserId(m.userId),
        userName: m.userName,
        text: m.text,
        createdAt: m.createdAt,
      });
      s = r.state;
    }
    return s;
  }, [streamId, initialViewerCount, initialMessages]);

  const [state, dispatch] = useReducer(reducer, initialState);
  const [composer, setComposer] = useState('');
  const [status, setStatus] = useState<string>('');
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);

  const visible = useMemo(() => getVisibleExtMessages(state, 100), [state]);
  const muted = useMemo(
    () => isUserMuted(state, currentUserId, Date.now()),
    [state, currentUserId],
  );
  const muteEntry = useMemo(
    () => getMuteEntry(state, currentUserId, Date.now()),
    [state, currentUserId],
  );

  // Tick every 30s to auto-restore expired hides
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick', nowMs: Date.now() });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Simulated viewer drift for demo (in production this comes from the SSE channel)
  useEffect(() => {
    const id = setInterval(() => {
      const delta = Math.random() > 0.5 ? 1 : -1;
      if (delta > 0) dispatch({ type: 'viewer-in', delta: 1 });
      else dispatch({ type: 'viewer-out', delta: 1 });
    }, 8_000);
    return () => clearInterval(id);
  }, []);

  const handleSend = useCallback(() => {
    const text = composer.trim();
    if (text.length === 0) {
      setStatus('Escreva algo antes de enviar.');
      return;
    }
    if (text.length > 500) {
      setStatus('Mensagem muito longa (limite 500 caracteres).');
      return;
    }
    if (muted) {
      setStatus(muteEntry?.reason ?? 'Você está silenciado(a) e não pode enviar mensagens.');
      return;
    }
    const now = Date.now();
    const id = toMessageId(`msg_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`);
    dispatch({
      type: 'append',
      input: {
        id,
        streamId,
        userId: currentUserId,
        userName: currentUserName,
        text,
        createdAt: now,
      },
    });
    setComposer('');
    setStatus('');
    composerRef.current?.focus();
  }, [composer, muted, muteEntry, streamId, currentUserId, currentUserName]);

  const handleToggleReact = useCallback((msgId: LiveStreamMessageId, emoji: string) => {
    dispatch({ type: 'toggle-react', messageId: msgId, emoji });
  }, []);

  const handleMute = useCallback(
    (userId: UserId, reason: string) => {
      if (!isModerator) return;
      dispatch({
        type: 'mute',
        userId,
        moderatorId: currentUserId,
        reason,
        nowMs: Date.now(),
      });
      setStatus(`Usuário silenciado: ${reason}`);
    },
    [isModerator, currentUserId],
  );

  const handleHide = useCallback(
    (msgId: LiveStreamMessageId) => {
      if (!isModerator) return;
      dispatch({
        type: 'hide',
        messageId: msgId,
        moderatorId: currentUserId,
        nowMs: Date.now(),
      });
      setStatus('Mensagem ocultada pela moderação.');
    },
    [isModerator, currentUserId],
  );

  const handleUndoHide = useCallback(
    (msgId: LiveStreamMessageId) => {
      if (!isModerator) return;
      dispatch({ type: 'undo-hide', messageId: msgId, nowMs: Date.now() });
      setStatus('Ocultação desfeita.');
    },
    [isModerator],
  );

  // Keyboard: 'r' on focused message opens reaction picker
  const handleMessageKeyDown = useCallback(
    (
      ev: React.KeyboardEvent<HTMLLIElement>,
      msgId: LiveStreamMessageId,
      pickerId: string,
    ) => {
      if (ev.key === 'r' && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault();
        if (typeof document !== 'undefined') {
          const el = document.getElementById(pickerId);
          el?.focus();
          el?.click();
        }
      }
    },
    [],
  );

  // Reduced motion preference
  const motionClass = 'motion-safe:animate-in motion-safe:fade-in';

  return (
    <section
      role="region"
      aria-label={`Chat ao vivo — ${currentUserName}`}
      data-testid="live-stream-chat-ext"
      className={cn(
        'flex flex-col h-full min-h-[400px]',
        'bg-card text-card-foreground',
        'rounded-lg border border-border overflow-hidden',
        className,
      )}
    >
      {/* Header: viewer count */}
      <header className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-sm font-semibold">Chat ao vivo</h2>
        <ViewerCount count={state.viewerCount} peakCount={state.peakViewerCount} />
      </header>

      {/* Status banner (aria-live) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="chat-status"
        className={cn(
          'px-3 py-2 text-xs',
          status ? 'bg-muted text-foreground' : 'sr-only',
        )}
      >
        {status || ''}
      </div>

      {/* Message list */}
      <ol
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Mensagens do chat"
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {visible.length === 0 && (
          <li className="text-sm text-muted-foreground text-center py-8">
            Nenhuma mensagem ainda. Comece a conversa!
          </li>
        )}
        {visible.map((m) => {
          const isMine = (m.userId as unknown as string) === (currentUserId as unknown as string);
          const pickerId = `picker-${(m.id as unknown as string).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
          const total = totalReactions(m);
          return (
            <li
              key={m.id as unknown as string}
              tabIndex={0}
              onKeyDown={(ev) => handleMessageKeyDown(ev, m.id, pickerId)}
              data-testid={`chat-message-${m.id as unknown as string}`}
              aria-label={`Mensagem de ${m.userName}${total > 0 ? `, ${total} reações` : ''}`}
              className={cn(
                'group rounded-md p-2',
                'hover:bg-muted/50 focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring',
                motionClass,
                isMine && 'bg-primary/5',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm truncate">{m.userName}</span>
                    <span className="text-xs text-muted-foreground">{fmtTime(m.createdAt)}</span>
                  </div>
                  {m.hidden ? (
                    <p
                      className="mt-1 text-sm italic text-muted-foreground"
                      data-testid={`chat-message-hidden-${m.id as unknown as string}`}
                    >
                      [mensagem oculta pela moderação]
                      {isModerator && (
                        <button
                          type="button"
                          onClick={() => handleUndoHide(m.id)}
                          data-testid={`chat-message-undo-hide-${m.id as unknown as string}`}
                          className="ml-2 text-xs underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
                        >
                          Desfazer
                        </button>
                      )}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm whitespace-pre-wrap break-words">{m.text}</p>
                  )}
                </div>

                {isModerator && !m.hidden && (
                  <ModerationMenu
                    id={`mod-${(m.id as unknown as string).replace(/[^a-zA-Z0-9_-]/g, '_')}`}
                    onMute={(reason) => handleMute(m.userId, reason)}
                    onHide={() => handleHide(m.id)}
                    alreadyMuted={isUserMuted(state, m.userId, Date.now())}
                    data-testid={`chat-moderation-${m.id as unknown as string}`}
                  />
                )}
              </div>

              {/* Reactions row */}
              <div className="mt-1 flex items-center gap-1 flex-wrap">
                {m.reactions.map((r) => (
                  <button
                    key={r.emoji}
                    type="button"
                    onClick={() => handleToggleReact(m.id, r.emoji)}
                    aria-label={`Reação ${r.emoji}, contagem ${r.count}`}
                    aria-pressed={false}
                    data-testid={`chat-reaction-${r.emoji}`}
                    className={cn(
                      'inline-flex items-center gap-1',
                      'min-h-[32px] px-2 py-0.5 rounded-full',
                      'bg-muted hover:bg-muted/70',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'text-xs',
                    )}
                  >
                    <span aria-hidden="true">{r.emoji}</span>
                    <span>{r.count}</span>
                  </button>
                ))}
                <ReactionPicker
                  id={pickerId}
                  onSelect={(emoji) => handleToggleReact(m.id, emoji)}
                  selectedEmojis={m.reactions.map((r) => r.emoji)}
                  disabled={muted}
                  label={`Reagir à mensagem de ${m.userName}`}
                />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Composer */}
      <footer className="border-t border-border p-3">
        {muted && (
          <p
            role="alert"
            data-testid="chat-muted-banner"
            className="mb-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 rounded px-2 py-1"
          >
            {muteEntry?.reason ?? 'Você está silenciado(a) e não pode enviar mensagens.'}
          </p>
        )}
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <label htmlFor="chat-composer" className="sr-only">
            Mensagem do chat
          </label>
          <textarea
            id="chat-composer"
            ref={composerRef}
            value={composer}
            onChange={(ev) => setComposer(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' && !ev.shiftKey) {
                ev.preventDefault();
                handleSend();
              }
            }}
            disabled={muted}
            placeholder={muted ? 'Você está silenciado(a)' : 'Escreva uma mensagem…'}
            rows={2}
            maxLength={500}
            aria-label="Mensagem do chat"
            data-testid="chat-composer"
            className={cn(
              'flex-1 resize-none',
              'min-h-[44px] max-h-32 px-3 py-2 rounded-md',
              'border border-input bg-background',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          />
          <button
            type="submit"
            disabled={muted || composer.trim().length === 0}
            data-testid="chat-send"
            className={cn(
              'min-h-[44px] px-4 rounded-md text-sm font-semibold',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            Enviar
          </button>
        </form>
      </footer>
    </section>
  );
}

export default LiveStreamChatExt;

// Suppress unused-import warning for streamId/toStreamId reference pattern
void toStreamId;
void W90S_REACTION_EMOJIS;