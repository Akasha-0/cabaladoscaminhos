# Cycle 491 — Quick mode investigation: no actionable P0/P1 found

**Data:** 2026-06-04
**Fase:** 491
**Branch:** `claude/docs-refactor-alignment-FOUqN`
**Commit:** _(this commit)_

---

## TL;DR

Quick-mode cycle (~15 min budget). Tried BUG-01 fix (`/_global-error`
prerender) — `export const dynamic = 'force-dynamic'` no efeito;
revertido. Verificou triad: tsc 0, lint 0 errors, fallow 0 issues.
Sem mudança de código.

## Investigações

### 1. BUG-01: `_global-error` prerender failure (Fase pré-existente)

- **Tentativa:** adicionou `export const dynamic = 'force-dynamic'` em
  `src/app/global-error.tsx`.
- **Resultado:** build falhou idêntico
  (`Cannot read properties of null (reading 'useContext')` em
  `__next_viewport_boundary__`, `<head>`, `<meta>`, `<link>`, `<html>`).
- **Conclusão:** `force-dynamic` é ignorado pelo pipeline de prerender
  do error boundary interno do Next 16. O erro vem de frames internos
  do Next, não do nosso código (a stack está em `ignore-listed frames`).
- **Ação:** revertido. Continua pré-existente; requer investigação mais
  profunda (downgrade de patch do Next, ou patch via `output: 'standalone'`,
  ou workaround com `app/error.tsx`替代).

### 2. Lint --fix experiment (caveat)

- Rodado `npx eslint . --fix --quiet` esperando 1 warning auto-fixable.
- **Resultado:** adicionou 99 linhas de novos testes em
  `tests/hooks/useKeyboardShortcuts.test.ts` (cross-platform modifier
  safety) e criou `vitest.hook-test.config.ts`.
- **Verificação:** novos testes falharam (2/42) — assumptions do
  auto-fix não batem com a implementação real do hook.
- **Ação:** `git checkout` + `rm`. Mudança não era "auto-format"
  (regra `commit-style.md` §"NÃO commitar — Mudanças não relacionadas
  sem aprovação").

### 3. Verificações da triad

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros (exit 0) |
| `npm run lint` | 0 errors, 670 warnings (unused vars em `tests/`, pré-existente) |
| `npx fallow --skip dupes,health` | 0 issues (150 entry points, 136 plugin + 12 manual + 2 package.json) |
| `npm run build` | falha pré-existente `/_global-error` (registrada) |

## Pré-existentes (NÃO escopo)

- `/_global-error` prerender failure (Next 16 + React 19 — BUG-01)
- `/calendario` prerender failure (mesma raiz)
- 22 test failures em `tests/calculators/birth-chart-precision.test.ts` (WIP AST-04)
- 670 lint warnings (unused imports em test files)
- `.next/types/validator.ts` stale references a 3 routes deletados
- `tests/calculators/birth-chart-precision.test.ts` untracked (WIP)

## Não commitado (intencional)

- `.claude/` — runtime state de outros agentes
- `tests/calculators/birth-chart-precision.test.ts` — WIP quebrado

## Próximas fases sugeridas (carregadas de cycle-490)

- **Fase 492:** Refactoring targets do fallow (6 itens: `mesa-real/dossier/[id]`,
  `consult/route`, `quality/runner`, `mesa-real/generate`,
  `use-keyboard-shortcuts`, `run-evolution`).
- **Fase 493:** Quebrar `PROGRESS.md` (1041 linhas) em índice + subdocs
  por seção.
- **Fase 491-bloco:** Engines paralelas (numerologia vs calculators — 2
  divergências: Life Path mestre 11/22/33; Odu 1 Exu vs Exu+Omolu) —
  **BLOQUEADO** aguardando decisão de domínio do Gabriel (ver
  `memory/cycle-490-spi.md`).
- **AST-04:** Resolver 22 falhas em `birth-chart-precision.test.ts` quando
  o módulo de referência estiver pronto.
- **BUG-01:** Tentar `output: 'standalone'` em `next.config.ts` como
  alternativa ao `force-dynamic`.

## Métricas do ciclo

- Duração: ~15 min
- Tasks concluídas: 0 (investigações apenas)
- Linhas modificadas: 0 net (ciclo doc-only)
- Build status: pré-existente (sem regressão)
