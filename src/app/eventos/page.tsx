// ============================================================================
// W93-D — /EVENTOS (lista + filtros)
// ----------------------------------------------------------------------------
// Server component que carrega lista de eventos via engine in-memory e
// repassa para um cliente de filtros. Filtros: tipo, tradição, modalidade,
// busca textual.
//
// SEO: metadata canônica + JSON-LD ItemList de eventos.
// Sacred-cultural: terminologia preservada (roda, gira, cerimônia, curso).
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Sparkles, Filter } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EventCard } from '@/components/events/EventCardNew';
import { EventsExplorer } from './_components/EventsExplorer';

import {
  type Event,
  type EventKind,
  type EventModality,
  type Tradition,
  EVENT_KIND_LABEL,
  TRADITION_LABEL,
} from '@/lib/w93/events-types.ts';

// Mock data determinístico para o seed (substituir por Prisma quando a
// rota de eventos estiver consolidada).
function seedEvents(): Event[] {
  const baseId = '11111111-1111-4111-8111-1111111111';
  const t0 = Date.parse('2026-08-15T19:00:00Z');
  return [
    {
      id: `${baseId}01` as Event['id'],
      slug: 'roda-de-cabala-setembro-2026',
      title: 'Roda de Cabala — Os 72 Shemot',
      description:
        'Roda de estudo e partilha sobre os 72 nomes divinos. Tradição: Cabala prática.\n\nCada participante traz uma pergunta, e o grupo caminha junto na interpretação dos Shemot.',
      kind: 'roda',
      tradition: 'cabala',
      startsAt: new Date(t0).toISOString(),
      endsAt: new Date(t0 + 90 * 60 * 1000).toISOString(),
      durationMin: 90,
      location: { kind: 'online', platform: 'Zoom' },
      capacity: 20,
      priceCents: null,
      coverImage: '/event-covers/roda-cabala.jpg',
      coverAlt: 'Roda de Cabala online com participantes em vídeo',
      host: {
        id: 'host-mago-hermes' as Event['host']['id'],
        displayName: 'Mago Hermes',
        handle: 'mago-hermes',
        traditionLine: 'Cabala · Ifá · Astrologia',
        bio: 'Facilitador Akasha. 18 anos de Cabala prática.',
      },
      language: 'pt-BR',
      signupStatus: 'open',
      closedByOrganizer: false,
      confirmedCount: 7,
      waitlistCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['iniciantes', 'estudo'],
    },
    {
      id: `${baseId}02` as Event['id'],
      slug: 'gira-de-caboclo-outubro-2026',
      title: 'Gira de Caboclo — Linha Jurema',
      description:
        'Gira de desenvolvimento mediúnico aberta a praticantes com ao menos 1 ano de caminhada. Linha: Cabocla Jurema.\n\nTrabalho: firmeza, passes, toque de pemba.',
      kind: 'gira',
      tradition: 'umbanda',
      startsAt: new Date(t0 + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(t0 + 7 * 24 * 60 * 60 * 1000 + 180 * 60 * 1000).toISOString(),
      durationMin: 180,
      location: { kind: 'presencial', city: 'Rio de Janeiro', state: 'RJ', country: 'BR', neighborhood: 'Ilê Axé Ogum Megê' },
      capacity: 25,
      priceCents: 5000,
      coverImage: '/event-covers/gira-caboclo.jpg',
      coverAlt: 'Gira de Umbanda em terreiro com médiuns em roda',
      host: {
        id: 'host-ia-helena' as Event['host']['id'],
        displayName: 'Iá Helena',
        handle: 'ia-helena',
        traditionLine: 'Candomblé · Umbanda',
        bio: 'Ialorixá do Ilê Axé Ogum Megê. Linha de frente: Cabocla Jurema.',
      },
      language: 'pt-BR',
      signupStatus: 'open',
      closedByOrganizer: false,
      confirmedCount: 12,
      waitlistCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['gira', 'mediunidade'],
    },
    {
      id: `${baseId}03` as Event['id'],
      slug: 'workshop-ifa-odu-online',
      title: 'Workshop de Ifá — Lendo os Odus',
      description:
        'Workshop prático de leitura de Odus. Pré-requisito: módulo 1 do curso de Ifá.\n\nMaterial incluso: pdf com os 16 Odus principais.',
      kind: 'workshop',
      tradition: 'ifa',
      startsAt: new Date(t0 + 14 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(t0 + 14 * 24 * 60 * 60 * 1000 + 240 * 60 * 1000).toISOString(),
      durationMin: 240,
      location: { kind: 'hibrido', city: 'Salvador', state: 'BA', country: 'BR', neighborhood: 'Ilê Axé Opô Afonjá', platform: 'Google Meet' },
      capacity: 30,
      priceCents: 15000,
      coverImage: '/event-covers/ifa-odu.jpg',
      coverAlt: 'Workshop de Ifá com babalaô e consulentes',
      host: {
        id: 'host-babalaorixa' as Event['host']['id'],
        displayName: 'Babalorixá Agbara',
        handle: 'babalaorixa-agbara',
        traditionLine: 'Ifá · Yorubá',
        bio: 'Sacerdote de Ifá iniciado em Osogbo.',
      },
      language: 'pt-BR',
      signupStatus: 'waitlist',
      closedByOrganizer: false,
      confirmedCount: 30,
      waitlistCount: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['avançado', 'ifa', 'odu'],
    },
    {
      id: `${baseId}04` as Event['id'],
      slug: 'curso-tantra-modulo-1',
      title: 'Curso de Tantra — Módulo 1: Fundamentos',
      description:
        'Primeiro módulo do curso de Tantra. Aulas semanais por 4 semanas.\n\nInscrição no módulo inteiro (4 sessões) com desconto.',
      kind: 'curso',
      tradition: 'tantra',
      startsAt: new Date(t0 + 21 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(t0 + 21 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
      durationMin: 120,
      location: { kind: 'presencial', city: 'São Paulo', state: 'SP', country: 'BR', neighborhood: 'Espaço Shiva Shakti' },
      capacity: 15,
      priceCents: 40000,
      coverImage: '/event-covers/tantra-mod1.jpg',
      coverAlt: 'Prática de tantra em grupo com facilitadora',
      host: {
        id: 'host-shakti' as Event['host']['id'],
        displayName: 'Maestra Shakti Devi',
        traditionLine: 'Tântrica · Kundalini Yoga',
        bio: 'Facilitadora de tantra e Kundalini.',
      },
      language: 'pt-BR',
      signupStatus: 'open',
      closedByOrganizer: false,
      confirmedCount: 8,
      waitlistCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['curso', 'tantra'],
    },
    {
      id: `${baseId}05` as Event['id'],
      slug: 'cerimonia-batismo-orixa',
      title: 'Cerimônia de Feitura de Orixá',
      description:
        'Cerimônia de feitura (batismo) de orixá. Restrita a participantes confirmados em consulta prévia.\n\nTrazer: roupa branca, pemba, balafon.',
      kind: 'cerimonia',
      tradition: 'candomble',
      startsAt: new Date(t0 + 28 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(t0 + 28 * 24 * 60 * 60 * 1000 + 360 * 60 * 1000).toISOString(),
      durationMin: 360,
      location: { kind: 'presencial', city: 'Salvador', state: 'BA', country: 'BR', neighborhood: 'Ilê Axé Iyami' },
      capacity: 8,
      priceCents: null,
      coverImage: '/event-covers/cerimonia-orixa.jpg',
      coverAlt: 'Cerimônia de Candomblé em terreiro com ogã e equedes',
      host: {
        id: 'host-ia-helena' as Event['host']['id'],
        displayName: 'Iá Helena',
        handle: 'ia-helena',
        traditionLine: 'Candomblé · Umbanda',
        bio: 'Ialorixá do Ilê Axé Ogum Megê.',
      },
      language: 'pt-BR',
      signupStatus: 'closed',
      closedByOrganizer: false,
      confirmedCount: 8,
      waitlistCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['cerimônia', 'iniciático'],
    },
  ];
}

export const metadata: Metadata = {
  title: 'Eventos e Workshops Akasha — Rodas, Giras, Cursos e Cerimônias',
  description:
    'Calendário de eventos da comunidade Akasha: rodas de conversa, giras, workshops práticos, cursos e cerimônias. Tradições: Cabala, Ifá, Candomblé, Umbanda, Tantra e mais.',
  alternates: {
    canonical: '/eventos',
    languages: { 'pt-BR': '/eventos', en: '/eventos', es: '/eventos' },
  },
  openGraph: {
    title: 'Eventos Akasha',
    description: 'Calendário completo de eventos da comunidade.',
    url: '/eventos',
    type: 'website',
  },
};

const KIND_FILTERS: Array<{ value: EventKind | 'all'; label: string }> = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'roda', label: EVENT_KIND_LABEL.roda },
  { value: 'workshop', label: EVENT_KIND_LABEL.workshop },
  { value: 'curso', label: EVENT_KIND_LABEL.curso },
  { value: 'cerimonia', label: EVENT_KIND_LABEL.cerimonia },
  { value: 'gira', label: EVENT_KIND_LABEL.gira },
];

const MODALITY_FILTERS: Array<{ value: EventModality | 'all'; label: string }> = [
  { value: 'all', label: 'Qualquer modalidade' },
  { value: 'online', label: 'Online' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'hibrido', label: 'Híbrido' },
];

const TRADITION_FILTERS: Array<{ value: Tradition | 'all'; label: string }> = [
  { value: 'all', label: 'Todas as tradições' },
  { value: 'cabala', label: TRADITION_LABEL.cabala },
  { value: 'ifa', label: TRADITION_LABEL.ifa },
  { value: 'candomble', label: TRADITION_LABEL.candomble },
  { value: 'umbanda', label: TRADITION_LABEL.umbanda },
  { value: 'tantra', label: TRADITION_LABEL.tantra },
  { value: 'astrologia', label: TRADITION_LABEL.astrologia },
  { value: 'sufismo', label: TRADITION_LABEL.sufismo },
  { value: 'xamanismo', label: TRADITION_LABEL.xamanismo },
];

export default function EventosPage() {
  const events = seedEvents();
  const featured = events.find((e) => e.signupStatus === 'open' && e.confirmedCount > 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="border-b border-zinc-800/60 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
          <div className="flex items-center gap-2 text-amber-400 mb-3">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm uppercase tracking-wider">Eventos Akasha</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Rodas, giras, workshops e cerimônias
          </h1>
          <p className="text-zinc-300 max-w-2xl">
            Calendário da comunidade. Encontros online, presenciais e híbridos conduzidos
            por sacerdotes, sacerdotisas e facilitadores com linhagem.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <Badge variant="outline" className="border-amber-500/30 text-amber-300">
              <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
              {events.length} eventos publicados
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
              <Filter className="w-3 h-3 mr-1" aria-hidden="true" />
              Filtros: tipo · tradição · modalidade
            </Badge>
          </div>
        </div>
      </section>

      {/* Lista com filtros */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <EventsExplorer
          events={events}
          kindFilters={KIND_FILTERS}
          modalityFilters={MODALITY_FILTERS}
          traditionFilters={TRADITION_FILTERS}
        />
      </section>

      {/* CTA criar evento */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">É facilitador ou sacerdote?</h2>
            <p className="text-zinc-400 mb-4">
              Publique seu evento na comunidade Akasha. RSVP, lista de espera e exportação
              para calendário inclusos.
            </p>
            <Link
              href="/eventos/criar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-zinc-950 font-medium rounded-lg hover:bg-amber-400 transition-colors"
            >
              Criar evento
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}