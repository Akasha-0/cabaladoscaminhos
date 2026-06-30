'use client';

// ============================================================================
// EmojiPicker — 10-emoji grid overlay (W90-B)
//
// Renders the closed enumeration of positive emojis (🙏 ✨ 🪶 ☸ ☉ ✦ ◈ 🕯️ 🌿 💫)
// as a tappable grid. Highlights emojis the user has already reacted with
// (passed in via `currentUserReactions`).
//
// Click an emoji → `onSelect(emoji)`.
// Click outside the dialog → `onClose()`.
//
// Mobile-first:
//   - Each emoji button is a 44×44 tap target.
//   - Grid wraps cleanly on small screens.
//   - Backdrop is dismissable.
//
// data-testid attrs:
//   - `emoji-picker` on the dialog
//   - `emoji-picker-grid` on the grid container
//   - `emoji-picker-{emoji}` on each emoji button
//   - `emoji-picker-backdrop` on the dismissable overlay
// ============================================================================

import React, { memo, useCallback, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';
import type { PositiveEmoji } from '@/lib/w90/live-stream-reactions';
import { POSITIVE_EMOJIS } from '@/lib/w90/live-stream-reactions';

export interface EmojiPickerProps {
  readonly onSelect: (emoji: PositiveEmoji) => void;
  readonly onClose: () => void;
  readonly currentUserReactions: ReadonlySet<PositiveEmoji>;
  readonly className?: string;
}

function EmojiPickerImpl({
  onSelect,
  onClose,
  currentUserReactions,
  className,
}: EmojiPickerProps): React.ReactElement {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Click-outside dismiss handler.
  useEffect(() => {
    function handlePointerDown(ev: PointerEvent): void {
      const target = ev.target;
      if (!(target instanceof Node)) return;
      if (dialogRef.current && dialogRef.current.contains(target)) return;
      onClose();
    }
    function handleKeyDown(ev: KeyboardEvent): void {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        onClose();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleClick = useCallback(
    (emoji: PositiveEmoji) => () => {
      onSelect(emoji);
    },
    [onSelect],
  );

  return (
    <>
      <div
        data-testid="emoji-picker-backdrop"
        className="fixed inset-0 z-10 bg-transparent"
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Escolher reação"
        data-testid="emoji-picker"
        className={cn(
          'relative z-20 rounded-xl border border-border bg-popover p-3 shadow-lg',
          'min-w-[260px]',
          className,
        )}
      >
        <p
          data-testid="emoji-picker-label"
          className="mb-2 text-xs font-medium text-muted-foreground"
        >
          Escolher reação
        </p>
        <div
          data-testid="emoji-picker-grid"
          role="grid"
          aria-label="Emojis positivos disponíveis"
          className="grid grid-cols-5 gap-1.5"
        >
          {POSITIVE_EMOJIS.map((emoji) => {
            const active = currentUserReactions.has(emoji);
            return (
              <button
                key={emoji}
                type="button"
                data-testid={`emoji-picker-${emoji}`}
                data-active={active ? 'true' : 'false'}
                aria-pressed={active}
                aria-label={`Reagir com ${emoji}`}
                onClick={handleClick(emoji)}
                className={cn(
                  'inline-flex h-11 w-11 items-center justify-center rounded-lg border text-xl transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'border-[var(--spiritual-gold)] bg-[var(--spiritual-gold)]/15'
                    : 'border-transparent bg-background hover:bg-muted',
                )}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            );
          })}
        </div>
        <p
          data-testid="emoji-picker-footer"
          className="mt-2 text-[10px] text-muted-foreground"
        >
          Apenas emojis positivos — sem reações negativas ou de downvote.
        </p>
      </div>
    </>
  );
}

export const EmojiPicker = memo(EmojiPickerImpl);
EmojiPicker.displayName = 'EmojiPicker';

// Module-level freeze — prevent accidental monkey-patching.
Object.freeze(exports);

export default EmojiPicker;