// ============================================================================
// POST /api/comments/[id]/report — Denunciar comentário (Wave 25, 2026-06-28)
// ============================================================================
// Endpoint dedicado para reportar comentários. Cria um registro Flag
// (modelo unificado de moderação do projeto) com:
//   targetType = 'COMMENT'
//   targetId   = commentId
//   reason     = SPAM | HARASSMENT | MISINFO | OTHER
//   description = contexto opcional (até 500 chars)
//
// Autenticação: obrigatória (qualquer user logado pode reportar).
// Rate limit: 10 reports / minuto por userId (anti-spam de denúncia).
// Idempotência: se já existe Flag PENDING do mesmo user pro mesmo comment,
// devolve o existente (status 200) — evita criar duplicata por double-click.
//
// Auditoria: registra `COMMENT_REPORTED` em AuditLog (evento granular).
//
// For a moderation queue + admin actions, ver:
//   GET  /api/admin/moderation/queue
//   POST /api/admin/moderation/flags/[id]/resolve
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

// ============================================================================
// Schema de input
// ============================================================================

const ReportBodySchema = z.object({
  reason: z.enum(['SPAM', 'HARASSMENT', 'MISINFO', 'OTHER']),
  description: z.string().max(500).optional().nullable(),
});

export type ReportBody = z.infer<typeof ReportBodySchema>;

// ============================================================================
// Rate limit (Wave 25 — moderado, anti-spam mas não punitivo)
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 min
const RATE_LIMIT_MAX = 10;           // 10 reports/min por usuário

// ============================================================================
// Handler
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    if (!commentId) {
      return fail(400, ErrorCode.BAD_REQUEST, 'ID do comentário ausente');
    }

    // ------------------------------------------------------------------
    // 1. Auth — precisa estar logado (qualquer user pode reportar)
    // ------------------------------------------------------------------
    const { createClient } = await import('@/lib/supabase-server');
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado para denunciar');
    }

    const userId = data.user.id;

    // ------------------------------------------------------------------
    // 2. Rate limit por userId (anti-spam de denúncia)
    // ------------------------------------------------------------------
    const rl = checkRateLimit(`comment-report:${userId}`, {
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxRequests: RATE_LIMIT_MAX,
    });
    if (!rl.allowed) {
      return fail(
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Muitas denúncias em sequência. Aguarde alguns segundos.',
        { resetInMs: rl.resetIn }
      );
    }

    // ------------------------------------------------------------------
    // 3. Parse + validate body
    // ------------------------------------------------------------------
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'Body JSON inválido');
    }

    const parsed = ReportBodySchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    // ------------------------------------------------------------------
    // 4. Verifica que o comentário existe (e não está já soft-deletado)
    // ------------------------------------------------------------------
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        deletedAt: true,
        authorId: true,
      },
    });

    if (!comment || comment.deletedAt) {
      return fail(404, ErrorCode.NOT_FOUND, 'Comentário não encontrado ou já removido');
    }

    // Anti self-report: o autor do comentário não pode denunciar a si mesmo.
    // (Seria sempre improcedente — não faz sentido e abre vetor de ruído.)
    if (comment.authorId === userId) {
      return fail(
        400,
        ErrorCode.BAD_REQUEST,
        'Você não pode denunciar seu próprio comentário'
      );
    }

    // ------------------------------------------------------------------
    // 5. Idempotência — se já tem Flag PENDING deste user pro comment,
    //    devolve a existente (evita double-click criando duplicata).
    // ------------------------------------------------------------------
    const existing = await prisma.flag.findFirst({
      where: {
        targetType: 'COMMENT',
        targetId: commentId,
        reporterId: userId,
        status: 'PENDING',
      },
      select: {
        id: true,
        reason: true,
        description: true,
        createdAt: true,
      },
    });

    if (existing) {
      return ok(
        {
          id: existing.id,
          reason: existing.reason,
          alreadyReported: true,
          createdAt: existing.createdAt.toISOString(),
        },
        { meta: { commentId, deduplicated: true } }
      );
    }

    // ------------------------------------------------------------------
    // 6. Cria o Flag (transação curta — flag + audit log)
    // ------------------------------------------------------------------
    const flag = await prisma.$transaction(async (tx) => {
      const f = await tx.flag.create({
        data: {
          targetType: 'COMMENT',
          targetId: commentId,
          reporterId: userId,
          reason: parsed.data.reason,
          description: parsed.data.description ?? null,
          status: 'PENDING',
        },
        select: {
          id: true,
          reason: true,
          description: true,
          createdAt: true,
        },
      });

      // Audit log — best-effort; falha aqui não bloqueia a denúncia.
      try {
        await tx.auditLog.create({
          data: {
            actorId: userId,
            targetId: commentId,
            action: 'COMMENT_DELETED', // não temos COMMENT_REPORTED no enum ainda; usa proxy
            metadata: {
              event: 'COMMENT_REPORTED',
              flagId: f.id,
              reason: f.reason,
              hasDescription: Boolean(f.description),
            },
          },
        });
      } catch {
        // best-effort; não falhar a request por causa disso
      }

      return f;
    });

    return ok(
      {
        id: flag.id,
        reason: flag.reason,
        description: flag.description,
        alreadyReported: false,
        createdAt: flag.createdAt.toISOString(),
      },
      {
        status: 201,
        meta: { commentId, rateLimitRemaining: rl.remaining },
      }
    );
  } catch (err) {
    return handleError(err, 'POST /api/comments/[id]/report');
  }
}
