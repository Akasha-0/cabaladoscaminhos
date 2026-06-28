// ============================================================================
// /events — Layout (Wave 20 SEO)
// ============================================================================
// Círculos de partilha online. Cada evento gera um JSON-LD Event para
// rich results no Google Search ("Evento online em DD/MM, link de RSVP").
// O list público em /events é indexável; páginas individuais de evento
// também (/events/[id]).
// ============================================================================

import type { Metadata } from 'next';
import {
  buildPageMetadata,
  SeoJsonLd,
} from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Círculos Akasha — Eventos e rodas de conversa online',
  description:
    'Workshops, meditações guiadas, rodas de conversa e círculos de partilha online. Tradições: Cabala, Ifá, Tantra, Meditação, Xamanismo, Astrologia e mais. RSVP aberto.',
  path: '/events',
  category: 'events',
  priority: 0.8,
});

export default function EventsLayout({
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
          '@id': 'https://cabaladoscaminhos.com/events#webpage',
          name: 'Círculos Akasha',
          description: 'Eventos e rodas de conversa online da comunidade.',
          url: 'https://cabaladoscaminhos.com/events',
          inLanguage: 'pt-BR',
          isPartOf: { '@id': 'https://cabaladoscaminhos.com#website' },
        }}
      />
      {children}
    </>
  );
}