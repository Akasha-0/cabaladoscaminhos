'use client';

// ============================================================================
// MarketplacePageClient — Client Component for /marketplace (W86-B)
// ----------------------------------------------------------------------------
// State:
//   - searchQuery (debounced 250ms → appliedQuery)
//   - selectedTradicao, selectedType, pricePresetId
//   - verifiedOnly, sacredOnly toggles
//   - bookingOpen, selectedOffering, bookingForm (date/notes/lgpd)
//
// A11y:
//   - aria-live="polite" on filter result count
//   - aria-busy during simulated fetch
//   - role="dialog" + aria-modal="true" on booking modal
//   - LGPD consent checkbox REQUIRED before submit
// ============================================================================

import * as React from 'react';
import { Search, Sparkles, ShieldCheck, X, Star, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  applyPageFilter,
  normalizeQuery,
  PRICE_RANGE_PRESETS,
  type PageFilter,
} from '@/engine/marketplace/MarketplaceFilter';
import {
  TRADICOES,
  TRADICAO_LABELS,
  OFFERING_TYPES,
  OFFERING_TYPE_LABELS,
  type Offering,
  type OfferingType,
  type Tradicao,
  type Practitioner,
} from '@/lib/engines/marketplace/marketplace-engine';

// ════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════

const DEBOUNCE_MS = 250;
const LGPD_VERSION = '2026-06-30' as const;
const MOBILE_BREAKPOINT_PX = 640;
const TABLET_BREAKPOINT_PX = 1024;

interface Counts {
  readonly total: number;
  readonly sacred: number;
  readonly verified: number;
  readonly traditions: number;
}

interface MarketplacePageClientProps {
  readonly initialOfferings: ReadonlyArray<Offering>;
  readonly practitioners: ReadonlyArray<Practitioner>;
  readonly verifiedPractitionerIds: ReadonlyArray<string>;
  readonly counts: Counts;
}

// ════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════

