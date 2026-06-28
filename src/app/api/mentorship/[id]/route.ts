// ============================================================================
// MENTORSHIP — /api/mentorship/[id]
// ============================================================================
// GET → detalhes da mentoria + histórico de mensagens (chat simples).
//       Requer auth. Apenas mentor e mentee podem ler.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import {
  getMentorship,
  MentorshipNotFoundError,
  MentorshipForbiddenError,
} from '@/lib/community/mentorship';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
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

    try {
      const result = await getMentorship({
        mentorshipId: id,
        viewerId: viewer.id,
      });
      if (!result) {
        return fail(404, ErrorCode.NOT_FOUND, 'Mentoria não encontrada');
      }
      return ok(result, { meta: { viewerId: viewer.id } });
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