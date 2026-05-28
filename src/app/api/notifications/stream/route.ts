import { NextRequest, NextResponse } from 'next/server';
import { createSSEStream } from '@/lib/sse';

async function fetchTransitUpdates(): Promise<unknown> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/astrologia/transitos`,
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function fetchDailyInsight(): Promise<unknown> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/insights/diario`,
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const { send, close } = createSSEStream(controller, encoder);

      const run = async () => {
        while (true) {
          const transitData = await fetchTransitUpdates();
          if (transitData) {
            send({ type: 'transit', data: transitData });
          }

          const insightData = await fetchDailyInsight();
          if (insightData) {
            send({ type: 'insight', data: insightData });
          }

          await new Promise((resolve) => setTimeout(resolve, 30_000));
        }
      };

      run().catch(() => {
        close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
