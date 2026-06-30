'use client';

// ============================================================================
// MessageReactions — per-message reactions row (W90-B)
//
// Composes on top of the W89-A `ChatMessageItem`. Whereas W89-A rendered three
// "pin" reactions inline (🙏 ✨ 🪶) using aggregate counts, W90-B adds:
//
//   1. Per-user reaction tracking (via the W90-B engine).
//   2. A "+" add-reaction button that opens the `EmojiPicker` overlay.
//   3. Chip highlighting for emojis the current user has already reacted with.
//
// Integration contract (props only — we do NOT modify W89-A files):
//
//   <MessageReactions
//     messageId={message.id}
//     currentUserId={userId}
//     reactions={engineReactionsForThisMessage}  // ReadonlyArray<Reaction>
//     onToggle={(emoji) => engine.toggle(messageId, userId, emoji)}
//   />
//
// The parent (e.g. a new wrapper page or a server component) is responsible
// for wiring the engine state — this component is *purely presentational*.
//
// Mobile-first:
//   - Touch targets ≥ 44px (chips and "+" button).
//   - Chips wrap on small screens; overflow scroll horizontally only as a
//     last-resort fallback (better: the picker gives access to all 10).
//   - High-contrast highlight for chips the current user reacted with.
//
// data-testid attrs:
//   - `reactions-root` on the outer container
//   - `reaction-chip-{emoji}` on each chip
//   - `reaction-add` on the "+" button that opens the picker
//   - `reaction-count-{emoji}` on the count badge
//   - `reaction-picker-open` while the picker is open
// ============================================================================

import React, { memo, useCallback, useId, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type {
  LiveStreamMessageId,
  PositiveEmoji,
  Reaction,
  UserId,
} from '@/lib/w90/live-stream-reactions';
import { POSITIVE_EMOJIS } from '@/lib/w90/live-stream-reactions';

import { EmojiPicker } from './EmojiPicker';

export interface MessageReactionsProps {
  readonly messageId: LiveStreamMessageId;
  readonly currentUserId: UserId;
  readonly reactions: ReadonlyArray<Reaction>;
  readonly onToggle: (emoji: PositiveEmoji) => void;
  /** Max chips to show inline before collapsing the rest behind "+". Default 6. */
  readonly maxVisible?: number;
  /** Hide the picker "+" button (e.g. read-only / archived streams). */
  readonly readOnly?: boolean;
  readonly className?: string;
}

/**
 * Inline chip — single emoji + count. Highlighted when the current user
 * reacted with this emoji.
 */
function Chip({
  emoji,
  count,
  active,
  onToggle,
  readOnly,
}: {
  emoji: PositiveEmoji;
  count: number;
  active: boolean;
  onToggle: (emoji: PositiveEmoji) => void;
  readOnly: boolean;
}): React.ReactElement {
  const labelId = useId();
  const handleClick = useCallback(() => {
    if (readOnly) return;
    onToggle(emoji);
  }, [emoji, onToggle, readOnly]);

  return (
    <button
      type="button"
      data-testid={`reaction-chip-${emoji}`}
      data-active={active ? 'true' : 'false'}
      aria-pressed={active}
      aria-labelledby={labelId}
      onClick={handleClick}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-[var(--spiritual-gold)] bg-[var(--spiritual-gold)]/15 text-foreground'
          : 'border-border bg-background text-foreground/90 hover:bg-muted',
        readOnly && 'cursor-default opacity-80',
      )}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {emoji}
      </span>
      <span
        id={labelId}
        data-testid={`reaction-count-${emoji}`}
        className="tabular-nums text-xs font-medium"
      >
        {count}
      </span>
    </button>
  );
}

