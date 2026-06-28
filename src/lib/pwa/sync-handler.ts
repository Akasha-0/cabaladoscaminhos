// ============================================================================
// SYNC HANDLER — listener para mensagens do SW
// ============================================================================
// Wave 20 — PWA Evolution
//
// Conecta o SW ↔ UI. Quando o SW posta 'SYNC_REQUESTED', este handler faz
// flush do queue e reporta 'SYNC_COMPLETE' de volta.
//
// Também expõe um useSyncListener hook para componentes React ouvirem o
// resultado e mostrarem "X items sincronizados".
// ============================================================================

'use client';

import { useEffect } from 'react';
import { flushQueue, countPending } from './sync-queue';

// ============================================================================
// BROWSER ENTRY POINT — registra listeners
// ============================================================================

let registered = false;

/**
 * Inicializa os listeners de mensagem do SW + fallback do event 'online'.
 * Idempotente — chame múltiplas vezes, só registra uma.
 */
export function registerSyncHandlers(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (registered) return () => {};
  if (!('serviceWorker' in navigator)) return () => {};
  registered = true;

  // Quando o SW pede flush
  const onMessage = (event: MessageEvent) => {
    const { type, payload } = event.data ?? {};
    if (type === 'SYNC_REQUESTED') {
      handleSyncRequest(payload);
    }
  };

  // Fallback para browsers sem Background Sync API (Safari, Firefox antigo)
  const onOnline = () => {
    // Tenta via SW primeiro, depois fallback
    handleSyncRequest({ source: 'online-event' });
    // Re-registra sync caso o SW tenha suporte
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          const sync = (reg as ServiceWorkerRegistration & {
            sync?: { register: (tag: string) => Promise<void> };
          }).sync;
          if (sync) {
            sync.register('sync-mutations').catch(() => {});
          }
        })
        .catch(() => {});
    }
  };

  navigator.serviceWorker.addEventListener('message', onMessage);
  window.addEventListener('online', onOnline);

  // Flush inicial se já há pendentes
  countPending().then((n) => {
    if (n > 0) handleSyncRequest({ source: 'mount', pending: n });
  });

  return () => {
    navigator.serviceWorker.removeEventListener('message', onMessage);
    window.removeEventListener('online', onOnline);
    registered = false;
  };
}

let syncing = false;

async function handleSyncRequest(meta: { source?: string; pending?: number } = {}) {
  if (syncing) return; // já em curso
  syncing = true;
  try {
    const pending = await countPending();
    if (pending === 0) {
      syncing = false;
      return;
    }
    console.log(`[sync-handler] Flushing ${pending} mutations (${meta.source})`);
    const result = await flushQueue();
    // Reporta para o SW, que propaga para todos os clients
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({
        type: 'SYNC_COMPLETE',
        payload: {
          synced: result.synced,
          total: result.synced + result.failed,
          failures: result.failures.map((f) => ({
            id: f.id,
            summary: f.summary,
            lastError: f.lastError,
          })),
        },
      });
    }
  } catch (err) {
    console.error('[sync-handler] Flush failed:', err);
  } finally {
    syncing = false;
  }
}

// ============================================================================
// REACT HOOK — escuta SYNC_COMPLETE
// ============================================================================

type SyncListener = (event: {
  synced: number;
  total: number;
  failures: Array<{ id?: number; summary: string; lastError?: string }>;
}) => void;

/**
 * Hook para componentes ouvirem eventos de background sync.
 * Auto-registra os handlers no mount e desregistra no unmount.
 */
export function useSyncListener(onSync: SyncListener): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const cleanup = registerSyncHandlers();

    const handler = (event: MessageEvent) => {
      const { type, payload } = event.data ?? {};
      if (type === 'SYNC_COMPLETE') {
        onSync({
          synced: payload?.synced ?? 0,
          total: payload?.total ?? 0,
          failures: payload?.failures ?? [],
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handler);
      cleanup();
    };
  }, [onSync]);
}
