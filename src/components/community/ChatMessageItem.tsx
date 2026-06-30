'use client';

// ============================================================================
// ChatMessageItem — single chat message row
//
// Used by `LiveStreamChat` to render each visible message. This component is
// presentation-only: all state lives in the parent.
//
// Mobile-first:
//   - Touch targets ≥ 44px (delete button is `min-h-[44px] min-w-[44px]`).
//   - Reactions wrap, never overflow.
//   - Pinned message has a left border + gold accent + bg highlight.
//
// data-testid attrs (for source-inspection spec):
//   - `chat-message` on the outer <li>
//   - `chat-message-{id}` for unique targeting
//   - `chat-message-reaction-{emoji}` on each reaction chip
//   - `chat-message-delete` on the moderator delete button
// ============================================================================

import React, { memo } from 'react';
import { Pin, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { LiveStreamMessage } from '@/lib/w89/live-stream-chat';

export interface ChatMessageItemProps {
  readonly message: LiveStreamMessage;
  readonly isPinned: boolean;
  readonly canModerate: boolean;
  readonly onReaction?: (messageId: LiveStreamMessage['id'], emoji: string) => void;
  readonly onDelete?: (messageId: LiveStreamMessage['id']) => void;
  readonly className?: string;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  // HH:MM (24h) — locale-stable for source-inspection
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

const PIN_REACTIONS = ['🙏', '✨', '🪶'] as const;

function ChatMessageItemImpl({
  message,
  isPinned,
  canModerate,
  onReaction,
  onDelete,
  className,
}: ChatMessageItemProps) {
  if (message.deleted) {
    return (
      <li
        data-testid={`chat-message-${message.id}`}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-xs italic text-muted-foreground',
          className,
        )}
      >
        <span data-testid="chat-message-deleted-marker">[mensagem removida]</span>
      </li>
    );
  }

  return (
    <li
      data-testid={`chat-message-${message.id}`}
      className={cn(
        'group flex flex-col gap-1 rounded-lg border border-transparent px-3 py-2 transition-colors',
        'hover:bg-muted/40',
        isPinned &&
          'border-l-4 border-[var(--spiritual-gold)] bg-[var(--spiritual-gold-muted)]/30',
        className,
      )}
      aria-label={`Mensagem de ${message.userName}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span
            data-testid="chat-message-author"
            className="truncate text-sm font-semibold text-foreground"
          >
            {message.userName}
          </span>
          <span
            data-testid="chat-message-time"
            className="shrink-0 text-xs tabular-nums text-muted-foreground"
          >
            {formatTime(message.createdAt)}
          </span>
          {isPinned && (
            <span
              data-testid="chat-message-pinned-badge"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--spiritual-gold)]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--spiritual-gold-dark)]"
            >
              <Pin className="size-3" aria-hidden="true" />
              Fixada
            </span>
          )}
        </div>

        {canModerate && (
          <button
            type="button"
            data-testid="chat-message-delete"
            aria-label="Apagar mensagem"
            className={cn(
              'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md',
              'text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            onClick={() => onDelete?.(message.id)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <p
        data-testid="chat-message-body"
        className="break-words text-sm leading-relaxed text-foreground/90"
      >
        {message.text}
      </p>

      <div
        data-testid="chat-message-reactions"
        className="flex flex-wrap items-center gap-1.5 pt-1"
      >
        {PIN_REACTIONS.map((emoji) => {
          const reaction = message.reactions.find((r) => r.emoji === emoji);
          const count = reaction?.count ?? 0;
          return (
            <button
              key={emoji}
              type="button"
              data-testid={`chat-message-reaction-${emoji}`}
              aria-label={`Reagir com ${emoji}`}
              onClick={() => onReaction?.(message.id, emoji)}
              className={cn(
                'inline-flex min-h-[28px] items-center gap-1 rounded-full border border-border bg-background px-2 text-xs transition-colors',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                count > 0 && 'border-[var(--spiritual-gold)]/60 bg-[var(--spiritual-gold)]/10',
              )}
            >
              <span aria-hidden="true">{emoji}</span>
              {count > 0 && (
                <span data-testid={`chat-message-reaction-count-${emoji}`} className="tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Show non-pinned reactions that already have counts */}
        {message.reactions
          .filter((r) => !(PIN_REACTIONS as readonly string[]).includes(r.emoji))
          .map((r) => (
            <span
              key={r.emoji}
              data-testid={`chat-message-reaction-${r.emoji}`}
              className="inline-flex min-h-[28px] items-center gap-1 rounded-full border border-border bg-muted/40 px-2 text-xs"
            >
              <span aria-hidden="true">{r.emoji}</span>
              <span className="tabular-nums">{r.count}</span>
            </span>
          ))}
      </div>
    </li>
  );
}

export const ChatMessageItem = memo(ChatMessageItemImpl);
ChatMessageItem.displayName = 'ChatMessageItem';

// ---------------------------------------------------------------------------
// exports frozen for safety
// ---------------------------------------------------------------------------
export default ChatMessageItem;
Object.freeze(exports);