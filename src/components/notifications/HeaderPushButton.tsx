'use client';

// ============================================================================
// HeaderPushButton — botão de ativar notificações no header
// ============================================================================
// Versão "header-aware" do EnablePushButton. Posiciona-se no canto superior
// direito do viewport (fixed top-right), com visual discreto que combina
// com o header mystical/gold do app. Renderiza-se apenas quando:
//   - usuário autenticado
//   - browser suporta Push API
//
// Diferente do EnablePushButton (que é genérico), este já vem com a
// estilização de "header item" — basta dropá-lo no layout.
// ============================================================================

import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { useCallback, useEffect, useState } from 'react';

type PushState =
  | 'unsupported'
  | 'idle'
  | 'requesting'
  | 'subscribing'
  | 'subscribed'
  | 'denied'
  | 'error';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function HeaderPushButton() {
  const { isAuthenticated, isLoading } = useAuth();
  const [state, setState] = useState<PushState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          if (sub) setState('subscribed');
        })
        .catch(() => {});
    }
  }, []);

  const handleEnable = useCallback(async () => {
    setErrorMsg(null);
    setState('requesting');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'idle');
        return;
      }

      setState('subscribing');
      const reg = await navigator.serviceWorker.ready;

      const cfgRes = await fetch('/api/notifications/push/subscribe');
      if (!cfgRes.ok) throw new Error('Falha ao obter configuração push');
      const cfg = (await cfgRes.json()) as {
        configured: boolean;
        publicKey?: string;
      };

      let subscription: PushSubscription | null = null;
      if (cfg.configured && cfg.publicKey) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(cfg.publicKey),
        });
      } else {
        try {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
          });
        } catch {
          throw new Error(
            'Push não configurado no servidor (VAPID ausente). Contate admin.'
          );
        }
      }

      if (!subscription) throw new Error('Subscription não criada');

      const json = subscription.toJSON();
      if (!json.keys?.p256dh || !json.keys?.auth) {
        throw new Error('Keys ausentes na subscription');
      }

      const res = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      setState('subscribed');
    } catch (err) {
      console.error('[HeaderPushButton] enable failed:', err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setState('error');
    }
  }, []);

  // Não renderiza se: carregando, sem auth, ou browser sem suporte
  if (isLoading || !isAuthenticated) return null;
  if (state === 'unsupported') return null;

  // Style: header right-anchored
  const wrapperClass =
    'fixed top-3 right-3 sm:top-4 sm:right-4 z-40 ' +
    'pointer-events-auto';

  // Subscribed — discreto, verde
  if (state === 'subscribed') {
    return (
      <div className={wrapperClass}>
        <button
          type="button"
          className={pillSubscribedClass}
          aria-label="Notificações ativas"
          title="Notificações ativas"
        >
          <Bell className="h-3.5 w-3.5" aria-hidden="true" />
          <span>On</span>
        </button>
      </div>
    );
  }

  // Denied
  if (state === 'denied') {
    return (
      <div className={wrapperClass}>
        <button
          type="button"
          className={pillDeniedClass}
          disabled
          aria-label="Notificações bloqueadas no browser"
          title="Notificações bloqueadas no browser"
        >
          <BellOff className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Bloq.</span>
        </button>
      </div>
    );
  }

  // Loading
  if (state === 'requesting' || state === 'subscribing') {
    return (
      <div className={wrapperClass}>
        <button type="button" className={pillIdleClass} disabled>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          <span>...</span>
        </button>
      </div>
    );
  }

  // Error
  if (state === 'error') {
    return (
      <div className={wrapperClass}>
        <button
          type="button"
          className={pillErrorClass}
          onClick={handleEnable}
          aria-label={errorMsg ?? 'Erro — tentar novamente'}
          title={errorMsg ?? 'Erro'}
        >
          <BellOff className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Idle — CTA principal
  return (
    <div className={wrapperClass}>
      <button
        type="button"
        className={pillIdleClass}
        onClick={handleEnable}
        aria-label="Ativar notificações"
      >
        <Bell className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Ativar notificações</span>
      </button>
    </div>
  );
}

// ============================================================================
// Pill styles
// ============================================================================

const pillBase =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ' +
  'text-xs font-medium transition-all duration-200 ' +
  'border shadow-sm backdrop-blur-sm ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const pillIdleClass =
  pillBase +
  ' border-amber-400/40 bg-amber-500/15 text-amber-100 ' +
  'hover:bg-amber-500/25 hover:border-amber-300/60 hover:scale-105';

const pillSubscribedClass =
  pillBase +
  ' border-emerald-400/40 bg-emerald-500/15 text-emerald-100';

const pillDeniedClass =
  pillBase +
  ' border-zinc-500/40 bg-zinc-700/40 text-zinc-300';

const pillErrorClass =
  pillBase +
  ' border-red-400/40 bg-red-500/15 text-red-100 ' +
  'hover:bg-red-500/25';

export default HeaderPushButton;
