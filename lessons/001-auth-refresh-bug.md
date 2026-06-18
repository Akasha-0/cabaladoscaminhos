# L-001 — Auth refresh bug — token expires silently, no caller

**Date:** 2026-06-18
**Area:** auth | harness
**Status:** open (no implementation yet — Loop 001 assessment only)

## What happened
Session tokens expire after 15 minutes. The Supabase refresh endpoint exists and works. But **no page, provider, or middleware calls it** — so after 15 minutes of inactivity, every authenticated user is silently redirected to `/onboarding`.

## Non-obvious insight
The bug is not that the refresh logic is broken — it's that **the refresh call was never wired to any call site**. The endpoint exists in the codebase but was treated as an implementation detail rather than a UX dependency. This is a class of bug that typecheck, lint, and tests cannot catch: a function that is correct in isolation but never invoked in the call graph.

## Actionable guidance
When implementing auth: treat token refresh as a **render-time side effect**, not a background process. Options:
1. `AuthSessionProvider` (Next.js server component) that calls refresh on every request before rendering
2. Middleware that intercepts 401 responses and retries with refresh
3. Client-side `useEffect` that refreshes on a timer (15min - buffer)

The SupabaseProvider dead code must also be removed — it is misleading noise in the call graph.

**Blast radius if fixing:** `apps/akasha-portal/src/app/providers.tsx` (likely), `middleware.ts` (possible), `AuthSessionProvider` (new file).

## Related failures
- Loop 001 QA Report: B3 Auth/Session = 19/100
- FASE 1 action items (Loop 001): `AuthSessionProvider`, middleware refresh, remove SupabaseProvider
- See: `memory/loop-reports/LOOP_001_QA_REPORT.md` for full assessment
