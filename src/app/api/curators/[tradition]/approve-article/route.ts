// ============================================================================
// POST /api/curators/[tradition]/approve-article — Wave 35 (2026-07-01)
// ============================================================================// Curador com permissão canApproveContent aprova (ou rejeita) um artigo
// da sua tradição. Universalismo: pode revisar cross-tradição apenas se
// canReviewOtherTraditions=true (default false).
//
// Body:
//   {
//     articleId: string,
//     decision: 'approve' | 'reject',
//     reason?: string          // obrigatório para reject
//   }
//
// Retorna:
//   { articleId, decision, decidedBy, decidedAt, newStatus }
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { resolveCurator, hasPermission } from '@/lib/curators/service';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

const BodySchema = z
  .object({
    articleId: z.string().min(1).max(50),
    decision: z.enum(['approve', 'reject']),
    reason: z.string().max(500).optional(),
  })
  .refine((v) => v.decision !== 'reject' || (v.reason && v.reason.trim().length >= 10), {
    message: 'reason obrigatório (>=10 chars) em reject',
    path: ['reason'],
  });

interface RouteCtx {
  params: Promise<{ tradition: string }>;
}

export async function POST(request: NextRequest, ctx: RouteCtx) {
  try {
    const { tradition } = await ctx.params;

    // Resolve sessão
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return fail(ErrorCode.UNAUTHORIZED, 'Sessão não encontrada', 401);
    }
    const email = (data.user.email ?? '').toLowerCase();

    const resolution = await resolveCurator(data.user.id, email, tradition);
    if (!resolution.ok || !resolution.curator) {
      return fail(
        ErrorCode.FORBIDDEN,
        `Sem permissão de curador (${resolution.reason ?? 'unknown'})`,
        403
      );
    }
    if (!hasPermission(resolution.curator.permissions, 'canApproveContent')) {
      return fail(
        ErrorCode.FORBIDDEN,
        'Permissão canApproveContent=false para este curador',
        403
      );
    }

    const json = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }
    const { articleId, decision, reason } = parsed.data;

    // Validar artigo e que pertence à tradição foco do curador
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, tradition: true, status: true },
    });
    if (!article) {
      return fail(ErrorCode.NOT_FOUND, 'Artigo não encontrado', 404);
    }
    if (article.tradition !== tradition) {
      return fail(
        ErrorCode.FORBIDDEN,
        `Artigo pertence a ${article.tradition}; curador desta rota atua em ${tradition}`,
        403
      );
    }

    const now = new Date();
    const newStatus = decision === 'approve' ? 'PUBLISHED' : 'REJECTED';

    await prisma.article.update({
      where: { id: articleId },
      data: {
        publishedAt: decision === 'approve' ? now : null,
        curatedBy: resolution.curator.userId,
      },
    });

    await logAudit({
      action: decision === 'approve' ? 'ARTICLE_APPROVED' : 'ARTICLE_REJECTED',
      actorId: resolution.curator.userId,
      targetId: articleId,
      metadata: {
        tradition,
        curatorRole: resolution.curator.curatorRole,
        articleTitle: article.title.slice(0, 200),
        ...(reason && { reason }),
      },
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return ok({
      articleId,
      decision,
      reason: reason ?? null,
      decidedBy: resolution.curator.userId,
      decidedAt: now.toISOString(),
      newStatus,
      tradition,
      traditionArticle: true,
    });
  } catch (err) {
    return handleError(err, 'POST /api/curators/[tradition]/approve-article');
  }
}
