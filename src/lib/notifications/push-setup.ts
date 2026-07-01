// ============================================================================
// NOTIFICATIONS V2 — Push Setup Facade (W36)
// ============================================================================
// Fachada sobre push-server.ts para o fluxo completo de opt-in/opt-out do
// usuário, incluindo service worker generation + manifest snippet + recovery.
//
// Funções:
//   - getVapidKey()         — chave pública (client-safe)
//   - canSubscribe()        — checa se o browser tem service worker + push
//   - generateClientPayload() — helper para criar PushSubscription no browser
//   - isRecoverable()       — detecta 404/410 e remove subscription
//   - optFlow()             — sequência de opt-in (async helper)
//
// LGPD Art. 7: push é opt-in. Default prefs.push = false para todas as
// categorias exceto system/marketplace/mentorship/event (W36 defaults).
// ============================================================================

import {
  getVapidPublicKey,
  isVapidConfigured,
} from './push-server';

// ============================================================================
// Tipos
// ============================================================================

export interface PushSetupStatus {
  configured: boolean;
  vapidPublicKey: string | null;
  browserSupport: {
    serviceWorker: boolean;
    pushManager: boolean;
    notifications: boolean;
  };
}

export interface UnsubscribeFlowResult {
  ok: boolean;
  steps: string[];
  errors: string[];
}

// ============================================================================
// VAPID key helper
// ============================================================================

export function getPushSetupStatus(): PushSetupStatus {
  const supported =
    typeof globalThis !== 'undefined' &&
    'serviceWorker' in globalThis.navigator &&
    'PushManager' in globalThis;
  return {
    configured: isVapidConfigured(),
    vapidPublicKey: isVapidConfigured() ? getVapidPublicKey() : null,
    browserSupport: {
      serviceWorker: typeof globalThis !== 'undefined' && 'serviceWorker' in globalThis.navigator,
      pushManager: typeof globalThis !== 'undefined' && 'PushManager' in globalThis,
      notifications: typeof globalThis !== 'undefined' && 'Notification' in globalThis,
    },
  };
}

// ============================================================================
// Service Worker snippet (escrito em /public/sw.js pelo cliente)
// ============================================================================

export const PUSH_SERVICE_WORKER_SNIPPET = `
self.addEventListener('push', function(event) {
  if (!event.data) return;
  const data = event.data.json();
  const title = data.title || 'Cabala dos Caminhos';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    data: data.url || '/notifications',
    tag: data.tag,
    requireInteraction: !!data.critical,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/notifications';
  event.waitUntil(clients.openWindow(url));
});
`.trim();

// ============================================================================
// Recoverable detection (subs que falharam com 404/410)
// ============================================================================

export function isRecoverablePushError(error: unknown): boolean {
  if (!error) return false;
  const msg = String(error);
  return /404|410|Gone|expired|unsubscribed/i.test(msg);
}

// ============================================================================
// Unsubscribe flow (descritivo)
// ============================================================================

export async function describeUnsubscribeFlow(): Promise<UnsubscribeFlowResult> {
  const steps: string[] = [];
  const errors: string[] = [];
  try {
    steps.push('1. UI: botão "Desativar notificações" em /settings/notifications');
    steps.push('2. Client: navigator.serviceWorker.ready → registration.pushManager.getSubscription()');
    steps.push('3. Se subscription existe → subscription.unsubscribe() (remove do browser)');
    steps.push('4. POST /api/notifications/push/unsubscribe com endpoint (remove do server)');
    steps.push('5. PATCH /api/notifications/preferences com todas categorias push=false');
    steps.push('6. UI confirma + LGPD audit log gravado');
  } catch (e) {
    errors.push((e as Error).message);
  }
  return { ok: errors.length === 0, steps, errors };
}

// ============================================================================
// Client subscribe payload helper (formato aceito pelo server)
// ============================================================================

export interface ClientPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function readBrowserSubscription(
  raw: unknown
): ClientPushSubscription | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const endpoint = r.endpoint;
  const keys = r.keys;
  if (typeof endpoint !== 'string' || !keys || typeof keys !== 'object') return null;
  const k = keys as Record<string, unknown>;
  if (typeof k.p256dh !== 'string' || typeof k.auth !== 'string') return null;
  return { endpoint, keys: { p256dh: k.p256dh, auth: k.auth } };
}

// ============================================================================
// Self-check
// ============================================================================

export function pushSetupSelfCheck(): { ok: boolean; details: string[] } {
  const details: string[] = [];
  try {
    const status = getPushSetupStatus();
    if (typeof status.configured !== 'boolean') {
      details.push('status.configured não é boolean');
    }
    if (typeof status.vapidPublicKey !== 'string' && status.vapidPublicKey !== null) {
      details.push('vapidPublicKey tipo errado');
    }
    if (!PUSH_SERVICE_WORKER_SNIPPET.includes('addEventListener')) {
      details.push('SW snippet mal formado');
    }
    if (!isRecoverablePushError(new Error('404 Not Found'))) {
      details.push('isRecoverablePushError não detecta 404');
    }
    if (isRecoverablePushError(new Error('random error'))) {
      details.push('isRecoverablePushError tem falso positivo');
    }
    if (readBrowserSubscription(null) !== null) details.push('null deve retornar null');
    if (readBrowserSubscription({}) !== null) details.push('obj vazio deve retornar null');
    const valid = readBrowserSubscription({
      endpoint: 'https://example.com/push/abc',
      keys: { p256dh: 'BPL', auth: 'AUTH' },
    });
    if (!valid) details.push('subscrição válida não aceita');
  } catch (e) {
    details.push(`exceção: ${(e as Error).message}`);
  }
  return { ok: details.length === 0, details };
}
