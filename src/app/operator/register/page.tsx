// src/app/operator/register/page.tsx
// Página de registro do Operator (B2B).
import { OperatorRegisterForm } from '@/components/auth/OperatorRegisterForm';
import { OperatorAuthProvider } from '@/components/providers/OperatorAuthProvider';

export default function OperatorRegisterPage() {
  return (
    <OperatorAuthProvider>
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold text-orange-400 mb-1"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ✦ Cabala dos Caminhos ✦
          </h1>
          <p className="text-slate-400 text-sm">Registre-se como Operador</p>
        </div>

        <OperatorRegisterForm />
      </main>
    </OperatorAuthProvider>
  );
}
