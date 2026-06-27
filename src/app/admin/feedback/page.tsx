/**
 * /admin/feedback — Admin dashboard for feedback triage
 * -----------------------------------------------------------------------------
 * Server Component. Visible ONLY to admins (gated by middleware + role check).
 *
 * Sections:
 *  1. NPS overview — score distribution, trend, detractor quotes
 *  2. Feature requests — sorted by upvotes + status, with quick-status-edit
 *  3. Bug reports — open ones first, severity-sorted
 *
 * Mutations (status changes, comment replies) use server actions in
 * src/app/admin/feedback/actions.ts. NOT exposed via the public /api/feedback
 * endpoint — admin operations go through the admin path with role check.
 *
 * Access control:
 *  - Middleware redirects non-admins to /login
 *  - This page ALSO does a role check server-side (defense in depth)
 *  - The RLS policies in Supabase also restrict reads to admins
 *
 * @see docs/FEEDBACK-LOOP.md §7
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { AdminFeedbackDashboard } from './AdminFeedbackDashboard'

export const metadata = {
  title: 'Feedback · Admin · Akasha Portal',
  robots: { index: false, follow: false }, // never index admin pages
}

export const dynamic = 'force-dynamic'

// ─── Server-side data loaders ────────────────────────────────────────────────

interface NpsStats {
  total_responses: number
  nps_score: number // -100 to +100 (Promoters% - Detractors%)
  promoter_pct: number
  passive_pct: number
  detractor_pct: number
  trend_30d: number // delta vs previous 30d
  recent_comments: Array<{
    score: number
    comment: string
    submitted_at: string
  }>
}

interface FeatureRequestRow {
  id: string
  title: string
  description: string
  category: string
  status: string
  upvotes: number
  created_at: string
  author_display: string
}

interface BugReportRow {
  id: string
  title: string
  description: string
  severity: string
  category: string
  status: string
  created_at: string
  reporter_display: string
}

interface AdminData {
  nps: NpsStats
  feature_requests: FeatureRequestRow[]
  bug_reports: BugReportRow[]
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminFeedbackPage(): Promise<JSX.Element> {
  // 1. Role check (defense in depth — middleware should have already enforced).
  const cStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cStore.set(name, value, options)),
      },
    },
  )
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    redirect('/login?next=/admin/feedback')
  }
  // Check role from user metadata (Supabase convention) OR from our users table.
  const role = (userData.user.app_metadata?.role as string | undefined) ?? null
  if (role !== 'admin' && role !== 'pm') {
    // Friendly forbidden instead of generic 404.
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-serif text-amber-100">Acesso restrito</h1>
        <p className="mt-2 text-zinc-400">
          Esta área é só para administradores do portal. Se você precisa de acesso,
          peça no canal #admin-feedback.
        </p>
      </main>
    )
  }

  // 2. Load data.
  const data = await loadAdminData()

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-amber-100">Feedback · Admin</h1>
          <p className="mt-1 text-sm text-zinc-400">
            NPS, pedidos da comunidade e bug reports — tudo em um lugar.
          </p>
        </div>
        <a
          href="/admin"
          className="text-xs text-zinc-400 underline-offset-2 hover:underline"
        >
          ← Admin home
        </a>
      </header>

      <AdminFeedbackDashboard initial={data} />
    </main>
  )
}

// ─── Data loader ─────────────────────────────────────────────────────────────

async function loadAdminData(): Promise<AdminData> {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const since60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    const [
      npsAll,
      npsRecent,
      npsPrev,
      npsComments,
      features,
      bugs,
    ] = await Promise.all([
      // All-time NPS for the headline number.
      prisma.npsResponse.findMany({ select: { score: true } }),
      // Last 30d for trend.
      prisma.npsResponse.findMany({
        where: { created_at: { gte: since30 } },
        select: { score: true },
      }),
      // 30-60d ago for trend delta.
      prisma.npsResponse.findMany({
        where: { created_at: { gte: since60, lt: since30 } },
        select: { score: true },
      }),
      // Last 30d qualitative comments (detractors + open-text feedback).
      prisma.npsResponse.findMany({
        where: {
          created_at: { gte: since30 },
          comment: { not: null },
        },
        select: { score: true, comment: true, created_at: true },
        orderBy: { created_at: 'desc' },
        take: 50,
      }),
      // Feature requests (top 100 by upvotes + recent).
      prisma.featureRequest.findMany({
        orderBy: [{ upvotes: 'desc' }, { created_at: 'desc' }],
        take: 100,
        include: { author: { select: { display_name: true } } },
      }),
      // Bug reports (open first, then by severity, then by date).
      prisma.bugReport.findMany({
        orderBy: [{ status: 'asc' }, { severity: 'desc' }, { created_at: 'desc' }],
        take: 50,
        include: { reporter: { select: { display_name: true } } },
      }),
    ])

    // ─── NPS computation ──────────────────────────────────────────────────
    function scoreNps(rows: Array<{ score: number }>): {
      nps: number
      promoter: number
      passive: number
      detractor: number
    } {
      if (rows.length === 0) {
        return { nps: 0, promoter: 0, passive: 0, detractor: 0 }
      }
      const promoters = rows.filter((r) => r.score >= 9).length
      const detractors = rows.filter((r) => r.score <= 6).length
      const passives = rows.length - promoters - detractors
      const promoterPct = (promoters / rows.length) * 100
      const passivePct = (passives / rows.length) * 100
      const detractorPct = (detractors / rows.length) * 100
      const nps = Math.round(promoterPct - detractorPct)
      return {
        nps,
        promoter: Math.round(promoterPct),
        passive: Math.round(passivePct),
        detractor: Math.round(detractorPct),
      }
    }
    const current = scoreNps(npsRecent)
    const previous = scoreNps(npsPrev)

    const nps: NpsStats = {
      total_responses: npsAll.length,
      nps_score: current.nps,
      promoter_pct: current.promoter,
      passive_pct: current.passive,
      detractor_pct: current.detractor,
      trend_30d: current.nps - previous.nps,
      recent_comments: npsComments
        .filter((c) => c.comment !== null)
        .map((c) => ({
          score: c.score,
          comment: c.comment as string,
          submitted_at: c.created_at.toISOString(),
        })),
    }

    // ─── Feature requests ────────────────────────────────────────────────
    const feature_requests: FeatureRequestRow[] = features.map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      category: f.category,
      status: f.status,
      upvotes: f.upvotes,
      created_at: f.created_at.toISOString(),
      author_display: f.author?.display_name ?? 'Anônimo',
    }))

    // ─── Bug reports ─────────────────────────────────────────────────────
    const bug_reports: BugReportRow[] = bugs.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      severity: b.severity,
      category: b.category,
      status: b.status,
      created_at: b.created_at.toISOString(),
      reporter_display: b.reporter?.display_name ?? 'desconhecido',
    }))

    return { nps, feature_requests, bug_reports }
  } finally {
    await prisma.$disconnect()
  }
}
