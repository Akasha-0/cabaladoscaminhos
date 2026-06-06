# Cycle 507 — Test Isolation Fix for Rate-Limit Tests

**Date:** 2026-06-04
**Type:** Bug Fix (test reliability)
**Quality Score:** 91.9% (maintained)

## Problem

`tests/lib/auth/rate-limit.test.ts` had a non-deterministic failure:

```
FAIL  tests/lib/auth/rate-limit.test.ts > checkAuthRateLimit >
  bloqueia após max+1 requests (login: 6/15min)

  AssertionError: expected false to be true // Object.is equality
```

The test expects 5 allowed requests followed by a block on the 6th. It was failing on
the 5th iteration (`r.allowed === false` when `true` was expected).

## Root Cause

The in-memory fallback store in `src/lib/redis.ts` is a **module-level `Map` singleton**
(`const memoryStore = new Map(...)`) shared across all Vitest test cases within the
same worker. The `createInMemoryStore()` function returns an object that captures this
`memoryStore` via closure.

Consequence: when two tests happen to generate the same random IP (probability ≈ 1/250
per pair), the counter from the first test bleeds into the second, causing the second
test's loop to exhaust the rate limit earlier than expected.

## Fix

### 1. `src/lib/redis.ts` — add `resetMemoryStore()`

```typescript
export function resetMemoryStore(): void {
  memoryStore.clear();
}
```

Provides a controlled way to clear the shared in-memory store between tests.

### 2. `tests/lib/auth/rate-limit.test.ts` — add `beforeEach`

```typescript
import { resetMemoryStore } from '@/lib/redis';

describe('checkAuthRateLimit', () => {
  beforeEach(() => {
    resetMemoryStore();
  });
  // ... tests
});
```

## Verification

```
 Test Files  220 passed | 5 skipped (225)
      Tests  8716 passed | 29 skipped (8745)
   Duration  71.40s

$ npx tsc --noEmit
(no output) — 0 errors
```

## Files Changed

| File | Change |
|------|--------|
| `src/lib/redis.ts` | Added `resetMemoryStore()` export |
| `tests/lib/auth/rate-limit.test.ts` | Added `beforeEach` cleanup + import |

## Commits

- `dc23a78d` fix(tests): add resetMemoryStore for rate-limit test isolation

## Lessons

- Module-level singletons that hold mutable state (Maps, Sets) persist across Vitest
  test workers. Tests that rely on clean initial state need explicit cleanup.
- Random IP generation in tests creates collision risk when the random space is small
  (250 possible values) and tests run sequentially in the same worker.
- The `hashIp` function makes collisions deterministic (same IP → same hash → same
  key), so the same IP always collides.

---

## Multi-Agent System Gap Resolution (continuacao)

**Date:** 2026-06-04
**Type:** Bug Fix / Infrastructure
**Quality Score:** 91.9% maintained

Audit identificou gaps criticos entre SPEC e implementacao do sistema multi-agente:

| Gap | Severidade | Status |
|-----|-----------|--------|
| npm run cycle:* ausentes | HIGH | FIXED |
| platform-evolver skill ausente | HIGH | FIXED |
| orchestrator skill (5->6 agentes) | MEDIUM | FIXED |
| cycle-executor.ts ausente | HIGH | FIXED |

### Fixes Aplicados

1. **`.claude/skills/platform-evolver/SKILL.md`** — skill criada do zero para o 6o agente
2. **`scripts/cycle-executor.ts`** — script criado com 6 fases (assess/plan/execute/verify/evolve/full)
3. **`package.json`** — adicionados scripts cycle:assess, cycle:plan, cycle:execute, cycle:verify, cycle:evolve, cycle:full
4. **`.claude/skills/orchestrator/SKILL.md`** — corrigido de "5 agentes" para "6 agentes", atualizado para usar pnpm

### Verificacao

```
TypeScript: 0 erros
Tests: 8534 passed | 21 skipped | 0 failures
```

### Licoes

- SPEC.md define 6 agentes mas orchestrator skill referenciava 5 — distinguido corretamente
- platform-evolver skill nunca foi criado — agora existe em `.claude/skills/platform-evolver/`
- Comandos `npm run cycle:*` nunca foram implementados — `cycle-executor.ts` fecha o gap
- 12 swarm domain agents != 6 validation agents — sao sistemas diferentes
- cycle-executor.ts usa Promise constructor (nao Promise.withResolvers) para compatibilidade es2017
