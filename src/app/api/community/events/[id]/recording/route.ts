// ============================================================================
// COMMUNITY EVENT RECORDING — /api/community/events/[id]/recording
// ============================================================================
// POST → salva URL de recording post-event (host only)
// GET  → retorna recording URL (público se evento COMPLETED)
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SaveSchema = z.object({
  recordingUrl: z.string().url(),
  duration: z.number().int().min(1).optional(),
});

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const viewer = await requireViewer();
    const body = await request.json();
    const parsed = SaveSchema.safeParse(body);

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
      return fail(ErrorCode.FORBIDDEN, 'only host can save recording');
    }

    const updated = await prisma.communityEvent.update({
      where: { id: params.id },
      data: {
        recordingUrl: parsed.data.recordingUrl,
        status: event.endsAt < new Date() ? 'COMPLETED' : event.status,
      },
    });

    return ok({
      eventId: updated.id,
      recordingUrl: updated.recordingUrl,
      status: updated.status,
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const event = await prisma.communityEvent.findUnique({
      where: { id: params.id },
      select: {
        recordingUrl: true,
        status: true,
        endsAt: true,
        title: true,
      },
    });

    if (!event) {
      return fail(ErrorCode.NOT_FOUND, 'event not found');
    }

    if (!event.recordingUrl) {
      return fail(ErrorCode.NOT_FOUND, 'no recording available');
    }

    if (event.endsAt > new Date() && event.status !== 'COMPLETED') {
      return fail(ErrorCode.FORBIDDEN, 'event not yet completed');
    }

    return ok({
      recordingUrl: event.recordingUrl,
      title: event.title,
      status: event.status,
    });
  } catch (err) {
    return handleError(err);
  }
}