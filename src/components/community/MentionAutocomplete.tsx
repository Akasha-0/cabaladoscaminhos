'use client';

// ============================================================================
// MentionAutocomplete.tsx — Popover with keyboard nav for @mention pick (W90s-D)
//
// Pure presentation layer over the `mentionEngine`. Receives a
// `MentionAutocompleteState` (already computed by the parent composer) and
// renders:
//
//   - a listbox (`role="listbox"`) of up to 8 suggestions
//   - keyboard nav: ↑↓ to move, Enter to pick, Escape to close
//   - click-to-select on each option
//   - aria-activedescendant wires the active option into the textarea
//   - 7 tradição symbol chips per suggestion (✦ 🪶 ☩ ◈ ☸ ☉ ☬)
//
// Mobile-first: max-w-full on mobile, sm:max-w-xs on tablet+. All touch
// targets ≥ 44px (a11y). ARIA combobox pattern per WAI-ARIA 1.2 §3.11.
//
// Sacred-cultural compliance:
//   - Positive-only signals: no downvote, no shame icons.
//   - 7 tradição symbols rendered verbatim.
//   - Sacred terms (Orixá, Caboclo, Babalaô, Yalorixá, Axé) preserved in
//     user copy without sanitization.
// ============================================================================

import React, { useCallback, useEffect, useRef } from 'react';
import { AtSign, CornerDownLeft, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type MentionAutocompleteState,
  type MentionSuggestion,
  type MentionUser,
  TRADIÇÃO_SYMBOLS,
} from '@/lib/w90s/comments-mention-autocomplete';

export interface MentionAutocompleteProps {
  /** The current autocomplete state (already computed by the composer). */
  state: MentionAutocompleteState;
  /** Called when the user picks a suggestion (keyboard or click). */
  onPick: (user: MentionUser) => void;
  /** Called when the user presses Escape (close popover). */
  onClose: () => void;
  /** Called when the user moves the activeIndex (so the composer can keep
   *  the latest activeIndex — useful for ARIA + scrolling). */
  onActiveChange?: (index: number) => void;
  /** Optional className for the popover root. */
  className?: string;
  /** Render-position hint: "below" (default) or "above". */
  placement?: 'below' | 'above';
}

