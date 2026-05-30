'use client';

import { cn } from '@/lib/utils';

interface SkeletonCalendarioProps {
  className?: string;
}

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function SkeletonCalendario({ className }: SkeletonCalendarioProps) {
  return (
    <div
      className={cn('card-spiritual p-5', className)}
      role="status"
      aria-label="Carregando calendário..."
      aria-busy="true"
    >
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="skeleton-spiritual rounded w-5 h-5" />
          <div className="skeleton-spiritual rounded h-5 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton-spiritual rounded w-8 h-8" />
          <div className="skeleton-spiritual rounded w-8 h-8" />
        </div>
      </div>

      {/* Day names row */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {DAYS_SHORT.map((_, i) => (
          <div key={i} className="skeleton-spiritual rounded h-4 w-full" />
        ))}
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex flex-col items-center gap-2 min-h-[80px]"
          >
            {/* Day number */}
            <div className="skeleton-spiritual rounded h-5 w-5" />

            {/* Orixá symbol */}
            <div className="skeleton-spiritual rounded-full w-8 h-8" />

            {/* Moon phase */}
            <div className="skeleton-spiritual rounded w-4 h-4" />

            {/* Status indicator */}
            <div className="skeleton-spiritual rounded h-2 w-full" />

            {/* Recommendation text (hidden on small) */}
            <div className="hidden md:block skeleton-spiritual rounded h-2 w-8" />
          </div>
        ))}
      </div>

      {/* Month navigation footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="skeleton-spiritual rounded h-4 w-20" />
        <div className="skeleton-spiritual rounded h-4 w-16" />
        <div className="skeleton-spiritual rounded h-4 w-20" />
      </div>
    </div>
  );
}