// src/app/cockpit/layout.tsx
// Layout raiz do Cockpit Oracular (B2B).
// Aplica auth gate (Doc 16 AD-03) e envolve todas as sub-rotas com a B2BNav.
// Cada página filha pode re-checar auth (defesa em profundidade) sem problema.
import { redirect } from 'next/navigation';
import { B2BNav } from '@/components/cockpit/navigation/B2BNav';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';

export default async function CockpitLayout({ children }: { children: React.ReactNode }) {
  const operator = await getOperatorFromServerContext();
  if (!operator) {
    redirect('/cockpit/login');
  }

  return (
    // `ramiro` aplica a paleta v2 (laranja + azul royal — Doc 13) a todo o cockpit
    <div className="ramiro min-h-screen bg-background text-foreground flex">
      <B2BNav operator={operator} />
      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
