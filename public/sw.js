// ============================================================================
// AKASHA PORTAL — Service Worker v2
// ============================================================================
// Wave 20 — PWA Evolution
//
// Estratégias de cache:
//   - App shell (HTML root, /feed, /dashboard)         : network-first c/ timeout 3s → cache → offline.html
//   - Static assets (_next/static, /icons, /favicon)   : cache-first + background revalidate
//   - API GET (/api/feed, /api/posts, /api/search)     : stale-while-revalidate (TTL 5 min)
//   - API GET (/api/feed/trending)                     : network-first c/ cache fallback
//   - API POST/PATCH/PUT/DELETE                        : network-only (nunca cachear mutations)
//
// Background sync:
//   - SW escuta 'sync' event com tag 'sync-mutations'
//   - Pede para clients fazerem flush do IndexedDB queue
//   - Clients fazem POST e reportam resultado → SW posta mensagem 'SYNC_COMPLETE'
//
// Mensagens para clients:
//   - SW_UPDATED          : novo SW instalado e waiting
//   - SW_ACTIVATED        : novo SW assumiu controle
//   - SYNC_REQUESTED      : peça para client processar queue
//   - SYNC_COMPLETE       : client terminou de processar queue
//   - CACHE_CLEARED       : caches limpos via mensagem
//   - CACHE_STATS         : estatísticas de cache
//
// Compatibilidade:
//   - Background Sync API: Chrome/Edge ✅ · Firefox ⚠️ (parcial) · Safari ❌
//   - iOS Safari: PWA instalado tem limitações de SW, mas cache + offline.html funciona
//   - Push API: iOS 16.4+ em PWAs instalados ✅
// ============================================================================

const VERSION = 'akasha-v2';
const STATIC_CACHE = `${VERSION}-static`;
const API_CACHE = `${VERSION}-api`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const API_TTL_MS = 5 * 60 * 1000;       // 5 min
const MAX_CACHE_AGE_MS = 30 * 24 * 60 * 60 * 1000;  // 30 dias
const NAV_TIMEOUT_MS = 3000;            // 3s fallback para network-first em navegação

// ============================================================================
// PRECACHE — Shell crítico (sempre disponível offline)
// ============================================================================
const PRECACHE_URLS = [
  '/',
  '/feed',
  '/dashboard',
  '/calendario',
  '/chat',
  '/manifest.json',
  '/offline',
  '/offline.html',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const ALLOWED_CACHES = [STATIC_CACHE, API_CACHE, RUNTIME_CACHE];

// ============================================================================
// INSTALL — pre-cache shell + skip waiting
// ============================================================================
self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing...`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) =>
        // addAll é atômico — se UM url falhar, nenhum é adicionado
        cache.addAll(PRECACHE_URLS).catch((err) => {
          console.warn('[SW] Precache partial failure (continuing):', err);
          // Tenta individualmente para isolar quais falharam
          return Promise.all(
            PRECACHE_URLS.map((url) =>
              cache.add(url).catch((e) =>
                console.warn(`[SW] Skipped precache: ${url}`, e.message)
              )
            )
          );
        })
      )
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW] Install failed:', err))
  );
});

// ============================================================================
// ACTIVATE — limpa caches antigos, assume clientes, notifica
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating...`);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name.startsWith('akasha-') && !ALLOWED_CACHES.includes(name))
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        )
      )
      .then(() => cleanupOldEntries())
      .then(() => self.clients.claim())
      .then(() => notifyAllClients({ type: 'SW_ACTIVATED', version: VERSION }))
      .catch((err) => console.error('[SW] Activate failed:', err))
  );
});

