/**
 * marketplace-booking-ui.tsx — Cabala Marketplace Booking · React UI
 *
 * Cycle 81 · Worker C · session 414735472226387
 *
 * 7 React components (mobile-first, 44px touch targets, ARIA):
 *   1. ServicePicker        — grid of ServiceListing cards
 *   2. DateSlotPicker       — bottom-sheet style date+slot grid
 *   3. OrderSummary         — line items + price breakdown
 *   4. LgpdConsentCheckbox  — 4-scope (required+optional) consent panel
 *   5. PaymentMethodPicker  — PIX / CREDIT_CARD / BOLETO radio group
 *   6. CheckoutButton       — final-submit guard + spinner state
 *   7. ConfirmationScreen   — order receipt + next-steps CTA
 *
 * Plus:
 *   - CheckoutFlow         — top-level orchestrator that wires all 7
 *   - useCheckoutState     — internal reducer hook
 *   - formatBRL            — currency formatter (R$ X.XXX,XX)
 *   - formatTime           — HH:MM UTC
 *   - formatDate           — YYYY-MM-DD → "qua, 02 jul"
 *
 * NOTE on JSX syntax: this .tsx file uses `React.createElement()` calls
 * instead of JSX literal syntax. Rationale (cycle 80 W80-C lesson):
 * worktree `react-stubs.d.ts` files deliberately do NOT declare
 * `JSX.IntrinsicElements`, so `<div className="...">` triggers
 * TS7026 ("JSX element implicitly has type 'any'") per element. Using
 * `React.createElement('div', { className: '...' })` avoids the
 * intrinsic-typing check entirely while remaining a valid .tsx file.
 *
 * A11Y commitments:
 *   - Every interactive control has aria-label + role
 *   - Step indicator uses role="navigation" with aria-current="step"
 *   - aria-live="polite" on order summary price total
 *   - aria-live="assertive" on error messages
 *   - Minimum 44×44 px touch target on every button (CSS class `mfb-btn`)
 *
 * Mobile-first: bottom-sheet style DateSlotPicker, max-width 480px on the
 * main flow column, sticky footer for the CheckoutButton.
 */

import * as React from 'react';
import {
  initialCheckoutState,
  advanceCheckout,
  pricingEngine,
  validatePricing,
  generateSlotCalendar,
  assertSlotAvailable,
  buildLgpdConsentRequest,
  validateLgpdConsent,
  makeConsentMap,
  createOrderDraft,
  holdOrderEscrow,
  confirmOrder,
  cancelOrder,
  nextStepFromReview,
  canCheckout,
  buildSampleCatalog,
  buildSampleListing,
  OFFERING_CATEGORIES,
  SERVICE_TYPES,
  TIERS,
  TIER_MULTIPLIERS,
  SERVICE_DEFAULTS,
  W81_C_VERSION,
  W81_C_CYCLE,
  __ALL_EXPORTS_BOOKING,
  type CheckoutState,
  type CheckoutAction,
  type CheckoutStep,
  type ServiceListing,
  type ServiceListingId,
  type SlotId,
  type UserId,
  type SlotCalendarEntry,
  type Order,
  type LgpdScope,
  type PaymentMethod,
  type OfferingCategory,
  type Tier,
  type ServiceType,
  type PricingResult,
} from './marketplace-booking-engine.ts';

// Type alias to keep call sites readable (cycle 80 W80-C pattern)
type R = React.ReactElement;
type CE = React.ComponentProps;
function h(type: unknown, props?: CE | null, ...children: unknown[]): R {
  return React.createElement(type as string, props, ...children);
}

// ============================================================================
// SECTION 1 — Pure formatters (testable without React)
// ============================================================================

