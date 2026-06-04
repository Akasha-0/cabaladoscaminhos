---
name: cycle-492
description: Quick — 2026-06-04 — fix(astrology) Fase 492 — swiss-ephemeris velocity + node + house interp
metadata:
  type: project
  cycle: 492
  branch: claude/docs-refactor-alignment-FOUqN
  commit: 4cc499b0
---

# Cycle 492 — Quick mode: fix(astrology) — swiss-ephemeris velocity + node + houses

**Data:** 2026-06-04
**Fase:** 492
**Branch:** `claude/docs-refactor-alignment-FOUqN`
**Commit:** `4cc499b0`

---

## TL;DR

Resgatou 4 arquivos do WIP `astrologia/` que estavam unstaged desde antes do cycle 491 (modificados dentro de uma janela de ~3 min). 3 correções de bug + 1 rename que destravam o suite WIP. tsc 2 → 0. WIP test 0/0 (suite quebrado) → 32/46.

## Mudanças

| Arquivo | Tipo | Mudança |
|---|---|---|
| `swiss-ephemeris.ts` | bug fix | velocity `L1/36525` (deg/century → deg/day); node usa lua.longitude raw + `normalizeDegrees(+180)`; `normalizeDegrees` trata `-0` |
| `planet-positions.ts` | compile fix | rename `TEN_PLANETS` → `THIRTEEN_PLANETS` (constant existe na linha 19; estava undefined na 77) |
| `birth-chart.ts` | feature | aceita aliases `lat`/`lon` shorthand em `BirthChartInput` |
| `houses.ts` | refactor | interpolar casas simplificado (ASC=1, MC=10, 1/9 e 1/3 factors) — comment reconhece "stub, real Placidus lives elsewhere" |

Net: 38 +, 39 -.

## Verificação triad

| Comando | Antes | Depois |
|---|---|---|
| `npx tsc --noEmit` | 2 erros (`TEN_PLANETS`) | **0** (limpo) |
| `npm run lint` | 0 errors, 670 warnings | 0 errors, 670 warnings (sem mudança) |
| `npx vitest run tests/calculators/birth-chart-precision.test.ts` | 0/0 (suite quebrado) | **32 pass / 14 fail** (suite roda) |
| `npm run build` | falha `/_global-error` (BUG-01) | falha `/_global-error` (BUG-01, **pré-existente, sem regressão**) |

## Pré-existentes (NÃO escopo)

- `/_global-error` prerender failure (BUG-01) — registrada em cycle 491
- 670 lint warnings (unused vars em `tests/`)
- 14 WIP failures restantes em `birth-chart-precision.test.ts`: semântica 13-vs-14 planets (`expectLength(13)` vs `THIRTEEN_PLANETS` tem 14 itens incluindo node_norte, node_sul, chiron, lilith) — ticket separado
- `tests/calculators/_test-tmp.test.ts` untracked — leftover do lint-fix experiment do cycle 491

## Não commitado (intencional)

- `.claude/` — runtime state
- `tests/calculators/birth-chart-precision.test.ts` — WIP (32/46, ainda não verde)
- `tests/calculators/_test-tmp.test.ts` — leftover de experiment anterior

## Próximas fases sugeridas

- **Fase 493:** Decidir 13 vs 14 planets em `birth-chart-precision.test.ts` (criar constante `TRADITIONAL_PLANETS` sem nodes/chiron/lilith vs ajustar expectLength para 14). 14 é o default, ajustar o teste é mais barato.
- **Fase 494:** Tentar `output: 'standalone'` em `next.config.ts` para BUG-01 (`/_global-error`).
- **Fase 495:** Quebrar `PROGRESS.md` (1041 linhas) em índice + subdocs por seção.
- **AST-04 / Fase 491-bloco:** Engines paralelas (Life Path mestre 11/22/33; Odu 1 Exu) — **BLOQUEADO** aguardando decisão de domínio do Gabriel.

## Métricas do ciclo

- Duração: ~10 min
- Tasks concluídas: 1 (Fase 492)
- Arquivos modificados: 4 src + 1 memory = 5
- Linhas modificadas: 38 + 39 -
- tsc delta: 2 → 0 errors
- test delta WIP file: 0/0 broken → 32 pass / 14 fail
- Build: pré-existente (sem regressão)
