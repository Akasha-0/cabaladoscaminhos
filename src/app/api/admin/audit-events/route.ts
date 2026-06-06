// src/app/api/admin/audit-events/route.ts
// Fase 21 — Admin Audit Events Endpoint.
//
// GET /api/admin/audit-events
// Admin-only endpoint para consultar o log de eventos de segurança.
//
// Query params:
//   type       — SecurityEventType (ex: LOGIN_FAILURE)
//   operatorId — filtrar por operador
//   from       — data inicial (ISO string)
//   to         — data final (ISO string)
//   limit      — número de resultados (default: 50, max: 200)
//
// Response:
//   { events: SecurityEvent[], total: number, limit: number }

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperatorApi } from '@/lib/auth/operator-guard';
import type { Prisma } from '@prisma/client';

const querySchema = z.object({
  type: z.enum([
    'LOGIN_SUCCESS',
    'LOGIN_FAILURE',
    'REFRESH_REUSE',
    'RATE_LIMIT_EXCEEDED',
    'MFA_ENABLED',
    'MFA_DISABLED',
    'PASSWORD_CHANGED',
    'SESSION_REVOKED',
    'ACCOUNT_LOCKED',
  ]).optional(),
  operatorId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export async function GET(request: NextRequest) {
  // 1) Autenticação + Autorização ADMIN
  const guard = await requireOperatorApi(request);
  if (guard instanceof NextResponse) return guard;
  const operator = guard;

  if (operator.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Apenas operadores com role=ADMIN podem acessar o audit log.' },
      { status: 403 }
    );
  }

  // 2) Parse e validação de query params
  const searchParams = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    type: searchParams.get('type'),
    operatorId: searchParams.get('operatorId'),
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    limit: searchParams.get('limit'),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Parâmetros de query inválidos.',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { type, operatorId, from, to, limit } = parsed.data;

  // 3) Construir where clause
  const where: Prisma.SecurityEventWhereInput = {};

  if (type) {
    where.type = type;
  }
  if (operatorId) {
    where.operatorId = operatorId;
  }
  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = new Date(from);
    }
    if (to) {
      where.createdAt.lte = new Date(to);
    }
  }

  // 4) Query com paginação (limit)
  const [events, total] = await Promise.all([
    prisma.securityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.securityEvent.count({ where }),
  ]);

  return NextResponse.json({
    events,
    total,
    limit,
    hasMore: events.length === limit,
  });
}
