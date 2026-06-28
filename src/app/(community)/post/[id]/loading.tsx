/**
 * Wave 24 — Post detail route loading skeleton.
 *
 * Espelha o layout de /post/[id] (header com botão voltar + PostCard +
 * CommentThread) para evitar layout shift durante Suspense fallback.
 */

import { Skeleton, PostCardSkeleton, CommentSkeleton } from '@/components/design-system/skeleton';

export default function PostDetailLoading() {
  return (
    <div
      className="mx-auto max-w-3xl space-y-6 px-4 py-6"
      data-testid="post-detail-loading"
      role="status"
      aria-label="Carregando publicação"
    >
      {/* Header com botão voltar */}
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="h-11 w-11" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" size="md" />
          <Skeleton variant="text" size="sm" width="8rem" />
        </div>
      </div>

      {/* Post principal */}
      <PostCardSkeleton />

      {/* Skeleton do formulário de comentário */}
      <div className="space-y-3 rounded-2xl border border-slate-800/50 bg-slate-900/30 p-4">
        <Skeleton variant="text" size="sm" width="6rem" />
        <Skeleton variant="rect" className="h-20 w-full rounded-lg" />
        <div className="flex justify-end gap-2">
          <Skeleton variant="button" />
        </div>
      </div>

      {/* Comentários */}
      <div className="space-y-2 pt-2" aria-label="Carregando comentários">
        <Skeleton variant="text" size="md" width="10rem" />
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>

      <span className="sr-only">Carregando publicação…</span>
    </div>
  );
}
