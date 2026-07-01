// ============================================================================
// /onboarding/tour — Beta Onboarding Wave 35
// ============================================================================
// Standalone page que monta o TourOverlay. Acessível via menu
// "Configurações → Rever tour" ou link em first-actions.
//
// Server component: autentica + carrega state. Client component (TourPage)
// renderiza o overlay.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import { readOnboardingState } from '@/lib/onboarding/persistence';
import { TourPageClient } from '@/components/onboarding/TourPageClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Tour pela plataforma · Akasha Portal',
  description: 'Conheça os principais recursos da Cabala dos Caminhos.',
  robots: { index: false, follow: false },
};

export default async function TourPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const supabaseId = data.user?.id;
  if (!supabaseId) redirect('/login?redirectTo=/onboarding/tour');

  const u = await prisma.user.findUnique({
    where: { supabaseUserId: supabaseId },
    select: { id: true },
  });
  if (!u) redirect('/login?redirectTo=/onboarding/tour');

  const state = await readOnboardingState(u.id);
  if (!state) redirect('/login?redirectTo=/onboarding/tour');

  return <TourPageClient userId={u.id} currentState={state.onboardingState} />;
}