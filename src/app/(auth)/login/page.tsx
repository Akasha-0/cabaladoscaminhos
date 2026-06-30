// ============================================================================
// /login — entry point
// ----------------------------------------------------------------------------
// Server component shell + Suspense boundary (for useSearchParams in
// LoginForm). Uses the w68-backed auth pages (login-form.tsx + /api/auth/login).
// ============================================================================

import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from './login-form';

export const metadata = {
  title: 'Entrar · Akasha Portal',
  description: 'Entre na sua conta do Akasha Portal e conecte-se ao seu caminho espiritual.',
};

function LoginFormFallback() {
  return (
    <div className="min-h-[200px] flex items-center justify-center text-muted-foreground text-sm">
      <span className="animate-pulse">Carregando…</span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Portal Espiritual" subtitle="Conecte-se ao seu caminho">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
