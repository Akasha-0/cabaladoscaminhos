// ============================================================================
// /admin/bugs — bug tracking dashboard (Wave 36)
// ============================================================================
// Server component lists bugs (JSONL-backed), client child handles filters,
// status/severity edits, and links to Sentry fingerprints + patch ids.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/options';
import { listBugs, bugSummary } from '@/lib/bugs';
import { BugsDashboardClient } from './BugsDashboardClient';

export const metadata: Metadata = {
  title: 'Admin · Bugs · Cabala dos Caminhos',
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

export default async function AdminBugsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!(await isAdmin(userId))) {
    redirect('/login?from=/admin/bugs');
  }

  const bugs = listBugs();
  const summary = bugSummary();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none mx-auto max-w-6xl px-4 py-10 sm:py-14"
      aria-labelledby="admin-bugs-title"
    >
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-spiritual-gold/80">
          Admin · Bugs
        </p>
        <h1
          id="admin-bugs-title"
          className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground"
        >
          Hotfix loop — Wave 36
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {summary.total} bugs no total · {summary.openCount} abertos ·{' '}
          {summary.fixedLast7d} corrigidos nos últimos 7 dias
          {summary.medianTimeToFixHours !== null && (
            <> · tempo médio de correção: {summary.medianTimeToFixHours}h</>
          )}
        </p>
      </header>

      <BugsDashboardClient
        initialBugs={bugs.map((b) => ({
          ...b,
          // Don't ship raw affectedUsers array to client (privacy + size).
          // Summary already has the count.
          affectedUsers: b.affectedUsers.length,
        }))}
        summary={summary}
      />
    </main>
  );
}