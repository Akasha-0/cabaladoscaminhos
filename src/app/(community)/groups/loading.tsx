/**
 * Wave 24 — Groups index loading skeleton.
 *
 * Espelha o layout de /groups (header + busca + grid de cards de grupo).
 */

import { Skeleton, GroupCardSkeleton } from '@/components/design-system/skeleton';

export default function GroupsLoading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6 space-y-6"
      data-testid="groups-loading"
      role="status"
      aria-label="Carregando grupos"
    >
      {/* Header */}
      <header className="space-y-2">
        <Skeleton variant="text" size="sm" width="6rem" />
        <Skeleton variant="text" size="lg" width="14rem" />
        <Skeleton variant="text" size="md" width="28rem" />
      </header>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Skeleton variant="rect" className="h-10 w-full sm:w-72 rounded-xl" />
        <Skeleton variant="rect" className="h-10 w-full sm:w-44 rounded-xl" />
      </div>

      {/* Grid de grupos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <GroupCardSkeleton />
        <GroupCardSkeleton />
        <GroupCardSkeleton />
        <GroupCardSkeleton />
        <GroupCardSkeleton />
        <GroupCardSkeleton />
      </div>

      <span className="sr-only">Carregando grupos…</span>
    </div>
  );
}
