// ============================================================================
// POST /api/consciousness/track — Registra evento de consciência
// ============================================================================
// Endpoint LEVE, fire-and-forget. Aceita eventos da UI quando o usuário
// interage (bookmark, reaction, comment, conversa Akasha, etc).
//
// LGPD:
//   - NÃO exige autenticação (visitantes anônimos podem ser contados)
//   - Se optedIn=false, evento é gravado sem userId
//   - Metadata é sanitizada no server (lib/consciousness/event-tracker.ts)
//
// Padrão de response:
//   - 200 { ok: true, eventId?: string } → gravado
//   - 400 { error: 'invalid payload' } → payload inválido
//   - 500 { error: 'internal' } → erro inesperado (mas evento pode ter sido gravado)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { trackEventAsync, EVENT_TYPES } from '@/lib/consciousness/event-tracker';

export const dynamic = 'force-dynamic';

// Validação estrita do payload
const TrackSchema = z.object({
  type: z.enum([
    EVENT_TYPES.POST_CREATED,
    EVENT_TYPES.REACTION_ADDED,
    EVENT_TYPES.COMMENT_CREATED,
    EVENT_TYPES.BOOKMARK_CREATED,
    EVENT_TYPES.READING_PROGRESS,
    EVENT_TYPES.AKASHIC_CONVERSATION,
    EVENT_TYPES.AKASHIC_FEEDBACK,
    EVENT_TYPES.USER_ONBOARDED,
    EVENT_TYPES.GROUP_JOINED,
  ]),
  userId: z.string().cuid().nullish(),
  tradition: z.string().max(64).nullish(),
  topic: z.string().max(64).nullish(),
  sentiment: z.number().min(-1).max(1).nullish(),
  metadata: z.record(z.unknown()).nullish(),
  optedIn: z.boolean().nullish(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const parsed = TrackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Whitelist metadata: passar apenas os campos permitidos (sanitização no tracker)
  const data = parsed.data;

  const event = await trackEventAsync({
    type: data.type,
    userId: data.userId ?? null,
    tradition: data.tradition ?? null,
    topic: data.topic ?? null,
    sentiment: data.sentiment ?? null,
    metadata: data.metadata as never,
    optedIn: data.optedIn ?? false,
  });

  return NextResponse.json({
    ok: true,
    eventId: event?.id ?? null,
  });
}

// GET apenas para health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'consciousness/track',
    method: 'POST',
    schema: {
      type: 'one of: POST_CREATED, REACTION_ADDED, COMMENT_CREATED, BOOKMARK_CREATED, READING_PROGRESS, AKASHIC_CONVERSATION, AKASHIC_FEEDBACK, USER_ONBOARDED, GROUP_JOINED',
      userId: 'optional cuid',
      tradition: 'optional string',
      topic: 'optional string',
      sentiment: 'optional -1..1',
      metadata: 'optional sanitized object',
      optedIn: 'optional boolean',
    },
  });
}