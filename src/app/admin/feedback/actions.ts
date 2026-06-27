/**
 * Server Actions for the admin feedback dashboard
 * -----------------------------------------------------------------------------
 * Called from AdminFeedbackDashboard.tsx. Each action re-verifies the
 * caller's admin role (defense in depth) and writes through Prisma.
 *
 * These actions do NOT emit PostHog events (admins aren't analytics
 * subjects in this product) — only the resulting user-visible state change
 * is what we measure.
 *
 * @see docs/FEEDBACK-LOOP.md §7
 */

'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'

// ─── Admin role check (re-verify on every action) ────────────────────────────

async function assertAdmin(): Promise<void> {
  const cStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cStore.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) => cStore.set(name, value, options)),
      },
    },
  )
  const { data } = await supabase.auth.getUser()
  const role = (data?.user?.app_metadata?.role as string | undefined) ?? null
  if (role !== 'admin' && role !== 'pm') {
    throw new Error('Forbidden — admin role required.')
  }
}

// ─── Feature request status ─────────────────────────────────────────────────

const featureStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['proposed', 'planned', 'in-progress', 'done', 'declined']),
})

export async function updateFeatureRequestStatus(
  rawId: string,
  rawStatus: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin()
  const parsed = featureStatusSchema.safeParse({ id: rawId, status: rawStatus })
  if (!parsed.success) {
    return { ok: false, error: 'validation_failed' }
  }
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    try {
      await prisma.featureRequest.update({
        where: { id: parsed.data.id },
        data: { status: parsed.data.status },
      })
    } finally {
      await prisma.$disconnect()
    }
    revalidatePath('/admin/feedback')
    revalidatePath('/feedback')
    return { ok: true }
  } catch (e) {
    console.error('[admin] updateFeatureRequestStatus failed:', e)
    return { ok: false, error: 'internal_error' }
  }
}

// ─── Bug report status ──────────────────────────────────────────────────────

const bugStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['open', 'triaged', 'in-progress', 'resolved', 'wont-fix']),
})

export async function updateBugReportStatus(
  rawId: string,
  rawStatus: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin()
  const parsed = bugStatusSchema.safeParse({ id: rawId, status: rawStatus })
  if (!parsed.success) {
    return { ok: false, error: 'validation_failed' }
  }
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    try {
      await prisma.bugReport.update({
        where: { id: parsed.data.id },
        data: { status: parsed.data.status },
      })
    } finally {
      await prisma.$disconnect()
    }
    revalidatePath('/admin/feedback')
    return { ok: true }
  } catch (e) {
    console.error('[admin] updateBugReportStatus failed:', e)
    return { ok: false, error: 'internal_error' }
  }
}
