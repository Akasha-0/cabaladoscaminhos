/**
 * GET  /api/notifications
 *   Lista as notificações do usuário autenticado.
 *   Query params:
 *     - unreadOnly=true  → só não-lidas (default false)
 *     - limit=1..100     → máximo de itens (default 50, cap 100)
 *
 * PATCH /api/notifications
 *   Marca TODAS as notificações não-lidas do usuário como lidas.
 *   Retorna { markedCount: number }.
 *
 * Auth: requireAkashaApi (cookie akasha_session).
 *
 * Por que GET lista lidas + não-lidas por default (não só unread):
 *   - O dropdown do bell mostra as últimas 5 (mistas), badge mostra count
 *     de unread separadamente. Forçar `unreadOnly=true` no GET quebraria
 *     o dropdown. Caller decide o filtro via query param.
 *
 * Por que PATCH é bulk (não single):
 *   - UX "Marcar todas como lidas" é uma ação comum.
 *   - Single-item mark-as-read fica em PATCH /api/notifications/:id
 *     (route separada em [id]/route.ts).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { toDTO } from '@/lib/application/notifications/create';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  // ─── Parse query params ──────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const limitRaw = searchParams.get('limit');
  let limit = DEFAULT_LIMIT;
  if (limitRaw) {
    const parsed = parseInt(limitRaw, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, MAX_LIMIT);
    }
  }

  // ─── Query ───────────────────────────────────────────────────────
  const rows = await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      href: true,
      readAt: true,
      createdAt: true,
    },
  });

  // ─── Compute unread count (sempre útil pro badge) ───────────────
  const unreadCount = await prisma.notification.count({
    where: { userId, readAt: null },
  });

  return NextResponse.json({
    notifications: rows.map(toDTO),
    unreadCount,
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.id;

  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    markedCount: result.count,
  });
}