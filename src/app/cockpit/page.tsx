// src/app/cockpit/page.tsx
// Cockpit Oracular — workspace de divinação profissional (produto B2B).
// O layout raiz (`app/cockpit/layout.tsx`) já aplica auth gate + B2BNav + escopo `.ramiro`.
// Esta página é um Server Component que apenas renderiza o conteúdo do cockpit.
// Defesa em profundidade: re-checa auth aqui também (Doc 16 AD-03).
import { redirect } from 'next/navigation';
import { CockpitOracular } from '@/components/cockpit/CockpitOracular';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';

export default async function CockpitPage({
  searchParams,
}: {
  searchParams: Promise<{ debug?: string }>;
}) {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  const sp = await searchParams;
  const showDebug = process.env.NODE_ENV === 'development' || sp?.debug === 'true';

  return <CockpitOracular showDebug={showDebug} />;
}
