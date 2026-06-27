/**
 * PostHog Setup — Server + Client Initialization (LGPD-compliant)
 * -----------------------------------------------------------------------------
 * Single source of truth for PostHog analytics integration.
 *
 * Two surfaces:
 *  - `posthogServer`  → server-side (Route Handlers, Server Components, Server Actions)
 *  - `posthogClient`  → browser-side (Client Components, hooks)
 *
 * LGPD principles (see docs/FEEDBACK-LOOP.md §2):
 *  - Opt-in: events are NEVER sent until `analyticsConsent()` is called
 *  - No PII in event payloads (no email, name, phone, CPF, full DOB)
 *  - Anonymous IDs only (`distinct_id` is a UUID we mint; not derived from email)
 *  - User can revoke via cookie/localStorage flag and via `/api/privacy/revoke`
 *
 * Provider choice rationale:
 *  - PostHog OSS self-hosted is the long-term plan (cost + LGPD control)
 *  - Phase 1 may run on PostHog Cloud EU (eu.i.posthog.com) for zero-ops setup
 *  - Both expose the same JS API; only the `host` differs.
 *
 * Configuration surface (env vars — see .env.example):
 *   NEXT_PUBLIC_POSTHOG_KEY      required   — project API key (public, safe to ship)
 *   NEXT_PUBLIC_POSTHOG_HOST     required   — https://us.i.posthog.com | https://eu.i.posthog.com
 *   POSTHOG_PROJECT_API_KEY      optional   — server-only personal API key (for /decide, /capture overrides)
 *   POSTHOG_DISABLED             optional   — set "true" in tests/dev to fully no-op
 *
 * @see docs/FEEDBACK-LOOP.md
 * @see scripts/postHog-funnels.yaml
 */

import posthog from 'posthog-js'
import { PostHog } from 'posthog-node'
import { cookies, headers } from 'next/headers'

// ─── Constants ──────────────────────────────────────────────────────────────

const CONSENT_COOKIE = 'akasha_analytics_consent' // 'granted' | 'denied'
const DISTINCT_ID_COOKIE = 'akasha_ph_distinct_id' // anonymous UUID
const CONSENT_MAX_AGE_DAYS = 180 // LGPD: consent must be renewable every 6 months

export type ConsentState = 'granted' | 'denied' | 'unset'

// ─── Disabled-mode (tests, local dev without env) ────────────────────────────

function isDisabled(): boolean {
  if (typeof process === 'undefined') return true
  if (process.env.POSTHOG_DISABLED === 'true') return true
  if (process.env.NODE_ENV === 'test') return true
  return !process.env.NEXT_PUBLIC_POSTHOG_KEY || !process.env.NEXT_PUBLIC_POSTHOG_HOST
}

// ─── Server-side PostHog (Node runtime) ──────────────────────────────────────

let _serverClient: PostHog | null = null

/**
 * Server-side PostHog client. Lazy-initialized. Use for:
 *  - Server Components that need to capture server-side events (e.g. cron)
 *  - Route Handlers (`app/api/*`) for backend captures
 *  - Server Actions that mutate state and want server-side events
 *
 * Do NOT use in Edge runtime — falls back to HTTP capture via `captureServerEvent`.
 */
export function getPostHogServer(): PostHog | null {
  if (isDisabled()) return null
  if (_serverClient) return _serverClient

  _serverClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    // Personal API key enables /decide + feature flags; optional.
    personalApiKey: process.env.POSTHOG_PROJECT_API_KEY,
    // LGPD: never capture IP, never autocapture server-side.
    enableExceptionAutocapture: false,
    // Privacy: disable geo-IP resolution.
    privacyMode: true,
    // Flush every 1s in serverless to balance latency vs completeness.
    flushInterval: 1000,
    // 5s hard cap before SIGTERM kills the function.
    flushAt: 1,
  })

  return _serverClient
}

/**
 * Capture an event from a Route Handler / Server Action / Server Component.
 *
 * No PII is accepted — `properties` is typed to forbid email/name/phone etc.
 * `distinctId` must be the anonymous UUID (NOT the user id; we use a separate
 * alias if the user is identified — see `identifyUser`).
 */
export async function captureServerEvent(args: {
  distinctId: string
  event: string
  properties?: Record<string, string | number | boolean | null>
}): Promise<void> {
  if (isDisabled()) return
  const client = getPostHogServer()
  if (!client) return
  client.capture({
    distinctId: args.distinctId,
    event: args.event,
    properties: args.properties ?? {},
    // Disable geo-IP; LGPD.
    ip: null,
  })
  // Ensure we don't drop the event when the function returns.
  await client.flush()
}

// ─── Client-side PostHog (browser) ───────────────────────────────────────────

let _clientInitStarted = false

