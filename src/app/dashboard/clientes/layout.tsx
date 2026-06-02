// src/app/dashboard/clientes/layout.tsx
// Auth gate (Fase 17) para a gestão de consulentes do Operator.
//
// `/dashboard/clientes/*` é o workspace B2B de consulentes (mesma
// feature de `/cockpit/consulentes/*`). Antes da Fase 17, a página
// era `'use client'` e dependia do gate da API; agora este layout
// (server component) faz o redirect server-side antes do JS hidratar,
// igual ao `/cockpit/layout.tsx` (Doc 16 AD-03).
import { requireOperatorPage } from '@/lib/auth/operator-guard';

export const dynamic = 'force-dynamic';

export default async function ClientesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOperatorPage();
  return <>{children}</>;
}
