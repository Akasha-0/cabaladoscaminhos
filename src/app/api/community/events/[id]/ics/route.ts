// ============================================================================
// COMMUNITY EVENT ICS — /api/community/events/[id]/ics
// ============================================================================
// GET → retorna .ics do evento para download / Apple Calendar / etc
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { prisma } from '@/lib/prisma';
import { generateIcsAttachment } from '@/lib/events/rsvp';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const event = await prisma.communityEvent.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return fail(ErrorCode.NOT_FOUND, 'event not found');
    }

    const { filename, content } = generateIcsAttachment({
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      location: event.location,
      onlineUrl: event.onlineUrl,
    });

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    return handleError(err);
  }
}