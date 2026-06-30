// ============================================================================
// /forgot — Esqueci minha senha (Wave 93-B)
// ============================================================================
// Server component shell que envolve ForgotForm (client island).
// Rota canonical W93-B (alias de /reset-password legacy).
//
// Suspense: useSearchParams() no ForgotForm requer CSR bailout boundary
// (consistente com /login).
// ============================================================================

import { Suspense } from 'react';
import { ForgotForm } from './ForgotForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const metadata = {
  title: 'Recuperar senha · Akasha Portal',
  description: 'Receba um link por email para redefinir sua senha.',
};

function ForgotFormFallback() {
  return (
    <div className="card-spiritual p-8 rounded-2xl max-w-md w-full flex items-center justify-center min-h-[420px]">
      <LoadingSpinner variant="gold" size="md" />
    </div>
  );
}

export default function ForgotPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Suspense fallback={<ForgotFormFallback />}>
        <ForgotForm />
      </Suspense>
    </main>
  );
}