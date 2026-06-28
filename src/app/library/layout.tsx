// ============================================================================
// /library — Layout (Wave 20 SEO)
// ============================================================================
// /library/page.tsx é client component (estados de loading/empty/error).
// Como client components não exportam metadata, centralizamos o SEO no
// layout.tsx — Next.js propaga `metadata` para todas as rotas descendentes.
//
// Omitir `title` em `buildPageMetadata` aqui gera conflito com o template
// "%s | Akasha Portal" do root layout — então passamos `title` explícito.
// ============================================================================

import type { Metadata } from 'next';
import {
  buildPageMetadata,
  SeoJsonLd,
  websiteLd,
} from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Biblioteca Akasha — Artigos, papers e práticas curadas',
  description:
    'Biblioteca curada de artigos, papers científicos e práticas de Cabala, Ifá, Tantra, Meditação, Xamanismo e mais. Cada texto com nível de evidência classificado (anecdótico, revisado, meta-análise).',
  path: '/library',
  category: 'library',
  priority: 0.9,
});

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD: WebSite schema reforça o site-wide search (Google SiteLinks
          Search Box). Organization já está no root layout. */}
      <SeoJsonLd data={websiteLd()} />
      {children}
    </>
  );
}