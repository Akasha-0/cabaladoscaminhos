'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Download, X, Sparkles } from 'lucide-react';

const DISMISSAL_KEY = 'cabala_install_dismissed';
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export function InstallPrompt() {
  const { canInstall, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const checkDismissal = useCallback((): boolean => {
    if (typeof window === 'undefined') return true;
    try {
      const dismissed = localStorage.getItem(DISMISSAL_KEY);
      if (!dismissed) return false;
      const { timestamp } = JSON.parse(dismissed);
      return Date.now() - timestamp < DISMISSAL_DURATION;
    } catch {
      return false;
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISSAL_KEY, JSON.stringify({ timestamp: Date.now() }));
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  }, []);

  const handleInstall = async () => {
    await installApp();
    dismissPrompt();
  };

  useEffect(() => {
    if (!canInstall || checkDismissal()) return;

    // Small delay for initial animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
    }, 1500);

    return () => clearTimeout(showTimer);
  }, [canInstall, checkDismissal]);

  if (!isVisible || !canInstall) return null;

  return (
    <div
      className={`
        fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50
        transition-all duration-300 ease-out
        ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      <div className="relative bg-slate-900/95 backdrop-blur-md border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-900/20 overflow-hidden">
        {/* Gold accent gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            {/* App icon with glow */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-amber-500/30 rounded-2xl blur-lg" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-slate-900" />
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">
                Instalar Cabala dos Caminhos
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Acesse rapidamente pelo seu dispositivo
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={dismissPrompt}
              className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Instalar App
            </button>
            <button
              onClick={dismissPrompt}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
