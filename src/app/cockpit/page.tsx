// src/app/cockpit/page.tsx
// Cockpit Oracular — workspace de divinação profissional (produto B2B).
// Server Component: aplica o portão de autenticação do Operator (Doc 16 AD-03 / Onda D).
// Sem sessão válida → redireciona para /cockpit/login.

import { redirect } from 'next/navigation';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { CockpitOracular } from '@/components/cockpit/CockpitOracular';

export default async function CockpitPage({
  searchParams,
}: {
  searchParams: Promise<{ debug?: string }>;
}) {
  // Portão de autenticação: o cockpit só abre para um Operator autenticado.
  const operator = await getOperatorFromServerContext();
  if (!operator) {
    redirect('/cockpit/login');
  }

  const sp = await searchParams;
  const showDebug = process.env.NODE_ENV === 'development' || sp?.debug === 'true';

  return (
    // `ramiro` aplica a paleta v2 (laranja + azul royal — Doc 13) a todo o cockpit.
    <main className="ramiro min-h-screen bg-background text-foreground">
      <CockpitOracular showDebug={showDebug} />
    </main>
  );
}