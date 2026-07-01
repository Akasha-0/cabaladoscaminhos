// ============================================================================
// COMMUNITY EVENTS ICS FEED — /api/community/events/feed.ics
// ============================================================================
// GET → retorna feed ICS agregador (todos eventos publicados próximos 90 dias)
//     Para assinatura em Google Calendar / Apple Calendar (subscribe URL)
// ============================================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateIcsAttachment } from '@/lib/events/rsvp';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const tradition = sp.get('tradition') ?? undefined;
    const type = sp.get('type') ?? undefined;

    const now = new Date();
    const horizon = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const events = await prisma.communityEvent.findMany({
      where: {
        status: 'PUBLISHED',
        startsAt: { gte: now, lte: horizon },
        ...(tradition ? { tradition } : {}),
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { startsAt: 'asc' },
      take: 200,
    });

    // Concatena múltiplos VEVENTs num único VCALENDAR
    const dtStamp = events[0]
      ? events[0].createdAt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      : now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const icsLines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cábala dos Caminhos//Events W35 Feed//PT-BR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Cábala dos Caminhos — Eventos',
      'X-WR-CALDESC:Workshops, círculos, palestras e cerimônias',
      'X-WR-TIMEZONE:America/Sao_Paulo',
      `REFRESH-INTERVAL;VALUE=DURATION:PT1H`,
      'X-PUBLISHED-TTL:PT1H',
    ];

    for (const e of events) {
      const { content } = generateIcsAttachment({
        id: e.id,
        title: e.title,
        description: e.description,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        location: e.location,
        onlineUrl: e.onlineUrl,
      });

      // Extrai apenas o VEVENT block
      const veventMatch = content.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
      if (veventMatch) {
        icsLines.push(veventMatch[0]);
      }
    }

    icsLines.push('END:VCALENDAR');
    const ics = icsLines.join('\r\n');

    return new Response(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="cabaladoscaminhos-events.ics"',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    return new Response('BEGIN:VCALENDAR\r\nEND:VCALENDAR', {
      status: 500,
      headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
    });
  }
}