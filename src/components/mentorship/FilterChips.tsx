// ============================================================================
// FilterChips — Multi-select chip row for discover filters
// ============================================================================
// Reusable across the mentorship discovery page:
//   - single-select variant for "tradition" (one active at a time)
//   - multi-select variant for "languages" / "topics" (toggle multiple)
//
// Mobile-first: chips wrap, each chip is a touch target >= 44px tall.
//
// Wave 20 Worker D — 2026-06-28
// ============================================================================

'use client';

import { cn } from '@/lib/utils';
import type { ChipOption } from '@/lib/mentorship/types';

// ============================================================
// Single-select chip group
// ============================================================

export interface SingleChipGroupProps<V extends string> {
  options: ChipOption<V>[];
  value: V;
  onChange: (value: V) => void;
  label?: string;
  testIdPrefix?: string;
}

export function SingleChipGroup<V extends string>({
  options,
  value,
  onChange,
  label,
  testIdPrefix = 'chip',
}: SingleChipGroupProps<V>) {
  return (
    <div
      role="group"
      aria-label={label ?? 'Filtro'}
      className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin"
      data-testid={`${testIdPrefix}-group`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value || 'all'}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium border transition-all whitespace-nowrap min-h-[36px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
              active
                ? 'bg-gradient-to-r from-amber-500/30 to-violet-500/30 border-amber-400/60 text-amber-200'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/60 hover:border-slate-600/60'
            )}
            data-testid={`${testIdPrefix}-${opt.value || 'all'}`}
          >
            {opt.emoji && (
              <span aria-hidden className="text-sm">
                {opt.emoji}
              </span>
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Multi-select chip group
// ============================================================

export interface MultiChipGroupProps<V extends string> {
  options: ChipOption<V>[];
  values: V[];
  onToggle: (value: V) => void;
  onClear?: () => void;
  label?: string;
  testIdPrefix?: string;
}

export function MultiChipGroup<V extends string>({
  options,
  values,
  onToggle,
  onClear,
  label,
  testIdPrefix = 'chip-multi',
}: MultiChipGroupProps<V>) {
  const selectedSet = new Set(values);
  return (
    <div
      role="group"
      aria-label={label ?? 'Filtro'}
      className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin"
      data-testid={`${testIdPrefix}-group`}
    >
      {options.map((opt) => {
        const active = selectedSet.has(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium border transition-all whitespace-nowrap min-h-[36px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
              active
                ? 'bg-gradient-to-r from-amber-500/30 to-violet-500/30 border-amber-400/60 text-amber-200'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/60 hover:border-slate-600/60'
            )}
            data-testid={`${testIdPrefix}-${opt.value}`}
          >
            {opt.emoji && (
              <span aria-hidden className="text-sm">
                {opt.emoji}
              </span>
            )}
            <span>{opt.label}</span>
            {active && (
              <span aria-hidden className="text-amber-300 ml-0.5">
                ✓
              </span>
            )}
          </button>
        );
      })}
      {onClear && values.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium border border-slate-700/40 bg-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600/60 min-h-[36px]"
          data-testid={`${testIdPrefix}-clear`}
          aria-label="Limpar seleção"
        >
          Limpar
        </button>
      )}
    </div>
  );
}
