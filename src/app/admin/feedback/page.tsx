// ============================================================================
// /admin/feedback — dashboard de feedback (Wave 33)
// ============================================================================
// Server component lista submissões + summary. Client child (filters + list)
// controla paginação/filtro. requireAdmin enforced no server.
//
// Métricas visíveis: total, NPS breakdown (promoters/passives/detractors),
// open count, resolved last 7d, avg rating.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/options';
import {
  computeFeedbackSummary,
  buildFeedbackListWhere,
} from '@/lib/feedback';
import { FeedbackDashboardClient } from './FeedbackDashboardClient';

export const metadata: Metadata = {
  title: 'Admin · Feedback · Cabala dos Caminhos',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

async function isAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, planoAssinatura: true },
  });
  if (!user) return false;
  if (adminEmails.includes(user.email)) return true;
  return user.planoAssinatura === 'ADMIN';
}

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!(await isAdmin(userId))) {
    redirect('/login?from=/admin/feedback');
  }

  const where = buildFeedbackListWhere({});
  const [rows, total, summary] = await Promise.all([
    prisma.feedbackSubmission.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 50,
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
        reviewNote: true,
      },
    }),
    prisma.feedbackSubmission.count({ where }),
    computeFeedbackSummary(where),
  ]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none mx-auto max-w-6xl px-4 py-10 sm:py-14"
      aria-labelledby="admin-feedback-title"
    >
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-spiritual-gold/80">
          Admin · Feedback
        </p>
        <h1
          id="admin-feedback-title"
          className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground"
        >
          Fila de feedback
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {total} submissões no total · {summary.openCount} abertas ·{' '}
          {summary.resolvedLast7d} resolvidas nos últimos 7 dias
        </p>
      </header>

      <FeedbackDashboardClient
        initialRows={rows.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          reviewedAt: r.reviewedAt?.toISOString() ?? null,
        }))}
        total={total}
        summary={summary}
      />
    </main>
  );
}
