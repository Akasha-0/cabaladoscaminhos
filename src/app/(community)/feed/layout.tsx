// ============================================================================
// /feed — Layout (Wave 27 perf — metadata + JSON-LD)
// ============================================================================
// Metadata here porque (community)/feed/page.tsx é 'use client' (não pode
// exportar metadata). Move em W31-2 após deletar app/feed/page.tsx (que
// causava colisão de rota com (community)/feed/page.tsx).
//
// O feed é client component porque tem infinite scroll, filtros e estado
// de loading. Mas o layout (header + chrome) é server component — Next.js
// faz a composição híbrida automaticamente.
// ============================================================================

import type { Metadata } from 'next';
import {
  buildPageMetadata,
  SeoJsonLd,
  websiteLd,
} from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Feed da Comunidade — Akasha Portal',
  description:
    'Feed cronológico da comunidade Akasha. Posts, reflexões e práticas de Cabala, Ifá, Tantra, Meditação, Xamanismo, Astrologia e mais tradições. Infinite scroll, filtros por tradição.',
  path: '/feed',
  category: 'community',
  priority: 0.9,
});

// Feed é altamente dinâmico (posts em tempo real). Default = 'auto' (renderiza
// estático + revalida). Manter default é o melhor dos dois mundos.
export const revalidate = 60; // ISR 60s — stale-while-revalidate

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeoJsonLd data={websiteLd()} />
      {children}
    </>
  );
}
