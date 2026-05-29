'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after user has been on page for 30 seconds
      setTimeout(() => setShow(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  if (!show || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 z-50 animate-in slide-in-from-bottom">
      <Card className="card-spiritual p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Download className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Instalar Cabala</p>
            <p className="text-sm text-slate-400">Acesse rapidamente pelo seu dispositivo</p>
          </div>
          <button onClick={() => setShow(false)} className="p-1 hover:bg-slate-800 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            Não, obrigado
          </button>
        </div>
      </Card>
    </div>
  );
}
