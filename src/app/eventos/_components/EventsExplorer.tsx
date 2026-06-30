// ============================================================================
// W93-D — EVENTS EXPLORER (client component p/ /eventos)
// ----------------------------------------------------------------------------
// Filtros client-side sobre array de eventos. Mobile-first.
//
// Decisão: filtros são client-side porque o dataset esperado é pequeno
// (< 100 eventos por ciclo). Quando crescer, mover filtros para URL
// params e usar server-side filtering.
// ============================================================================

'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/EventCardNew';

import type {
  Event,
  EventKind,
  EventModality,
  Tradition,
} from '@/lib/w93/events-types.ts';

interface FilterOption<T extends string> {
  value: T | 'all';
  label: string;
}

interface EventsExplorerProps {
  events: Event[];
  kindFilters: FilterOption<EventKind>[];
  modalityFilters: FilterOption<EventModality>[];
  traditionFilters: FilterOption<Tradition>[];
}

export function EventsExplorer({
  events,
  kindFilters,
  modalityFilters,
  traditionFilters,
}: EventsExplorerProps) {
  const [kind, setKind] = useState<EventKind | 'all'>('all');
  const [modality, setModality] = useState<EventModality | 'all'>('all');
  const [tradition, setTradition] = useState<Tradition | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((e) => {
      if (kind !== 'all' && e.kind !== kind) return false;
      if (modality !== 'all' && e.location.kind !== modality) return false;
      if (tradition !== 'all' && e.tradition !== tradition) return false;
      if (term) {
        const blob = `${e.title} ${e.description} ${e.host.displayName}`.toLowerCase();
        if (!blob.includes(term)) return false;
      }
      return true;
    });
  }, [events, kind, modality, tradition, search]);

  const hasFilters = kind !== 'all' || modality !== 'all' || tradition !== 'all' || search !== '';

  return (
    <div>
      {/* Filtros */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" aria-hidden="true" />
          <Input
            placeholder="Buscar por título, descrição ou facilitador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-950 border-zinc-800"
            data-testid="events-search"
            aria-label="Buscar eventos"
          />
        </div>

        {/* Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FilterSelect
            label="Tipo"
            value={kind}
            options={kindFilters}
            onChange={(v) => setKind(v as EventKind | 'all')}
            testId="filter-kind"
          />
          <FilterSelect
            label="Modalidade"
            value={modality}
            options={modalityFilters}
            onChange={(v) => setModality(v as EventModality | 'all')}
            testId="filter-modality"
          />
          <FilterSelect
            label="Tradição"
            value={tradition}
            options={traditionFilters}
            onChange={(v) => setTradition(v as Tradition | 'all')}
            testId="filter-tradition"
          />
        </div>

        {hasFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setKind('all');
                setModality('all');
                setTradition('all');
                setSearch('');
              }}
              data-testid="filter-clear"
            >
              <X className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Contagem */}
      <p className="text-sm text-zinc-400 mb-4" data-testid="events-count">
        {filtered.length === 0
          ? 'Nenhum evento corresponde aos filtros.'
          : `${filtered.length} ${filtered.length === 1 ? 'evento' : 'eventos'} encontrados`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-lg">Nenhum evento encontrado.</p>
          <p className="text-sm mt-2">Tente ajustar os filtros ou volte mais tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="events-grid">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  testId,
}: {
  label: string;
  value: T | 'all';
  options: FilterOption<T>[];
  onChange: (v: T | 'all') => void;
  testId?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | 'all')}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
        data-testid={testId}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}