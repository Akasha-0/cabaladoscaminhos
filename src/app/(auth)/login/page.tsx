import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const metadata = {
  title: 'Entrar · Akasha Portal',
  description: 'Entre na sua conta do Akasha Portal e conecte-se ao seu caminho espiritual.',
};

// ----------------------------------------------------------------------------
// Componente interno (client) — usa useSearchParams, precisa estar dentro
// de um <Suspense> boundary para satisfazer o CSR bailout do Next 16.
// ----------------------------------------------------------------------------

function LoginFormFallback() {
  return (
    <div className="card-spiritual p-8 rounded-2xl max-w-md w-full flex items-center justify-center min-h-[420px]">
      <LoadingSpinner variant="gold" size="md" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
