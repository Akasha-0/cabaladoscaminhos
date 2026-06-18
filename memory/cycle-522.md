# Cycle 522 — 2026-06-18

## Phase: §5 — UX Bug Fix: 401/403 Redirect to /login

### What was done

**Auth UX bug (QA report LOOP_001, #1 priority):**
Expired/invalid token on the manifesto page redirected to `/onboarding` instead of `/login` — causing logged-in users whose session expired to be sent to onboarding instead of the login page.

**Root cause**: `manifesto/page.tsx` line 167 had `router.replace(\`/${locale}/onboarding\`)` on `401 || 403` response. This is a client-side redirect, independent of the middleware auth refresh flow.

**Fix**: Changed line 167 to redirect to `/${locale}/login`.

**Not changed** (intentionally surgical):
- Lines 170-171 (`404 → /onboarding`): correct — 404 from manifesto/generate means no birth chart (onboarding incomplete), not an auth failure
- Lines 179-180 (`catch → /onboarding`): too ambiguous to change without deeper analysis; not the specific bug reported

**Middleware was already fixed**: TTL changed from 15min to 4h in a prior commit (`akasha-jwt.ts:11`).

**Survey**: ran full codebase search for all `router.replace.*onboarding` on auth failure. `manifesto/page.tsx` was the **only** file with this pattern.

**Audit note**: no existing auth-redirect utility exists — each component invents its own redirect. This is an architectural gap but out of scope for a single-iteration fix.

### Triad
- `pnpm typecheck` → exit 0 ✅
- `pnpm test:run` → 1438 passed, 17 skipped ✅
- `npm run build` → success ✅

### Working tree
Clean

### Commit
`c600b76e` — "fix: redirect to /login (not /onboarding) on 401/403 in manifesto page"

### §3 SSOT notes
- `archive/` (single-d) still tracked in HEAD — legitimate archived daemons v4-v8, not removed (committed in prior session)
- Active daemon: `akasha-loop-daemon.py` (canonical, portable since hygiene pass)
- v2 modules fully deleted from active code

### Next targets (from QA report LOOP_001)
1. **MISSING MODULES**: 12 modules imported in tests but not implemented
2. **TEST INFRASTRUCTURE**: stale Prisma imports (`@/lib/prisma` vs `@/lib/infrastructure/prisma`)
3. **Dead SupabaseProvider**: dead code still in tree
4. **ErrorState test**: emoji change broke test assertion
