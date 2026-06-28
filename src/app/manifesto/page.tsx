// ============================================================================
// /manifesto — Server component shell (Wave 19 i18n)
// ============================================================================
// Mantém metadata SEO + JSON-LD breadcrumb. Strings traduzidas vivem
// em ManifestoClient.tsx (client) usando `useT()`.
// ============================================================================

import {
  buildPageMetadata,
  SeoJsonLd,
  breadcrumbLd,
} from '@/lib/seo/og';
import { getServerT } from '@/lib/i18n/server';
import { ManifestoClient } from './ManifestoClient';

export async function generateMetadata() {
  const { locale, t } = await getServerT();
  const base = buildPageMetadata({
    title: `${t('manifesto.title')} — Akasha Portal`,
    description: t('manifesto.intro'),
    path: '/manifesto',
    category: 'home',
    priority: 0.7,
  });
  return {
    ...base,
    openGraph: {
      ...(base.openGraph ?? {}),
      locale: locale === 'pt-BR' ? 'pt_BR' : locale === 'en' ? 'en_US' : 'es_ES',
    },
  };
}

export default function ManifestoPage() {
  return (
    <>
      <SeoJsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Manifesto', path: '/manifesto' },
        ])}
      />
      <ManifestoClient />
    </>
  );
}