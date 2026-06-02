// fallow-ignore-file unused-file
const CACHE_NAME = 'cabala-dos-caminhos-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/calendario',
  '/chat',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const API_CACHE_NAME = 'cabala-api-cache-v1';
const API_CACHE_DURATION = 5 * 60 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(cacheFirstAPI(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match('/');
  }
}

// fallow-ignore-next-line complexity
async function cacheFirstAPI(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    const cachedTime = cachedResponse.headers.get('cached-time');
    if (cachedTime && Date.now() - parseInt(cachedTime) < API_CACHE_DURATION) {
      return cachedResponse;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      const headers = new Headers(response.headers);
      headers.set('cached-time', Date.now().toString());
      const responseToCache = new Response(await response.clone().text(), {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });
      cache.put(request, responseToCache);
    }
    return response;
  } catch {
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);

  return cachedResponse || fetchPromise;
}

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'Nova atualização espiritual',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
    },
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Fechar' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Cabala dos Caminhos', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const url = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('Sincronizando dados em background...');
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }
});