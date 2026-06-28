// ============================================================================
// /welcome — First-value page (Wave 20) + Wave 19 i18n
// ============================================================================
// Renderizado após signup bem-sucedido (magic link confirmado OU password
// signup). Mostra 3 posts recomendados + 3 tradições pré-selecionadas.
// Métrica objetivo: time-to-first-value < 30s.
//
// Wave 19: metadata é gerada dinamicamente lendo o cookie de locale
// (escrito pelo middleware). Strings vêm dos 3 locales em
// `src/lib/i18n/locales/{pt-BR,en,es}.ts` namespace `welcome`.
// ============================================================================

import { Suspense } from 'react';
import { FirstValueExperience } from '@/components/conversion/FirstValueExperience';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getServerT } from '@/lib/i18n/server';

export async function generateMetadata() {
  const { locale, t } = await getServerT();
  return {
    title: `${t('welcome.metaTitle')} · Akasha Portal`,
    description: t('welcome.metaDescription'),
    // Outras tags poderiam ser adicionadas; mantemos enxuto aqui.
    metadataBase: undefined,
    openGraph: {
      locale: locale === 'pt-BR' ? 'pt_BR' : locale === 'en' ? 'en_US' : 'es_ES',
    },
  };
}

export default async function WelcomePage() {
  const { locale, t } = await getServerT();
  const fallbackHint = t('welcome.fallbackHint');

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <LoadingSpinner variant="gold" size="lg" />
        </div>
      }
    >
      <div
        // Localized fallback hint shown briefly until FirstValueExperience
        // hydrates. aria-live polite so SR announces it without stealing focus.
        className="sr-only"
        aria-live="polite"
        data-locale={locale}
      >
        {fallbackHint}
      </div>
      <FirstValueExperience />
    </Suspense>
  );
}