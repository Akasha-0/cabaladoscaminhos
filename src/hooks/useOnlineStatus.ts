'use client';

/**
 * useOnlineStatus — detecta online/offline em tempo real
 * ----------------------------------------------------------------------------
 * Wrap nativo de `navigator.onLine` + listeners online/offline.
 *
 * SSR-safe: retorna `true` (assumir online até confirmar).
 *
 * Uso:
 *   const online = useOnlineStatus();
 *   if (!online) return <OfflineBanner />;
 */

import { useEffect, useState } from 'react';

export function useOnlineStatus(initial = true): boolean {
  const [online, setOnline] = useState<boolean>(initial);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setOnline(navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

export default useOnlineStatus;
