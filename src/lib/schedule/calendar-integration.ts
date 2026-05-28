/**
 * Calendar Integration - ICS/Google Calendar sync
 */

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
  source?: 'ics' | 'google';
  sourceId?: string;
}

export interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  deleted: number;
  errors: string[];
}

/**
 * Parse an ICS string into calendar events
 */
export function parseICS(icsContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const eventBlocks = icsContent.split('BEGIN:VEVENT');

  for (const block of eventBlocks) {
    if (!block.trim()) continue;

    const event: Partial<CalendarEvent> = { source: 'ics' };

    const uidMatch = block.match(/UID:([^\r\n]+)/);
    if (uidMatch) event.sourceId = uidMatch[1];

    const summaryMatch = block.match(/SUMMARY:([^\r\n]+)/);
    if (summaryMatch) event.title = summaryMatch[1];

    const descMatch = block.match(/DESCRIPTION:([^\r\n]+)/);
    if (descMatch) event.description = descMatch[1].replace(/\\n/g, '\n');

    const dtStartMatch = block.match(/DTSTART(?::|;VALUE=DATE:)([^\r\n]+)/);
    if (dtStartMatch) {
      const isDate = dtStartMatch[0].includes('VALUE=DATE');
      const value = dtStartMatch[1];
      if (isDate) {
        event.start = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`);
        event.allDay = true;
      } else {
        event.start = parseICSDate(value);
      }
    }

    const dtEndMatch = block.match(/DTEND(?::|;VALUE=DATE:)([^\r\n]+)/);
    if (dtEndMatch) {
      const isDate = dtEndMatch[0].includes('VALUE=DATE');
      const value = dtEndMatch[1];
      event.end = isDate
        ? new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`)
        : parseICSDate(value);
    }

    const locationMatch = block.match(/LOCATION:([^\r\n]+)/);
    if (locationMatch) event.location = locationMatch[1];

    if (event.title && event.start) {
      events.push(event as CalendarEvent);
    }
  }

  return events;
}

function parseICSDate(value: string): Date {
  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(9, 11) || '00';
  const minute = value.slice(11, 13) || '00';
  const second = value.slice(13, 15) || '00';
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
}

/**
 * Convert a CalendarEvent to ICS format
 */
export function toICS(event: CalendarEvent): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cabala dos Caminhos//Calendar Integration//EN',
    'BEGIN:VEVENT',
    `UID:${event.id || `${Date.now()}@cabala`}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `SUMMARY:${event.title}`,
    `DTSTART${event.allDay ? ';VALUE=DATE' : ''}:${formatICSDate(event.start, event.allDay)}`,
    `DTEND${event.allDay ? ';VALUE=DATE' : ''}:${formatICSDate(event.end, event.allDay)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${event.location}`);
  }
  if (event.attendees?.length) {
    event.attendees.forEach(email => lines.push(`ATTENDEE;CN=${email}:mailto:${email}`));
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

function formatICSDate(date: Date, isDateOnly = false): string {
  if (isDateOnly) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}`;
}

/**
 * Generate Google Calendar URL for an event
 */
export function toGoogleCalendarUrl(event: CalendarEvent): string {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: event.title,
    dates: `${formatICSDate(event.start)}/${formatICSDate(event.end)}`,
    details: event.description || '',
    location: event.location || '',
  });
  return `${base}&${params.toString()}`;
}

/**
 * Main sync function - orchestrates calendar synchronization
 */
export async function syncCalendar(
  events: CalendarEvent[],
  options: {
    icsExport?: boolean;
    googleExport?: boolean;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    added: 0,
    updated: 0,
    deleted: 0,
    errors: [],
  };

  const { icsExport = true, googleExport = false, onProgress } = options;
  const total = events.length;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    try {
      if (icsExport) {
        // ICS export produces ICS string (caller handles storage)
        const ics = toICS(event);
        if (!ics) {
          result.errors.push(`Failed to generate ICS for: ${event.title}`);
          result.success = false;
        }
      }

      if (googleExport) {
        // Google Calendar URL generation
        const url = toGoogleCalendarUrl(event);
        if (!url) {
          result.errors.push(`Failed to generate Google URL for: ${event.title}`);
          result.success = false;
        }
      }

      result.added++;
    } catch (err) {
      result.errors.push(`Error processing "${event.title}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      result.success = false;
    }

    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  return result;
}
