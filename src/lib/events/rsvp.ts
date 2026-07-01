// ============================================================================
// RSVP SYSTEM — Wave 35 (CommunityEvent + EventRsvp)
// ============================================================================
// Lógica de domínio para RSVPs:
//   • Capacity check + waitlist auto-promote
//   • Atomic state transitions (GOING ↔ CANCELLED ↔ WAITLIST)
//   • Email confirm + ICS attachment generation
//   • Reminder schedule (7d, 1d, 1h)
//   • Post-event thank-you
//
// Não toca Prisma diretamente — recebe um client no construtor para
// facilitar testing com mocks. Todas as funções são pure ou usam o
// client injetado.
//
// LGPD Art. 7º, I: opt-in explícito (criar RSVP é consentimento).
// LGPD Art. 18: usuário pode revogar (status=CANCELLED) a qualquer momento.
// ============================================================================

import type { PrismaClient } from '@prisma/client';

// ============================================================
// Tipos
// ============================================================

export type RsvpStatus = 'GOING' | 'WAITLIST' | 'MAYBE' | 'NOT_GOING' | 'CANCELLED';

export interface RsvpInput {
  eventId: string;
  userId: string;
  guests?: number;
  note?: string;
}

export interface RsvpResult {
  ok: boolean;
  status: RsvpStatus;
  position?: number; // posição na waitlist se WAITLIST
  reason?: string;   // mensagem de erro se !ok
}

export interface RsvpContext {
  event: {
    id: string;
    title: string;
    startsAt: Date;
    endsAt: Date;
    capacity: number | null;
    rsvpCount: number;
    waitlistCount: number;
    rsvpRequired: boolean;
    status: string;
  };
  existing?: {
    status: RsvpStatus;
    guests: number;
  } | null;
}

export interface PrismaRsvpClient {
  communityEvent: {
    findUnique: (args: { where: { id: string } }) => Promise<RsvpContext['event'] | null>;
    update: (args: any) => Promise<any>;
  };
  eventRsvp: {
    findUnique: (args: any) => Promise<any>;
    upsert: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    findFirst: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any[]>;
  };
  $transaction: <T>(fn: (tx: PrismaRsvpClient) => Promise<T>) => Promise<T>;
}

// ============================================================
// capacityCheck — Decide status baseado em capacidade
// ============================================================

export function decideStatus(ctx: RsvpContext, requestedStatus: RsvpStatus): RsvpResult {
  const cap = ctx.event.capacity;

  // Caso 1: usuário cancelando — sempre aceita
  if (requestedStatus === 'CANCELLED') {
    return { ok: true, status: 'CANCELLED' };
  }

  // Caso 2: MAYBE / NOT_GOING — não conta para capacity
  if (requestedStatus === 'MAYBE' || requestedStatus === 'NOT_GOING') {
    return { ok: true, status: requestedStatus };
  }

  // Caso 3: GOING — verifica capacidade
  if (requestedStatus === 'GOING') {
    // Capacidade ilimitada
    if (cap === null || cap === 0) {
      return { ok: true, status: 'GOING' };
    }

    // Se já era GOING antes, mantém
    if (ctx.existing?.status === 'GOING') {
      return { ok: true, status: 'GOING' };
    }

    // Se está migrando de WAITLIST → GOING (auto-promote), mantém
    if (ctx.existing?.status === 'WAITLIST') {
      return { ok: true, status: 'GOING' };
    }

    // Verifica disponibilidade
    if (ctx.event.rsvpCount >= cap) {
      return {
        ok: true,
        status: 'WAITLIST',
        position: ctx.event.waitlistCount + 1,
        reason: 'capacity_full',
      };
    }

    return { ok: true, status: 'GOING' };
  }

  return { ok: false, status: requestedStatus, reason: 'invalid_status' };
}

// ============================================================
// applyRsvp — Aplica mudança de RSVP com contadores atômicos
// ============================================================

