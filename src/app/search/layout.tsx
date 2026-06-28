// ============================================================================
// /search — Layout (Wave 27 perf — metadata + JSON-LD)
// ============================================================================
// Wave 27 perf:
//   - Adiciona metadata (SEO + perf) — search/page.tsx é 'use client' e
//     não pode exportar metadata diretamente.
//   - Adiciona JSON-LD SearchAction (Google sitelinks search box).
//
// Search é altamente dinâmico (query params mudam constantemente). Default
// rendering = 'auto' (server renderiza o chrome estático, client faz a
// query via API).
// ============================================================================

import type { Metadata } from 'next';
import { buildPageMetadata, SeoJsonLd } from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Buscar na Comunidade — Akasha Portal',
  description:
    'Busca full-text em posts, artigos e perfis da comunidade Akasha. Filtros por tradição, data, formato e mais.',
  path: '/search',
  category: 'search',
  priority: 0.6,
  indexable: false, // search results pages não devem ser indexados
});

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://cabaladoscaminhos.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        }}
      />
      {children}
    </>
  );
}