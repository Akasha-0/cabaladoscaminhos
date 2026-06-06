---
name: cycle-499
description: Quick — 2026-06-04 — Fase 500 rm drift test files (runner/metrics B2C legacy)
metadata:
  type: project
  cycle: 499
  branch: claude/docs-refactor-alignment-FOUqN
  commit: pending
---

# Cycle 499 — Quick: rm drift test files (Fase 500)

**Data:** 2026-06-04
**Fase:** 500
**Branch:** `claude/docs-refactor-alignment-FOUqN`
**Modo:** quick

---

## TL;DR

Resolve drift pré-existente exposto por cycle 498 (Fase 499): dois
arquivos de teste em `tests/lib/quality/` importam symbols que
nunca foram exportados neste branch.

- `tests/lib/quality/runner.test.ts` → importava `ALL_EVALS` de
  `@/lib/quality/runner`. `runner.ts` exporta só `EvalOptions`,
  `EvalMetric`, `EvalSuite`, `CategoryScore`, `QualityIssue`,
  `QualityRecommendation`, `QualityReport`, `runQualityEval`,
  `runAllEvals`. Sem `ALL_EVALS`.
- `tests/lib/quality/metrics.test.ts` → importava `calculateGrade`,
  `getGradeColor`, `validateMetricValue`, `calculateScoreFromValue`
  de `@/lib/quality/metrics-framework`. `metrics-framework.ts`
  exporta só `MetricCategory`, `MetricSeverity`, `MetricStatus`,
  `Threshold`, `DEFAULT_THRESHOLDS`, `MetricStats`. Sem essas funções.

Ambos arquivos foram filtrados do suite desde consolidação do vitest
projects (cycle ~138, "consolidate test isolation"), então não
apareceram no baseline 8865. Eram drift B2C legacy de branch
anterior. Removidos.

## Mudanças

- `git rm tests/lib/quality/runner.test.ts` (80 LOC)
- `git rm tests/lib/quality/metrics.test.ts` (63 LOC)
- net: **-143 LOC**

## Verificação

- `npx tsc --noEmit`: 0 errors ✅
- `npm run lint`: 0 errors / **668 warnings** (baseline 670 → 668, -2
  dos 2 arquivos removidos) ✅
- `npm run test:run`: **8870 passed** / 32 skipped / 2 unhandled
  rejection (teardown `rate-limit.test.ts`, pre-existing) ✅
  - delta: 0 tests (arquivos removidos nunca rodaram no suite;
    baseline inalterado)
- `npm run build`: não rodado (BUG-01 `/_global-error` pré-existente
  cycle 491, não escopo)

## Pré-existentes (inalterados)

- BUG-01 `/_global-error` prerender (cycle 491)
- 668 lint warnings (baseline 668 pós-rm, era 670)
- WIP `birth-chart-precision.test.ts` (13 vs 14 planets, OOS)
- Teardown unhandled rejection em `tests/lib/auth/rate-limit.test.ts`

## Próximas fases sugeridas

- **Fase 501**: retomar BUG-01 `_global-error` prerender (Next 16 +
  React 19 RC compat) — registrado como 3h+ blocker desde cycle 491.
- **Fase 14 (P0)**: Operator.sessions para logout imediato via
  revogação de token (cycle-115/118, fila task-queue).
- **Fase 12 (P1)**: resolver drift `mesa-real-data.ts` vs
  test expectations (28 falhas pré-existentes em
  `tests/lib/lenormand/mesa-real.test.ts`).

## Instintos ativados

- `npm-verify-cadence` (verify triad em ordem)
- `pre-existing-test-drift-scope-discipline` (rm de drift, não
  portar API que não existe)
- `verification-before-completion` (rodei triad inteira antes de
  claim de "clean")

## Métricas do ciclo

- Test count delta: **0** (arquivos removidos não estavam no suite)
- Lint delta: **-2 warnings** (670 → 668)
- Arquivos modificados: 2 (rm)
- Linhas: +0 / -143
- Duração: ~8min (read + grep + rm + verify + commit)
