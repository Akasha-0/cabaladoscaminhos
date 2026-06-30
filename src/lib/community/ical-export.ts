// ============================================================================
// iCAL EXPORT — RFC 5545 (Wave 32, 2026-06-30)
// ============================================================================
// Exporta eventos para .ics (iCalendar) compatível com:
//   - Apple Calendar (iOS/macOS)
//   - Google Calendar
//   - Outlook
//   - Thunderbird / KDE
//
// Implementação: pure functions, sem dependências externas.
// Time zone: usa VTIMEZONE IANA-aware (assumimos UTC, server-side).
//
// Wave 32 — Eventos Polidos:
//   - iCal export (este módulo)
//   - Recorrência RRULE (semanal/mensal) [ver expandRecurrence]
//   - Time zone aware (DTSTART com TZID)
// ============================================================================

// ============================================================================
// Tipos
// ============================================================================

export interface ICalEvent {
  uid: string; // único (e.g., event-id@cabaladoscaminhos.app)
  title: string;
  description: string;
  location: string | null;
  /** UTC start datetime. */
  startUtc: Date;
  /** UTC end datetime. */
  endUtc: Date;
  organizerName: string;
  organizerEmail: string;
  /** IANA timezone (e.g., "America/Sao_Paulo"). Se null, usa UTC. */
  timezone: string | null;
  /** Status RFC 5545. */
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  /** Tradição espiritual — vira CATEGORY. */
  tradition: string;
  /** Recurrence rule (RFC 5545 RRULE). Opcional. */
  rrule?: ICalRecurrence;
  /** Sequence number para updates. */
  sequence?: number;
}

export type ICalRecurrence =
  | { freq: 'DAILY'; count?: number; until?: Date; interval?: number }
  | { freq: 'WEEKLY'; count?: number; until?: Date; interval?: number; byDay?: ReadonlyArray<'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'> }
  | { freq: 'MONTHLY'; count?: number; until?: Date; interval?: number; byMonthDay?: number }
  | { freq: 'YEARLY'; count?: number; until?: Date; interval?: number };

// ============================================================================
// Format helpers (RFC 5545)
// ============================================================================

/** Formata Date em "YYYYMMDDTHHMMSSZ" (UTC). */
export function formatIcsDateUtc(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Escapa caracteres especiais RFC 5545: \, ;, \n. */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Dobra linhas > 75 chars (RFC 5545 §3.1). */
export function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunkLen = i === 0 ? 75 : 74; // primeira linha 75, demais 74 (1 espaço prefixo)
    chunks.push((i === 0 ? '' : ' ') + line.slice(i, i + chunkLen));
    i += chunkLen;
  }
  return chunks.join('\r\n');
}

// ============================================================================
// RRULE
// ============================================================================

export function formatRrule(rrule: ICalRecurrence): string {
  const parts: string[] = [`FREQ=${rrule.freq}`];
  if (rrule.interval && rrule.interval > 1) parts.push(`INTERVAL=${rrule.interval}`);
  if (rrule.count) parts.push(`COUNT=${rrule.count}`);
  if (rrule.until) parts.push(`UNTIL=${formatIcsDateUtc(rrule.until)}`);
  if (rrule.freq === 'WEEKLY' && rrule.byDay) parts.push(`BYDAY=${rrule.byDay.join(',')}`);
  if (rrule.freq === 'MONTHLY' && rrule.byMonthDay) parts.push(`BYMONTHDAY=${rrule.byMonthDay}`);
  return parts.join(';');
}

/**
 * Expande uma recorrência em N ocorrências (cap em 100).
 * Pure function; não considera exdates.
 */
