// ============================================================================
// /community — Layout (Wave 20 SEO)
// ============================================================================
// O feed principal (/community) é gated por auth (visibilidade COMMUNITY).
// Esta rota existe como hub público (descoberta de grupos, tradição, etc)
// mesmo para visitantes deslogados — as páginas internas (posts) são SSR
// com redirect para /login.
//
// O layout metadata propaga para qualquer rota descendente (ex.: futuras
// páginas /community/groups/[slug]). 
// ============================================================================

import type { Metadata } from 'next';
import {
  buildPageMetadata,
  SeoJsonLd,
} from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Comunidade Akasha — Pessoas, grupos e tradições',
  description:
    'Comunidade online de espiritualidade universalista. Feed, grupos por tradição, mentoria 1-on-1 e conexões com praticantes de Cabala, Ifá, Tantra, Meditação, Xamanismo e mais.',
  path: '/community',
  category: 'community',
  priority: 0.8,
});

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://cabaladoscaminhos.com/community#webpage',
          name: 'Comunidade Akasha',
          description:
            'Hub público da comunidade de espiritualidade universalista.',
          url: 'https://cabaladoscaminhos.com/community',
          inLanguage: 'pt-BR',
          isPartOf: { '@id': 'https://cabaladoscaminhos.com#website' },
        }}
      />
      {children}
    </>
  );
}