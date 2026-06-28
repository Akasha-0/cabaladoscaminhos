// ============================================================================
// MENTORSHIP — /api/mentorship/me
// ============================================================================
// GET → lista mentorias onde o viewer é mentor ou mentee.
//       Requer auth. Filtro opcional por status.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { ListMyMentorshipsQuerySchema } from '@/lib/validators/mentorship';
import { listMyMentorships } from '@/lib/community/mentorship';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const sp = request.nextUrl.searchParams;
    const parsed = ListMyMentorshipsQuerySchema.safeParse({
      status: sp.get('status') ?? undefined,
    });
    if (!parsed.success) return fromZodError(parsed.error);

    const mentorships = await listMyMentorships({
      userId: viewer.id,
      status: parsed.data.status,
    });

    return ok(mentorships, { meta: { count: mentorships.length } });
  } catch (err) {
    return handleError(err);
  }
}