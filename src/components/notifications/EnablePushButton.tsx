'use client';

// ============================================================================
// EnablePushButton — header button to opt-in to Web Push notifications
// ============================================================================
// Aparece quando:
//   - usuário autenticado
//   - browser suporta Push API + Service Worker
//   - ainda não está subscribed (ou pediu permissão e foi negado)
//
// Comportamento:
//   1. Click → Notification.requestPermission()
//   2. granted → registra SW, assina PushManager, POST /subscribe
//   3. default/denied → mostra estado e link para instruções
//
// UX:
//   - Inativo (hidden) se sem suporte / sem auth
//   - Idle: "🔔 Ativar notificações"
//   - Subscribed: "🔔 Notificações ativas" (botão disabled)
//   - Permission denied: "🔕 Notificações bloqueadas" (link para settings do browser)
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/SupabaseProvider';

type PushState =
  | 'unsupported'
  | 'idle'
  | 'requesting'
  | 'subscribing'
  | 'subscribed'
  | 'denied'
  | 'error';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface EnablePushButtonProps {
  className?: string;
  /** Hide when state is 'unsupported' (default true). */
  hideIfUnsupported?: boolean;
}

export function EnablePushButton({
  className,
  hideIfUnsupported = true,
}: EnablePushButtonProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [state, setState] = useState<PushState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check support + permission on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    if ('Notification' in window && Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    // Check if already subscribed
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          if (sub) setState('subscribed');
        })
        .catch(() => {/* noop */});
    }
  }, []);

  const handleEnable = useCallback(async () => {
    if (!user) return;
    setErrorMsg(null);
    setState('requesting');

    try {
      // 1) Permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'idle');
        return;
      }

      setState('subscribing');

      // 2) Register SW
      const reg = await navigator.serviceWorker.ready;

      // 3) Get VAPID public key
      const cfgRes = await fetch('/api/notifications/push/subscribe', {
        method: 'GET',
      });
      if (!cfgRes.ok) {
        throw new Error('Falha ao obter configuração push');
      }
      const cfg = (await cfgRes.json()) as {
        configured: boolean;
        publicKey?: string;
        message?: string;
      };

      // 4) Subscribe to PushManager
      let subscription: PushSubscription | null = null;

      if (cfg.configured && cfg.publicKey) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(cfg.publicKey),
        });
      } else {
        // VAPID not configured — local subscription to mark opt-in.
        // Backend will log pushes in dev instead of sending real.
        try {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            // Empty key still registers; backend falls back to "logged" channel
          });
        } catch {
          // Browser não permite subscribe sem applicationServerKey em alguns
          // engines — sem isso não tem como registrar.
          throw new Error(
            'Push não configurado no servidor (VAPID ausente). Contate admin.'
          );
        }
      }

      if (!subscription) throw new Error('Subscription não criada');

      // 5) Extract keys
      const json = subscription.toJSON();
      const endpoint = subscription.endpoint;
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!p256dh || !auth) {
        throw new Error('Keys ausentes na subscription');
      }

      // 6) POST to /api/notifications/push/subscribe
      const res = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint,
          keys: { p256dh, auth },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      setState('subscribed');
    } catch (err) {
      console.error('[EnablePushButton] enable failed:', err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setState('error');
    }
  }, [user]);

  const handleDisable = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        // Notify backend
        await fetch('/api/notifications/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        }).catch(() => {/* idempotent */});
      }
      setState('idle');
    } catch (err) {
      console.error('[EnablePushButton] disable failed:', err);
    }
  }, []);

  // Don't render when not useful
  if (isLoading) return null;
  if (!isAuthenticated) return null;
  if (state === 'unsupported' && hideIfUnsupported) return null;

  // Render variants
  if (state === 'denied') {
    return (
      <button
        type="button"
        className={className ?? baseBtnClass}
        disabled
        aria-label="Notificações bloqueadas no browser"
        title="Notificações bloqueadas — desbloqueie nas configurações do browser"
      >
        <BellOff className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Bloqueadas</span>
      </button>
    );
  }

  if (state === 'subscribed') {
    return (
      <button
        type="button"
        className={className ?? baseBtnSubscribedClass}
        onClick={handleDisable}
        aria-label="Notificações ativas — clique para desativar"
        title="Notificações ativas — clique para desativar"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Ativas</span>
      </button>
    );
  }

  if (state === 'requesting' || state === 'subscribing') {
    return (
      <button
        type="button"
        className={className ?? baseBtnClass}
        disabled
        aria-label="Solicitando permissão de notificações"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="hidden sm:inline">...</span>
      </button>
    );
  }

  if (state === 'error') {
    return (
      <button
        type="button"
        className={className ?? baseBtnClass}
        onClick={handleEnable}
        aria-label={`Erro ao ativar: ${errorMsg ?? 'desconhecido'}`}
        title={errorMsg ?? 'Erro'}
      >
        <BellOff className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Tentar novamente</span>
      </button>
    );
  }

  // Default: idle
  return (
    <button
      type="button"
      className={className ?? baseBtnClass}
      onClick={handleEnable}
      aria-label="Ativar notificações"
    >
      <Bell className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Ativar notificações</span>
    </button>
  );
}

// ============================================================================
// Estilos — Tailwind, alinhados ao design system mystical/gold
// ============================================================================

const baseBtnClass =
  'inline-flex items-center gap-2 rounded-md border border-amber-500/30 ' +
  'bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-200 ' +
  'hover:bg-amber-500/20 hover:border-amber-400/50 transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const baseBtnSubscribedClass =
  'inline-flex items-center gap-2 rounded-md border border-emerald-500/30 ' +
  'bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-200 ' +
  'hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-colors';

export default EnablePushButton;
