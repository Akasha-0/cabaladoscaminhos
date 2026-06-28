// ============================================================================
// EVENT LIST — Lista de eventos com filtros (W26)
// ----------------------------------------------------------------------------
// Grid responsivo mobile-first com filtros por:
//   - Tipo (workshop, ritual, study-circle, meditation)
//   - Modalidade (online, presencial, hybrid)
//   - Tradição
//   - Search (título + descrição)
//
// Recebe `events` já carregados (mock hoje, API amanhã) e faz o filtro
// client-side puro — nada de useState em hooks externos pra ficar fácil
// de migrar para filtros server-side depois.
// ============================================================================

'use client';

import { useState, useMemo } from 'react';
import { Search, X, Sparkles, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventCard } from './EventCard';
import type { Event, EventLocationKind, EventType, Tradition } from '@/lib/events/types';
import { cn } from '@/lib/utils';

interface EventListProps {
  events: Event[];
  /** Slug do evento em destaque (opcional — vai aparecer primeiro como "featured") */
  featuredSlug?: string;
  /** Tradução via `t()` (mantido pra EN/ES no futuro) */
  emptyLabel?: string;
  emptyHint?: string;
}

const TYPE_FILTERS: Array<{ value: EventType | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'ritual', label: 'Rituais' },
  { value: 'study-circle', label: 'Círculos' },
  { value: 'meditation', label: 'Meditações' },
];

const LOCATION_FILTERS: Array<{ value: EventLocationKind | 'all'; label: string }> = [
  { value: 'all', label: 'Qualquer' },
  { value: 'online', label: 'Online' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
];

const TRADITION_FILTERS: Array<{ value: Tradition | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'ifa', label: 'Ifá' },
  { value: 'candomble', label: 'Candomblé' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'tantra', label: 'Tântrica' },
  { value: 'astrologia', label: 'Astrologia' },
  { value: 'sufismo', label: 'Sufismo' },
  { value: 'xamanismo', label: 'Xamanismo' },
];

export function EventList({
  events,
  featuredSlug,
  emptyLabel = 'Nenhum evento encontrado',
  emptyHint = 'Tente outro filtro ou volte em breve.',
}: EventListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<EventLocationKind | 'all'>('all');
  const [traditionFilter, setTraditionFilter] = useState<Tradition | 'all'>('all');

  // Filtra + separa featured
  const { featured, filtered } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = events.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (locationFilter !== 'all' && e.locationKind !== locationFilter) return false;
      if (traditionFilter !== 'all' && e.tradition !== traditionFilter) return false;
      if (q.length > 0) {
        const blob = `${e.title} ${e.description} ${e.host.displayName}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });

    // Ordenar: futuros primeiro (data crescente)
    matches.sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );

    const feat =
      featuredSlug && matches.find((e) => e.slug === featuredSlug);
    const rest = feat ? matches.filter((e) => e.slug !== featuredSlug) : matches;

    return { featured: feat ?? null, filtered: rest };
  }, [events, search, typeFilter, locationFilter, traditionFilter, featuredSlug]);

  const hasFilters =
    typeFilter !== 'all' ||
    locationFilter !== 'all' ||
    traditionFilter !== 'all' ||
    search.length > 0;

  const clearAll = () => {
    setSearch('');
    setTypeFilter('all');
    setLocationFilter('all');
    setTraditionFilter('all');
  };

  return (
    <div className="space-y-5" data-testid="event-list">
      {/* Filtros */}
      <Card size="sm" className="card-spiritual bg-slate-900/50 border-slate-800/50">
        <CardContent className="space-y-3 pt-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar eventos, facilitadores..."
              aria-label="Buscar eventos"
              data-testid="event-list-search"
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-xl',
                'bg-slate-800/50 border border-slate-700/50',
                'text-base text-slate-200 placeholder-slate-500',
                'focus:border-amber-500/50 focus:outline-none',
                'touch-manipulation'
              )}
            />
            {search.length > 0 && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-colors touch-manipulation"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <FilterRow<EventType | 'all'>
            label="Tipo"
            options={TYPE_FILTERS}
            value={typeFilter}
            onChange={setTypeFilter}
            testIdPrefix="event-list-type"
          />
          <FilterRow<EventLocationKind | 'all'>
            label="Onde"
            options={LOCATION_FILTERS}
            value={locationFilter}
            onChange={setLocationFilter}
            testIdPrefix="event-list-location"
          />
          <FilterRow<Tradition | 'all'>
            label="Tradição"
            options={TRADITION_FILTERS}
            value={traditionFilter}
            onChange={setTraditionFilter}
            testIdPrefix="event-list-tradition"
          />

          {hasFilters && (
            <div className="flex items-center justify-between pt-1">
              <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                {filtered.length + (featured ? 1 : 0)} resultado
                {filtered.length + (featured ? 1 : 0) !== 1 ? 's' : ''}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-slate-200"
                data-testid="event-list-clear"
              >
                Limpar tudo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured (só aparece se existir) */}
      {featured && (
        <div data-testid="event-list-featured">
          <p className="text-[11px] uppercase tracking-wider text-amber-400/80 font-medium mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Em destaque
          </p>
          <EventCard event={featured} variant="featured" />
        </div>
      )}

      {/* Lista (ou empty) */}
      {filtered.length === 0 ? (
        <Card size="sm" className="card-spiritual bg-slate-900/40 border-slate-800/40">
          <CardContent className="py-10 text-center space-y-2">
            <Filter className="w-7 h-7 mx-auto text-slate-600" aria-hidden="true" />
            <p className="text-sm text-slate-300">{emptyLabel}</p>
            <p className="text-xs text-slate-500">{emptyHint}</p>
            {hasFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearAll}
                className="mt-3 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-testid="event-list-grid"
        >
          {filtered.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FilterRow — chip group genérico
// ============================================================

interface FilterRowProps<T extends string> {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  testIdPrefix: string;
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
  testIdPrefix,
}: FilterRowProps<T>) {
  return (
    <div className="flex items-start gap-2 flex-wrap" role="group" aria-label={label}>
      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium pt-1.5 min-w-[64px]">
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              data-testid={`${testIdPrefix}-${opt.value}`}
              aria-pressed={active}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                'touch-manipulation min-h-[32px]',
                active
                  ? 'bg-amber-500/20 border border-amber-500/60 text-amber-200'
                  : 'bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}