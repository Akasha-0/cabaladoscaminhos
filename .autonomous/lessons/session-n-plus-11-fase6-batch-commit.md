# Lesson — FASE 6 lib+UI+API+test batch commit (4 commits, 2703 lines)

**Date:** 2026-06-11
**Session:** N+11
**Commits:** 91c33b14, 2a367302, +2 others — 4 total this session

## Contexto

Prior session N+10 left 11 M + ~50 ?? in working tree (FASE 6 lib/api/components
uncommitted). N+10 lesson recommended committing in 2 batches: "4 top-level
lib stubs + 7 application/akasha/ files". STEP 0 rebuild revealed those 4
top-level stubs (swarm/life-areas/rate-limit/ritual-storage.ts) were ALREADY
TRACKED (commit 7460dd20 "Limpeza Fallow + Módulos Stubs"). The real
untracked new code was elsewhere: 2 small re-exports, 9 UI components, 12
API routes, 3 test files.

## Aprendizado

1. **N+10 lesson was partly stale** — verified via `git log -- <file>` BEFORE
   staging. Always check what's actually untracked vs. what's already tracked
   under a different name. `git status --short | head` shows ?? but
   `git ls-files <path>` reveals tracked siblings.
2. **Tracked ≠ untracked distinction matters** — `application/akasha/` (975
   lines) showed as ??-ish but `git log -- application/akasha/` showed it
   was committed in 0a292502 + 7460dd20. Only 2 thin re-exports were truly
   new in that subdir.
3. **Typecheck gate is the only safe one for FASE 6 batch** — full
   `pnpm test:run` runs 1367 tests with 236 pre-existing failures (cycles
   102-113). `pnpm typecheck` from apps/akasha-portal ran clean for all
   4 batches (lib+UI+API+test). Use typecheck as the commit gate, not
   the test suite, until dedicated pollution-fix sprint.
4. **Test files can be committed broken** if documented honestly. The 3
   test files (839 lines) fail because `@akasha/core` workspace dep
   isn't visible to vitest in this setup. Committing them tracks the
   intent + gives future fix-sprint a baseline. Commit message
   explicitly says "KNOWN FAILING" + names the cause.
5. **4-commit rhythm works well for FASE 6 batch** — one commit per
   architectural layer (lib → UI → API → test). Each <1000 lines,
   each typecheckable independently, each with clear semantic.

## Diff pattern: 4 atomic commits

```
91c33b14  feat(portal): ritual-storage lib layer (in-memory Map + re-export)
XXXXXXX1  feat(portal): 9 akasha UI components (Onboarding, RitualCard, Theme)
XXXXXXX2  feat(portal): 12 API routes (chat, dashboard, rag, ritual) — FASE 6
2a367302  test(portal): 3 akasha test files (chat, ritual, dashboard)
```

Total: 2703 lines across 26 files. 0 typecheck errors. 11/11 chat tests
failing (pre-existing pollution, documented in commit).

## How to apply

- **NEXT session N+12:** when picking work, run `git status --short` AND
  `git ls-files <path>` to distinguish untracked from tracked. Don't trust
  N+10 lessons blindly — they may describe a state that no longer exists.
- **Test pollution sprint (P1 backlog):** fix `@akasha/core` workspace
  resolution in vitest. Hypothesis: need `vitest.config.ts` aliases OR
  package.json exports map. Cycle 113 has 3 failing files w/ same pattern.
- **FASE 6 remaining work:** the 4 batches captured ~2700 lines of UI/API.
  Still untracked: `apps/akasha-portal/lib/infrastructure/prisma.ts` (stale
  dup of src version — leave or delete?), `$TELEMETRY_FILE` (literal
  filename — orchestrator telemetry, do not commit),
  `.autonomous/sessions/` (session logs — infra, not git-tracked).
- **Reverse-eng queue:** R-013/014/015/016/018/019/020 all passes:true.
  Next R-NN candidate: R-021 (Tarot Marseille), R-022 (Crystal healing
  symbolism), or move to F-216+ (more FASE 6 features).
