'use client';

/**
 * Wave 24 — Onboarding error boundary.
 *
 * Captura erros do fluxo de onboarding (validação, salvamento, etc).
 * CTA: tentar novamente + voltar ao início (sem perder progresso via
 * state management).
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[onboarding] error boundary:', error);
  }, [error]);

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center p-6"
      data-testid="onboarding-error"
      role="alert"
    >
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="font-cinzel text-xl text-slate-100">
            Algo interrompeu o onboarding
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pode ser uma falha de rede ou no salvamento. Seu progresso
            está seguro — tente novamente para continuar de onde parou.
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
            data-testid="onboarding-retry"
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Continuar de onde parei
          </button>
          <Link
            href="/"
            className="min-h-[44px] px-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Início
          </Link>
        </div>
      </div>
    </div>
  );
}
