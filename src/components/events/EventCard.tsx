// ============================================================================
// EVENT CARD — Card de evento com capa, título, host, data e capacidade (W26)
// ----------------------------------------------------------------------------
// Card mobile-first (consulta cotidiana). Padrão:
//   - Capa 16:9 (next/image)
//   - Badges: tipo de evento + modalidade
//   - Título (line-clamp-2)
//   - Host line: "por [host]"
//   - Meta: data (Intl.DateTimeFormat) + cidade OU plataforma
//   - Capacidade: "14/20 vagas" ou "Lotado" ou "Sem limite"
//
// Envolvido por Link → /workshops/[slug]
// ============================================================================

'use client';

import Link from 'next/link';
import {
  Calendar, MapPin, Monitor, Users, Globe, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventCover } from './EventCover';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/events/types';

// ============================================================
// Helpers de formatação (Intl — sem libs externas)
// ============================================================

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeDay(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days < 0) return 'já passou';
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  if (days < 7) return `em ${days} dias`;
  if (days < 30) return `em ${Math.floor(days / 7)} sem`;
  return `em ${Math.floor(days / 30)} meses`;
}

function formatPrice(priceCents: number | null): string {
  if (priceCents === null) return 'Gratuito';
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// ============================================================
// Mapa visual por tradição (espelha PostCard.tsx)
// ============================================================

const TRADITION_LABEL: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  astrologia: 'Astrologia',
  tantra: 'Tântrica',
  reiki: 'Reiki',
  meditacao: 'Meditação',
  xamanismo: 'Xamanismo',
  'cristianismo-mistico': 'Cristianismo Místico',
  sufismo: 'Sufismo',
  taoismo: 'Taoísmo',
  umbanda: 'Umbanda',
  candomble: 'Candomblé',
};

const TYPE_LABEL: Record<string, string> = {
  workshop: 'Workshop',
  ritual: 'Ritual',
  'study-circle': 'Círculo de Estudo',
  meditation: 'Meditação',
};

// ============================================================
// COMPONENT
// ============================================================

interface EventCardProps {
  event: Event;
  /** Variante: 'default' (grade) ou 'featured' (destaque com overlay) */
  variant?: 'default' | 'featured';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const isFull = event.signupStatus === 'full';
  const isClosed = event.signupStatus === 'closed';
  const isFree = event.priceCents === null;

  const remaining =
    event.capacity > 0 ? Math.max(0, event.capacity - event.confirmedCount) : null;

  // Modalidade: ícone + label
  const locationInfo = (() => {
    if (event.locationKind === 'online') {
      return {
        Icon: Monitor,
        label: event.platform ?? 'Online',
      };
    }
    if (event.locationKind === 'presencial') {
      return {
        Icon: MapPin,
        label: event.neighborhood
          ? `${event.city ?? ''} · ${event.neighborhood}`
          : (event.city ?? 'Presencial'),
      };
    }
    // hybrid
    return {
      Icon: Globe,
      label: event.city ? `${event.city} + Online` : 'Híbrido',
    };
  })();

  return (
    <Link
      href={`/workshops/${event.slug}`}
      data-testid={`event-card-${event.slug}`}
      className="block group h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-xl"
      aria-label={`${event.title} — ${formatEventDate(event.startsAt)}`}
    >
      <Card
        size="sm"
        className={cn(
          'card-spiritual bg-slate-900/60 border-slate-800/50 overflow-hidden h-full',
          'transition-all group-hover:border-amber-500/40 group-hover:shadow-lg group-hover:shadow-amber-500/10',
          variant === 'featured' && 'md:flex md:flex-row'
        )}
      >
        {/* Capa */}
        <div
          className={cn(
            'relative',
            variant === 'featured' ? 'md:w-1/2 md:flex-shrink-0' : 'w-full'
          )}
        >
          <EventCover
            src={event.coverImage}
            alt={event.coverAlt}
            variant="card"
            priority={variant === 'featured'}
          />

          {/* Badges sobrepostos na capa */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <Badge
              variant="default"
              className="bg-amber-500/90 text-black font-medium text-[10px] uppercase tracking-wide"
            >
              {TYPE_LABEL[event.type] ?? event.type}
            </Badge>
            {(isFull || isClosed) && (
              <Badge
                variant="destructive"
                className="text-[10px] font-medium uppercase tracking-wide"
              >
                {isFull ? 'Lotado' : 'Fechado'}
              </Badge>
            )}
            {isFree && !isFull && !isClosed && (
              <Badge
                variant="secondary"
                className="bg-emerald-500/90 text-white text-[10px] font-medium uppercase tracking-wide"
              >
                Gratuito
              </Badge>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col flex-1">
          <CardHeader className="gap-1.5">
            <p className="text-[11px] uppercase tracking-wider text-amber-400/80 font-medium">
              {TRADITION_LABEL[event.tradition] ?? event.tradition}
            </p>
            <h3 className="text-base md:text-lg font-heading font-semibold text-slate-100 leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
              {event.title}
            </h3>
            <p className="text-xs text-slate-500">
              por <span className="text-slate-300">{event.host.displayName}</span>
              {event.host.traditionLine && (
                <span className="text-slate-500"> · {event.host.traditionLine}</span>
              )}
            </p>
          </CardHeader>

          <CardContent className="flex-1 space-y-2 pt-0 pb-3">
            {/* Data */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />
              <span>{formatEventDate(event.startsAt)}</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-300/80">{formatRelativeDay(event.startsAt)}</span>
            </div>

            {/* Localização */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-0">
              <locationInfo.Icon
                className="w-3.5 h-3.5 text-violet-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">{locationInfo.label}</span>
            </div>

            {/* Capacidade + preço */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/50 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5 text-pink-400" aria-hidden="true" />
                {event.capacity > 0 ? (
                  <>
                    <span>
                      {event.confirmedCount}/{event.capacity}
                    </span>
                    {remaining !== null && remaining > 0 && (
                      <span className="text-emerald-400">· {remaining} vagas</span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500">Sem limite</span>
                )}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  isFree ? 'text-emerald-300' : 'text-amber-300'
                )}
              >
                {formatPrice(event.priceCents)}
              </span>
            </div>

            {/* CTA hint */}
            <div className="flex items-center justify-end pt-1">
              <span className="text-[11px] text-slate-500 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                Ver detalhes
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}