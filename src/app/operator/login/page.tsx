// src/app/operator/login/page.tsx
// Página de login do Operator (B2B) — usa OperatorAuthProvider + OperatorLoginForm.

import { OperatorLoginForm } from '@/components/auth/OperatorLoginForm';

export default function OperatorLoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-orange-400 mb-1" style={{ fontFamily: 'var(--font-cinzel)' }}>
          ✦ Cabala dos Caminhos ✦
        </h1>
        <p className="text-slate-400 text-sm">Acesso do Operador (Cockpit)</p>
      </div>

      <OperatorLoginForm />

      <p className="mt-8 text-xs text-slate-600 text-center max-w-md">
        Cockpit é o workspace de leitura para terapeutas. Se você é consulente,
        <br />acesse sua área de cliente.
      </p>
    </main>
  );
}
