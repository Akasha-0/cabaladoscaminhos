// ============================================================================
// EVENTS — /api/events
// ============================================================================
// GET  → lista de eventos (filtros: tradição, data, host, groupId, search)
// POST → cria novo evento (autenticado; viewer vira host)
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { getViewer, requireViewer } from '@/lib/community/auth';
import { EventListQuerySchema, CreateEventSchema } from '@/lib/validators/events';
import { listEvents, createEvent } from '@/lib/community/events';
import { trackEvent } from '@/lib/analytics/events-catalog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const parsed = EventListQuerySchema.safeParse({
      tradition: sp.get('tradition') ?? undefined,
      upcoming: sp.get('upcoming') ?? undefined,
      isPublic: sp.get('isPublic') ?? undefined,
      hostId: sp.get('hostId') ?? undefined,
      groupId: sp.get('groupId') ?? undefined,
      search: sp.get('search') ?? undefined,
      limit: sp.get('limit') ?? undefined,
    });
    if (!parsed.success) return fromZodError(parsed.error);

    const viewer = await getViewer();

    const events = await listEvents({
      tradition: parsed.data.tradition,
      upcoming: parsed.data.upcoming,
      isPublic: parsed.data.isPublic,
      hostId: parsed.data.hostId,
      groupId: parsed.data.groupId,
      search: parsed.data.search,
      viewerId: viewer?.id ?? null,
      limit: parsed.data.limit,
    });

    return ok(events, {
      cache: { sMaxage: 30, staleWhileRevalidate: 60 },
      meta: {
        count: events.length,
        viewerId: viewer?.id ?? null,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado para criar um evento');
    }

    const body = await request.json().catch(() => null);
    if (!body) return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');

    const parsed = CreateEventSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const event = await createEvent({
      title: parsed.data.title,
      description: parsed.data.description,
      tradition: parsed.data.tradition,
      hostId: viewer.id,
      startsAt: new Date(parsed.data.startsAt),
      durationMin: parsed.data.durationMin,
      maxParticipants: parsed.data.maxParticipants,
      isPublic: parsed.data.isPublic,
      meetingUrl: parsed.data.meetingUrl ?? null,
      groupId: parsed.data.groupId ?? null,
    });

    // Wave 18 — analytics: event_created
    trackEvent('event_created', {
      eventId: event.id,
      isOnline: Boolean(parsed.data.meetingUrl),
      tradition: parsed.data.tradition,
    });

    return ok(event, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}