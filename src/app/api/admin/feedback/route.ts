// ============================================================================
// GET /api/admin/feedback — listar submissions para dashboard admin
// ============================================================================
// Auth: requireAdmin. Query: type, status, userId, dateFrom, dateTo, priority,
//       format=csv (export LGPD Art. 18).
//
// Resposta inclui summary (counts por status/type, NPS breakdown) e lista
// paginada. CSV export segue mesmo filtro — usado pelo DPO em solicitações
// de titular.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
import {
  buildFeedbackListWhere,
  computeFeedbackSummary,
  feedbackToCsv,
} from '@/lib/feedback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const querySchema = z.object({
  type: z.enum(['BUG', 'FEATURE', 'CONTENT', 'USABILITY', 'COMMUNITY', 'OTHER']).optional(),
  status: z.enum(['NEW', 'IN_REVIEW', 'PLANNED', 'DONE', 'WONT_FIX']).optional(),
  userId: z.string().trim().min(1).max(64).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  priority: z.coerce.number().int().min(0).max(2).optional(),
  format: z.enum(['json', 'csv']).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
});

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: 'forbidden', reason: session.reason },
      { status: session.reason === 'config_error' ? 500 : 403 },
    );
  }

  const sp = request.nextUrl.searchParams;
  const raw = {
    type: sp.get('type') ?? undefined,
    status: sp.get('status') ?? undefined,
    userId: sp.get('userId') ?? undefined,
    dateFrom: sp.get('dateFrom') ?? undefined,
    dateTo: sp.get('dateTo') ?? undefined,
    priority: sp.get('priority') ?? undefined,
    format: sp.get('format') ?? undefined,
    page: sp.get('page') ?? undefined,
    pageSize: sp.get('pageSize') ?? undefined,
  };
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_error', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const q = parsed.data;
  const where = buildFeedbackListWhere({
    type: q.type,
    status: q.status,
    userId: q.userId,
    dateFrom: q.dateFrom ? new Date(q.dateFrom) : undefined,
    dateTo: q.dateTo ? new Date(q.dateTo) : undefined,
    priority: q.priority,
  });

  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 50;

  const [rows, total, summary] = await Promise.all([
    prisma.feedbackSubmission.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true,
        userId: true,
        type: true,
        category: true,
        rating: true,
        nps: true,
        message: true,
        status: true,
        priority: true,
        createdAt: true,
        reviewedAt: true,
        reviewedBy: true,
        reviewNote: true,
      },
    }),
    prisma.feedbackSubmission.count({ where }),
    computeFeedbackSummary(where),
  ]);

  if (q.format === 'csv') {
    const csv = feedbackToCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="feedback-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    data: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
    })),
    total,
    page,
    pageSize,
    summary,
  });
}
