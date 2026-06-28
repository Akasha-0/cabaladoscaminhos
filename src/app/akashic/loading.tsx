/**
 * Wave 17 — Akashic Records route loading fallback.
 * Heavy content → uses full PageLoading with spiritual anchor.
 */

import { PageLoading, ProgressBar } from '@/components/design-system/loading-states';

export default function AkashicLoading() {
  return (
    <div className="space-y-8">
      <PageLoading
        title="Consultando os registros…"
        description="Cruzando os 4 mapas do seu mapa interior."
      />
      <div className="mx-auto max-w-md rounded-xl border border-slate-800/50 bg-slate-900/40 p-5">
        <ProgressBar value={45} label="Sincronização" tone="violet" />
      </div>
    </div>
  );
}
