// ============================================================================
// POST /api/feedback — submit feedback (rate limit 3/dia/user)
// GET /api/feedback/mine — listar submissões do próprio usuário
// ============================================================================
// LGPD Art. 7: userId opcional (anônimo via fingerprint). metadata guarda
// hash de IP para rate limit. LGPD Art. 18: titular pode pedir exclusão
// via /api/account/delete (fora deste escopo).
//
// Rate limit: 3/dia/user OU 3/dia/IP (anônimo). 429 + resetAt no header.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/options';
import {
  FeedbackSubmissionSchema,
  checkFeedbackRateLimit,
  auditFeedback,
} from '@/lib/feedback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash('sha256').update(ip + (process.env.IP_SALT ?? 'cabala')).digest('hex').slice(0, 24);
}

export async function POST(request: NextRequest) {
  try {
    // Body parse
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'invalid_json', message: 'Body precisa ser JSON válido.' },
        { status: 400 },
      );
    }

    const parsed = FeedbackSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          issues: parsed.error.issues,
          message: 'Verifique os campos enviados.',
        },
        { status: 400 },
      );
    }

    // Auth (optional — feedback anônimo permitido)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

    // IP + rate limit
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null;
    const ipHash = hashIp(ip);
    const rl = await checkFeedbackRateLimit(userId, ipHash);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: `Limite diário de ${rl.remaining + 1} feedbacks atingido. Tente novamente em ${rl.resetAt.toISOString()}.`,
          resetAt: rl.resetAt.toISOString(),
        },
        { status: 429 },
      );
    }

    // Metadata enrichment
    const submittedAt = new Date();
    const enrichedMetadata = {
      ...(parsed.data.metadata ?? {}),
      ipHash,
      userAgent: request.headers.get('user-agent')?.slice(0, 256) ?? null,
      url: request.headers.get('referer') ?? null,
      receivedAt: submittedAt.toISOString(),
    };

    const created = await prisma.feedbackSubmission.create({
      data: {
        userId,
        type: parsed.data.type,
        category: parsed.data.category ?? null,
        rating: parsed.data.rating ?? null,
        nps: parsed.data.nps ?? null,
        message: parsed.data.message,
        metadata: enrichedMetadata,
        status: 'NEW',
      },
      select: { id: true, createdAt: true },
    });

    await auditFeedback(userId, 'FEEDBACK_SUBMITTED', created.id, {
      type: parsed.data.type,
      hasRating: parsed.data.rating !== null,
      hasNps: parsed.data.nps !== null,
      anonymous: userId === null,
    });

    return NextResponse.json(
      {
        ok: true,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        remaining: rl.remaining - 1,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[feedback POST]', err);
    return NextResponse.json(
      { error: 'internal_error', message: 'Erro ao processar feedback. Tente novamente.' },
      { status: 500 },
    );
  }
}

// GET moved to /api/feedback/mine per spec; keep stub here for route discovery
export async function GET() {
  return NextResponse.json(
    { error: 'use_mine_endpoint', message: 'Use GET /api/feedback/mine para listar submissões.' },
    { status: 405 },
  );
}

// Schema unused-export guard (Next.js needs types only at compile)
export const _schemaGuard = z.object({ ok: z.literal(true) });
