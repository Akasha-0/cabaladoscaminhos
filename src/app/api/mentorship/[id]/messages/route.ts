// ============================================================================
// MENTORSHIP — /api/mentorship/[id]/messages
// ============================================================================
// POST → envia mensagem no chat 1-on-1.
//         Requer auth. Apenas mentor e mentee podem enviar.
//         Bloqueado se mentoria está COMPLETED.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { SendMentorshipMessageSchema } from '@/lib/validators/mentorship';
import {
  sendMentorshipMessage,
  MentorshipNotFoundError,
  MentorshipForbiddenError,
  MentorshipNotActiveError,
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
    const body = await request.json().catch(() => null);
    if (!body) return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');

    const parsed = SendMentorshipMessageSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    try {
      const message = await sendMentorshipMessage({
        mentorshipId: id,
        authorId: viewer.id,
        content: parsed.data.content,
      });
      return ok(message, { status: 201 });
    } catch (err) {
      if (err instanceof MentorshipNotFoundError) {
        return fail(404, ErrorCode.NOT_FOUND, err.message);
      }
      if (err instanceof MentorshipForbiddenError) {
        return fail(403, ErrorCode.FORBIDDEN, err.message);
      }
      if (err instanceof MentorshipNotActiveError) {
        return fail(400, ErrorCode.BAD_REQUEST, err.message);
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}