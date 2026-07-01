// ============================================================================
// COMMUNITY EVENT LIVE — /api/community/events/[id]/live
// ============================================================================
// GET → retorna config de live streaming (playback URL + settings)
// POST → host atualiza config (stream key, captions URL, etc)
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { getViewer, requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { buildLiveConfig, type LiveProvider } from '@/lib/events/live';

export const dynamic = 'force-dynamic';

const UpdateLiveSchema = z.object({
  provider: z.enum(['mux', 'cloudflare', 'aws-ivs', 'self-hosted', 'hls-only']),
  playbackUrl: z.string().url().optional(),
  streamKey: z.string().min(8).max(200).optional(),
  captionsVttUrl: z.string().url().optional(),
});

interface RouteParams {
  params: { id: string };
}

// ============================================================================
// GET — viewer access
// ============================================================================

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const viewer = await getViewer();

    const event = await prisma.communityEvent.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return fail(ErrorCode.NOT_FOUND, 'event not found');
    }

    if (event.type !== 'LIVESTREAM') {
      return fail(ErrorCode.VALIDATION, 'event is not a livestream');
    }

    const isHost = viewer?.id === event.hostId;

    // Para viewers, verificar RSVP
    if (!isHost) {
      if (!viewer) {
        return fail(ErrorCode.UNAUTHORIZED, 'login required');
      }
      const rsvp = await prisma.eventRsvp.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: viewer.id } },
      });
      if (!rsvp || !['GOING', 'WAITLIST'].includes(rsvp.status)) {
        return fail(ErrorCode.FORBIDDEN, 'RSVP required to access live stream');
      }
    }

    const config = buildLiveConfig(
      event.id,
      'hls-only', // Default; em prod viria de coluna dedicada
      event.startsAt,
      event.endsAt,
    );

    // Não expor streamKey/ingestUrl ao viewer
    return ok({
      eventId: event.id,
      title: event.title,
      type: event.type,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      config: isHost
        ? config
        : {
            ...config,
            streamKey: undefined,
            ingestUrl: undefined,
          },
      isHost,
      viewerCount: 0, // populated by separate polling endpoint
    });
  } catch (err) {
    return handleError(err);
  }
}

// ============================================================================
// POST — host updates config
// ============================================================================

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const viewer = await requireViewer();
    const body = await request.json();
    const parsed = UpdateLiveSchema.safeParse(body);

    if (!parsed.success) {
      return fail(ErrorCode.VALIDATION, 'Invalid body', { issues: parsed.error.issues });
    }

    const event = await prisma.communityEvent.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return fail(ErrorCode.NOT_FOUND, 'event not found');
    }

    if (event.hostId !== viewer.id) {
      return fail(ErrorCode.FORBIDDEN, 'only host can update live config');
    }

    if (event.type !== 'LIVESTREAM') {
      return fail(ErrorCode.VALIDATION, 'event is not a livestream');
    }

    // Em prod, esses campos ficariam em colunas dedicadas ou JSON no CommunityEvent.
    // Aqui validamos apenas que o body bate no schema.
    return ok({
      eventId: event.id,
      provider: parsed.data.provider,
      configured: true,
    });
  } catch (err) {
    return handleError(err);
  }
}