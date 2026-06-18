/**
 * Service Worker — Akasha PWA
 *
 * Estratégia de cache (Doc 25 §10 / T6):
 * - App shell + estáticos (/icons/*, /fonts/*, /_next/static/*): cache-first
 * - Trânsitos diários (/api/akasha/transits/today): network-first, fallback cache,
 *   e 503 com JSON se totalmente offline (o usuário vê aviso em vez de quebrar)
 * - HTML (navegação): stale-while-revalidate (mostra cache, atualiza em background)
 * - Demais /api/* sensíveis (consult, auth, credits): bypass — nunca cachear
 * Versão: akasha-v0.0.4-pwa-v2. Incrementar invalida caches antigos.
const CACHE_VERSION = 'akasha-v0.0.4-pwa-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon-180.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => {
        // Não bloqueia install se algum asset do shell ainda não existir.
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Apenas GET entra no SW
  if (request.method !== 'GET') return;

  // 2. Endpoints sensíveis: nunca cachear (bypass direto)
  if (
    url.pathname.startsWith('/api/akasha/auth/') ||
    url.pathname.startsWith('/api/akasha/credits/') ||
    url.pathname.startsWith('/api/akasha/consult') ||
    url.pathname.startsWith('/api/akasha/checkout') ||
    url.pathname.startsWith('/api/akasha/subscription') ||
    url.pathname.includes('/admin/')
  ) {
    return;
  }

  // 3. Cache-first para estáticos (ícones, fontes, assets do Next)
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif|webp|woff2?|ico)$/i)
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

  // 4. Network-first com fallback para trânsitos diários (offline-first friendly)
  if (url.pathname.startsWith('/api/akasha/transits/today')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({
              error: 'offline',
              message: 'Trânsitos diários indisponíveis offline',
            }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }
  // 5. Stale-while-revalidate para Mandala (cachea dados astrológicos do usuário)
  if (url.pathname.startsWith('/api/akasha/mandala')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? await networkPromise;
      })()
    );
    return;
  }

  // 5. Stale-while-revalidate para navegação HTML
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? await networkPromise;
      })()
    );
    return;
  }

  // 6. Default: rede direta (não cacheia)
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
