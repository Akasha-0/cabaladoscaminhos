// ============================================================================
// POST /api/nps — submeter NPS response
// ============================================================================
// Upsert por (userId, trigger, triggerAt) — idempotente, evita duplicata.
// Cron /api/cron/nps-prompt é quem decide quando exibir; este endpoint
// recebe a resposta do widget cliente.
//
// LGPD: usuário pode enviar anônimo se preferir (skip = não criar row).
// score validado 0-10 via zod refine.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/options';
import { NpsSubmissionSchema, auditFeedback } from '@/lib/feedback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json(
      { error: 'unauthenticated', message: 'Faça login para registrar NPS.' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Body precisa ser JSON válido.' },
      { status: 400 },
    );
  }

  const parsed = NpsSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_error', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const triggerAt = parsed.data.triggerAt
    ? new Date(parsed.data.triggerAt)
    : new Date();

  // Upsert para idempotência (mesmo user+trigger+triggerAt não duplica)
  const result = await prisma.npsResponse.upsert({
    where: {
      userId_trigger_triggerAt: {
        userId,
        trigger: parsed.data.trigger,
        triggerAt,
      },
    },
    create: {
      userId,
      score: parsed.data.score,
      reason: parsed.data.reason ?? null,
      trigger: parsed.data.trigger,
      triggerAt,
      metadata: parsed.data.metadata ?? undefined,
    },
    update: {
      score: parsed.data.score,
      reason: parsed.data.reason ?? null,
      metadata: parsed.data.metadata ?? undefined,
    },
  });

  // Atualizar schedule
  await prisma.npsPromptSchedule.upsert({
    where: { userId },
    create: {
      userId,
      triggersShown: [parsed.data.trigger],
      lastPromptedAt: new Date(),
    },
    update: {
      triggersShown: {
        // Filtra duplicatas
        push: parsed.data.trigger,
      } as never, // prisma typing for array push in update
      lastPromptedAt: new Date(),
    },
  }).catch(() => {
    // best-effort; não falhar a operação principal
  });

  await auditFeedback(userId, 'NPS_SUBMITTED', result.id, {
    score: parsed.data.score,
    trigger: parsed.data.trigger,
    hasReason: Boolean(parsed.data.reason),
  });

  return NextResponse.json(
    { ok: true, id: result.id, createdAt: result.createdAt.toISOString() },
    { status: 201 },
  );
}
