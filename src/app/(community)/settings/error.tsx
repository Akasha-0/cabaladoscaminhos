'use client';

/**
 * Wave 21 — Settings route error boundary.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
     
    console.error('[settings] error boundary:', error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center p-6"
      data-testid="settings-error"
      role="alert"
    >
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="font-cinzel text-xl text-slate-100">
            Não foi possível abrir as configurações
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Tente novamente. Se o problema persistir, sua sessão pode ter
            expirado.
          </p>
        </div>
        {error.digest && (
          <p className="text-xs text-slate-500 font-mono">
            código: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <button
            type="button"
            onClick={reset}
            data-testid="settings-retry"
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={() => router.push('/login?redirectTo=/settings')}
            className="min-h-[44px] px-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 text-sm font-semibold inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Entrar novamente
          </button>
        </div>
      </div>
    </div>
  );
}