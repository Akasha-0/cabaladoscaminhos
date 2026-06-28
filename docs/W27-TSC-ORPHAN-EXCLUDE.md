# W27 — Orphan Test Dir TSC Exclude + Prisma 7.x Fix

**Date:** 2026-06-28
**Wave:** W27 (follows W26 commit `278146d` gate-clearance)
**Author:** W27-ORPHAN-TEST-EXCLUDE-AND-PRISMA-FIX (Coder)

---

## Result

| Metric | Before | After |
|--------|--------|-------|
| TSC errors | **3043** | **641** |
| Orphan test dirs excluded | 0 | **134** |
| Prisma 7.x schema fix | ❌ | ✅ |

**Reduction:** 3043 → 641 = **-2402 errors (-79%)**

**Target was <500; achieved 641 (still above target but well below baseline).**
The residual 641 errors are documented below for W28 follow-up.

---

## What Changed

### 1. `tsconfig.json` — added 134 orphan test dirs to `exclude`

**Method:** For each `tests/lib/<name>/`, checked if matching `src/lib/<name>/` exists. If not → orphan → added to exclude.

Only 3 dirs had matching src counterparts and were KEPT:
- `tests/lib/ai` → `src/lib/ai` ✓
- `tests/lib/notifications` → `src/lib/notifications` ✓
- `tests/lib/statistics` → `src/lib/statistics` ✓

All other 134 dirs were orphans (tests for modules that don't exist in src).

**Why these are orphans (root cause):**
- Brief's 2026-06-04 vision document decided to clean up **B2B/Cockpit/Zelador** scope
- W23 cleanup wave deleted `src/lib/correlation/`, `src/lib/lenormand/`, etc.
- Test files were NOT deleted (out of scope of W23 cleanup)
- Result: 134 test dirs with imports like `@/lib/correlation/chakra-day` that resolve to nothing

### 2. `prisma/schema.prisma:7` — removed `url = env("DATABASE_URL")`

**Reason:** Prisma 7.x moves datasource URL to `prisma.config.ts` (verified at line 11-12: `datasource: { url: process.env["DATABASE_URL"] }`).

Same fix already applied on `feat/community-platform` branch (commit `06d0576`) — this propagates it to `main`.

---

## Vitest Behavior Preserved ✅

Verified: vitest still discovers and attempts to run orphan tests because `vitest.config.ts` does NOT reference tsconfig exclude. Vitest has its own test file discovery (default glob `**/*.{test,spec}.{ts,tsx}`).

Orphan tests fail to LOAD (imports don't exist) — but this is the **pre-existing** behavior, not introduced by W27. No regression.

---

## Residual 641 TSC Errors — Top 10 Sources

| # | File | Errors | Status |
|---|------|--------|--------|
| 1 | `src/lib/admin/metrics.ts` | 35 | **Out of scope** (W23 cleanup marked for removal) |
| 2 | `tests/integration/payments.test.ts` | 31 | **Out of scope** (B2B legacy) |
| 3 | `tests/lib/ai/insights/generator.test.ts` | 26 | KEEP (has src/lib/ai); needs fix |
| 4 | `src/app/...` (various routes) | 26 | Legitimate — needs W28 fix |
| 5 | `src/lib/community/posts.ts` | 19 | Legitimate — needs W28 fix |
| 6 | `tests/integration/api/creditos.test.ts` | 18 | **Out of scope** (B2B legacy) |
| 7 | `tests/api/onboarding.test.ts` | 13 | Legitimate — needs W28 fix |
| 8 | `tests/lib/spiritual-engines-validation.test.ts` | 12 | Legitimate — needs W28 fix |
| 9 | `tests/api/auth-security-fixes.test.ts` | 12 | Legitimate — needs W28 fix |
| 10 | `src/lib/community/bookmarks.ts` | 12 | Legitimate — needs W28 fix |

**Top-5 in-scope for W28:**
1. `tests/lib/ai/insights/generator.test.ts` (26) — fix imports / fixtures
2. `src/app/...` aggregate (26) — page/component type errors
3. `src/lib/community/posts.ts` (19) — Prisma/client type drift
4. `src/lib/community/bookmarks.ts` (12) — same family
5. `tests/lib/spiritual-engines-validation.test.ts` (12) — engine API drift

---

## Recommendation

**Push this commit now.** It removes 79% of TSC noise, applies the Prisma 7.x fix, and keeps vitest intact. The remaining 641 errors are mostly legit work for W28, but each is a meaningful refactor (community modules, app routes) — not safe to bundle into W27's narrow scope.

W28 should:
1. Fix `tests/lib/ai/insights/generator.test.ts` imports (~26 errors)
2. Audit `src/lib/community/*` Prisma client drift (~40+ errors)
3. Audit `src/app/` route errors (26 errors)
4. Decide on `src/lib/admin/metrics.ts` and `payments.test.ts` — remove or fix
