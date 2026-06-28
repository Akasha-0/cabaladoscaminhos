/**
 * Wave 24 — Bookmarks route loading skeleton.
 *
 * Espelha o layout de /me/bookmarks (header + collection chips + lista).
 */

import { Skeleton } from '@/components/design-system/skeleton';

export default function BookmarksLoading() {
  return (
    <div
      className="max-w-4xl mx-auto px-4 py-6 space-y-4"
      data-testid="bookmarks-loading"
      role="status"
      aria-label="Carregando salvos"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="h-11 w-11" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" size="lg" width="10rem" />
          <Skeleton variant="text" size="sm" width="16rem" />
        </div>
      </div>

      {/* Collection chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Skeleton variant="badge" className="w-20" />
        <Skeleton variant="badge" className="w-28" />
        <Skeleton variant="badge" className="w-24" />
        <Skeleton variant="badge" className="w-20" />
      </div>

      {/* Lista de salvos */}
      <ul className="space-y-3" aria-label="Carregando posts salvos">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" lines={3} size="md" />
              </div>
              <Skeleton variant="circle" className="h-9 w-9 shrink-0" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Skeleton variant="badge" className="w-24" />
                <Skeleton variant="badge" className="w-20" />
              </div>
              <Skeleton variant="text" size="sm" width="6rem" />
            </div>
          </li>
        ))}
      </ul>

      <span className="sr-only">Carregando posts salvos…</span>
    </div>
  );
}
