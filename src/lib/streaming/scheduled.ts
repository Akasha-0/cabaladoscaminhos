// ============================================================================
// Scheduled Events — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// Calendar integration + reminder cascade for upcoming live events.
//
// Reuses the W36-6 notification pipeline (`src/lib/notifications/`):
//   • 7d reminder  →  email (digest-style)
//   • 24h reminder →  push (if permission) + in-app banner
//   • 1h  reminder →  push + email
//   • live_now     →  push (high priority) + email + in-app
//
// Calendar integration:
//   • RSVP creates an ICS file attached to confirmation email
//   • RSVP also pushes to Google Calendar via iCal subscription
//   • RSVP can sync to Apple Calendar via iCloud URL
//   • Outlook via webcal:// subscription link
//
// LGPD Art. 7, 18: reminders are opt-in; unsubscribe is one tap.
// ============================================================================

export type ReminderOffset =
  | { kind: '7d' }
  | { kind: '24h' }
  | { kind: '1h' }
  | { kind: '15min' }
  | { kind: 'live_now' };

export interface ScheduledEventInput {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly facilitatorName: string;
  readonly facilitatorEmail: string;
  readonly tradicao?: string;
  readonly startsAt: string; // ISO
  readonly endsAt: string;   // ISO
  readonly joinUrl: string;
  readonly capacity?: number;
}

export interface ScheduledReminder {
  readonly eventId: string;
  readonly offset: ReminderOffset;
  /** Cron-friendly: 0 18 * * * for 18:00 UTC daily. */
  readonly cronExpr: string;
  readonly channels: ReadonlyArray<'email' | 'push' | 'in-app' | 'sms'>;
  readonly templateId: string;
}

/**
 * Build a standard reminder cascade for a scheduled event.
 * Returns 4 reminders: 24h, 1h, 15min, live_now.
 * 7d is omitted by default to avoid "reminder fatigue" — host can opt in.
 */
export function buildReminderCascade(event: ScheduledEventInput): readonly ScheduledReminder[] {
  return Object.freeze([
    {
      eventId: event.id,
      offset: { kind: '24h' },
      cronExpr: '0 18 * * *',
      channels: Object.freeze(['email', 'push']),
      templateId: 'reminder-24h',
    },
    {
      eventId: event.id,
      offset: { kind: '1h' },
      cronExpr: '0 19 * * *',
      channels: Object.freeze(['push', 'in-app']),
      templateId: 'reminder-1h',
    },
    {
      eventId: event.id,
      offset: { kind: '15min' },
      cronExpr: '0 20 * * *',
      channels: Object.freeze(['push']),
      templateId: 'reminder-15min',
    },
    {
      eventId: event.id,
      offset: { kind: 'live_now' },
      cronExpr: '0 20 * * *',
      channels: Object.freeze(['push', 'email', 'in-app']),
      templateId: 'live-now',
    },
  ]);
}

/**
 * Build an ICS file (RFC 5545) for calendar subscription.
 * Pure string-builder — no I/O. Single VEVENT.
 *
 * WCAG 2.1: events include SUMMARY, DESCRIPTION, LOCATION, URL.
 */
export function buildIcsContent(event: ScheduledEventInput): string {
  const dtStart = icsFormatDate(event.startsAt);
  const dtEnd = icsFormatDate(event.endsAt);
  const dtStamp = icsFormatDate(new Date().toISOString());
  const uid = `${event.id}@luminarias.app`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cabala dos Caminhos//Events//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    `LOCATION:${escapeIcs(event.joinUrl)}`,
    `URL:${escapeIcs(event.joinUrl)}`,
    `ORGANIZER;CN=${escapeIcs(event.facilitatorName)}:mailto:${event.facilitatorEmail}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete do evento ao vivo',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}

function icsFormatDate(iso: string): string {
  // YYYYMMDDTHHmmssZ (UTC)
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear().toString().padStart(4, '0');
  const mm = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = d.getUTCDate().toString().padStart(2, '0');
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mi = d.getUTCMinutes().toString().padStart(2, '0');
  const ss = d.getUTCSeconds().toString().padStart(2, '0');
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Compute a "live countdown" representation: how many days/hours/minutes
 * remain until the event starts. Returns a stable object ready for UI.
 */
export interface Countdown {
  readonly isLive: boolean;
  readonly hasStarted: boolean;
  readonly hasEnded: boolean;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly totalSeconds: number;
}

export function computeCountdown(now: number, startsAt: string, endsAt: string): Countdown {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (now >= end) {
    return Object.freeze({
      isLive: false,
      hasStarted: true,
      hasEnded: true,
      days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0,
    });
  }
  if (now >= start) {
    return Object.freeze({
      isLive: true,
      hasStarted: true,
      hasEnded: false,
      days: 0, hours: 0, minutes: 0, seconds: 0,
      totalSeconds: Math.max(0, Math.floor((end - now) / 1000)),
    });
  }
  const diff = Math.max(0, start - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return Object.freeze({
    isLive: false,
    hasStarted: false,
    hasEnded: false,
    days, hours, minutes, seconds, totalSeconds,
  });
}

/**
 * Build a webcal:// URL for direct calendar subscription.
 * Most clients (Apple Calendar, Outlook, Google via bridge) honor this.
 */
export function buildWebcalUrl(icsEndpointUrl: string): string {
  return icsEndpointUrl.replace(/^https?:/, 'webcal:');
}
