// ============================================================================
// /signup — Cadastro (Wave 20 — Optimized 1-step flow)
// ============================================================================
// Renderiza OptimizedSignupForm (1-step, magic link primary, Google OAuth
// prominent, social proof inline). Mantém RegisterForm legacy disponível
// para rollback via flag.
//
// Suspense envolve o form (consistente com /login e futuras extensões).
// ============================================================================

import { Suspense } from 'react';
import { OptimizedSignupForm } from '@/components/auth/OptimizedSignupForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const metadata = {
  title: 'Criar conta · Akasha Portal',
  description:
    'Crie sua conta espiritual em 1 passo. Magic link ou Google. Sem fricção.',
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
    <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Suspense fallback={<SignupFormFallback />}>
        <OptimizedSignupForm />
      </Suspense>
    </main>
  );
}
