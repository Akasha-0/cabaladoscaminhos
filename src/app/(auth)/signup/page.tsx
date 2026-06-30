// ============================================================================
// /signup — entry point
// ============================================================================

import { AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from './signup-form';

export const metadata = {
  title: 'Criar conta · Akasha Portal',
  description: 'Crie sua conta no Akasha Portal e comece sua jornada espiritual.',
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Iniciar Caminho"
      subtitle="Bem-vindo à jornada"
    >
      <SignupForm />
    </AuthShell>
  );
}
