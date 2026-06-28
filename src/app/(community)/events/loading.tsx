/**
 * Wave 24 — Events route loading skeleton.
 *
 * Espelha o layout de /events (header com filtros + grid de cards de
 * evento).
 */

import { Skeleton } from '@/components/design-system/skeleton';

export default function EventsLoading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-6 space-y-6"
      data-testid="events-loading"
      role="status"
      aria-label="Carregando eventos"
    >
      {/* Header */}
      <header className="space-y-2">
        <Skeleton variant="text" size="sm" width="6rem" />
        <Skeleton variant="text" size="lg" width="14rem" />
        <Skeleton variant="text" size="md" width="28rem" />
      </header>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Skeleton variant="rect" className="h-10 w-full sm:w-72 rounded-xl" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Skeleton variant="badge" className="w-20" />
          <Skeleton variant="badge" className="w-24" />
          <Skeleton variant="badge" className="w-20" />
          <Skeleton variant="badge" className="w-24" />
        </div>
      </div>

      {/* Grid de eventos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 space-y-3"
          >
            <Skeleton variant="image" className="h-32 w-full rounded-xl" />
            <div className="flex items-center gap-2">
              <Skeleton variant="badge" className="w-16" />
              <Skeleton variant="text" size="sm" width="5rem" />
            </div>
            <Skeleton variant="text" size="md" />
            <Skeleton variant="text" lines={2} size="sm" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton variant="text" size="sm" width="6rem" />
              <Skeleton variant="button" className="w-24" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Carregando eventos…</span>
    </div>
  );
}
