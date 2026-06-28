'use client';

/**
 * Wave 24 — Post detail error boundary.
 *
 * Captura erros do /post/[id] (post não encontrado, falha de rede,
 * crash de provider). CTA: voltar ao feed + tentar novamente.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function PostDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
     
    console.error('[post-detail] error boundary:', error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center p-6"
      data-testid="post-detail-error"
      role="alert"
    >
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="font-cinzel text-xl text-slate-100">
            Não conseguimos abrir essa publicação
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            O post pode ter sido removido, ou houve um problema temporário.
            Tente recarregar ou voltar ao feed.
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
            data-testid="post-detail-retry"
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
          <Link
            href="/feed"
            className="min-h-[44px] px-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 text-sm font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao feed
          </Link>
        </div>
      </div>
    </div>
  );
}
