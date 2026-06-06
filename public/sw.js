/**
 * Service Worker — Akasha PWA
 *
 * Estratégia:
 * - App shell: network-first com fallback cache
 * - Dados dinâmicos (consult, daily-reading): network-only (NUNCA cache)
 * - Ativos estáticos (imagens, fontes): cache-first
 *
 * Versão: SW-v1. Incrementar a constante abaixo invalida caches antigos.
 */

const CACHE_VERSION = 'SW-v1';
const SHELL_CACHE = `akasha-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `akasha-static-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',
  '/mandala',
  '/diario',
  '/manifest.json',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {
      // Ignore se algum recurso do shell falhar (ex.: /offline ainda não existe)
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. POST/PUT/DELETE: nunca cacheia
  if (request.method !== 'GET') return;

  // 2. Endpoints dinâmicos sensíveis: network-only (NUNCA cachear)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/consult') ||
    url.pathname.includes('/transits/today') ||
    url.pathname.includes('/admin/')
  ) {
    return; // bypass SW
  }

  // 3. Ativos estáticos: cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif|webp|woff2?)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Páginas do app shell: network-first com fallback cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // 5. Default: network com timeout implícito
  return;
});

// Mensagem de SKIP_WAITING para forçar ativação de nova versão
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
