'use client';

// ============================================================================
// FeedSkeleton — Placeholder de carregamento do feed
// ============================================================================

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="space-y-4"
      data-testid="feed-skeleton"
      aria-busy="true"
      aria-label="Carregando feed"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-800/50"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-800/50 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-slate-800/50 rounded animate-pulse" />
                <div className="h-2 w-20 bg-slate-800/50 rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="h-3 w-full bg-slate-800/50 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-slate-800/50 rounded animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="h-7 w-16 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-7 w-16 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-7 w-16 bg-slate-800/50 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}