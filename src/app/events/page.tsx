'use client';

// ============================================================================
// W86-D — /events page (Events/Workshops · RSVP · Tradição filter)
// ----------------------------------------------------------------------------
// Mobile-first lista de cards → desktop com sidebar de filtros.
// Mobile-first:
//   - ≤ 720px → 1 coluna vertical, filtros como chips horizontais scrolláveis
//   - ≥ 720px → grid 2 colunas + sidebar sticky à esquerda
//   - ≥ 1024px → grid 3 colunas + sidebar
//
// Features:
//   - Filter chips de tradição (✦ 🪶 ☩ ◈ ☸ ☉ ☬)
//   - Type filter (workshop/ceremony/circle/lecture)
//   - Date range picker (start/end)
//   - Free/Paid filter
//   - RSVP modal: nome + guests count + LGPD consent (REQUIRED) → submit
//   - Waitlist visual quando lotado
//   - aria-live="polite" em filter/RSVP changes, role="dialog" no modal
//
// NÃO usa feature legada (src/lib/events/) — tema fresh W86.
// ============================================================================

import * as React from 'react';
import {
  createEventsEngine,
  InMemoryEventsAdapter,
  type CreateRSVPResult,
  type Event,
  type EventFilter,
  type EventStats,
  type EventType,
  type RSVPStatus,
  type Tradição,
  TRADIÇÃO_LABEL,
  TRADIÇÃO_SYMBOL,
} from '@/engine/events';

// ============================================================
// Bootstrap (singleton no client)
// ============================================================

function getEngine() {
  const adapter = new InMemoryEventsAdapter();
  return createEventsEngine(adapter);
}

// ============================================================
// Constantes de UI
// ============================================================

const ALL_TRADIÇÕES: ReadonlyArray<Tradição> = [
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
];

const ALL_TYPES: ReadonlyArray<EventType> = [
  'workshop',
  'ceremony',
  'circle',
  'lecture',
];

const TYPE_LABEL: Readonly<Record<EventType, string>> = Object.freeze({
  workshop: 'Workshop',
  ceremony: 'Cerimônia',
  circle: 'Círculo',
  lecture: 'Palestra',
});

const MODALITY_ICON: Readonly<Record<Event['modality'], string>> = Object.freeze({
  presencial: '◆',
  online: '◉',
  hibrido: '◐',
});

// ============================================================
// Helpers de formatação
// ============================================================

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(cents: number | undefined, free: boolean): string {
  if (free) return 'Gratuito';
  if (cents === undefined) return '—';
  return `R$ ${(cents / 100).toFixed(2)}`;
}

// ============================================================
// Sub-componentes
// ============================================================

