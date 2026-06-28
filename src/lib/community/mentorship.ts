// ============================================================================
// COMMUNITY MENTORSHIP — Backend helpers (Prisma → API DTO)
// ============================================================================
// Sistema de pairing 1-on-1: praticantes mais experientes guiam novatos.
// Onda 13 — 2026-06-27.
// ============================================================================

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ============================================================================
// DTOs
// ============================================================================

export type MentorDto = {
  id: string;
  displayName: string;
  bio: string | null;
  traditions: string[];
  rating: number;
  completed: number;
  isAvailable: boolean;
};

export type MentorshipDto = {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  tradition: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  acceptedAt: string | null;
  endedAt: string | null;
  messageCount: number;
};

export type MentorshipMessageDto = {
  id: string;
  mentorshipId: string;
  authorId: string;
  content: string;
  createdAt: string;
};

// ============================================================================
// LIST AVAILABLE MENTORS (filtro por tradição)
// ============================================================================

export interface ListAvailableMentorsOptions {
  tradition?: string | null;
  viewerId?: string | null;
  limit?: number;
}

export async function listAvailableMentors(
  opts: ListAvailableMentorsOptions = {}
): Promise<MentorDto[]> {
  const where: Prisma.UserWhereInput = {
    isMentor: true,
  };

  if (opts.tradition) {
    // Postgres array contains: mentorTraditions contains this tradition
    where.mentorTraditions = { has: opts.tradition };
  }

  const rows = await prisma.user.findMany({
    where,
    select: {
      id: true,
      nomeCompleto: true,
      mentorBio: true,
      mentorTraditions: true,
      mentorRating: true,
      mentorCompleted: true,
    },
    orderBy: [{ mentorRating: 'desc' }, { mentorCompleted: 'desc' }],
    take: opts.limit ?? 50,
  });

  // Verifica se o mentor já tem mentoria ACTIVE/PENDING com o viewer
  // → se sim, marca isAvailable=false (não precisa fazer 2 queries por mentor)
  let blockedMentorIds = new Set<string>();
  if (opts.viewerId) {
    const active = await prisma.mentorship.findMany({
      where: {
        menteeId: opts.viewerId,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
      select: { mentorId: true },
    });
    blockedMentorIds = new Set(active.map((m) => m.mentorId));
  }

  return rows.map((u) => ({
    id: u.id,
    displayName: u.nomeCompleto,
    bio: u.mentorBio ?? null,
    traditions: u.mentorTraditions ?? [],
    rating: u.mentorRating ?? 0,
    completed: u.mentorCompleted ?? 0,
    isAvailable: !blockedMentorIds.has(u.id),
  }));
}

// ============================================================================
// REQUEST MENTORSHIP (mentee → mentor)
// ============================================================================

export class SelfMentorshipError extends Error {
  constructor() {
    super('Você não pode ser mentor de si mesmo');
    this.name = 'SelfMentorshipError';
  }
}

export class MentorNotEligibleError extends Error {
  constructor() {
    super('Este usuário não está habilitado como mentor');
    this.name = 'MentorNotEligibleError';
  }
}

export class MentorshipAlreadyExistsError extends Error {
  constructor() {
    super('Já existe uma mentoria pendente ou ativa com este mentor');
    this.name = 'MentorshipAlreadyExistsError';
  }
}

export async function requestMentorship(input: {
  mentorId: string;
  menteeId: string;
  tradition: string;
  message?: string | null;
}): Promise<MentorshipDto> {
  if (input.mentorId === input.menteeId) {
    throw new SelfMentorshipError();
  }

  // Valida se mentor está habilitado
  const mentor = await prisma.user.findUnique({
    where: { id: input.mentorId },
    select: { isMentor: true, mentorTraditions: true, nomeCompleto: true },
  });
  if (!mentor || !mentor.isMentor) {
    throw new MentorNotEligibleError();
  }
  if (
    !mentor.mentorTraditions ||
    !mentor.mentorTraditions.includes(input.tradition)
  ) {
    throw new MentorNotEligibleError(
      `Este mentor não pratica a tradição "${input.tradition}"`
    );
  }

  // Bloqueia duplicado: 1 ACTIVE/PENDING por par mentor/mentee
  // (o índice unique em mentorships(mentor_id, mentee_id, status) garante isso)
  // Mas como ACTIVE e PENDING são valores diferentes, precisamos checar manualmente
  const existing = await prisma.mentorship.findFirst({
    where: {
      mentorId: input.mentorId,
      menteeId: input.menteeId,
      status: { in: ['PENDING', 'ACTIVE'] },
    },
    select: { id: true },
  });
  if (existing) {
    throw new MentorshipAlreadyExistsError();
  }

  const created = await prisma.mentorship.create({
    data: {
      mentorId: input.mentorId,
      menteeId: input.menteeId,
      tradition: input.tradition,
      status: 'PENDING',
      metadata: input.message
        ? ({ requestMessage: input.message } as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    },
  });

  const dto = await mentorshipToDto(created);
  if (!dto) throw new Error('Falha ao carregar mentoria recém-criada');
  return dto;
}

// ============================================================================
// ACCEPT MENTORSHIP (mentor aceita)
// ============================================================================

export class MentorshipNotFoundError extends Error {
  constructor() {
    super('Mentoria não encontrada');
    this.name = 'MentorshipNotFoundError';
  }
}

export class MentorshipForbiddenError extends Error {
  constructor(msg = 'Acesso negado') {
    super(msg);
    this.name = 'MentorshipForbiddenError';
  }
}

export class MentorshipInvalidStateError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'MentorshipInvalidStateError';
  }
}

