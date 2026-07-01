// ============================================================================
// POST /api/support/chat — live chat (SSE-friendly; v1 returns last N msgs)
// ============================================================================
// Wave 37 entrega: pre-chat form, post messages, retrieve transcript.
//
// Em produção: WebSocket ou Server-Sent Events. Para Wave 37 entregamos
// POST simples + GET ?since= para polling (5s fallback).
//
// LGPD Art. 7: visitante pode chat anônimo (nome + email). Capturamos IP
// hasheado para rate-limit (sem PII puro).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================================================
// Pre-chat form validation
// ============================================================================
const PreChatSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  category: z.enum(['BILLING', 'TECHNICAL', 'CONTENT', 'COMMUNITY', 'ACCOUNT', 'OTHER']),
  initialMessage: z.string().trim().min(10).max(2000),
});

const ChatMessageSchema = z.object({
  sessionId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
  authorType: z.enum(['customer', 'agent', 'system']).default('customer'),
});

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash('sha256').update(ip + (process.env.IP_SALT ?? 'cabala')).digest('hex').slice(0, 24);
}

// ============================================================================
// POST — start session OR send message
// ============================================================================
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'start') {
    const parsed = PreChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const ipHash = hashIp(ip);

    // Create ticket + initial message
    const ticket = await prisma.supportTicket.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        status: 'OPEN',
        priority: 'MEDIUM',
        category: parsed.data.category,
        subject: `Chat ao vivo — ${parsed.data.name}`,
        description: parsed.data.initialMessage,
        tags: ['live-chat'],
        metadata: {
          source: 'chat',
          ipHash,
          userAgent: request.headers.get('user-agent')?.slice(0, 256) ?? null,
        },
        messages: {
          create: {
            body: parsed.data.initialMessage,
            isInternal: false,
            attachments: [],
            metadata: { kind: 'INITIAL', source: 'chat' },
          },
        },
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json(
      {
        sessionId: ticket.id,
        ticketId: ticket.id,
        status: 'OPEN',
        message: 'Sessão de chat iniciada. Um agente responderá em breve.',
      },
      { status: 201 },
    );
  }

  if (action === 'message') {
    const parsed = ChatMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', issues: parsed.error.issues },
        { status: 400 },
      );
    }
    // Forward to messages endpoint
    const res = await fetch(`${url.origin}/api/support/tickets/${parsed.data.sessionId}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        body: parsed.data.body,
        authorType: parsed.data.authorType,
      }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(
    { error: 'invalid_action', message: 'Use ?action=start ou ?action=message' },
    { status: 400 },
  );
}

// ============================================================================
// GET — retrieve transcript (polling pattern)
// ============================================================================
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const since = url.searchParams.get('since'); // ISO date

  if (!sessionId) {
    return NextResponse.json({ error: 'missing_sessionId' }, { status: 400 });
  }

  const where = since
    ? { ticketId: sessionId, createdAt: { gt: new Date(since) } }
    : { ticketId: sessionId };

  const messages = await prisma.ticketMessage.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: {
      id: true,
      body: true,
      isInternal: false, // hide internal in chat
      createdAt: true,
    },
  });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: sessionId },
    select: { status: true, assignedTo: true, priority: true },
  });

  return NextResponse.json({
    messages,
    ticket,
    pollMs: 5000,
  });
}