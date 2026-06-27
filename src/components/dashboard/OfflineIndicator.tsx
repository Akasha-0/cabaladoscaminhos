'use client';

/**
 * OfflineIndicator — indicador visual quando o usuario esta offline.
 * ----------------------------------------------------------------------------
 * Aparece no canto da tela quando `navigator.onLine === false`.
 * Desaparece automaticamente quando volta online.
 */

import { useEffect, useState } from 'react';

export interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 ${className ?? ''}`}
    >
      <div className="rounded-full border border-amber-500 bg-amber-500/10 px-4 py-1.5 backdrop-blur-sm">
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
          </span>
          Voce esta offline
        </span>
      </div>
    </div>
  );
}