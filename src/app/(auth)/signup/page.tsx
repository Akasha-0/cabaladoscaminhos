// ============================================================================
// /signup — Cadastro (Wave 93-B — versão canonical com tradição primária)
// ============================================================================
// Server component shell que envolve SignupForm (client island).
//
// Diferença em relação à versão legacy (OptimizedSignupForm):
//   - Estrutura tradicional multi-campo (brief W93-B)
//   - Tradição primária opcional (brief W93-B)
//   - LGPD consent explícito
//   - Redirect pós-signup → /onboarding
// ============================================================================

import { Suspense } from 'react';
import { SignupForm } from './SignupForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const metadata = {
  title: 'Criar conta · Akasha Portal',
  description:
    'Crie sua conta espiritual e inicie sua jornada. Tradição primária opcional.',
};

function SignupFormFallback() {
  return (
    <div className="card-spiritual p-8 rounded-2xl max-w-md w-full flex items-center justify-center min-h-[480px]">
      <LoadingSpinner variant="gold" size="md" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Suspense fallback={<SignupFormFallback />}>
        <SignupForm />
      </Suspense>
    </main>
  );
}