// ============================================================================
// FETCH — Roteador principal
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignora extensões e schemas não-http(s)
  if (!['http:', 'https:'].includes(new URL(request.url).protocol)) return;
  if (request.url.startsWith('chrome-extension://')) return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isApi = url.pathname.startsWith('/api/');

  // 1. Mutations (POST/PUT/PATCH/DELETE) — SEMPRE network-only
  //    Não cachear; se falhar, o client trata com background sync
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (sameOrigin) {
      // Não intercepta — deixa ir para rede. Se o SW estiver offline,
      // o client (já online-detectado) enfileira para background sync.
      return;
    }
    return;
  }

  // 2. API GET — SWR com TTL
  if (isApi && sameOrigin) {
    // Endpoints críticos que precisam de dados frescos: network-first
    const isCritical = url.pathname.includes('/notifications') ||
                       url.pathname.includes('/me') ||
                       url.pathname.includes('/auth/');
    if (isCritical) {
      event.respondWith(networkFirstWithCache(request, API_CACHE, API_TTL_MS));
    } else {
      event.respondWith(staleWhileRevalidate(request, API_CACHE));
    }
    return;
  }

  // 3. Navigation (HTML) — network-first com timeout + offline page
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 4. Static assets — cache-first + background revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'manifest'
  ) {
    if (sameOrigin) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else {
      // CDN (fonts, images) — SWR com cache mais curto
      event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    }
    return;
  }

  // 5. _next/data + _next/static — cache-first (Next.js chunks versionados)
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 6. Same-origin other — SWR
  if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // 7. Default — network with cache fallback
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached || new Response('Offline', { status: 503 });
    })
  );
});

// ============================================================================
// NAVIGATION HANDLER — network-first com timeout + offline fallback
// ============================================================================
async function handleNavigation(request) {
  try {
    const response = await fetchWithTimeout(request, NAV_TIMEOUT_MS);

    // Cache successful navigation
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Network falhou ou timeout — tenta cache primeiro
    const cached = await caches.match(request);
    if (cached) {
      console.log(`[SW] Serving cached nav: ${request.url}`);
      return cached;
    }

    // Tenta /offline page em Next.js
    const offlineNext = await caches.match('/offline');
    if (offlineNext) return offlineNext;

    // Fallback para /offline.html estático
    const offlineHtml = await caches.match('/offline.html');
    if (offlineHtml) return offlineHtml;

    // Last resort
    return new Response(
      '<!DOCTYPE html><html><body><h1>Offline</h1><p>Sem conexão. <a href="/">Início</a></p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

// Fetch com timeout via AbortController
function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error('timeout'));
    }, timeoutMs);
    fetch(request.clone(), { signal: controller.signal })
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ============================================================================
// CACHE STRATEGIES
// ============================================================================

/** Cache-first: serve do cache, atualiza em background */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    // Refresh em background sem bloquear
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          caches.open(cacheName).then((cache) => cache.put(request, response));
        }
      })
      .catch(() => {});
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Offline', { status: 503 });
  }
}

/** Network-first: tenta rede, fallback para cache, mesmo se stale */
async function networkFirstWithCache(request, cacheName, maxAge) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const headers = new Headers(response.headers);
      headers.set('sw-cached-time', Date.now().toString());
      const body = await response.clone().blob();
      cache.put(
        request,
        new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })
      );
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) {
      const cachedTime = cached.headers.get('sw-cached-time');
      if (cachedTime && maxAge && Date.now() - parseInt(cachedTime, 10) > maxAge) {
        console.warn('[SW] Serving stale cache:', request.url);
      }
      return cached;
    }
    return new Response(
      JSON.stringify({ error: 'Offline', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/** Stale-while-revalidate: serve cache enquanto atualiza */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] pushsubscriptionchange', event);
  event.waitUntil(
    (async () => {
      try {
        const oldEndpoint = event.oldSubscription?.endpoint;
        const newSub = event.newSubscription;
        if (!newSub) {
          if (oldEndpoint) {
            await fetch('/api/notifications/push/subscribe', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint: oldEndpoint }),
            }).catch(() => {});
          }
          return;
        }
        const json = newSub.toJSON();
        if (!json.keys?.p256dh || !json.keys?.auth) return;
        await fetch('/api/notifications/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: newSub.endpoint,
            keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          }),
        }).catch(() => {});
        if (oldEndpoint && oldEndpoint !== newSub.endpoint) {
          await fetch('/api/notifications/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: oldEndpoint }),
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('[SW] pushsubscriptionchange failed:', err);
      }
    })()
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Akasha Portal', body: event.data.text() };
  }

  const options = {
    body: data.body || 'Nova atualização espiritual',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    image: data.image,
    vibrate: [100, 50, 100, 50, 100],
    dir: 'auto',
    lang: 'pt-BR',
    timestamp: Date.now(),
    tag: data.tag || 'akasha-notification',
    renotify: !!data.tag,
    requireInteraction: data.requireInteraction || false,
    silent: false,
    data: {
      url: data.url || '/dashboard',
      actionId: data.actionId,
      timestamp: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Akasha Portal', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss' || event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            return client.navigate(targetUrl).then(() => client.focus());
          }
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ============================================================================
// BACKGROUND SYNC — offline mutations
// ============================================================================
//
// Fluxo:
//   1. Client detecta offline (navigator.onLine === false)
//   2. Client enfileira mutations no IndexedDB (sync-queue)
//   3. Client registra sync: registration.sync.register('sync-mutations')
//   4. SW recebe 'sync' event → posta SYNC_REQUESTED para clients
//   5. Client (online) faz flush do queue via fetch
//   6. Client reporta resultado → SW posta SYNC_COMPLETE para todos
//   7. UI mostra "X items sincronizados"
//
// Compatibilidade:
//   - Chrome/Edge ✅ Background Sync API + Periodic Background Sync
//   - Firefox ⚠️ Suporte parcial (verificar feature flag)
//   - Safari ❌ Fallback: polling no event 'online' do client
//
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    console.log(`[SW ${VERSION}] Background sync triggered: ${event.tag}`);
    event.waitUntil(notifyAllClients({ type: 'SYNC_REQUESTED', tag: event.tag }));
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-refresh') {
    console.log(`[SW ${VERSION}] Periodic sync: ${event.tag}`);
    event.waitUntil(refreshContent());
  }
});

