'use client';

/**
 * PwaInstallPrompt — Wave 9.4 + Wave 10.5 polish
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
 * Wave 10.5 changes (Subagente 5):
 *   - 30s minimum delay before the prompt can show (avoids interrupting
 *     users on first paint; gives them time to explore the app).
 *   - More direct copy: "Instale para acesso rápido" + one-line reason
 *     "Abre em 1 toque, funciona sem internet" instead of the older,
 *     more abstract "Sistema Akasha / Acesso rápido no seu celular".
 *   - State machine: 'idle' → wait 30s → 'available'. If user lands on
 *     the page via deep-link / deeplink-share we don't want to bombard
 *     them with install UI in the first 5 seconds.
 *
 * The component renders NOTHING unless:
 *   - the browser has fired `beforeinstallprompt` (only happens when
 *     the PWA is installable — manifest + SW + start_url),
 *   - AND the user hasn't dismissed the prompt in the last 7 days,
 *   - AND the app isn't already running as an installed PWA
 *     (`display-mode: standalone` from window.matchMedia),
 *   - AND at least MIN_DELAY_MS has elapsed since mount.
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
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

const DISMISS_KEY = 'akasha.pwa.install.dismissedAt';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Wave 10.5: minimum delay before the install prompt can appear.
 * 30s is a sweet spot — long enough for the user to orient themselves
 * in the app, short enough that they don't forget about it before
 * closing the tab.
 */
export const PWA_INSTALL_MIN_DELAY_MS = 30 * 1000; // 30 seconds

type InstallState =
  | 'idle'
  | 'delayed' // waiting for the 30s delay
  | 'available'
  | 'installed'
  | 'dismissed'
  | 'unsupported';

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

  // Wave 10.5: gate the prompt behind a 30s timer. Without this, the
  // prompt can flash during the initial paint, before the user has even
  // scrolled past the hero.
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
    setState('delayed');
    const timeoutId = window.setTimeout(() => {
      // Re-check at the moment of expiration — user could have installed
      // or dismissed during the wait.
      if (isRunningStandalone()) {
        setState('installed');
      } else if (isDismissed()) {
        setState('dismissed');
      } else {
        setState('available');
      }
    }, PWA_INSTALL_MIN_DELAY_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      // Prevent the browser's default mini-infobar on Android Chrome.
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      // Only flip to 'available' if the delay has already elapsed
      // (otherwise the timer will handle the transition).
      if (!isDismissed() && !isRunningStandalone() && state !== 'delayed') {
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
  }, [state]);

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
  const installButtonRef = useRef<HTMLButtonElement | null>(null);
  // Remember which element had focus before we opened so we can restore
  // it on dismiss — WCAG 2.4.3 (focus order) and 2.1.2 (no keyboard trap).
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Wave 10.5: only render once the 30s delay has elapsed AND a real
  // deferredPrompt is in hand. Before that, stay invisible — we don't
  // want a placeholder "Install Akasha" bar with a non-functional
  // button flashing on first paint.
  if (state !== 'available' || !hasDeferredPrompt) {
    return null;
  }

  // Focus management: when we mount, capture the previously-focused
  // element and move focus to the primary action ("Instalar agora").
  // When we unmount, restore focus. Without this, keyboard users
  // would have their focus stranded on the body element when the
  // prompt auto-dismisses via the 7-day cooldown.
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    installButtonRef.current?.focus();
    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, []);

  // Escape key dismisses the prompt — same behaviour as the X button.
  // Tab focus trap keeps keyboard users inside the dialog (3 buttons
  // only: dismiss-X, install, dismiss-text). Once focus reaches the
  // last button, Tab wraps to the first; Shift+Tab from the first
  // wraps to the last. Without this, Tab would escape the dialog into
  // the underlying page, which is confusing for screen reader users
  // who are mid-announcement.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = e.currentTarget;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex=\"-1\"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [dismiss]
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-subtitle"
      onKeyDown={handleKeyDown}
      data-testid="pwa-install-prompt"
      className="fixed left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-white/15 p-4 shadow-2xl backdrop-blur-md"
      style={{
        // Wave 10.5: anchor to the BottomNav so the install bar lives
        // just above the persistent mobile nav (instead of overlapping
        // content at the very bottom of the viewport).
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
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
          {/* Wave 10.5: more direct, action-oriented copy. */}
          <p
            id="pwa-install-title"
            className="text-sm font-bold text-white leading-snug"
          >
            Instale para acesso rápido
          </p>
          <p
            id="pwa-install-subtitle"
            className="text-xs text-white/65 leading-relaxed mt-1"
          >
            Abre em 1 toque, funciona sem internet.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dispensar prompt de instalação"
          className="shrink-0 rounded-lg p-1 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070F]"
          data-testid="pwa-install-dismiss"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          ref={installButtonRef}
          type="button"
          onClick={() => {
            void prompt();
          }}
          aria-label="Instalar o app Akasha agora"
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/95 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070F]"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.45) 0%, rgba(139,92,246,0.25) 100%)',
            border: '1px solid rgba(167,139,250,0.6)',
          }}
          data-testid="pwa-install-button"
        >
          <Download size={14} aria-hidden="true" />
          Instalar agora
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Agora não, talvez mais tarde"
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/65 hover:text-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070F]"
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