// ============================================================================
// /workshops/[slug] — Detalhe do evento (W26)
// ============================================================================
// Server Component: busca o evento pelo slug nos mocks (futuramente via
// `/api/events/v2/[slug]`), renderiza o client `<SignupButton>` que
// detecta auth + status.
// ============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar, Clock, MapPin, Monitor, Globe, Users,
  ArrowLeft, Sparkles, Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignupButton } from '@/components/events/SignupButton';
import { EventCover } from '@/components/events/EventCover';
import { getMockEventBySlug, mockEvents } from '@/lib/events/mock';

// ============================================================
// Helpers de formatação
// ============================================================

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${m}min`;
}

function formatPrice(priceCents: number | null): string {
  if (priceCents === null) return 'Gratuito';
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// ============================================================
// Static generation — pre-renderiza todos os slugs conhecidos
// ============================================================

export function generateStaticParams() {
  return mockEvents.map((e) => ({ slug: e.slug }));
}

// ============================================================
// Metadata dinâmica
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getMockEventBySlug(slug);
  if (!event) return { title: 'Evento não encontrado' };

  return {
    title: `${event.title} | Akasha`,
    description: event.description.slice(0, 160),
    alternates: { canonical: `/workshops/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 200),
      url: `/workshops/${event.slug}`,
      type: 'article',
      images: [{ url: event.coverImage, alt: event.coverAlt }],
    },
  };
}

// ============================================================
// JSON-LD estruturado (schema.org Event)
// ============================================================

