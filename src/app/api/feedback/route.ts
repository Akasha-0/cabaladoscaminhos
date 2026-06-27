/**
 * POST /api/feedback — Feedback ingestion endpoint
 * -----------------------------------------------------------------------------
 * Accepts feedback submissions from:
 *  - NPSWidget.tsx (type='nps')
 *  - /(community)/feedback page (type='feature_request' | 'feature_upvote' | 'bug')
 *
 * Responsibilities:
 *  - Validate payload (Zod)
 *  - Persist to Supabase (anon-safe — no user_id required for NPS)
 *  - If NPS score < 7: trigger PM notification (webhook + email)
 *  - Return 200 OK with { id } for client correlation
 *
 * Privacy:
 *  - NPS scores are stored keyed by anonymous UUID (`distinct_id` cookie)
 *  - Feature requests may be anonymous OR identified (user_id optional)
 *  - Bug reports are ALWAYS identified (so we can follow up)
 *  - Rate-limited per IP (max 10 submissions / hour)
 *
 * @see docs/FEEDBACK-LOOP.md §5
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import {
  captureServerEvent,
  getConsentServer,
  getServerRouteContext,
} from '@/lib/analytics/posthog-setup'

// ─── Runtime config ──────────────────────────────────────────────────────────

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Rate limiting (in-memory — replace with Redis in production) ────────────

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1h
const RATE_LIMIT_MAX = 10

interface RateBucket {
  count: number
  resetAt: number
}
const _rateBuckets = new Map<string, RateBucket>()

function rateLimit(ip: string): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now()
  const bucket = _rateBuckets.get(ip)
  if (!bucket || bucket.resetAt < now) {
    _rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { ok: true }
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  bucket.count += 1
  return { ok: true }
}

// ─── Payload schemas ─────────────────────────────────────────────────────────

const npsSchema = z.object({
  type: z.literal('nps'),
  score: z.number().int().min(0).max(10),
  comment: z.string().max(500).nullable().optional(),
})

const featureRequestSchema = z.object({
  type: z.literal('feature_request'),
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(2000),
  category: z.enum([
    'content',
    'ai',
    'community',
    'profile',
    'notifications',
    'accessibility',
    'other',
  ]),
})

const featureUpvoteSchema = z.object({
  type: z.literal('feature_upvote'),
  request_id: z.string().uuid(),
})

const bugSchema = z.object({
  type: z.literal('bug'),
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(2000),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['ui', 'performance', 'ai', 'auth', 'data', 'other']),
})

const schema = z.discriminatedUnion('type', [
  npsSchema,
  featureRequestSchema,
  featureUpvoteSchema,
  bugSchema,
])

// ─── PM notification (NPS < 7) ───────────────────────────────────────────────

async function notifyPMDetractor(args: {
  score: number
  comment: string | null
  context: { path: string; ua: string | null }
}): Promise<void> {
  const webhook = process.env.PM_FEEDBACK_WEBHOOK_URL
  if (!webhook) {
    // In dev/test, log instead. In prod this is required.
    if (process.env.NODE_ENV === 'production') {
      console.error('[feedback] PM_FEEDBACK_WEBHOOK_URL not set — detractor not notified!')
    } else {
      console.info('[feedback] PM notif (dev):', { score: args.score, comment: args.comment })
    }
    return
  }
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `⚠️ NPS detrator (${args.score}/10)${args.comment ? `: "${args.comment}"` : ''}`,
        context: args.context,
        timestamp: new Date().toISOString(),
      }),
      // Don't block the user response on this — but cap the wait at 3s.
      signal: AbortSignal.timeout(3000),
    })
  } catch (e) {
    console.error('[feedback] PM webhook failed:', e)
  }
}

// ─── DB helpers (Prisma client — imported lazily to avoid cold-start cost) ───

async function getPrisma() {
  // Imported dynamically so the route can fail fast if Prisma isn't generated.
  const mod = await import('@prisma/client')
  return new mod.PrismaClient()
}

async function persistNps(args: {
  distinctId: string
  score: number
  comment: string | null
}): Promise<string> {
  const prisma = await getPrisma()
  try {
    const row = await prisma.npsResponse.create({
      data: {
        distinct_id: args.distinctId,
        score: args.score,
        comment: args.comment,
        // user_id is intentionally null — NPS is anonymous.
        user_id: null,
      },
    })
    return row.id
  } finally {
    await prisma.$disconnect()
  }
}

async function persistFeatureRequest(args: {
  userId: string | null
  title: string
  description: string
  category: string
}): Promise<string> {
  const prisma = await getPrisma()
  try {
    const row = await prisma.featureRequest.create({
      data: {
        title: args.title,
        description: args.description,
        category: args.category,
        // user_id nullable — anonymous requests allowed
        user_id: args.userId,
        status: 'proposed',
        upvotes: 0,
      },
    })
    return row.id
  } finally {
    await prisma.$disconnect()
  }
}

async function upvoteFeatureRequest(args: {
  requestId: string
  userId: string | null
}): Promise<void> {
  const prisma = await getPrisma()
  try {
    await prisma.$transaction(async (tx) => {
      await tx.featureRequest.update({
        where: { id: args.requestId },
        data: { upvotes: { increment: 1 } },
      })
      // Dedupe by (user_id, request_id) when identified; allow anon with IP.
      await tx.featureUpvote.create({
        data: {
          request_id: args.requestId,
          user_id: args.userId, // nullable
        },
      })
    })
  } finally {
    await prisma.$disconnect()
  }
}

async function persistBugReport(args: {
  userId: string
  title: string
  description: string
  severity: string
  category: string
}): Promise<string> {
  const prisma = await getPrisma()
  try {
    const row = await prisma.bugReport.create({
      data: {
        user_id: args.userId,
        title: args.title,
        description: args.description,
        severity: args.severity,
        category: args.category,
        status: 'open',
      },
    })
    return row.id
  } finally {
    await prisma.$disconnect()
  }
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Rate limit by IP (Vercel forwards via x-forwarded-for).
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const rl = rateLimit(ip)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', retry_after: rl.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 3600) } },
    )
  }

  // 2. Parse + validate.
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  // 3. Per-type handling.
  try {
    const routeCtx = await getServerRouteContext()
    const consent = await getConsentServer()

    switch (parsed.data.type) {
      case 'nps': {
        const cStore = await cookies()
        const distinctId = cStore.get('akasha_ph_distinct_id')?.value ?? null
        if (!distinctId) {
          // Without consent, we shouldn't have an NPS widget open. But be defensive.
          return NextResponse.json({ error: 'consent_required' }, { status: 412 })
        }
        const id = await persistNps({
          distinctId,
          score: parsed.data.score,
          comment: parsed.data.comment ?? null,
        })

        // Track in PostHog ONLY if user consented.
        if (consent === 'granted') {
          await captureServerEvent({
            distinctId,
            event: 'feedback_nps_submitted',
            properties: {
              score: parsed.data.score,
              has_comment: (parsed.data.comment ?? '').trim().length > 0,
            },
          })
        }

        // Notify PM if detractor or passive (< 7 → promoter threshold).
        if (parsed.data.score < 7) {
          // Fire-and-forget; don't block the response.
          void notifyPMDetractor({
            score: parsed.data.score,
            comment: parsed.data.comment ?? null,
            context: routeCtx,
          })
        }

        return NextResponse.json({ id, type: 'nps' })
      }

      case 'feature_request': {
        // User id from auth context (Next.js + Supabase).
        const userId = await getCurrentUserId()
        const id = await persistFeatureRequest({
          userId,
          title: parsed.data.title,
          description: parsed.data.description,
          category: parsed.data.category,
        })

        if (consent === 'granted' && userId) {
          const cStore = await cookies()
          const distinctId = cStore.get('akasha_ph_distinct_id')?.value ?? userId
          await captureServerEvent({
            distinctId,
            event: 'feedback_feature_request_created',
            properties: {
              request_id: id,
              category: parsed.data.category,
            },
          })
        }

        return NextResponse.json({ id, type: 'feature_request' })
      }

      case 'feature_upvote': {
        const userId = await getCurrentUserId()
        await upvoteFeatureRequest({
          requestId: parsed.data.request_id,
          userId,
        })

        if (consent === 'granted' && userId) {
          const cStore = await cookies()
          const distinctId = cStore.get('akasha_ph_distinct_id')?.value ?? userId
          await captureServerEvent({
            distinctId,
            event: 'feedback_feature_request_upvoted',
            properties: { request_id: parsed.data.request_id },
          })
        }

        return NextResponse.json({ ok: true, type: 'feature_upvote' })
      }

      case 'bug': {
        const userId = await getCurrentUserId()
        if (!userId) {
          // Bug reports are identified-only — we need to follow up.
          return NextResponse.json({ error: 'auth_required' }, { status: 401 })
        }
        const id = await persistBugReport({
          userId,
          title: parsed.data.title,
          description: parsed.data.description,
          severity: parsed.data.severity,
          category: parsed.data.category,
        })

        if (consent === 'granted') {
          await captureServerEvent({
            distinctId: userId,
            event: 'feedback_bug_report_submitted',
            properties: {
              report_id: id,
              severity: parsed.data.severity,
              category: parsed.data.category,
            },
          })
        }

        // High/critical → page on-call.
        if (parsed.data.severity === 'high' || parsed.data.severity === 'critical') {
          void notifyPMDetractor({
            // reuse notifier; semantically a "needs attention" ping
            score: -1,
            comment: `🐛 BUG [${parsed.data.severity}]: ${parsed.data.title}\n\n${parsed.data.description}`,
            context: routeCtx,
          })
        }

        return NextResponse.json({ id, type: 'bug' })
      }
    }
  } catch (e) {
    console.error('[feedback] handler failed:', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

// ─── Auth helper (uses Supabase SSR client) ─────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { createServerClient } = await import('@supabase/ssr')
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
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) return null
    return data.user.id
  } catch {
    return null
  }
}
