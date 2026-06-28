/**
 * Wave 21 — Login page loading skeleton.
 *
 * LoginForm já é wrap em <Suspense> internamente; este arquivo cobre a
 * navegação inicial para /login (antes do JS hidratar) com um esqueleto
 * que não causa layout shift quando o form aparece.
 */

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function LoginLoading() {
  return (
    <div
      className="card-spiritual p-8 rounded-2xl max-w-md w-full flex flex-col items-center justify-center min-h-[480px]"
      data-testid="login-loading"
      role="status"
      aria-label="Carregando formulário de login"
    >
      <LoadingSpinner variant="gold" size="md" />
      <p className="mt-4 text-sm text-slate-400 font-raleway">
        Preparando o portal…
      </p>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}