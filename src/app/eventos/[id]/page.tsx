// ============================================================================
// W93-D — /EVENTOS/[ID] (detalhe + RSVP + calendar export)
// ----------------------------------------------------------------------------
// Server component que carrega evento por slug e renderiza detalhe.
// RSVP button + calendar export são client components.
//
// Sacred-cultural: terminologia preservada.
// LGPD: NÃO exibe email/RSVP de outros participantes na listagem pública.
// ============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Monitor,
  Users,
  ArrowLeft,
  Globe,
  Clock,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RSVPButton } from '@/components/events/RSVPButton';
import { CalendarExport } from '@/components/events/CalendarExport';

import { eventToIcs } from '@/lib/w93/ics-export.ts';
import {
  EVENT_KIND_LABEL,
  EVENT_KIND_DESCRIPTION,
  SIGNUP_STATUS_LABEL,
  TRADITION_LABEL,
  type Event,
  type EventKind,
  type EventModality,
  type Tradition,
} from '@/lib/w93/events-types.ts';

// ============================================================================
// Mock data (mesmo seed do /eventos — substituir por Prisma depois)
// ============================================================================

function findEvent(slugOrId: string): Event | undefined {
  const all = seedAll();
  return all.find((e) => e.slug === slugOrId || e.id === slugOrId);
}