async function refreshContent() {
  const routes = ['/', '/feed', '/dashboard'];
  const cache = await caches.open(RUNTIME_CACHE);
  await Promise.all(
    routes.map((route) =>
      fetch(route)
        .then((response) => {
          if (response.ok) cache.put(route, response);
        })
        .catch(() => {})
    )
  );
}

// ============================================================================
// MESSAGE HANDLER — Comandos do app
// ============================================================================
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys()
          .then((names) => Promise.all(names.map((name) => caches.delete(name))))
          .then(() => event.source?.postMessage({ type: 'CACHE_CLEARED' }))
      );
      break;

    case 'CLEAR_API_CACHE':
      event.waitUntil(caches.delete(API_CACHE));
      break;

    case 'PRECACHE_URLS':
      if (Array.isArray(payload?.urls)) {
        event.waitUntil(
          caches.open(RUNTIME_CACHE).then((cache) =>
            Promise.all(
              payload.urls.map((url) =>
                cache.add(url).catch((err) =>
                  console.warn(`[SW] Precache skip: ${url}`, err.message)
                )
              )
            )
          )
        );
      }
      break;

    case 'GET_VERSION':
      event.source?.postMessage({ type: 'SW_VERSION', version: VERSION });
      break;

    case 'GET_CACHE_STATS':
      event.waitUntil(
        caches.keys().then(async (names) => {
          const stats = {};
          for (const name of names) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            stats[name] = keys.length;
          }
          event.source?.postMessage({ type: 'CACHE_STATS', stats });
        })
      );
      break;

    // Quando o client termina o flush do queue
    case 'SYNC_COMPLETE':
      console.log(`[SW ${VERSION}] Sync complete: ${payload?.synced ?? 0}/${payload?.total ?? 0} items`);
      event.waitUntil(
        notifyAllClients({
          type: 'SYNC_COMPLETE',
          synced: payload?.synced ?? 0,
          total: payload?.total ?? 0,
          failures: payload?.failures ?? [],
        })
      );
      break;
  }
});

// ============================================================================
// UTILITIES
// ============================================================================

async function notifyAllClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => client.postMessage(message));
}

async function cleanupOldEntries() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  const now = Date.now();

  for (const request of keys) {
    const response = await cache.match(request);
    if (!response) continue;
    const dateHeader = response.headers.get('date');
    if (dateHeader) {
      const age = now - new Date(dateHeader).getTime();
      if (age > MAX_CACHE_AGE_MS) {
        await cache.delete(request);
      }
    }
  }
}
