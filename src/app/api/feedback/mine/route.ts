// ============================================================================
// GET /api/feedback/mine — listar submissões do próprio usuário
// ============================================================================
// Retorna histórico paginado. LGPD Art. 18 (direito de acesso) — titular
// vê tudo que ele enviou. Sem PII cross-user.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/options';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json(
      { error: 'unauthenticated', message: 'Faça login para ver seus feedbacks.' },
      { status: 401 },
    );
  }

  const rows = await prisma.feedbackSubmission.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      type: true,
      category: true,
      rating: true,
      nps: true,
      message: true,
      status: true,
      priority: true,
      createdAt: true,
      reviewedAt: true,
      reviewNote: true,
    },
  });

  return NextResponse.json({
    data: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
    })),
    count: rows.length,
  });
}
