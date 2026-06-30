'use client';

// ============================================================================
// LiveStreamReactionsDemo — standalone client-side demo for W90-B.
//
// Holds:
//   - A synthetic message stream (not W89-A's chat engine — see note in page.tsx).
//   - The W90-B reactions state.
//
// `MessageReactions` is wired via props. `EmojiPicker` opens from the "+"
// button. Toggle goes through `toggleReaction` so the user can both add and
// remove their own reactions.
//
// LGPD-friendly: no PII is captured; reactions are anonymous from the engine's
// POV (the `userId` is a synthetic session id supplied by the parent route).
// ============================================================================

import React, { useCallback, useMemo, useState } from 'react';

import { MessageReactions } from '@/components/community/MessageReactions';
import {
  addReaction as engineAddReaction,
  createInitialReactionsState,
  getReactionsForMessage,
  hasUserReacted,
  serializeReactions,
  toggleReaction as engineToggleReaction,
  type LiveStreamMessageId,
  type PositiveEmoji,
  type Reaction,
  type ReactionsState,
} from '@/lib/w90/live-stream-reactions';

export interface LiveStreamReactionsDemoProps {
  readonly streamId: string;
  readonly userId: string;
  readonly userName: string;
  readonly isModerator: boolean;
}

/** A synthetic message — stand-in for W89-A's `LiveStreamMessage`. */
export interface DemoMessage {
  readonly id: LiveStreamMessageId;
  readonly userName: string;
  readonly text: string;
  readonly createdAt: number;
}

const STORAGE_PREFIX = 'live-reactions:';
const STORAGE_DRAFT_PREFIX = 'live-draft:';

const SEED_MESSAGES: ReadonlyArray<{ userName: string; text: string }> = [
  { userName: 'Yara do Cipó', text: 'Que a paz do Axé esteja com cada um de vocês 🙏' },
  { userName: 'Mestre Ramiro', text: 'Mesa Real está pronta para a consulta de hoje ✨' },
  { userName: 'Mãe Iara', text: 'Que o fogo sagrado aqueça nossos caminhos 🔥' },
];

function loadPersisted(streamId: string): ReactionsState {
  if (typeof window === 'undefined') return createInitialReactionsState();
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${streamId}`);
    if (!raw) return createInitialReactionsState();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return createInitialReactionsState();
    }
    return deserializeLite(parsed);
  } catch {
    return createInitialReactionsState();
  }
}

function persist(streamId: string, state: ReactionsState): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = serializeReactions(state);
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${streamId}`,
      JSON.stringify(serialized),
    );
  } catch {
    // ignore quota errors — the demo is best-effort.
  }
}

/**
 * Lightweight deserializer: avoids importing the full deserialize helper to
 * keep this client bundle focused. We re-validate at runtime.
 */
