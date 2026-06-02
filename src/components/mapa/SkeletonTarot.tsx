// fallow-ignore-file unused-file
'use client';

import { cn } from '@/lib/utils';

interface SkeletonTarotProps {
  className?: string;
}

export function SkeletonTarot({ className }: SkeletonTarotProps) {
  return (
    <div
      className={cn('card-spiritual p-5', className)}
      role="status"
      aria-label="Carregando tarot..."
      aria-busy="true"
    >
      {/* Card container with flip effect indication */}
      <div className="relative w-32 mx-auto">
        {/* Front of card */}
        <div className="bg-slate-800/50 border-2 border-slate-700/50 rounded-xl p-4 flex flex-col items-center gap-3">
          {/* Arcano symbol placeholder */}
          <div className="skeleton-spiritual rounded w-16 h-16" />

          {/* Arcano name */}
          <div className="skeleton-spiritual rounded h-5 w-28" />

          {/* English name */}
          <div className="skeleton-spiritual rounded h-3 w-20" />

          {/* Element badge */}
          <div className="skeleton-spiritual rounded h-6 w-16" />

          {/* Card back shimmer decoration */}
          <div className="w-full aspect-[2/3] rounded-lg bg-slate-700/30 border border-slate-600/30 flex items-center justify-center">
            <div className="skeleton-spiritual rounded w-12 h-12 opacity-50" />
          </div>
        </div>

        {/* Subtle indicator this is front */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="skeleton-spiritual rounded h-3 w-16" />
        </div>
      </div>

      {/* Info below card */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="skeleton-spiritual rounded h-4 w-20" />
          <div className="skeleton-spiritual rounded h-4 w-8" />
        </div>

        <div className="space-y-2">
          <div className="skeleton-spiritual rounded h-3 w-full" />
          <div className="skeleton-spiritual rounded h-3 w-5/6" />
          <div className="skeleton-spiritual rounded h-3 w-4/6" />
        </div>
      </div>
    </div>
  );
}