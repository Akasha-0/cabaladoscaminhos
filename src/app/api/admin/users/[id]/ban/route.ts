// ============================================================================
// POST /api/admin/users/[id]/ban — banir usuário (Wave 20)
// ============================================================================
// Body: { reason: string }
// Persiste em AuditLog com action=ADMIN_USER_BAN.
// Não temos modelo `Ban` persistente no schema atual; flag é derivada da
// presença de ação ADMIN_USER_BAN sem ADMIN_USER_UNBAN subsequente.
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { banUser } from '@/lib/admin/metrics';

export const runtime = 'nodejs';

const BodySchema = z.object({
  reason: z.string().trim().min(3).max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(ErrorCode.FORBIDDEN, `Admin required (${session.reason})`, 403);
    }

    const { id: userId } = await params;
    if (!userId) {
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

    // Não banir a si mesmo
    if (userId === session.userId) {
      return fail(ErrorCode.BAD_REQUEST, 'Você não pode banir a si mesmo', 400);
    }

    const result = await banUser({
      userId,
      adminId: session.userId,
      reason: parsed.data.reason,
    });

    return ok(
      { auditLogId: result.auditLogId, banned: true },
      { meta: { userId }, cache: { noStore: true } }
    );
  } catch (err) {
    return handleError(err, 'POST /api/admin/users/[id]/ban');
  }
}
