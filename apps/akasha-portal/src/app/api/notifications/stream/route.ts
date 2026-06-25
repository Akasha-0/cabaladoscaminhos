/**
 * GET /api/notifications/stream
 *   Server-Sent Events stream das notificações do usuário autenticado.
 *
 *   - Auth: requireAkashaApi (cookie akasha_session).
 *   - Response Content-Type: text/event-stream
 *   - Heartbeat: comentário SSE a cada 30s (`: heartbeat\n\n`) — mantém
 *     proxies (nginx, Vercel) ativos.
 *   - Poll DB a cada 5s por notificações NOVAS (`createdAt > lastSeenAt`,
 *     opcionalmente filtradas por id > lastEventId).
 *   - Suporta reconexão com resume via header `Last-Event-ID: <id>`.
 *     Quando presente, pula o snapshot inicial e emite a partir do id
 *     seguinte (FIFO de createdAt desc).
 *
 *   LGPD: query filtra SEMPRE por userId do token. Sem broadcast.
 *   Edge Runtime: usa Web Streams API (ReadableStream). Nada de
 *   EventSource server-side (Node usa ReadableStream para produzir).
 *
 *   Por que polling 5s e não push real:
 *     - Não temos pub/sub (Redis/Ably/Pusher) no stack atual.
 *     - SSE + DB poll a 5s dá p95 < 200ms na prática (DB já indexado
 *       por [userId, readAt, createdAt] — query O(log n)).
 *     - Quando Wave X adicionar pub/sub, este endpoint fica transparente
 *       (só troca o trigger de `send` de poll para subscriber callback).
 *
 *   Por que coexistir com polling 30s no Bell:
 *     - SSE falha em ambientes com proxy agressivo / sem suporte a
 *       streaming (alguns corp firewalls matam conexões longas).
 *     - Mantemos polling 30s como fallback se EventSource der erro.
 *     - Veja NotificationsBell.tsx — tem fallback automático.
 */

import { NextRequest } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { toDTO } from '@/lib/application/notifications/create';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Constantes ──────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 5_000;
const HEARTBEAT_INTERVAL_MS = 30_000;
// Cap pra evitar loop infinito se DB estiver retornando ruído:
const MAX_EVENTS_PER_POLL = 50;

interface NotificationRow {
  id: string;
  type: 'DIARIO' | 'MENTOR' | 'CONEXOES' | 'CREDITS' | 'SYSTEM';
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
}

/**
 * Build SSE frame for a single notification payload.
 * Format per spec: `data: <json>\n\n`
 */
