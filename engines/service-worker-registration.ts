/**
 * W71-B: Service Worker registration + lifecycle helpers.
 *
 * These functions wrap the browser Service Worker API. In the Node test
 * environment, the actual `navigator.serviceWorker.register()` call is replaced
 * with type stubs. Spec files mock the global `navigator` object to drive the
 * lifecycle.
 *
 * Also exports a sample `SERVICE_WORKER_SOURCE` string containing the actual
 * service-worker.js script that handles `push` and `notificationclick` events.
 */

export type ServiceWorkerUpdateViaCache = 'imports' | 'all' | 'none';

export interface SwRegistration {
  scope: string;
  active: boolean;
  updateViaCache: ServiceWorkerUpdateViaCache;
  installing: boolean;
  waiting: boolean;
}

// ───────────────────────────────────────────────────────────────────────────
// Browser global accessors (typed; runtime is server-side in Node)
// ───────────────────────────────────────────────────────────────────────────

function getNavigator(): Navigator | undefined {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const g = (Function('return globalThis')() as { navigator?: Navigator });
  return g.navigator;
}

function getNotificationCtor(): NotificationStatic | undefined {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const g = (Function('return globalThis')() as { Notification?: NotificationStatic });
  return g.Notification;
}

// ───────────────────────────────────────────────────────────────────────────
// Service Worker registration
// ───────────────────────────────────────────────────────────────────────────

/**
 * Register a service worker. Returns a typed SwRegistration summary.
 *
 * On Node (no navigator.serviceWorker), returns a synthetic registration so
 * downstream code can still proceed. The synthetic registration is flagged
 * `active: false` so callers can detect the non-browser environment.
 */
export async function registerServiceWorker(
  swUrl: string,
  opts?: { scope?: string },
): Promise<SwRegistration> {
  if (typeof swUrl !== 'string' || swUrl.length === 0) {
    throw new TypeError('registerServiceWorker: swUrl must be a non-empty string');
  }

  const nav = getNavigator();
  if (!nav?.serviceWorker) {
    return syntheticRegistration(swUrl, opts?.scope);
  }

  const reg = await nav.serviceWorker.register(swUrl, opts ?? {});
  return toSwRegistration(reg);
}

/** Unregister any active service worker. */
export async function unregisterServiceWorker(): Promise<boolean> {
  const nav = getNavigator();
  if (!nav?.serviceWorker) return false;
  const reg = await nav.serviceWorker.getRegistration();
  if (!reg) return false;
  return reg.unregister();
}

/** Trigger an update check on the active registration. */
export async function checkForUpdate(): Promise<boolean> {
  const nav = getNavigator();
  if (!nav?.serviceWorker) return false;
  const reg = await nav.serviceWorker.getRegistration();
  if (!reg) return false;
  await reg.update();
  return true;
}

/**
 * Listen for messages from the service worker. Returns an unsubscribe function.
 * Works on Node via a no-op fallback (handler is never invoked).
 */
export function listenForMessages(handler: (data: unknown) => void): () => void {
  if (typeof handler !== 'function') {
    throw new TypeError('listenForMessages: handler must be a function');
  }
  const nav = getNavigator();
  if (!nav?.serviceWorker) {
    return () => {
      // no-op
    };
  }
  const listener: EventListener = (ev) => {
    const messageEvent = ev as MessageEvent;
    handler(messageEvent.data);
  };
  nav.serviceWorker.addEventListener('message', listener);
  return () => {
    nav.serviceWorker?.removeEventListener('message', listener);
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Notification permission
// ───────────────────────────────────────────────────────────────────────────

/** Get the current notification permission status (defaults to 'default' on Node). */
export function getNotificationPermission(): NotificationPermission {
  const N = getNotificationCtor();
  if (!N) return 'default';
  return N.permission;
}

/**
 * Request notification permission from the user.
 * On Node, returns 'default' immediately so callers can branch.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const N = getNotificationCtor();
  if (!N || typeof N.requestPermission !== 'function') return 'default';
  return N.requestPermission();
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function toSwRegistration(reg: ServiceWorkerRegistration): SwRegistration {
  return {
    scope: reg.scope,
    active: reg.active !== null,
    updateViaCache: reg.updateViaCache,
    installing: reg.installing !== null,
    waiting: reg.waiting !== null,
  };
}

function syntheticRegistration(swUrl: string, scope?: string): SwRegistration {
  return {
    scope: scope ?? new URL(swUrl, 'https://localhost').pathname,
    active: false,
    updateViaCache: 'imports',
    installing: false,
    waiting: false,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Service Worker source — exported as a string constant for downstream build steps
// ───────────────────────────────────────────────────────────────────────────

/**
 * Production-grade service-worker.js source. The W71 server injects this
 * verbatim into /public/sw.js at build time.
 *
 * Handles:
 *  - `install` event: skipWaiting so updates take effect immediately
 *  - `activate` event: clients.claim
 *  - `push` event: parses JSON payload, calls registration.showNotification
 *  - `notificationclick` event: focuses an open window or opens a new one
 *  - `pushsubscriptionchange` event: re-subscribes and posts to all clients
 */
export const SERVICE_WORKER_SOURCE: string = `// Auto-generated by W71-B cabaladoscaminhos
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch (err) {
    payload = { title: 'Cabala dos Caminhos', body: event.data.text() };
  }
  const options = {
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/badge-72.png',
    tag: payload.tag,
    data: payload.data,
    requireInteraction: !!payload.requireInteraction,
    actions: payload.actions || [],
  };
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) {
        try {
          await client.focus();
          if ('navigate' in client) {
            await client.navigate(targetUrl);
          }
          return;
        } catch (e) {
          // fall through to openWindow
        }
      }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    const oldEndpoint = event.oldSubscription ? event.oldSubscription.endpoint : null;
    const newSub = await self.registration.pushManager.subscribe(event.oldSubscription ? event.oldSubscription.options : { userVisibleOnly: true });
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({
        type: 'PUSH_SUBSCRIPTION_CHANGED',
        oldEndpoint,
        newEndpoint: newSub.endpoint,
        newSubscription: newSub.toJSON(),
      });
    }
  })());
});
`;

// ───────────────────────────────────────────────────────────────────────────
// Audit
// ───────────────────────────────────────────────────────────────────────────

/**
 * Audit the lifecycle state. Useful in tests.
 * Returns detection summary of currently-mocked navigator/Notification.
 */
export function auditServiceWorkerSupport(): {
  hasNavigatorServiceWorker: boolean;
  hasNotification: boolean;
  hasPushManager: boolean;
  permission: NotificationPermission;
  supportsPushContentEncodings: ReadonlyArray<string> | null;
} {
  const nav = getNavigator();
  const N = getNotificationCtor();
  const permission: NotificationPermission = N?.permission ?? 'default';
  const supportsPushContentEncodings: ReadonlyArray<string> | null = null;

  return {
    hasNavigatorServiceWorker: !!nav?.serviceWorker,
    hasNotification: !!N,
    hasPushManager: false,
    permission,
    supportsPushContentEncodings,
  };
}