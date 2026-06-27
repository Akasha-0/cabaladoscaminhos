'use client';

/**
 * UpdatePrompt — prompt de atualizacao do service worker.
 * ----------------------------------------------------------------------------
 * Aparece quando uma nova versao do app esta disponivel.
 * Permite recarregar a pagina pra usar a versao nova.
 */

import { useEffect, useState } from 'react';

export interface UpdatePromptProps {
  className?: string;
}

export function UpdatePrompt({ className }: UpdatePromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const onUpdate = (registration: ServiceWorkerRegistration) => {
      const waiting = registration.waiting;
      if (waiting) {
        setWaitingWorker(waiting);
        setShowPrompt(true);
      }
    };

    navigator.serviceWorker.ready.then((registration) => {
      // Verifica se ja ha um worker esperando
      if (registration.waiting) {
        onUpdate(registration);
      }

      // Escuta novos updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && registration.waiting) {
            onUpdate(registration);
          }
        });
      });
    });

    // Escuta mensagem do SW dizendo que esta pronto para ativar
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATED') {
        setShowPrompt(true);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:max-w-sm z-50 ${className ?? ''}`}
    >
      <div className="rounded-lg border border-[var(--spiritual-gold)] bg-[var(--card)] p-4 shadow-xl">
        <h3 className="font-semibold text-sm mb-1">Nova versao disponivel</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Uma atualizacao do Akasha Portal esta pronta. Recarregue pra aplicar.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUpdate}
            className="flex-1 rounded-md bg-[var(--spiritual-gold)] text-black px-3 py-1.5 text-sm font-medium hover:opacity-90 transition"
          >
            Recarregar
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent transition"
          >
            Depois
          </button>
        </div>
      </div>
    </div>
  );
}