function seedAll(): Event[] {
  const t0 = Date.parse('2026-08-15T19:00:00Z');
  const baseId = '11111111-1111-4111-8111-1111111111';
  const mk = (
    suffix: string,
    data: Omit<Event, 'id' | 'startsAt' | 'endsAt' | 'durationMin' | 'createdAt' | 'updatedAt'>,
    offsetDays: number,
    durationMin: number,
  ): Event => ({
    ...data,
    id: `${baseId}${suffix}` as Event['id'],
    startsAt: new Date(t0 + offsetDays * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(t0 + offsetDays * 24 * 60 * 60 * 1000 + durationMin * 60 * 1000).toISOString(),
    durationMin,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return [
    mk('01', {
      slug: 'roda-de-cabala-setembro-2026',
      title: 'Roda de Cabala — Os 72 Shemot',
      description:
        'Roda de estudo e partilha sobre os 72 nomes divinos. Tradição: Cabala prática.\n\nCada participante traz uma pergunta, e o grupo caminha junto na interpretação dos Shemot. Abertura com meditação de 5 minutos sobre o tetragrama.',
      kind: 'roda',
      tradition: 'cabala',
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
      tags: ['iniciantes', 'estudo'],
    }, 0, 90),
    mk('02', {
      slug: 'gira-de-caboclo-outubro-2026',
      title: 'Gira de Caboclo — Linha Jurema',
      description:
        'Gira de desenvolvimento mediúnico aberta a praticantes com ao menos 1 ano de caminhada. Linha: Cabocla Jurema.\n\nTrabalho: firmeza, passes, toque de pemba.',
      kind: 'gira',
      tradition: 'umbanda',
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
        bio: 'Ialorixá do Ilê Axé Ogum Megê.',
      },
      language: 'pt-BR',
      signupStatus: 'open',
      closedByOrganizer: false,
      confirmedCount: 12,
      waitlistCount: 0,
      tags: ['gira', 'mediunidade'],
    }, 7, 180),
    mk('03', {
      slug: 'workshop-ifa-odu-online',
      title: 'Workshop de Ifá — Lendo os Odus',
      description:
        'Workshop prático de leitura de Odus. Pré-requisito: módulo 1 do curso de Ifá.\n\nMaterial incluso: pdf com os 16 Odus principais.',
      kind: 'workshop',
      tradition: 'ifa',
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
      tags: ['avançado', 'ifa', 'odu'],
    }, 14, 240),
    mk('04', {
      slug: 'curso-tantra-modulo-1',
      title: 'Curso de Tantra — Módulo 1: Fundamentos',
      description: 'Primeiro módulo do curso de Tantra. Aulas semanais por 4 semanas.',
      kind: 'curso',
      tradition: 'tantra',
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
      tags: ['curso', 'tantra'],
    }, 21, 120),
    mk('05', {
      slug: 'cerimonia-batismo-orixa',
      title: 'Cerimônia de Feitura de Orixá',
      description: 'Cerimônia de feitura (batismo) de orixá. Restrita a participantes confirmados em consulta prévia.',
      kind: 'cerimonia',
      tradition: 'candomble',
      location: { kind: 'presencial', city: 'Salvador', state: 'BA', country: 'BR', neighborhood: 'Ilê Axé Iyami' },
      capacity: 8,
      priceCents: null,
      coverImage: '/event-covers/cerimonia-orixa.jpg',
      coverAlt: 'Cerimônia de Candomblé em terreiro',
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
      tags: ['cerimônia', 'iniciático'],
    }, 28, 360),
  ];
}

// ============================================================================
// Helpers
// ============================================================================

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(priceCents: number | null): string {
  if (priceCents === null) return 'Gratuito';
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function modalityLabel(m: EventModality): string {
  if (m === 'online') return 'Online';
  if (m === 'presencial') return 'Presencial';
  return 'Híbrido';
}

function capacityLabel(event: Event): string {
  if (event.capacity === 0) return 'Vagas ilimitadas';
  if (event.signupStatus === 'waitlist' || event.signupStatus === 'full') {
    return `Lotado · ${event.waitlistCount} em lista de espera`;
  }
  return `${event.confirmedCount}/${event.capacity} vagas preenchidas`;
}

// ============================================================================
// Page
// ============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = findEvent(id);
  if (!event) return { title: 'Evento não encontrado' };
  return {
    title: `${event.title} · Akasha`,
    description: event.description.slice(0, 160),
    alternates: { canonical: `/eventos/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 200),
      images: [event.coverImage],
      type: 'article',
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = findEvent(id);
  if (!event) notFound();

  // Gera ICS server-side (determinístico + cacheable)
  const ics = eventToIcs(event, {
    url: `https://cabaladoscaminhos.com/eventos/${event.slug}`,
    organizer: { name: event.host.displayName },
    categories: [event.kind, event.tradition],
  });
  const icsFilename = `evento-${event.slug}.ics`;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header com capa */}
      <section className="border-b border-zinc-800/60 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/eventos" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-400 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Voltar aos eventos
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-amber-500/90 text-zinc-950 border-transparent">
              {EVENT_KIND_LABEL[event.kind]}
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              {TRADITION_LABEL[event.tradition]}
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              {modalityLabel(event.location.kind)}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{event.title}</h1>
          <p className="text-zinc-300 mb-2">
            por <span className="text-zinc-100">{event.host.displayName}</span>
            {event.host.traditionLine && (
              <span className="text-zinc-500"> · {event.host.traditionLine}</span>
            )}
          </p>
          <p className="text-xs text-zinc-500 mb-6">
            <span aria-hidden="true">·</span> {EVENT_KIND_DESCRIPTION[event.kind]}
          </p>

          {/* Capa */}
          <div className="relative aspect-[16/9] bg-muted rounded-xl overflow-hidden border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.coverImage}
              alt={event.coverAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Conteúdo principal */}
      <section className="max-w-3xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">Sobre o evento</h2>
              <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 whitespace-pre-line">
                {event.description}
              </div>
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {event.tags.map((t) => (
                    <Badge key={t} variant="outline" className="border-zinc-700 text-zinc-400">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facilitador */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">Facilitador</h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-bold text-lg">
                  {event.host.displayName.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-100">{event.host.displayName}</h3>
                  {event.host.traditionLine && (
                    <p className="text-sm text-amber-400">{event.host.traditionLine}</p>
                  )}
                  <p className="text-sm text-zinc-400 mt-1">{event.host.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — info + RSVP */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Informações
              </h2>

              <InfoRow icon={<Calendar className="w-4 h-4 text-amber-500" />} label="Início">
                {formatLongDate(event.startsAt)}
              </InfoRow>
              <InfoRow icon={<Clock className="w-4 h-4 text-amber-500" />} label="Duração">
                {event.durationMin} minutos
              </InfoRow>
              <InfoRow icon={event.location.kind === 'online' ? <Monitor className="w-4 h-4 text-amber-500" /> : <MapPin className="w-4 h-4 text-amber-500" />} label="Local">
                {event.location.kind === 'online' && (
                  <>
                    Online
                    {event.location.platform && <span className="text-zinc-500"> · {event.location.platform}</span>}
                  </>
                )}
                {event.location.kind === 'presencial' && (
                  <>
                    {event.location.neighborhood ?? 'Presencial'}
                    {event.location.city && (
                      <span className="text-zinc-500"> · {event.location.city}{event.location.state && `, ${event.location.state}`}</span>
                    )}
                  </>
                )}
                {event.location.kind === 'hibrido' && (
                  <>
                    Híbrido
                    {event.location.neighborhood && <span className="text-zinc-500"> · {event.location.neighborhood}</span>}
                    {event.location.platform && <span className="text-zinc-500"> · {event.location.platform}</span>}
                  </>
                )}
              </InfoRow>
              <InfoRow icon={<Users className="w-4 h-4 text-amber-500" />} label="Vagas">
                {capacityLabel(event)}
              </InfoRow>
              <InfoRow icon={<Globe className="w-4 h-4 text-amber-500" />} label="Idioma">
                {event.language === 'pt-BR' ? 'Português (Brasil)' : event.language === 'en' ? 'English' : 'Español'}
              </InfoRow>

              <div className="border-t border-zinc-800 pt-4">
                <div className="text-2xl font-bold text-amber-400 mb-3">
                  {formatPrice(event.priceCents)}
                </div>
                <Badge
                  className={
                    event.signupStatus === 'open'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 mb-3 w-full justify-center py-1.5'
                      : event.signupStatus === 'waitlist' || event.signupStatus === 'full'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 mb-3 w-full justify-center py-1.5'
                        : 'bg-zinc-700/30 text-zinc-400 border-zinc-600 mb-3 w-full justify-center py-1.5'
                  }
                  data-testid="detail-status"
                >
                  {SIGNUP_STATUS_LABEL[event.signupStatus]}
                </Badge>

                <RSVPButton
                  eventSlug={event.slug}
                  signupStatus={event.signupStatus}
                  isAuthenticated={false}
                  returnTo={`/eventos/${event.slug}`}
                />
                <div className="mt-3">
                  <CalendarExport
                    icsContent={ics}
                    filename={icsFilename}
                    fullWidth
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eventos relacionados — placeholder */}
          <Card className="bg-zinc-900/30 border-zinc-800/60">
            <CardContent className="p-5 text-xs text-zinc-500">
              <p className="font-semibold text-zinc-300 mb-2">Outras tradições</p>
              <p>
                Veja mais eventos de {TRADITION_LABEL[event.tradition]} na{' '}
                <Link href={`/eventos?tradition=${event.tradition}`} className="text-amber-400 hover:underline">
                  lista filtrada
                </Link>.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-zinc-200 break-words">{children}</p>
      </div>
    </div>
  );
}