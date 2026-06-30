# W87-A DELIVERABLE — events-workshops B2 retry

**Cycle:** 87 (B2 retry of W86-D)
**Worker session:** 414779975110891
**Wave-spawner parent:** 414779059990725
**Branch:** `w87/events-workshops-b2`
**Final SHA:** `8b2f8914`
**Status:** ✅ **DELIVERED + PUSHED**
**Started:** 2026-06-30 11:06 UTC
**Completed:** 2026-06-30 11:18 UTC
**Wall duration:** ~12 min (well under 30 min cap)

---

## Context

W86-D suffered an LLM cascade (transient stop-reason error) at 10:53 UTC with
~80% of the work done (engine + page + factory.spec) but before finalizing:
- `src/app/events/page.spec.tsx`
- `scripts/smoke-events.mjs`
- TSC validation
- vitest run
- commit + push
- DELIVERABLE.md

W86-D pushed the partial as WIP to `origin/w86/events-workshops @ 83a94a6c`
(2,202 LOC across 6 files) as wave-spawner emergency preservation.

W87-A picks up the work on a NEW branch `w87/events-workshops-b2` and finalizes.

---

## Files added/modified (vs W86-D WIP @ 83a94a6c)

```
 scripts/smoke-events.mjs          | 377 +++++++++++++++++++++++++++++++++++
 src/app/events/layout.tsx         |   2 +-
 src/app/events/page.spec.ts       | 400 ++++++++++++++++++++++++++++++++++++++
 src/engine/events/factory.spec.ts |   8 +-
 src/engine/events/index.ts        |  12 ++
 5 files changed, 794 insertions(+), 5 deletions(-)
```

### 1. `src/engine/events/index.ts` (NEW, 12 LOC) — barrel

Re-exports the public engine surface so `import { ... } from '@/engine/events'`
resolves:

```ts
export * from './types';
export { createEventsEngine, computeEventStats } from './factory';
export { InMemoryEventsAdapter, toEventId, toRSVPId, toUserId } from './adapter-memory';
```

### 2. `src/engine/events/factory.spec.ts` (MODIFIED, +8/-1)

Fixed `expect(text).not.toContain('amarração')` → `expect(text.includes('amarração')).toBe(false)`.

**Why:** vitest's `.not` returns `AsymmetricMatchersContaining` (the
`expect.stringContaining`, `expect.objectContaining` family), which does NOT
include `toContain`. TSC error TS2339: "Property 'toContain' does not exist on
type 'AsymmetricMatchersContaining'".

The `.includes(...).toBe(false)` pattern is type-safe AND preserves the same
runtime check.

### 3. `src/app/events/layout.tsx` (MODIFIED, +1/-1)

Removed `priority: 0.8` from `buildPageMetadata` call — `PageSeoInput` interface
in `src/lib/seo/og.tsx` does not include `priority`. TSC error TS2353: "Object
literal may only specify known properties".

### 4. `src/app/events/page.spec.ts` (NEW, 400 LOC, **42 assertions**)

Source-inspection pattern (W86-B lesson). Self-running via `npx tsx` (no
vitest/jsdom — page is `'use client'` with JSX/Next.js imports not safe to
execute under `--experimental-strip-types`).

Coverage:
- **Layout (4):** non-empty, `buildPageMetadata`, `SeoJsonLd` + `WebPage` schema, canonical `/events` path
- **Client contract (4):** non-empty, `'use client'` at top, `@/engine/events` import, default export
- **ARIA (5):** `aria-live="polite"`, `role="dialog"` + `aria-modal`, `role="progressbar"`, `aria-pressed`, `aria-label` on chips
- **LGPD gate (4):** HTML `required` on checkbox, `canSubmit` requires `lgpdConsent + name.length >= 2`, `disabled={!canSubmit}`, LGPD version `2026-01` in consent text
- **data-testid (4):** `event-card`, `events-page`, `events-count`, `rsvp-{name,guests,lgpd,submit}`
- **7 Tradições + symbols (3):** `ALL_TRADIÇÕES.map`, `TRADIÇÃO_SYMBOL`, all 7 symbols (✦🪶☩◈☸☉☬) verbatim
- **4 Types + 3 Modalities (2):** `ALL_TYPES.map` with all 4, modality icons (◆ ◉ ◐)
- **Mobile-first (3):** `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`, `min-width: 720px` breakpoint, `!isDesktop` mobile chips
- **Modal interactions (5):** ESC key, backdrop click, success status, waitlist message, error alert
- **Filters (2):** Price (Gratuito/Pago/Todos), Date range (from/to)
- **Capacity visual (3):** "Lotado · waitlist" badge, "Vagas ilimitadas", RSVP button text variation
- **Sacred-cultural (3):** banned vocabulary absent (`amarração`, `amarre`, `vinculação`, `vincular`, `prejudicar`), `Tradição` accent preserved, `pt-BR` locale

