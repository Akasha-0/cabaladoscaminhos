# Cycle 489b — Commit dead-code + PATCH endpoint

**Data:** 2026-06-04
**Fase:** 489b
**Branch:** `claude/docs-refactor-alignment-FOUqN`
**Commit:** `178f9cbb`

---

## TL;DR

Committed leftover uncommitted work from previous cycle (cycle 489 stalled — Gabriel
held off approving pending review).

## Diff

| Arquivo | Mudança | Linhas |
|---|---|---|
| `src/app/api/banking/route.ts` | D (B2C legacy, no consumers) | -199 |
| `src/app/api/dashboard/widgets/route.ts` | D (orphan, no UI) | -138 |
| `src/app/api/favoritos/route.ts` | D (B2C legacy, no consumers) | -245 |
| `tests/api/dashboard-widgets.test.ts` | D (test for orphan route) | -63 |
| `src/app/api/operator/auth/me/route.ts` | M (+ PATCH change-password endpoint) | +115 / -3 |

**Net:** -530 linhas.

## PATCH /api/operator/auth/me (Fase 60)

Endpoint de mudança de senha para o operator autenticado:
- Valida `currentPassword` via bcrypt compare
- Hash + persiste `newPassword` (bcrypt cost 12)
- Revoga **todas as outras sessões** em `$transaction` (preserva a atual)
- Log `PASSWORD_CHANGED` (fire-and-forget)
- zod: `currentPassword` required, `newPassword` 8-200 chars

Imports verificados:
- `requireOperator` (`@/lib/auth/operator-session`) ✓
- `logSecurityEvent` (`@/lib/auth/audit-service`) ✓
- `OPERATOR_TOKEN_COOKIE` (`@/lib/auth/operator-jwt`) ✓
- `hashOperatorToken` (`@/lib/auth/operator-sessions`) ✓
- `prisma` (`@/lib/prisma`) ✓

## Validação

- `npx tsc --noEmit` — 0 erros (após limpar `.next/` cache stale)
- `npm run test:run` — 1890 pass + 22 fail pré-existentes (WIP de outro agente em `tests/calculators/birth-chart-precision.test.ts`)
- `npm run build` — **NÃO validado**: falha pré-existente em `/_global-error` prerender (`useContext` null) — confirmado via `git stash` que o erro existe **antes** deste diff

## Pré-existentes (NÃO escopo)

- `/_global-error` prerender build failure (Next.js 16 + React 19 — issue conhecida, registrada em memory)
- `tests/calculators/birth-chart-precision.test.ts` — 22 falhas, WIP de outro agente (AST-04 precision)

## Não commitado

- `.claude/` — untracked, contém state de runtime de outros agentes
- `tests/calculators/birth-chart-precision.test.ts` — WIP quebrado, não é trabalho deste ciclo

## Próximas fases sugeridas

- **Fase 490:** Consolidação de engines paralelas (`numerologia/` vs `numerology/` vs `calculators/numerology-*`) — risco espiritual se cálculos divergem.
- **Fase 491:** Refactoring targets do fallow (6 itens: `mesa-real/dossier/[id]`, `consult/route`, `quality/runner`, `mesa-real/generate`, `use-keyboard-shortcuts`, `run-evolution`).
- **Fase 492:** Quebrar `PROGRESS.md` (57KB / 1031 linhas) em índice + subdocs por fase.
- **Fase 493:** Regenerar baselines estáticas (fallow-baseline-*.json) a partir de fallow fresh.
- **AST-04:** Resolver 22 falhas em `birth-chart-precision.test.ts` quando o módulo de referência estiver pronto.
- **BUG-01:** Investigar `_global-error` prerender failure (Next.js 16 issue).
