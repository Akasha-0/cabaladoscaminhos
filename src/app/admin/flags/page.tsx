// ============================================================================
// ADMIN — Feature Flags Dashboard (Wave 20)
// ============================================================================
// Mobile-first UI para visualizar e togglar flags em dev/staging.
//
// O que esta página faz:
//   1. Lista todas as flags do registry
//   2. Mostra o estado atual (default / override / rollout %)
//   3. Permite ligar/desligar (PATCH /api/flags/[name])
//   4. Permite adicionar userId a whitelist
//   5. Mostra info de audit (updatedBy, updatedAt)
//
// Mobile-first: layout em cards empilhados, controles tocáveis (min 44px).
// ============================================================================

import * as React from 'react';
import { listFlags, type FeatureFlagDefinition } from '@/lib/feature-flags/flags';
import { readFlags, type FlagState } from '@/lib/feature-flags/storage';
import { FlagRow } from './_components/flag-row';

// ============================================================================
// Force dynamic — storage é I/O
// ============================================================================

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================================
// Page
// ============================================================================

export default async function FlagsAdminPage() {
  const definitions = listFlags();
  const snapshot = await readFlags();

  // Ordena: percentage primeiro (mais críticos), depois boolean, depois whitelist
  const ordered = [...definitions].sort((a, b) => {
    const order = { percentage: 0, boolean: 1, whitelist: 2 } as const;
    return order[a.type] - order[b.type];
  });

  return (
    <main
    id="main-content"
    tabIndex={-1}
      className="focus:outline-none mx-auto min-h-screen w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8"
      aria-label="Feature flags admin"
    >
      <header className="mb-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">Feature Flags</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {definitions.length} flags registradas · {Object.keys(snapshot).length} com
          override
        </p>
      </header>

      <section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm sm:p-4">
        <p className="font-medium text-amber-900">⚠️ Dev only</p>
        <p className="mt-1 text-amber-800">
          Mutações desabilitadas em produção. Em dev/staging, toggles persistem
          em <code className="rounded bg-amber-100 px-1">/data/flags.json</code>.
        </p>
      </section>

      <ul className="space-y-3" role="list">
        {ordered.map((def) => {
          const state = snapshot[def.key] ?? null;
          return (
            <li key={def.key}>
              <FlagRow definition={def} state={state} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
