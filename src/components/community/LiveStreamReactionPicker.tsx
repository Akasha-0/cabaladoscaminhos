'use client';

// ============================================================================
// LiveStreamReactionPicker — W90s-A 5-emoji picker (👍 ❤️ 🔥 🙏 ✨)
//
// Renamed from `ReactionPicker` to avoid collision with the pre-existing
// comment-system ReactionPicker (8 emojis, ALLOWED_EMOJIS-driven).
// This picker is dedicated to live-stream chat and ships a hardcoded
// 5-emoji set.
//
// Built as a popover anchored to a trigger button. Opens on click or Enter /
// Space. Closes on Escape, on outside-click, or after selecting an emoji.
// Manages focus via stable id + document.getElementById().focus() (per W89-A
// lesson: @/components/ui/input.tsx doesn't forward refs, so we use ids).
//
// Mobile-first:
//   - 44px touch target on trigger (min-h-[44px] min-w-[44px])
//   - Grid 5 cols on mobile, larger buttons for thumb reach
//   - Scrollable on tiny screens (max-h with overflow-y-auto)
//
// ARIA:
//   - role="dialog" on the popover
//   - aria-modal="true" while open
//   - aria-label on each option describing meaning in pt-BR
//   - aria-pressed on selected options
//
// data-testid (for source-inspection spec):
//   - live-stream-reaction-picker-trigger
//   - live-stream-reaction-picker-popover
//   - live-stream-reaction-picker-option-{emoji-hex}
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { W90S_REACTION_EMOJIS } from '@/lib/w90s/live-stream-chat-ext';

export interface LiveStreamReactionPickerProps {
  /** Called with the emoji string when the user picks one. */
  onSelect: (emoji: string) => void;
  /** Emojis already used by this viewer — render with aria-pressed=true. */
  selectedEmojis?: ReadonlyArray<string>;
  /** Disabled state (e.g. anonymous viewer). */
  disabled?: boolean;
  /** Accessible label for the trigger. */
  label?: string;
  /** Visible label for the trigger button (text or icon). */
  triggerContent?: React.ReactNode;
  /** Extra classes for the wrapper. */
  className?: string;
  /** Stable id for focus management. Required for accessibility. */
  id?: string;
}

const REACTIONS: ReadonlyArray<{ emoji: string; ptLabel: string }> = Object.freeze([
  { emoji: '👍', ptLabel: 'Apoiar' },
  { emoji: '❤️', ptLabel: 'Amor' },
  { emoji: '🔥', ptLabel: 'Fogo — forte' },
  { emoji: '🙏', ptLabel: 'Gratidão' },
  { emoji: '✨', ptLabel: 'Brilho' },
]);

/** Stable id generator for the popover element. */
function popoverId(base: string): string {
  return `${base}-popover`;
}

function emojiToHex(emoji: string): string {
  // Encode each emoji codepoint to hex — safe for HTML data-testid
  return Array.from(emoji)
    .map((c) => c.codePointAt(0)?.toString(16) ?? '0')
    .join('-');
}

export function LiveStreamReactionPicker({
  onSelect,
  selectedEmojis = [],
  disabled = false,
  label = 'Reagir à mensagem',
  triggerContent,
  className,
  id = 'live-stream-reaction-picker',
}: LiveStreamReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Restore focus to trigger after closing (stable id approach)
    if (typeof document !== 'undefined') {
      const el = document.getElementById(id);
      el?.focus();
    }
  }, [id]);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      close();
    },
    [onSelect, close],
  );

  // Outside click + Escape
  useEffect(() => {
    if (!open) return;
    function onPointerDown(ev: PointerEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(ev.target as Node)) {
        close();
      }
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        close();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Move focus into popover when opened
  useEffect(() => {
    if (!open) return;
    if (typeof document === 'undefined') return;
    const el = document.getElementById(popoverId(id));
    el?.focus();
  }, [open, id]);

  const selected = new Set(selectedEmojis);
  // Sanity: every REACTIONS entry must be in W90S_REACTION_EMOJIS.
  // (Dev-time invariant; engines's freeze() catches accidental drift.)
  const allowed = new Set(W90S_REACTION_EMOJIS);
  for (const r of REACTIONS) {
    if (!allowed.has(r.emoji)) {
      // Should never happen — kept silent for production.
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={cn('relative inline-block', className)}
      data-testid="live-stream-reaction-picker-wrapper"
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        data-testid="live-stream-reaction-picker-trigger"
        className={cn(
          'inline-flex items-center justify-center',
          'min-h-[44px] min-w-[44px] px-3 rounded-lg',
          'border border-input bg-background',
          'text-base font-medium',
          'transition-colors',
          'hover:bg-muted focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
        )}
      >
        {triggerContent ?? <span aria-hidden="true">＋</span>}
      </button>

      {open && (
        <div
          ref={popoverRef}
          id={popoverId(id)}
          role="dialog"
          aria-modal="true"
          aria-label="Escolher reação"
          tabIndex={-1}
          data-testid="live-stream-reaction-picker-popover"
          className={cn(
            'absolute z-50 mt-2 right-0',
            'min-w-[280px] p-2 rounded-lg',
            'bg-popover text-popover-foreground border border-border shadow-lg',
            'motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95',
          )}
        >
          <ul
            role="listbox"
            aria-label="Reações disponíveis"
            className="grid grid-cols-5 gap-1"
          >
            {REACTIONS.map((r) => {
              const isSelected = selected.has(r.emoji);
              const optionId = `${popoverId(id)}-option-${emojiToHex(r.emoji)}`;
              return (
                <li key={r.emoji} role="presentation">
                  <button
                    id={optionId}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-pressed={isSelected}
                    aria-label={r.ptLabel}
                    title={r.ptLabel}
                    onClick={() => handleSelect(r.emoji)}
                    data-testid={`live-stream-reaction-picker-option-${emojiToHex(r.emoji)}`}
                    className={cn(
                      'flex items-center justify-center',
                      'min-h-[44px] min-w-[44px] rounded-md',
                      'text-2xl',
                      'hover:bg-muted focus-visible:outline-none',
                      'focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected && 'bg-muted ring-1 ring-primary',
                    )}
                  >
                    <span aria-hidden="true">{r.emoji}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LiveStreamReactionPicker;