export function MarketplacePageClient({
  initialOfferings,
  verifiedPractitionerIds,
  counts,
}: MarketplacePageClientProps) {
  // ── State ─────────────────────────────────
  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [tradicao, setTradicao] = React.useState<Tradicao | 'all'>('all');
  const [type, setType] = React.useState<OfferingType | 'all'>('all');
  const [pricePresetId, setPricePresetId] = React.useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = React.useState(false);
  const [sacredOnly, setSacredOnly] = React.useState(false);

  const [isFetching, setIsFetching] = React.useState(false);
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [selectedOffering, setSelectedOffering] = React.useState<Offering | null>(null);
  const [bookingResult, setBookingResult] = React.useState<
    | { kind: 'idle' }
    | { kind: 'success'; bookingId: string }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  // Verified set for fast lookup
  const verifiedSet = React.useMemo(
    () => new Set(verifiedPractitionerIds),
    [verifiedPractitionerIds],
  );

  // ── Debounce search input ────────────────
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedQuery(searchInput);
      setIsFetching(false);
    }, DEBOUNCE_MS);
    setIsFetching(true);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  // ── Compose filter ───────────────────────
  const pricePreset = React.useMemo(
    () => PRICE_RANGE_PRESETS.find((p) => p.id === pricePresetId) ?? PRICE_RANGE_PRESETS[0]!,
    [pricePresetId],
  );

  const filter: PageFilter = React.useMemo(
    () => ({
      tradicao,
      type,
      minPrice: pricePreset?.min,
      maxPrice: pricePreset?.max,
      verifiedOnly,
      sacredOnly,
      query: debouncedQuery.length > 0 ? debouncedQuery : undefined,
    }),
    [tradicao, type, pricePreset, verifiedOnly, sacredOnly, debouncedQuery],
  );

  const filtered = React.useMemo(
    () => applyPageFilter(initialOfferings, filter, verifiedSet),
    [initialOfferings, filter, verifiedSet],
  );

  // ── Handlers ──────────────────────────────
  const onCardClick = React.useCallback((offering: Offering) => {
    setSelectedOffering(offering);
    setBookingResult({ kind: 'idle' });
    setBookingOpen(true);
  }, []);

  const onCloseBooking = React.useCallback(() => {
    setBookingOpen(false);
    setBookingResult({ kind: 'idle' });
  }, []);

  const onClearFilters = React.useCallback(() => {
    setSearchInput('');
    setDebouncedQuery('');
    setTradicao('all');
    setType('all');
    setPricePresetId('all');
    setVerifiedOnly(false);
    setSacredOnly(false);
  }, []);

  const hasActiveFilter =
    debouncedQuery.length > 0 ||
    tradicao !== 'all' ||
    type !== 'all' ||
    pricePresetId !== 'all' ||
    verifiedOnly ||
    sacredOnly;

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════
  return (
    <main
      className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8"
      data-page="marketplace"
    >
      {/* Header */}
      <header className="mb-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-caps text-tiny text-amber-300">
            7 Tradições · Marketplace Akasha
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
          Leitura & Práticas
        </h1>
        <p className="text-body text-slate-400">
          {counts.total} ofertas · {counts.verified} verificadas · {counts.traditions} tradições
        </p>
      </header>

      {/* Search + filters */}
      <section
        aria-label="Filtros do marketplace"
        className="mb-6 space-y-3"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            type="search"
            inputMode="search"
            placeholder="Buscar por nome, descrição, tag..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Buscar ofertas"
            className="h-11 pl-10 pr-10 text-base"
          />
          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Tradição chips */}
        <div
          role="group"
          aria-label="Filtro por tradição"
          className="flex flex-wrap gap-2"
        >
          <FilterChip
            label="Todas tradições"
            active={tradicao === 'all'}
            onClick={() => setTradicao('all')}
          />
          {TRADICOES.map((t) => (
            <FilterChip
              key={t}
              label={TRADICAO_LABELS[t]}
              active={tradicao === t}
              onClick={() => setTradicao(t)}
            />
          ))}
        </div>

        {/* Type chips */}
        <div
          role="group"
          aria-label="Filtro por tipo de oferta"
          className="flex flex-wrap gap-2"
        >
          <FilterChip
            label="Todos tipos"
            active={type === 'all'}
            onClick={() => setType('all')}
          />
          {OFFERING_TYPES.map((t) => (
            <FilterChip
              key={t}
              label={OFFERING_TYPE_LABELS[t]}
              active={type === t}
              onClick={() => setType(t)}
            />
          ))}
        </div>

        {/* Price + toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="price-preset"
            className="text-xs uppercase tracking-wide text-slate-400"
          >
            Preço
          </label>
          <select
            id="price-preset"
            value={pricePresetId}
            onChange={(e) => setPricePresetId(e.target.value)}
            className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {PRICE_RANGE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          <ToggleChip
            label="Apenas verificados"
            active={verifiedOnly}
            onToggle={() => setVerifiedOnly((v) => !v)}
          />
          <ToggleChip
            label="Apenas sagrados"
            active={sacredOnly}
            onToggle={() => setSacredOnly((v) => !v)}
          />

          {hasActiveFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </section>

      {/* Result count (aria-live for SR users) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mb-3 flex items-center justify-between text-sm text-slate-400"
      >
        <span>
          {filtered.length} {filtered.length === 1 ? 'oferta' : 'ofertas'} encontrada{filtered.length === 1 ? '' : 's'}
        </span>
        {isFetching && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <span
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400"
              aria-hidden="true"
            />
            atualizando...
          </span>
        )}
      </div>

      {/* Grid */}
      <div
        aria-busy={isFetching}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((o) => (
          <OfferingCard
            key={o.id}
            offering={o}
            verified={verifiedSet.has(o.practitionerId)}
            onBook={() => onCardClick(o)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-slate-400">
          <p>Nenhuma oferta encontrada com esses filtros.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="mt-2"
          >
            Limpar filtros
          </Button>
        </div>
      )}

      {/* Booking modal */}
      {bookingOpen && selectedOffering && (
        <BookingDialog
          offering={selectedOffering}
          onClose={onCloseBooking}
          result={bookingResult}
          setResult={setBookingResult}
        />
      )}
    </main>
  );
}

// ════════════════════════════════════════════
// FILTER CHIP
// ════════════════════════════════════════════

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center rounded-full border px-3 text-xs font-medium transition-colors',
        active
          ? 'border-amber-400 bg-amber-400/10 text-amber-300'
          : 'border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800',
      )}
    >
      {label}
    </button>
  );
}

function ToggleChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors',
        active
          ? 'border-violet-400 bg-violet-400/10 text-violet-300'
          : 'border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800',
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

// ════════════════════════════════════════════
// OFFERING CARD
// ════════════════════════════════════════════

