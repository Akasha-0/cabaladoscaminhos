---
name: cycle-494
description: Quick — 2026-06-04 — knip dead-type cleanup, 2 types removed, test +16 net (AST-04 baseline 16 fails now 0)
metadata:
  type: project
  cycle: 494
  branch: claude/docs-refactor-alignment-FOUqN
  commit: 57751bb9
---

# Cycle 494 — Quick mode: knip dead-type cleanup (Fase 494)

**Data:** 2026-06-04
**Fase:** 494
**Branch:** `claude/docs-refactor-alignment-FOUqN`
**Commit:** `57751bb9`
**Status:** ahead of origin by 3 commits

---

## TL;DR

Knip scan → identified `CasaState` (`house-types.ts`) + `ChartLibrary`
(`charts/library.ts`) as exported-but-unused. Verified via Grep that
`cockpit-store.ts` does NOT import `CasaState` (stale JSDoc claim) and
`ChartLibrary` has no external consumers. Removed both, inlined return
type for `getCharts()`, typed lambda params `(c: Chart) =>`.

Net: -41 LOC, +11 LOC (mostly inlined type) = **-30 LOC**.

## Mudanças

- `src/lib/divination/house-types.ts` — removed `CasaState` union type
  (lines 53-73, 22 LOC, stale `fallow-ignore-next-line` marker).
  `HouseDefinition` and 3 importers (`HouseCell.test.tsx`,
  `house-delegation.ts`, `HouseCell.tsx`) unchanged.
- `src/lib/charts/library.ts` — removed `ChartLibrary` interface
  (lines 41-46), inlined equivalent return type on `getCharts()`,
  added explicit `(c: Chart) =>` params to fix implicit-any
  (TS7006). Public `getChartById`, `Chart`, `ChartType`, `ChartStyle`
  unchanged.

## Verificação

- `npx tsc --noEmit` → **0 errors**
- `npm run build` → pre-existing `_global-error` prerender fail
  (Next 16, registrado em cycle-493 e anteriores, **inalterado**)
- `npm run test:run` → **8850 pass / 32 skip / 0 fail** (+16 net vs
  cycle-493 baseline 8834; matches AST-04 birth-chart-precision 16
  fails resolved in 492c `d5bdb547`)

## Pré-existentes (inalterados)

- Build `/_global-error` prerender fail (Next 16) — fora de escopo
- `birth-chart-precision.test.ts` AST-04 — **RESOLVIDO em 492c**

## Próximas fases sugeridas

- Fase 495+: continuar knip sweep (restam ~40 dead exports em
  correlation/, orixa/, ifa/, etc. — cada um com fallow-ignore markers
  antigos, podem ser seguros após verificação individual)
- Fase 14: Operator.sessions (3h, P0) — quando houver janela
- T7.2 atalhos teclado (4h, P1)

## Stats

- Arquivos: 2
- LOC delta: -30 (41+ / 11-)
- Duração: ~5min (incl. 1 retry de tsc + 1 build retry pré-existente)
- Instintos: knip, surgical-scope
