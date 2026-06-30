// ============================================================================
// RSVP FORM — Mobile-first RSVP + waitlist + capacity UI (W80-B)
// ----------------------------------------------------------------------------
// W80-B · Cycle 80 · 2026-06-30
// Componente React (sem sintaxe JSX — usa React.createElement direto) para
// confirmar presença em eventos do portal Akasha.
//
// Consome a API `/api/events/[id]/rsvp` (já existente, W21) que tem 3 estados:
//   going    → presença confirmada (incrementa participantsCount)
//   maybe    → lista de espera / interesse (não conta)
//   declined → recusou (não conta)
//
// Comportamento por estado do usuário:
//   1. Não logado     → CTA "Entrar para participar" → /login?next=...
//   2. Logado+going   → mostra estado atual + opções de mudar (com confirmação)
//   3. Logado+maybe   → mostra estado atual + opção de promover para going
//   4. Logado+declined→ mostra estado + opção de ressuscitar para going
//   5. Logado+null    → 3 botões: going (default), maybe, declined
//   6. Evento lotado  → força uso de 'maybe' (vai p/ lista de espera)
//   7. Evento fechado → todos os botões desabilitados
//
// Acessibilidade (WCAG AA):
//   - aria-label em cada botão com estado descritivo
//   - role="group" no fieldset com aria-labelledby
//   - aria-live="polite" para anúncio de mudanças
//   - Foco visível (focus-visible:ring-3)
//   - Keyboard nav (Tab + Enter/Space nativos de <button>)
//   - Touch target mínimo 44px (WCAG 2.5.5)
//
// Pure presentational — toda mutação passa por `onSubmit` callback.
// ============================================================================

import * as React from './_react_stub.ts';
import {
  type RsvpState,
  type TraditionId,
  type EventTypeId,
  TRADITION_LABEL,
  EVENT_TYPE_LABEL,
  RSVP_STATE_LABEL,
  RSVP_STATE_LABEL_ACTIVE,
  buildCapacityDisplay,
  deriveRsvpTransition,
  buildRsvpAnnouncement,
  getButtonAvailability,
  isTradition,
  isEventType,
  defaultRsvpState,
} from './RSVPForm.helpers.ts';

// ============================================================================
// PROPS
// ============================================================================

