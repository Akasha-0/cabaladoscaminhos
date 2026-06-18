# Akasha Evolution Spec — 2026-06-18

## Research Synthesis

### Cross-agent findings (what all 4 agreed on)

All 4 agents independently converged on the same root problems from different angles:

1. **spiritual-engine.ts is dead code** — arch-auditor confirmed 0 callers; test-analyst found skipped tests for it; typesys-auditor noted it imports from 3 untyped packages; perf-analyst excluded it from hot-path analysis because nothing calls it.

2. **Test infrastructure is fundamentally broken** — 473 failing tests (test-analyst), masked by 6 `// @ts-ignore` suppressions in the test suite itself (typesys-auditor), and 12+ skipped test blocks covering missing modules including spiritual-engine and deep-correlation-engine (test-analyst + arch-auditor dead-code list overlap).

3. **Oversized data files masquerading as code** — arch-auditor flagged `traducao-areas.ts` (1077 lines) and `life-areas-data.ts` (820 lines) as pure data; perf-analyst flagged the same `life-areas-data.ts` as causing unnecessary re-renders through oversized module loads; typesys-auditor confirmed no type safety on the numerology calculator feeding into these data flows.

4. **No memoization anywhere in the React render path** — perf-analyst identified MandalaChart.tsx (749 lines) and AkashaLifeAreasDashboard.tsx (1055 lines) as re-rendering on every parent state change; test-analyst found zero test coverage for these components; arch-auditor found they are the top hotspots by fan-out with no React.memo guards.

### Conflicting findings (what agents disagreed on, and resolution)

| Topic | Agent A (View) | Agent B (View) | Resolution |
|---|---|---|---|
| spiritual-engine.ts | arch-auditor: delete (0 callers) | test-analyst: tests skip it, might need it | **Delete** — 0 callers confirmed by codegraph. Tests skip it because module doesn't exist or is broken; they should be deleted alongside it. |
| life-areas-data.ts | arch-auditor: migrate to JSON | perf-analyst: memoize access patterns | **Do both** — extract to `.json` AND memoize access at consumption points (perf wins are additive, not conflicting). |
| deep-correlation-engine.ts | arch-auditor: split (868 lines, orchestration mixed with correlation maps) | test-analyst: tests skip it | **Split** — same pattern as spiritual-engine: delete dead orchestration layer, preserve correlation-maps.ts (static data, 260+ lines, imported by deep-correlation-engine.ts parent). |

## Top 3 Improvements (prioritized)

### IMPROVEMENT-1: Eliminate spiritual-engine.ts and its dead-weight subgraph

- **Motivation**: spiritual-engine.ts (881 lines) is imported by nothing in the production codebase. Its 3 skipped tests (test-analyst) confirm it was never wired up. It imports from @akasha/core-astrology, @akasha/core-cabala, @akasha/core-odus — three packages that are themselves untested and partially untyped. This is the single largest dead-code blob in the monorepo, and it blocks clean type analysis (typesys-auditor noted the @ts-nocheck in calculator.ts which feeds this import chain). Removing it unlocks a clean TypeScript baseline.

- **Approach**:
  1. `git mv apps/akasha-portal/src/lib/domain/engines/spiritual-engine.ts /tmp/spiritual-engine.backup/`
  2. Delete `tests/lib/ai/spiritual-engine.test.ts` (skipped, references non-existent module)
  3. Check if `deep-correlation-engine.ts` has any callers besides spiritual-engine.ts — if only spiritual-engine.ts called it, treat it as part of the same dead subgraph
  4. If deep-correlation-engine.ts is also dead, delete its tests: `tests/lib/ai/deep-correlation-engine/` and `tests/lib/ai/correlation-maps.test.ts`
  5. Verify with `pnpm typecheck` — expect some "module not found" errors from spiritual-engine imports; fix only the production call sites (not the deleted engine)

