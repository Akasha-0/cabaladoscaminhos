// ============================================================================
// OnboardingPageClient — Client component para header i18n do /onboarding
// ============================================================================
// Renderiza um welcome header usando useT() + PluralText + LocaleSwitcher.
// Mostra o passo atual (1..5) com plural CLDR-correct em 3 locales.
//
// ============================================================================

'use client';

import { useT } from '@/hooks/useT';
import { asTranslationKeyW93 } from '@/lib/w93/i18n-rollout-engine';
import { PluralText } from '@/components/i18n/PluralText';

const TOTAL_STEPS = 5;

export function OnboardingPageClient() {
  const { t } = useT();

  return (
    <section className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
        {t(asTranslationKeyW93('greeting.welcome'))}
      </h1>
      <p className="text-base text-slate-400 max-w-2xl mx-auto mb-4">
        {t(asTranslationKeyW93('onboarding.step.traditions.subtitle'))}
      </p>
      <p className="text-xs text-muted-foreground">
        <PluralText
          singularKey="aria.phase.progress"
          pluralKey="aria.phase.progress"
          n={TOTAL_STEPS}
          vars={{ current: 1, total: TOTAL_STEPS }}
        />
      </p>
    </section>
  );
}