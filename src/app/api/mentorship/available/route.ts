// ============================================================================
// MENTORSHIP — /api/mentorship/available
// ============================================================================
// GET → lista mentores disponíveis, com filtro opcional por tradição.
//        Não exige auth (lista é pública). Quando viewerId é inferido do
//        header dev, marca isAvailable=false para mentores com mentoria
//        pendente/ativa com o viewer.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fromZodError, handleError } from '@/lib/community/api';
import { getViewer } from '@/lib/community/auth';
import { ListMentorsQuerySchema } from '@/lib/validators/mentorship';
import { listAvailableMentors } from '@/lib/community/mentorship';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const parsed = ListMentorsQuerySchema.safeParse({
      tradition: sp.get('tradition') ?? undefined,
      limit: sp.get('limit') ?? undefined,
    });
    if (!parsed.success) return fromZodError(parsed.error);

    const viewer = await getViewer();

    const mentors = await listAvailableMentors({
      tradition: parsed.data.tradition ?? null,
      viewerId: viewer?.id ?? null,
      limit: parsed.data.limit,
    });

    return ok(mentors, {
      meta: {
        count: mentors.length,
        viewerId: viewer?.id ?? null,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}