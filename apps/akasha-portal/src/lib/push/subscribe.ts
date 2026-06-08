/**
 * subscribe.ts — Akasha (T7 / Doc 25 §11)
 *
 * Helpers client-side para subscrever/cancelar subscrição Web Push.
 * Roda no browser (service worker + PushManager). Em SSR retorna null.
 *
 * Privacidade: nunca envia conteúdo do ritual. Apenas o endpoint + chaves
 * públicas (p256dh/auth) que o browser entrega nativamente.
 */

'use client';

/** Converte chave VAPID base64-url em Uint8Array (formato exigido pela PushManager). */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Pede permissão ao browser e subscreve o usuário a notificações push.
 * Retorna a `PushSubscription` pronta para enviar ao backend, ou `null`
 * se o browser não suporta / permissão negada / VAPID não configurada.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[push] Push not supported in this browser');
    return null;
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.warn('[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[push] Notification permission denied');
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    // O tipo `BufferSource` da DOM lib é estrito; cast seguro (Uint8Array
    // com ArrayBuffer é exatamente o que o PushManager espera).
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });
  return subscription;
}

/**
 * Cancela a subscrição Web Push ativa no service worker.
 * Retorna `true` se havia subscription e foi removida, `false` caso contrário.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return false;
  return subscription.unsubscribe();
}
