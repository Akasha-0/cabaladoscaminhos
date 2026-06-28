'use client';

/**
 * Wave 21 — Login page error boundary.
 *
 * Captura erros lançados pelo (auth)/login/page.tsx (e o Suspense interno
 * do LoginForm) e exibe fallback amigável. Login tem tratamento próprio
 * de erros via `serverError` no LoginForm, então este boundary cobre
 * principalmente: falha no carregamento do JS, crash do provider Supabase,
 * ou erros lançados antes da hidratação.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[login] error boundary:', error);
  }, [error]);

  return (
    <div
      className="card-spiritual p-8 rounded-2xl max-w-md w-full"
      data-testid="login-error"
      role="alert"
    >
      <div className="text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="font-cinzel text-lg text-slate-100">
            Algo deu errado ao abrir a página de login
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pode ser uma falha temporária. Tente recarregar — se o problema
            continuar, entre em contato com o suporte.
          </p>
        </div>
        {error.digest && (
          <p className="text-xs text-slate-500 font-mono">
            código: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          data-testid="login-retry"
          className="min-h-[44px] px-6 rounded-xl bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light text-slate-900 text-sm font-bold inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
        <p className="text-xs text-slate-500 pt-2">
          Ainda não tem conta?{' '}
          <Link href="/signup" className="text-spiritual-gold hover:underline">
            Criar uma conta
          </Link>
        </p>
      </div>
    </div>
  );
}