- **Blast Radius**:
  - `apps/akasha-portal/src/lib/domain/engines/spiritual-engine.ts` (DELETE)
  - `apps/akasha-portal/src/lib/application/ai/deep-correlation-engine.ts` (DELETE if 0 callers after spiritual-engine removal)
  - `apps/akasha-portal/src/lib/application/ai/deep-correlation-engine/correlation-maps.ts` (KEEP — may be imported elsewhere; verify first)
  - `apps/akasha-portal/src/lib/application/ai/deep-correlation-engine/system-helpers.ts` (KEEP — may be imported elsewhere; verify first)
  - `tests/lib/ai/spiritual-engine.test.ts` (DELETE)
  - `tests/lib/ai/deep-correlation-engine.test.ts` (DELETE if dead)
  - `tests/lib/ai/correlation-maps.test.ts` (DELETE if dead)

- **Verification**:
  1. `pnpm typecheck 2>&1 | grep -c "error"` — should be lower after cleanup
  2. `pnpm test:run 2>&1 | grep spiritual` — should return 0 results
  3. `git status -s` — shows only intentional deletions

- **Effort**: MEDIUM

---

### IMPROVEMENT-2: Fix TypeScript hygiene — remove all `// @ts-ignore` / `// @ts-nocheck` and resolve root causes

- **Motivation**: 6 suppression comments are hiding real type errors that will compound as the codebase grows. `packages/core-cabala/src/calculator.ts` runs entirely with `@ts-nocheck` — the numerology calculator that feeds into synthesis is completely untyped. `tests/lib/energy/energy-patterns.test.ts` and 3 other test files use `@ts-ignore` on barrel imports because root tsconfig doesn't declare `vitest/globals` for the tsc run. The typesys-auditor found that standalone package tsconfigs (core-iching, core-tantra) are missing `@types/node`. Fixing these gives a clean baseline for all other improvements.

- **Approach**:
  1. **Fix root tsconfig**: Ensure `tsconfig.base.json` includes `@types/node` in the `types` array (currently only `vitest/globals`). This resolves barrel imports in `tests/lib/` that fail `tsc --noEmit`.
  2. **Fix `@ts-nocheck` in calculator.ts**: Add proper TypeScript types to `packages/core-cabala/src/calculator.ts`. This is the core numerology engine — types will surface bugs and guide the engine's next development.
  3. **Add `@types/node` to packages missing it**: `packages/mentor`, `packages/core-iching`, `packages/core-tantra`, `packages/core-astrology`, `packages/core-cabala` all need it.
  4. **Fix redis.ts `@ts-ignore`**: `apps/akasha-portal/src/lib/infrastructure/redis.ts` line 101 — either add proper types for the ioredis optional import or restructure to avoid dynamic import.
  5. **Remove test `@ts-ignore` suppressions**: After fixing the tsconfig root cause (step 1), remove `@ts-ignore` from the 4 test files — they should pass `tsc --noEmit` cleanly.

- **Blast Radius**:
  - `packages/core-cabala/src/calculator.ts` — type entire numerology module
  - `tsconfig.base.json` — add `@types/node` to types array
  - `packages/mentor/package.json`, `packages/core-iching/package.json`, `packages/core-tantra/package.json`, `packages/core-astrology/package.json` — add `@types/node`
  - `apps/akasha-portal/src/lib/infrastructure/redis.ts` — fix ioredis type gap
  - `tests/lib/energy/energy-patterns.test.ts`, `tests/lib/transformation/transformation.test.ts`, `tests/lib/manifestation/intention-setting.test.ts`, `tests/lib/sacred-geometry/geometric-patterns.test.ts` — remove `@ts-ignore` after tsconfig fix

- **Verification**:
  1. `pnpm typecheck 2>&1` — all `@ts-nocheck` and `@ts-ignore` removed; 0 suppressions
  2. `pnpm test:run 2>&1 | tail -20` — test pass rate should improve after barrel import fixes
  3. `grep -r "@ts-ignore\|@ts-nocheck" packages/ apps/akasha-portal/src/ tests/` — returns 0 results

- **Effort**: MEDIUM

---

### IMPROVEMENT-3: Add React.memo and useMemo to MandalaChart and AkashaLifeAreasDashboard

