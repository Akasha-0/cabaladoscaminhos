'use client';

import { useServiceWorker } from '@/lib/pwa/use-service-worker';

/**
 * Client component que registra o Service Worker do Akasha PWA.
 * - Em dev (NODE_ENV !== 'production') o hook é no-op.
 * - Em produção registra `/sw.js` com scope `/`.
 * - Detecta nova versão e dispara `pwa:updated` (consumível por PwaInstallPrompt).
 */
export function ServiceWorkerRegistrar() {
  useServiceWorker();
  return null;
}
