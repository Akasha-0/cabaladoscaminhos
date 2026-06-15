/**
 * API Route: POST /api/mentor/ask
 * Streams mentor response with rate limiting and credits
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/infrastructure/prisma';
import {
  MENTOR_RATE_LIMIT_CONFIG,
  MENTOR_RATE_LIMIT_KEY_PREFIX,
  checkRedisRateLimit,
  formatMentorRateLimitError,
} from '@/lib/infrastructure/rate-limit';
import { checkCredits, deductCredit, noCreditsMessage } from '@/lib/application/mentor/credits';
import { streamMentorResponse } from '@/lib/application/mentor/llm-router';
import { loadUserMaps } from '@akasha/mentor/maps';
import type { MentorMessage } from '@akasha/mentor/types';

const bodySchema = z.object({
  question: z.string().min(1).max(2000),
  userId: z.string().min(1),
  sessionHistory: z.array(z.object({
    role: z.enum(['user', 'mentor']),
    content: z.string(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validate body
    let parsed: z.infer<typeof bodySchema>;
    try {
      const raw = await request.json();
      parsed = bodySchema.parse(raw);
    } catch {
      return NextResponse.json(
        { error: 'question and userId are required' },
        { status: 400 }
      );
    }

    const { question, userId, sessionHistory = [] } = parsed;

    // 2. Rate limit check
    const rateLimit = await checkRedisRateLimit(
      `${MENTOR_RATE_LIMIT_KEY_PREFIX}:${userId}`,
      MENTOR_RATE_LIMIT_CONFIG.maxRequests,
      Math.ceil(MENTOR_RATE_LIMIT_CONFIG.windowMs / 1000)
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: formatMentorRateLimitError() },
        { status: 429 }
      );
    }

    // 3. Credits check
    const credits = await checkCredits(userId);
    if (!credits.hasCredits) {
      return NextResponse.json(
        { error: noCreditsMessage() },
        { status: 402 }
      );
    }

    // 4. Load user maps
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

    // 6. Stream response
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
          const newBalance = await deductCredit(userId);
          console.log(`Mentor chat: deducted 1 credit from ${userId}, new balance: ${newBalance}`);

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
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Mentor ask error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