function OfferingCard({
  offering,
  verified,
  onBook,
}: {
  offering: Offering;
  verified: boolean;
  onBook: () => void;
}) {
  return (
    <Card
      className="flex h-full flex-col"
      data-testid="offering-card"
      data-offering-id={offering.id}
      data-sacred={offering.sacred ? 'true' : 'false'}
    >
      <CardHeader>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{TRADICAO_LABELS[offering.tradicao]}</Badge>
          <Badge variant="outline">{OFFERING_TYPE_LABELS[offering.type]}</Badge>
          {offering.sacred && (
            <Badge variant="default" className="bg-amber-500/20 text-amber-300">
              Sagrado
            </Badge>
          )}
          {verified && (
            <Badge variant="default" className="bg-emerald-500/20 text-emerald-300">
              <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
              ✓ Verificado
            </Badge>
          )}
        </div>
        <CardTitle className="text-base leading-snug">{offering.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="line-clamp-3 text-sm text-slate-400">{offering.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" aria-hidden="true" />
            {offering.practitionerName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {offering.durationMin} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            {offering.rating.toFixed(1)} ({offering.reviewCount})
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 border-t pt-3">
        <div>
          <div className="text-xs text-slate-500">a partir de</div>
          <div className="text-lg font-bold text-amber-300">
            {formatBRL(offering.priceBRL)}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onBook}
          aria-label={`Reservar ${offering.title}`}
        >
          Reservar
        </Button>
      </CardFooter>
    </Card>
  );
}

// ════════════════════════════════════════════
// BOOKING DIALOG
// ════════════════════════════════════════════

interface BookingDialogProps {
  offering: Offering;
  onClose: () => void;
  result:
    | { kind: 'idle' }
    | { kind: 'success'; bookingId: string }
    | { kind: 'error'; message: string };
  setResult: React.Dispatch<
    React.SetStateAction<
      | { kind: 'idle' }
      | { kind: 'success'; bookingId: string }
      | { kind: 'error'; message: string }
    >
  >;
}

function BookingDialog({ offering, onClose, result, setResult }: BookingDialogProps) {
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [lgpd, setLgpd] = React.useState(false);

  const notesRequired = offering.sacred;
  const dateTimeValid = date.length > 0 && time.length > 0;
  const notesValid = !notesRequired || notes.trim().length > 0;
  const canSubmit = dateTimeValid && notesValid && lgpd;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Simulated booking (real impl would call createBookingIntent)
    const bookingId = 'book-' + Math.random().toString(36).slice(2, 8);
    setResult({ kind: 'success', bookingId });
  };

  // Close on Escape
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
      data-testid="booking-dialog"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-slate-900 p-5 ring-1 ring-foreground/10 sm:rounded-2xl"
        data-testid="booking-sheet"
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 id="booking-title" className="text-lg font-bold">
            Reservar oferta
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mb-3 text-sm text-slate-300">{offering.title}</p>
        <p className="mb-4 text-xs text-slate-500">
          por {offering.practitionerName} · {formatBRL(offering.priceBRL)} ·{' '}
          {offering.durationMin} min
        </p>

        {result.kind === 'success' ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-300"
            data-testid="booking-success"
          >
            <p className="font-medium">✓ Booking criado</p>
            <p className="mt-1 text-xs">
              ID: <code>{result.bookingId}</code>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mt-3"
            >
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3" data-testid="booking-form">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-1 block text-xs font-medium text-slate-300"
                >
                  Data
                </label>
                <Input
                  id="booking-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="booking-date"
                />
              </div>
              <div>
                <label
                  htmlFor="booking-time"
                  className="mb-1 block text-xs font-medium text-slate-300"
                >
                  Hora
                </label>
                <Input
                  id="booking-time"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  data-testid="booking-time"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="booking-notes"
                className="mb-1 block text-xs font-medium text-slate-300"
              >
                Notas {notesRequired && <span className="text-amber-300">*</span>}
              </label>
              <textarea
                id="booking-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required={notesRequired}
                rows={3}
                placeholder={
                  notesRequired
                    ? 'Obrigatório para ofertas sagradas — descreva sua intenção.'
                    : 'Detalhes, intenção, contexto (opcional).'
                }
                data-testid="booking-notes"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              {notesRequired && notes.trim().length === 0 && (
                <p className="mt-1 text-xs text-amber-300">
                  Ofertas sagradas exigem uma nota de intenção.
                </p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                id="booking-lgpd"
                type="checkbox"
                checked={lgpd}
                onChange={(e) => setLgpd(e.target.checked)}
                required
                data-testid="booking-lgpd"
                aria-required="true"
                aria-describedby="booking-lgpd-hint"
                className="mt-0.5 h-4 w-4 rounded border-input"
              />
              <label htmlFor="booking-lgpd" className="text-xs text-slate-300">
                <span id="booking-lgpd-hint">
                  Autorizo o uso dos meus dados para esta reserva (LGPD, versão{' '}
                  {LGPD_VERSION}). O practitioner receberá apenas nome, notas e
                  agendamento.
                </span>
              </label>
            </div>

            {result.kind === 'error' && (
              <p
                role="alert"
                className="rounded-lg bg-red-500/10 p-2 text-xs text-red-300"
              >
                {result.message}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                data-testid="booking-submit"
                className="flex-1"
              >
                Confirmar reserva
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════

function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

// Re-export for spec convenience
export { normalizeQuery };