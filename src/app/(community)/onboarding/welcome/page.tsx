// ============================================================================
// /onboarding/welcome — Beta Onboarding Wave 35
// ============================================================================
// Carrossel de 4 passos que apresenta a plataforma ao novo beta-tester.
// Server component: verifica auth via Supabase. Se já tem onboarding >=
// PROFILE_SETUP, redireciona para `/onboarding/profile` (retomo).
//
// Steps (WELCOME_STEPS em lib/onboarding/state-machine.ts):
//   0. mission    — Quem somos / missão
//   1. traditions — 7 tradições suportadas (cards visuais)
//   2. features   — Akasha, Oráculo, Marketplace, Biblioteca
//   3. community  — Groups, Mentorship, Events
//
// Cada step tem botão "Continuar" + "Pular". Skip leva direto ao profile.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import { readOnboardingState } from '@/lib/onboarding/persistence';
import { getNextRoute } from '@/lib/onboarding/state-machine';
import { WelcomeCarousel } from '@/components/onboarding/WelcomeCarousel';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Bem-vindo(a) · Akasha Portal',
  description:
    'Conheça a Cabala dos Caminhos: missão, tradições, recursos e comunidade.',
  robots: { index: false, follow: false },
};

export default async function WelcomePage() {
  // Auth via Supabase.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const supabaseId = data.user?.id;
  if (!supabaseId) {
    redirect('/login?redirectTo=/onboarding/welcome');
  }

  const u = await prisma.user.findUnique({
    where: { supabaseUserId: supabaseId },
    select: { id: true },
  });
  if (!u) {
    redirect('/login?redirectTo=/onboarding/welcome');
  }

  const state = await readOnboardingState(u.id);
  if (!state) {
    redirect('/login?redirectTo=/onboarding/welcome');
  }

  // Retomo: se já passou do welcome, vai direto para o próximo passo.
  if (
    state.onboardingState === 'PROFILE_SETUP' ||
    state.onboardingState === 'TRADITION_CHOSEN' ||
    state.onboardingState === 'FIRST_ACTION' ||
    state.onboardingState === 'ONBOARDED' ||
    state.onboardingState === 'SKIPPED'
  ) {
    redirect(getNextRoute(state.onboardingState) ?? '/feed');
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
    >
      <WelcomeCarousel
        initialStep={state.onboardingWelcomeStep}
        nextRouteOnComplete="/onboarding/profile"
      />
    </main>
  );
}