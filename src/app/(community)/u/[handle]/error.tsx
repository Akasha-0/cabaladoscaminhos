'use client';

/**
 * Wave 24 — Public profile error boundary.
 *
 * Captura erros do /u/[handle] (perfil inexistente, falha de rede).
 * CTA: voltar à comunidade + tentar novamente.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Users } from 'lucide-react';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
     
    console.error('[profile] error boundary:', error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center p-6"
      data-testid="profile-error"
      role="alert"
    >
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="font-cinzel text-xl text-slate-100">
            Perfil indisponível
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Não conseguimos carregar esse perfil agora. Pode ser temporário —
            tente novamente, ou explore a comunidade enquanto isso.
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
            data-testid="profile-retry"
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
          <Link
            href="/community"
            className="min-h-[44px] px-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Comunidade
          </Link>
        </div>
      </div>
    </div>
  );
}
