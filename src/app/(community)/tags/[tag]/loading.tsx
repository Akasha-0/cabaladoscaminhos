/**
 * Wave 24 — Tag route loading skeleton.
 *
 * Espelha o layout de /tags/[tag] (header com nome da tag + busca +
 * grid de posts/articles/profiles) para evitar layout shift.
 */

import { Skeleton, PostCardSkeleton, ArticleCardSkeleton } from '@/components/design-system/skeleton';

export default function TagLoading() {
  return (
    <div
      className="mx-auto max-w-5xl px-4 py-6 space-y-6"
      data-testid="tag-loading"
      role="status"
      aria-label="Carregando tag"
    >
      {/* Header */}
      <header className="space-y-2">
        <Skeleton variant="text" size="sm" width="6rem" />
        <Skeleton variant="text" size="lg" width="14rem" />
        <Skeleton variant="text" size="md" width="24rem" />
      </header>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Skeleton variant="rect" className="h-10 w-full sm:w-72 rounded-xl" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Skeleton variant="badge" className="w-20" />
          <Skeleton variant="badge" className="w-24" />
          <Skeleton variant="badge" className="w-24" />
        </div>
      </div>

      {/* Section: posts */}
      <section className="space-y-3" aria-label="Carregando posts">
        <Skeleton variant="text" size="md" width="10rem" />
        <div className="grid sm:grid-cols-2 gap-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </section>

      {/* Section: articles */}
      <section className="space-y-3" aria-label="Carregando artigos">
        <Skeleton variant="text" size="md" width="10rem" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </div>
      </section>

      <span className="sr-only">Carregando tag…</span>
    </div>
  );
}