export function MentionAutocomplete({
  state,
  onPick,
  onClose,
  onActiveChange,
  className,
  placement = 'below',
}: MentionAutocompleteProps) {
  const listRef = useRef<HTMLUListElement | null>(null);

  // Scroll the active option into view whenever activeIndex changes.
  useEffect(() => {
    if (!listRef.current || state.activeIndex < 0) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-option-index="${state.activeIndex}"]`,
    );
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    onActiveChange?.(state.activeIndex);
  }, [state.activeIndex, onActiveChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (state.suggestions.length === 0) {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          onActiveChange?.(
            Math.min(state.activeIndex + 1, state.suggestions.length - 1),
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          onActiveChange?.(Math.max(state.activeIndex - 1, 0));
          break;
        case 'Enter':
        case 'Tab': {
          e.preventDefault();
          const idx =
            state.activeIndex >= 0 ? state.activeIndex : 0;
          const pick = state.suggestions[idx];
          if (pick) onPick(pick.user);
          break;
        }
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [state.activeIndex, state.suggestions, onActiveChange, onClose, onPick],
  );

  if (!state.trigger || state.suggestions.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="mention-empty"
        className={cn(
          'rounded-md border border-slate-700/60 bg-slate-900/95 px-3 py-2 text-xs text-slate-400 shadow-md',
          'max-w-full sm:max-w-xs',
          className,
        )}
      >
        {state.trigger ? (
          <span>Nenhum usuário para “@{state.trigger.query}”.</span>
        ) : null}
      </div>
    );
  }

  const listboxId = `mention-listbox-${state.id}`;
  const activeOptionId =
    state.activeIndex >= 0
      ? `mention-option-${state.id}-${state.activeIndex}`
      : undefined;

  return (
    <div
      role="presentation"
      data-testid="mention-popover"
      data-placement={placement}
      onKeyDown={handleKeyDown}
      className={cn(
        'rounded-md border border-slate-700/60 bg-slate-900/95 shadow-lg backdrop-blur',
        'max-w-full sm:max-w-xs',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-700/40 px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <AtSign className="h-3 w-3" aria-hidden="true" />
          Mencionar usuário
        </span>
        <span aria-hidden="true" className="inline-flex items-center gap-1 text-slate-500">
          <ArrowUp className="h-2.5 w-2.5" />
          <ArrowDown className="h-2.5 w-2.5" />
          <CornerDownLeft className="h-2.5 w-2.5" />
        </span>
      </div>
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label="Sugestões de menção"
        aria-activedescendant={activeOptionId}
        data-testid="mention-listbox"
        className="max-h-64 overflow-y-auto py-1"
      >
        {state.suggestions.map((s, i) => (
          <MentionOption
            key={s.user.id}
            suggestion={s}
            index={i}
            active={i === state.activeIndex}
            listboxId={listboxId}
            onPick={onPick}
            onHover={(idx) => onActiveChange?.(idx)}
          />
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MentionOption — single listbox item
// ---------------------------------------------------------------------------

interface MentionOptionProps {
  suggestion: MentionSuggestion;
  index: number;
  active: boolean;
  listboxId: string;
  onPick: (user: MentionUser) => void;
  onHover: (index: number) => void;
}

function MentionOption({
  suggestion,
  index,
  active,
  listboxId,
  onPick,
  onHover,
}: MentionOptionProps) {
  const { user } = suggestion;
  const initials = (user.displayName || user.handle)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'AN';

  const tradiçãoSymbol = user.tradição
    ? TRADIÇÃO_SYMBOLS[user.tradição]
    : null;

  const optionId = `mention-option-${suggestion.user.id}-${index}`;

  return (
    <li
      id={optionId}
      role="option"
      aria-selected={active}
      data-testid={`mention-option-${user.handle}`}
      data-option-index={index}
      data-tradição={user.tradição ?? 'none'}
      data-active={active ? 'true' : 'false'}
      data-exact-match={suggestion.isExactMatch ? 'true' : 'false'}
      onMouseDown={(e) => {
        // mousedown (not click) so the textarea doesn't lose focus first.
        e.preventDefault();
        onPick(user);
      }}
      onMouseEnter={() => onHover(index)}
      className={cn(
        'flex min-h-[44px] cursor-pointer items-center gap-3 px-3 py-2',
        'transition-colors duration-100',
        active
          ? 'bg-amber-500/15 text-amber-100'
          : 'text-slate-200 hover:bg-slate-800/60',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium',
          active
            ? 'bg-amber-500/30 text-amber-100'
            : 'bg-slate-700/50 text-slate-300',
        )}
      >
        {initials}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5 truncate text-sm">
          <span className="truncate font-medium">{user.displayName}</span>
          {tradiçãoSymbol ? (
            <span
              aria-label={`Tradição ${user.tradição}`}
              title={`Tradição ${user.tradição}`}
              className="text-base leading-none"
              data-testid={`tradição-symbol-${user.tradição}`}
            >
              {tradiçãoSymbol}
            </span>
          ) : null}
          {suggestion.isExactMatch ? (
            <span
              className="rounded bg-emerald-500/20 px-1 text-[10px] uppercase text-emerald-300"
              data-testid="exact-match-badge"
            >
              match
            </span>
          ) : null}
        </span>
        <span className="truncate text-xs text-slate-400">
          @{user.handle}
          {user.spiritualTag ? (
            <>
              <span className="mx-1 text-slate-600">·</span>
              <span className="italic">{user.spiritualTag}</span>
            </>
          ) : null}
        </span>
      </span>
    </li>
  );
}

export default MentionAutocomplete;