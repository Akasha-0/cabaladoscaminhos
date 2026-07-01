// ============================================================================
// POST /api/streaming/chat — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// Server-Sent Events endpoint for live chat. On POST, we accept a chat
// message, run the moderation pipeline, then broadcast it to all SSE
// subscribers via the channel singleton.
//
// LGPD Art. 7: handless are ephemeral (no real user IDs leak).
// WCAG 4.1.3: aria-live status messages on the client side.
// ============================================================================

import { NextRequest } from 'next/server';
import {
  appendChatMessage,
  appendReaction,
  broadcast,
  createLiveChatChannel,
  detectHighlightMoment,
  ephemeralHandle,
  encodeSsePayload,
} from '@/lib/streaming/live-chat';
import { moderate, buildAuditEntry, applyMessage } from '@/lib/streaming/chat-mod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ChatPostBody {
  eventId: string;
  userId: string;
  text?: string;
  type?: 'message' | 'reaction';
  reaction?: 'heart' | 'fire' | 'sparkles' | 'om' | 'lotus';
  costPresence?: number;
}

// In-memory channel registry. In prod: Redis pub/sub.
const channels: Map<string, ReturnType<typeof createLiveChatChannel>> = new Map();

function getChannel(eventId: string) {
  let ch = channels.get(eventId);
  if (!ch) {
    ch = createLiveChatChannel(eventId);
    channels.set(eventId, ch);
  }
  return ch;
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: ChatPostBody;
  try {
    body = (await req.json()) as ChatPostBody;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (!body.eventId || !body.userId) {
    return new Response(JSON.stringify({ error: 'eventId e userId obrigatórios' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  const channel = getChannel(body.eventId);
  const userState = applyMessage({
    userId: body.userId,
    recentMessageTs: [],
    strikes: 0,
  }, Date.now());
  if (body.type === 'reaction' && body.reaction) {
    appendReaction(channel, {
      handle: ephemeralHandle(body.userId, body.eventId),
      type: body.reaction,
      costPresence: body.costPresence ?? 1,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (!body.text) {
    return new Response(JSON.stringify({ error: 'text obrigatório' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  const decision = moderate(userState, body.text, Date.now());
  if (!decision.allowed) {
    void buildAuditEntry(body.eventId, body.userId, decision);
    return new Response(JSON.stringify({ ok: false, error: decision.reason, action: decision.action }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }
  const msg = appendChatMessage(channel, {
    handle: ephemeralHandle(body.userId, body.eventId),
    text: body.text,
    fromHost: false,
  });
  const highlight = detectHighlightMoment(channel);
  if (highlight.isHighlight) {
    broadcast(channel, {
      type: 'highlight',
      data: { ts: Date.now(), reason: highlight.reason },
    });
  }
  return new Response(JSON.stringify({ ok: true, data: msg }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * GET — open an SSE connection to subscribe to live chat events.
 * Browsers use `new EventSource('/api/streaming/chat?eventId=...')`.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);
  const eventId = url.searchParams.get('eventId');
  if (!eventId) {
    return new Response('eventId required', { status: 400 });
  }
  const channel = getChannel(eventId);
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: Parameters<typeof broadcast>[0][0] | string) => {
        try {
          if (typeof event === 'string') {
            controller.enqueue(new TextEncoder().encode(`: ${event}\n\n`));
          } else {
            controller.enqueue(new TextEncoder().encode(encodeSsePayload(event)));
          }
        } catch {
          // Stream closed — drop silently.
        }
      };
      const unsubscribe = (payload: Parameters<typeof broadcast>[0][0]) => send(payload);
      channel.subscribers.add(unsubscribe);
      send({ type: 'presence', data: { count: channel.messages.length } });
      const heartbeat = setInterval(() => send(': ping'), 15_000);
      const onClose = () => {
        clearInterval(heartbeat);
        channel.subscribers.delete(unsubscribe);
        try { controller.close(); } catch { /* already closed */ }
      };
      req.signal.addEventListener('abort', onClose);
    },
  });
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      'connection': 'keep-alive',
      'x-accel-buffering': 'no',
    },
  });
}
