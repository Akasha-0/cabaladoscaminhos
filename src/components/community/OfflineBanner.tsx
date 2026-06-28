'use client';

// ============================================================================
// OfflineBanner — Indicator "Sem internet" (Wave 24)
// ============================================================================
// Aparece quando navigator.onLine === false. Persiste no topo até reconectar.
// Auto-dismiss em 2s após voltar online (Toast-like).
//
// Visual:
//   - Compact pill, slide-down from top
//   - Não bloqueia conteúdo (fixed, pointer-events:none no wrap, auto no pill)
//   - Ícone WifiOff + texto
// ============================================================================

import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

export interface OfflineBannerProps {
  /** Mostrar também estado "back online" brevemente (default true). */
  showReconnected?: boolean;
  className?: string;
}

export function OfflineBanner({ showReconnected = true, className }: OfflineBannerProps) {
  const online = useOnlineStatus();
  const [showReconnectedToast, setShowReconnectedToast] = React.useState(false);

  // Detecta transição offline → online e exibe confirmação breve
  React.useEffect(() => {
    if (!online || !showReconnected) return;
    setShowReconnectedToast(true);
    const t = window.setTimeout(() => setShowReconnectedToast(false), 2500);
    return () => window.clearTimeout(t);
  }, [online, showReconnected]);

  if (online && !showReconnectedToast) return null;

  return (
    <div
      role={online ? 'status' : 'alert'}
      aria-live={online ? 'polite' : 'assertive'}
      aria-atomic="true"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-3',
        'pt-[max(env(safe-area-inset-top,0),0.5rem)]',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-auto inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-md',
          online
            ? 'border-emerald-500/50 bg-emerald-950/85 text-emerald-50 animate-fade-in-up'
            : 'border-amber-500/50 bg-amber-950/85 text-amber-50 animate-slide-in-from-top',
        )}
      >
        {online ? (
          <>
            <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Conexão restabelecida</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sem internet — mostrando conteúdo em cache</span>
          </>
        )}
      </div>
    </div>
  );
}

export default OfflineBanner;
