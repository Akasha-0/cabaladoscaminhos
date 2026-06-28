// ============================================================================
// EVENT JOIN — /api/events/[id]/join
// ============================================================================
// POST → RSVP: viewer confirma presença no evento (idempotente)
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { joinEvent } from '@/lib/community/events';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado para participar');
    }

    const { id } = await params;
    if (!id || id.length < 8) {
      return fail(400, ErrorCode.BAD_REQUEST, 'ID de evento inválido');
    }

    try {
      const result = await joinEvent({ eventId: id, userId: viewer.id });
      return ok(result, {
        status: result.joined ? 201 : 200,
        meta: { eventId: id, userId: viewer.id },
      });
    } catch (err) {
      const e = err as { name?: string; message?: string };
      if (e.name === 'EventNotFoundError') {
        return fail(404, ErrorCode.NOT_FOUND, e.message ?? 'Evento não encontrado');
      }
      if (e.name === 'EventFullError') {
        return fail(409, ErrorCode.CONFLICT, e.message ?? 'Evento lotado');
      }
      if (e.name === 'EventAlreadyStartedError') {
        return fail(409, ErrorCode.CONFLICT, e.message ?? 'Evento já começou');
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}