export async function acceptMentorship(input: {
  mentorshipId: string;
  actorId: string; // mentor
}): Promise<MentorshipDto> {
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: input.mentorshipId },
  });
  if (!mentorship) throw new MentorshipNotFoundError();
  if (mentorship.mentorId !== input.actorId) {
    throw new MentorshipForbiddenError(
      'Apenas o mentor pode aceitar esta mentoria'
    );
  }
  if (mentorship.status !== 'PENDING') {
    throw new MentorshipInvalidStateError(
      `Mentoria não pode ser aceita no estado ${mentorship.status}`
    );
  }

  const updated = await prisma.mentorship.update({
    where: { id: input.mentorshipId },
    data: { status: 'ACTIVE', acceptedAt: new Date() },
  });
  const dto = await mentorshipToDto(updated);
  if (!dto) throw new Error('Falha ao recarregar mentoria aceita');
  return dto;
}

// ============================================================================
// END MENTORSHIP (qualquer parte encerra)
// ============================================================================

export async function endMentorship(input: {
  mentorshipId: string;
  actorId: string;
  reason?: string | null;
}): Promise<MentorshipDto> {
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: input.mentorshipId },
  });
  if (!mentorship) throw new MentorshipNotFoundError();
  if (
    mentorship.mentorId !== input.actorId &&
    mentorship.menteeId !== input.actorId
  ) {
    throw new MentorshipForbiddenError(
      'Apenas mentor ou mentee podem encerrar a mentoria'
    );
  }
  if (mentorship.status === 'COMPLETED') {
    // idempotente
    const dto = await mentorshipToDto(mentorship);
    if (!dto) throw new Error('Falha ao recarregar mentoria');
    return dto;
  }

  const endedAt = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    // Merge metadata em vez de sobrescrever (preserva requestMessage original)
    const existing = mentorship.metadata;
    const existingObj =
      existing && typeof existing === 'object' && !Array.isArray(existing)
        ? (existing as Record<string, unknown>)
        : {};
    const merged: Record<string, unknown> = {
      ...existingObj,
      endedBy: input.actorId,
    };
    if (input.reason) merged.endReason = input.reason;

    const m = await tx.mentorship.update({
      where: { id: input.mentorshipId },
      data: {
        status: 'COMPLETED',
        endedAt,
        metadata: merged as Prisma.InputJsonValue,
      },
    });

    // Incrementa mentorCompleted do mentor
    await tx.user.update({
      where: { id: mentorship.mentorId },
      data: { mentorCompleted: { increment: 1 } },
    });

    return m;
  });

  const dto = await mentorshipToDto(updated);
  if (!dto) throw new Error('Falha ao recarregar mentoria encerrada');
  return dto;
}

// ============================================================================
// GET MENTORSHIP BY ID (com chat messages)
// ============================================================================

