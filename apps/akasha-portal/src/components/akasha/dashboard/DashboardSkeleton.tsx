import React from 'react';

/**
 * DashboardSkeleton — animated loading state for the main dashboard.
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#06070F] text-white">
      {/* Navigation Tabs Placeholder */}
      <div className="px-4 pt-6 max-w-2xl mx-auto">
        <div className="bg-[#0B0E1C]/80 border border-white/10 rounded-full p-1 h-12 flex items-center justify-between">
          <div className="flex-1 h-8 rounded-full bg-white/10 animate-pulse mx-1" />
          <div className="flex-1 h-8 rounded-full bg-white/10 animate-pulse mx-1" />
          <div className="flex-1 h-8 rounded-full bg-white/10 animate-pulse mx-1" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="h-6 w-1/3 rounded bg-white/10 animate-pulse mb-4" />
          <div className="h-32 w-full rounded-xl bg-white/5 animate-pulse mb-4" />
          <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse mb-2" />
          <div className="h-4 w-5/6 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-24 rounded-xl bg-white/5 animate-pulse col-span-2" />
        </div>
      </div>
    </div>
  );
}
