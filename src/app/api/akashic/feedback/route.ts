// ============================================================================
// POST /api/akashic/feedback — Wave 18 (2026-06-27)
// ============================================================================
// Recebe 👍/👎 (vote + comment opcional) sobre uma resposta da Akasha IA.
// Salva em `AkashicFeedback` (modelo dedicado).
//
// Por que modelo dedicado:
//   - Analytics agregado (taxa de 👎 por tradição, por deepMode, etc)
//   - Auditoria ética (picos de 👎 disparam revisão de prompt)
//   - Retreino futuro do prompt quando houver volume
//
// Privacidade:
//   - NÃO salvamos conteúdo da mensagem/resposta (LGPD minimization)
//   - userId é opcional (visitante anônimo pode dar feedback)
//   - comment é opt-in e tem limite de 500 chars
//
// Resposta mínima — idempotente (cliente pode reenviar se falhar).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { AKASHA_TRADITIONS } from '@/lib/ai/prompts/akasha';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FeedbackSchema = z.object({
  messageId: z.string().min(1).max(64),
  vote: z.enum(['UP', 'DOWN']),
  tradition: z.enum(AKASHA_TRADITIONS).optional().nullable(),
  deepMode: z.boolean().optional().default(false),
  comment: z.string().max(500).optional().nullable(),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30; // 30 feedback events / min por IP

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit por IP (feedback é leve — 30/min)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  const rl = checkRateLimit(`akashic-feedback:${ip}`, {
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Muitos feedbacks em sequência. Aguarde um instante.',
        },
      },
      { status: 429 },
    );
  }

  // 2. Parse + validação
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_JSON', message: 'JSON inválido' } },
      { status: 400 },
    );
  }

  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  const { messageId, vote, tradition, deepMode, comment } = parsed.data;

  // 3. Viewer (opcional — feedback anônimo é aceito)
  const viewer = await getViewer().catch(() => null);

  // 4. Persist
  try {
    const feedback = await prisma.akashicFeedback.create({
      data: {
        messageId,
        vote,
        userId: viewer?.id ?? null,
        tradition: tradition ?? null,
        deepMode,
        comment: comment ?? null,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json(
      { ok: true, id: feedback.id, createdAt: feedback.createdAt },
      { status: 201 },
    );
  } catch (err) {
    console.error('[akashic/feedback] erro ao salvar:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Não foi possível registrar o feedback agora',
        },
      },
      { status: 500 },
    );
  }
}

// ─── GET — health check leve ────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/akashic/feedback',
    method: 'POST',
    schema: {
      messageId: 'string (UUID v4 do client)',
      vote: "enum('UP' | 'DOWN')",
      tradition: `enum(${AKASHA_TRADITIONS.join('|')}) optional`,
      deepMode: 'boolean optional',
      comment: 'string optional (≤500 chars)',
    },
  });
}
