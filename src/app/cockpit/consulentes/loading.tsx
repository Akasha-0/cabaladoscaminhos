/**
 * loading.tsx — Skeleton de loading para /cockpit/consulentes
 * Aparece automaticamente durante Suspense boundaries.
 *
 * Refs: T7.1 (Sprint 8 UX), docs/05_uiux-spec.md
 */

import { LoadingOrbital } from '@/components/cockpit/dossier/LoadingOrbital';

export default function ConsulentesLoading(): JSX.Element {
  return (
    <div className="ramiro min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
      <LoadingOrbital />
      <p className="text-sm text-zinc-600 dark:text-zinc-400 animate-pulse">
        Carregando consulentes…
      </p>
    </div>
  );
}