### 5. `scripts/smoke-events.mjs` (NEW, 377 LOC, **16 invariants**)

Cross-package E2E-flavored smoke. Engine + page contracts.

1. `list all 12 eventos seed (7 tradições cobertas)`
2. `filter by tradição (cigano) returns only cigano events`
3. `filter by type (ceremony) returns only ceremony events`
4. `filter by date range (from/to ISO) bounds correctly`
5. `RSVP create returns success when há vaga + LGPD consent`
6. `RSVP when full returns waitlist (capacity enforcement)` — fills evt-cigano-001 (cap=20)
7. `RSVP cancel preserva histórico (status → cancelled)`
8. `LGPD consent REQUIRED: false → lgpd_missing`
9. `Page has ARIA contracts (role=dialog, aria-live, data-testid)`
10. `Page has mobile breakpoint (grid-cols-1, md:grid-cols-2, lg:grid-cols-3)`
11. `Sacred-cultural: 7 tradição symbols preserved verbatim` (✦🪶☩◈☸☉☬)
12. `Sacred-cultural: banned vocabulary absent` (page source + seed data)
13. `Engine: events sorted cronologicamente`
14. `Engine: capacity=0 → spotsLeft=Infinity (ilimitado)`
15. `Engine: duplicate RSVP for same user+event blocks`
16. `RSVP_GUESTS bounds honored by engine (5 max, 0 min)`

**Note on tsx UTF-8:** Node 22's `--experimental-strip-types` mangles UTF-8
identifiers (e.g., `TRADIÇÃO_LABEL` becomes `TRADI`). The smoke hardcodes the
`LGPD_VERSION` / `RSVP_GUESTS_*` constants instead of importing them — source
of truth remains `src/engine/events/types.ts`.

---

## Validation outputs

### TSC (my code only — pre-existing repo errors untouched)

```
$ timeout 90 npx tsc --noEmit --skipLibCheck 2>&1 | grep -v csstype | grep -E "(src/engine/events|src/app/events)"

(empty — 0 errors in my files)
```

Pre-existing errors in `tests/lib/spiritual-engines-validation.test.ts`,
`tests/lib/statistics/*.test.ts`, `tests/middleware/*.test.ts`, `tests/mocks/handlers.ts`
are NOT in scope and remain unchanged.

### Vitest (events engine)

```
$ timeout 60 npx vitest run src/engine/events

 ✓ src/engine/events/factory.spec.ts (34 tests) 15ms

 Test Files  1 passed (1)
      Tests  34 passed (34)
   Duration  1.36s
```

### Page spec (source-inspection, tsx runner)

```
$ timeout 30 npx tsx src/app/events/page.spec.ts

  ✓ layout.tsx exists and is non-empty
  ✓ layout.tsx exports metadata with title about events/círculos
  ✓ layout.tsx renders SeoJsonLd with WebPage schema
  ✓ layout.tsx sets canonical /events path
  ... (38 more ✓)
  RESULT: 42 PASS · 0 FAIL · 42 total
```

### Smoke (cross-package, tsx runner)

```
$ timeout 30 npx tsx scripts/smoke-events.mjs

  ✓ 1. list all 12 eventos seed (7 tradições cobertas)
  ✓ 2. filter by tradição (cigano) returns only cigano events
  ... (14 more ✓)
  RESULT: 16 PASS · 0 FAIL · 16 total
```

---

## Sacred-cultural sensitivity

