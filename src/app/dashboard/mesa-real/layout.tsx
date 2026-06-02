// src/app/dashboard/mesa-real/layout.tsx
// Auth gate (Fase 17) para a área Operator de Mesa Real.
//
// `/dashboard/mesa-real/*` é o workspace B2B (mesma feature de
// `/cockpit/*`). Antes da Fase 17, a página era `'use client'` e
// dependia do gate da API; agora este layout (server component) faz
// o redirect server-side antes de qualquer JS do cliente rodar, igual
// ao `/cockpit/layout.tsx` (Doc 16 AD-03 — defense in depth).
import { requireOperatorPage } from '@/lib/auth/operator-guard';

export const dynamic = 'force-dynamic';

export default async function MesaRealLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOperatorPage();
  return <>{children}</>;
}
