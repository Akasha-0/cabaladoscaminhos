'use client';

/**
 * Wave 24 — Signup error boundary.
 *
 * Captura erros do /signup (carregamento do formulário, falha de
 * provider). CTA: tentar novamente + voltar ao login.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

export default function SignupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[signup] error boundary:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-testid="signup-error"
      role="alert"
    >
      <div className="max-w-md w-full rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="font-cinzel text-lg text-slate-100">
            Algo deu errado ao abrir o cadastro
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Tente recarregar. Se persistir, talvez já tenha conta — entre
            diretamente.
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
            data-testid="signup-retry"
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
          <Link
            href="/login"
            className="min-h-[44px] px-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 text-sm font-semibold inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
