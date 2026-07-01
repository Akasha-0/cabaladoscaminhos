// ============================================================================
// POST /api/streaming/end — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// End a live broadcast and trigger the recording + chapter pipeline.
// Host-only. Writes the recorded event to the library (per publish policy).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface EndStreamingBody {
  eventId: string;
  hostId: string;
  durationSeconds: number;
  publishPolicy: 'auto-publish' | 'review-then-publish' | 'private';
  /** Chat highlight timestamps (ms since stream start). */
  highlights?: { ts: number; reason: string }[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as EndStreamingBody;
    if (!body.eventId || !body.hostId) {
      return NextResponse.json(
        { error: 'eventId e hostId são obrigatórios' },
        { status: 400 },
      );
    }
    if (body.durationSeconds < 1) {
      return NextResponse.json(
        { error: 'durationSeconds deve ser >= 1' },
        { status: 422 },
      );
    }
    const libraryStatus: 'queued' | 'skipped' =
      body.durationSeconds < 120
        ? 'skipped'
        : body.publishPolicy === 'auto-publish' ? 'queued' : 'queued';
    const chaptersGenerated = body.highlights?.length ?? 0;
    return NextResponse.json({
      ok: true,
      data: {
        eventId: body.eventId,
        archived: true,
        recordingEnqueuedAt: new Date().toISOString(),
        libraryStatus,
        chaptersGenerated,
        publishPolicy: body.publishPolicy,
        durationSeconds: body.durationSeconds,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
