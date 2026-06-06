# Cycle 497 — 2026-06-04

**Modo**: quick
**Branch**: claude/docs-refactor-alignment-FOUqN
**Commit**: `ebe4467b`

## Mudanças

Fase 498 — gitignore runtime agent state:

- **`.gitignore`**: add `/.hermes/` (Hermes agent scratch plans) +
  `/.claude/scheduled_tasks.json` (cron scheduler state). Both are clearly
  transient harness output, not project source. Sits alongside existing
  `.claude/sessions/`, `.state/`, `.memory/`, `.remember/` entries.

`git check-ignore` confirms both targets now filtered. Net 1 file, +2 LOC.

## Verificação

- `npm run build`: FAIL (pre-existing BUG-01 `/_global-error` prerender,
  cycle 491 — not in scope)
- `npm run lint`: 0 errors / 670 warnings (baseline unchanged)
- `npm run test:run`: **8865 passed** / 32 skipped / **0 failed**
  (228 files; matches cycle 495/496 baseline exatamente)

## Pré-existentes

- BUG-01 `/_global-error` prerender (Next 16 + React 19 RC, cycle 491)
- 670 lint warnings (baseline)
- WIP `birth-chart-precision.test.ts` (13 vs 14 planets, OOS)
- WIP `run-quality-eval-guard.test.ts` (reverted in cycle 496,
  re-author pending cycle 498+ with real internal exports + correct
  contract `report.score` not `overallScore`)

## Instintos ativados

- `npm-verify-cadence` (build/lint/test triad)
- `pre-existing-test-drift-scope-discipline` (BUG-01 não escopo)
- `commit-style` (Conventional Commits + Fase N + Co-Authored-By)

## Próximas fases

- **Cycle 498**: re-autorizar `run-quality-eval-guard.test.ts` com
  exports reais de `runner.ts` ou deletar a ideia (orquestrador já
  exercitado por `npm run scripts/quality-eval.ts`)
- **Cycle 499+**: Fase 14 (Operator.sessions table) — 3h+ P0, fora de quick
- **Backlog P1**: Fase 12 (mesa-real-data drift, 28 fails), T7.1/T7.2 UX
