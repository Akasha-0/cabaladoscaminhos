# L-007 — Orphaned test files + runtime artifacts committed to git

**Date:** 2026-06-18
**Area:** quality | harness
**Status:** closed

## What happened

Cycle 530 audit found:

1. **`tests/lib/deep-correlation-engine.test.ts`** — orphaned test file importing from
   `../../src/lib/ai/deep-correlation-engine`. The actual source lives at
   `src/lib/application/ai/deep-correlation-engine/deep-correlation-engine.test.ts`. The
   tests/lib/ copy had a wrong relative import path (`src/lib/ai/` doesn't exist) and
   was never part of any vitest include pattern.

2. **`tests/lib/spiritural-engines-validation.test.ts`** — imported from `@/lib/numerologia/`,
   `@/lib/ifa/`, `@/lib/astrologia/`. These source directories were deleted in previous
   iterations when the monorepo root `lib/` was emptied. The test file was never cleaned up.

3. **`.gitignore`** missing `test-results/` and `local/` — runtime artifacts (vitest output,
   scratch dev files like 36KB `local/deep-content-plan.md`) were committed to git.

## What was decided

- Delete both orphaned test files (zero blast radius — not run by any vitest project)
- Add `test-results/` and `local/` to `.gitignore`
- These are hygiene issues, not product bugs

## What to do differently

- After deleting any `lib/` source directory, audit `tests/lib/` for orphaned `.test.ts` files
  that import from the deleted paths (grep the deleted module paths in tests/)
- When adding new runtime output directories (`test-results/`, `out/`, etc.), add them to
  `.gitignore` immediately — don't let them accumulate commits
- The vitest pool worker shell noise ("Unterminated quoted string") is a pre-existing cosmetic
  issue in the `execSync` grep patterns in architecture tests — NOT related to the orphaned
  tests above, and NOT blocking tests from passing

## Related
- Cycle 529: root-level `app/` and `lib/` stubs deleted
- Lesson 004: monorepo root `lib/` vs portal `src/lib/` distinction
