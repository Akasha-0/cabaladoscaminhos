'use client';

/**
 * PwaInstallPrompt — Wave 9.4 polish
 *
 * Minimal bottom-sheet UI that surfaces the native PWA install prompt.
 * Listens for the `beforeinstallprompt` event, captures the deferred
 * prompt, and renders a small bar at the bottom of the viewport with
 * two actions:
 *   - "Instalar" → calls deferredPrompt.prompt() and listens for the
 *     `appinstalled` event to mark the install as complete.
 *   - "Agora não" → records the dismissal in localStorage with a
 *     7-day cooldown so we don't nag the user on every visit.
 *
 * The component renders NOTHING unless:
 *   - the browser has fired `beforeinstallprompt` (only happens when
 *     the PWA is installable — manifest + SW + start_url),
 *   - AND the user hasn't dismissed the prompt in the last 7 days,
 *   - AND the app isn't already running as an installed PWA
 *     (`display-mode: standalone` from window.matchMedia).
 *
 * Why a custom bottom-sheet instead of a shadcn Sheet/Dialog?
 *   - The Sheet primitive is overkill — we only ever show ONE thing
 *     and the dismissal has to be ephemeral (no overlay, no backdrop).
 *   - A thin bar at the bottom of the page matches the PWA install
 *     prompts users have seen on Twitter, Spotify, etc. — familiar.
 *
 * Accessibility:
 *   - role="dialog" + aria-labelledby + aria-describedby.
 *   - Buttons have aria-labels for screen readers (the visual label
 *     is short; the aria-label carries the action context).
 *   - Reduced-motion users see a static bar (no slide animation).
 */

import { Download, X, Smartphone } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const DISMISS_KEY = 'akasha.pwa.install.dismissedAt';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type InstallState = 'idle' | 'available' | 'installed' | 'dismissed' | 'unsupported';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // localStorage may be disabled (private mode quota). The dismissal
    // still lives in component state — we just can't persist it.
  }
}

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari attaches `standalone` to navigator when installed.
    // Reference: https://web.dev/learn/pwa/detect-install/
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function useInstallPrompt() {
  const [state, setState] = useState<InstallState>('idle');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isRunningStandalone()) {
      setState('installed');
      return;
    }
    if (isDismissed()) {
      setState('dismissed');
      return;
    }
    // Some browsers don't fire beforeinstallprompt (Firefox desktop, etc.).
    // We optimistically mark the state 'available' when we know the manifest
    // is in place — the deferred prompt will follow.
    setState('available');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      // Prevent the browser's default mini-infobar on Android Chrome.
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      if (!isDismissed() && !isRunningStandalone()) {
        setState('available');
      }
    };
    const installedHandler = () => {
      setState('installed');
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const prompt = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setState('installed');
      } else {
        // User dismissed the native prompt — record our cooldown too.
        markDismissed();
        setState('dismissed');
      }
      setDeferredPrompt(null);
      return choice.outcome === 'accepted';
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    markDismissed();
    setState('dismissed');
  }, []);

  return { state, prompt, dismiss, hasDeferredPrompt: !!deferredPrompt };
}

export function PwaInstallPrompt() {
  const { state, prompt, dismiss, hasDeferredPrompt } = useInstallPrompt();

  if (state !== 'available' || !hasDeferredPrompt) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-subtitle"
      data-testid="pwa-install-prompt"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-white/15 p-4 shadow-2xl backdrop-blur-md"
      style={{
        background:
          'linear-gradient(145deg, rgba(28,28,30,0.96) 0%, rgba(20,20,22,0.98) 100%)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.35) 0%, rgba(139,92,246,0.18) 100%)',
            border: '1px solid rgba(167,139,250,0.5)',
          }}
        >
          <Smartphone size={18} className="text-violet-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            id="pwa-install-title"
            className="text-sm font-bold text-white leading-snug"
          >
            Instalar Sistema Akasha
          </p>
          <p
            id="pwa-install-subtitle"
            className="text-xs text-white/65 leading-relaxed mt-1"
          >
            Acesso rápido no seu celular, funciona offline
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Agora não"
          className="shrink-0 rounded-lg p-1 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
          data-testid="pwa-install-dismiss"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            void prompt();
          }}
          aria-label="Instalar"
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/95 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.45) 0%, rgba(139,92,246,0.25) 100%)',
            border: '1px solid rgba(167,139,250,0.6)',
          }}
          data-testid="pwa-install-button"
        >
          <Download size={14} aria-hidden="true" />
          Instalar
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Agora não"
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/65 hover:text-white/90 transition-colors"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          data-testid="pwa-install-decline"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}

export default PwaInstallPrompt;