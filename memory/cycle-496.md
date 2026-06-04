# Cycle 496 — 2026-06-04

**Modo**: quick
**Branch**: claude/docs-refactor-alignment-FOUqN
**Commit**: `e9bf1752`

## Mudanças

Knip dead-export cleanup (continuação cycle 495):

- **`src/lib/auth/password-reset.ts`**: rm `consumeResetToken` (29 linhas). Função
  orfã — o fluxo de reset real usa `validateResetToken` + update direto no DB.
- **`tests/mocks/handlers.ts`**: rm `resetFetchMock` (4 linhas). Sem consumers; suite
  usa `setupFetchMock` + `clearFetchMock` + `vi.clearAllMocks()`.
- **`.fallowrc.json`**: drop `consumeResetToken` da exports list de
  `src/lib/auth/password-reset.ts`.

Net: 3 files, 4 insertions, 31 deletions (-27 LOC).

### WIP revertido

Removi `tests/lib/quality/run-quality-eval-guard.test.ts` (8 testes, contract-buggy):
- Asserts `report.overallScore` mas QualityReport tem `report.score`
- Asserts `cs.grade` mas CategoryScore tem só `score/weight/weightedScore`
- `vi.mock` de `runTypeScriptCheck`/`checkForSecrets`/etc. é no-op (funções não
  são exportadas de runner.ts) — checks reais rodariam

Também reverti `vitest.config.ts` include line `'tests/lib/quality/**'`.

Próxima cycle: re-autorizar o guard test com exports dos internals + contract
correto, OU deletar a ideia (orquestrador já é exercitado pelo `npm run
scripts/quality-eval.ts`).

## Verificação

- `npm run build`: FAIL (pré-existente BUG-01 `/_global-error` prerender,
  cycle 491)
- `npm run lint`: 0 errors / 670 warnings (baseline)
- `npm run test:run`: **8865 passed** / 32 skipped / **0 failed** (228 files;
  matches cycle 495 baseline exatamente — sem regressão)

## Pré-existentes

- BUG-01 `/_global-error` prerender (Next 16 + React 19 RC issue, cycle 491)
- 670 lint warnings (baseline)
- WIP `birth-chart-precision.test.ts` (13 vs 14 planets, OOS)

## Instintos ativados

- `npm-verify-cadence` (build/lint/test triad ordem)
- `pre-existing-test-drift-scope-discipline` (não consertar BUG-01/670 warn)
- `test-isolation` (test pollution via no-op vi.mock)

## Próximas fases

- **Cycle 497**: re-autorizar `run-quality-eval-guard.test.ts` com:
  - export dos 8 internal checks em runner.ts (ou refator pra classe)
  - assertions alinhadas ao contract real (`report.score` não `overallScore`)
  - mock factory que substitui as exports
- **Cycle 498**: `.claude/` e `.hermes/` session-state — gitignore?
- **Cycle 499+**: Fase 14 (Operator.sessions table) — 3h+ P0, fora de quick mode
