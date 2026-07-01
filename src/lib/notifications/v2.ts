// ============================================================================
// NOTIFICATIONS V2 — Index (W36)
// ============================================================================
// Barrel de exportação da camada v2 (preferências matriz, context-aware,
// dispatcher multi-canal, templates, digests, push setup).
//
// Não toca os arquivos W30 (email.ts, push.ts, push-server.ts,
// preferences.ts, triggers.ts, smart-scheduler.ts) — coexiste por cima.
// ============================================================================

export * from './preferences-v2';
export * from './context-aware';
export * from './dispatcher-v2';
export * from './templates/catalog';
export * from './digests/builder';
export * from './push-setup';

// ============================================================================
// Self-check consolidado (1 chamada para build pipeline / CI)
// ============================================================================

export function notificationsV2SelfCheck(): { ok: boolean; details: string[] } {
  const details: string[] = [];
  const checks = [
    preferencesV2SelfCheck,
    contextAwareSelfCheck,
    dispatcherV2SelfCheck,
    digestSelfCheck,
    pushSetupSelfCheck,
  ];
  for (const fn of checks) {
    const r = fn();
    if (!r.ok) details.push(`${fn.name} falhou: ${r.details.join('; ')}`);
  }

  // meta
  details.push(`meta: ${Object.values({
    preferences: PREFERENCES_V2_META.categories,
    cells: PREFERENCES_V2_META.cells,
    templates: 9, // 8 + marketing
    channels: PREFERENCES_V2_META.channels,
  }).join(' / ')}`);

  return { ok: details.length === 0 || details.every((d) => d.startsWith('meta:')), details };
}
