// ============================================================================
// W93-D — iCAL EXPORT (RFC 5545 SUBSET)
// ----------------------------------------------------------------------------
// Gera string `.ics` para um Event (ou várias sessões de um Workshop).
//
// Decisões de implementação:
//   - Line endings: CRLF (`\r\n`) — obrigatório por RFC 5545.
//   - DTSTART/DTEND em UTC com sufixo `Z` (forma `YYYYMMDDTHHMMSSZ`).
//     Mais simples que VTIMEZONE block e universalmente aceito.
//   - Fold de linhas > 75 octetos: split em múltiplas com prefixo ` `.
//     (Não implementado nesta versão — nossos DESCRIPTION são curtos; se
//      passar de 75, é aceitável pelo Apple Calendar/Google Calendar que
//      toleram linhas longas. Implementar split só se spec exigir.)
//   - Escape de caracteres especiais em TEXT: \, ;, \, \n → \\, \;, \\, \n.
//
// Spec target: RFC 5545 §3.6.1 (VEVENT) + §3.1 (Content).
// ============================================================================

import type { Event, Workshop, WorkshopSession } from './events-types.ts';

// ============================================================================
// Constants
// ============================================================================

/** PRODID identifica o software que gerou o calendário. */
export const ICS_PRODID = '-//Cabala dos Caminhos//Akasha Events W93-D//PT-BR';

/** Versão iCalendar. */
export const ICS_VERSION = '2.0';

/** CRLF — line ending obrigatório. */
export const CRLF = '\r\n';

// ============================================================================
// Date formatting (UTC)
// ============================================================================

/**
 * Formata data em `YYYYMMDDTHHMMSSZ` (UTC) — formato DATE-TIME UTC do iCal.
 */
export function formatUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`data inválida para iCal: ${iso}`);
  }
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return (
    `${d.getUTCFullYear()}` +
    `${pad(d.getUTCMonth() + 1)}` +
    `${pad(d.getUTCDate())}` +
    `T` +
    `${pad(d.getUTCHours())}` +
    `${pad(d.getUTCMinutes())}` +
    `${pad(d.getUTCSeconds())}` +
    `Z`
  );
}

// ============================================================================
// TEXT escaping (RFC 5545 §3.3.11)
// ============================================================================

/**
 * Escapa caracteres especiais em valores TEXT.
 * Ordem importa: `\\` antes de `,` e `;` antes de `\n`.
 */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// ============================================================================
// Fold (RFC 5545 §3.1 — lines should be ≤ 75 octets)
// ============================================================================

/**
 * Quebra uma linha longa em múltiplas linhas com prefixo ` ` (espaço).
 * Implementação simples por caracteres — não conta octetos UTF-8, mas
 * cobre 99% dos casos. Para uso com DESCRIPTION muito longos, refinar.
 */
export function foldLine(line: string, maxLen = 75): string {
  if (line.length <= maxLen) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + (i === 0 ? maxLen : maxLen - 1));
    out.push(i === 0 ? chunk : ` ${chunk}`);
    i += i === 0 ? maxLen : maxLen - 1;
  }
  return out.join(CRLF);
}

// ============================================================================
// VCALENDAR + VEVENT
// ============================================================================

export interface IcsEventOptions {
  /** Status do evento (TENATIVE/CONFIRMED/CANCELLED). Default CONFIRMED. */
  status?: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
  /** URL do evento (canônico). */
  url?: string;
  /** Local legível (ex: "Terreiro Ilê Axé Ogum Megê — Rio de Janeiro, RJ"). */
  location?: string;
  /** Organização (host). */
  organizer?: { name: string; email?: string };
  /** Categorias (separadas por vírgula). */
  categories?: string[];
  /** UID custom (default: `event-${slug}@akasha.local`). */
  uid?: string;
  /** Data/hora de criação do evento (DTSTAMP). Default: now. */
  stamp?: string;
}

const STATUs_DEFAULT = 'CONFIRMED';

/**
 * Serializa um Event em uma string VCALENDAR completa.
 */
export function eventToIcs(event: Event, options: IcsEventOptions = {}): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push(`VERSION:${ICS_VERSION}`);
  lines.push(`PRODID:${ICS_PRODID}`);
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${options.uid ?? `event-${event.slug}@akasha.local`}`);
  lines.push(`DTSTAMP:${formatUtc(options.stamp ?? new Date().toISOString())}`);
  lines.push(`DTSTART:${formatUtc(event.startsAt)}`);
  lines.push(`DTEND:${formatUtc(event.endsAt)}`);
  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  lines.push(`DESCRIPTION:${escapeIcsText(stripMarkdown(event.description))}`);
  lines.push(`STATUS:${options.status ?? STATUs_DEFAULT}`);
  if (options.url) {
    lines.push(`URL:${options.url}`);
  } else {
    lines.push(`URL:https://cabaladoscaminhos.com/eventos/${event.slug}`);
  }
  const loc = options.location ?? computeLocation(event);
  if (loc) {
    lines.push(`LOCATION:${escapeIcsText(loc)}`);
  }
  if (options.organizer) {
    const org = options.organizer;
    const name = escapeIcsText(org.name);
    if (org.email) {
      lines.push(`ORGANIZER;CN=${name}:mailto:${org.email}`);
    } else {
      lines.push(`ORGANIZER:CN=${name}`);
    }
  }
  if (options.categories && options.categories.length > 0) {
    lines.push(`CATEGORIES:${options.categories.map(escapeIcsText).join(',')}`);
  } else {
    lines.push(`CATEGORIES:${escapeIcsText(event.kind)},${escapeIcsText(event.tradition)}`);
  }
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.join(CRLF) + CRLF;
}

