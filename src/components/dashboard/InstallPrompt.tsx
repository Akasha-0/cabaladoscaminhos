'use client';

/**
 * InstallPrompt — banner pra adicionar o app a tela inicial (PWA).
 * ----------------------------------------------------------------------------
 * Aparece quando o navegador dispara o evento `beforeinstallprompt`.
 * Dismiss eh salvo em localStorage por 7 dias.
 */

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallPromptProps {
  className?: string;
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Verifica se usuario ja dispensou recentemente
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const age = Date.now() - parseInt(dismissedAt, 10);
      if (age < DISMISS_DURATION_MS) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="install-prompt-title"
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:max-w-sm z-40 ${className ?? ''}`}
    >
      <div className="rounded-lg border border-[var(--spiritual-gold)] bg-[var(--card)] p-4 shadow-xl">
        <h3 id="install-prompt-title" className="font-semibold text-sm mb-1">
          Instalar Akasha Portal
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Adicione a tela inicial para acesso rapido e experiencia offline.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 rounded-md bg-[var(--spiritual-gold)] text-black px-3 py-1.5 text-sm font-medium hover:opacity-90 transition"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent transition"
          >
            Nao agora
          </button>
        </div>
      </div>
    </div>
  );
}