// fallow-ignore-file unused-file
'use client';

import { cn } from '@/lib/utils';

interface SkeletonOduProps {
  className?: string;
}

export function SkeletonOdu({ className }: SkeletonOduProps) {
  return (
    <div
      className={cn('bg-slate-900 border border-slate-700/50 rounded-lg', className)}
      role="status"
      aria-label="Carregando Odu..."
      aria-busy="true"
    >
      {/* CardHeader */}
      <div className="pb-4 p-5 border-b border-slate-700/50">
        <div className="skeleton-spiritual rounded h-6 w-40" />
      </div>

      {/* CardContent */}
      <div className="p-5 space-y-5">
        {/* Odu Regente Principal */}
        <div className="text-center py-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="skeleton-spiritual rounded-full w-16 h-16 mx-auto mb-3" />
          <div className="skeleton-spiritual rounded h-5 w-32 mx-auto mb-2" />
          <div className="skeleton-spiritual rounded h-3 w-24 mx-auto" />
        </div>

        {/* Orixás Regentes */}
        <div>
          <div className="skeleton-spiritual rounded h-4 w-28 mb-3" />
          <div className="flex gap-2 flex-wrap">
            <div className="skeleton-spiritual rounded-full w-24 h-6" />
            <div className="skeleton-spiritual rounded-full w-24 h-6" />
            <div className="skeleton-spiritual rounded-full w-24 h-6" />
          </div>
        </div>

        {/* Quizilas */}
        <div>
          <div className="skeleton-spiritual rounded h-4 w-24 mb-2" />
          <div className="flex gap-2 flex-wrap">
            <div className="skeleton-spiritual rounded h-6 w-20" />
            <div className="skeleton-spiritual rounded h-6 w-20" />
          </div>
        </div>

        {/* Preceitos */}
        <div>
          <div className="skeleton-spiritual rounded h-4 w-32 mb-2" />
          <div className="space-y-2">
            <div className="skeleton-spiritual rounded h-4 w-full" />
            <div className="skeleton-spiritual rounded h-4 w-5/6" />
          </div>
        </div>

        {/* Arcano + Sephirah row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
          <div className="flex flex-col items-center gap-2">
            <div className="skeleton-spiritual rounded w-12 h-16" />
            <div className="skeleton-spiritual rounded h-3 w-16" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="skeleton-spiritual rounded w-12 h-16" />
            <div className="skeleton-spiritual rounded h-3 w-16" />
          </div>
        </div>

        {/* Elemento */}
        <div className="text-center">
          <div className="skeleton-spiritual rounded h-4 w-20 mx-auto" />
        </div>
      </div>
    </div>
  );
}