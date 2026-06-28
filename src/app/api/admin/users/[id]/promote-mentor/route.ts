// ============================================================================
// POST /api/admin/users/[id]/promote-mentor — promover a mentor (Wave 20)
// ============================================================================
// Body: { traditions: string[], bio?: string }
// Idempotente — chamar 2x apenas atualiza campos.
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { promoteToMentor } from '@/lib/admin/metrics';

export const runtime = 'nodejs';

const TRADITION_SLUG_RE = /^[a-z][a-z0-9-]{0,49}$/;

const BodySchema = z.object({
  traditions: z
    .array(z.string().regex(TRADITION_SLUG_RE, 'slug inválido'))
    .min(1)
    .max(10),
  bio: z.string().trim().max(500).optional(),
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

    const { id: userId } = await params;
    if (!userId) {
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

    const result = await promoteToMentor({
      userId,
      adminId: session.userId,
      traditions: parsed.data.traditions,
      bio: parsed.data.bio,
    });

    return ok(
      { promoted: result.updated },
      { meta: { userId }, cache: { noStore: true } }
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'USER_NOT_FOUND') {
      return fail(404, ErrorCode.NOT_FOUND, 'Usuário não encontrado');
    }
    return handleError(err, 'POST /api/admin/users/[id]/promote-mentor');
  }
}
