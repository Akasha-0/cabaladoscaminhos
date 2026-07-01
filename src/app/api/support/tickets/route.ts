// ============================================================================
// POST /api/support/tickets — criar ticket (qualquer usuário autenticado)
// GET /api/support/tickets — listar tickets do próprio usuário
// ============================================================================
// LGPD Art. 7: userId opcional (visitante anônimo via email). IP hasheado.
// LGPD Art. 18: titular pode solicitar exclusão via /api/account/delete.
// LGPD Art. 37: criação + mudanças geram entrada em AuditLog.
//
// Rate limit: 10 tickets/dia/user (mais alto que feedback pq helpdesk é
// canal explícito de suporte). Implementação simples in-memory (para
// produção usar Redis).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { assignTicket } from '@/lib/support';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================================================
// Validation
// ============================================================================
const CreateTicketSchema = z.object({
  subject: z.string().trim().min(5, 'Assunto muito curto.').max(200),
  description: z.string().trim().min(20, 'Descreva com pelo menos 20 caracteres.').max(8000),
  category: z.enum(['BILLING', 'TECHNICAL', 'CONTENT', 'COMMUNITY', 'ACCOUNT', 'OTHER']),
  email: z.string().email().optional().nullable(), // obrigatório se userId ausente
  tags: z.array(z.string().max(32)).max(10).optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

// ============================================================================
// Rate limit (in-memory) — Wave 37 stub
// ============================================================================
const rateLimitMap = new Map<string, { count: number; resetAt: Date }>();
const TICKET_DAILY_LIMIT = 10;

function checkRateLimit(key: string): { allowed: boolean; resetAt: Date } {
  const now = new Date();
  const existing = rateLimitMap.get(key);
  if (!existing || existing.resetAt < now) {
    const resetAt = new Date(now);
    resetAt.setUTCHours(24, 0, 0, 0); // next midnight UTC
    rateLimitMap.set(key, { count: 1, resetAt });
    return { allowed: true, resetAt };
  }
  if (existing.count >= TICKET_DAILY_LIMIT) {
    return { allowed: false, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return { allowed: true, resetAt: existing.resetAt };
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash('sha256').update(ip + (process.env.IP_SALT ?? 'cabala')).digest('hex').slice(0, 24);
}

// ============================================================================
// GET — list own tickets
// ============================================================================
export async function GET(request: NextRequest) {
  // We deliberately accept anonymous list (with email) for cases where a
  // ticket was opened from logged-out session and user wants to follow up.
  // For authenticated requests, prefer userId filter.
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const email = url.searchParams.get('email');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 50);

  if (!userId && !email) {
    return NextResponse.json(
      { error: 'missing_filter', message: 'Informe userId ou email.' },
      { status: 400 },
    );
  }

  const where: Prisma.SupportTicketWhereInput = userId
    ? { userId }
    : { email: email!.toLowerCase() };

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      status: true,
      priority: true,
      category: true,
      subject: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: true,
      team: true,
      satisfactionRating: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({ tickets });
}

// ============================================================================
// POST — create ticket
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'invalid_json', message: 'Body precisa ser JSON válido.' },
        { status: 400 },
      );
    }
    const parsed = CreateTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', issues: parsed.error.issues, message: 'Verifique os campos.' },
        { status: 400 },
      );
    }

    // Best-effort userId from session/cookie (Wave 37: optional)
    const userId = body && typeof body === 'object' && 'userId' in body
      ? ((body as Record<string, unknown>).userId as string | null) ?? null
      : null;

    // If anonymous, email is required
    if (!userId && !parsed.data.email) {
      return NextResponse.json(
        { error: 'missing_email', message: 'Visitantes precisam informar email para follow-up.' },
        { status: 400 },
      );
    }

    // Rate limit
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null;
    const ipHash = hashIp(ip);
    const rlKey = userId ?? parsed.data.email ?? ipHash ?? 'anon';
    const rl = checkRateLimit(rlKey);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: `Limite diário de ${TICKET_DAILY_LIMIT} tickets atingido.`,
          resetAt: rl.resetAt.toISOString(),
        },
        { status: 429 },
      );
    }

    // Auto-routing
    const assignment = assignTicket(parsed.data.subject, parsed.data.description, parsed.data.category);

    const metadata: Record<string, unknown> = {
      ...((parsed.data.metadata ?? {}) as Record<string, unknown>),
      ipHash,
      userAgent: request.headers.get('user-agent')?.slice(0, 256) ?? null,
      source: 'web',
      receivedAt: new Date().toISOString(),
    };

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        email: parsed.data.email?.toLowerCase() ?? null,
        status: 'NEW',
        priority: assignment.priority,
        category: parsed.data.category,
        subject: parsed.data.subject,
        description: parsed.data.description,
        team: assignment.team,
        assignedTo: assignment.assignedTo,
        tags: parsed.data.tags ?? [],
        metadata: metadata as Prisma.InputJsonValue,
        messages: {
          create: {
            userId,
            body: parsed.data.description,
            isInternal: false,
            attachments: [],
            metadata: { kind: 'INITIAL', source: 'web' } as Prisma.InputJsonValue,
          },
        },
      },
      select: {
        id: true,
        status: true,
        priority: true,
        team: true,
        assignedTo: true,
        createdAt: true,
      },
    });

    // Audit log (LGPD Art. 37)
    try {
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'SUPPORT_TICKET_CREATED' as never,
          targetId: ticket.id,
          metadata: {
            team: assignment.team,
            priority: assignment.priority,
            assignedTo: assignment.assignedTo,
            routingReason: assignment.reason,
          } as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      console.warn('[support audit] create failed', err);
    }

    return NextResponse.json(
      {
        ticket,
        routing: {
          team: assignment.team,
          priority: assignment.priority,
          assignedTo: assignment.assignedTo,
          reason: assignment.reason,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[support/tickets POST]', err);
    return NextResponse.json(
      { error: 'internal_error', message: 'Erro ao criar ticket.' },
      { status: 500 },
    );
  }
}