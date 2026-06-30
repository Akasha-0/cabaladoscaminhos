// ============================================================================
// /akashic — Layout (Wave 27 perf — metadata + JSON-LD)
// ============================================================================
// Wave 27 perf:
//   - Adiciona metadata (SEO + perf) — akashic/page.tsx é 'use client' e
//     não pode exportar metadata diretamente.
//   - Adiciona JSON-LD SoftwareApplication para a IA curadora.
//
// A página do Akashic Chat é dinâmica (SSE streaming, voice mode, etc).
// O layout é server component — Next.js faz a composição híbrida.
// ============================================================================

import type { Metadata } from 'next';
import { buildPageMetadata, SeoJsonLd } from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Akashic IA — Curador multi-tradição com RAG',
  description:
    'Converse com a Akashic IA: curador multi-tradição alimentado por 50+ artigos curados de Cabala, Ifá, Tantra, Meditação, Xamanismo, Astrologia e mais. Respostas com citações das fontes.',
  path: '/akashic',
  category: 'ai',
  priority: 0.8,
});

const akashicSoftwareLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Akashic IA',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  description:
    'Curador multi-tradição alimentado por 50+ artigos curados com RAG. Cabala, Ifá, Tantra, Meditação, Xamanismo, Astrologia.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
    availability: 'https://schema.org/PreOrder',
  },
  featureList: [
    'Respostas fundamentadas em fontes curadas',
    'Citação de papers científicos e tradições ancestrais',
    'Suporte a 12 tradições espirituais',
    'Modo de estudo profundo',
    'Voice mode (Web Speech API)',
  ],
};

export default function AkashicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd data={akashicSoftwareLd} />
      {children}
    </>
  );
}