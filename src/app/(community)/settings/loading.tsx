/**
 * Wave 21 — Settings route loading skeleton.
 *
 * Espelha o layout da settings page (header + tabs + panel) para que
 * não haja layout shift quando o JS hidratar.
 */

import { Skeleton } from '@/components/design-system/skeleton';

export default function SettingsLoading() {
  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      data-testid="settings-loading"
      role="status"
      aria-label="Carregando configurações"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <Skeleton variant="text" size="sm" width="6rem" />
          <Skeleton variant="text" size="lg" width="12rem" />
          <Skeleton variant="text" size="sm" width="22rem" />
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/50 pb-2 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="badge"
              width={`${4 + i}rem`}
              className="h-10"
            />
          ))}
        </div>

        {/* Panel */}
        <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-5 space-y-4">
          <div className="space-y-1">
            <Skeleton variant="text" size="md" width="10rem" />
            <Skeleton variant="text" size="sm" width="20rem" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton variant="text" size="sm" width="6rem" />
              <Skeleton variant="rect" className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton variant="text" size="sm" width="6rem" />
              <Skeleton variant="rect" className="h-11 w-full rounded-lg" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" size="sm" width="6rem" />
            <Skeleton variant="rect" className="h-24 w-full rounded-lg" />
          </div>
        </div>

        {/* Save bar */}
        <div className="rounded-2xl bg-slate-900/95 border border-slate-800/70 p-3 flex items-center justify-between gap-3">
          <Skeleton variant="text" size="sm" width="10rem" />
          <Skeleton variant="rect" className="h-11 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}