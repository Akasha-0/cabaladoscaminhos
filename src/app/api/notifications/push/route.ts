// ============================================================================
// API /api/notifications/push — gerenciar push subscriptions
// ============================================================================
// POST   /api/notifications/push   — registrar/atualizar subscription
// DELETE /api/notifications/push   — remover subscription (unsubscribe)
// GET    /api/notifications/push   — listar subscriptions do user
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import {
  getVapidPublicKey,
  isVapidConfigured,
  removeSubscription,
  saveSubscription,
} from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// ============================================================================
// Schemas
// ============================================================================

const SubscribeBodySchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const DeleteBodySchema = z.object({
  endpoint: z.string().url(),
});

// ============================================================================
// POST — registrar/atualizar
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = SubscribeBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Subscription inválida', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!isVapidConfigured()) {
      return NextResponse.json(
        {
          error: 'Push não configurado no servidor (VAPID ausente)',
          hint: 'Gere chaves VAPID e defina VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY',
        },
        { status: 503 }
      );
    }

    const userAgent = request.headers.get('user-agent');
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip');

    const result = await saveSubscription(prisma, {
      userId: viewer.id,
      endpoint: parsed.data.endpoint,
      keys: parsed.data.keys,
      userAgent,
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      created: result.created,
      vapidPublicKey: getVapidPublicKey(),
    });
  } catch (err) {
    console.error('[api/notifications/push][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao registrar subscription' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE — remover subscription
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = DeleteBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Endpoint inválido' },
        { status: 400 }
      );
    }

    // Verificar que a subscription pertence ao viewer antes de deletar
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: parsed.data.endpoint },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ success: true, removed: false });
    }
    if (existing.userId !== viewer.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const removed = await removeSubscription(prisma, parsed.data.endpoint);
    return NextResponse.json({ success: true, removed });
  } catch (err) {
    console.error('[api/notifications/push][DELETE] error', err);
    return NextResponse.json(
      { error: 'Erro ao remover subscription' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET — listar (e retornar VAPID public key)
// ============================================================================

export async function GET() {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const subs = await prisma.pushSubscription.findMany({
      where: { userId: viewer.id, active: true },
      select: {
        id: true,
        endpoint: true,
        userAgent: true,
        lastSentAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      subscriptions: subs,
      vapidPublicKey: getVapidPublicKey(),
      vapidConfigured: isVapidConfigured(),
    });
  } catch (err) {
    console.error('[api/notifications/push][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao listar subscriptions' },
      { status: 500 }
    );
  }
}
