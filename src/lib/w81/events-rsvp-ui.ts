// ============================================================================
// W81-B — events-rsvp-ui (React UI)
// ----------------------------------------------------------------------------
// Components for the events RSVP flow. Pure presentational — every action is
// a callback prop, every state transition goes through the engine.
//
// Exports:
//   - RSVPButton:    primary CTA (idle → submitting → confirmed/waitlisted)
//   - WaitlistIndicator: "você é o nº N na lista"
//   - CapacityMeter: visual seat counter
//   - ConfirmationToast: ARIA-live region for screen readers
//   - EventsRsvpCard:  composer (combines all four)
//
// Design rules:
//   - 44px min touch targets (mobile-first)
//   - ARIA labels everywhere
//   - aria-live="polite" for the toast
//   - Every component is a pure function of (props) → vnode
// ============================================================================

import type {
  CapacitySnapshot,
  CapacityView,
  EventId,
  RsvpId,
  RsvpPhase,
  RsvpRecord,
  TraditionCode,
  TraditionKindLabel,
  UserId,
} from './events-rsvp-engine.ts';
import {
  a11yAnnounceFor,
  ctaLabelFor,
  computeCapacity,
  labelsForTradition,
} from './events-rsvp-engine.ts';
import { Fragment, createElement as h, useId, useState } from 'react';

// ============================================================================
// Shared types (component props)
// ============================================================================

export interface RSVPButtonProps {
  readonly record: RsvpRecord;
  readonly isFree: boolean;
  readonly disabled?: boolean;
  readonly onSubmit: (record: RsvpRecord) => void;
  readonly onCancel: (record: RsvpRecord) => void;
  readonly labelId?: string;
}

export interface WaitlistIndicatorProps {
  readonly position: number | null;
  readonly total: number;
  readonly promoted: boolean;
}

export interface CapacityMeterProps {
  readonly view: CapacityView;
  readonly labelId?: string;
}

export interface ConfirmationToastProps {
  readonly phase: RsvpPhase;
  readonly detail?: string;
  readonly liveRegionId?: string;
}

export interface EventsRsvpCardProps {
  readonly eventId: EventId;
  readonly userId: UserId;
  readonly record: RsvpRecord;
  readonly capacity: CapacitySnapshot;
  readonly isFree: boolean;
  readonly tradition: TraditionCode;
  readonly label: TraditionKindLabel;
  readonly title: string;
  readonly startsAt: string;
  readonly promotedFromWaitlist: boolean;
  readonly onSubmit: (record: RsvpRecord) => void;
  readonly onCancel: (record: RsvpRecord) => void;
}

// ============================================================================
// RSVPButton — primary CTA
// ============================================================================

export function RSVPButton(props: RSVPButtonProps): JSX.Element {
  const { record, isFree, disabled = false, onSubmit, onCancel, labelId } = props;
  const phase = record.phase;
  const isInteractive = !disabled && (phase === 'idle' || phase === 'rejected' || phase === 'confirmed' || phase === 'waitlisted');
  const ariaDisabled = disabled || phase === 'submitting' || phase === 'cancelling';
  const ariaLabel = ctaLabelFor(phase, isFree);

  const handler = () => {
    if (phase === 'idle' || phase === 'rejected') onSubmit(record);
    else if (phase === 'confirmed' || phase === 'waitlisted') onCancel(record);
  };

  const variant =
    phase === 'confirmed'
      ? 'rsvp-btn--confirmed'
      : phase === 'waitlisted'
        ? 'rsvp-btn--waitlisted'
        : phase === 'rejected'
          ? 'rsvp-btn--rejected'
          : 'rsvp-btn--idle';

  return h(
    'button',
    {
      type: 'button',
      className: `rsvp-btn rsvp-btn--lg ${variant}`,
      'data-testid': 'rsvp-button',
      'data-phase': phase,
      'aria-disabled': ariaDisabled,
      'aria-busy': phase === 'submitting' || phase === 'cancelling',
      'aria-describedby': labelId ?? undefined,
      onClick: isInteractive ? handler : undefined,
      disabled: ariaDisabled,
      style: {
        minHeight: '44px',
        minWidth: '44px',
        padding: '12px 20px',
        fontSize: '16px',
        fontWeight: 600,
        borderRadius: '8px',
        border: phase === 'confirmed' ? '2px solid #15803d' : '1px solid #1f2937',
        background:
          phase === 'confirmed'
            ? '#dcfce7'
            : phase === 'waitlisted'
              ? '#fef9c3'
              : phase === 'rejected'
                ? '#fee2e2'
                : '#1f2937',
        color:
          phase === 'confirmed' || phase === 'waitlisted' || phase === 'rejected'
            ? '#1f2937'
            : '#ffffff',
        cursor: isInteractive ? 'pointer' : 'not-allowed',
        opacity: ariaDisabled ? 0.6 : 1,
        transition: 'all 200ms ease',
      },
    },
    ariaLabel,
  );
}

