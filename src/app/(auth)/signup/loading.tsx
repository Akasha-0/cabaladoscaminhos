/**
 * Wave 24 — Signup route loading skeleton.
 *
 * Espelha o card de signup (logo + título + campos + CTA) para evitar
 * layout shift durante Suspense fallback.
 */

import { Skeleton } from '@/components/design-system/skeleton';

export default function SignupLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-testid="signup-loading"
      role="status"
      aria-label="Carregando cadastro"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur p-8 space-y-6">
        {/* Logo / heading */}
        <div className="text-center space-y-3">
          <Skeleton variant="circle" className="h-12 w-12 mx-auto" />
          <Skeleton variant="text" size="lg" className="mx-auto" width="14rem" />
          <Skeleton variant="text" size="sm" className="mx-auto" width="20rem" />
        </div>

        {/* Campos */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Skeleton variant="text" size="sm" width="6rem" />
            <Skeleton variant="rect" className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton variant="text" size="sm" width="6rem" />
            <Skeleton variant="rect" className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton variant="text" size="sm" width="8rem" />
            <Skeleton variant="rect" className="h-11 w-full rounded-xl" />
          </div>
        </div>

        {/* CTA */}
        <Skeleton variant="rect" className="h-11 w-full rounded-xl" />

        {/* Footer link */}
        <Skeleton variant="text" size="sm" className="mx-auto" width="14rem" />

        <span className="sr-only">Preparando formulário de cadastro…</span>
      </div>
    </div>
  );
}
