/**
 * /api/admin/benchmarks/annotate — Wave 32.2
 *
 * CRUD para BenchmarkAnnotation (inter-annotator calibration AUT).
 *
 * Endpoints:
 *   GET  ?action=list                    → list redacted responses para anotar
 *   GET  ?action=list&annotatorId=X      → filtra responses já anotadas por X
 *   GET  ?action=progress                → progresso por anotador (counts)
 *   POST { responseId, rScore, tScore, uScore, vScore, notes? }
 *                                        → cria/atualiza annotation do caller
 *
 * Auth: ADMIN only (requireAkashaAdmin).
 *
 * LGPD:
 *   - GET list redata user.name, user.email, consultation.title antes de servir
 *   - POST loga apenas responseId + callerId (sem PII do consulente)
 *   - Scores são Int 0-10 (validado com Zod); FK CASCADE garante erasure
 *
 * PROPOSAL schema: @see apps/akasha-portal/prisma/migrations/WAVE-32-2-benchmark-annotation/migration.sql
 * Para aplicar: pnpm exec prisma migrate dev --name benchmark-annotation
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ChatRole } from '@prisma/client';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaAdmin } from '@/lib/application/auth/akasha-guard';
import {
  redactMessagesForAnnotation,
  type RedactableMessage,
} from '@/lib/application/privacy/redact';

/** Type guard: erro do Prisma com .code (P2002 etc). */
function isPrismaKnownError(err: unknown): err is { code: string; message: string } {
  return err instanceof Error && 'code' in err && typeof (err as { code: unknown }).code === 'string';
}

export const dynamic = 'force-dynamic';

// ─── Validation Schemas ───────────────────────────────────────────────────

const annotateSchema = z.object({
  responseId: z.string().min(1),
  rScore: z.number().int().min(0).max(10),
  tScore: z.number().int().min(0).max(10),
  uScore: z.number().int().min(0).max(10),
  vScore: z.number().int().min(0).max(10),
  notes: z.string().max(2000).optional(),
});

// ─── GET ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/benchmarks/annotate?action=list
 * GET /api/admin/benchmarks/annotate?action=list&annotatorId=X
 *
 * Lista responses do Mentor (ChatMessage role=ASSISTANT) redacted para
 * anotação. Default: limit 50, ordenado por mais recente.
 *
 * Se annotatorId é passado, retorna APENAS responses NÃO anotadas por aquele
 * anotador (para a UI do anotador saber "qual é o próximo pra eu anotar").
 */
export async function GET(request: NextRequest) {
  const admin = await requireAkashaAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? 'list';
  const annotatorId = url.searchParams.get('annotatorId') ?? undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 500);

  switch (action) {
    case 'list':
      return handleList(annotatorId, limit);
    case 'progress':
      return handleProgress();
    default:
      return NextResponse.json({ error: `action='${action}' inválida` }, { status: 400 });
  }
}

