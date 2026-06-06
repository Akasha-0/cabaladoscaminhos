---
name: cycle-498
description: Hourly — 2026-06-04 — re-author runQualityEval contract guard (Fase 499), expose pre-existing quality-test drift
metadata:
  type: project
  cycle: 498
  branch: claude/docs-refactor-alignment-FOUqN
  commit: 5dd07e12
---

# Cycle 498 — Hourly: re-author runQualityEval contract guard (Fase 499)

**Data:** 2026-06-04
**Fase:** 499
**Branch:** `claude/docs-refactor-alignment-FOUqN`
**Commit:** `5dd07e12`
**Modo:** hourly

---

## TL;DR

Re-autoriza o guard test `tests/lib/quality/run-quality-eval-guard.test.ts`
que cycle 496 reverteu (asserções contra campos inexistentes no
`QualityReport` real + `vi.mock` de helpers internos não-exportados).
Versão nova mocka apenas `child_process` e `fs` (camada Node subjacente
aos helpers internos) e valida invariantes estruturais. Add escopada
do include no `vitest.config.ts` — só o guard test, não o diretório
inteiro, porque isso expôs drift pré-existente.

## Mudanças

- **`tests/lib/quality/run-quality-eval-guard.test.ts`** (NEW, 109 LOC):
  5 testes. Mocka `child_process.execSync` → '' e `fs.{existsSync,
  readdirSync, readFileSync}` → safe values; valida campos top-level
  do `QualityReport` (score, grade, categoryScores, issues,
  recommendations, timestamp, details); score em [0,100]; grade no set
  `A+|A|A-|B+|B|B-|C+|C|C-|F`; details com 7 chaves; invariante
  `|weightedScore - round(score*weight)| <= 1`.
- **`vitest.config.ts`** (+1 linha): add `'tests/lib/quality/run-quality-eval-guard.test.ts'`
  ao include do projeto `core-logic`. Escopo específico de arquivo,
  não glob `**`, para não arrastar `metrics.test.ts` e `runner.test.ts`.

## Verificação

- `npx vitest run tests/lib/quality/run-quality-eval-guard.test.ts` (isolado):
  **5/5 pass, 348ms** ✅
- `npm run test:run`: **8870 passed** / 32 skipped / 0 failed
  (228+1 files; baseline 8865 → 8870, **+5 net** do guard test) ✅
- `npx tsc --noEmit`: 0 errors ✅
- `npm run lint`: 0 errors / 670 warnings (baseline inalterado) ✅
- `npm run build`: FAIL — pre-existing BUG-01 `/_global-error`
  prerender (cycle 491, Next 16 + React 19 RC, `useContext` null) —
  **não escopo**

## Drift pré-existente exposto (registrado, não consertado)

Quando tentei `'tests/lib/quality/**'` (escopo amplo), 20 testes
pré-existentes falharam:

- **`tests/lib/quality/runner.test.ts`** (11 fails): importa `ALL_EVALS`
  de `@/lib/quality/runner`, mas `ALL_EVALS` não existe nesse módulo.
- **`tests/lib/quality/metrics.test.ts`** (9 fails): importa
  `calculateGrade`, `getGradeColor`, `validateMetricValue`,
  `calculateScoreFromValue` de `@/lib/quality/metrics-framework`,
  mas só estão exportados os types/Threshold/DEFAULT_THRESHOLDS
  (lidos via `grep "^export "`). As funções foram removidas ou
  nunca exportadas nesse branch.

Ambos os arquivos foram filtrados do suite desde a consolidação do
vitest projects (cycle ~138, "consolidate test isolation"). Por isso
não apareceram no baseline 8865. Esta fase re-autoriza o guard com
include escopado, deixando os dois arquivos para uma fase futura
de cleanup (Fase 500+).

## Pré-existentes (inalterados)

- BUG-01 `/_global-error` prerender (cycle 491)
- 670 lint warnings (baseline)
- WIP `birth-chart-precision.test.ts` (13 vs 14 planets, OOS)
- Drift em `tests/lib/quality/{runner,metrics}.test.ts` (acima)

## Próximas fases sugeridas

- **Fase 500**: cleanup do drift `tests/lib/quality/{runner,metrics}.test.ts`
  — ou (a) rm os arquivos como B2C legacy, ou (b) portar para a
  API real de `runner.ts`/`metrics-framework.ts`. Decidir via
  Gabriel: esses testes foram escritos em um branch anterior e
  nunca chegaram a este?
- **Fase 501**: retomar BUG-01 `_global-error` prerender (Next 16 +
  React 19 RC compat) — registrado como 3h+ blocker desde cycle 491.
- **Fase 14 (P0)**: Operator.sessions para logout imediato via
  revogação de token (cycle-115/118, fila task-queue).
- **Fase 12 (P1)**: resolver drift `mesa-real-data.ts` vs
  test expectations (28 falhas pré-existentes em
  `tests/lib/lenormand/mesa-real.test.ts`).

## Instintos ativados

- `npm-verify-cadence` (verify triad em ordem)
- `test-pollution-shared-module-state` (investiguei vi.mock leakage
  ao ver 20 fails novos; raiz: include amplo expôs drift pré-existente,
  não pollution)
- `pre-existing-test-drift-scope-discipline` (NÃO consertei
  metrics.test.ts/runner.test.ts; documentei como pré-existente)
- `verification-before-completion` (rodei triad inteira antes de
  claim de "5/5 pass")

## Métricas do ciclo

- Test count delta: **+5** (8865 → 8870)
- Arquivos modificados: 2 (1 new, 1 modified)
- Linhas: +115 / -0
- Duração: ~15min (read + design + write + verify + commit)
