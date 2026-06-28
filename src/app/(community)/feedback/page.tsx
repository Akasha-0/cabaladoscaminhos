/**
 * /(community)/feedback — Public Feature Requests board
 * -----------------------------------------------------------------------------
 * User-facing page where the community can:
 *  1. See all feature requests (public, sorted by upvotes desc)
 *  2. Submit a new feature request
 *  3. Upvote existing requests (1 per user per request)
 *  4. Filter by status (proposed / planned / in-progress / done)
 *  5. Filter by category
 *
 * Anonymous visitors:
 *  - Can view and submit requests (anonymously — no user_id)
 *  - Cannot upvote (must be logged in)
 *
 * Data flow:
 *  - Server Component fetches list (no client-side waterfall)
 *  - Client Component for the form (interactive)
 *  - Mutations via POST /api/feedback (re-fetch via router.refresh())
 *
 * @see docs/FEEDBACK-LOOP.md §6
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import type { ReactElement } from 'react'
import { FeedbackBoard } from './FeedbackBoard'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Feature Requests · Akasha Portal',
  description: 'Sugira, vote e acompanhe novas funcionalidades do portal.',
}

export const dynamic = 'force-dynamic'

// ─── Data types (mirror Prisma model + DB) ───────────────────────────────────

export type FeatureRequestStatus = 'proposed' | 'planned' | 'in-progress' | 'done' | 'declined'

export interface FeatureRequestRow {
  id: string
  title: string
  description: string
  category: string
  status: FeatureRequestStatus
  upvotes: number
  created_at: string
  author_display: string // 'Anônimo' or first-name-only of author
}

export interface PageData {
  requests: FeatureRequestRow[]
  currentUserId: string | null
  myUpvotes: Set<string> // request ids the current user upvoted
}

// ─── Server Component ────────────────────────────────────────────────────────

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>
}): Promise<ReactElement> {
  const params = await searchParams
  const status = params.status ?? 'all'
  const category = params.category ?? 'all'

  const data = await loadFeatureRequests({
    status: status === 'all' ? null : (status as FeatureRequestStatus),
    category: category === 'all' ? null : category,
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-serif text-amber-100 sm:text-4xl">
          ✦ Pedidos da Comunidade
        </h1>
        <p className="max-w-2xl text-zinc-400">
          O Akasha Portal é construído com a comunidade. Sugere uma funcionalidade,
          vota nas que mais importam, e acompanha o que está no radar. Tudo aqui é
          público e transparente.
        </p>
      </header>

      <Suspense fallback={<div className="text-zinc-500">Carregando pedidos…</div>}>
        <FeedbackBoard
          initialRequests={data.requests}
          currentUserId={data.currentUserId}
          myUpvotes={Array.from(data.myUpvotes)}
          initialStatus={status}
          initialCategory={category}
        />
      </Suspense>
    </main>
  )
}

// ─── Server-side data loader ─────────────────────────────────────────────────

async function loadFeatureRequests(filters: {
  status: FeatureRequestStatus | null
  category: string | null
}): Promise<PageData> {
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

  // Current user (may be null)
  const { data: userData } = await supabase.auth.getUser()
  const currentUserId = userData?.user?.id ?? null

  // Load feature requests via Prisma (same DB, better filter DSL)
  // usa o singleton de @/lib/prisma para evitar recriar clients a cada request
  try {
    const rows = await prisma.featureRequest.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.category ? { category: filters.category } : {}),
      },
      orderBy: [{ upvotes: 'desc' }, { created_at: 'desc' }],
      take: 200,
      include: {
        // author is optional (anonymous allowed) — only join if present
        author: { select: { display_name: true } },
      },
    })

    const requests: FeatureRequestRow[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      status: r.status as FeatureRequestStatus,
      upvotes: r.upvotes,
      created_at: r.created_at.toISOString(),
      author_display: r.author?.display_name ?? 'Anônimo',
    }))

    // My upvotes (only if logged in)
    let myUpvotes: Set<string> = new Set()
    if (currentUserId) {
      const ups = await prisma.featureUpvote.findMany({
        where: { user_id: currentUserId },
        select: { request_id: true },
      })
      myUpvotes = new Set(ups.map((u) => u.request_id))
    }

    return { requests, currentUserId, myUpvotes }
  } finally {
    await prisma.$disconnect()
  }
}