function EventDetailJsonLd({
  event,
}: {
  event: ReturnType<typeof getMockEventBySlug>;
}) {
  if (!event) return null;
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventAttendanceMode:
      event.locationKind === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : event.locationKind === 'presencial'
          ? 'https://schema.org/OfflineEventAttendanceMode'
          : 'https://schema.org/MixedEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location:
      event.locationKind === 'online'
        ? { '@type': 'VirtualLocation', url: event.onlineUrl ?? '' }
        : {
            '@type': 'Place',
            name: event.neighborhood ?? event.city ?? 'Presencial',
            address: `${event.city ?? ''}${event.neighborhood ? ', ' + event.neighborhood : ''}`,
          },
    image: event.coverImage,
    organizer: {
      '@type': 'Person',
      name: event.host.displayName,
    },
    offers: {
      '@type': 'Offer',
      price: event.priceCents === null ? 0 : (event.priceCents / 100).toFixed(2),
      priceCurrency: 'BRL',
      availability:
        event.signupStatus === 'full'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

// ============================================================
// Page
// ============================================================

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getMockEventBySlug(slug);
  if (!event) notFound();

  // i18n: chaves como strings, fallback em PT-BR inline.
  const t = (key: string, fallback: string) => fallback;

  const isFull = event.signupStatus === 'full';
  const remaining =
    event.capacity > 0
      ? Math.max(0, event.capacity - event.confirmedCount)
      : null;

  // Outros eventos do mesmo host (recomendação — "Mais com esse facilitador")
  const otherByHost = mockEvents
    .filter((e) => e.host.id === event.host.id && e.slug !== event.slug)
    .slice(0, 3);

  return (
    <>
      <EventDetailJsonLd event={event} />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-slate-950 text-slate-100 focus:outline-none pb-24 md:pb-12"
        data-testid="workshop-detail-page"
      >
        {/* Hero — capa com overlay */}
        <section
          className="relative w-full"
          aria-label="Capa do evento"
        >
          <EventCover
            src={event.coverImage}
            alt={event.coverAlt}
            variant="hero"
            withOverlay
            priority
          />

          {/* Botão voltar */}
          <div className="absolute top-4 left-4 z-10">
            <Link href="/workshops" prefetch>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-950/70 backdrop-blur border-slate-700/50 text-slate-100 hover:bg-slate-900/80"
                data-testid="event-detail-back"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Eventos
              </Button>
            </Link>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 -mt-16 md:-mt-24 relative space-y-6">
          {/* Card principal de cabeçalho */}
          <Card
            size="sm"
            className="card-spiritual bg-slate-900/90 border-slate-800/60 backdrop-blur-md"
          >
            <CardContent className="pt-5 space-y-4">
              {/* Badges */}
              <div className="flex items-center flex-wrap gap-2">
                <Badge
                  variant="default"
                  className="bg-amber-500/90 text-black font-medium text-[10px] uppercase tracking-wide"
                >
                  {event.type === 'workshop'
                    ? 'Workshop'
                    : event.type === 'ritual'
                      ? 'Ritual'
                      : event.type === 'study-circle'
                        ? 'Círculo de Estudo'
                        : 'Meditação'}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300 uppercase tracking-wide">
                  {event.tradition}
                </Badge>
                {event.priceCents === null ? (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/90 text-white text-[10px] font-medium uppercase tracking-wide"
                  >
                    Gratuito
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-amber-500/50 text-amber-300 uppercase tracking-wide"
                  >
                    {formatPrice(event.priceCents)}
                  </Badge>
                )}
                {isFull && (
                  <Badge variant="destructive" className="text-[10px] uppercase tracking-wide">
                    Lotado
                  </Badge>
                )}
              </div>

              {/* Título */}
              <h1 className="text-2xl md:text-4xl font-heading font-semibold leading-tight text-slate-100">
                {event.title}
              </h1>

              {/* Host line */}
              <div className="flex items-center gap-3">
                {event.host.avatarUrl ? (
                  <Image
                    src={event.host.avatarUrl}
                    alt={`Foto de ${event.host.displayName}`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center text-sm font-medium text-white">
                    {event.host.displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="text-sm">
                  <p className="text-slate-100 font-medium">{event.host.displayName}</p>
                  {event.host.traditionLine && (
                    <p className="text-xs text-slate-500">{event.host.traditionLine}</p>
                  )}
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <MetaItem
                  icon={<Calendar className="w-4 h-4 text-amber-400" />}
                  label={t('events.meta.date', 'Data')}
                  value={formatFullDate(event.startsAt)}
                />
                <MetaItem
                  icon={<Clock className="w-4 h-4 text-violet-400" />}
                  label={t('events.meta.duration', 'Duração')}
                  value={formatDuration(event.durationMin)}
                />
                {event.locationKind === 'online' && (
                  <MetaItem
                    icon={<Monitor className="w-4 h-4 text-cyan-400" />}
                    label="Plataforma"
                    value={event.platform ?? 'Online'}
                  />
                )}
                {event.locationKind === 'presencial' && event.city && (
                  <MetaItem
                    icon={<MapPin className="w-4 h-4 text-rose-400" />}
                    label="Local"
                    value={`${event.city}${event.neighborhood ? ' · ' + event.neighborhood : ''}`}
                  />
                )}
                {event.locationKind === 'hybrid' && (
                  <MetaItem
                    icon={<Globe className="w-4 h-4 text-emerald-400" />}
                    label="Modalidade"
                    value={`${event.city ?? 'Presencial'} + ${event.platform ?? 'Online'}`}
                  />
                )}
                {event.capacity > 0 && (
                  <MetaItem
                    icon={<Users className="w-4 h-4 text-pink-400" />}
                    label="Vagas"
                    value={
                      isFull
                        ? `Lotado (${event.confirmedCount}/${event.capacity})`
                        : `${event.confirmedCount}/${event.capacity}${
                            remaining !== null && remaining > 0
                              ? ` · ${remaining} restantes`
                              : ''
                          }`
                    }
                  />
                )}
              </div>

              {/* CTA principal */}
              <div className="pt-3">
                <SignupButton
                  eventSlug={event.slug}
                  status={event.signupStatus}
                  returnTo={`/workshops/${event.slug}`}
                  size="lg"
                  fullWidth
                />
                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  {event.locationKind === 'online'
                    ? 'Você receberá o link de acesso por email após a inscrição.'
                    : 'Confirmação enviada por email. Traga documento com foto.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Descrição */}
          <Card
            size="sm"
            className="card-spiritual bg-slate-900/50 border-slate-800/50"
          >
            <CardContent className="pt-5 space-y-3">
              <h2 className="text-lg font-heading font-medium text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
                Sobre este evento
              </h2>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>

              {event.tags && event.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-800/50">
                  <Tag className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  {event.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px] border-slate-700 text-slate-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio do host */}
          <Card
            size="sm"
            className="card-spiritual bg-slate-900/50 border-slate-800/50"
          >
            <CardContent className="pt-5 space-y-3">
              <h2 className="text-lg font-heading font-medium text-slate-100">
                Sobre o facilitador
              </h2>
              <div className="flex items-start gap-4">
                {event.host.avatarUrl ? (
                  <Image
                    src={event.host.avatarUrl}
                    alt={`Foto de ${event.host.displayName}`}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border border-slate-700 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center text-xl font-medium text-white flex-shrink-0">
                    {event.host.displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <p className="text-base font-medium text-slate-100">
                    {event.host.displayName}
                  </p>
                  {event.host.traditionLine && (
                    <p className="text-xs text-slate-500">{event.host.traditionLine}</p>
                  )}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {event.host.bio}
                  </p>
                  {event.host.handle && (
                    <Link
                      href={`/u/${event.host.handle}`}
                      className="text-xs text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline"
                    >
                      Ver perfil completo →
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outros eventos do host */}
          {otherByHost.length > 0 && (
            <Card
              size="sm"
              className="card-spiritual bg-slate-900/40 border-slate-800/40"
            >
              <CardContent className="pt-5 space-y-3">
                <h2 className="text-lg font-heading font-medium text-slate-100">
                  Mais com {event.host.displayName.split(' ')[0]}
                </h2>
                <ul className="space-y-2">
                  {otherByHost.map((o) => (
                    <li key={o.slug}>
                      <Link
                        href={`/workshops/${o.slug}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-800/50 hover:border-amber-500/40 hover:bg-slate-900/60 transition-all touch-manipulation"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-100 truncate">
                            {o.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(o.startsAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {' · '}
                            {formatPrice(o.priceCents)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-slate-700 text-slate-400"
                        >
                          {o.type === 'workshop'
                            ? 'Workshop'
                            : o.type === 'ritual'
                              ? 'Ritual'
                              : o.type === 'study-circle'
                                ? 'Círculo'
                                : 'Meditação'}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* CTA final */}
          <div className="pb-2">
            <SignupButton
              eventSlug={event.slug}
              status={event.signupStatus}
              returnTo={`/workshops/${event.slug}`}
              size="lg"
              fullWidth
            />
          </div>
        </div>
      </main>
    </>
  );
}

// ============================================================
// MetaItem — sub-componente pequeno
// ============================================================

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm text-slate-100 capitalize">{value}</p>
      </div>
    </div>
  );
}