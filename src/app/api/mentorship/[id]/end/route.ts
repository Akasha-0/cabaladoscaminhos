// ============================================================================
// MENTORSHIP — /api/mentorship/[id]/end
// ============================================================================
// POST → mentor ou mentee encerra a mentoria (→ COMPLETED).
//        Requer auth. Idempotente: chamar em COMPLETED retorna o estado atual.
//        Body opcional: { reason: "..." } salvo em metadata.endReason.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { EndMentorshipSchema } from '@/lib/validators/mentorship';
import {
  endMentorship,
  MentorshipNotFoundError,
  MentorshipForbiddenError,
} from '@/lib/community/mentorship';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const { id } = await params;

    // Body é opcional (pode encerrar sem motivo)
    let body: unknown = {};
    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
        body = JSON.parse(text);
      }
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = EndMentorshipSchema.safeParse(body ?? {});
    if (!parsed.success) return fromZodError(parsed.error);

    try {
      const mentorship = await endMentorship({
        mentorshipId: id,
        actorId: viewer.id,
        reason: parsed.data.reason ?? null,
      });
      return ok(mentorship);
    } catch (err) {
      if (err instanceof MentorshipNotFoundError) {
        return fail(404, ErrorCode.NOT_FOUND, err.message);
      }
      if (err instanceof MentorshipForbiddenError) {
        return fail(403, ErrorCode.FORBIDDEN, err.message);
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}