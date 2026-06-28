// ============================================================================
// API /api/notifications/push/subscribe — gerenciar subscriptions Web Push
// ============================================================================
// POST   /api/notifications/push/subscribe    — registrar/atualizar subscription
// DELETE /api/notifications/push/subscribe    — remover subscription por endpoint
// GET    /api/notifications/push/subscribe    — obter VAPID public key
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import {
  getVapidPublicKey,
  isVapidConfigured,
  subscribeUser,
  unsubscribeUser,
} from '@/lib/notifications/push-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // web-push precisa de Node runtime

// ============================================================================
// Schemas
// ============================================================================

const SubscribeBodySchema = z.object({
  endpoint: z.string().url().min(10),
  keys: z.object({
    p256dh: z.string().min(10),
    auth: z.string().min(10),
  }),
});

const UnsubscribeBodySchema = z.object({
  endpoint: z.string().url().min(10),
});

// ============================================================================
// GET — expor VAPID public key para o client
// ============================================================================

export async function GET() {
  try {
    if (!isVapidConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          message:
            'VAPID não configurado neste ambiente. Push funcionará em modo log (dev).',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      configured: true,
      publicKey: getVapidPublicKey(),
    });
  } catch (err) {
    console.error('[api/notifications/push/subscribe][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao obter configuração push' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST — registrar subscription
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const raw = await request.json().catch(() => ({}));
    const parsed = SubscribeBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Body inválido',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent');
    // IP — em prod usaria X-Forwarded-For; aqui pegamos direto
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null;

    const result = await subscribeUser(viewer.id, {
      endpoint: parsed.data.endpoint,
      keys: parsed.data.keys,
      userAgent,
      ipAddress,
    });

    return NextResponse.json({
      ok: true,
      id: result.id,
      created: result.created,
    });
  } catch (err) {
    console.error('[api/notifications/push/subscribe][POST] error', err);
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
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const raw = await request.json().catch(() => ({}));
    const parsed = UnsubscribeBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Body inválido',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Verificar que a subscription pertence ao viewer (segurança)
    const sub = await prisma.pushSubscription.findUnique({
      where: { endpoint: parsed.data.endpoint },
      select: { userId: true },
    });

    if (!sub) {
      // Idempotente — não existia, ok
      return NextResponse.json({ ok: true, removed: false });
    }

    if (sub.userId !== viewer.id) {
      return NextResponse.json(
        { error: 'Não autorizado a remover esta subscription' },
        { status: 403 }
      );
    }

    const removed = await unsubscribeUser(parsed.data.endpoint);
    return NextResponse.json({ ok: true, removed });
  } catch (err) {
    console.error('[api/notifications/push/subscribe][DELETE] error', err);
    return NextResponse.json(
      { error: 'Erro ao remover subscription' },
      { status: 500 }
    );
  }
}
