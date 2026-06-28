/**
 * Wave 21 — Group detail page loading skeleton.
 *
 * Companion to (community)/groups/[slug]/page.tsx. Mirrors the layout of
 * that page (hero cover, identity card, tabs) so the page doesn't shift
 * when real data arrives.
 */

import { Skeleton } from '@/components/design-system/skeleton';

export default function GroupLoading() {
  return (
    <div className="min-h-screen" data-testid="group-loading-skeleton">
      {/* Hero / Cover — same dimensions as live page */}
      <div className="relative h-48 md:h-64 bg-slate-900/60 border-b border-slate-800/50">
        <div className="relative max-w-5xl mx-auto px-4 h-full flex items-end pb-6">
          <Skeleton variant="text" size="sm" width="8rem" />
        </div>
      </div>

      {/* Group identity card */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 md:-mt-12 relative z-10">
        <div className="rounded-xl bg-slate-900/90 border border-slate-800/50 p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <Skeleton variant="rect" className="w-20 h-20 md:w-24 md:h-24 rounded-2xl" />
            <div className="flex-1 min-w-0 space-y-3">
              <Skeleton variant="text" size="lg" width="60%" />
              <Skeleton variant="text" lines={2} size="sm" />
              <div className="flex items-center gap-4 pt-2">
                <Skeleton variant="badge" />
                <Skeleton variant="badge" />
                <Skeleton variant="badge" />
              </div>
            </div>
            <Skeleton variant="button" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 rounded-md bg-slate-800/50 border border-slate-700/50 p-1 inline-flex gap-1">
          <Skeleton variant="badge" width="4rem" />
          <Skeleton variant="badge" width="5rem" />
          <Skeleton variant="badge" width="4rem" />
          <Skeleton variant="badge" width="4.5rem" />
        </div>

        {/* Posts feed skeleton */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-900/40 border border-slate-800/50 p-4">
              <div className="flex items-start gap-3">
                <Skeleton variant="avatar" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="rect" className="h-20 w-full rounded" />
                  <Skeleton variant="text" size="sm" width="40%" />
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-slate-800/50 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton variant="avatar" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" size="sm" width="30%" />
                  <Skeleton variant="text" size="sm" width="20%" />
                </div>
              </div>
              <Skeleton variant="text" lines={3} size="sm" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-900/40 border border-slate-800/50 p-4 space-y-2">
              <Skeleton variant="text" size="sm" width="50%" />
              <Skeleton variant="text" lines={2} size="sm" />
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-slate-800/50 p-4 space-y-2">
              <Skeleton variant="text" size="sm" width="40%" />
              <Skeleton variant="text" lines={2} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}