'use client';

import { cn } from '@/lib/utils';

interface SkeletonNumerologiaProps {
  className?: string;
}

export function SkeletonNumerologia({ className }: SkeletonNumerologiaProps) {
  return (
    <div
      className={cn('card-spiritual p-6', className)}
      role="status"
      aria-label="Carregando numerologia..."
      aria-busy="true"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton-spiritual rounded w-6 h-6" />
        <div className="skeleton-spiritual rounded h-6 w-40" />
      </div>

      {/* 4-card grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex flex-col items-center gap-3"
          >
            <div className="skeleton-spiritual rounded-full w-12 h-12" />
            <div className="skeleton-spiritual rounded h-8 w-10" />
            <div className="skeleton-spiritual rounded h-3 w-20" />
            <div className="skeleton-spiritual rounded h-2 w-full mt-2" />
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-spiritual rounded-full w-20 h-6" />
        ))}
      </div>
    </div>
  );
}