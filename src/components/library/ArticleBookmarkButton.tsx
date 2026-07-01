// ============================================================================
// ArticleBookmarkButton — Client wrapper para useBookmark (Wave 29)
// ============================================================================
// 44x44 touch target, aria-pressed, optimistic UI, toast feedback via aria-live.
// ============================================================================

'use client';

import { Bookmark } from 'lucide-react';
import { useBookmark } from '@/hooks/use-bookmark';
import { cn } from '@/lib/utils';

interface ArticleBookmarkButtonProps {
  slug: string;
  initial?: boolean;
  className?: string;
}

export function ArticleBookmarkButton({
  slug,
  initial = false,
  className,
}: ArticleBookmarkButtonProps) {
  const { isBookmarked, loading, toggle, toast, error } = useBookmark(slug, initial);

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg border transition-all',
          'min-h-[44px] min-w-[44px] px-4',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
          isBookmarked
            ? 'bg-amber-500/15 text-amber-200 border-amber-500/40'
            : 'bg-slate-800/50 text-slate-300 border-slate-700/40 hover:border-amber-500/40 hover:text-amber-300',
          loading && 'opacity-60 cursor-wait',
        )}
      >
        <Bookmark
          className={cn('w-4 h-4', isBookmarked && 'fill-current')}
          aria-hidden="true"
        />
        <span className="text-sm hidden sm:inline">
          {isBookmarked ? 'Salvo' : 'Salvar'}
        </span>
      </button>

      {/* Toast — aria-live para acessibilidade */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'absolute right-0 top-full mt-2 z-10 rounded-lg px-3 py-2 text-xs whitespace-nowrap',
            'shadow-lg border',
            toast.kind === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
              : 'bg-red-500/10 border-red-500/40 text-red-200',
          )}
        >
          {toast.message}
        </div>
      )}
      {error && !toast && (
        <span role="alert" className="sr-only">
          {error}
        </span>
      )}
    </div>
  );
}
