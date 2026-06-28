// ============================================================================
// POST /api/admin/moderation/flags/[id]/resolve — resolver flag (Wave 20)
// ============================================================================
// Body: { action: 'dismiss' | 'hide' | 'delete' | 'warn' }
//
// - dismiss: marca flag como DISMISSED (não age no alvo)
// - hide:    soft-delete do alvo + flag ACTIONED
// - delete:  soft-delete do alvo + flag ACTIONED
// - warn:    no-op no alvo, registra intenção de aviso (Wave 21 = notif)
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
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
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(403, ErrorCode.FORBIDDEN, `Admin required (${session.reason})`);
    }

    const { id: flagId } = await params;
    if (!flagId) {
      return fail(400, ErrorCode.BAD_REQUEST, 'id obrigatório');
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'Body JSON inválido');
    }

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const result = await resolveFlag({
      flagId,
      adminId: session.userId,
      action: parsed.data.action,
    });

    return ok(result, { meta: { flagId }, cache: { noStore: true } });
  } catch (err) {
    if (err instanceof Error && err.message === 'FLAG_NOT_FOUND') {
      return fail(404, ErrorCode.NOT_FOUND, 'Flag não encontrada');
    }
    return handleError(err, 'POST /api/admin/moderation/flags/[id]/resolve');
  }
}
