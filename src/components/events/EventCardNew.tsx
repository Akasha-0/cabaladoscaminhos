// ============================================================================
// W93-D — EVENT CARD (lista /eventos)
// ----------------------------------------------------------------------------
// Card mobile-first com capa, badges de tipo/tradição/modalidade, título,
// host, data, capacidade e CTA. Otimizado para consulta cotidiana.
//
// Sacred-cultural: rótulos preservam terminologia pt-BR (roda, gira, etc).
// ============================================================================

import Link from 'next/link';
import { Calendar, MapPin, Monitor, Users, ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import {
  EVENT_KIND_LABEL,
  TRADITION_LABEL,
  type Event,
  type EventModality,
} from '@/lib/w93/events-types.ts';

interface EventCardProps {
  event: Event;
  /** Se true, prioriza mobile layout (default true) */
  mobileFirst?: boolean;
  /** Slug em destaque (opcional — visual ring) */
  featured?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
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

function capacityLabel(event: Event): string {
  if (event.capacity === 0) return 'Vagas ilimitadas';
  if (event.signupStatus === 'waitlist' || event.signupStatus === 'full') {
    return `Lotado — ${event.waitlistCount} em espera`;
  }
  return `${event.confirmedCount}/${event.capacity} vagas`;
}

function modalityIcon(modality: EventModality): React.ReactNode {
  if (modality === 'online') return <Monitor className="w-3 h-3" aria-hidden="true" />;
  if (modality === 'presencial') return <MapPin className="w-3 h-3" aria-hidden="true" />;
  return <><Monitor className="w-3 h-3" aria-hidden="true" /><MapPin className="w-3 h-3" aria-hidden="true" /></>;
}

function modalityLabel(modality: EventModality): string {
  if (modality === 'online') return 'Online';
  if (modality === 'presencial') return 'Presencial';
  return 'Híbrido';
}

const STATUS_LABEL: Record<Event['signupStatus'], string> = {
  open: 'Inscrições abertas',
  closed: 'Inscrições fechadas',
  waitlist: 'Lista de espera',
  full: 'Lotado',
};

const STATUS_VARIANT: Record<Event['signupStatus'], string> = {
  open: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  closed: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  waitlist: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  full: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export function EventCard({ event, mobileFirst = true, featured = false }: EventCardProps) {
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="block group"
      data-testid={`event-card-${event.slug}`}
    >
      <Card
        className={cn(
          'overflow-hidden transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5',
          featured && 'ring-2 ring-amber-500/50',
        )}
      >
        {/* Capa */}
        <div className={cn('relative w-full bg-muted overflow-hidden', mobileFirst ? 'aspect-[16/9]' : 'aspect-[16/9]')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.coverImage}
            alt={event.coverAlt}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <Badge className="bg-amber-500/90 text-zinc-950 border-transparent">
              {EVENT_KIND_LABEL[event.kind]}
            </Badge>
            <Badge className="bg-zinc-950/80 text-zinc-100 border-zinc-700/50">
              {TRADITION_LABEL[event.tradition]}
            </Badge>
          </div>
          <Badge
            className={cn(
              'absolute top-2 right-2 border',
              STATUS_VARIANT[event.signupStatus],
            )}
            data-testid={`event-status-${event.slug}`}
          >
            {STATUS_LABEL[event.signupStatus]}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Título */}
          <h3 className="text-lg font-semibold line-clamp-2 text-zinc-100">
            {event.title}
          </h3>

          {/* Host line */}
          <p className="text-sm text-zinc-400">
            por <span className="text-zinc-200">{event.host.displayName}</span>
            {event.host.traditionLine && (
              <span className="text-zinc-500"> · {event.host.traditionLine}</span>
            )}
          </p>

          {/* Data + local */}
          <div className="flex flex-col gap-1 text-sm text-zinc-300 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              <span>{formatDate(event.startsAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {modalityIcon(event.location.kind)}
              <span>
                {modalityLabel(event.location.kind)}
                {event.location.kind !== 'online' && event.location.city && (
                  <> · {event.location.city}{event.location.state && `, ${event.location.state}`}</>
                )}
                {event.location.kind === 'online' && event.location.platform && (
                  <> · {event.location.platform}</>
                )}
              </span>
            </div>
          </div>

          {/* Meta: capacidade + preço */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-800/50">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{capacityLabel(event)}</span>
            </div>
            <span className="font-semibold text-amber-400">
              {formatPrice(event.priceCents)}
            </span>
          </div>

          {/* CTA arrow */}
          <div className="flex items-center gap-1 text-xs text-amber-500/80 pt-1 group-hover:text-amber-400 transition-colors">
            Ver detalhes
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}