function TradiçãoChip({
  tradição,
  active,
  onClick,
}: {
  tradição: Tradição;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Filtrar por ${TRADIÇÃO_LABEL[tradição]}`}
      className={
        'inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm transition-colors ' +
        (active
          ? 'bg-violet-600 border-violet-600 text-white'
          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50')
      }
    >
      <span aria-hidden="true">{TRADIÇÃO_SYMBOL[tradição]}</span>
      <span>{TRADIÇÃO_LABEL[tradição]}</span>
    </button>
  );
}

function TypeChip({
  type,
  active,
  onClick,
}: {
  type: EventType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'inline-flex items-center px-3 py-1.5 rounded-full border text-xs transition-colors ' +
        (active
          ? 'bg-amber-600 border-amber-600 text-white'
          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50')
      }
    >
      {TYPE_LABEL[type]}
    </button>
  );
}

function CapacityBar({
  stats,
}: {
  stats: EventStats;
}) {
  const pct =
    stats.capacity === 0
      ? 0
      : Math.min(100, Math.round((stats.confirmed / stats.capacity) * 100));
  const barColor =
    stats.isFull
      ? 'bg-red-500'
      : pct >= 80
        ? 'bg-amber-500'
        : 'bg-emerald-500';
  return (
    <div
      className="w-full bg-stone-200 rounded-full h-2 overflow-hidden"
      role="progressbar"
      aria-valuenow={stats.confirmed}
      aria-valuemin={0}
      aria-valuemax={stats.capacity === 0 ? 100 : stats.capacity}
      aria-label={
        stats.capacity === 0
          ? 'Vagas ilimitadas'
          : `${stats.confirmed} de ${stats.capacity} vagas preenchidas`
      }
    >
      <div className={`h-2 ${barColor}`} style={{ width: `${stats.capacity === 0 ? 8 : pct}%` }} />
    </div>
  );
}

function EventCard({
  event,
  stats,
  onRSVP,
}: {
  event: Event;
  stats: EventStats | null;
  onRSVP: (event: Event) => void;
}) {
  const lotado = stats?.isFull ?? false;
  return (
    <article
      className="rounded-xl border border-stone-200 bg-white p-4 flex flex-col gap-3 shadow-sm"
      data-testid="event-card"
      data-tradição={event.tradição}
      data-type={event.type}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="text-xl"
            aria-hidden="true"
            aria-label={TRADIÇÃO_LABEL[event.tradição]}
          >
            {TRADIÇÃO_SYMBOL[event.tradição]}
          </span>
          <span className="text-xs uppercase tracking-wide text-stone-500">
            {TYPE_LABEL[event.type]}
          </span>
        </div>
        {lotado && (
          <span
            className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700"
            aria-label="Evento lotado, vaga em lista de espera"
          >
            Lotado · waitlist
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-stone-900 leading-tight">
        {event.title}
      </h3>

      <p className="text-sm text-stone-600 line-clamp-2">{event.descrição}</p>

      <div className="flex flex-wrap gap-2 text-xs text-stone-600">
        <span>
          📅 {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
        </span>
        <span>·</span>
        <span aria-label={`Modalidade ${event.modality}`}>
          {MODALITY_ICON[event.modality]} {event.modality}
        </span>
        <span>·</span>
        <span>📍 {event.location}</span>
      </div>

      <div className="text-xs text-stone-500">
        Facilitador:{' '}
        <span className="font-medium text-stone-700">
          {event.host.displayName}
        </span>
      </div>

      {stats && (
        <div className="flex flex-col gap-1">
          <CapacityBar stats={stats} />
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">
              {stats.capacity === 0
                ? 'Vagas ilimitadas'
                : `${stats.confirmed}/${stats.capacity} confirmados`}
            </span>
            <span className="text-stone-700 font-medium">
              {formatPrice(event.priceCents, event.free)}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onRSVP(event)}
        disabled={event.status === 'ended' || event.status === 'cancelled'}
        className={
          'mt-1 min-h-[48px] rounded-lg px-4 py-2 text-sm font-medium transition-colors ' +
          (event.status === 'ended' || event.status === 'cancelled'
            ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
            : lotado
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-violet-600 text-white hover:bg-violet-700')
        }
        aria-label={
          lotado
            ? `Entrar na lista de espera: ${event.title}`
            : `Confirmar presença: ${event.title}`
        }
      >
        {event.status === 'ended'
          ? 'Encerrado'
          : event.status === 'cancelled'
            ? 'Cancelado'
            : lotado
              ? 'Entrar na lista de espera'
              : 'Confirmar presença'}
      </button>
    </article>
  );
}

function FilterSidebar({
  filter,
  onFilter,
}: {
  filter: EventFilter;
  onFilter: (next: EventFilter) => void;
}) {
  return (
    <aside
      className="flex flex-col gap-4 p-4 rounded-xl border border-stone-200 bg-stone-50"
      aria-label="Filtros de eventos"
    >
      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-2">Tradição</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onFilter({ ...filter, tradição: undefined })}
            aria-pressed={filter.tradição === undefined}
            className={
              'px-3 py-1.5 rounded-full text-xs border ' +
              (filter.tradição === undefined
                ? 'bg-stone-700 text-white border-stone-700'
                : 'bg-white border-stone-300 text-stone-700')
            }
          >
            Todas
          </button>
          {ALL_TRADIÇÕES.map((t) => (
            <TradiçãoChip
              key={t}
              tradição={t}
              active={filter.tradição === t}
              onClick={() => onFilter({ ...filter, tradição: t })}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-2">Tipo</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onFilter({ ...filter, type: undefined })}
            aria-pressed={filter.type === undefined}
            className={
              'px-3 py-1.5 rounded-full text-xs border ' +
              (filter.type === undefined
                ? 'bg-stone-700 text-white border-stone-700'
                : 'bg-white border-stone-300 text-stone-700')
            }
          >
            Todos
          </button>
          {ALL_TYPES.map((tp) => (
            <TypeChip
              key={tp}
              type={tp}
              active={filter.type === tp}
              onClick={() => onFilter({ ...filter, type: tp })}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-2">Preço</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onFilter({ ...filter, free: undefined })}
            aria-pressed={filter.free === undefined}
            className={
              'px-3 py-1.5 rounded-full text-xs border ' +
              (filter.free === undefined
                ? 'bg-stone-700 text-white border-stone-700'
                : 'bg-white border-stone-300 text-stone-700')
            }
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilter({ ...filter, free: true })}
            aria-pressed={filter.free === true}
            className={
              'px-3 py-1.5 rounded-full text-xs border ' +
              (filter.free === true
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white border-stone-300 text-stone-700')
            }
          >
            Gratuito
          </button>
          <button
            type="button"
            onClick={() => onFilter({ ...filter, free: false })}
            aria-pressed={filter.free === false}
            className={
              'px-3 py-1.5 rounded-full text-xs border ' +
              (filter.free === false
                ? 'bg-amber-700 text-white border-amber-700'
                : 'bg-white border-stone-300 text-stone-700')
            }
          >
            Pago
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-2">Período</h2>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-stone-600">
            De
            <input
              type="date"
              value={filter.from ? filter.from.slice(0, 10) : ''}
              onChange={(e) =>
                onFilter({
                  ...filter,
                  from: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })
              }
              className="block w-full mt-1 px-2 py-1.5 border border-stone-300 rounded text-sm bg-white"
            />
          </label>
          <label className="text-xs text-stone-600">
            Até
            <input
              type="date"
              value={filter.to ? filter.to.slice(0, 10) : ''}
              onChange={(e) =>
                onFilter({
                  ...filter,
                  to: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })
              }
              className="block w-full mt-1 px-2 py-1.5 border border-stone-300 rounded text-sm bg-white"
            />
          </label>
        </div>
      </div>
    </aside>
  );
}

function RSVPModal({
  event,
  stats,
  onClose,
  onSubmit,
  result,
}: {
  event: Event | null;
  stats: EventStats | null;
  onClose: () => void;
  onSubmit: (params: { name: string; guests: number; lgpdConsent: boolean }) => void;
  result: CreateRSVPResult | null;
}) {
  const [name, setName] = React.useState('');
  const [guests, setGuests] = React.useState(0);
  const [lgpdConsent, setLgpdConsent] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  // Reset on new event
  React.useEffect(() => {
    setName('');
    setGuests(0);
    setLgpdConsent(false);
    setSubmitted(false);
  }, [event?.id]);

  // ESC key handler
  React.useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [event, onClose]);

  if (!event) return null;

  const isSuccess = result?.kind === 'success';
  const isWaitlist = result?.kind === 'waitlist';
  const isError = result && !isSuccess && !isWaitlist;
  const canSubmit = name.trim().length >= 2 && lgpdConsent && !submitted;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-modal-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h2 id="rsvp-modal-title" className="text-lg font-semibold text-stone-900">
            {stats?.isFull ? 'Entrar na lista de espera' : 'Confirmar presença'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center text-stone-500 hover:text-stone-900 -mr-2"
          >
            ✕
          </button>
        </div>

        <div className="text-sm text-stone-700">
          <div className="flex items-center gap-2 mb-2">
            <span aria-hidden="true">{TRADIÇÃO_SYMBOL[event.tradição]}</span>
            <span className="font-medium">{event.title}</span>
          </div>
          <div className="text-xs text-stone-500">
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)} · 📍{' '}
            {event.location}
          </div>
        </div>

        {isSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-md p-3 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200"
          >
            ✓ Inscrição confirmada. Aguardamos você!
          </div>
        )}
        {isWaitlist && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-md p-3 text-sm bg-amber-50 text-amber-800 border border-amber-200"
          >
            ⏳ Você está na lista de espera. Avisaremos por e-mail se abrir vaga.
          </div>
        )}
        {isError && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-md p-3 text-sm bg-red-50 text-red-800 border border-red-200"
          >
            {result?.kind === 'lgpd_missing'
              ? result.message
              : result?.kind === 'duplicate'
                ? result.message
                : 'Não foi possível completar a inscrição.'}
          </div>
        )}

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            setSubmitted(true);
            onSubmit({ name: name.trim(), guests, lgpdConsent });
          }}
        >
          <label className="text-sm text-stone-700">
            Seu nome completo
            <input
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full mt-1 px-3 py-2 border border-stone-300 rounded-md text-sm bg-white"
              placeholder="Como devemos te chamar?"
              data-testid="rsvp-name"
            />
          </label>

          <label className="text-sm text-stone-700">
            Convidados extras (0 a 5)
            <input
              type="number"
              min={0}
              max={5}
              value={guests}
              onChange={(e) => setGuests(Math.max(0, Math.min(5, Number(e.target.value) || 0)))}
              className="block w-full mt-1 px-3 py-2 border border-stone-300 rounded-md text-sm bg-white"
              data-testid="rsvp-guests"
            />
          </label>

          <label className="flex items-start gap-2 text-xs text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={lgpdConsent}
              onChange={(e) => setLgpdConsent(e.target.checked)}
              required
              className="mt-0.5 min-h-[20px] min-w-[20px]"
              data-testid="rsvp-lgpd"
            />
            <span>
              Autorizo o uso dos meus dados para esta inscrição, conforme a LGPD
              (versão 2026-01).
              <span className="text-red-600" aria-label="obrigatório">
                {' '}*
              </span>
            </span>
          </label>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] rounded-md border border-stone-300 text-stone-700 text-sm hover:bg-stone-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={
                'flex-1 min-h-[48px] rounded-md text-white text-sm font-medium ' +
                (canSubmit
                  ? 'bg-violet-600 hover:bg-violet-700'
                  : 'bg-stone-300 cursor-not-allowed')
              }
              data-testid="rsvp-submit"
            >
              {stats?.isFull ? 'Entrar na lista' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Página principal
// ============================================================

export default function EventsPage() {
  const engine = React.useMemo(getEngine, []);
  const [events, setEvents] = React.useState<ReadonlyArray<Event>>([]);
  const [statsByEvent, setStatsByEvent] = React.useState<Map<string, EventStats>>(new Map());
  const [filter, setFilter] = React.useState<EventFilter>({});
  const [rsvpEvent, setRsvpEvent] = React.useState<Event | null>(null);
  const [rsvpResult, setRsvpResult] = React.useState<CreateRSVPResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isDesktop, setIsDesktop] = React.useState(false);

  // Match media
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 720px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Load events + stats
  const loadEvents = React.useCallback(async () => {
    setLoading(true);
    const list = await engine.listEvents(filter);
    setEvents(list);
    const newStats = new Map<string, EventStats>();
    for (const evt of list) {
      const stats = await engine.getEventStats(evt.id);
      if (stats) newStats.set(evt.id, stats);
    }
    setStatsByEvent(newStats);
    setLoading(false);
  }, [engine, filter]);

  React.useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const handleOpenRSVP = React.useCallback((event: Event) => {
    setRsvpEvent(event);
    setRsvpResult(null);
  }, []);

  const handleCloseRSVP = React.useCallback(() => {
    setRsvpEvent(null);
    setRsvpResult(null);
  }, []);

  const handleSubmitRSVP = React.useCallback(
    async (params: { name: string; guests: number; lgpdConsent: boolean }) => {
      if (!rsvpEvent) return;
      const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const result = await engine.createRSVP(
        rsvpEvent.id,
        userId as unknown as Parameters<typeof engine.createRSVP>[1],
        params.name,
        params.guests,
        params.lgpdConsent
      );
      setRsvpResult(result);
      // Refresh stats
      const newStats = new Map(statsByEvent);
      const updated = await engine.getEventStats(rsvpEvent.id);
      if (updated) newStats.set(rsvpEvent.id, updated);
      setStatsByEvent(newStats);
    },
    [rsvpEvent, engine, statsByEvent]
  );

  const statsForModal: EventStats | null = rsvpEvent
    ? (statsByEvent.get(rsvpEvent.id) ?? null)
    : null;

  return (
    <main className="min-h-screen bg-stone-50" data-testid="events-page">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
            Eventos & Workshops
          </h1>
          <p className="text-sm md:text-base text-stone-600">
            Encontre cerimônias, círculos, workshops e palestras das 7 tradições
            do portal. RSVP aberto.
          </p>
        </header>

        {/* Mobile filter chips (≤ 720px) */}
        {!isDesktop && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <TradiçãoChip
              tradição="cigano"
              active={filter.tradição === 'cigano'}
              onClick={() => setFilter({ ...filter, tradição: undefined })}
            />
            {ALL_TRADIÇÕES.map((t) => (
              <TradiçãoChip
                key={t}
                tradição={t}
                active={filter.tradição === t}
                onClick={() => setFilter({ ...filter, tradição: t })}
              />
            ))}
          </div>
        )}

        <div
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-stone-600"
          data-testid="events-count"
        >
          {loading
            ? 'Carregando eventos…'
            : `${events.length} evento${events.length === 1 ? '' : 's'} encontrado${events.length === 1 ? '' : 's'}`}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {isDesktop && (
            <div className="md:w-64 md:flex-shrink-0">
              <FilterSidebar filter={filter} onFilter={setFilter} />
            </div>
          )}

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-xl bg-stone-100 animate-pulse"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
                <p className="text-stone-600">
                  Nenhum evento corresponde aos filtros atuais.
                </p>
                <button
                  type="button"
                  onClick={() => setFilter({})}
                  className="mt-3 text-sm text-violet-700 underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                data-testid="events-grid"
              >
                {events.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    stats={statsByEvent.get(evt.id) ?? null}
                    onRSVP={handleOpenRSVP}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {rsvpEvent && (
        <RSVPModal
          event={rsvpEvent}
          stats={statsForModal}
          onClose={handleCloseRSVP}
          onSubmit={handleSubmitRSVP}
          result={rsvpResult}
        />
      )}
    </main>
  );
}
