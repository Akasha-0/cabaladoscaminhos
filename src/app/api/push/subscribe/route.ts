// ============================================================================
// PUSH SUBSCRIBE — /api/push/subscribe
// ============================================================================
// Wave 21 (2026-06-28) — API crítica faltante do Wave 13 push.
//
// POST   → persiste PushSubscription do browser (subscribe)
// DELETE → remove PushSubscription (unsubscribe)
//
// POST Body (JSON):
//   { endpoint: string, keys: { p256dh: string, auth: string } }
//
// DELETE Body (JSON):
//   { endpoint: string }
//
// Ambos idempotentes: re-subscribe atualiza, re-unsubscribe retorna
// removed=false sem erro. DELETE também verifica ownership para evitar
// que um user remova a subscription de outro.
//
// Headers opcionais (capturados como metadata no POST):
//   User-Agent, x-forwarded-for (ou x-real-ip)
//
// Auth: required (requireViewer) em ambos.
//
// Resposta POST:
//   201 Created → { id, endpoint, created: true|false } (nova subscription)
//   200 OK      → { id, endpoint, created: false }      (já existia, atualizada)
//   401 Unauthorized → sem auth
//   400 Bad Request → schema inválido
//
// Resposta DELETE:
//   200 OK → { endpoint, removed: true|false }
//   401 Unauthorized → sem auth
//   400 Bad Request → schema inválido
//   403 Forbidden → subscription pertence a outro user
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { subscribeUser } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// Schemas
// ============================================================================

const KeysSchema = z.object({
  p256dh: z.string().min(10).max(500),
  auth: z.string().min(5).max(100),
});

const SubscribeSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: KeysSchema,
});

const UnsubscribeSchema = z.object({
  endpoint: z.string().url().max(2048),
});

type SubscribeBody = z.infer<typeof SubscribeSchema>;

// ============================================================================
// POST — subscribe
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado para ativar push');
    }

    const body = (await request.json().catch(() => null)) as SubscribeBody | null;
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = SubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    // Metadata para auditoria/debug (User-Agent, IP)
    let userAgent: string | null = null;
    let ipAddress: string | null = null;
    try {
      const h = await headers();
      userAgent = h.get('user-agent');
      ipAddress =
        h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        h.get('x-real-ip') ??
        null;
    } catch {
      // headers() indisponível — segue sem metadata
    }

    const result = await subscribeUser(viewer.id, {
      endpoint: parsed.data.endpoint,
      keys: parsed.data.keys,
      userAgent,
      ipAddress,
    });

    return ok(
      {
        id: result.id,
        endpoint: parsed.data.endpoint,
        created: result.created,
      },
      {
        status: result.created ? 201 : 200,
        meta: { userId: viewer.id },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}

// ============================================================================
// DELETE — unsubscribe
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado para desativar push');
    }

    const body = (await request.json().catch(() => null)) as
      | z.infer<typeof UnsubscribeSchema>
      | null;
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = UnsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: parsed.data.endpoint },
      select: { id: true, userId: true },
    });

    if (!existing) {
      // Já removida — operação idempotente
      return ok({ endpoint: parsed.data.endpoint, removed: false });
    }

    if (existing.userId !== viewer.id) {
      return fail(
        403,
        ErrorCode.FORBIDDEN,
        'Esta subscription pertence a outro usuário'
      );
    }

    await prisma.pushSubscription.delete({ where: { id: existing.id } });

    return ok({ endpoint: parsed.data.endpoint, removed: true });
  } catch (err) {
    return handleError(err);
  }
}