// ============================================================================
// WaitlistIndicator
// ============================================================================

export function WaitlistIndicator(props: WaitlistIndicatorProps): JSX.Element | null {
  const { position, total, promoted } = props;
  if (position === null && !promoted) return null;

  if (promoted) {
    return h(
      'div',
      {
        role: 'status',
        'aria-live': 'polite',
        'data-testid': 'waitlist-promoted',
        className: 'waitlist-indicator waitlist-indicator--promoted',
        style: {
          padding: '12px 16px',
          borderRadius: '8px',
          background: '#dcfce7',
          color: '#15803d',
          fontSize: '15px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minHeight: '44px',
        },
      },
      h('span', { 'aria-hidden': true }, '🎉'),
      'Boa! Uma vaga abriu e você foi promovido(a) da lista de espera.',
    );
  }

  const text =
    position === 1
      ? `Voce e o proximo na lista de espera${total > 0 ? ` (${total} pessoas no total)` : ''}.`
      : `Voce e o no ${position} na lista de espera (${total} pessoas no total).`;

  return h(
    'div',
    {
      role: 'status',
      'aria-live': 'polite',
      'data-testid': 'waitlist-indicator',
      'data-position': position,
      className: 'waitlist-indicator',
      style: {
        padding: '12px 16px',
        borderRadius: '8px',
        background: '#fef9c3',
        color: '#854d0e',
        fontSize: '15px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minHeight: '44px',
      },
    },
    h('span', { 'aria-hidden': true }, '⏳'),
    text,
  );
}

// ============================================================================
// CapacityMeter
// ============================================================================

export function CapacityMeter(props: CapacityMeterProps): JSX.Element {
  const { view, labelId } = props;
  const unlimited = view.isUnlimited;

  const labelText = unlimited
    ? 'Vagas ilimitadas'
    : view.status === 'full'
      ? `Evento lotado — ${view.waitlistSize} na lista de espera`
      : view.status === 'last_seats'
        ? `Últimas ${view.seatsFree} vagas!`
        : `${view.seatsFree} de ${view.seatsTotal} vagas livres`;

  return h(
    'div',
    {
      className: 'capacity-meter',
      'data-testid': 'capacity-meter',
      'data-status': view.status,
      role: 'group',
      'aria-labelledby': labelId,
      style: {
        padding: '12px 16px',
        borderRadius: '8px',
        background: view.status === 'full' ? '#fee2e2' : '#f3f4f6',
        marginBottom: '12px',
      },
    },
    h(
      'div',
      {
        id: labelId,
        style: {
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: unlimited ? 0 : '8px',
          color: view.status === 'full' ? '#991b1b' : '#1f2937',
        },
      },
      labelText,
    ),
    unlimited
      ? h('div', {
          'aria-hidden': true,
          style: { fontSize: '12px', color: '#6b7280' },
        },
          '\u221E vagas',
        )
      : h(
          'div',
          {
            role: 'progressbar',
            'aria-valuemin': 0,
            'aria-valuemax': view.seatsTotal,
            'aria-valuenow': view.seatsTaken,
            'aria-label': labelText,
            style: {
              width: '100%',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
            },
          },
          h('div', {
            'aria-hidden': true,
            style: {
              width: `${view.percentFull}%`,
              height: '100%',
              background:
                view.status === 'full'
                  ? '#dc2626'
                  : view.status === 'last_seats'
                    ? '#f59e0b'
                    : '#10b981',
              transition: 'width 300ms ease',
            },
          }),
        ),
  );
}

// ============================================================================
// ConfirmationToast — aria-live region
// ============================================================================