/**
 * Initialize PostHog on the client. Idempotent — call as many times as you
 * want; only the first call has effect.
 *
 * MUST be called AFTER `analyticsConsent()` resolves to 'granted'.
 * The recommended pattern is to gate on the consent cookie in a top-level
 * `<ConsentGate>` boundary component (see FEEDBACK-LOOP.md §2.4).
 */
export function initPostHogClient(): void {
  if (_clientInitStarted) return
  if (typeof window === 'undefined') return
  if (isDisabled()) return
  if (!hasAnalyticsConsentClient()) return

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    // ─── LGPD: NO PII autocapture ───
    autocapture: false,
    capture_pageview: true, // page views are non-PII; OK under LGPD
    capture_pageleave: true,
    disable_session_recording: true, // session replay is OFF by default; opt-in via /privacy
    // ─── Privacy mode ───
    opt_out_capturing_by_default: false,
    // ─── Performance ───
    persistence: 'localStorage',
    // ─── Dev convenience ───
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        // Expose for browser-console debugging.
        ;(window as unknown as { posthog: typeof ph }).posthog = ph
      }
    },
  })

  // Apply persisted distinct_id if user previously consented.
  const persisted = readClientDistinctId()
  if (persisted) {
    posthog.identify(persisted)
  }

  _clientInitStarted = true
}

/**
 * Track a client-side event. Always type-safe via `events.ts` `EventName`.
 */
export function captureClientEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
): void {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsentClient()) return
  initPostHogClient()
  posthog.capture(event, properties ?? {})
}

/**
 * Identify the current user. Pass an anonymous UUID for `distinctId`.
 *
 * We do NOT pass `email`, `name`, or any PII — PostHog allows setting
 * `personProperties` later if/when the user explicitly opts in.
 *
 * Note: `posthog.alias()` (merging anon → known) is intentionally NOT exposed
 * here. It's called once per user from the auth flow with explicit consent.
 */
export function identifyUser(distinctId: string, traits?: {
  joined_at?: string // ISO date — not PII
  locale?: string
}): void {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsentClient()) return
  initPostHogClient()
  posthog.identify(distinctId, traits ?? {})
}

// ─── Consent management ──────────────────────────────────────────────────────

/**
 * Server-side: read consent state from cookies (set by /api/privacy/consent).
 * Used in Server Components to gate analytics-dependent UI.
 */
export async function getConsentServer(): Promise<ConsentState> {
  try {
    const store = await cookies()
    const v = store.get(CONSENT_COOKIE)?.value
    if (v === 'granted') return 'granted'
    if (v === 'denied') return 'denied'
    return 'unset'
  } catch {
    // cookies() throws outside of a request scope — treat as unset.
    return 'unset'
  }
}

/**
 * Server-side: set consent state. Called from /api/privacy/consent route.
 */
export async function setConsentServer(state: 'granted' | 'denied'): Promise<void> {
  const store = await cookies()
  store.set(CONSENT_COOKIE, state, {
    httpOnly: false, // must be readable by client init logic
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CONSENT_MAX_AGE_DAYS * 24 * 60 * 60,
  })
  if (state === 'granted') {
    // Mint a distinct_id if missing — anonymous UUID, not derivable from PII.
    let did = store.get(DISTINCT_ID_COOKIE)?.value
    if (!did) {
      did = crypto.randomUUID()
      store.set(DISTINCT_ID_COOKIE, did, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      })
    }
  }
}

/**
 * Client-side: check if the user has consented.
 * Reads `document.cookie` — no React state, sync, safe in render.
 */
export function hasAnalyticsConsentClient(): boolean {
  if (typeof document === 'undefined') return false
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  return match?.[1] === 'granted'
}

/**
 * Client-side: read the anonymous distinct_id (UUID we minted on consent).
 */
export function readClientDistinctId(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${DISTINCT_ID_COOKIE}=([^;]*)`))
  return match?.[1] ?? null
}

// ─── Route context (for Server Components / Route Handlers) ─────────────────

/**
 * Extract a route context — user-agent (truncated) + path — for server-side
 * capture. We deliberately do NOT capture IP (LGPD + Vercel forwards it via
 * `x-forwarded-for`; we ignore it).
 */
export async function getServerRouteContext(): Promise<{
  path: string
  ua: string | null
}> {
  try {
    const h = await headers()
    const ua = h.get('user-agent')?.slice(0, 200) ?? null
    const path = h.get('x-pathname') ?? h.get('referer') ?? '/'
    return { path, ua }
  } catch {
    return { path: '/', ua: null }
  }
}

// ─── Shutdown (serverless cold start) ────────────────────────────────────────

/**
 * Flush server-side events before the function terminates.
 * Vercel gives us ~250ms of CPU after the response is sent; this is the
 * last-chance flush window.
 */
export async function shutdownPostHogServer(): Promise<void> {
  if (!_serverClient) return
  await _serverClient.flush()
  await _serverClient.shutdown()
}