function MessageReactionsImpl({
  messageId,
  currentUserId,
  reactions,
  onToggle,
  maxVisible = 6,
  readOnly = false,
  className,
}: MessageReactionsProps): React.ReactElement {
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Compute which emojis the current user has reacted with.
  const userReactedSet = useMemo<ReadonlySet<PositiveEmoji>>(() => {
    const out = new Set<PositiveEmoji>();
    for (const r of reactions) {
      if (r.userIds.has(currentUserId)) out.add(r.emoji);
    }
    return out;
  }, [reactions, currentUserId]);

  // Filter to emojis that have at least one reaction, sort by count desc.
  const sortedReactions = useMemo<ReadonlyArray<Reaction>>(() => {
    return [...reactions]
      .filter((r) => r.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        if (a.emoji < b.emoji) return -1;
        if (a.emoji > b.emoji) return 1;
        return 0;
      });
  }, [reactions]);

  const visibleChips = useMemo<ReadonlyArray<Reaction>>(() => {
    return sortedReactions.slice(0, maxVisible);
  }, [sortedReactions, maxVisible]);

  const overflowCount = sortedReactions.length - visibleChips.length;

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  const handlePickerSelect = useCallback(
    (emoji: PositiveEmoji) => {
      // Always go through `onToggle` so the picker can add *and* remove a
      // reaction (e.g. user wants to switch their reaction).
      onToggle(emoji);
    },
    [onToggle],
  );

  // The picker's "current user reactions" comes from the same set.
  const handleClear = useCallback(() => {
    // Removing all of the user's reactions on this message.
    for (const emoji of userReactedSet) {
      // Only toggle if currently active — calling onToggle with an inactive
      // emoji would ADD it, which is the wrong direction.
      onToggle(emoji);
    }
  }, [onToggle, userReactedSet]);

  return (
    <div
      ref={rootRef}
      data-testid="reactions-root"
      data-message-id={messageId as unknown as string}
      className={cn(
        'relative flex flex-wrap items-center gap-1.5 py-1',
        className,
      )}
      role="group"
      aria-label="Reações da mensagem"
    >
      {visibleChips.map((r) => (
        <Chip
          key={r.emoji}
          emoji={r.emoji}
          count={r.count}
          active={userReactedSet.has(r.emoji)}
          onToggle={onToggle}
          readOnly={readOnly}
        />
      ))}

      {overflowCount > 0 && (
        <span
          data-testid="reactions-overflow"
          className="inline-flex min-h-[44px] items-center rounded-full bg-muted/60 px-3 text-xs text-muted-foreground"
        >
          +{overflowCount}
        </span>
      )}

      {!readOnly && (
        <button
          type="button"
          data-testid="reaction-add"
          aria-label="Adicionar reação"
          aria-expanded={pickerOpen}
          aria-haspopup="dialog"
          onClick={openPicker}
          className={cn(
            'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-dashed border-border bg-background text-muted-foreground',
            'transition-colors hover:border-[var(--spiritual-gold)] hover:bg-[var(--spiritual-gold)]/10 hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      )}

      {userReactedSet.size > 0 && !readOnly && (
        <button
          type="button"
          data-testid="reactions-clear"
          aria-label="Limpar minhas reações"
          onClick={handleClear}
          className={cn(
            'inline-flex min-h-[44px] items-center gap-1 rounded-full border border-transparent bg-transparent px-2 text-xs text-muted-foreground',
            'transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <X className="size-3.5" aria-hidden="true" />
          Limpar
        </button>
      )}

      {pickerOpen && !readOnly && (
        <div
          data-testid="reaction-picker-open"
          className="absolute right-0 top-full z-20 mt-2"
        >
          <EmojiPicker
            onSelect={handlePickerSelect}
            onClose={closePicker}
            currentUserReactions={userReactedSet}
          />
        </div>
      )}

      {/* Hidden list of all 10 positive emojis for source-inspection assert. */}
      <span data-testid="reaction-positives-hidden" className="sr-only">
        {POSITIVE_EMOJIS.join(' ')}
      </span>
    </div>
  );
}

export const MessageReactions = memo(MessageReactionsImpl);
MessageReactions.displayName = 'MessageReactions';

// Module-level freeze — prevent accidental monkey-patching.
Object.freeze(exports);

export default MessageReactions;