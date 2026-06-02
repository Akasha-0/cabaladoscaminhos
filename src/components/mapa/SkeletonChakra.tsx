// fallow-ignore-file unused-file
'use client';

import { cn } from '@/lib/utils';

interface SkeletonChakraProps {
  className?: string;
}

export function SkeletonChakra({ className }: SkeletonChakraProps) {
  return (
    <div
      className={cn('card-spiritual p-5', className)}
      role="status"
      aria-label="Carregando chakras..."
      aria-busy="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="skeleton-spiritual rounded w-5 h-5" />
          <div className="skeleton-spiritual rounded h-5 w-32" />
        </div>
        <div className="skeleton-spiritual rounded h-4 w-24" />
      </div>

      {/* 7 Chakra rows */}
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            {/* Chakra circle */}
            <div className="skeleton-spiritual rounded-full w-10 h-10" />

            {/* Info section */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="skeleton-spiritual rounded h-4 w-24" />
                <div className="skeleton-spiritual rounded h-4 w-16" />
              </div>

              {/* Intensity bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="skeleton-spiritual h-full animate-shimmer rounded-full" style={{ width: `${60 + (i * 8) - (i * 5)}%` }} />
                </div>
                <div className="skeleton-spiritual rounded h-4 w-8" />
              </div>
            </div>

            {/* Mantra badge */}
            <div className="skeleton-spiritual rounded h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Bottom summary */}
      <div className="mt-5 pt-4 border-t border-slate-700/50 flex justify-center gap-4">
        <div className="skeleton-spiritual rounded h-6 w-28" />
        <div className="skeleton-spiritual rounded h-6 w-28" />
      </div>
    </div>
  );
}