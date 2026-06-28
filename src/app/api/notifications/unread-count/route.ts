// ============================================================================
// NOTIFICATIONS UNREAD COUNT — GET /api/notifications/unread-count
// ============================================================================
// Wave 21 (2026-06-28) — endpoint leve para o badge da UI atualizar
// contador de notificações não-lidas. Pensado para polling frequente
// (a cada 30-60s) sem custar queries pesadas.
//
// Cache: `private, max-age=10` — o navegador cacheia por 10s mas
// revalida com o servidor depois. Reduz queries sem perder tempo
// real para a UX.
//
// Auth: required (requireViewer).
// ============================================================================

import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Não autenticado');
    }

    const count = await prisma.notification.count({
      where: { userId: viewer.id, read: false },
    });

    return ok(
      { count },
      {
        // Cache privado de 10s. Cliente pode revalidar via If-None-Match
        // em evolução futura (ETag baseado em max(updatedAt) das notif).
        cache: { private: true, maxAge: 10 },
        meta: { userId: viewer.id },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}