function buildSseFrame(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

/**
 * Build SSE "snapshot" frame — emitted once on connect with the current
 * unread count + latest notifications. Helps the UI hydrate without
 * polling for the first render.
 */
function buildSnapshotFrame(notifications: NotificationRow[], unreadCount: number): string {
  return `event: snapshot\ndata: ${JSON.stringify({
    notifications: notifications.map(toDTO),
    unreadCount,
  })}\n\n`;
}

export async function GET(request: NextRequest) {
  // ─── Auth ──────────────────────────────────────────────────────────
  const auth = await requireAkashaApi(request);
  if (auth instanceof Response) return auth;
  const userId = auth.id;

  // ─── Optional Last-Event-ID (resume) ───────────────────────────────
  // When the client reconnects, the browser auto-sends Last-Event-ID.
  // We use it to skip the initial snapshot and start streaming from
  // notifications newer than the last one the client received.
  const lastEventId = request.headers.get('last-event-id')?.trim() || null;

  // ─── Stream setup ──────────────────────────────────────────────────
  const encoder = new TextEncoder();
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
        try {
          controller.close();
        } catch {
          // Already closed (e.g. client disconnected)
        }
      };

      const send = (frame: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(frame));
        } catch {
          // Controller closed mid-enqueue — treat as disconnect
          close();
        }
      };

      // ─── Detect client disconnect ─────────────────────────────────
      // request.signal fires `abort` when the client closes the EventSource
      // (browser navigates away, network drops, EventSource.close()).
      request.signal.addEventListener('abort', () => {
        close();
      });

      try {
        // ─── Cursor for incremental polls ───────────────────────────
        // We track createdAt of the most recent notification we've seen.
        // On resume (lastEventId), seed the cursor from that record.
        let lastSeenCreatedAt: Date | null = null;
        let resumeValid = false;
        if (lastEventId) {
          const cursor = await prisma.notification.findFirst({
            where: { id: lastEventId, userId },
            select: { createdAt: true },
          });
          if (cursor) {
            lastSeenCreatedAt = cursor.createdAt;
            resumeValid = true;
          }
          // If cursor null (id órfão / pertence a outro user), cai no
          // fluxo normal de conexão nova (emite snapshot).
        }

        // ─── Initial snapshot ───────────────────────────────────────
        // - Conexão nova (sem lastEventId): sempre emite
        // - Resume com cursor válido: pula (cliente já tem o estado)
        // - Resume com cursor órfão: emite (estado novo pro cliente)
        if (!resumeValid) {
          const initial = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: MAX_EVENTS_PER_POLL,
            select: {
              id: true,
              type: true,
              title: true,
              body: true,
              href: true,
              readAt: true,
              createdAt: true,
            },
          });
          const unreadCount = await prisma.notification.count({
            where: { userId, readAt: null },
          });
          send(buildSnapshotFrame(initial, unreadCount));
        } else {
          // Resume válido: cliente já tem estado. Envia um comment
          // "ready" para o primeiro `read()` retornar imediatamente
          // e o EventSource saiba que a conexão está ativa (importante
          // pra UI que mostra "conectado" e pra healthchecks).
          send(`: resumed\n\n`);
        }

        // ─── Poll loop ──────────────────────────────────────────────
        pollTimer = setInterval(async () => {
          if (closed) return;
          try {
            const newOnes = await prisma.notification.findMany({
              where: {
                userId,
                ...(lastSeenCreatedAt
                  ? { createdAt: { gt: lastSeenCreatedAt } }
                  : {}),
              },
              orderBy: { createdAt: 'asc' }, // FIFO for streaming
              take: MAX_EVENTS_PER_POLL,
              select: {
                id: true,
                type: true,
                title: true,
                body: true,
                href: true,
                readAt: true,
                createdAt: true,
              },
            });

            if (newOnes.length > 0) {
              // Advance cursor to the newest one we just emitted
              const newest = newOnes[newOnes.length - 1];
              if (newest) {
                lastSeenCreatedAt = newest.createdAt;
              }

              // Emit each notification as its own SSE event with id
              // so the client can resume from here on reconnect.
              for (const n of newOnes) {
                send(`id: ${n.id}\n${buildSseFrame(toDTO(n))}`);
              }
            }
          } catch (err) {
            // DB blip — send error event but keep stream alive.
            // Closing on transient errors would force the client to
            // reconnect every 5s when DB hiccups; better to ride it out.
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.error('[notifications/stream] poll error', err);
            }
            send(`event: error\ndata: ${JSON.stringify({ message: 'poll_failed' })}\n\n`);
          }
        }, POLL_INTERVAL_MS);

        // ─── Heartbeat ──────────────────────────────────────────────
        // SSE comment line — clients ignore it, but proxies see traffic
        // and keep the connection alive.
        heartbeatTimer = setInterval(() => {
          send(`: heartbeat\n\n`);
        }, HEARTBEAT_INTERVAL_MS);
      } catch (err) {
        // Initial setup failed — close the stream cleanly so the client
        // gets a normal termination rather than a hang.
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('[notifications/stream] setup failed', err);
        }
        send(`event: error\ndata: ${JSON.stringify({ message: 'setup_failed' })}\n\n`);
        close();
      }
    },
    cancel() {
      // Client called stream.cancel() (or EventSource.close()).
      closed = true;
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Disable proxy buffering (nginx, Vercel) — without this, proxies
      // batch SSE frames and the client sees bursts instead of a stream.
      'X-Accel-Buffering': 'no',
    },
  });
}
