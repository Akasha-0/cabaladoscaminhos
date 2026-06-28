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
import { useT } from '@/lib/i18n/useT';
import { useI18n, type Locale } from '@/lib/i18n';
import type { Event, EventType, Tradition } from '@/lib/events/types';

// ============================================================
// Helpers de formatação (Intl — sem libs externas)
// ============================================================

function formatEventDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleString(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeDay(iso: string, t: ReturnType<typeof useT>): string {
  const ms = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days < 0) return t('events.relativeDay.past');
  if (days === 0) return t('events.relativeDay.today');
  if (days === 1) return t('events.relativeDay.tomorrow');
  if (days < 7) return t('events.relativeDay.inDays', { days });
  if (days < 30) return t('events.relativeDay.inWeeks', { weeks: Math.floor(days / 7) });
  return t('events.relativeDay.inMonths', { months: Math.floor(days / 30) });
}

function formatPrice(priceCents: number | null, t: ReturnType<typeof useT>, locale: Locale): string {
  if (priceCents === null) return t('events.price.free');
  return (priceCents / 100).toLocaleString(locale, {
    style: 'currency',
    currency: 'BRL',
  });
}

// ============================================================
// COMPONENT
// ============================================================

interface EventCardProps {
  event: Event;
  /** Variante: 'default' (grade) ou 'featured' (destaque com overlay) */
  variant?: 'default' | 'featured';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const t = useT();
  const { locale } = useI18n();
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
        label: event.platform ?? t('events.detail.defaultLocation.online'),
      };
    }
    if (event.locationKind === 'presencial') {
      return {
        Icon: MapPin,
        label: event.neighborhood
          ? `${event.city ?? ''} · ${event.neighborhood}`
          : (event.city ?? t('events.detail.defaultLocation.presencial')),
      };
    }
    // hybrid
    return {
      Icon: Globe,
      label: event.city ? `${event.city} + Online` : t('events.detail.defaultLocation.hybrid'),
    };
  })();

  return (
    <Link
      href={`/workshops/${event.slug}`}
      data-testid={`event-card-${event.slug}`}
      className="block group h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-xl"
      aria-label={`${event.title} — ${formatEventDate(event.startsAt, locale)}`}
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
              {t(`events.types.${event.type}` as `events.types.${EventType}`) || event.type}
            </Badge>
            {(isFull || isClosed) && (
              <Badge
                variant="destructive"
                className="text-[10px] font-medium uppercase tracking-wide"
              >
                {isFull ? t('events.badges.full') : t('events.badges.closed')}
              </Badge>
            )}
            {isFree && !isFull && !isClosed && (
              <Badge
                variant="secondary"
                className="bg-emerald-500/90 text-white text-[10px] font-medium uppercase tracking-wide"
              >
                {t('events.badges.free')}
              </Badge>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col flex-1">
          <CardHeader className="gap-1.5">
            <p className="text-[11px] uppercase tracking-wider text-amber-400/80 font-medium">
              {t(`events.traditions.${event.tradition}` as `events.traditions.${Tradition}`) || event.tradition}
            </p>
            <h3 className="text-base md:text-lg font-heading font-semibold text-slate-100 leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
              {event.title}
            </h3>
            <p className="text-xs text-slate-500">
              {t('events.card.byHostPrefix')}{' '}
              <span className="text-slate-300">{event.host.displayName}</span>
              {event.host.traditionLine && (
                <span className="text-slate-500"> · {event.host.traditionLine}</span>
              )}
            </p>
          </CardHeader>

          <CardContent className="flex-1 space-y-2 pt-0 pb-3">
            {/* Data */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />
              <span>{formatEventDate(event.startsAt, locale)}</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-300/80">{formatRelativeDay(event.startsAt, t)}</span>
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
                      <span className="text-emerald-400">
                        · {remaining === 1
                          ? t('events.capacity.remainingOne', { n: remaining })
                          : t('events.capacity.remainingOther', { n: remaining })}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500">{t('events.capacity.unlimited')}</span>
                )}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  isFree ? 'text-emerald-300' : 'text-amber-300'
                )}
              >
                {formatPrice(event.priceCents, t, locale)}
              </span>
            </div>

            {/* CTA hint */}
            <div className="flex items-center justify-end pt-1">
              <span className="text-[11px] text-slate-500 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                {t('events.cta.seeDetails')}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}