export function ConfirmationToast(props: ConfirmationToastProps): JSX.Element {
  const { phase, detail, liveRegionId } = props;
  const announce = a11yAnnounceFor(phase);

  if (!announce) {
    return h('div', {
      id: liveRegionId,
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': true,
      'data-testid': 'confirmation-toast',
      'data-phase': phase,
      style: { position: 'absolute', left: '-9999px' },
    });
  }

  return h(
    'div',
    {
      id: liveRegionId,
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': true,
      'data-testid': 'confirmation-toast',
      'data-phase': phase,
      className: `confirmation-toast confirmation-toast--${phase}`,
      style: {
        padding: '12px 16px',
        borderRadius: '8px',
        marginTop: '12px',
        background:
          phase === 'confirmed'
            ? '#dcfce7'
            : phase === 'waitlisted'
              ? '#fef9c3'
              : phase === 'rejected'
                ? '#fee2e2'
                : '#f3f4f6',
        color: '#1f2937',
        fontSize: '14px',
        minHeight: '44px',
      },
    },
    h('strong', { style: { marginRight: '6px' } }, announce),
    detail ? h('span', null, detail) : null,
  );
}

// ============================================================================
// EventsRsvpCard — composer
// ============================================================================

export function EventsRsvpCard(props: EventsRsvpCardProps): JSX.Element {
  const {
    eventId,
    userId,
    record,
    capacity,
    isFree,
    tradition,
    label,
    title,
    startsAt,
    promotedFromWaitlist,
    onSubmit,
    onCancel,
  } = props;

  const liveRegionId = useId();
  const labelId = useId();
  const view = computeCapacity(capacity);
  const position = record.phase === 'waitlisted' ? record.waitlistPosition : null;

  // Header — tradition icon + kind label
  const header = h(
    'div',
    {
      className: 'rsvp-card-header',
      style: { marginBottom: '12px' },
    },
    h(
      'div',
      {
        'aria-hidden': true,
        style: {
          fontSize: '32px',
          lineHeight: 1,
          marginBottom: '4px',
        },
      },
      label.iconHint,
    ),
    h(
      'div',
      {
        style: {
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#6b7280',
          fontWeight: 600,
        },
      },
      `${label.label} · ${tradition}`,
    ),
    h(
      'h3',
      {
        style: { fontSize: '18px', fontWeight: 700, margin: '4px 0 0', color: '#1f2937' },
      },
      title,
    ),
    h(
      'div',
      {
        style: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
      },
      formatStartTime(startsAt),
    ),
  );

  // Capacity meter
  const meter = h(CapacityMeter, { view, labelId });

  // Waitlist indicator (shown only when waitlisted or just promoted)
  const waitlist =
    record.phase === 'waitlisted' || promotedFromWaitlist
      ? h(WaitlistIndicator, {
          position,
          total: view.waitlistSize,
          promoted: promotedFromWaitlist,
        })
      : null;

  // RSVP CTA
  const cta = h(RSVPButton, {
    record,
    isFree,
    labelId,
    onSubmit,
    onCancel,
  });

  // Toast
  const toast = h(ConfirmationToast, {
    phase: record.phase,
    detail: `Inscrição ${record.id} (${record.phase})`,
    liveRegionId,
  });

  return h(
    'article',
    {
      className: 'events-rsvp-card',
      'data-testid': 'events-rsvp-card',
      'data-event-id': eventId,
      'data-user-id': userId,
      'data-tradition': tradition,
      'data-kind': label.kind,
      'aria-labelledby': labelId,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        maxWidth: '420px',
      },
    },
    header,
    meter,
    waitlist,
    cta,
    toast,
  );
}

// ============================================================================
// Helper — formatted start time (PT-BR, short)
// ============================================================================

function formatStartTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${day} · ${time}`;
  } catch {
    return iso;
  }
}

// ============================================================================
// Re-export for callers
// ============================================================================

export { TRADITION_KIND_LABELS, labelFor, labelsForTradition } from './events-rsvp-engine.ts';
export type {
  CapacitySnapshot,
  CapacityView,
  EventId,
  RsvpId,
  RsvpPhase,
  RsvpRecord,
  TraditionCode,
  TraditionKindLabel,
  UserId,
};