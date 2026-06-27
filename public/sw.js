// ============================================================================
// AKASHA PORTAL — Service Worker
// ============================================================================
// Estratégias:
// - Static assets (CSS/JS/imgs/fonts): cache-first + atualização em background
// - API: network-first com fallback para cache (5 min TTL)
// - Navigation (HTML): network-first com offline.html fallback
// - Push notifications: suportadas
// - Background sync: enfileiramento local
// ============================================================================

const VERSION = 'akasha-v1';
const STATIC_CACHE = `${VERSION}-static`;
const API_CACHE = `${VERSION}-api`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 min
const MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 dias

// ============================================================================
// PRECACHE — Shell crítico (sempre disponível offline)
// ============================================================================
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/calendario',
  '/chat',
  '/feed',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ============================================================================
// INSTALL
// ============================================================================
self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing...`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW] Install failed:', err))
  );
});

// ============================================================================
// ACTIVATE — Limpa caches antigos
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating...`);
  const allowedCaches = [STATIC_CACHE, API_CACHE, RUNTIME_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !allowedCaches.includes(name))
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        // Notify all clients that a new SW took over
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_ACTIVATED', version: VERSION });
          });
        });
      })
  );
});

// ============================================================================
// FETCH — Roteador principal
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignora requests não-GET, extensões do browser, requests cross-origin sem CORS
  if (request.method !== 'GET') return;
  if (request.url.startsWith('chrome-extension://')) return;
  if (request.url.includes('chrome-extension')) return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1. API requests — network-first com cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, API_CACHE_DURATION));
    return;
  }

  // 2. Navigation (HTML pages) — network-first, offline.html como fallback
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 3. Static assets (CSS/JS/imgs/fonts) — cache-first
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
      event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    }
    return;
  }

  // 4. Same-origin other — stale-while-revalidate
  if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // 5. Default — network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ============================================================================
// NAVIGATION HANDLER — com offline.html fallback
// ============================================================================
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    // Cache successful navigation responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Network failed — try cache first
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fallback para offline page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;

    // Last resort: minimal inline HTML
    return new Response(
      `<!DOCTYPE html><html><body><h1>Offline</h1><p>Sem conexão. <a href="/">Recarregar</a></p></body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

// ============================================================================
// CACHE STRATEGIES
// ============================================================================

/** Cache-first: serve do cache, atualiza em background */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    // Refresh in background (não bloqueia response)
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

/** Network-first: tenta rede, fallback para cache */
async function networkFirstWithCache(request, cacheName, maxAge) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      // Adiciona timestamp no header pra TTL
      const headers = new Headers(response.headers);
      headers.set('sw-cached-time', Date.now().toString());
      const body = await response.clone().blob();
      cache.put(request, new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      }));
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) {
      // Verifica TTL
      const cachedTime = cached.headers.get('sw-cached-time');
      if (cachedTime && maxAge && Date.now() - parseInt(cachedTime) > maxAge) {
        // Cache stale — ainda retorna (melhor que nada)
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
    vibrate: [100, 50, 100, 50, 100], // pattern mais rico
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

  event.waitUntil(
    self.registration.showNotification(data.title || 'Akasha Portal', options)
  );
});

// ============================================================================
// NOTIFICATION CLICK
// ============================================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss' || event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Foca janela existente se mesma origem
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          // Navega se URL diferente
          if ('navigate' in client) {
            return client.navigate(targetUrl).then(() => client.focus());
          }
          return client.focus();
        }
      }
      // Abre nova janela
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ============================================================================
// BACKGROUND SYNC
// ============================================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncQueuedData());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-refresh') {
    event.waitUntil(refreshContent());
  }
});

async function syncQueuedData() {
  // Notifica clients para processar queue local
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_REQUESTED' });
  });
}

async function refreshContent() {
  console.log('[SW] Background content refresh');
  // Pré-cache rotas importantes
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
        caches.keys().then((names) =>
          Promise.all(names.map((name) => caches.delete(name)))
        ).then(() => event.source?.postMessage({ type: 'CACHE_CLEARED' }))
      );
      break;

    case 'CLEAR_API_CACHE':
      event.waitUntil(caches.delete(API_CACHE));
      break;

    case 'PRECACHE_URLS':
      if (Array.isArray(payload?.urls)) {
        event.waitUntil(
          caches.open(RUNTIME_CACHE).then((cache) =>
            cache.addAll(payload.urls).catch((err) => console.warn('[SW] Precache partial:', err))
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
  }
});

// ============================================================================
// FETCH CLEANUP — Remove entries muito antigas do runtime cache
// ============================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(cleanupOldEntries());
});

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
      if (age > MAX_AGE) {
        await cache.delete(request);
      }
    }
  }
}