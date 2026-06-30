/**
 * W71-B: Spec for service-worker-registration.ts
 *
 * Mocks the global `navigator` + `Notification` constructors to drive the
 * registration / permission lifecycle from Node.
 */

import {
  registerServiceWorker,
  unregisterServiceWorker,
  checkForUpdate,
  listenForMessages,
  getNotificationPermission,
  requestNotificationPermission,
  SERVICE_WORKER_SOURCE,
  auditServiceWorkerSupport,
} from '../engines/service-worker-registration.ts';

// ───────────────────────────────────────────────────────────────────────────
// Self-running harness
// ───────────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const assertions: Array<{ name: string; ok: boolean; detail?: string }> = [];

function assertIt(name: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed += 1;
    assertions.push({ name, ok: true });
  } else {
    failed += 1;
    assertions.push({ name, ok: false, detail });
  }
}

function assertEqual<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) {
    passed += 1;
    assertions.push({ name, ok: true });
  } else {
    failed += 1;
    assertions.push({
      name,
      ok: false,
      detail: `expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`,
    });
  }
}

function assertThrows(name: string, fn: () => unknown, pattern?: RegExp): void {
  try {
    fn();
    failed += 1;
    assertions.push({ name, ok: false, detail: 'did not throw' });
  } catch (e) {
    const msg = (e as Error).message;
    if (!pattern || pattern.test(msg)) {
      passed += 1;
      assertions.push({ name, ok: true });
    } else {
      failed += 1;
      assertions.push({
        name,
        ok: false,
        detail: `threw "${msg}" but did not match ${pattern}`,
      });
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Mock helpers
// ───────────────────────────────────────────────────────────────────────────

interface MockSwState {
  registration: { scope: string; active: boolean; updateViaCache: 'imports' | 'all' | 'none'; installing: boolean; waiting: boolean } | null;
  messageHandlers: Array<(data: unknown) => void>;
  permissionState: NotificationPermission;
}

function installMocks(opts?: { permission?: NotificationPermission; withRegistration?: boolean }): MockSwState {
  const state: MockSwState = {
    registration: opts?.withRegistration
      ? { scope: '/', active: true, updateViaCache: 'imports', installing: false, waiting: false }
      : null,
    messageHandlers: [],
    permissionState: opts?.permission ?? 'default',
  };

  const fakeSw: ServiceWorker = {
    scriptURL: '/sw.js',
    state: 'activated',
    postMessage: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  };

  const fakeRegistration: ServiceWorkerRegistration = {
    scope: state.registration?.scope ?? '/',
    active: fakeSw,
    installing: null,
    waiting: null,
    updateViaCache: state.registration?.updateViaCache ?? 'imports',
    pushManager: {} as PushManager,
    update: async () => {
      // simulated update
    },
    unregister: async () => {
      state.registration = null;
      return true;
    },
    showNotification: async () => {
      // no-op
    },
    getNotifications: async () => [],
  };

  const serviceWorkerContainer: ServiceWorkerContainer = {
    controller: null,
    ready: Promise.resolve(fakeRegistration),
    register: async (_scriptUrl: string, _options?: { scope?: string }) => {
      state.registration = {
        scope: _options?.scope ?? '/',
        active: true,
        updateViaCache: 'imports',
        installing: false,
        waiting: false,
      };
      // Mutate the fake registration's scope so subsequent getRegistration returns it
      Object.defineProperty(fakeRegistration, 'scope', { value: state.registration.scope, configurable: true });
      return fakeRegistration;
    },
    getRegistration: async (_scope?: string) => {
      if (!state.registration) return undefined;
      Object.defineProperty(fakeRegistration, 'scope', { value: state.registration.scope, configurable: true });
      return fakeRegistration;
    },
    getRegistrations: async () => (state.registration ? [fakeRegistration] : []),
    addEventListener: (type: 'message' | 'controllerchange' | 'install' | 'activate', listener: EventListener) => {
      if (type === 'message') {
        const wrapped = (data: unknown): void => {
          listener(new MessageEvent('message', { data }));
        };
        state.messageHandlers.push(wrapped);
      }
    },
    removeEventListener: (type: 'message' | 'controllerchange' | 'install' | 'activate', _listener: EventListener) => {
      if (type === 'message') {
        // No reliable way to match wrapped functions across boundaries; just clear.
        state.messageHandlers.length = 0;
      }
    },
  };

  const nav: Navigator = { serviceWorker: serviceWorkerContainer };
  const N: NotificationStatic = {
    permission: state.permissionState,
    maxActions: 4,
    requestPermission: async () => {
      state.permissionState = 'granted';
      (N as unknown as { permission: NotificationPermission }).permission = 'granted';
      return 'granted';
    },
  } as unknown as NotificationStatic;
  (N as unknown as { permission: NotificationPermission }).permission = state.permissionState;

  const g = globalThis as unknown as { navigator: Navigator; Notification: NotificationStatic };
  g.navigator = nav;
  g.Notification = N;

  return state;
}

function clearMocks(): void {
  const g = globalThis as unknown as { navigator?: Navigator; Notification?: NotificationStatic };
  delete g.navigator;
  delete g.Notification;
}

// ───────────────────────────────────────────────────────────────────────────
// Spec body (async-only — sync version removed because `Function('return require')()`
// doesn't work in ESM scope, and the registration lifecycle is inherently async)
// ───────────────────────────────────────────────────────────────────────────

export async function runServiceWorkerRegistrationSpecAsync(): Promise<{ passed: number; failed: number; assertions: typeof assertions }> {
  passed = 0;
  failed = 0;
  assertions.length = 0;

  // Re-run sections using proper await
  clearMocks();
  {
    const reg = await registerServiceWorker('/sw.js');
    assertEqual('no-browser:active_false', reg.active, false);
    assertEqual('no-browser:scope_default', reg.scope, '/sw.js');
    assertEqual('no-browser:updateViaCache_imports', reg.updateViaCache, 'imports');

    const u = await unregisterServiceWorker();
    assertEqual('no-browser:unregister_false', u, false);

    const update = await checkForUpdate();
    assertEqual('no-browser:update_false', update, false);

    assertEqual('no-browser:perm_default', getNotificationPermission(), 'default');
    assertEqual('no-browser:req_perm_default', await requestNotificationPermission(), 'default');

    const unsub = listenForMessages(() => undefined);
    assertEqual('no-browser:unsub_is_function', typeof unsub, 'function');
    unsub();

    const audit = auditServiceWorkerSupport();
    assertEqual('no-browser:audit_no_sw', audit.hasNavigatorServiceWorker, false);
    assertEqual('no-browser:audit_no_notif', audit.hasNotification, false);
  }

  {
    const state = installMocks({ permission: 'default', withRegistration: false });
    const reg = await registerServiceWorker('/sw.js', { scope: '/app' });
    assertEqual('mock:scope_set', reg.scope, '/app');
    assertEqual('mock:active_true', reg.active, true);
    assertEqual('mock:installing_false', reg.installing, false);
    assertEqual('mock:waiting_false', reg.waiting, false);
    assertEqual('mock:registration_count', state.registration !== null, true);

    assertEqual('mock:update_true', await checkForUpdate(), true);
    assertEqual('mock:perm_default', getNotificationPermission(), 'default');
    assertEqual('mock:req_perm_granted', await requestNotificationPermission(), 'granted');
    assertEqual('mock:perm_after_request_granted', getNotificationPermission(), 'granted');
    assertEqual('mock:unregister_true', await unregisterServiceWorker(), true);
  }

  {
    const state = installMocks({ permission: 'granted' });
    let received: unknown = null;
    const unsub = listenForMessages((data) => {
      received = data;
    });
    state.messageHandlers[0]?.('hello-from-sw');
    assertEqual('listen:handler_invoked', received, 'hello-from-sw');
    unsub();
    unsub();
  }

  {
    installMocks({ permission: 'denied' });
    const audit = auditServiceWorkerSupport();
    assertEqual('audit-mock:has_sw', audit.hasNavigatorServiceWorker, true);
    assertEqual('audit-mock:has_notif', audit.hasNotification, true);
    assertEqual('audit-mock:perm_denied', audit.permission, 'denied');
  }

  {
    const state = installMocks({ permission: 'granted', withRegistration: true });
    const reg = await registerServiceWorker('/sw.js');
    assertEqual('prereg:active', reg.active, true);
    assertEqual('prereg:scope', reg.scope, '/');
    assertEqual('prereg:state_active', state.registration !== null, true);
  }

  {
    installMocks({ permission: 'default' });
    const reg = await registerServiceWorker('/sw.js', { scope: '/pwa' });
    assertEqual('scope-option:scope', reg.scope, '/pwa');
  }

  {
    // Source-string assertions (synchronous)
    assertEqual('sw:source_nonempty', typeof SERVICE_WORKER_SOURCE, 'string');
    assertIt('sw:install_handler', SERVICE_WORKER_SOURCE.includes("addEventListener('install'"));
    assertIt('sw:activate_handler', SERVICE_WORKER_SOURCE.includes("addEventListener('activate'"));
    assertIt('sw:push_handler', SERVICE_WORKER_SOURCE.includes("addEventListener('push'"));
    assertIt('sw:notificationclick_handler', SERVICE_WORKER_SOURCE.includes("addEventListener('notificationclick'"));
    assertIt('sw:pushsubscriptionchange_handler', SERVICE_WORKER_SOURCE.includes("addEventListener('pushsubscriptionchange'"));
    assertIt('sw:showNotification_call', SERVICE_WORKER_SOURCE.includes('registration.showNotification'));
    assertIt('sw:openWindow_call', SERVICE_WORKER_SOURCE.includes('clients.openWindow'));
    assertIt('sw:matchAll_call', SERVICE_WORKER_SOURCE.includes('clients.matchAll'));
    assertIt('sw:json_payload_parse', SERVICE_WORKER_SOURCE.includes('event.data.json()'));
  }

  {
    let threwCorrectly = false;
    let msg = '';
    try {
      await registerServiceWorker('');
    } catch (e) {
      msg = (e as Error).message ?? '';
      threwCorrectly = /swUrl/.test(msg);
    }
    if (threwCorrectly) {
      passed += 1;
      assertions.push({ name: 'validate:empty_swUrl', ok: true });
    } else {
      failed += 1;
      assertions.push({ name: 'validate:empty_swUrl', ok: false, detail: msg ? `wrong message: ${msg}` : 'did not throw' });
    }
  }

  clearMocks();
  return { passed, failed, assertions };
}

const isDirect = typeof import.meta.url === 'string' && process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isDirect) {
  void runServiceWorkerRegistrationSpecAsync().then((r) => {
    console.log(`service-worker-registration.spec.ts: ${r.passed} passed / ${r.failed} failed / ${r.assertions.length} assertions`);
    if (r.failed > 0) {
      for (const a of r.assertions.filter((a) => !a.ok)) console.log(`  ✗ ${a.name}: ${a.detail ?? ''}`);
      process.exit(1);
    }
    process.exit(0);
  });
}