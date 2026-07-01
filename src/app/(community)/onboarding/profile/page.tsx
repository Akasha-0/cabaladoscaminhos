// ============================================================================
// /onboarding/profile — Beta Onboarding Wave 35
// ============================================================================
// Wizard de configuração de perfil público: avatar, displayName, bio,
// preferred tradição, practice preferences, LGPD consent refresh,
// email notification preferences.
//
// Server component: autentica + carrega state inicial.
// Client component (ProfileWizard) lida com formulário + validação.
//
// Retomo: se já está em TRADITION_CHOSEN+, redireciona para next step.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import { readOnboardingState } from '@/lib/onboarding/persistence';
import { getNextRoute } from '@/lib/onboarding/state-machine';
import { ProfileWizard } from '@/components/onboarding/ProfileWizard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Configure seu perfil · Akasha Portal',
  description: 'Como você quer aparecer na Cabala dos Caminhos?',
  robots: { index: false, follow: false },
};

export default async function ProfileSetupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const supabaseId = data.user?.id;
  if (!supabaseId) redirect('/login?redirectTo=/onboarding/profile');

  const u = await prisma.user.findUnique({
    where: { supabaseUserId: supabaseId },
    select: { id: true, nomeCompleto: true, email: true },
  });
  if (!u) redirect('/login?redirectTo=/onboarding/profile');

  const state = await readOnboardingState(u.id);
  if (!state) redirect('/login?redirectTo=/onboarding/profile');

  // Retomo: pular adiante se já passou.
  if (
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
      className="focus:outline-none min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 px-4 py-8"
    >
      <ProfileWizard
        defaultDisplayName={state.displayName ?? u.nomeCompleto.split(' ')[0]}
        defaultBio={state.bioPublic ?? ''}
        defaultTradition={state.preferredTradition ?? ''}
        defaultPractices={state.practicePreferences}
        defaultEmailPrefs={{
          newContent: state.emailPrefsNewContent,
          community: state.emailPrefsCommunity,
          mentorship: state.emailPrefsMentorship,
          marketing: state.emailPrefsMarketing,
          npsSurveys: state.emailPrefsNpsSurveys,
        }}
        defaultAvatarUrl={state.avatarUrl ?? null}
        defaultLgpdRefreshedAt={state.lgpdRefreshedAt ? state.lgpdRefreshedAt.toISOString() : null}
        userEmail={u.email}
        nextRouteOnComplete="/onboarding/first-actions"
      />
    </main>
  );
}