- **Motivation**: perf-analyst identified these as the top 2 performance hotspots. MandalaChart.tsx (749 lines) re-renders entirely on every parent state change — tooltip I/O lookups (`buildTooltipByLayer`) run inline in every render, `opacity()` is called 10+ times per render in SVG attributes, and an inline arrow-function map runs for layer buttons on every render. AkashaLifeAreasDashboard.tsx (1055 lines) has all state at the top level, causing the full component tree (6 AreaCards + FrequencyPathExplorer + OneProfileCard + animations) to re-render on any state change. The synthesis-engine.ts that feeds these components is uncached — every `/api/akasha/daily` request recomputes the full synthesis with no Redis caching. These are the single largest UX regressions for end users.

- **Approach**:
  1. **MandalaChart.tsx**:
     - Wrap with `React.memo()`
     - Memoize `buildTooltipByLayer` with `useMemo` keyed by relevant data props
     - Extract inline arrow-function layer buttons (lines 240-264) to `useCallback`-stable handlers outside JSX
     - Memoize `opacity()` result per render cycle
  2. **AkashaLifeAreasDashboard.tsx**:
     - Split into sub-components: each AreaCard, FrequencyPathExplorer, OneProfileCard should be `React.memo`'d with their own state
     - Wrap expensive data transforms (life-areas data derivations) with `useMemo`
     - Use `useCallback` for all event handlers passed to child components
  3. **synthesis-engine.ts / api/akasha/daily**:
     - Add Redis caching layer for synthesis results (TTL: 15 min — sync with token refresh cycle)
     - Cache key: composite of userId + birthDate + current transit date

- **Blast Radius**:
  - `apps/akasha-portal/src/components/akasha/MandalaChart.tsx` — memoization
  - `apps/akasha-portal/src/components/akasha/dashboard/AkashaLifeAreasDashboard.tsx` — component split + memoization
  - `apps/akasha-portal/src/lib/application/akasha/synthesis-engine.ts` — add caching
  - `apps/akasha-portal/src/app/api/akasha/daily/route.ts` — add cache layer

- **Verification**:
  1. Chrome DevTools performance trace: verify MandalaChart does NOT re-render when sibling/unrelated state changes
  2. Lighthouse / Core Web Vitals INP measurement before and after — target INP < 200ms
  3. `pnpm test:run 2>&1 | tail -10` — ensure memoization doesn't break existing tests
  4. Redis cache HIT rate for `/api/akasha/daily` — measure with `INFO stats` after 10 synthetic requests

- **Effort**: HIGH

## Deferred (not this cycle)

| Item | Reason for Deferral |
|---|---|
| Extract `traducao-areas.ts` (1077 lines) to JSON | Data migration requires careful UTF-8 preservation and update of all 5 pillar importers; lower urgency than IMPROVEMENT-1 (dead code) and IMPROVEMENT-3 (runtime performance) |
| Extract `life-areas-data.ts` (820 lines) to JSON | Same as above; also depends on IMPROVEMENT-3 memoization work to validate data access patterns haven't regressed |
| Split `narrative-generator.ts` (1188 lines) | Template literals are inline by design for the synthesis engine; splitting requires careful interface design; perf impact is secondary to IMPROVEMENT-3 caching |
| Add unit tests for `@akasha/core-cabala` and `@akasha/core-odus` (fully untested) | These are blocked by IMPROVEMENT-1 (removing spiritual-engine import chain) and IMPROVEMENT-2 (typing the numerology calculator); cannot write meaningful tests on untyped code |
| Fix 12 skipped `describe.skip` blocks in root `tests/` | These cover missing modules (correlation libs, AI routers, mapa-insights); need the actual modules to exist first, which is a product decision beyond this technical cleanup cycle |

## Implementation Order

1. **IMPROVEMENT-1** (spiritual-engine + dead subgraph elimination) — Do this FIRST. It unblocks clean type analysis for all other work and removes the largest dead code blob.
2. **IMPROVEMENT-2** (TypeScript hygiene: remove suppressions + fix tsconfig) — Do this SECOND. Clean types are prerequisites for safe refactoring in IMPROVEMENT-3.
3. **IMPROVEMENT-3** (React memoization + synthesis caching) — Do this LAST. By this point the codebase is cleaner, types are sound, and the blast radius of the component split is well-understood.

---

*Spec generated by planner-orchestrator on 2026-06-18, synthesized from arch-auditor, test-analyst, typesys-auditor, and perf-analyst.*
