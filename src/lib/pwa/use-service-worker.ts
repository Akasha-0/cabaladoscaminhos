'use client';

import { useEffect } from 'react';

/**
 * useServiceWorker — registra o service worker do Akasha PWA.
 *
 * Ativação:
 * - Dev mode: pula registro
 * - Browser sem SW: ignora silenciosamente
 * - Atualização: dispara `pwa:updated` event para o app mostrar prompt
 */
export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // Detecta nova versão
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (!installing) return;
            installing.addEventListener('statechange', () => {
              if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent('pwa:updated'));
              }
            });
          });
        })
        .catch(() => {
          // Falha de registro é silenciosa (não quebra UX)
        });
    };

    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
  }, []);
}
