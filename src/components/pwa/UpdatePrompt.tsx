'use client';

// ============================================================================
// UPDATE PROMPT — Snackbar "Nova versão disponível"
// ============================================================================
// Aparece quando o Service Worker detecta uma atualização.
// Padrão Material: snackbar discreto, ação primária "Atualizar".
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';

const DISMISSAL_KEY = 'akasha_update_dismissed_at';
const DISMISSAL_DURATION = 24 * 60 * 60 * 1000; // 24h

interface UpdatePromptProps {
  /** Forçar exibição independente do estado interno (debug/test) */
  forceShow?: boolean;
  /** Auto-check a cada X ms (default: 60min). 0 = desabilitado. */
  pollIntervalMs?: number;
}

export function UpdatePrompt({ forceShow = false, pollIntervalMs = 60 * 60 * 1000 }: UpdatePromptProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isDismissed = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const ts = localStorage.getItem(DISMISSAL_KEY);
      if (!ts) return false;
      return Date.now() - parseInt(ts, 10) < DISMISSAL_DURATION;
    } catch {
      return false;
    }
  }, []);

  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    }
    setIsVisible(false);
  }, []);

  const applyUpdate = useCallback(() => {
    if (!('serviceWorker' in navigator)) {
      window.location.reload();
      return;
    }

    setIsRefreshing(true);
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) {
        window.location.reload();
        return;
      }

      if (registration.waiting) {
        // Pede pro SW waiting ativar
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Recarrega quando o novo SW assumir
      let reloaded = false;
      const handleControllerChange = () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Fallback: força reload depois de 5s se controllerchange não disparar
      setTimeout(() => {
        if (!reloaded) {
          reloaded = true;
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          window.location.reload();
        }
      }, 5000);
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const handleUpdateFound = (registration: ServiceWorkerRegistration) => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller // havia SW anterior
        ) {
          console.log('[UpdatePrompt] New version installed, prompting...');
          setUpdateAvailable(true);
          if (!isDismissed()) {
            // Delay para não aparecer instantaneamente
            setTimeout(() => setIsVisible(true), 1500);
          }
        }
      });
    };

    // Verifica registro atual
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      // Se já tem um waiting, mostra prompt
      if (registration.waiting && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
        if (!isDismissed()) {
          setTimeout(() => setIsVisible(true), 1500);
        }
      }

      // Listener para futuros updates
      registration.addEventListener('updatefound', () => handleUpdateFound(registration));
    });

    // Poll periódico para forçar check de update
    let interval: ReturnType<typeof setInterval> | null = null;
    if (pollIntervalMs > 0) {
      interval = setInterval(() => {
        navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => {}));
      }, pollIntervalMs);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDismissed, pollIntervalMs]);

  // Modo force (debug)
  useEffect(() => {
    if (forceShow) {
      setUpdateAvailable(true);
      setIsVisible(true);
    }
  }, [forceShow]);

  if (!updateAvailable || !isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-amber-500/30 shadow-2xl shadow-amber-900/30">
        {/* Icon com glow */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-violet-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <RefreshCw className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Nova versão disponível</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Atualize para acessar as últimas melhorias
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={applyUpdate}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-900 text-sm font-bold transition-all active:scale-95 min-h-[44px] min-w-[44px]"
            aria-label="Atualizar agora"
          >
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button
            onClick={dismiss}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Dispensar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdatePrompt;