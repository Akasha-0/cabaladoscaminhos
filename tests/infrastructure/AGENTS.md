# Infrastructure Tests DOX

## Purpose

Testes de infraestrutura do portal — Redis, rate limiting, cache, e
qualquer módulo que dependa de serviços externos (DB, cache, queue).
Diferente de `tests/lib/` (lógica pura) e `tests/integration/` (fluxos
cross-module): foca em como a aplicação interage com infraestrutura
real + fallbacks.

## Ownership

- `rate-limit.test.ts`: Cobertura do `checkRateLimit` com Redis primário
  + fallback in-memory. 3 cenários: Redis disponível, Redis falha → memória
  com reset de janela, reset explícito entre testes.

(Outros arquivos virão conforme a infra crescer — `redis.test.ts`,
`cache.test.ts`, `queue.test.ts`, etc.)

## Local Contracts

- **Mocks centralizados em `vi.mock()`** com factory function (não object
  literal). Exemplo:
  ```ts
  vi.mock('@/lib/infrastructure/redis', () => ({
    getRedisClient,
    resetMemoryStore,
  }));
  ```
  Isso permite `vi.clearAllMocks()` + `vi.resetModules()` entre testes
  sem perder a referência.

- **Dynamic imports via `loadRateLimitModule()`** ao invés de top-level
  `import`. Necessário para `vi.resetModules()` funcionar — se o módulo
  for importado no topo, o reset não recarrega o module e o mock fica
  stale entre testes. Pattern:
  ```ts
  async function loadModule() {
    return import('@/lib/infrastructure/<name>');
  }
  // In each test: const { fn } = await loadModule();
  ```

- **`resetMemoryStore` deve ser chamado explicitamente** entre testes
  que usam fallback in-memory. Caso contrário, state de um teste vaza
  para o próximo (test pollution clássico — ver lesson N+18).

- **Nomes de teste em PT-BR** (`it('usa Redis quando...')`) para
  consistência com `tests/lib/`.

## Work Guidance

- **Test pollution check (STEP 5.6 do coding_prompt)**: rodar
  `pnpm test:run tests/infrastructure/rate-limit.test.ts` E
  `pnpm test:run tests/infrastructure/` (suite). Suite-passing ≠ each-
  test-passing. Lesson N+18 capturou um caso real disso.
- **Fake timers quando testar reset de janela**: `vi.useFakeTimers()` +
  `vi.setSystemTime(...)` + `vi.advanceTimersByTime(windowMs + 1)`.
  Não usar `setTimeout` real — fica flaky em CI.
- **Mock contract**: ao mockar `@/lib/infrastructure/redis`, expor
  `getRedisClient` e `resetMemoryStore` como `vi.fn()` no top-level
  (não dentro do factory) para que `vi.clearAllMocks()` resete o
  call history sem perder a referência.
- **Não testar lógica de negócio aqui** — isso é `tests/lib/`. Aqui
  testamos só a interação com infra (Redis up/down, fallback, reset).
- **Cobertura**: cada função exportada por `src/lib/infrastructure/*`
  deveria ter ao menos 1 cenário "happy path" + 1 "fallback" + 1
  "reset/cleanup".

## Verification

- `pnpm test:run tests/infrastructure/` — suite completa
- `pnpm test:run tests/infrastructure/rate-limit.test.ts` — arquivo
  isolado (test pollution check)
- Antes de commit: rodar AMBOS (isolado + suite)
- Triad: typecheck + lint + test:run (pelo menos o subset infrastructure)
- **Known issue**: o `vitest.config.ts` atual do portal só inclui
  `tests/e2e/**/*.test.ts` no `include` filter. Para rodar tests de
  infrastructure via CLI, é preciso adicionar `tests/infrastructure/**`
  ao `include` (ou usar `--config` apontando para um config específico).
  Esta config está em estado M (outra sessão editando); correção deve
  ser feita por quem committar a config final.

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado no momento. Se
`tests/infrastructure/redis/` ou `tests/infrastructure/cache/` forem
criados, cada um ganha seu próprio AGENTS.md.)
