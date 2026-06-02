/**
 * loading.tsx — Skeleton de loading para /cockpit/leituras/[id]
 * Aparece automaticamente durante Suspense boundaries.
 *
 * Refs: T7.1 (Sprint 8 UX), docs/05_uiux-spec.md
 */

import React from 'react';
import { LoadingOrbital } from '@/components/cockpit/dossier/LoadingOrbital';

export default function LeituraDetailLoading(): React.JSX.Element {
  return (
    <div className="ramiro min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
      <LoadingOrbital progress={{ current: 0, total: 0 }} errors={[]} />
      <p className="text-sm text-zinc-600 dark:text-zinc-400 animate-pulse">Carregando leitura…</p>
    </div>
  );
}
