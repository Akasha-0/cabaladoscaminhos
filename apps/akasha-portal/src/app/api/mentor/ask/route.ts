/**
 * API Route: POST /api/mentor/ask
 * Streams mentor response with rate limiting and credits
 *
 * SECURITY FIX (v0.85.2):
 * Previously accepted userId from request body without verifying it matched the
 * authenticated user (IDOR). Any authenticated user could impersonate another and
 * deduct their credits. Now uses requireAkashaApi to enforce authentication and
 * ignores userId from body — uses only the authenticated user's identity.
 */
import { loadUserMaps } from '@akasha/mentor/maps';
import type { MentorMessage } from '@akasha/mentor';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { checkCredits, deductCredit, noCreditsMessage } from '@/lib/application/mentor/credits';
import { streamMentorResponse } from '@/lib/application/mentor/llm-router';
import { prisma } from '@/lib/infrastructure/prisma';
import {
  MENTOR_RATE_LIMIT_CONFIG,
  MENTOR_RATE_LIMIT_KEY_PREFIX,
  checkRedisRateLimit,
  formatMentorRateLimitError,
} from '@/lib/infrastructure/rate-limit';

const bodySchema = z.object({
  question: z.string().min(1).max(2000),
  // userId intentionally removed from body schema — must use authenticated user ID
  sessionHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'mentor']),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  // 0. Authenticate — userId from auth context, NOT from body
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult.id;

  // Wave 8.4 B.2: try MCP server first, fallback to direct LLM.
  // MCP server está stub (sem tool dispatch) — só logamos tools registradas
  // e seguimos pelo caminho direct LLM. Quando Wave 9+ registrar tools reais,
  // este bloco evoluirá para invocá-las.
  let useMcp = false;
  try {
    const { mcpServer } = await import('@akasha/mcp');
    const registry = mcpServer.getRegistry();
    const mentorTools = Array.from(registry.tools.values()).filter(t =>
      t.name.startsWith('mentor.')
    );
    if (mentorTools.length > 0) {
      console.log(
        `[mentor] found ${mentorTools.length} MCP tools, using direct LLM fallback (no tool impl yet)`
      );
      useMcp = true;
    }
  } catch (err) {
    // @akasha/mcp não instalado ou import falhou → fallback to direct LLM
    console.warn(
      '[mentor] MCP server unavailable, using direct LLM:',
      err instanceof Error ? err.message : err
    );
  }
  // `useMcp` é flag para Wave 9+ saber se deveria usar tools registradas.

  try {
    // 1. Validate body
    let parsed: z.infer<typeof bodySchema>;
    try {
      const raw = await request.json();
      parsed = bodySchema.parse(raw);
    } catch {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const { question, sessionHistory = [] } = parsed;

    // 2. Rate limit check — uses authenticated userId
    const rateLimit = await checkRedisRateLimit(
      `${MENTOR_RATE_LIMIT_KEY_PREFIX}:${userId}`,
      MENTOR_RATE_LIMIT_CONFIG.maxRequests,
      Math.ceil(MENTOR_RATE_LIMIT_CONFIG.windowMs / 1000)
    );
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: formatMentorRateLimitError() }, { status: 429 });
    }

    // 3. Credits check — uses authenticated userId
    const credits = await checkCredits(userId);
    if (!credits.hasCredits) {
      return NextResponse.json({ error: noCreditsMessage() }, { status: 402 });
    }

    // 4. Load user maps — uses authenticated userId
    let maps;
    try {
      maps = await loadUserMaps({ prisma, userId });
    } catch (error) {
      console.error('Failed to load user maps:', error);
      return NextResponse.json(
        { error: 'Não foi possível carregar os mapas do usuário' },
        { status: 400 }
      );
    }

    // 5. Map session history to MentorMessage format
    const history: MentorMessage[] = sessionHistory.map((m, i) => ({
      id: `session-${i}`,
      role: m.role === 'user' ? 'user' : 'mentor',
      content: m.content,
      createdAt: new Date(),
    }));
    // 6. Stream response — uses authenticated userId
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamMentorResponse(
            { question, userId, sessionHistory: history },
            maps,
            history
          )) {
            controller.enqueue(encoder.encode(chunk));
          }

          // Deduct credit after successful response
          await deductCredit(userId);

          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro interno do mentor';
          try {
            controller.enqueue(encoder.encode(`\n\n[Erro: ${message}]`));
          } catch {
            // Stream may be closed
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Mentor ask error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
