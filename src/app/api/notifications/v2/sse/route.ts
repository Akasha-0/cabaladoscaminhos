// ============================================================================
// API /api/notifications/v2/sse — Server-Sent Events stream para in-app
// ============================================================================
// GET   — abre stream SSE; o cliente recebe eventos de notif em realtime.
//
// Server: emite heartbeat a cada 25s + eventos sob demanda (via dispatcher).
// Client: EventSource('/api/notifications/v2/sse') — reconectará sozinho.
// ============================================================================

import { NextRequest } from 'next/server';
import { getViewer } from '@/lib/community/auth';
import { registerSseClient } from '@/lib/notifications/v2';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const viewer = await getViewer();
  if (!viewer) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Client disconnected; cleanup acontece via cancel()
        }
      };

      // Initial hello
      send('hello', { userId: viewer.id, ts: new Date().toISOString() });

      // Heartbeat a cada 25s
      const heartbeat = setInterval(() => {
        send('ping', { ts: new Date().toISOString() });
      }, 25_000);

      // Registrar como cliente para receber pushes do dispatcher
      const unregister = registerSseClient({
        userId: viewer.id,
        enqueue: (data) => {
          send('notification', JSON.parse(data));
        },
      });

      // Cleanup
      const cleanup = () => {
        clearInterval(heartbeat);
        unregister();
        try { controller.close(); } catch { /* already closed */ }
      };

      req.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'connection': 'keep-alive',
      'x-accel-buffering': 'no',
    },
  });
}
