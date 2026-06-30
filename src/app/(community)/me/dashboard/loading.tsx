/**
 * Wave 21 — Dashboard route loading skeleton.
 *
 * Espelha o layout do dashboard page (KPIs + chart + listas) com blocos
 * shimmer para evitar layout shift durante o fetch inicial.
 */

import { Skeleton } from '@/components/design-system/skeleton';

export default function DashboardLoading() {
  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      data-testid="dashboard-loading"
      role="status"
      aria-label="Carregando dashboard"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <Skeleton variant="text" size="sm" width="6rem" />
          <Skeleton variant="text" size="lg" width="14rem" />
          <Skeleton variant="text" size="sm" width="20rem" />
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton variant="text" size="sm" width="4rem" />
                <Skeleton variant="circle" className="h-5 w-5" />
              </div>
              <Skeleton variant="text" size="lg" width="4rem" className="mt-2" />
            </div>
          ))}
        </section>

        {/* Chart + Continue */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-5 space-y-3">
              <Skeleton variant="text" size="md" width="12rem" />
              <Skeleton variant="text" size="sm" width="14rem" />
              <Skeleton variant="rect" className="h-32 w-full" />
            </div>
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-5 space-y-3">
              <Skeleton variant="text" size="md" width="10rem" />
              <Skeleton variant="rect" className="h-20 w-full rounded-lg" />
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-5 space-y-3">
              <Skeleton variant="text" size="md" width="10rem" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="circle" className="h-9 w-9" />
                  <div className="flex-1 space-y-1">
                    <Skeleton variant="text" size="sm" width="60%" />
                    <Skeleton variant="text" size="sm" width="40%" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}