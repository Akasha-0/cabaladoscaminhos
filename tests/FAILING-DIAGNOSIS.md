# Failing Tests Diagnosis

**Last updated:** 2026-06-15 (ralph-loop iter 32)
**Total failing tests:** 67 (was 66 baseline; +1 from pollution)

This is a F-104 docs sync artifact. It maps each failing test file to a
1-line diagnosis of what the test checks and likely why it's failing.
Useful for prioritizing the next test-fix session.

**Test pollution caveat:** some "failing tests" are actually empty test
files `(0 test)` flagged as failures because vitest include filter
parses them oddly. See lesson N+18 — always re-verify a test failure by
running the file in isolation.

## Failing test files (grouped by project)

### core-logic (32 test files affected)

| Test file | Tests | Likely cause |
|---|---|---|
| `tests/lib/grimoire/search.test.ts` | 6 failed | JSONB containment filter + Ollama embedding fallback; likely DB schema or test isolation issue |
| `tests/lib/grimoire/sync.test.ts` | 5 failed | Grimoire markdown sync; likely stale test data or path resolution after refactor |
| `tests/lib/ai/cross-pillar.test.ts` | 4 failed | Cross-pillar correlation; likely depends on RAG data not in test fixture |
| `tests/lib/ai/theme-router-*.test.ts` (4 files) | 0 test | Empty test files; F-100 deadcode or pre-refactor stubs |
| `tests/lib/ai/glossary-injection.test.ts` | 0 test | Empty test file |
| `tests/lib/ai/iching-prompt-coverage.test.ts` | 0 test | Empty test file |
| `tests/lib/ai/correlation-provenance.test.ts` | 0 test | Empty test file |
| `tests/lib/ai/llm-router.test.ts` | 0 test | Empty test file |
| `tests/lib/core-iching/bagua.test.ts` | 11 failed | Bagua computation; likely test pollution (lesson N+18) or stale expected values |
| `tests/lib/grimoire/traducao-areas.test.ts` | 5 failed | Translation matrix; depends on translation data not in test fixture |
| `tests/lib/push/web-push-server.test.ts` | 3 failed | VAPID key generation; likely env not set in test runner |
| `tests/lib/push/push-subscription-service.test.ts` | 0 test | Empty test file |
| `tests/lib/push/send.test.ts` | 0 test | Empty test file (D companion: `apps/akasha-portal/src/lib/application/push/send.ts` was D-deleted) |
| `tests/lib/security/ip-hash.test.ts` | 0 test | Empty test file |
| `tests/lib/admin/credit-reconciliation.test.ts` | 0 test | Empty test file |
| `tests/lib/quality/run-quality-eval-guard.test.ts` | 0 test | Empty test file |
| `tests/lib/constants/glossario.test.ts` | 0 test | Empty test file |
| `tests/scripts/daily-transits-cron.test.ts` | 1 failed | Cron job test; likely missing time zone or test isolation |
| `tests/calculators/energy-healing.test.ts` | 0 test | Empty test file |
| `tests/calculators/forest-medicine.test.ts` | 0 test | Empty test file |
| `tests/architecture/AGENTS.md` | 0 test | **Bug**: vitest is loading AGENTS.md as a test file. Add `**/*.md` to exclude in vitest config (M state, defer) |

### core-api (5 test files affected)

| Test file | Tests | Likely cause |
|---|---|---|
| `tests/api/admin/grimoire-sync.test.ts` | 6 failed | Admin endpoint auth + sync trigger; likely missing fixtures |
| `tests/api/akasha-auth-register.test.ts` | 2 failed | User registration; likely email-already-exists branch needs new fixture |
| `tests/api/akasha/push/subscribe.test.ts` | 8 failed | Push subscription API; depends on VAPID env + DB |
| `tests/api/akasha/chat/route.test.ts` | 1 failed | Chat route; 1 failure out of 11, likely a single edge case |

### core-ui (3 test files affected)

| Test file | Tests | Likely cause |
|---|---|---|
| `tests/components/akasha/atmosphere.test.tsx` | 5 failed | WebGL/Three.js atmosphere; likely Three.js setup changed |
| `tests/components/akasha/dashboard/Dashboard.test.tsx` | 0 test | Empty test file |
| `tests/components/__snapshots__/snapshot.test.tsx.snap` | 0 test | Snapshot file parsed as test; add to exclude in vitest config |

### integration (2 test files affected)

| Test file | Tests | Likely cause |
|---|---|---|
| `tests/integration/daily-engine-rag.test.ts` | 6 failed | RAG pipeline integration; likely missing embeddings or DB seed |
| `tests/integration/api/creditos.test.ts` | 4 failed | Credit system; likely DB state pollution between tests |

## Patterns observed

1. **Many "0 test" files**: ~15 empty test files. These should either
   be deleted (F-100 deadcode) or have tests added. The pre-refactor
   stubs were emptied during the other session's massive refactor.
2. **MD files being parsed as tests**: `tests/architecture/AGENTS.md`
   appears in the test list. The vitest config's `include` filter
   needs `**/*.md` excluded (M state in another session).
3. **Pilar 4 ethics test passing**: `tests/lib/grimoire/traducao-areas.test.ts`
   "Pilar 4 (Odu) marca requer_terreiro em TODAS as 8 áreas" — this
   passes per the diff. Pilar 4 invariant is enforced. Good signal.
4. **RAG/embedding tests failing**: 6+ tests in `tests/lib/grimoire/`,
   `tests/integration/daily-engine-rag.test.ts` depend on Ollama
   running or pre-computed embeddings. In CI, these are skipped or
   marked "skip if no ollama".

## Recommended next test-fix session

**Phase 1 — Vitest config** (vitest.config.ts in M state — defer):
- Add `**/*.md` to exclude
- Add `**/*.snap` to exclude
- Verify `tests/infrastructure/` is in include

**Phase 2 — F-100 empty test files**:
- Delete or fill `tests/lib/ai/theme-router-*.test.ts` (4 files)
- Delete or fill `tests/lib/push/push-subscription-service.test.ts`,
  `tests/lib/push/send.test.ts` (these map to D-deleted source files)
- Delete or fill `tests/lib/security/ip-hash.test.ts`
- Delete or fill `tests/calculators/energy-healing.test.ts`,
  `tests/calculators/forest-medicine.test.ts`

**Phase 3 — F-101 actual test failures**:
- `tests/lib/core-iching/bagua.test.ts` (11 tests) — likely a real
  computation issue; high priority
- `tests/api/akasha/push/subscribe.test.ts` (8 tests) — likely VAPID
  env issue; fixable with mock
- `tests/lib/grimoire/search.test.ts` (6 tests) + `sync.test.ts`
  (5 tests) — likely DB fixture issue
- `tests/integration/daily-engine-rag.test.ts` (6 tests) — RAG
  integration; needs Ollama or fixture

**Total work estimate:** Phase 1 (config) = 30 min. Phase 2 (F-100
empty files) = 1-2 hours. Phase 3 (real failures) = 4-8 hours.