✅ **7 tradição symbols preserved verbatim** in page source AND seed data:
- `✦` cigano · `🪶` candomblé · `☩` umbanda · `◈` ifá · `☸` cabala · `☉` astrologia · `☬` tantra

✅ **Own-term vocabulary preserved:** Tradição, Caboclo, Orixá, Axé, Candomblé, Umbanda, Babalaô, Yalorixá, Tantra (in seed event descriptions + host bios)

✅ **LGPD consent REQUIRED before submit:** `canSubmit = name.trim().length >= 2 && lgpdConsent && !submitted` — submit button `disabled={!canSubmit}` blocks both HTML form submit AND React handler

✅ **Banned vocabulary absent** (page source + all 12 seed events):
- `amarração`, `amarre`, `vinculação`, `vincular`, `prejudicar`
- Verified by smoke test #12

---

## Total assertions

| Layer | Assertions | Status |
|---|---|---|
| `src/engine/events/factory.spec.ts` (vitest) | 34 | ✅ PASS |
| `src/app/events/page.spec.ts` (tsx source-inspection) | 42 | ✅ PASS |
| `scripts/smoke-events.mjs` (tsx cross-package) | 16 | ✅ PASS |
| **Total NEW (W87-A)** | **58** | **✅ ALL PASS** |
| **Grand total (with W86-D factory.spec inherited)** | **92** | **✅ ALL PASS** |

---

## Git operations

```bash
# In worktree /tmp/w87-events-b2:
git add -A
git commit -m "feat(events): W87-A B2 retry — page.spec + smoke + TSC=0 + vitest+smoke PASS"
# → 8b2f8914 (5 files changed, 794 insertions(+), 5 deletions(-))

git push origin w87/events-workshops-b2
# → [new branch] w87/events-workshops-b2 -> w87/events-workshops-b2
# → remote SHA: 8b2f89148b7ccc1e929ad482674b4813a383e403
```

---

## Durable lessons from this retry

1. **Source-inspection page spec > vitest+jsdom for `'use client'` pages** —
   `readFileSync` + regex on ARIA/role/data-testid gives 42 cheap reliable
   assertions without a render layer. Reusable for ANY future `'use client'`
   page in this repo. (W86-B origin; W87-A validated at scale.)

2. **`expect().not.toContain()` is type-unsafe in vitest** — `not` returns
   `AsymmetricMatchersContaining` which lacks `toContain`. Use
   `expect(value.includes(...)).toBe(false)` for type-safety.

3. **`tsx` runner UTF-8 mangling** — Node 22's strip-types handles Unicode
   identifiers inconsistently. For smoke scripts, hardcode the constants that
   have UTF-8 identifiers (`TRADIÇÃO_LABEL`, `LGPD_VERSION`, etc.) and
   reference the source-of-truth via comment.

4. **`PageSeoInput` does NOT include `priority`** — `buildPageMetadata` accepts
   a narrower input shape than a full `Metadata` object. Use only documented
   fields.

5. **W86-D WIP commit pattern was CRITICAL** — wave-spawner preserved 2,202
   LOC at 10:55 UTC as WIP, enabling W87-A to start from solid ground instead
   of rebuilding from scratch.

6. **TS errors in OTHER files don't block W-branches** — the `tsc --noEmit`
   output has 2000+ pre-existing errors in `tests/lib/*` and
   `tests/middleware/*`. W-branches must isolate via grep to their own files.

7. **`git ls-remote origin <branch>`** is the authoritative way to confirm a
   push landed (especially with parallel sessions).

---

## Next steps for Wave-Spawner

1. **Merge `w87/events-workshops-b2` to `main`** when ready — contains clean
   events/workshops feature (TS, page, layout, factory, adapter, factory.spec,
   page.spec, smoke, barrel, DELIVERABLE).

2. **Mark B-W86-D as RESOLVED** ✅ — W87-A B2 retry first-try success confirms
   the LLM-transient hypothesis (cycle 84/85/86 pattern).

3. **NEW lessons to add to wave-spawner memory:** the 7 above.

4. **Cycle 88 plan:** NEW themes (e.g., daily-reflection prompt UI, mentor
   pairing, akasha session export, etc.). B-W86-D fully resolved.
