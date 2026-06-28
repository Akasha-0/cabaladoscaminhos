// ============================================================================
// /workshops — Lista de workshops, rituais e círculos (W26)
// ============================================================================
// Rota pública indexável. Diferencia-se de /events (que é exclusivo para
// círculos online do W13) — esta rota cobre o catálogo completo:
// workshops, rituais, círculos de estudo e meditações.
//
// URL note: o spec original pedia `/events`, mas essa URL já é ocupada
// pelo W13 (Círculos online, em src/app/(community)/events/). Pra não
// quebrar W13/W20 (SEO indexado), o W26 usa `/workshops` e mantém
// canônico via `<link rel="canonical">` apontando para `/workshops`.
//
// Stack: Server Component (zero JS no HTML inicial), renderiza EventList
// (Client Component) que faz filtro client-side sobre o array de mocks.
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Sparkles } from 'lucide-react';
import { mockEvents } from '@/lib/events/mock';
import { EventList } from '@/components/events/EventList';
import { getServerT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Workshops, Rituais e Círculos | Akasha',
  description:
    'Catálogo completo de eventos Akasha: workshops práticos, rituais, círculos de estudo e meditações guiadas. Online e presencial. Tradições: Cabala, Ifá, Tantra, Candomblé e mais.',
  alternates: {
    canonical: '/workshops',
    languages: {
      'pt-BR': '/workshops',
      en: '/workshops',
      es: '/workshops',
    },
  },
  openGraph: {
    title: 'Workshops, Rituais e Círculos | Akasha',
    description:
      'Workshops, rituais, círculos de estudo e meditações. Online e presencial.',
    url: '/workshops',
    type: 'website',
    locale: 'pt_BR',
  },
};

// JSON-LD estruturado pra indexação
function EventListJsonLd() {
  const events = mockEvents.slice(0, 8).map((e) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    description: e.description.slice(0, 200),
    startDate: e.startsAt,
    endDate: e.endsAt,
    eventAttendanceMode:
      e.locationKind === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : e.locationKind === 'presencial'
          ? 'https://schema.org/OfflineEventAttendanceMode'
          : 'https://schema.org/MixedEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location:
      e.locationKind === 'online'
        ? { '@type': 'VirtualLocation', url: e.onlineUrl ?? '' }
        : {
            '@type': 'Place',
            name: e.neighborhood ?? e.city ?? 'Presencial',
            address: `${e.city ?? ''}${e.neighborhood ? ', ' + e.neighborhood : ''}`,
          },
    image: e.coverImage,
    organizer: {
      '@type': 'Person',
      name: e.host.displayName,
    },
    offers: {
      '@type': 'Offer',
      price: e.priceCents === null ? 0 : (e.priceCents / 100).toFixed(2),
      priceCurrency: 'BRL',
      availability:
        e.signupStatus === 'full'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
    },
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(events) }}
    />
  );
}

export default async function WorkshopsPage() {
  // i18n: lê locale do cookie (definido pelo middleware) com fallback pt-BR.
  // W20 substituiu o stub `t(key, fallback) => fallback` por getServerT() que
  // consulta os 3 dicionários (PT-BR/EN/ES). O `fallback` continua existindo
  // como defesa caso uma chave ainda não tenha sido adicionada ao pt-BR.
  const t = await getServerT();

  // Eventos futuros ordenados (mock — substituído por API em W27+)
  const now = Date.now();
  const upcoming = mockEvents
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );

  const upcomingCount =
    upcoming.length === 1
      ? t('events.upcomingCountOne', { count: upcoming.length })
      : t('events.upcomingCountOther', { count: upcoming.length });

  return (
    <>
      <EventListJsonLd />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-slate-950 text-slate-100 focus:outline-none pb-24 md:pb-12"
        data-testid="workshops-list-page"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-6">
          {/* Header */}
          <header className="space-y-2">
            <p className="text-[11px] uppercase tracking-widest text-amber-400/80 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              {t('events.eyebrow')}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-cinzel font-semibold bg-gradient-to-r from-amber-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
              {t('events.title')}
            </h1>
            <p className="text-sm md:text-base text-slate-400 font-raleway max-w-2xl">
              {t('events.subtitle')}
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {upcomingCount}
              </span>
              <span aria-hidden="true">·</span>
              <Link
                href="/events"
                className="hover:text-amber-300 transition-colors underline-offset-2 hover:underline"
              >
                {t('events.seeOnlineCircles')}
              </Link>
            </div>
          </header>

          {/* Lista */}
          <EventList events={upcoming} featuredSlug={upcoming[0]?.slug} />
        </div>
      </main>
    </>
  );
}