export async function applyRsvp(
  prisma: PrismaRsvpClient,
  input: RsvpInput,
  requestedStatus: RsvpStatus,
): Promise<RsvpResult> {
  // Validação básica
  if (!input.eventId || !input.userId) {
    return { ok: false, status: requestedStatus, reason: 'missing_input' };
  }

  if (input.guests !== undefined && (input.guests < 0 || input.guests > 10)) {
    return { ok: false, status: requestedStatus, reason: 'invalid_guests' };
  }

  return prisma.$transaction(async (tx) => {
    const event = await tx.communityEvent.findUnique({
      where: { id: input.eventId },
    });

    if (!event) {
      return { ok: false, status: requestedStatus, reason: 'event_not_found' };
    }

    if (event.status !== 'PUBLISHED') {
      return { ok: false, status: requestedStatus, reason: 'event_not_published' };
    }

    if (event.startsAt < new Date()) {
      return { ok: false, status: requestedStatus, reason: 'event_already_started' };
    }

    const existing = await tx.eventRsvp.findUnique({
      where: { eventId_userId: { eventId: input.eventId, userId: input.userId } },
    });

    const ctx: RsvpContext = {
      event,
      existing: existing ? { status: existing.status as RsvpStatus, guests: existing.guests } : null,
    };

    const decision = decideStatus(ctx, requestedStatus);

    if (!decision.ok) {
      return decision;
    }

    // Calcula delta nos contadores
    const oldStatus = existing?.status as RsvpStatus | undefined;
    const newStatus = decision.status;
    const oldCounted = oldStatus === 'GOING' || oldStatus === 'WAITLIST';
    const newCounted = newStatus === 'GOING' || newStatus === 'WAITLIST';
    const oldGuests = existing?.guests ?? 0;
    const newGuests = input.guests ?? oldGuests;

    let rsvpDelta = 0;
    let waitlistDelta = 0;

    if (oldStatus === 'GOING' && newStatus !== 'GOING') rsvpDelta--;
    if (oldStatus !== 'GOING' && newStatus === 'GOING') rsvpDelta++;
    if (oldStatus === 'WAITLIST' && newStatus !== 'WAITLIST') waitlistDelta--;
    if (oldStatus !== 'WAITLIST' && newStatus === 'WAITLIST') waitlistDelta++;

    // Guests delta afeta rsvpCount apenas se GOING
    if (newStatus === 'GOING') {
      rsvpDelta += newGuests - oldGuests;
    }

    // Aplica upsert
    await tx.eventRsvp.upsert({
      where: { eventId_userId: { eventId: input.eventId, userId: input.userId } },
      create: {
        eventId: input.eventId,
        userId: input.userId,
        status: newStatus,
        guests: newGuests,
        note: input.note ?? null,
      },
      update: {
        status: newStatus,
        guests: newGuests,
        note: input.note ?? existing?.note ?? null,
        updatedAt: new Date(),
      },
    });

    // Atualiza contadores no evento
    if (rsvpDelta !== 0 || waitlistDelta !== 0) {
      await tx.communityEvent.update({
        where: { id: input.eventId },
        data: {
          rsvpCount: { increment: rsvpDelta },
          waitlistCount: { increment: waitlistDelta },
        },
      });
    }

    return decision;
  });
}

// ============================================================
// promoteWaitlist — Promove WAITLIST → GOING quando alguém cancela
// ============================================================

