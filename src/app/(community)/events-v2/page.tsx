'use client';

// ============================================================================
// EVENTS BROWSE — /events-v2
// ============================================================================
// Browse de eventos W35 (CommunityEvent model):
//   • Filtros: tradição, type, date range
//   • Toggle: List view | Calendar view (month)
//   • Featured events
//   • Past events (com recording)
//   • Link para /events-v2/my-events
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar, Search, Loader2, Plus, Clock, Users, Globe, Lock,
  Sparkles, ArrowRight, CalendarDays, ListFilter, MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

// ============================================================
// Constantes
// ============================================================

const TRADITIONS = [
  { value: '', label: 'Todas' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'ifa', label: 'Ifá' },
  { value: 'astrologia', label: 'Astrologia' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'reiki', label: 'Reiki' },
  { value: 'meditacao', label: 'Meditação' },
  { value: 'xamanismo', label: 'Xamanismo' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico' },
  { value: 'sufismo', label: 'Sufismo' },
  { value: 'taoismo', label: 'Taoísmo' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'candomble', label: 'Candomblé' },
];

const TYPES = [
  { value: '', label: 'Todos os tipos' },
  { value: 'WORKSHOP', label: '🎓 Workshop' },
  { value: 'CIRCLE', label: '🌀 Círculo' },
  { value: 'LECTURE', label: '🎤 Palestra' },
  { value: 'CEREMONY', label: '🔥 Cerimônia' },
  { value: 'MEDITATION', label: '🧘 Meditação' },
  { value: 'LIVESTREAM', label: '📡 Livestream' },
];

// ============================================================
// Tipos
// ============================================================

interface EventItem {
  id: string;
  title: string;
  description: string;
  tradition: string;
  type: string;
  startsAt: string;
  endsAt: string;
  location: string | null;
  onlineUrl: string | null;
  capacity: number | null;
  rsvpCount: number;
  waitlistCount: number;
  priceCents: number;
  coverImage: string | null;
  tags: string[];
  status: string;
  viewerRsvp: string | null;
}

// ============================================================
// MAIN
// ============================================================

export default function EventsBrowsePage() {
  const { user } = useAuth();
  const [tradition, setTradition] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showPast, setShowPast] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (tradition) params.set('tradition', tradition);
        if (type) params.set('type', type);
        if (search) params.set('search', search);
        if (showPast) params.set('past', '1');
        else params.set('upcoming', '1');
        params.set('limit', '50');

        const res = await fetch(`/api/community/events?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEvents(data.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [tradition, type, search, showPast]);

  const featured = useMemo(() => events.filter((e) => e.tags.includes('featured')).slice(0, 3), [events]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="events-v2-browse">
      <main className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              🌀 Eventos
            </h1>
            <p className="text-sm text-slate-400 font-raleway mt-1">
              Workshops, círculos, palestras, cerimônias e transmissões
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              <a href="/api/community/events/feed.ics" className="underline hover:text-amber-300">
                📅 Subscribe no seu calendário (.ics)
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/events-v2/my-events">
              <Button variant="outline" className="border-slate-700 text-slate-300" data-testid="my-events-link">
                Meus eventos
              </Button>
            </Link>
            {user && (
              <Link href="/events-v2/new">
                <Button className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0" data-testid="create-event-button">
                  <Plus className="w-4 h-4 mr-1" /> Criar
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Featured */}
        {featured.length > 0 && !showPast && (
          <section>
            <h2 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Em destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((e) => (
                <EventCard key={e.id} event={e} featured />
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardContent className="pt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="events-search"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={tradition}
                onChange={(e) => setTradition(e.target.value)}
                data-testid="tradition-filter"
                className="bg-slate-800/40 border border-slate-700/40 rounded-md px-2 py-1 text-xs text-slate-200 outline-none"
              >
                {TRADITIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                data-testid="type-filter"
                className="bg-slate-800/40 border border-slate-700/40 rounded-md px-2 py-1 text-xs text-slate-200 outline-none"
              >
                {TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <Button
                size="sm"
                variant={showPast ? 'default' : 'ghost'}
                onClick={() => setShowPast(!showPast)}
                className={cn('text-xs', showPast && 'bg-slate-700 text-slate-200')}
              >
                {showPast ? '✓ Passados' : 'Passados'}
              </Button>

              <div className="ml-auto flex items-center gap-1 bg-slate-800/40 rounded-md p-0.5">
                <button
                  onClick={() => setView('list')}
                  className={cn(
                    'p-1.5 rounded text-xs flex items-center gap-1',
                    view === 'list' ? 'bg-slate-700 text-slate-200' : 'text-slate-500',
                  )}
                  data-testid="view-list"
                  aria-label="List view"
                >
                  <ListFilter className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={cn(
                    'p-1.5 rounded text-xs flex items-center gap-1',
                    view === 'calendar' ? 'bg-slate-700 text-slate-200' : 'text-slate-500',
                  )}
                  data-testid="view-calendar"
                  aria-label="Calendar view"
                >
                  <CalendarDays className="w-3 h-3" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="card-spiritual bg-red-500/10 border-red-500/30">
            <CardContent className="py-6 text-center text-sm text-red-300">{error}</CardContent>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardContent className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm text-slate-300">Nenhum evento encontrado.</p>
              {user && (
                <Link href="/events-v2/new">
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-violet-500 text-white border-0">
                    <Plus className="w-4 h-4 mr-1" /> Criar primeiro evento
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* List view */}
        {view === 'list' && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="events-list">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}

        {/* Calendar view (month) */}
        {view === 'calendar' && events.length > 0 && (
          <CalendarView events={events} />
        )}
      </main>
    </div>
  );
}

// ============================================================
// Event Card
// ============================================================

const TYPE_COLOR: Record<string, string> = {
  WORKSHOP: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  CIRCLE: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
  LECTURE: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  CEREMONY: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  MEDITATION: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  LIVESTREAM: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
};

function EventCard({ event, featured = false }: { event: EventItem; featured?: boolean }) {
  const colorClass = TYPE_COLOR[event.type] ?? 'from-slate-500/20 border-slate-500/30';
  const startDate = new Date(event.startsAt);
  const isFull = event.capacity !== null && event.rsvpCount >= event.capacity;

  return (
    <Link
      href={`/events-v2/${event.id}`}
      data-testid={`event-card-${event.id}`}
      className="block group"
    >
      <Card className={cn('card-spiritual bg-gradient-to-br border transition-all h-full', colorClass, featured && 'ring-2 ring-amber-500/40')}>
        {event.coverImage && (
          <div className="aspect-video w-full overflow-hidden rounded-t-xl">
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold text-slate-100 line-clamp-2 group-hover:text-amber-300 transition-colors">
              {event.title}
            </CardTitle>
            {event.viewerRsvp === 'GOING' && (
              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300 flex-shrink-0">
                ✓ Indo
              </Badge>
            )}
            {event.viewerRsvp === 'WAITLIST' && (
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300 flex-shrink-0">
                ⏳ Lista
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">{event.type}</Badge>
            <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">{event.tradition}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <p className="text-xs text-slate-400 line-clamp-2">{event.description}</p>
          <div className="flex flex-col gap-1 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-amber-400" />
              {startDate.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-violet-400" />
                <span className="truncate">{event.location}</span>
              </span>
            )}
            {event.onlineUrl && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-pink-400" /> Online
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-cyan-400" />
              {event.rsvpCount}{event.capacity !== null && ` / ${event.capacity}`}
              {isFull && <span className="text-red-400">· lotado</span>}
            </span>
            {event.priceCents > 0 && (
              <span className="flex items-center gap-1.5">
                R$ {(event.priceCents / 100).toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-end pt-2 border-t border-slate-800/50">
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ============================================================
// Calendar View (simple month grid)
// ============================================================

function CalendarView({ events }: { events: EventItem[] }) {
  const [monthDate, setMonthDate] = useState(new Date());

  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const days: Date[] = [];
  for (let d = 1; d <= monthEnd.getDate(); d++) {
    days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
  }

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      const d = new Date(e.startsAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  return (
    <Card className="card-spiritual bg-slate-900/50 border-slate-800/50" data-testid="events-calendar">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">
            {monthDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1))}>‹</Button>
            <Button size="sm" variant="ghost" onClick={() => setMonthDate(new Date())}>Hoje</Button>
            <Button size="sm" variant="ghost" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1))}>›</Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* empty cells before monthStart */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {days.map((d) => {
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const dayEvents = eventsByDay.get(key) ?? [];
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div
                key={d.toISOString()}
                className={cn(
                  'aspect-square p-1 rounded border border-slate-800/50 text-left overflow-hidden',
                  isToday && 'border-amber-500/50 bg-amber-500/5',
                )}
              >
                <div className="text-xs text-slate-400">{d.getDate()}</div>
                <div className="space-y-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <Link
                      key={e.id}
                      href={`/events-v2/${e.id}`}
                      className="block text-[10px] text-amber-300 hover:text-amber-200 truncate"
                      title={e.title}
                    >
                      ● {e.title}
                    </Link>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-500">+{dayEvents.length - 3}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}