---
name: cycle-168
mode: quick
timestamp: 2026-06-03T13:15:00Z
elapsed_seconds: 720
budget_minutes: 15
exit_code: 0
claude_model: MiniMax-M3
---

# Cycle 168 — 2026-06-03 13:15 — quick

## Output

Cycle 168 complete. P0/P1 queue empty (Fase 14 too big, Fase 12 drift
out-of-scope). Chose **T7.2 small impl gap** per loop-prompt.md §2.

**T7.2 (Sprint 8): useKeyboardShortcuts hook impl**

- `tests/hooks/useKeyboardShortcuts.test.ts` (460 lines, 36 cases) existed
  but `src/hooks/useKeyboardShortcuts.ts` did NOT exist — test was
  dead-on-disk.
- Project file-naming hook enforces kebab-case for `.ts` files. Existing
  siblings (`useMapaInsights.ts`, `useToast.ts`) are camelCase but flagged
  by hook rule too (legacy). New file: `use-keyboard-shortcuts.ts`.
- Test import updated: `@/hooks/useKeyboardShortcuts` →
  `@/hooks/use-keyboard-shortcuts` (minimal 1-line diff).

**Hook contract (matched to test):**

- `ctrl: true` matches `ctrlKey` on non-Mac / `metaKey` on Mac
- `shift` / `alt`: required-AND semantics, default `false` (forbids)
- Editable element guard: `INPUT` / `TEXTAREA` / `SELECT` /
  `contentEditable` skip shortcut, except `Escape` always passes
- `preventDefault` defaults to `true`; `false` opt-out per shortcut
- Listener re-registers when `shortcuts` prop changes (effect dep
  `[shortcuts]`)
- Stops at first matching shortcut

**jsdom fix (non-obvious):**

- `isContentEditable` does NOT sync with `element.contentEditable = 'true'`
  in jsdom (it requires the render/layout tree to be up to date)
- Fallback to check the raw `contentEditable` string property
  (`'true'` / `'plaintext-only'` / `''`)

**Commit (1):**

- `fe1d5326` — `feat(cockpit): Fase T7.2 — useKeyboardShortcuts hook impl`
  (2 files, +106/-1)
  - new `src/hooks/use-keyboard-shortcuts.ts` (105 lines)
  - `tests/hooks/useKeyboardShortcuts.test.ts` import path update

## Verify

- `npx tsc --noEmit`: **0 errors**
- `npx vitest run --project=core-ui tests/hooks/useKeyboardShortcuts.test.ts`:
  **36/36 pass** (~1s, jsdom)
- `npm run test:run`: **1767 passed / 17 skipped / 0 failed** (~19s)
- `npm run lint`: **0 errors** (1437 pre-existing warnings, baseline)
- `npm run build`: **NOT passing** — pre-existing `next build
  _global-error/page` prerender (Heading forwardRef) — registered
  cycles 148-159, not in this cycle's scope

## Pre-existing registered (NOT touched)

- `next build _global-error/page` prerender (Heading forwardRef) —
  registered cycles 148-159
- 1437 lint warnings
- B2C legacy test pollution
- **`tests/hooks/` partition drift (NEW)**: 17 hook test files
  (`useAfirmacoes`, `useAnalytics`, `useCiclos`, `useDashboardConfig`,
  `useJourney`, `useMapaAlma`, `useMapaNatal`, `useNotifications`,
  `useNumerologia`, `usePrevisaoMensal`, `usePrevisaoSemanal`,
  `useRitualCalendar`, `useRituals`, `useSearchHistory`,
  `useSpiritualHistory`, `useUserPreferences`, `useUserProfile`) all
  fail when `tests/hooks/**` is added to a vitest partition. They are
  pre-existing orphaned tests (never run since the project migrated
  from Jest→Vitest without a `tests/hooks/**` glob). Same drift
  pattern as `tests/lib/lenormand/mesa-real.test.ts` (Fase 12).
  - Tried adding `tests/hooks/**` to `core-ui` partition — suite went
    from 0 fail / 1767 pass to 17 fail / 1767 pass. Reverted
    `vitest.config.ts` to keep suite green. Hook test verified in
    isolation.
  - **Resolving this is a dedicated phase** (suggested Fase 50+):
    audit each of 17 files for root cause (likely missing module-level
    mocks, single-fire Prisma, or B2C legacy removal leftovers).

## Side-cleanup

- Removed `tests/hooks/ce-debug.test.ts` (transient diagnostic created
  to inspect `isContentEditable` jsdom behavior).
- Restored prettier-formatted test file to original 460-line shape
  via `git checkout` + surgical 1-line import edit (kept diff
  +1/-1 instead of +42/-101).

## Why this task

- P0 (Fase 14 Operator.sessions revoke) → 3h, not quick
- P1 (Fase 12 mesa-real drift) → 28 pre-existing failures, out of scope
- T7.2 hook impl gap: 1 new file, 1-line test edit, ~10min — fits
  quick budget exactly

## Próximas fases sugeridas

- **Fase 50: tests/hooks/ drift** (queue, P1): audit + fix 17 orphaned
  hook test files. Use `npx vitest run tests/hooks/<file>` for each.
  Likely root causes: missing `vi.mock` for stores/Prisma, B2C legacy
  imports, or test pollution.
- **Fase 14 OperatorSession full audit** (queue, P0): ensure
  `isSessionActive` is called on every protected route (cycle-115
  partial; verify coverage)
- **Doc 23/24/25 alignment** (next doc phase): Doc 23 §6 marks
  AD-23.2 done; check if Doc 24/25 also need similar `✅` markers
- **task-queue.md housekeeping** (memory file outside repo): still says
  "última atualização: ciclo 119"; sync to current
