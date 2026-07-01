// ============================================================================
// GET /api/support/tickets/[id] — detalhar um ticket (dono ou agente)
// ============================================================================
// LGPD Art. 18: retorna PII apenas se requester é o dono OU agente.
// Mensagens internas (`isInternal`) só visíveis para agentes.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { previewBody } from '@/lib/support';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  }

  const url = new URL(request.url);
  const requesterId = url.searchParams.get('requesterId');
  const requesterIsAgent = url.searchParams.get('agent') === 'true';

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Access control: dono OU agente OU email match (anon ticket)
  const isOwner = ticket.userId && ticket.userId === requesterId;
  const isEmailMatch =
    !ticket.userId &&
    ticket.email &&
    url.searchParams.get('email')?.toLowerCase() === ticket.email.toLowerCase();
  if (!isOwner && !isEmailMatch && !requesterIsAgent) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Sem permissão para ver este ticket.' },
      { status: 403 },
    );
  }

  // Filter internal messages for non-agents
  const visibleMessages = ticket.messages
    .filter((m) => requesterIsAgent || !m.isInternal)
    .map((m) => ({
      id: m.id,
      body: previewBody(m.body, 4000),
      isInternal: m.isInternal,
      authorType: m.agentId ? 'agent' : m.userId ? 'customer' : 'system',
      authorId: m.userId ?? m.agentId ?? null,
      attachments: m.attachments,
      createdAt: m.createdAt,
    }));

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      email: ticket.email,
      userId: ticket.userId,
      assignedTo: ticket.assignedTo,
      team: ticket.team,
      firstResponseAt: ticket.firstResponseAt,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      satisfactionRating: ticket.satisfactionRating,
      satisfactionComment: ticket.satisfactionComment,
      satisfactionSubmittedAt: ticket.satisfactionSubmittedAt,
      tags: ticket.tags,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      messages: visibleMessages,
    },
  });
}