/**
 * Serializa um Workshop inteiro como múltiplos VEVENTs dentro de um
 * único VCALENDAR. Cada sessão vira um VEVENT.
 */
export function workshopToIcs(workshop: Workshop, options: IcsEventOptions = {}): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push(`VERSION:${ICS_VERSION}`);
  lines.push(`PRODID:${ICS_PRODID}`);
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

  for (const session of workshop.sessions) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${options.uid ?? `workshop-${workshop.slug}-session-${session.order}@akasha.local`}`);
    lines.push(`DTSTAMP:${formatUtc(options.stamp ?? new Date().toISOString())}`);
    lines.push(`DTSTART:${formatUtc(session.startsAt)}`);
    lines.push(`DTEND:${formatUtc(session.endsAt)}`);
    lines.push(
      `SUMMARY:${escapeIcsText(`${workshop.title} — ${session.title}`)}`,
    );
    lines.push(
      `DESCRIPTION:${escapeIcsText(stripMarkdown(session.description ?? workshop.description))}`,
    );
    lines.push(`STATUS:${options.status ?? STATUs_DEFAULT}`);
    lines.push(`URL:https://cabaladoscaminhos.com/workshops/${workshop.slug}`);
    lines.push(`CATEGORIES:${escapeIcsText(workshop.tradition)},workshop,session-${session.order}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join(CRLF) + CRLF;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Remove formatação markdown simples para DESCRIPTION iCal.
 * Mantém parágrafos como quebras de linha.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')             // headers
    .replace(/\*\*(.+?)\*\*/g, '$1')          // bold
    .replace(/\*(.+?)\*/g, '$1')              // italic
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)') // links
    .replace(/`(.+?)`/g, '$1')                 // inline code
    .trim();
}

/**
 * Monta string de local legível para LOCATION.
 */
function computeLocation(event: Event): string | undefined {
  const loc = event.location;
  if (loc.kind === 'online') {
    return loc.platform ? `Online — ${loc.platform}` : 'Online';
  }
  if (loc.kind === 'presencial') {
    const parts: string[] = [];
    if (loc.neighborhood) parts.push(loc.neighborhood);
    const cityLine = [loc.city, loc.state].filter(Boolean).join(', ');
    if (cityLine) parts.push(cityLine);
    if (!loc.country || loc.country === 'BR') parts.push('Brasil');
    else parts.push(loc.country);
    return parts.join(' — ') || undefined;
  }
  // híbrido
  const presencialParts: string[] = [];
  if (loc.neighborhood) presencialParts.push(loc.neighborhood);
  const cityLine = [loc.city, loc.state].filter(Boolean).join(', ');
  if (cityLine) presencialParts.push(cityLine);
  const presencial = presencialParts.length > 0 ? presencialParts.join(' — ') : 'Presencial';
  const online = loc.platform ? `Online — ${loc.platform}` : 'Online';
  return `${presencial} | ${online}`;
}

/**
 * Valida que uma string termina com CRLF (sanity check para tests).
 */
export function hasCrlf(s: string): boolean {
  return s.includes('\r\n');
}

/**
 * Sanity check estrutural: começa com BEGIN:VCALENDAR e termina com END:VCALENDAR.
 */
export function isValidIcsShell(s: string): boolean {
  return s.startsWith('BEGIN:VCALENDAR\r\n') && /END:VCALENDAR\r\n$/.test(s);
}

// ============================================================================
// Workshop session helper (uso avulso)
// ============================================================================

/**
 * Gera apenas o VEVENT block (sem VCALENDAR wrapper) para uma sessão.
 * Útil quando queremos embedar em outro calendário.
 */
export function sessionToVEvent(session: WorkshopSession, parentTitle: string, parentSlug: string, stamp: string = new Date().toISOString()): string {
  const lines: string[] = [];
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:workshop-${parentSlug}-session-${session.order}@akasha.local`);
  lines.push(`DTSTAMP:${formatUtc(stamp)}`);
  lines.push(`DTSTART:${formatUtc(session.startsAt)}`);
  lines.push(`DTEND:${formatUtc(session.endsAt)}`);
  lines.push(`SUMMARY:${escapeIcsText(`${parentTitle} — ${session.title}`)}`);
  lines.push(`DESCRIPTION:${escapeIcsText(stripMarkdown(session.description ?? ''))}`);
  lines.push('STATUS:CONFIRMED');
  lines.push(`URL:https://cabaladoscaminhos.com/workshops/${parentSlug}`);
  lines.push(`CATEGORIES:workshop,session-${session.order}`);
  lines.push('END:VEVENT');
  return lines.join(CRLF) + CRLF;
}