async function handleList(
  annotatorId: string | undefined,
  limit: number
): Promise<NextResponse> {
  // Pegar IDs já anotadas por este anotador (se filtra).
  const alreadyAnnotatedIds: string[] = annotatorId
    ? (
        await prisma.benchmarkAnnotation.findMany({
          where: { annotatorId },
          select: { responseId: true },
        })
      ).map((a: { responseId: string }) => a.responseId)
    : [];

  // Buscar responses do Mentor (Mentor = "ORACLE" no schema atual).
  const messages = await prisma.chatMessage.findMany({
    where: {
      role: ChatRole.ORACLE,
      ...(alreadyAnnotatedIds.length > 0
        ? { id: { notIn: alreadyAnnotatedIds } }
        : {}),
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      consultation: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  const redactable: RedactableMessage[] = messages.map((m: {
    id: string;
    content: string;
    createdAt: Date;
    routedPillars: string[];
    consultation: {
      title: string | null;
      user: { name: string; email: string } | null;
    };
  }) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt,
    consultationTitle: m.consultation.title,
    consultationUser: m.consultation.user
      ? { name: m.consultation.user.name, email: m.consultation.user.email }
      : null,
    routedPillars: m.routedPillars,
  }));

  const redacted = redactMessagesForAnnotation(redactable);

  return NextResponse.json({
    responses: redacted,
    alreadyAnnotatedCount: alreadyAnnotatedIds.length,
    total: redacted.length,
  });
}

async function handleProgress(): Promise<NextResponse> {
  // Aggregação: counts por anotador (ADMIN pode ver progresso de outros annotators).
  // Tipo derivado do Prisma groupBy payload (Prisma v7 não aceita type-cast arbitrário).
  const groups = await prisma.benchmarkAnnotation.groupBy({
    by: ['annotatorId'],
    _count: { _all: true },
    _min: { annotatedAt: true },
    _max: { annotatedAt: true },
  });

  const annotatorIds = groups.map((g) => g.annotatorId);
  const annotators = await prisma.user.findMany({
    where: { id: { in: annotatorIds } },
    select: { id: true, name: true, email: true, role: true },
  });

  const byAnnotator = groups.map((g) => {
    const u = annotators.find((a: { id: string }) => a.id === g.annotatorId);
    return {
      annotatorId: g.annotatorId,
      annotatorName: u?.name ?? '(deleted user)',
      annotatorRole: u?.role ?? null,
      annotationsCount: g._count._all,
      firstAnnotationAt: g._min.annotatedAt?.toISOString() ?? null,
      lastAnnotationAt: g._max.annotatedAt?.toISOString() ?? null,
    };
  });

  const total = byAnnotator.reduce((s: number, x: { annotationsCount: number }) => s + x.annotationsCount, 0);
  return NextResponse.json({ byAnnotator, total });
}

// ─── POST ─────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/benchmarks/annotate
 *
 * Body: { responseId, rScore, tScore, uScore, vScore, notes? }
 *
 * Cria (ou atualiza) annotation do caller ADMIN. Idempotente via
 * upsert por (responseId, callerId) — constraint unique do schema.
 */
export async function POST(request: NextRequest) {
  const admin = await requireAkashaAdmin(request);
  if (admin instanceof NextResponse) return admin;

  let body: z.infer<typeof annotateSchema>;
  try {
    body = annotateSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    // Erro desconhecido no parsing — 500.
    console.error('[annotate] unexpected parse error', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }

  // Confirma que a response existe e é do Mentor.
  const response = await prisma.chatMessage.findUnique({
    where: { id: body.responseId },
    select: { id: true, role: true },
  });
  if (!response) {
    return NextResponse.json({ error: 'Response não encontrada' }, { status: 404 });
  }
  if (response.role !== ChatRole.ORACLE) {
    return NextResponse.json(
      { error: 'Só é possível anotar responses do Mentor (role=ORACLE)' },
      { status: 400 }
    );
  }

  try {
    const annotation = await prisma.benchmarkAnnotation.upsert({
      where: {
        responseId_annotatorId: {
          responseId: body.responseId,
          annotatorId: admin.id,
        },
      },
      create: {
        responseId: body.responseId,
        annotatorId: admin.id,
        rScore: body.rScore,
        tScore: body.tScore,
        uScore: body.uScore,
        vScore: body.vScore,
        notes: body.notes ?? null,
      },
      update: {
        rScore: body.rScore,
        tScore: body.tScore,
        uScore: body.uScore,
        vScore: body.vScore,
        notes: body.notes ?? null,
        annotatedAt: new Date(),
      },
    });

    return NextResponse.json({ annotation });
  } catch (err) {
    // P2002 = unique constraint violation (não esperado via upsert,
    // mas defendemos para erros de constraint check 0..10).
    if (isPrismaKnownError(err) && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Anotação duplicada (constraint única)' },
        { status: 409 }
      );
    }
    // Erro desconhecido (não Prisma) — log estruturado + 500 genérico.
    console.error('[annotate] unexpected error', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
