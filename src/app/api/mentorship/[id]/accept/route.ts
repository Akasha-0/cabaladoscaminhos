// ============================================================================
// MENTORSHIP — /api/mentorship/[id]/accept
// ============================================================================
// POST → mentor aceita uma solicitação de mentoria (PENDING → ACTIVE).
//        Requer auth. Apenas o mentor pode aceitar.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import {
  acceptMentorship,
  MentorshipNotFoundError,
  MentorshipForbiddenError,
  MentorshipInvalidStateError,
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

    try {
      const mentorship = await acceptMentorship({
        mentorshipId: id,
        actorId: viewer.id,
      });
      return ok(mentorship);
    } catch (err) {
      if (err instanceof MentorshipNotFoundError) {
        return fail(404, ErrorCode.NOT_FOUND, err.message);
      }
      if (err instanceof MentorshipForbiddenError) {
        return fail(403, ErrorCode.FORBIDDEN, err.message);
      }
      if (err instanceof MentorshipInvalidStateError) {
        return fail(400, ErrorCode.BAD_REQUEST, err.message);
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}