export interface RSVPFormProps {
  /** ID do evento (slug ou UUID) — usado em callbacks. */
  readonly eventId: string;
  /** Título do evento (para aria-label do fieldset). */
  readonly eventTitle: string;
  /** Tradição espiritual — chave canônica (7 chaves) ou string livre. */
  readonly tradition: string;
  /** Tipo de evento — chave canônica (4 chaves) ou string livre. */
  readonly eventType: string;
  /** Quantos já confirmaram presença. */
  readonly confirmedCount: number;
  /** Capacidade máxima (0 = ilimitado). */
  readonly capacity: number;
  /** Estado atual do RSVP do viewer (null se sem RSVP). */
  readonly currentRsvp: RsvpState;
  /** Se o usuário está autenticado (default true). */
  readonly isAuthenticated?: boolean;
  /** URL de redirect após login (se não autenticado). */
  readonly loginRedirect?: string;
  /** Se o evento está fechado para novos RSVPs. */
  readonly eventClosed?: boolean;
  /** Callback para mudança de estado — recebe o estado alvo. */
  readonly onSubmit?: (target: Exclude<RsvpState, null>) => void | Promise<void>;
  /** Callback de erro (opcional). */
  readonly onError?: (error: Error) => void;
  /** Callback para login (custom — default: navigate to /login). */
  readonly onLoginRequest?: () => void;
  /** Callback para confirmar uma transição destrutiva (going→declined/maybe). */
  readonly onConfirmRequest?: (
    target: Exclude<RsvpState, null>,
    transition: ReturnType<typeof deriveRsvpTransition>
  ) => boolean | Promise<boolean>;
  /** Variante visual: 'default' (claro) ou 'compact' (card lateral). */
  readonly variant?: 'default' | 'compact';
  /** Locale para labels (default pt-BR). */
  readonly locale?: 'pt-BR' | 'en';
  /** ID para test selectors (default 'rsvp-form'). */
  readonly id?: string;
  /** ClassName adicional. */
  readonly className?: string;
  /** Callback de teste para forçar pending state. */
  readonly __testIsPending?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_TOUCH_TARGET_PX = 44;
const DEFAULT_ID = 'rsvp-form';

// React.createElement shorthand (cast to permissive type to avoid generic issues)
const h = React.createElement as unknown as (
  type: unknown,
  props?: Record<string, unknown> | null,
  ...children: unknown[]
) => React.ReactElement;

// ============================================================================
// COMPONENT
// ============================================================================

export function RSVPForm(props: RSVPFormProps): React.ReactElement {
  const {
    eventId,
    eventTitle,
    tradition,
    eventType,
    confirmedCount,
    capacity,
    currentRsvp,
    isAuthenticated = true,
    loginRedirect,
    eventClosed = false,
    onSubmit,
    onError,
    onLoginRequest,
    onConfirmRequest,
    variant = 'default',
    locale = 'pt-BR',
    id = DEFAULT_ID,
    className = '',
    __testIsPending = false,
  } = props;

  // ---- Local state ----
  const [pending, setPending] = React.useState<Exclude<RsvpState, null> | null>(null);
  const [lastAnnouncement, setLastAnnouncement] = React.useState<string>('');

  // ---- Derived ----
  const capacityDisplay = React.useMemo(
    () => buildCapacityDisplay(confirmedCount, capacity),
    [confirmedCount, capacity]
  );

  const traditionDisplay = isTradition(tradition)
    ? TRADITION_LABEL[tradition as TraditionId]
    : tradition || 'Tradição';
  const typeDisplay = isEventType(eventType)
    ? EVENT_TYPE_LABEL[eventType as EventTypeId]
    : eventType || 'Evento';

  const groupLabel = `Inscrição · ${eventTitle} (${typeDisplay} · ${traditionDisplay})`;

  // ---- Handlers ----
  const handleLogin = React.useCallback((): void => {
    if (onLoginRequest) {
      onLoginRequest();
      return;
    }
    // Default: navigate (browser-only; safe no-op in test env)
    if (typeof window !== 'undefined' && loginRedirect) {
      window.location.assign(loginRedirect);
    }
  }, [onLoginRequest, loginRedirect]);

  const handleClick = React.useCallback(
    async (target: Exclude<RsvpState, null>): Promise<void> => {
      // 1. Verifica transição
      const transition = deriveRsvpTransition(currentRsvp, target);
      if ('error' in transition) {
        if (onError) onError(new Error(transition.error));
        return;
      }

      // 2. NOOP idempotente
      if (!transition.willMutate) {
        setLastAnnouncement(transition.announcement);
        return;
      }

      // 3. Confirmação obrigatória (cancelar de 'going')
      if (transition.requiresConfirm && onConfirmRequest) {
        const confirmed = await onConfirmRequest(target, transition);
        if (!confirmed) return;
      }

      // 4. Optimistic UI: marca pending
      setPending(target);

      // 5. Anuncia para screen readers ANTES de chamar API
      const announcement = buildRsvpAnnouncement(transition, capacityDisplay);
      setLastAnnouncement(announcement);

      // 6. Dispara callback (parent faz o fetch real)
      try {
        await onSubmit?.(target);
      } catch (err) {
        if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setPending(null);
      }
    },
    [currentRsvp, onSubmit, onError, onConfirmRequest, capacityDisplay]
  );

  // ============================================================================
  // RENDER: Não logado → CTA único de login
  // ============================================================================
  if (!isAuthenticated) {
    return h(
      'fieldset',
      {
        'data-testid': `${id}-unauthenticated`,
        className: `rsvp-form rsvp-form--unauth border border-slate-700/40 bg-slate-900/60 rounded-xl p-4 ${className}`,
        'aria-labelledby': `${id}-legend`,
      },
      h(
        'legend',
        { id: `${id}-legend`, className: 'sr-only' },
        groupLabel
      ),
      h(
        'div',
        { className: 'flex items-center justify-between gap-3' },
        h(
          'div',
          { className: 'min-w-0 flex-1' },
          h(
            'p',
            { className: 'text-[11px] uppercase tracking-wider text-amber-400/80 font-medium' },
            traditionDisplay
          ),
          h(
            'p',
            { className: 'text-sm text-slate-200 font-medium truncate' },
            capacityDisplay.label
          )
        ),
        h(
          'button',
          {
            type: 'button',
            'data-testid': `${id}-login-button`,
            onClick: handleLogin,
            'aria-label': `${RSVP_STATE_LABEL.logged_out} — ${eventTitle}`,
            className:
              'inline-flex items-center justify-center gap-2 ' +
              'h-11 px-5 rounded-lg ' +
              'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 ' +
              'text-black font-semibold text-sm ' +
              'shadow-lg shadow-amber-500/20 ' +
              'hover:brightness-110 hover:shadow-amber-500/40 ' +
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-500/60 ' +
              'transition-all ' +
              'min-h-[44px]',
          },
          h('span', { 'aria-hidden': 'true' }, '→'),
          RSVP_STATE_LABEL.logged_out
        )
      )
    );
  }

  // ============================================================================
  // RENDER: 3 botões de estado (going/maybe/declined)
  // ============================================================================
  const targets: ReadonlyArray<Exclude<RsvpState, null>> = ['going', 'maybe', 'declined'];

  // Show current state indicator se houver RSVP ativo
  const hasActiveRsvp = currentRsvp !== null;

  // Header row (tradição + capacidade)
  const capacityColorClass = capacityDisplay.isFull
    ? 'text-red-400'
    : capacityDisplay.remaining !== null && capacityDisplay.remaining <= 3
      ? 'text-amber-300'
      : 'text-slate-300';

  const headerRow = h(
    'div',
    { className: 'flex items-center justify-between gap-2 text-xs' },
    h(
      'span',
      { className: 'uppercase tracking-wider text-amber-400/80 font-medium' },
      `${traditionDisplay} · ${typeDisplay}`
    ),
    h(
      'span',
      {
        className: `font-medium tabular-nums ${capacityColorClass}`,
        'data-testid': `${id}-capacity`,
        'aria-label': `Capacidade: ${capacityDisplay.label}`,
      },
      capacityDisplay.label
    )
  );

  // Current state indicator (se houver RSVP ativo)
  const currentIndicator = hasActiveRsvp && currentRsvp
    ? h(
        'div',
        {
          'data-testid': `${id}-current-state`,
          className: 'flex items-center gap-2 text-sm',
          role: 'status',
        },
        h('span', { className: 'text-slate-400' }, 'Status atual:'),
        h(
          'span',
          {
            className:
              currentRsvp === 'going'
                ? 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                : currentRsvp === 'maybe'
                  ? 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                  : 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/40',
          },
          h(
            'span',
            { 'aria-hidden': 'true' },
            currentRsvp === 'going' ? '✓' : currentRsvp === 'maybe' ? '⌛' : '✕'
          ),
          RSVP_STATE_LABEL_ACTIVE[currentRsvp]
        )
      )
    : null;

  // Build each action button
  const buttons = targets.map((target) => {
    const availability = getButtonAvailability(currentRsvp, target, capacityDisplay, eventClosed);
    const isCurrent = availability === 'current';
    const isDisabled =
      availability === 'event_closed' ||
      availability === 'waitlist_required' ||
      (__testIsPending && pending === target);
    const isPending = pending === target;

    const baseClasses =
      'inline-flex items-center justify-center gap-2 ' +
      `min-h-[${MIN_TOUCH_TARGET_PX}px] px-4 py-2.5 rounded-lg ` +
      'text-sm font-medium ' +
      'transition-all ' +
      'focus-visible:outline-none focus-visible:ring-3 ' +
      'disabled:opacity-40 disabled:cursor-not-allowed';

    const variantClasses = isCurrent
      ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50 cursor-default'
      : target === 'going'
        ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-black font-semibold shadow-md shadow-amber-500/20 hover:brightness-110 hover:shadow-amber-500/40 focus-visible:ring-amber-500/60'
        : target === 'maybe'
          ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/20 hover:ring-amber-500/60 focus-visible:ring-amber-500/60'
          : 'bg-slate-700/40 text-slate-300 ring-1 ring-slate-600/40 hover:bg-slate-700/60 hover:text-slate-200 focus-visible:ring-slate-500/60';

    const label = isCurrent && currentRsvp
      ? `${RSVP_STATE_LABEL_ACTIVE[currentRsvp]} (selecionado)`
      : RSVP_STATE_LABEL[target];

    const ariaDesc =
      availability === 'event_closed'
        ? 'Inscrições fechadas'
        : availability === 'waitlist_required'
          ? 'Evento lotado — use lista de espera'
          : availability === 'current'
            ? 'Estado atual'
            : target === 'going' && capacityDisplay.remaining !== null && capacityDisplay.remaining > 0
              ? `${capacityDisplay.remaining} vagas restantes`
              : '';

    return h(
      'button',
      {
        key: target,
        type: 'button',
        'data-testid': `${id}-button-${target}`,
        'data-target': target,
        'data-availability': availability,
        'data-pending': isPending ? 'true' : 'false',
        onClick: () => {
          void handleClick(target);
        },
        disabled: isDisabled,
        'aria-label': `${label} — ${eventTitle}`,
        'aria-pressed': isCurrent,
        'aria-describedby': ariaDesc ? `${id}-desc-${target}` : undefined,
        className: `${baseClasses} ${variantClasses}`,
      },
      isPending
        ? h(
            'span',
            null,
            h('span', {
              className: 'inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin',
              'aria-hidden': 'true',
            }),
            'Enviando...'
          )
        : h(
            'span',
            null,
            h('span', { 'aria-hidden': 'true' }, target === 'going' ? '✓' : target === 'maybe' ? '⌛' : '✕'),
            label
          )
    );
  });

  // Hidden descriptions container
  const hiddenDescs = h(
    'div',
    { className: 'sr-only' },
    targets.map((t) =>
      h(
        'span',
        { key: `desc-${t}`, id: `${id}-desc-${t}` },
        t === 'going' && capacityDisplay.remaining !== null
          ? `${capacityDisplay.remaining} vagas restantes`
          : ''
      )
    )
  );

  // Live region for screen reader announcements
  const liveRegion = h(
    'div',
    {
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'data-testid': `${id}-live-region`,
      className: 'sr-only',
    },
    lastAnnouncement
  );

  // Mobile hint when full
  const mobileHint =
    capacityDisplay.isFull && currentRsvp !== 'maybe' && currentRsvp !== 'going'
      ? h(
          'p',
          {
            className: 'text-[11px] text-amber-300/80 sm:hidden',
            'data-testid': `${id}-mobile-hint`,
          },
          'Evento lotado. Use a lista de espera — entraremos em contato se abrir vaga.'
        )
      : null;

  return h(
    'fieldset',
    {
      'data-testid': id,
      'data-event-id': eventId,
      'data-current-rsvp': currentRsvp ?? 'none',
      'data-event-closed': eventClosed ? 'true' : 'false',
      'data-capacity-is-full': capacityDisplay.isFull ? 'true' : 'false',
      className: `rsvp-form rsvp-form--${variant} border border-slate-700/40 bg-slate-900/60 rounded-xl p-4 space-y-3 ${className}`,
      'aria-labelledby': `${id}-legend`,
    },
    h('legend', { id: `${id}-legend`, className: 'sr-only' }, groupLabel),
    headerRow,
    currentIndicator,
    h(
      'div',
      { role: 'group', 'aria-label': 'Ações de inscrição', className: 'grid grid-cols-1 sm:grid-cols-3 gap-2' },
      ...buttons
    ),
    hiddenDescs,
    liveRegion,
    mobileHint
  );
}

// ============================================================================
// DEFAULTS (exported for tests + barrel)
// ============================================================================

export { defaultRsvpState } from './RSVPForm.helpers.ts';