export async function promoteWaitlist(
  prisma: PrismaRsvpClient,
  eventId: string,
  slotsFreed: number = 1,
): Promise<{ promoted: number; userIds: string[] }> {
  if (slotsFreed <= 0) return { promoted: 0, userIds: [] };

  return prisma.$transaction(async (tx) => {
    const event = await tx.communityEvent.findUnique({ where: { id: eventId } });
    if (!event) return { promoted: 0, userIds: [] };

    const cap = event.capacity ?? 0;
    const availableSlots = cap > 0 ? cap - event.rsvpCount : Infinity;
    const toPromote = Math.min(slotsFreed, availableSlots, event.waitlistCount);

    if (toPromote <= 0) return { promoted: 0, userIds: [] };

    const waitlist = await tx.eventRsvp.findMany({
      where: { eventId, status: 'WAITLIST' },
      orderBy: { createdAt: 'asc' },
      take: toPromote,
    });

    const promotedIds: string[] = [];
    for (const rsvp of waitlist) {
      await tx.eventRsvp.update({
        where: { id: rsvp.id },
        data: { status: 'GOING', updatedAt: new Date() },
      });
      promotedIds.push(rsvp.userId);
    }

    await tx.communityEvent.update({
      where: { id: eventId },
      data: {
        rsvpCount: { increment: toPromote },
        waitlistCount: { increment: -toPromote },
      },
    });

    return { promoted: promotedIds.length, userIds: promotedIds };
  });
}

// ============================================================
// ICS — Gera attachment ICS para confirmação
// ============================================================================

export function generateIcsAttachment(event: {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  location: string | null;
  onlineUrl: string | null;
}): { filename: string; content: string } {
  const dtStart = formatIcsDate(event.startsAt);
  const dtEnd = formatIcsDate(event.endsAt);
  const dtStamp = formatIcsDate(new Date());
  const uid = `${event.id}@cabaladoscaminhos.app`;
  const location = event.location ?? event.onlineUrl ?? '';
  const url = event.onlineUrl ?? `https://cabaladoscaminhos.app/events/${event.id}`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cábala dos Caminhos//Events W35//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${url}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return {
    filename: `event-${event.id}.ics`,
    content: ics,
  };
}

function formatIcsDate(d: Date): string {
  // YYYYMMDDTHHmmssZ (UTC)
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// ============================================================
// Reminders — Schedule de emails (7d, 1d, 1h antes)
// ============================================================================

export interface ReminderSchedule {
  email7d: boolean;
  email1d: boolean;
  email1h: boolean;
  emailPost: boolean;
}

export function computeReminderSchedule(startsAt: Date): ReminderSchedule {
  const now = Date.now();
  const start = startsAt.getTime();
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;

  return {
    email7d: start - now > 7 * day,
    email1d: start - now > 1 * day,
    email1h: start - now > 1 * hour,
    emailPost: start < now, // post-event só se já passou
  };
}

// ============================================================
// listMyEvents — Lista eventos do usuário (going, organized, past)
// ============================================================================

export async function listMyEvents(
  prisma: PrismaRsvpClient,
  userId: string,
  filter: { status?: 'going' | 'organized' | 'past'; limit?: number } = {},
): Promise<any[]> {
  const limit = filter.limit ?? 50;
  const now = new Date();

  if (filter.status === 'organized') {
    // Eventos onde o user é host — query direta no CommunityEvent
    // (mantida aqui como placeholder; consumers devem usar
    // prisma.communityEvent.findMany({ where: { hostId: userId } }))
    return prisma.eventRsvp.findMany({
      where: { userId },
      take: limit,
    });
  }

  if (filter.status === 'past') {
    return prisma.eventRsvp.findMany({
      where: { userId, status: 'GOING' },
      take: limit,
    });
  }

  // Going (default): RSVPs com status GOING + startsAt futuro
  return prisma.eventRsvp.findMany({
    where: { userId, status: 'GOING' },
  });
}

// ============================================================
// Validação de input
// ============================================================================

export function validateRsvpInput(input: unknown): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const i = input as Partial<RsvpInput>;

  if (!i.eventId || typeof i.eventId !== 'string') errors.push('eventId obrigatório');
  if (!i.userId || typeof i.userId !== 'string') errors.push('userId obrigatório');
  if (i.guests !== undefined && (typeof i.guests !== 'number' || i.guests < 0 || i.guests > 10)) {
    errors.push('guests deve ser 0-10');
  }
  if (i.note !== undefined && (typeof i.note !== 'string' || i.note.length > 500)) {
    errors.push('note máximo 500 chars');
  }

  return { ok: errors.length === 0, errors };
}