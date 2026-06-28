// ============================================================================
// EVENT RSVP — POST /api/events/[id]/rsvp
// ============================================================================
// Wave 21 (2026-06-28) — endpoint explícito de RSVP com 3 estados.
//
// Substitui o POST /api/events/[id]/join como forma canônica de
// confirmar presença. O endpoint /join continua funcionando (apenas
// status=GOING), mas /rsvp é o caminho recomendado para a UI.
//
// Body (JSON):
//   { status: 'going' | 'maybe' | 'declined' }
// (lowercase para ergonomia do client; mapeado para enum Prisma)
//
// Comportamento:
//   - 'going'    → cria/atualiza EventParticipant com status=GOING
//   - 'maybe'    → cria/atualiza EventParticipant com status=MAYBE (não conta)
//   - 'declined' → cria/atualiza EventParticipant com status=DECLINED
//
// Idempotente: re-submitir o mesmo status retorna changed=false.
//
// Triggers:
//   - Notificação para o host quando alguém confirma (going) — fanout
//     via createNotification com type=GROUP_POST (sem grupo) — reusamos
//     NOTIFICATION_TYPE custom se existir; senão, manda via SYSTEM.
//
// Auth: required (requireViewer).
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { setRsvpStatus } from '@/lib/community/events';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// Schema
// ============================================================================

const RsvpStatusSchema = z.enum(['going', 'maybe', 'declined']);

const RsvpSchema = z.object({
  status: RsvpStatusSchema,
});

type RsvpStatusInput = z.infer<typeof RsvpStatusSchema>;

function mapToPrismaStatus(
  input: RsvpStatusInput
): 'GOING' | 'MAYBE' | 'DECLINED' {
  switch (input) {
    case 'going':
      return 'GOING';
    case 'maybe':
      return 'MAYBE';
    case 'declined':
      return 'DECLINED';
  }
}

// ============================================================================
// POST handler
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(
        401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para confirmar presença'
      );
    }

    const { id } = await params;
    if (!id || id.length < 8) {
      return fail(400, ErrorCode.BAD_REQUEST, 'ID de evento inválido');
    }

    const body = (await request.json().catch(() => null)) as
      | z.infer<typeof RsvpSchema>
      | null;
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = RsvpSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const status = mapToPrismaStatus(parsed.data.status);

    // Lookup do evento (necessário para notificar host)
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        hostId: true,
        title: true,
        startsAt: true,
        tradition: true,
      },
    });
    if (!event) {
      return fail(404, ErrorCode.NOT_FOUND, 'Evento não encontrado');
    }

    let result;
    try {
      result = await setRsvpStatus({
        eventId: id,
        userId: viewer.id,
        status,
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
      if (e.name === 'EventHostCannotChangeRsvpError') {
        return fail(409, ErrorCode.CONFLICT, e.message ?? 'Host já conta como participante');
      }
      throw err;
    }

    // Trigger notificação para o host quando:
    //   1. status === 'going'
    //   2. mudou (changed === true) — evita spam de re-confirmações
    //   3. host !== viewer (não notifica self)
    if (result.status === 'GOING' && result.changed && event.hostId !== viewer.id) {
      try {
        await createNotification({
          userId: event.hostId,
          actorId: viewer.id,
          type: 'SYSTEM_ALERT', // usamos SYSTEM_ALERT para evento (sem enum específico)
          entityType: 'SYSTEM',
          entityId: event.id,
          payload: {
            kind: 'event_rsvp',
            eventId: event.id,
            eventTitle: event.title,
            startsAt: event.startsAt.toISOString(),
            tradition: event.tradition,
            rsvpStatus: result.status,
          },
          respectPreferences: true,
        });
      } catch (err) {
        // Notificação é best-effort — não bloqueia o response
        console.error('[api/events/[id]/rsvp] notification failed:', err);
      }
    }

    // Recarregar o evento pra devolver contagem atualizada
    const updated = await prisma.event.findUnique({
      where: { id },
      select: { participantsCount: true },
    });

    return ok(
      {
        eventId: id,
        userId: viewer.id,
        status: result.status,
        changed: result.changed,
        participantsCount: updated?.participantsCount ?? 0,
      },
      {
        status: result.changed ? 200 : 200, // 200 em ambos os casos
        meta: { eventId: id },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}