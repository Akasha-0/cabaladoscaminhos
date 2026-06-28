/**
 * Wave 24 — Onboarding route loading skeleton.
 *
 * Espelha o wizard de onboarding (passo a passo com progresso + cards
 * de escolha). Mobile-first: passos vertical scrolláveis.
 */

import { Skeleton } from '@/components/design-system/skeleton';

export default function OnboardingLoading() {
  return (
    <div
      className="min-h-screen px-4 py-8"
      data-testid="onboarding-loading"
      role="status"
      aria-label="Carregando onboarding"
    >
      <div className="max-w-xl mx-auto space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <Skeleton variant="text" size="sm" width="8rem" />
            <Skeleton variant="text" size="sm" width="3rem" />
          </div>
          <Skeleton variant="rect" className="h-1.5 w-full rounded-full" />
        </div>

        {/* Step heading */}
        <div className="space-y-3 text-center">
          <Skeleton variant="text" size="lg" className="mx-auto" width="20rem" />
          <Skeleton variant="text" size="md" className="mx-auto" width="28rem" />
        </div>

        {/* Choice cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 space-y-3"
            >
              <Skeleton variant="circle" className="h-10 w-10" />
              <Skeleton variant="text" size="md" width="10rem" />
              <Skeleton variant="text" lines={2} size="sm" />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Skeleton variant="button" />
          <Skeleton variant="button" className="w-32" />
        </div>
      </div>

      <span className="sr-only">Preparando seu espaço…</span>
    </div>
  );
}
