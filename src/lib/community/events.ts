// ============================================================================
// COMMUNITY EVENTS — Backend helpers (Prisma → API DTO mapping, queries)
// ============================================================================
// Funções que ficam entre os route handlers e o Prisma.
// Centralizam: listagem (com filtros), criação, RSVP (join/leave),
// contagem de participantes.
// ============================================================================

import { Prisma } from '@prisma/client';
import type { EventRsvpStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ============================================================================
// DTOs
// ============================================================================

export type EventDto = {
  id: string;
  title: string;
  description: string;
  tradition: string;
  hostId: string;
  hostDisplayName: string;
  startsAt: string;
  durationMin: number;
  maxParticipants: number;
  isPublic: boolean;
  meetingUrl: string | null;
  groupId: string | null;
  participantsCount: number;
  // Wave 21 — RSVP state do viewer (null se não tem RSVP)
  viewerRsvpStatus: 'GOING' | 'MAYBE' | 'DECLINED' | null;
  // Mantido por retro-compat: true se viewerRsvpStatus === 'GOING'
  viewerIsParticipant: boolean;
  viewerIsHost: boolean;
  spotsRemaining: number | null; // null = ilimitado
  createdAt: string;
  updatedAt: string;
};

export type EventParticipantDto = {
  userId: string;
  displayName: string;
  status: EventRsvpStatus;
  joinedAt: string;
  statusUpdatedAt: string;
};

// ============================================================================
// DTO mapping
// ============================================================================

type EventWithViewer = Prisma.EventGetPayload<{
  include: {
    participants: { where: { userId: string } };
  };
}>;

type EventRow = Prisma.EventGetPayload<Record<string, never>>;

function eventToDto(
  event: EventRow,
  viewerId: string | null,
  viewerRsvpStatus: EventRsvpStatus | null
): EventDto {
  const isGoing = viewerRsvpStatus === 'GOING';
  const spotsRemaining =
    event.maxParticipants > 0
      ? Math.max(0, event.maxParticipants - event.participantsCount)
      : null;
  // meetingUrl só é exposta se for o host ou já participante confirmado
  const canSeeMeetingUrl =
    !!viewerId &&
    (viewerId === event.hostId || isGoing);
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    tradition: event.tradition,
    hostId: event.hostId,
    hostDisplayName: extractDisplayName(event.hostId),
    startsAt: event.startsAt.toISOString(),
    durationMin: event.durationMin,
    maxParticipants: event.maxParticipants,
    isPublic: event.isPublic,
    meetingUrl: canSeeMeetingUrl ? event.meetingUrl : null,
    groupId: event.groupId,
    participantsCount: event.participantsCount,
    viewerRsvpStatus: viewerRsvpStatus,
    // Retro-compat: true se viewer confirmou presença
    viewerIsParticipant: isGoing,
    viewerIsHost: !!viewerId && viewerId === event.hostId,
    spotsRemaining,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

function participantToDto(
  p: Prisma.EventParticipantGetPayload<Record<string, never>>
): EventParticipantDto {
  return {
    userId: p.userId,
    displayName: extractDisplayName(p.userId),
    status: p.status,
    joinedAt: p.joinedAt.toISOString(),
    statusUpdatedAt: p.statusUpdatedAt.toISOString(),
  };
}

function extractDisplayName(userId: string): string {
  if (!userId) return 'Anônimo';
  if (userId.startsWith('seed-')) {
    return `Membro ${userId.slice(-6).toUpperCase()}`;
  }
  return `Facilitador(a) ${userId.slice(-4)}`;
}

// ============================================================================
// LIST EVENTS
// ============================================================================

export interface ListEventsOptions {
  tradition?: string | null;
  upcoming?: boolean;
  isPublic?: boolean | null;
  hostId?: string | null;
  groupId?: string | null;
  search?: string | null;
  viewerId?: string | null;
  limit?: number;
}

export async function listEvents(
  opts: ListEventsOptions = {}
): Promise<EventDto[]> {
  const where: Prisma.EventWhereInput = {};
  if (opts.tradition) where.tradition = opts.tradition;
  if (opts.isPublic !== undefined && opts.isPublic !== null) {
    where.isPublic = opts.isPublic;
  }
  if (opts.hostId) where.hostId = opts.hostId;
  if (opts.groupId) where.groupId = opts.groupId;
  if (opts.upcoming) {
    where.startsAt = { gte: new Date() };
  }
  if (opts.search) {
    where.OR = [
      { title: { contains: opts.search, mode: 'insensitive' } },
      { description: { contains: opts.search, mode: 'insensitive' } },
      { tradition: { contains: opts.search, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.event.findMany({
    where,
    orderBy: [{ startsAt: 'asc' }],
    take: opts.limit ?? 30,
  });

  // Buscar RSVPs do viewer em batch (1 query para todos os eventos listados)
  // Wave 21 — agora retornamos o status, não só boolean
  const viewerStatuses = new Map<string, EventRsvpStatus>();
  if (opts.viewerId && rows.length > 0) {
    const parts = await prisma.eventParticipant.findMany({
      where: {
        userId: opts.viewerId,
        eventId: { in: rows.map((r) => r.id) },
      },
      select: { eventId: true, status: true },
    });
    for (const p of parts) viewerStatuses.set(p.eventId, p.status);
  }

  return rows.map((r) =>
    eventToDto(r, opts.viewerId ?? null, viewerStatuses.get(r.id) ?? null)
  );
}

// ============================================================================
// GET EVENT BY ID
// ============================================================================

export async function getEventById(
  id: string,
  viewerId: string | null
): Promise<EventDto | null> {
  const row = await prisma.event.findUnique({ where: { id } });
  if (!row) return null;

  let viewerStatus: EventRsvpStatus | null = null;
  if (viewerId) {
    const part = await prisma.eventParticipant.findUnique({
      where: { eventId_userId: { eventId: id, userId: viewerId } },
      select: { status: true },
    });
    viewerStatus = part?.status ?? null;
  }

  // Eventos privados: se viewer não é host nem participante, esconde meetingUrl
  // (a flag isPublic continua na DTO, decisão de mostrar o card é da UI)
  return eventToDto(row, viewerId, viewerStatus);
}

// ============================================================================
// CREATE EVENT
// ============================================================================

export async function createEvent(input: {
  title: string;
  description: string;
  tradition: string;
  hostId: string;
  startsAt: Date;
  durationMin?: number;
  maxParticipants?: number;
  isPublic?: boolean;
  meetingUrl?: string | null;
  groupId?: string | null;
}): Promise<EventDto> {
  const created = await prisma.event.create({
    data: {
      title: input.title,
      description: input.description,
      tradition: input.tradition,
      hostId: input.hostId,
      startsAt: input.startsAt,
      durationMin: input.durationMin ?? 60,
      maxParticipants: input.maxParticipants ?? 0,
      isPublic: input.isPublic ?? true,
      meetingUrl: input.meetingUrl ?? null,
      groupId: input.groupId ?? null,
    },
  });
  // Host entra automaticamente como GOING (não conta em participantsCount
  // — o limite é para guests; host sempre confirmado).
  return eventToDto(created, input.hostId, 'GOING');
}

// ============================================================================
// JOIN EVENT (RSVP) — idempotente
// ============================================================================

export async function joinEvent(input: {
  eventId: string;
  userId: string;
}): Promise<{ role: 'PARTICIPANT'; joined: boolean }> {
  const event = await prisma.event.findUnique({
    where: { id: input.eventId },
    select: {
      id: true,
      maxParticipants: true,
      participantsCount: true,
      startsAt: true,
      hostId: true,
    },
  });
  if (!event) throw new EventNotFoundError();
  if (event.startsAt.getTime() < Date.now()) {
    throw new EventAlreadyStartedError();
  }
  if (event.maxParticipants > 0 && event.participantsCount >= event.maxParticipants) {
    throw new EventFullError();
  }

  // Host já conta como participante — upsert idempotente
  const isHost = event.hostId === input.userId;
  const existing = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: input.userId } },
  });
  if (existing) {
    // Já existe — idempotente. Não atualiza status aqui.
    return { role: 'PARTICIPANT', joined: false };
  }

  await prisma.$transaction([
    prisma.eventParticipant.create({
      data: {
        eventId: event.id,
        userId: input.userId,
        status: 'GOING',
      },
    }),
    prisma.event.update({
      where: { id: event.id },
      data: { participantsCount: { increment: 1 } },
    }),
  ]);

  return { role: 'PARTICIPANT', joined: true };
}

// ============================================================================
// SET RSVP STATUS — Wave 21 (substitui joinEvent para fluxos com 3 estados)
// ============================================================================
// Idempotente. Se o participante já existia, atualiza o status e ajusta
// Event.participantsCount conforme necessário (going<->maybe/declined).
//
// Retorna: { status, changed: boolean }
//
export async function setRsvpStatus(input: {
  eventId: string;
  userId: string;
  status: EventRsvpStatus;
}): Promise<{ status: EventRsvpStatus; changed: boolean }> {
  const event = await prisma.event.findUnique({
    where: { id: input.eventId },
    select: {
      id: true,
      hostId: true,
      maxParticipants: true,
      participantsCount: true,
      startsAt: true,
    },
  });
  if (!event) throw new EventNotFoundError();
  if (event.hostId === input.userId) {
    throw new EventHostCannotChangeRsvpError();
  }
  if (event.startsAt.getTime() < Date.now()) {
    throw new EventAlreadyStartedError();
  }

  // Capacidade: se for 'going' e evento lotado, rejeita
  if (
    input.status === 'GOING' &&
    event.maxParticipants > 0 &&
    event.participantsCount >= event.maxParticipants
  ) {
    // Se já estava como going, não é mudança — deixa passar (idempotente)
    const current = await prisma.eventParticipant.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: input.userId } },
      select: { status: true },
    });
    if (current?.status !== 'GOING') {
      throw new EventFullError();
    }
  }

  const existing = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: input.userId } },
  });

  if (!existing) {
    // Cria novo RSVP
    await prisma.eventParticipant.create({
      data: {
        eventId: event.id,
        userId: input.userId,
        status: input.status,
        statusUpdatedAt: new Date(),
      },
    });
    if (input.status === 'GOING') {
      await prisma.event.update({
        where: { id: event.id },
        data: { participantsCount: { increment: 1 } },
      });
    }
    return { status: input.status, changed: true };
  }

  if (existing.status === input.status) {
    return { status: input.status, changed: false };
  }

  // Transição: ajustar contagem de going conforme delta
  const wasGoing = existing.status === 'GOING';
  const willBeGoing = input.status === 'GOING';
  const delta = (willBeGoing ? 1 : 0) - (wasGoing ? 1 : 0);

  await prisma.$transaction([
    prisma.eventParticipant.update({
      where: { eventId_userId: { eventId: event.id, userId: input.userId } },
      data: {
        status: input.status,
        statusUpdatedAt: new Date(),
      },
    }),
    prisma.event.update({
      where: { id: event.id },
      data: { participantsCount: { increment: delta } },
    }),
  ]);

  return { status: input.status, changed: true };
}

