// ============================================================================
// /marketplace — Catálogo de ofertas de leitura/prática (W86-B)
// ----------------------------------------------------------------------------
// Integra o engine W85-B (`marketplace-lectura-praticas`) com a UI:
//   - Server Component carrega offerings + practitioners (InMemoryAdapter)
//   - Client Component aplica filtros, busca debounced, modal de booking
//
// Mobile-first (consulta cotidiana):
//   - 1 coluna (≤640px) → 2 colunas (≤1024px) → 3 colunas (>1024px)
//   - Filtros em chips colapsáveis
//   - Modal de booking em bottom-sheet (mobile) → dialog (desktop)
// ============================================================================

import type { Metadata } from 'next';
import { createMarketplaceEngine, SAMPLE_OFFERINGS, SAMPLE_PRACTITIONERS, type OfferingId, type PractitionerId, type OfferingType, type Tradicao } from '@/lib/engines/marketplace/marketplace-engine';
import { buildVerifiedPractitionerSet } from './_lib/build-verified-set';
import { MarketplacePageClient } from './MarketplacePageClient';

export const metadata: Metadata = {
  title: 'Marketplace · Leitura & Práticas | Akasha',
  description:
    'Catálogo de leituras, práticas, mentorias, rituais e consultas das 7 tradições. Practitioners verificados para ofertas sagradas.',
  alternates: { canonical: '/marketplace' },
  openGraph: {
    title: 'Marketplace · Leitura & Práticas',
    description: '7 tradições · Practitioners verificados · Ofertas sagradas',
    url: '/marketplace',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function MarketplacePage() {
  const engine = createMarketplaceEngine();

  // List everything once; client-side filter composes on top.
  const allOfferings = engine.listOfferings({});
  const verifiedPractitionerIds = buildVerifiedPractitionerSet(SAMPLE_PRACTITIONERS);

  // Pre-bucket for the page (used for "total offerings" stat).
  const counts = {
    total: allOfferings.length,
    sacred: allOfferings.filter((o) => o.sacred).length,
    verified: allOfferings.filter((o) => verifiedPractitionerIds.has(o.practitionerId)).length,
    traditions: new Set(allOfferings.map((o) => o.tradicao)).size,
  };

  // JSON-LD for SEO (best-effort — minimal ItemList)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Marketplace · Leitura & Práticas',
    numberOfItems: counts.total,
    itemListElement: allOfferings.slice(0, 12).map((o, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: o.title,
        description: o.description,
        provider: { '@type': 'Person', name: o.practitionerName },
        offers: {
          '@type': 'Offer',
          price: o.priceBRL,
          priceCurrency: 'BRL',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketplacePageClient
        initialOfferings={allOfferings as ReadonlyArray<typeof allOfferings[number]>}
        practitioners={SAMPLE_PRACTITIONERS as ReadonlyArray<typeof SAMPLE_PRACTITIONERS[number]>}
        verifiedPractitionerIds={Array.from(verifiedPractitionerIds)}
        counts={counts}
      />
    </>
  );
}

// We use these helper types only for inference above; no runtime emit.
export type _MarketplacePageTypes =
  | OfferingId
  | PractitionerId
  | OfferingType
  | Tradicao;