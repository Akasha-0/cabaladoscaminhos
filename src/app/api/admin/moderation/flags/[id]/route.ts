// ============================================================================
// POST /api/admin/moderation/flags/[id]/resolve — resolver flag (Wave 20)
// ============================================================================
// Body: { action: 'dismiss' | 'hide' | 'delete' | 'warn' }
//
// - dismiss: marca flag como DISMISSED (não age no alvo)
// - hide:    soft-delete do alvo + flag ACTIONED
// - delete:  soft-delete do alvo + flag ACTIONED
// - warn:    no-op no alvo, registra intenção de aviso (Wave 21 = notif)
//
// Wave 25 (2026-06-28): aceita MODERADOR (isModerator=true) além de ADMIN.
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireModerator } from '@/lib/admin/session';
import { resolveFlag } from '@/lib/admin/metrics';

export const runtime = 'nodejs';

const BodySchema = z.object({
  action: z.enum(['dismiss', 'hide', 'delete', 'warn']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireModerator();
    if (!session.ok) {
      return fail(
        ErrorCode.FORBIDDEN,
        `Moderator access required (${session.reason ?? 'denied'})`,
        403
      );
    }

    const { id: flagId } = await params;
    if (!flagId) {
      return fail(ErrorCode.BAD_REQUEST, 'id obrigatório', 400);
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      return fail(ErrorCode.BAD_REQUEST, 'Body JSON inválido', 400);
    }

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const result = await resolveFlag({
      flagId,
      adminId: session.userId!,
      action: parsed.data.action,
    });

    return ok(result, {
      meta: { flagId, role: session.role },
      cache: { noStore: true },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'FLAG_NOT_FOUND') {
      return fail(ErrorCode.NOT_FOUND, 'Flag não encontrada', 404);
    }
    return handleError(err, 'POST /api/admin/moderation/flags/[id]/resolve');
  }
}
