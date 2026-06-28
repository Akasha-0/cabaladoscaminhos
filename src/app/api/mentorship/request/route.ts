// ============================================================================
// MENTORSHIP — /api/mentorship/request
// ============================================================================
// POST → mentee solicita mentoria a um mentor (status=PENDING).
//         Requer auth. Bloqueia self-mentorship e duplicados.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { RequestMentorshipSchema } from '@/lib/validators/mentorship';
import {
  requestMentorship,
  SelfMentorshipError,
  MentorNotEligibleError,
  MentorshipAlreadyExistsError,
} from '@/lib/community/mentorship';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const body = await request.json().catch(() => null);
    if (!body) return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');

    const parsed = RequestMentorshipSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    try {
      const mentorship = await requestMentorship({
        mentorId: parsed.data.mentorId,
        menteeId: viewer.id,
        tradition: parsed.data.tradition,
        message: parsed.data.message ?? null,
      });
      return ok(mentorship, { status: 201 });
    } catch (err) {
      if (err instanceof SelfMentorshipError) {
        return fail(400, ErrorCode.BAD_REQUEST, err.message);
      }
      if (err instanceof MentorNotEligibleError) {
        return fail(400, ErrorCode.BAD_REQUEST, err.message);
      }
      if (err instanceof MentorshipAlreadyExistsError) {
        return fail(409, ErrorCode.CONFLICT, err.message);
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}