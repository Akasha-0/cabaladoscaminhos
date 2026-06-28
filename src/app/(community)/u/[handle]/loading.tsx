/**
 * Wave 24 — Public profile route loading skeleton.
 *
 * Espelha o layout de /u/[handle] (header com avatar/cover + tabs +
 * panel) para evitar layout shift durante Suspense fallback.
 */

import { Skeleton } from '@/components/design-system/skeleton';

export default function ProfileLoading() {
  return (
    <div
      className="mx-auto max-w-4xl px-4 py-6 space-y-6"
      data-testid="profile-loading"
      role="status"
      aria-label="Carregando perfil"
    >
      {/* Cover */}
      <Skeleton variant="image" className="h-40 sm:h-52 w-full rounded-2xl" />

      {/* Avatar + identidade */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 px-2">
        <Skeleton
          variant="circle"
          className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-slate-950 shrink-0"
        />
        <div className="flex-1 space-y-2 sm:pb-2">
          <Skeleton variant="text" size="lg" width="14rem" />
          <Skeleton variant="text" size="sm" width="8rem" />
          <div className="flex gap-2 pt-2">
            <Skeleton variant="badge" />
            <Skeleton variant="badge" />
          </div>
        </div>
        <div className="flex gap-2 sm:pb-2">
          <Skeleton variant="button" />
          <Skeleton variant="button" />
        </div>
      </div>

      {/* Bio */}
      <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-4 space-y-2">
        <Skeleton variant="text" size="sm" width="6rem" />
        <Skeleton variant="text" lines={3} size="md" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-4 space-y-2"
          >
            <Skeleton variant="text" size="sm" width="4rem" />
            <Skeleton variant="text" size="lg" width="3rem" />
          </div>
        ))}
      </div>

      {/* Tabs + content */}
      <div className="flex gap-2 border-b border-slate-800/50 pb-2">
        <Skeleton variant="badge" className="w-24" />
        <Skeleton variant="badge" className="w-24" />
        <Skeleton variant="badge" className="w-24" />
      </div>
      <div className="space-y-3">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>

      <span className="sr-only">Carregando perfil…</span>
    </div>
  );
}
