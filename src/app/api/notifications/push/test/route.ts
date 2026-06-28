// ============================================================================
// API /api/notifications/push/test — enviar push de teste (DEV ONLY)
// ============================================================================
// POST /api/notifications/push/test   { title?, body?, url? }
//   - Apenas em NODE_ENV !== 'production'
//   - Apenas para usuário autenticado
//   - Envia push para todas as subscriptions ativas do viewer
//   - Útil para QA manual + smoke tests do service worker
//
// Em prod retorna 404 (oculta a rota).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getViewer } from '@/lib/community/auth';
import { sendPush } from '@/lib/notifications/push-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TestPushBodySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  body: z.string().min(1).max(300).optional(),
  url: z.string().min(1).max(500).optional(),
});

// ============================================================================
// POST
// ============================================================================

export async function POST(request: NextRequest) {
  // Guard: prod-safe — retorna 404 em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint disponível apenas em desenvolvimento' },
      { status: 404 }
    );
  }

  try {
    const viewer = await getViewer();
    if (!viewer) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const raw = await request.json().catch(() => ({}));
    const parsed = TestPushBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Body inválido',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await sendPush(viewer.id, {
      title: parsed.data.title ?? '🔔 Akasha Portal',
      body:
        parsed.data.body ??
        'Push de teste — se você está vendo isso, o service worker está ativo!',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: `test-${Date.now()}`,
      url: parsed.data.url ?? '/notifications',
      data: {
        type: 'TEST_PUSH',
        timestamp: Date.now(),
      },
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'dismiss', title: 'Dispensar' },
      ],
    });

    return NextResponse.json({
      ok: result.success,
      ...result,
    });
  } catch (err) {
    console.error('[api/notifications/push/test][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao enviar push de teste' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET — info do endpoint (útil pra debug no browser)
// ============================================================================

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    endpoint: '/api/notifications/push/test',
    methods: ['POST'],
    description:
      'Envia push de teste para o usuário autenticado. Dev only.',
    example: {
      method: 'POST',
      body: {
        title: 'Teste manual',
        body: 'Verificando que push está funcionando',
        url: '/notifications',
      },
    },
  });
}
