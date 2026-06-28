'use client';

// ============================================================================
// EVENTS LIST — /events
// ============================================================================
// Círculos de partilha online futuros, com filtro por tradição e botão
// de criar evento (apenas para usuários autenticados).
// ============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar, Search, Loader2, Plus, Globe, Lock, Users,
  Sparkles, Clock, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEventsList, type EventDto } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';

// ============================================================
// Constantes
// ============================================================

const TRADITION_FILTERS = [
  { value: '', label: 'Todas as tradições' },
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

const TRADITION_COLOR: Record<string, string> = {
  cabala: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-500/60',
  ifa: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-500/60',
  astrologia: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 hover:border-pink-500/60',
  tantra: 'from-rose-500/20 to-fuchsia-500/20 border-rose-500/30 hover:border-rose-500/60',
  reiki: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 hover:border-cyan-500/60',
  meditacao: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-500/60',
  xamanismo: 'from-emerald-500/20 to-lime-500/20 border-emerald-500/30 hover:border-emerald-500/60',
  'cristianismo-mistico': 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 hover:border-blue-500/60',
  sufismo: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/60',
  taoismo: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30 hover:border-slate-500/60',
  umbanda: 'from-orange-500/20 to-red-500/20 border-orange-500/30 hover:border-orange-500/60',
  candomble: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-500/60',
};

const TRADITION_EMOJI: Record<string, string> = {
  cabala: '✡️',
  ifa: '🪶',
  astrologia: '♈',
  tantra: '🕉️',
  reiki: '🔆',
  meditacao: '🧘',
  xamanismo: '🌿',
  'cristianismo-mistico': '✝️',
  sufismo: '☪️',
  taoismo: '☯️',
  umbanda: '🪘',
  candomble: '🌍',
};

// ============================================================
// Formatadores
// ============================================================

function formatStartsAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeDate(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days < 0) return 'já passou';
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  if (days < 7) return `em ${days} dias`;
  if (days < 30) return `em ${Math.floor(days / 7)} sem`;
  return `em ${Math.floor(days / 30)} meses`;
}

// ============================================================
// MAIN
// ============================================================

export default function EventsPage() {
  const { user } = useAuth();
  const devUserId = user?.id ?? undefined;

  const [tradition, setTradition] = useState<string>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search (300ms)
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { events, loading, error, refresh } = useEventsList({
    tradition: tradition || undefined,
    upcoming: true,
    isPublic: true,
    search: debouncedSearch || undefined,
    ...(devUserId ? { devUserId } : {}),
  });

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="events-list-page">
      {/* W24 a11y: id="main-content" + tabIndex={-1} permitem o SkipToContent
          (WCAG 2.4.1 Bypass Blocks) focar este container via teclado. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-5xl mx-auto space-y-6 pb-24 md:pb-8 focus:outline-none"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              🌀 Eventos & Círculos
            </h1>
            <p className="text-sm text-slate-400 font-raleway mt-1">
              Workshops, meditações guiadas e rodas de conversa ao vivo
            </p>
          </div>
          {user ? (
            <Link href="/events/new">
              <Button
                className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0"
                data-testid="create-event-button"
              >
                <Plus className="w-4 h-4 mr-2" /> Criar evento
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                data-testid="login-to-create-event"
              >
                Entrar para criar
              </Button>
            </Link>
          )}
        </header>

        {/* Filters */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardContent className="pt-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou tradição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="events-search-input"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 placeholder-slate-500 outline-none"
                aria-label="Buscar eventos"
              />
            </div>

            {/* Tradição */}
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Tradição:</span>
                <select
                  value={tradition}
                  onChange={(e) => setTradition(e.target.value)}
                  data-testid="events-tradition-filter"
                  className="bg-slate-800/40 border border-slate-700/40 rounded-md px-2 py-1 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  {TRADITION_FILTERS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {(tradition || search) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTradition('');
                    setSearch('');
                    setDebouncedSearch('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200"
                  data-testid="events-clear-filters"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && events.length === 0 && (
          <div
            className="flex justify-center py-12"
            data-testid="events-loading"
          >
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && events.length === 0 && (
          <Card className="card-spiritual bg-red-500/10 border-red-500/30">
            <CardContent className="py-6 text-center space-y-2">
              <p className="text-sm text-red-300">
                Não foi possível carregar os eventos: {error}
              </p>
              <Button size="sm" variant="outline" onClick={refresh}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardContent className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm text-slate-300">Nenhum evento futuro encontrado.</p>
              <p className="text-xs text-slate-500">
                {user
                  ? 'Que tal criar o primeiro círculo?'
                  : 'Volte em breve ou entre para criar o seu.'}
              </p>
              {user && (
                <Link href="/events/new">
                  <Button size="sm" className="mt-2 bg-gradient-to-r from-amber-500 to-violet-500 text-white border-0">
                    <Plus className="w-4 h-4 mr-1" /> Criar evento
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {events.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-testid="events-grid"
          >
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================
// EVENT CARD
// ============================================================

function EventCard({ event }: { event: EventDto }) {
  const colorClass =
    TRADITION_COLOR[event.tradition] ||
    'from-slate-500/20 to-slate-500/20 border-slate-500/30 hover:border-slate-500/60';
  const emoji = TRADITION_EMOJI[event.tradition] || '🌀';
  const isFull =
    event.spotsRemaining !== null && event.spotsRemaining <= 0;

  return (
    <Link
      href={`/events/${event.id}`}
      data-testid={`event-card-${event.id}`}
      className="block group"
    >
      <Card
        className={cn(
          'card-spiritual bg-gradient-to-br border transition-all h-full',
          colorClass
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-slate-950/40 border border-slate-800/50 flex items-center justify-center text-2xl flex-shrink-0">
                {emoji}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base font-semibold text-slate-100 line-clamp-2 group-hover:text-amber-300 transition-colors">
                  {event.title}
                </CardTitle>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  por {event.hostDisplayName}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] border-slate-700 text-slate-500 flex-shrink-0"
            >
              {event.isPublic ? (
                <>
                  <Globe className="w-2.5 h-2.5 mr-1" /> público
                </>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5 mr-1" /> privado
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {event.description}
          </p>

          <div className="flex flex-col gap-1.5 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-amber-400" />
              {formatStartsAt(event.startsAt)}
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{formatRelativeDate(event.startsAt)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-violet-400" />
              {event.durationMin} min
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-pink-400" />
              {event.participantsCount}
              {event.maxParticipants > 0 && ` / ${event.maxParticipants}`} participantes
              {event.spotsRemaining !== null && !isFull && (
                <span className="text-emerald-400">· {event.spotsRemaining} vagas</span>
              )}
              {isFull && (
                <span className="text-red-400">· lotado</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
            {event.viewerIsParticipant ? (
              <Badge
                variant="outline"
                className="text-[10px] border-emerald-500/40 text-emerald-300"
              >
                ✓ Você está dentro
              </Badge>
            ) : (
              <span className="text-[10px] text-slate-500">
                Toque para ver detalhes
              </span>
            )}
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}