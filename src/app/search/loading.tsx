/**
 * Wave 17 — Search route loading skeleton.
 */

import { ArticleCardSkeleton } from '@/components/design-system/skeleton';

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-3xl grid grid-cols-1 gap-4 px-4 py-8">
      <ArticleCardSkeleton />
      <ArticleCardSkeleton />
      <ArticleCardSkeleton />
    </div>
  );
}