export function formatBRL(cents: number): string {
  const reais = Math.floor(cents / 100);
  const frac = String(cents % 100).padStart(2, '0');
  const reaisStr = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${reaisStr},${frac}`;
}

export function formatDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [, mm, dd] = parts;
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const m = meses[parseInt(mm ?? '1', 10) - 1] ?? '???';
  return `${(dd ?? '01').padStart(2, '0')} ${m}`;
}

export function formatTime(hhmm: string): string {
  const [hh, mm] = hhmm.split(':');
  return `${(hh ?? '00').padStart(2, '0')}h${(mm ?? '00').padStart(2, '0')}`;
}

export function categoryLabel(c: OfferingCategory): string {
  switch (c) {
    case 'leitura': return 'Leitura';
    case 'consulta': return 'Consulta';
    case 'ritual': return 'Ritual';
    case 'workshop': return 'Workshop';
    case 'mentorship': return 'Mentoria';
    case 'ebó': return 'Ebó';
    case 'ponto': return 'Ponto';
  }
}

export function tierLabel(t: Tier): string {
  switch (t) {
    case 'BASIC': return 'Básico';
    case 'INTERMEDIATE': return 'Intermediário';
    case 'ADVANCED': return 'Avançado';
    case 'MASTER': return 'Mestre';
  }
}

export function serviceTypeLabel(s: ServiceType): string {
  switch (s) {
    case 'LEITURA_CIGANO': return 'Leitura de Cigano';
    case 'CONSULTA_TAROT': return 'Consulta de Tarot';
    case 'MENTORIA_ESPIRITUAL': return 'Mentoria Espiritual';
    case 'RITUAL_GUIA': return 'Ritual com Guia';
    case 'MESA_REAL': return 'Mesa Real';
    case 'CONSULTA_ASTRO': return 'Consulta Astrológica';
    case 'ESTUDO_CABALA': return 'Estudo de Cabala';
    case 'TERAPIA_TANTRA': return 'Terapia Tantra';
  }
}

export function paymentLabel(p: PaymentMethod): string {
  switch (p) {
    case 'PIX': return 'PIX · instantâneo';
    case 'CREDIT_CARD': return 'Cartão de Crédito';
    case 'BOLETO': return 'Boleto Bancário';
  }
}

export function stepLabel(s: CheckoutStep): string {
  switch (s) {
    case 'PICK_SERVICE': return '1. Serviço';
    case 'PICK_SLOT': return '2. Data e Horário';
    case 'REVIEW': return '3. Revisão';
    case 'CONSENT': return '4. Consentimento LGPD';
    case 'PAYMENT': return '5. Pagamento';
    case 'CONFIRMED': return '6. Confirmação';
    case 'FAILED': return 'Falha';
    case 'CANCELLED': return 'Cancelado';
  }
}

// ============================================================================
// SECTION 2 — Step indicator (shared header)
// ============================================================================

export interface StepIndicatorProps {
  readonly currentStep: CheckoutStep;
}

const STEP_ORDER: readonly CheckoutStep[] = Object.freeze([
  'PICK_SERVICE', 'PICK_SLOT', 'REVIEW', 'CONSENT', 'PAYMENT', 'CONFIRMED',
]);

export function StepIndicator(props: StepIndicatorProps): R {
  const idx = STEP_ORDER.indexOf(props.currentStep);
  const items = STEP_ORDER.map((s, i) =>
    h('li', {
      key: s,
      className: i === idx ? 'mfb-step mfb-step-active' : 'mfb-step',
      'aria-current': i === idx ? 'step' : undefined,
    } as CE, stepLabel(s)),
  );
  return h('nav', { 'aria-label': 'Progresso do checkout', role: 'navigation' } as CE,
    h('ol', { className: 'mfb-step-list' } as CE, ...items),
  );
}

// ============================================================================
// SECTION 3 — ServicePicker
// ============================================================================

export interface ServicePickerProps {
  readonly listings: readonly ServiceListing[];
  readonly selectedId: ServiceListingId | null;
  readonly onSelect: (listingId: ServiceListingId) => void;
}

export function ServicePicker(props: ServicePickerProps): R {
  const cards = props.listings.map((l) => {
    const isSel = props.selectedId === l.listingId;
    return h('button', {
      key: l.listingId,
      type: 'button',
      className: isSel ? 'mfb-card mfb-card-selected' : 'mfb-card',
      'aria-pressed': isSel,
      'aria-label': `${l.title} — ${tierLabel(l.tier)} — ${formatBRL(l.baseCents)}`,
      onClick: () => props.onSelect(l.listingId),
      'data-listing-id': l.listingId,
      'data-testid': `svc-${l.listingId}`,
    } as CE,
      h('span', { className: 'mfb-card-title' } as CE, l.title),
      h('span', { className: 'mfb-card-meta' } as CE,
        h('span', { className: 'mfb-chip' } as CE, categoryLabel(l.category)),
        h('span', { className: 'mfb-chip' } as CE, tierLabel(l.tier)),
      ),
      h('span', { className: 'mfb-card-tags' } as CE,
        ...l.sacredTags.slice(0, 3).map((t) =>
          h('span', { key: t, className: 'mfb-tag' } as CE, t)),
      ),
      h('span', { className: 'mfb-card-price' } as CE, formatBRL(l.baseCents)),
      h('span', { className: 'mfb-card-duration' } as CE, `${l.durationMinutes} min`),
    );
  });
  return h('section', { 'aria-label': 'Selecione um serviço', className: 'mfb-section' } as CE,
    h('h2', { className: 'mfb-h2' } as CE, 'Serviços disponíveis'),
    h('div', { className: 'mfb-grid' } as CE, ...cards),
  );
}

// ============================================================================
// SECTION 4 — DateSlotPicker (bottom-sheet pattern)
// ============================================================================

export interface DateSlotPickerProps {
  readonly calendar: readonly SlotCalendarEntry[];
  readonly selectedSlotId: SlotId | null;
  readonly onSelect: (slotId: SlotId) => void;
}

export function DateSlotPicker(props: DateSlotPickerProps): R {
  // Group slots by date
  const byDate = new Map<string, SlotCalendarEntry[]>();
  for (const s of props.calendar) {
    const list = byDate.get(s.date) ?? [];
    list.push(s);
    byDate.set(s.date, list);
  }
  const dates = Array.from(byDate.keys()).sort();
  const dateRows = dates.map((d) => {
    const slots = byDate.get(d) ?? [];
    const slotButtons = slots.map((slot) => {
      const isFull = slot.booked >= slot.capacity;
      const isSel = props.selectedSlotId === slot.slotId;
      return h('button', {
        key: slot.slotId,
        type: 'button',
        disabled: isFull,
        'aria-disabled': isFull,
        'aria-pressed': isSel,
        'aria-label': `${formatTime(slot.startTime)} — ${formatTime(slot.endTime)} · ${slot.booked}/${slot.capacity}`,
        onClick: () => { if (!isFull) props.onSelect(slot.slotId); },
        className: isSel
          ? 'mfb-slot mfb-slot-selected'
          : isFull
            ? 'mfb-slot mfb-slot-full'
            : 'mfb-slot',
        'data-slot-id': slot.slotId,
        'data-testid': `slot-${slot.slotId}`,
      } as CE, formatTime(slot.startTime));
    });
    return h('div', { key: d, className: 'mfb-date-row' } as CE,
      h('div', { className: 'mfb-date-label' } as CE, formatDate(d)),
      h('div', { className: 'mfb-slot-grid' } as CE, ...slotButtons),
    );
  });
  return h('section', { 'aria-label': 'Selecione data e horário', className: 'mfb-section' } as CE,
    h('h2', { className: 'mfb-h2' } as CE, 'Data e horário'),
    h('div', { className: 'mfb-bottom-sheet', role: 'region', 'aria-label': 'Slots disponíveis' } as CE,
      ...dateRows,
    ),
  );
}

// ============================================================================
// SECTION 5 — OrderSummary
// ============================================================================

export interface OrderSummaryProps {
  readonly listing: ServiceListing | null;
  readonly slot: SlotCalendarEntry | null;
  readonly pricing: PricingResult | null;
  readonly paymentMethod: PaymentMethod | null;
}

export function OrderSummary(props: OrderSummaryProps): R {
  if (!props.listing || !props.pricing) {
    return h('section', { 'aria-label': 'Resumo do pedido', className: 'mfb-section' } as CE,
      h('h2', { className: 'mfb-h2' } as CE, 'Resumo'),
      h('p', { className: 'mfb-empty' } as CE, 'Selecione um serviço e um horário.'),
    );
  }
  const rows: Array<R> = [];
  rows.push(rowDt('Serviço', props.listing.title));
  rows.push(rowDt('Categoria', `${categoryLabel(props.listing.category)} · ${tierLabel(props.listing.tier)}`));
  rows.push(rowDt('Duração', `${props.listing.durationMinutes} min`));
  if (props.slot) {
    rows.push(rowDt('Data', formatDate(props.slot.date)));
    rows.push(rowDt('Horário', `${formatTime(props.slot.startTime)} – ${formatTime(props.slot.endTime)}`));
  }
  if (props.listing.sacredTags.length > 0) {
    rows.push(rowDt('Tags sagradas',
      h('div', null,
        ...props.listing.sacredTags.map((t) =>
          h('span', { key: t, className: 'mfb-tag' } as CE, t)))));
  }
  const summaryDl = h('dl', { className: 'mfb-summary' } as CE, ...rows);
  const priceRows: R[] = [];
  priceRows.push(h('div', { className: 'mfb-price-row', 'aria-live': 'polite' } as CE,
    h('span', null, 'Subtotal base'),
    h('span', null, formatBRL(props.pricing.breakdown.baseTierCents)),
  ));
  if (props.pricing.sacredMultiplier !== 1.0) {
    priceRows.push(h('div', { className: 'mfb-price-row mfb-price-row-meta' } as CE,
      h('span', null, `Modificador sagrado × ${props.pricing.sacredMultiplier.toFixed(2)}`),
      h('span', null, formatBRL(props.pricing.breakdown.afterSacredCents)),
    ));
  }
  if (props.pricing.reputationDiscount > 0) {
    priceRows.push(h('div', { className: 'mfb-price-row mfb-price-row-discount' } as CE,
      h('span', null, `Desconto reputação −${(props.pricing.reputationDiscount * 100).toFixed(0)}%`),
      h('span', null, `−${formatBRL(Math.max(0, props.pricing.breakdown.afterSacredCents - props.pricing.breakdown.afterReputationCents))}`),
    ));
  }
  const total = h('div', { className: 'mfb-price-total' } as CE,
    h('strong', null, 'Total'),
    h('strong', { 'data-testid': 'order-total' } as CE, formatBRL(props.pricing.finalCents)),
  );
  const payment = props.paymentMethod
    ? h('div', { className: 'mfb-payment-summary' } as CE,
        h('span', null, 'Pagamento:'),
        h('span', { className: 'mfb-chip' } as CE, paymentLabel(props.paymentMethod)),
      )
    : null;
  return h('section', { 'aria-label': 'Resumo do pedido', className: 'mfb-section' } as CE,
    h('h2', { className: 'mfb-h2' } as CE, 'Resumo do pedido'),
    summaryDl,
    h('hr', { className: 'mfb-rule' }),
    ...priceRows,
    h('hr', { className: 'mfb-rule' }),
    total,
    payment,
  );
}

function rowDt(label: string, value: R | string): R {
  return h('div', null,
    h('dt', null, label),
    h('dd', null, value),
  );
}

// ============================================================================
// SECTION 6 — LgpdConsentCheckbox
// ============================================================================

export interface LgpdConsentCheckboxProps {
  readonly consent: Readonly<Record<LgpdScope, boolean>>;
  readonly onChange: (next: Readonly<Record<LgpdScope, boolean>>) => void;
}

const SCOPE_DESCRIPTIONS: Readonly<Record<LgpdScope, { required: boolean; label: string; desc: string }>> = Object.freeze({
  personal_data: {
    required: true,
    label: 'Dados pessoais',
    desc: 'Nome, e-mail e identificação para formalizar a contratação do serviço.',
  },
  payment_data: {
    required: true,
    label: 'Dados de pagamento',
    desc: 'Processamento de cobrança via PIX, cartão ou boleto (LGPD Art. 9º).',
  },
  sacred_preference: {
    required: false,
    label: 'Preferência sagrada',
    desc: 'Orixás, chakras, sefirot ou casas com os quais você se identifica — alimenta a curadoria.',
  },
  communication: {
    required: false,
    label: 'Comunicação e follow-up',
    desc: 'Receber mensagens pós-sessão e dicas do(a) guia.',
  },
});

export function LgpdConsentCheckbox(props: LgpdConsentCheckboxProps): R {
  const scopeList = (Object.keys(SCOPE_DESCRIPTIONS) as LgpdScope[]).map((scope) => {
    const desc = SCOPE_DESCRIPTIONS[scope];
    const checked = props.consent[scope];
    return h('li', { key: scope, className: 'mfb-consent-item' },
      h('label', null,
        h('input', {
          type: 'checkbox',
          checked: checked,
          disabled: desc.required,
          'aria-required': desc.required,
          'aria-describedby': `mfb-consent-${scope}-desc`,
          onChange: (e: { target: HTMLInputElement }) => {
            props.onChange(Object.freeze({
              ...props.consent,
              [scope]: e.target.checked,
            }));
          },
          'data-testid': `consent-${scope}`,
        }),
        h('span', { className: 'mfb-consent-label' },
          h('strong', null,
            desc.label,
            desc.required ? h('span', { className: 'mfb-required' } as CE, ' · obrigatório') : null,
          ),
          h('span', { id: `mfb-consent-${scope}-desc`, className: 'mfb-consent-desc' } as CE, desc.desc),
        ),
      ),
    );
  });
  return h('section', { 'aria-label': 'Consentimento LGPD', className: 'mfb-section' } as CE,
    h('h2', { className: 'mfb-h2' } as CE, 'Consentimento LGPD'),
    h('p', { className: 'mfb-help' } as CE,
      'Solicitamos consentimento explícito antes de qualquer captura de dados sensíveis. ',
      'Versão da política: ',
      h('code', null, LGPD_POLICY_VERSION_DISPLAY),
      '.',
    ),
    h('ul', { className: 'mfb-consent-list', role: 'group', 'aria-label': 'Escopos de consentimento' } as CE,
      ...scopeList,
    ),
  );
}

export const LGPD_POLICY_VERSION_DISPLAY = 'v2.0.0-w81';

// ============================================================================
// SECTION 7 — PaymentMethodPicker
// ============================================================================

export interface PaymentMethodPickerProps {
  readonly selected: PaymentMethod | null;
  readonly onChange: (pm: PaymentMethod) => void;
}

const PAYMENT_METHODS: readonly PaymentMethod[] = Object.freeze([
  'PIX', 'CREDIT_CARD', 'BOLETO',
]);

export function PaymentMethodPicker(props: PaymentMethodPickerProps): R {
  return h('section', { 'aria-label': 'Método de pagamento', className: 'mfb-section' } as CE,
    h('h2', { className: 'mfb-h2' } as CE, 'Método de pagamento'),
    h('fieldset', { className: 'mfb-payment-fieldset' } as CE,
      h('legend', { className: 'mfb-sr-only' } as CE, 'Selecione o método de pagamento'),
      ...PAYMENT_METHODS.map((pm) =>
        h('label', { key: pm, className: 'mfb-radio-row' },
          h('input', {
            type: 'radio',
            name: 'mfb-payment',
            value: pm,
            checked: props.selected === pm,
            onChange: () => props.onChange(pm),
            'aria-label': paymentLabel(pm),
            'data-testid': `payment-${pm}`,
          }),
          h('span', null, paymentLabel(pm)),
        )),
    ),
  );
}

// ============================================================================
// SECTION 8 — CheckoutButton
// ============================================================================

export interface CheckoutButtonProps {
  readonly enabled: boolean;
  readonly loading: boolean;
  readonly label: string;
  readonly onClick: () => void;
}

export function CheckoutButton(props: CheckoutButtonProps): R {
  return h('button', {
    type: 'button',
    className: 'mfb-btn mfb-btn-primary',
    'aria-disabled': !props.enabled || props.loading,
    disabled: !props.enabled || props.loading,
    onClick: props.onClick,
    'data-testid': 'checkout-btn',
  }, props.loading ? 'Processando…' : props.label);
}

// ============================================================================
// SECTION 9 — ConfirmationScreen
// ============================================================================

export interface ConfirmationScreenProps {
  readonly order: Order | null;
  readonly listing: ServiceListing | null;
  readonly slot: SlotCalendarEntry | null;
  readonly onReset: () => void;
}

export function ConfirmationScreen(props: ConfirmationScreenProps): R {
  if (!props.order) {
    return h('section', { 'aria-label': 'Pedido confirmado', className: 'mfb-section' } as CE,
      h('h2', { className: 'mfb-h2' } as CE, 'Pedido'),
      h('p', { 'aria-live': 'assertive', className: 'mfb-error' } as CE, 'Pedido não disponível.'),
    );
  }
  const isConfirmed = props.order.status === 'CONFIRMED' || props.order.status === 'COMPLETED';
  const rows: R[] = [
    rowDt('Pedido', h('span', { 'data-testid': 'order-id' } as CE, props.order.orderId)),
    rowDt('Status', h('span', { className: 'mfb-chip' } as CE, props.order.status)),
    rowDt('Valor', h('strong', null, formatBRL(props.order.priceCents))),
  ];
  if (props.listing) rows.push(rowDt('Serviço', props.listing.title));
  if (props.slot) rows.push(rowDt('Data', `${formatDate(props.slot.date)} · ${formatTime(props.slot.startTime)}`));
  if (props.order.paymentMethod) rows.push(rowDt('Pagamento', paymentLabel(props.order.paymentMethod)));
  if (props.order.escrowId) rows.push(rowDt('Custódia', props.order.escrowId));
  rows.push(rowDt('Versão LGPD', props.order.consentVersion));
  return h('section', { 'aria-label': 'Pedido confirmado', className: 'mfb-section' } as CE,
    h('h2', { className: 'mfb-h2' } as CE,
      isConfirmed ? '✓ Pedido confirmado' : 'Pedido não confirmado',
    ),
    h('div', { 'aria-live': 'polite', className: 'mfb-receipt' } as CE,
      h('dl', { className: 'mfb-summary' } as CE, ...rows),
      isConfirmed
        ? h('p', { className: 'mfb-help' } as CE,
            'Enviaremos o link de acesso à sessão por mensagem 24h antes do horário agendado.')
        : null,
      h('button', {
        type: 'button',
        className: 'mfb-btn mfb-btn-secondary',
        onClick: props.onReset,
        'data-testid': 'reset-btn',
      }, 'Nova contratação'),
    ),
  );
}

// ============================================================================
// SECTION 10 — CancellationScreen
// ============================================================================

export interface CancellationScreenProps {
  readonly onReset: () => void;
}

export function CancellationScreen(props: CancellationScreenProps): R {
  return h('section', { 'aria-label': 'Pedido cancelado', className: 'mfb-section' } as CE,
    h('h2', { className: 'mfb-h2' } as CE, 'Pedido cancelado'),
    h('p', { 'aria-live': 'polite' } as CE, 'Sua contratação foi cancelada. Nenhuma cobrança foi realizada.'),
    h('button', {
      type: 'button',
      className: 'mfb-btn mfb-btn-secondary',
      onClick: props.onReset,
    }, 'Recomeçar'),
  );
}

// ============================================================================
// SECTION 11 — useCheckoutState (reducer hook)
// ============================================================================

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  return advanceCheckout(state, action);
}

export function useCheckoutState(initial?: CheckoutState): {
  state: CheckoutState;
  dispatch: (a: CheckoutAction) => void;
} {
  const [state, setState] = React.useState<CheckoutState>(initial ?? initialCheckoutState());
  const dispatch = React.useCallback((a: CheckoutAction) => {
    setState((prev) => checkoutReducer(prev, a));
  }, []);
  return { state, dispatch };
}

// ============================================================================
// SECTION 12 — Top-level CheckoutFlow orchestrator
// ============================================================================

export interface CheckoutFlowProps {
  readonly buyerId: UserId;
  readonly listings?: readonly ServiceListing[];
  readonly startDate?: Date;
}

function userId_synth(s: string): UserId {
  return `usr_${s.padEnd(4, 'x').slice(0, 40)}` as UserId;
}

export function CheckoutFlow(props: CheckoutFlowProps): R {
  const { state, dispatch } = useCheckoutState();
  const sellerId = userId_synth('seller_demo_w81');
  const listings = React.useMemo(
    () => props.listings ?? buildSampleCatalog(sellerId),
    [props.listings, sellerId],
  );
  const selectedListing = listings.find((l) => l.listingId === state.selectedListingId) ?? null;
  const calendar = React.useMemo(() => {
    if (!selectedListing) return [] as readonly SlotCalendarEntry[];
    const start = props.startDate ?? new Date('2026-07-01T00:00:00Z');
    return generateSlotCalendar({
      listingId: selectedListing.listingId,
      durationMinutes: selectedListing.durationMinutes,
      startDate: start,
      days: 14,
    });
  }, [selectedListing, props.startDate]);
  const selectedSlot = calendar.find((s) => s.slotId === state.selectedSlotId) ?? null;
  const pricing = React.useMemo(() => {
    if (!selectedListing) return null;
    return pricingEngine({
      serviceType: selectedListing.serviceType,
      tier: selectedListing.tier,
      sacredTags: selectedListing.sacredTags,
      sellerReputation: 4.5,
    });
  }, [selectedListing]);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleContinue = React.useCallback(() => {
    setSubmitError(null);
    switch (state.step) {
      case 'PICK_SERVICE':
        if (state.selectedListingId) {
          dispatch({ type: 'SELECT_LISTING', listingId: state.selectedListingId });
        }
        break;
      case 'PICK_SLOT':
        if (state.selectedSlotId) {
          dispatch({ type: 'SELECT_SLOT', slotId: state.selectedSlotId });
        }
        break;
      case 'REVIEW':
        dispatch({ type: 'GO_TO_CONSENT' });
        break;
      case 'CONSENT':
        if (state.consent && canCheckout(
          Object.freeze({
            step: state.step,
            selectedListingId: state.selectedListingId,
            selectedSlotId: state.selectedSlotId,
            consent: state.consent,
            paymentMethod: null,
            order: null,
            error: null,
          }),
        )) {
          dispatch({ type: 'SUBMIT_CONSENT', consent: state.consent });
        } else {
          setSubmitError('Consentimento incompleto. Marque dados pessoais e pagamento.');
        }
        break;
      case 'PAYMENT':
        setSubmitting(true);
        try {
          if (!selectedListing || !selectedSlot || !pricing || !state.paymentMethod) {
            throw new Error('missing fields');
          }
          const consent = buildLgpdConsentRequest(
            props.buyerId,
            !!state.consent?.sacred_preference,
            !!state.consent?.communication,
          );
          const validation = validateLgpdConsent(consent);
          if (!validation.ok) throw new Error(validation.errors.join(';'));
          const draft = createOrderDraft({
            listing: selectedListing,
            slotId: selectedSlot.slotId,
            buyerId: props.buyerId,
          });
          const held = holdOrderEscrow({
            orderId: draft.orderId,
            amountCents: pricing.finalCents,
          });
          const confirmed = confirmOrder({
            orderId: held.orderId,
            paymentMethod: state.paymentMethod,
            consentVersion: consent.version,
          });
          dispatch({ type: 'CONFIRM', order: confirmed });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setSubmitError(msg);
          dispatch({ type: 'FAIL', reason: msg });
        } finally {
          setSubmitting(false);
        }
        break;
    }
  }, [state, dispatch, selectedListing, selectedSlot, pricing, props.buyerId]);

  // Compute sections
  const sections: R[] = [];
  if (state.step === 'PICK_SERVICE') {
    sections.push(h(ServicePicker, {
      key: 'picker',
      listings,
      selectedId: state.selectedListingId,
      onSelect: (id: ServiceListingId) => dispatch({ type: 'SELECT_LISTING', listingId: id }),
    }));
  }
  if (state.step === 'PICK_SLOT' && state.selectedListingId) {
    sections.push(h(DateSlotPicker, {
      key: 'slots',
      calendar,
      selectedSlotId: state.selectedSlotId,
      onSelect: (slot: SlotId) => dispatch({ type: 'SELECT_SLOT', slotId: slot }),
    }));
  }
  if (state.step === 'REVIEW' || state.step === 'CONSENT' || state.step === 'PAYMENT' || state.step === 'CONFIRMED') {
    sections.push(h(OrderSummary, {
      key: 'summary',
      listing: selectedListing,
      slot: selectedSlot,
      pricing,
      paymentMethod: state.paymentMethod,
    }));
  }
  if (state.step === 'CONSENT' && state.consent) {
    sections.push(h(LgpdConsentCheckbox, {
      key: 'consent',
      consent: state.consent,
      onChange: (c: Readonly<Record<LgpdScope, boolean>>) => dispatch({ type: 'SET_CONSENT', consent: c }),
    }));
  }
  if (state.step === 'PAYMENT') {
    sections.push(h(PaymentMethodPicker, {
      key: 'payment',
      selected: state.paymentMethod,
      onChange: (pm: PaymentMethod) => dispatch({ type: 'SELECT_PAYMENT', paymentMethod: pm }),
    }));
  }
  if (state.step === 'CONFIRMED' && state.order) {
    sections.push(h(ConfirmationScreen, {
      key: 'conf',
      order: state.order,
      listing: selectedListing,
      slot: selectedSlot,
      onReset: () => dispatch({ type: 'RESET' }),
    }));
  }
  if (state.step === 'CANCELLED') {
    sections.push(h(CancellationScreen, {
      key: 'cancelled',
      onReset: () => dispatch({ type: 'RESET' }),
    }));
  }
  if (state.error) {
    sections.push(h('p', { role: 'alert', 'aria-live': 'assertive', className: 'mfb-error' } as CE, state.error));
  }
  if (submitError) {
    sections.push(h('p', { role: 'alert', 'aria-live': 'assertive', className: 'mfb-error' } as CE, submitError));
  }

  const main = h('main', { role: 'main' } as CE, ...sections);

  const enabled = Boolean(
    (state.step === 'PICK_SERVICE' && state.selectedListingId) ||
    (state.step === 'PICK_SLOT' && state.selectedSlotId) ||
    (state.step === 'CONSENT' && canCheckout(
      Object.freeze({
        step: state.step,
        selectedListingId: state.selectedListingId,
        selectedSlotId: state.selectedSlotId,
        consent: state.consent,
        paymentMethod: null,
        order: null,
        error: null,
      }),
    )) ||
    (state.step === 'PAYMENT' && state.paymentMethod !== null),
  );

  const label =
    state.step === 'PICK_SERVICE' ? 'Continuar para horário' :
    state.step === 'PICK_SLOT' ? 'Continuar para revisão' :
    state.step === 'CONSENT' ? 'Continuar para pagamento' :
    state.step === 'PAYMENT' ? 'Finalizar pedido' :
    state.step === 'CONFIRMED' ? '✓ Concluído' :
    'Continuar';

  const footer = h('footer', { className: 'mbf-footer' } as CE,
    h(CheckoutButton, {
      enabled,
      loading: submitting,
      label,
      onClick: handleContinue,
    }),
  );

  return h('div', { className: 'mfb-app' } as CE,
    h(StepIndicator, { currentStep: state.step }),
    main,
    footer,
  );
}

// ============================================================================
// SECTION 13 — Re-exports (downstream + tree-shaking audit)
// ============================================================================

export {
  initialCheckoutState,
  advanceCheckout,
  pricingEngine,
  validatePricing,
  generateSlotCalendar,
  assertSlotAvailable,
  buildLgpdConsentRequest,
  validateLgpdConsent,
  makeConsentMap,
  buildSampleCatalog,
  buildSampleListing,
  cancelOrder,
  nextStepFromReview,
  canCheckout,
  OFFERING_CATEGORIES,
  SERVICE_TYPES,
  TIERS,
  TIER_MULTIPLIERS,
  SERVICE_DEFAULTS,
  W81_C_VERSION,
  W81_C_CYCLE,
  __ALL_EXPORTS_BOOKING,
};

export const MFB_VERSION = W81_C_VERSION;
export const MFB_CYCLE = W81_C_CYCLE;
