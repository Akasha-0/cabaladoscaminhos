'use client';

/**
 * DiarioPageSkeleton — animated loading state for the 5-section diario layout.
 * Mirrors: MandatoUnificado + RitualSection + DiarioAuthorityBlock + SignificadoSection + AreasSection
 *
 * Respects prefers-reduced-motion: no pulse animation when user has
 * reduced motion preference enabled.
 */
import { useReducedMotion } from '@/components/akasha/hooks/useReducedMotion';

/** Skeleton bar — conditionally animated. */
function SkeletonBar({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const reduce = useReducedMotion();
  return (
    <div
      className={`bg-white/10 rounded ${reduce ? '' : 'animate-pulse'} ${className}`}
      {...props}
    />
  );
}

export function DiarioPageSkeleton() {
  return (
    <div className="min-h-dvh bg-[#06070F] flex flex-col">
      {/* Sticky header skeleton */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(6,7,15,0.85)] border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <SkeletonBar className="h-3 w-32" />
          <SkeletonBar className="h-4 w-20 rounded-full" />
          <SkeletonBar className="h-3 w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto w-full px-5 pt-8 pb-4">
          {/* MandatoUnificado skeleton */}
          <div className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4">
            <SkeletonBar className="h-3 w-20 mb-4" />
            <SkeletonBar className="h-5 w-3/4 mb-2" />
            <SkeletonBar className="h-3 w-full mb-1" />
            <SkeletonBar className="h-3 w-5/6 mb-6" />
            <SkeletonBar className="h-3 w-24 mb-3" />
            <SkeletonBar className="h-24 w-full rounded-xl bg-white/5" />
          </div>
        </div>

        <div className="max-w-xl mx-auto w-full px-5 py-4">
          {/* RitualSection skeleton */}
          <div className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4">
            <SkeletonBar className="h-5 w-2/3 mb-2" />
            <SkeletonBar className="h-3 w-full mb-1" />
            <SkeletonBar className="h-3 w-4/5 mb-4" />
            <div className="flex gap-2 mb-4">
              <SkeletonBar className="h-5 w-16 rounded-full" />
              <SkeletonBar className="h-5 w-14 rounded-full" />
            </div>
            <SkeletonBar className="h-8 w-full rounded-xl bg-white/5" />
          </div>
        </div>

        <div className="max-w-xl mx-auto w-full px-5 py-4">
          {/* DiarioAuthorityBlock skeleton */}
          <div className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4">
            <SkeletonBar className="h-4 w-1/2 mb-3" />
            <SkeletonBar className="h-3 w-full mb-1" />
            <SkeletonBar className="h-3 w-5/6 mb-1" />
            <SkeletonBar className="h-3 w-3/4 mb-4" />
            <SkeletonBar className="h-3 w-24 mb-2" />
            <div className="space-y-1.5">
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-5/6" />
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto w-full px-5 py-4">
          {/* SignificadoSection skeleton */}
          <div className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4">
            <SkeletonBar className="h-4 w-2/3 mb-2" />
            <SkeletonBar className="h-3 w-full mb-1" />
            <SkeletonBar className="h-3 w-4/5 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBar key={i} className="h-16 w-full rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto w-full px-5 py-4 pb-16">
          {/* AreasSection skeleton */}
          <div className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4">
            <SkeletonBar className="h-4 w-1/3 mb-2" />
            <SkeletonBar className="h-3 w-2/3 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBar key={i} className="h-12 rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
