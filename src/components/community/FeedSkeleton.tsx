'use client';

// ============================================================================
// FeedSkeleton — Placeholder de carregamento do feed
// ============================================================================
// Usa o Skeleton system compartilhado (src/components/ui/skeleton.tsx).
// Responsivo, acessível (aria-busy + aria-label), respeita prefers-reduced-motion.
// ============================================================================

import { SkeletonCard } from '@/components/ui/skeleton';

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="space-y-4"
      data-testid="feed-skeleton"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando feed"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}