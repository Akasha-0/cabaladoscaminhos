'use client';

/**
 * InstallPrompt — banner customizado para PWA install (Wave 20).
 * ----------------------------------------------------------------------------
 * Heurística de 2 visits:
 *   - 1º visit: NÃO mostra (Chrome pode disparar o nativo)
 *   - 2º visit: mostra se browser suporta
 *   - Após dismiss: re-mostra após 7 dias
 *   - Após accept: nunca mais
 *
 * Design: custom modal/card (NÃO o banner nativo do Chrome), com
 *   - Preview do app (ícone + 2 screenshots)
 *   - Lista de benefícios offline
 *   - Botões grandes (touch target ≥ 48px)
 *   - Safe-area-inset
 *   - prefers-reduced-motion
 *
 * Compatibilidade: SSR-safe (typeof window checks).
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Download, X, Wifi, Bell, Smartphone } from 'lucide-react';
import {
  recordVisit,
  getVisitState,
  shouldShowInstallPrompt,
  markPromptShown,
  markPromptOutcome,
} from '@/lib/pwa/visit-tracker';

const DISMISS_KEY = 'pwa-install-dismissed-v2';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface InstallPromptProps {
  className?: string;
  /** Forçar o "variant" da UI: 'card' (topo) ou 'modal' (centro) */
  variant?: 'card' | 'modal';
}

export function InstallPrompt({ className, variant = 'card' }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const promptedThisSession = useRef(false);

  // ============================================================
  // Efeito 1: contar visits e capturar beforeinstallprompt
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1) Registra visit
    recordVisit();

    // 2) Verifica dismiss local (fallback) — visit-tracker é a fonte da verdade
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const age = Date.now() - parseInt(dismissedAt, 10);
      if (age < DISMISS_DURATION_MS) return;
    }

    // 3) Verifica heurística
    const state = getVisitState();
    if (!shouldShowInstallPrompt(state)) return;

    // 4) Espera o evento
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // 5) Listener: app instalado
    const onInstalled = () => {
      markPromptOutcome('accepted');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // ============================================================
  // Efeito 2: mostrar prompt quando deferredPrompt chegar + heurística
  // ============================================================
  useEffect(() => {
    if (!deferredPrompt) return;
    if (promptedThisSession.current) return;
    if (!shouldShowInstallPrompt()) return;

    // Pequeno delay para não aparecer imediatamente (UX)
    const timer = setTimeout(() => {
      setShowPrompt(true);
      promptedThisSession.current = true;
      markPromptShown();
    }, 2500);
    return () => clearTimeout(timer);
  }, [deferredPrompt]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      markPromptOutcome(choice.outcome);
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch (err) {
      console.warn('[InstallPrompt] prompt() failed:', err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    markPromptOutcome('dismissed');
    setShowPrompt(false);
  }, []);

  if (!showPrompt || !deferredPrompt) return null;

  // ============================================================
  // Render
  // ============================================================
  if (variant === 'modal') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-prompt-title"
        aria-describedby="install-prompt-desc"
        className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 motion-safe:animate-in motion-safe:fade-in"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div
          className={`relative w-full max-w-md rounded-2xl border border-[var(--spiritual-gold)]/30 bg-[var(--card)] p-6 shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-bottom-4 ${className ?? ''}`}
        >
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dispensar prompt de instalação"
            className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-accent transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--spiritual-gold)] to-purple-600 flex items-center justify-center mb-4 shadow-lg"
              aria-hidden="true"
            >
              <Smartphone className="w-8 h-8 text-black" />
            </div>

            <h2
              id="install-prompt-title"
              className="text-xl font-semibold bg-gradient-to-br from-[var(--spiritual-gold)] to-purple-400 bg-clip-text text-transparent"
            >
              Akasha Portal na sua tela
            </h2>
            <p
              id="install-prompt-desc"
              className="text-sm text-muted-foreground mt-2 mb-5 max-w-xs"
            >
              Instale o app para acesso instantâneo, modo offline e notificações de novos conteúdos.
            </p>

            <ul className="w-full text-left text-sm space-y-2.5 mb-6">
              <li className="flex items-start gap-3">
                <Wifi className="w-4 h-4 text-[var(--spiritual-gold)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Funciona offline — leia posts, faça anotações</span>
              </li>
              <li className="flex items-start gap-3">
                <Bell className="w-4 h-4 text-[var(--spiritual-gold)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Notificações de novas práticas e respostas</span>
              </li>
              <li className="flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-[var(--spiritual-gold)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Sem barra de URL — experiência fullscreen</span>
              </li>
            </ul>

            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={handleInstall}
                disabled={isInstalling}
                className="min-h-[48px] rounded-xl bg-gradient-to-r from-[var(--spiritual-gold)] to-amber-500 text-black font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isInstalling ? 'Instalando...' : 'Instalar agora'}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="min-h-[48px] rounded-xl border border-border text-sm font-medium hover:bg-accent transition"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant 'card' (default) — bottom-left, dismissable
  return (
    <div
      role="dialog"
      aria-labelledby="install-prompt-title-card"
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:max-w-sm z-40 ${className ?? ''}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="rounded-xl border border-[var(--spiritual-gold)]/40 bg-[var(--card)] p-4 shadow-xl motion-safe:animate-in motion-safe:slide-in-from-bottom-2">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--spiritual-gold)] to-purple-600 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <Download className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="install-prompt-title-card"
              className="font-semibold text-sm mb-0.5"
            >
              Instalar Akasha Portal
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Acesso offline e notificações direto da tela inicial.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 min-h-[40px] rounded-md bg-[var(--spiritual-gold)] text-black px-3 py-1.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {isInstalling ? '...' : 'Instalar'}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="min-h-[40px] rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent transition"
                aria-label="Dispensar prompt de instalação"
              >
                Não agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