function deserializeLite(raw: unknown): ReactionsState {
  if (!raw || typeof raw !== 'object') return createInitialReactionsState();
  const obj = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const entry = obj[key] as Record<string, unknown> | null;
    if (!entry || typeof entry !== 'object') continue;
    const messageId = entry.messageId;
    const lastReactedAt = entry.lastReactedAt;
    const reactions = entry.reactions;
    if (typeof messageId !== 'string') continue;
    if (typeof lastReactedAt !== 'number') continue;
    if (!Array.isArray(reactions)) continue;
    const safeReactions: Reaction[] = [];
    for (const r of reactions) {
      if (!r || typeof r !== 'object') continue;
      const rr = r as Record<string, unknown>;
      if (typeof rr.emoji !== 'string') continue;
      if (typeof rr.count !== 'number') continue;
      if (!(rr.userIds instanceof Set)) continue;
      safeReactions.push({
        emoji: rr.emoji as PositiveEmoji,
        count: rr.count,
        userIds: rr.userIds as unknown as ReadonlySet<string>,
      } as unknown as Reaction);
    }
    out[key] = {
      messageId,
      lastReactedAt,
      reactions: safeReactions,
    };
  }
  return out as unknown as ReactionsState;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function LiveStreamReactionsDemo({
  streamId,
  userId,
  userName,
  isModerator: _isModerator,
}: LiveStreamReactionsDemoProps): React.ReactElement {
  const [reactionsState, setReactionsState] = useState<ReactionsState>(() =>
    loadPersisted(streamId),
  );
  const [messages, setMessages] = useState<ReadonlyArray<DemoMessage>>(() => {
    const now = Date.now();
    return SEED_MESSAGES.map((m, i) => ({
      id: `msg_seed_${streamId}_${i}` as LiveStreamMessageId,
      userName: m.userName,
      text: m.text,
      createdAt: now - (SEED_MESSAGES.length - i) * 60_000,
    }));
  });
  const [draft, setDraft] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(`${STORAGE_DRAFT_PREFIX}${streamId}`) ?? '';
  });

  // Persist reactions whenever they change.
  React.useEffect(() => {
    persist(streamId, reactionsState);
  }, [streamId, reactionsState]);

  // Persist draft.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`${STORAGE_DRAFT_PREFIX}${streamId}`, draft);
    } catch {
      // ignore
    }
  }, [streamId, draft]);

  const handleSend = useCallback((): void => {
    const text = draft.trim();
    if (!text) return;
    const newMessage: DemoMessage = {
      id: `msg_user_${streamId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` as LiveStreamMessageId,
      userName,
      text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setDraft('');
  }, [draft, streamId, userName]);

  const handleToggleReaction = useCallback(
    (messageId: LiveStreamMessageId, emoji: PositiveEmoji): void => {
      const result = engineToggleReaction(
        reactionsState,
        messageId,
        userId as unknown as Parameters<typeof engineToggleReaction>[2],
        emoji,
        Date.now(),
      );
      setReactionsState(result.state);
    },
    [reactionsState, userId],
  );

  const handleAddReaction = useCallback(
    (messageId: LiveStreamMessageId, emoji: string): void => {
      // Validate at the boundary — only positive emojis.
      const result = engineAddReaction(
        reactionsState,
        messageId,
        userId as unknown as Parameters<typeof engineAddReaction>[2],
        emoji,
        Date.now(),
      );
      setReactionsState(result.state);
    },
    [reactionsState, userId],
  );

  // Compute global counters for the footer.
  const totalReactions = useMemo<number>(() => {
    let total = 0;
    for (const key of Object.keys(reactionsState)) {
      const bucket = reactionsState[key];
      if (!bucket) continue;
      for (const r of bucket.reactions) {
        total += r.count;
      }
    }
    return total;
  }, [reactionsState]);

  const messagesWithReactions = useMemo<number>(() => {
    let n = 0;
    for (const key of Object.keys(reactionsState)) {
      const bucket = reactionsState[key];
      if (bucket && bucket.reactions.length > 0) n++;
    }
    return n;
  }, [reactionsState]);

  const myReactedMessageCount = useMemo<number>(() => {
    let n = 0;
    for (const key of Object.keys(reactionsState)) {
      const bucket = reactionsState[key];
      if (!bucket) continue;
      // crude: any reaction I authored → +1 to counter
      for (const r of bucket.reactions) {
        if (r.userIds.has(userId as unknown as never)) {
          n++;
          break;
        }
      }
    }
    return n;
  }, [reactionsState, userId]);

  // Quick check helper for the footer.
  const checkHasReacted = useCallback(
    (messageId: LiveStreamMessageId, emoji: PositiveEmoji): boolean => {
      return hasUserReacted(reactionsState, messageId, userId as unknown as never, emoji);
    },
    [reactionsState, userId],
  );

  return (
    <div
      data-testid="live-reactions-demo"
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3"
    >
      <div
        data-testid="chat-composer"
        className="flex items-center gap-2 rounded-md border border-border bg-background p-2"
      >
        <input
          type="text"
          data-testid="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escreva uma mensagem…"
          className="min-h-[44px] flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Mensagem do chat"
        />
        <button
          type="button"
          data-testid="chat-send"
          onClick={handleSend}
          className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Enviar
        </button>
      </div>

      <ul
        data-testid="chat-list"
        role="list"
        aria-label="Mensagens da live"
        className="flex flex-col gap-1"
      >
        {messages.map((m: DemoMessage) => {
          const bucket = getReactionsForMessage(reactionsState, m.id, Date.now());
          const projectedReactions: ReadonlyArray<Reaction> = bucket.reactions;
          return (
            <li
              key={m.id}
              data-testid={`demo-message-${m.id}`}
              className="flex flex-col gap-0.5 rounded-lg border border-transparent px-3 py-2 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span
                    data-testid="demo-message-author"
                    className="truncate text-sm font-semibold text-foreground"
                  >
                    {m.userName}
                  </span>
                  <span
                    data-testid="demo-message-time"
                    className="shrink-0 text-xs tabular-nums text-muted-foreground"
                  >
                    {formatTime(m.createdAt)}
                  </span>
                </div>
              </div>
              <p
                data-testid="demo-message-body"
                className="break-words text-sm leading-relaxed text-foreground/90"
              >
                {m.text}
              </p>
              <div className="mt-1">
                <MessageReactions
                  messageId={m.id}
                  currentUserId={userId as unknown as never}
                  reactions={projectedReactions}
                  onToggle={(emoji) => handleToggleReaction(m.id, emoji)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <footer
        data-testid="live-reactions-footer"
        className="border-t border-border pt-2 text-[10px] text-muted-foreground"
      >
        W90-B · {messagesWithReactions} mensagens com reações · {totalReactions}{' '}
        reações totais · você reagiu em {myReactedMessageCount} mensagens ·
        check 🙏: {String(checkHasReacted(messages[0]?.id ?? ('' as LiveStreamMessageId), '🙏'))}
      </footer>
    </div>
  );
}