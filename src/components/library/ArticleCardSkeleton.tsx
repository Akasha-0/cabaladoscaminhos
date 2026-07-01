// ============================================================================
// ArticleCardSkeleton — Skeleton de carregamento (Wave 29)
// ============================================================================
// Mantém a forma do ArticleCard para evitar layout shift.
// ============================================================================

import { Card, CardContent } from '@/components/ui/card';

export function ArticleCardSkeleton() {
  return (
    <Card
      className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-800/50"
      aria-hidden="true"
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800/60 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-slate-800/60 rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-slate-800/60 rounded-full animate-pulse" />
              <div className="h-5 w-12 bg-slate-800/60 rounded-full animate-pulse" />
            </div>
            <div className="h-5 w-4/5 bg-slate-800/60 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-800/60 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-slate-800/60 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-3 w-32 bg-slate-800/60 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-800/60 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-slate-800/60 animate-pulse flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ArticleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">Carregando artigos</span>
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