export async function getMentorship(input: {
  mentorshipId: string;
  viewerId: string;
}): Promise<{
  mentorship: MentorshipDto;
  messages: MentorshipMessageDto[];
} | null> {
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: input.mentorshipId },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, take: 500 },
    },
  });
  if (!mentorship) return null;
  // Só mentor e mentee podem ver
  if (
    mentorship.mentorId !== input.viewerId &&
    mentorship.menteeId !== input.viewerId
  ) {
    throw new MentorshipForbiddenError(
      'Você não tem acesso a esta mentoria'
    );
  }

  const dto = await mentorshipToDto(mentorship);
  if (!dto) return null;

  const messages: MentorshipMessageDto[] = (mentorship.messages ?? []).map(
    (msg) => ({
      id: msg.id,
      mentorshipId: msg.mentorshipId,
      authorId: msg.authorId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
    })
  );

  return { mentorship: dto, messages };
}

// ============================================================================
// LIST MENTORSHIPS BY USER (mentor ou mentee)
// ============================================================================

export async function listMyMentorships(input: {
  userId: string;
  status?: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}): Promise<MentorshipDto[]> {
  const where: Prisma.MentorshipWhereInput = {
    OR: [{ mentorId: input.userId }, { menteeId: input.userId }],
  };
  if (input.status) where.status = input.status;

  const rows = await prisma.mentorship.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: 100,
  });

  const dtos: MentorshipDto[] = [];
  for (const m of rows) {
    const dto = await mentorshipToDto(m);
    if (dto) dtos.push(dto);
  }
  return dtos;
}

// ============================================================================
// SEND MESSAGE (chat simples)
// ============================================================================

export class MentorshipNotActiveError extends Error {
  constructor() {
    super('Só é possível enviar mensagens em mentorias ativas');
    this.name = 'MentorshipNotActiveError';
  }
}

export async function sendMentorshipMessage(input: {
  mentorshipId: string;
  authorId: string;
  content: string;
}): Promise<MentorshipMessageDto> {
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: input.mentorshipId },
    select: { mentorId: true, menteeId: true, status: true },
  });
  if (!mentorship) throw new MentorshipNotFoundError();
  if (
    mentorship.mentorId !== input.authorId &&
    mentorship.menteeId !== input.authorId
  ) {
    throw new MentorshipForbiddenError(
      'Apenas os participantes podem enviar mensagens'
    );
  }
  // Permite mensagens em PENDING (mentor pode responder antes de aceitar)
  // ou ACTIVE. Bloqueia apenas em COMPLETED.
  if (mentorship.status === 'COMPLETED') {
    throw new MentorshipNotActiveError();
  }

  const created = await prisma.mentorshipMessage.create({
    data: {
      mentorshipId: input.mentorshipId,
      authorId: input.authorId,
      content: input.content,
    },
  });

  return {
    id: created.id,
    mentorshipId: created.mentorshipId,
    authorId: created.authorId,
    content: created.content,
    createdAt: created.createdAt.toISOString(),
  };
}

// ============================================================================
// DTO mapping
// ============================================================================

type MentorshipRow = Prisma.MentorshipGetPayload<{
  include: { messages: { select: { id: true } } };
}>;

async function mentorshipToDto(
  m: Prisma.MentorshipGetPayload<Record<string, never>> | MentorshipRow
): Promise<MentorshipDto | null> {
  // Count messages separadamente para evitar JOIN sempre
  const messageCount = await prisma.mentorshipMessage.count({
    where: { mentorshipId: m.id },
  });

  // Resolve display names
  const userIds = [m.mentorId, m.menteeId];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, nomeCompleto: true },
  });
  const nameMap = new Map(users.map((u) => [u.id, u.nomeCompleto]));

  return {
    id: m.id,
    mentorId: m.mentorId,
    mentorName: nameMap.get(m.mentorId) ?? `Mentor ${m.mentorId.slice(-4)}`,
    menteeId: m.menteeId,
    menteeName: nameMap.get(m.menteeId) ?? `Mentee ${m.menteeId.slice(-4)}`,
    tradition: m.tradition,
    status: m.status,
    createdAt: m.createdAt.toISOString(),
    acceptedAt: m.acceptedAt?.toISOString() ?? null,
    endedAt: m.endedAt?.toISOString() ?? null,
    messageCount,
  };
}

// ============================================================================
// Internal re-exports
// ============================================================================

export const __internal = {
  mentorshipToDto,
};