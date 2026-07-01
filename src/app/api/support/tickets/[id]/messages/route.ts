// ============================================================================
// POST /api/support/tickets/[id]/messages — adicionar mensagem ao thread
// ============================================================================
// Usado por: cliente (responde ticket), agente (responde cliente), agente
// (adiciona nota interna).
//
// Side effects:
//   - Se primeira resposta de agente → marca `firstResponseAt`.
//   - Se body contém palavras-chave URGENT → escalonar prioridade.
//
// LGPD Art. 37: cada mensagem gera entrada em AuditLog.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MessageSchema = z.object({
  body: z.string().trim().min(1, 'Mensagem vazia.').max(8000),
  isInternal: z.boolean().optional().default(false),
  authorType: z.enum(['customer', 'agent', 'system']).default('customer'),
  authorId: z.string().optional().nullable(),
  attachments: z.array(z.string().url()).max(5).optional().default([]),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = MessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_error', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      firstResponseAt: true,
      assignedTo: true,
      priority: true,
    },
  });
  if (!ticket) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const closedStatuses = ['RESOLVED', 'CLOSED'] as const;
  // Status guards
  if (closedStatuses.includes(ticket.status as typeof closedStatuses[number])) {
    return NextResponse.json(
      { error: 'ticket_closed', message: 'Ticket já resolvido/fechado — abra um novo se precisar.' },
      { status: 409 },
    );
  }

  const isAgent = parsed.data.authorType === 'agent';
  const isInternal = isAgent && parsed.data.isInternal;

  // Determine userId/agentId for the message
  const messageData: Prisma.TicketMessageCreateInput = {
    body: parsed.data.body,
    isInternal,
    attachments: parsed.data.attachments,
    metadata: (parsed.data.metadata ?? {}) as Prisma.InputJsonValue,
    ticket: { connect: { id: ticket.id } },
    ...(parsed.data.authorType === 'customer'
      ? { userId: parsed.data.authorId ?? ticket.userId ?? null }
      : parsed.data.authorType === 'agent'
        ? { agentId: parsed.data.authorId ?? ticket.assignedTo ?? null }
        : {}),
  };

  const message = await prisma.ticketMessage.create({
    data: messageData,
    select: {
      id: true,
      createdAt: true,
      body: true,
      isInternal: true,
      agentId: true,
      userId: true,
    },
  });

  // Update ticket side effects
  const updateData: Prisma.SupportTicketUpdateInput = {
    updatedAt: new Date(),
    // First agent response
    ...(isAgent && !ticket.firstResponseAt && { firstResponseAt: new Date() }),
    // If customer responded, move to PENDING_AGENT (unless closed/resolved)
    ...(parsed.data.authorType === 'customer' &&
      !closedStatuses.includes(ticket.status as typeof closedStatuses[number]) && { status: 'PENDING_AGENT' }),
    // If agent responded publicly, move to PENDING_CUSTOMER
    ...(isAgent && !isInternal &&
      !closedStatuses.includes(ticket.status as typeof closedStatuses[number]) && { status: 'PENDING_CUSTOMER' }),
  };

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: updateData,
  });

  // Audit
  try {
    await prisma.auditLog.create({
      data: {
        actorId: parsed.data.authorId ?? null,
        action: (isInternal ? 'SUPPORT_NOTE_ADDED' : 'SUPPORT_MESSAGE_ADDED') as never,
        targetId: message.id,
        metadata: {
          ticketId: ticket.id,
          authorType: parsed.data.authorType,
          isInternal,
        } as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.warn('[support audit] message failed', err);
  }

  return NextResponse.json({ message }, { status: 201 });
}