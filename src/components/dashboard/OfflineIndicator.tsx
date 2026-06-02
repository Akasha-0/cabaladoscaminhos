'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showBanner && !isOnline
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0'
      } bg-gradient-to-r from-amber-600 to-orange-600 text-black px-4 py-2 shadow-lg`}
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">
          Você está offline. Algumas funcionalidades podem não estar disponíveis.
        </span>
      </div>
    </div>
  );
}