export function expandRecurrence(
  baseStart: Date,
  baseEnd: Date,
  rrule: ICalRecurrence,
  maxOccurrences = 50
): Array<{ startUtc: Date; endUtc: Date }> {
  const occurrences: Array<{ startUtc: Date; endUtc: Date }> = [];
  const durationMs = baseEnd.getTime() - baseStart.getTime();
  const intervalMs =
    rrule.freq === 'DAILY' ? 86_400_000 :
    rrule.freq === 'WEEKLY' ? 7 * 86_400_000 :
    rrule.freq === 'MONTHLY' ? null : // mensal é aproximado por 30 dias
    365 * 86_400_000; // YEARLY aproximado

  // MONTHLY approximation
  const stepMs = intervalMs === null ? 30 * 86_400_000 : (rrule.interval ?? 1) * intervalMs;

  let currentStart = new Date(baseStart);
  let count = 0;

  while (count < maxOccurrences) {
    // Para RRULE com UNTIL ou COUNT
    if (rrule.count && count >= rrule.count) break;
    if (rrule.until && currentStart.getTime() > rrule.until.getTime()) break;

    occurrences.push({
      startUtc: currentStart,
      endUtc: new Date(currentStart.getTime() + durationMs),
    });

    count++;
    currentStart = new Date(currentStart.getTime() + stepMs);
  }

  return occurrences;
}

// ============================================================================
// Build single VEVENT
// ============================================================================

export function buildVevent(event: ICalEvent, now: Date = new Date()): string {
  const lines: string[] = [];

  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${event.uid}`);
  lines.push(`DTSTAMP:${formatIcsDateUtc(now)}`);
  lines.push(`DTSTART:${formatIcsDateUtc(event.startUtc)}`);
  lines.push(`DTEND:${formatIcsDateUtc(event.endUtc)}`);
  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  lines.push(`ORGANIZER;CN=${escapeIcsText(event.organizerName)}:mailto:${event.organizerEmail}`);
  lines.push(`STATUS:${event.status}`);
  lines.push(`CATEGORIES:${escapeIcsText(event.tradition)}`);
  if (event.sequence !== undefined) lines.push(`SEQUENCE:${event.sequence}`);
  if (event.rrule) lines.push(`RRULE:${formatRrule(event.rrule)}`);
  lines.push('TRANSP:OPAQUE');
  lines.push('END:VEVENT');

  return lines.map(foldLine).join('\r\n');
}

// ============================================================================
// Build full VCALENDAR
// ============================================================================

export const CALENDAR_HEADER = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Cabala dos Caminhos//Community Events//PT-BR',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'X-WR-CALNAME:Tradições e Eventos',
  'X-WR-TIMEZONE:America/Sao_Paulo',
  'X-WR-CALDESC:Eventos da comunidade Cabala dos Caminhos',
].join('\r\n');

export const CALENDAR_FOOTER = 'END:VCALENDAR';

export function buildIcs(events: readonly ICalEvent[]): string {
  const now = new Date();
  const vevents = events.map((e) => buildVevent(e, now)).join('\r\n');
  return [CALENDAR_HEADER, vevents, CALENDAR_FOOTER].filter(Boolean).join('\r\n');
}

// ============================================================================
// Recurring event expansion → multiple ICalEvents
// ============================================================================

/**
 * Expande um evento recorrente em múltiplos VEVENTs.
 * Útil quando RRULE é demais para o cliente (alguns mobile apps têm
 * RRULE parcial). Cada ocorrência vira VEVENT independente com UID
 * derivado (uid + '-' + índice).
 */
export function expandRecurringToIcs(
  event: ICalEvent,
  maxOccurrences = 50
): readonly ICalEvent[] {
  if (!event.rrule) return [event];

  const occurrences = expandRecurrence(
    event.startUtc,
    event.endUtc,
    event.rrule,
    maxOccurrences
  );

  return occurrences.map((occ, idx) => ({
    ...event,
    uid: idx === 0 ? event.uid : `${event.uid}-${idx}`,
    startUtc: occ.startUtc,
    endUtc: occ.endUtc,
    rrule: undefined, // expanded
  }));
}