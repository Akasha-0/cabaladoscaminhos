// ============================================================================
// Onboarding Page — `/onboarding` — Wave 93 i18n rollout
// ============================================================================
// Wrapper que renderiza:
//   1. Page meta + LocaleSwitcher (i18n-aware)
//   2. Welcome header com t() + PluralText
//   3. OnboardingFlow (componente existente, inalterado)
//
// OnboardingFlow em si tem 594 LOC com strings hardcoded; refatorar isso
// é um trabalho de cycle próprio. Aqui garantimos que a SUPERFÍCIE da página
// (/onboarding) é i18n-aware: header, counter, CTAs externos.
//
// ============================================================================

import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher';
import { PluralText } from '@/components/i18n/PluralText';
import { OnboardingPageClient } from './OnboardingPageClient';

// Impede pre-render estático (precisa de cookie de locale)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Onboarding · Akasha',
  description: 'Configure seu mapa espiritual em 5 passos.',
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header i18n */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Akasha · Onboarding
          </span>
          <LocaleSwitcher />
        </div>
      </header>

      {/* Welcome header (i18n) */}
      <OnboardingPageClient />

      {/* Flow original — strings internas inalteradas por enquanto */}
      <OnboardingFlow />
    </main>
  );
}