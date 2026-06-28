// ============================================================================
// EVENT PARTICIPANTS — /api/events/[id]/participants
// ============================================================================
// GET → lista de participantes (RSVP) de um evento
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { listEventParticipants } from '@/lib/community/events';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || id.length < 8) {
      return fail(400, ErrorCode.BAD_REQUEST, 'ID de evento inválido');
    }

    try {
      const participants = await listEventParticipants({ eventId: id });
      return ok(participants, {
        cache: { sMaxage: 15, staleWhileRevalidate: 30 },
        meta: { count: participants.length, eventId: id },
      });
    } catch (err) {
      const e = err as { name?: string; message?: string };
      if (e.name === 'EventNotFoundError') {
        return fail(404, ErrorCode.NOT_FOUND, e.message ?? 'Evento não encontrado');
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}