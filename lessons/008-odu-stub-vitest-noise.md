# L-008 — odu-data null stub + vitest shell noise deferred

**Date:** 2026-06-18
**Area:** product | quality | harness
**Status:** open

## What happened

### Finding 1: odu-data.ts STUB (FIXED this cycle)
`apps/akasha-portal/src/lib/application/akasha/odu-data.ts` was a COMPLETE STUB — `getOduByName()` always returned `null`. The real implementation was at `apps/akasha-portal/src/lib/domain/odu-data.ts` with `ODU_DATABASE` of 16 Odus.

Only ONE file imported the stub: `cross-engine.ts` via relative `'./odu-data'`. Zero callers used the `@/` alias.

**Fix:** Changed import in `cross-engine.ts` from `'./odu-data'` to `'@/lib/domain/odu-data'`. Typecheck green. One-line fix.

**Lesson:** STUB files with zero `@/` alias callers are invisible to cross-file analysis — only relative imports can reach them. Audit relative imports when cleaning stubs.

### Finding 2: vitest "Unterminated quoted string" shell noise (DEFERRED)
~200 lines of shell noise appear in every vitest run. Tests pass (94 files, 1417 passed). NOT a test failure.

Clean-architecture test had unescaped `.` in `PROHIBITED_PATTERNS` (`'process.env'` instead of `'process\\.env'`), causing ERE `.` to match any character. Fix was applied (`'process\\.env'`).

**However:** the shell noise PERSISTS after the fix. Root cause likely deeper — possibly in `package-boundaries.test.ts` (different execSync pattern with unquoted relative paths), or vitest pool worker IPC relaying stderr from a different source.

**Deferred:** needs further diagnosis — run individual test files to isolate which one triggers the noise:
```bash
bun run test tests/architecture/clean-architecture.test.ts 2>&1 | grep "Syntax error" | head -3
bun run test tests/architecture/package-boundaries.test.ts 2>&1 | grep "Syntax error" | head -3
```

### Finding 3: gitignore gaps (FIXED this cycle)
`.fallow/` and `.autonomous/multi-agent/` runtime artifacts added to `.gitignore`.

## What to do differently
- When auditing stubs: grep for relative imports too, not just `@/` alias imports
- vitest shell noise: isolate per-test-file before assuming the fix worked
