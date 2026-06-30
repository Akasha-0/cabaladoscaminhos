// ============================================================================
// src/components/akasha/tradition-filter.tsx
// ============================================================================
// Multi-select pill bar for the seven traditions. Mobile-first: the bar
// is a horizontal scrollable row (no overflow) — desktop simply lays
// them out inline. Selecting passes the filter up to the chat page, which
// forwards it to the API.
//
// No `<select>` dropdown — the entire bar is keyboard-navigable
// (each pill is a real button, Tab cycles through them).
// ============================================================================

'use client';

import React, { useCallback } from 'react';
import { TRADITIONS, type Tradition } from '@/lib/akasha-ui/types.ts';

export interface TraditionFilterProps {
  /** Currently active traditions. Empty array = "all". */
  selected: Tradition[];
  /** Toggle handler. */
  onChange: (next: Tradition[]) => void;
  /** Optional label shown to the left of the pills on desktop. Hidden on mobile. */
  label?: string;
  /** Disable interaction (e.g. while a stream is in flight). */
  disabled?: boolean;
}

export function TraditionFilter({
  selected,
  onChange,
  label = 'Tradições',
  disabled = false,
}: TraditionFilterProps): React.ReactElement {
  const handleToggle = useCallback(
    (t: Tradition) => {
      if (disabled) return;
      const set = new Set(selected);
      if (set.has(t)) {
        set.delete(t);
      } else {
        set.add(t);
      }
      onChange([...set]);
    },
    [selected, onChange, disabled],
  );

  const handleClear = useCallback(() => {
    if (disabled) return;
    onChange([]);
  }, [onChange, disabled]);

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-2 overflow-x-auto py-1"
    >
      <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">{label}:</span>
      <button
        type="button"
        onClick={handleClear}
        disabled={disabled || selected.length === 0}
        aria-pressed={selected.length === 0}
        className={[
          'shrink-0 rounded-full px-3 py-1 text-[11px] ring-1 transition',
          'focus:outline-none focus-visible:ring-2',
          selected.length === 0
            ? 'bg-amber-500/20 text-amber-100 ring-amber-400/60'
            : 'bg-slate-800/40 text-slate-300 ring-slate-700 hover:ring-slate-500',
          disabled ? 'opacity-40' : '',
        ].join(' ')}
      >
        Todas
      </button>
      {TRADITIONS.map((t) => {
        const active = selected.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => handleToggle(t)}
            disabled={disabled}
            aria-pressed={active}
            data-tradition={t}
            className={[
              'shrink-0 rounded-full px-3 py-1 text-[11px] ring-1 transition',
              'focus:outline-none focus-visible:ring-2',
              active
                ? 'bg-amber-500/20 text-amber-100 ring-amber-400/60'
                : 'bg-slate-800/40 text-slate-300 ring-slate-700 hover:ring-slate-500',
              disabled ? 'opacity-40' : '',
            ].join(' ')}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

export default TraditionFilter;