// ============================================================================
// LEAVE EVENT — idempotente
// ============================================================================

export async function leaveEvent(input: {
  eventId: string;
  userId: string;
}): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id: input.eventId },
    select: { id: true, hostId: true },
  });
  if (!event) throw new EventNotFoundError();
  if (event.hostId === input.userId) {
    throw new EventHostCannotLeaveError();
  }

  const existing = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: input.userId } },
  });
  if (!existing) return; // idempotente

  // Decrementar contagem apenas se era 'going'
  const wasGoing = existing.status === 'GOING';
  if (wasGoing) {
    await prisma.$transaction([
      prisma.eventParticipant.delete({
        where: { eventId_userId: { eventId: event.id, userId: input.userId } },
      }),
      prisma.event.update({
        where: { id: event.id },
        data: { participantsCount: { decrement: 1 } },
      }),
    ]);
  } else {
    await prisma.eventParticipant.delete({
      where: { eventId_userId: { eventId: event.id, userId: input.userId } },
    });
  }
}

// ============================================================================
// LIST PARTICIPANTS
// ============================================================================

export async function listEventParticipants(input: {
  eventId: string;
  limit?: number;
}): Promise<EventParticipantDto[]> {
  const event = await prisma.event.findUnique({
    where: { id: input.eventId },
    select: { id: true },
  });
  if (!event) throw new EventNotFoundError();

  const rows = await prisma.eventParticipant.findMany({
    where: { eventId: event.id },
    orderBy: [{ joinedAt: 'asc' }],
    take: input.limit ?? 100,
  });

  return rows.map(participantToDto);
}

// ============================================================================
// Errors
// ============================================================================

export class EventNotFoundError extends Error {
  constructor() {
    super('Evento não encontrado');
    this.name = 'EventNotFoundError';
  }
}

export class EventFullError extends Error {
  constructor() {
    super('Evento lotado — sem vagas disponíveis');
    this.name = 'EventFullError';
  }
}

export class EventAlreadyStartedError extends Error {
  constructor() {
    super('Este evento já começou — não é mais possível participar');
    this.name = 'EventAlreadyStartedError';
  }
}

export class EventHostCannotLeaveError extends Error {
  constructor() {
    super('O host não pode sair do próprio evento — cancele-o em vez disso');
    this.name = 'EventHostCannotLeaveError';
  }
}

// 2026-06-28 — Wave 21: host não pode mudar o próprio RSVP
export class EventHostCannotChangeRsvpError extends Error {
  constructor() {
    super('O host já conta como participante do próprio evento');
    this.name = 'EventHostCannotChangeRsvpError';
  }
}

// ============================================================================
// INTERNAL — re-exported para uso em testes
// ============================================================================

export const __internal = {
  eventToDto,
  participantToDto,
  extractDisplayName,
};