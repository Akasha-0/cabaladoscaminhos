// ============================================================================
// TypeFilter — Chips de tipo de mídia (Wave 29)
// ============================================================================

'use client';

import {
  BookText, FileText, FlaskConical, Mic, Quote, Video,
} from 'lucide-react';
import type { ArticleType } from '@/hooks/use-articles';
import { cn } from '@/lib/utils';

export interface TypeOption {
  /** valor canônico (ArticleType) ou 'todas' */
  value: 'todas' | ArticleType;
  label: string;
  icon?: 'paper' | 'article' | 'book' | 'video' | 'podcast' | 'essay';
}

const ICONS = {
  paper: FlaskConical,
  article: FileText,
  book: BookText,
  video: Video,
  podcast: Mic,
  essay: Quote,
} as const;

interface TypeFilterProps {
  /** valor selecionado */
  value: 'todas' | ArticleType;
  options: TypeOption[];
  label?: string;
  onChange: (next: 'todas' | ArticleType) => void;
}

export function TypeFilter({
  value,
  options,
  label = 'Tipo',
  onChange,
}: TypeFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin snap-x snap-mandatory">
      <span className="text-xs text-slate-500 flex-shrink-0 pr-1">{label}:</span>
      {options.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.icon ? ICONS[opt.icon] : null;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              'snap-start',
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap border',
              'min-h-[36px]',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-1 focus:ring-offset-slate-950',
              active
                ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/50 text-slate-300 border-slate-700/30 hover:text-slate-100 hover:border-slate-600',
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
