// ============================================================================
// TraditionFilter — Chips de tradição (Wave 29)
// ============================================================================
// Filtro horizontal com scroll-to-snap para mobile. WCAG AA: contraste,
// target ≥44px de altura, foco visível.
// ============================================================================

'use client';

import { cn } from '@/lib/utils';

export interface TraditionOption {
  /** slug canônico (cabala, ifa, tantra, ...) */
  value: string;
  /** rótulo exibido */
  label: string;
}

interface TraditionFilterProps {
  /** valor atual selecionado (null = todas) */
  value: string | null;
  /** lista de opções (incluindo "todas" como primeiro) */
  options: TraditionOption[];
  /** label de seção (ex: "Tradição") */
  label?: string;
  onChange: (next: string | null) => void;
}

export function TraditionFilter({
  value,
  options,
  label = 'Tradição',
  onChange,
}: TraditionFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin snap-x snap-mandatory">
      <span className="text-xs text-slate-500 flex-shrink-0 pr-1">{label}:</span>
      {options.map((opt) => {
        const active = (value ?? 'todas') === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              onChange(opt.value === 'todas' ? null : opt.value)
            }
            aria-pressed={active}
            className={cn(
              'snap-start',
              'px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap border',
              'min-h-[36px]',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-1 focus:ring-offset-slate-950',
              active
                ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/50 text-slate-300 border-slate-700/30 hover:text-slate-100 hover:border-slate-600',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
