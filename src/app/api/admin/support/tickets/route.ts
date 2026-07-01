// ============================================================================
// GET /api/admin/support/tickets — agent queue (assigned + unassigned)
// ============================================================================
// Filtros: status, priority, team, assignedTo, search (subject + email).
// Inclui SLA status calculado.
//
// LGPD Art. 7: PII (email, userId) só aparece para agentes autenticados.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeSlaStatus } from '@/lib/support';
import type { Prisma, TicketPriority } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const priority = url.searchParams.get('priority');
  const team = url.searchParams.get('team');
  const assignedTo = url.searchParams.get('assignedTo');
  const unassignedOnly = url.searchParams.get('unassigned') === 'true';
  const search = url.searchParams.get('q')?.trim();
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 100);
  const offset = parseInt(url.searchParams.get('offset') ?? '0', 10) || 0;

  const where: Prisma.SupportTicketWhereInput = {
    ...(status ? { status: status as Prisma.SupportTicketWhereInput['status'] } : {}),
    ...(priority ? { priority: priority as TicketPriority } : {}),
    ...(team ? { team } : {}),
    ...(assignedTo ? { assignedTo } : {}),
    ...(unassignedOnly ? { assignedTo: null } : {}),
    ...(search
      ? {
          OR: [
            { subject: { contains: search, mode: 'insensitive' } },
            { email: { contains: search.toLowerCase(), mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      take: limit,
      skip: offset,
      select: {
        id: true,
        status: true,
        priority: true,
        category: true,
        subject: true,
        email: true,
        userId: true,
        assignedTo: true,
        team: true,
        createdAt: true,
        updatedAt: true,
        firstResponseAt: true,
        resolvedAt: true,
        satisfactionRating: true,
        _count: { select: { messages: true } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  // Compute SLA status for each (no PII in returned `sla` field)
  const enriched = tickets.map((t) => {
    const sla = computeSlaStatus({
      plan: 'FREE', // assume FREE; PRO upgrade detection em runtime
      priority: t.priority,
      createdAt: t.createdAt,
      firstResponseAt: t.firstResponseAt,
      resolvedAt: t.resolvedAt,
      status: t.status,
    });
    return { ...t, sla };
  });

  return NextResponse.json({
    tickets: enriched,
    pagination: { total, limit, offset },
  });
}