// ============================================================================
// /onboarding/first-actions — Beta Onboarding Wave 35
// ============================================================================
// Mostra 5 first-action CTAs para o usuário fazer sua primeira interação
// significativa com a plataforma (post, chat, mapa, leitura, mentoria).
//
// Server component: autentica + carrega state. Redireciona se já onboarded.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import { readOnboardingState } from '@/lib/onboarding/persistence';
import { getNextRoute } from '@/lib/onboarding/state-machine';
import { FirstActionPrompts } from '@/components/onboarding/FirstActionPrompts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Sua primeira ação · Akasha Portal',
  description: 'Escolha por onde começar sua jornada.',
  robots: { index: false, follow: false },
};

export default async function FirstActionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const supabaseId = data.user?.id;
  if (!supabaseId) redirect('/login?redirectTo=/onboarding/first-actions');

  const u = await prisma.user.findUnique({
    where: { supabaseUserId: supabaseId },
    select: { id: true },
  });
  if (!u) redirect('/login?redirectTo=/onboarding/first-actions');

  const state = await readOnboardingState(u.id);
  if (!state) redirect('/login?redirectTo=/onboarding/first-actions');

  // Se ainda não completou profile, volta para trás.
  if (state.onboardingState === 'INVITED' || state.onboardingState === 'SIGNED_UP') {
    redirect(getNextRoute(state.onboardingState) ?? '/onboarding/welcome');
  }

  // Se já onboarded, redireciona para /feed.
  if (state.onboardingState === 'ONBOARDED' || state.onboardingState === 'SKIPPED') {
    redirect('/feed');
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 px-4 py-8"
    >
      <FirstActionPrompts />
    </main>
  );
}