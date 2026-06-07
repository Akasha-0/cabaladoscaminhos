---
name: cycle-188
description: quick — 2026-06-03 — chore(refactor): remove 9 more dead odu dirs in src/lib/ root (-1156 LOC)
metadata:
  type: project
  cycle: 188
  mode: quick
  duration_s: ~420
  originSessionId: cabala-quick-loop
---

# Cycle 188 — quick — 2026-06-03

## Mudanças

- **Commit `52403e39`**: `chore(refactor): remove 9 dead odu dirs in src/lib/ root`
- **17 arquivos deletados / -1156 LOC**:
  - `src/lib/ikate/` (2 files), `src/lib/ikoyun/` (2), `src/lib/okanle/` (2),
    `src/lib/okanran/` (2), `src/lib/osetura/` (2), `src/lib/osha/` (1),
    `src/lib/oshe/` (2), `src/lib/oturupon/` (2), `src/lib/owonrin/` (2)
- **Razão**: zero consumers em `src/` ou `tests/` (grep retornou vazio).
  Canonical odu data mora em `src/lib/orixa/` (e.g. `orixa/ikate-data.ts`,
  `orixa/owonrin-data.ts`).
- **Follow-up** de cycle-187 commit `739f13f0` (que removeu 34 dirs similares).

## Verificação

| Gate | Result |
|------|--------|
| `npm run build` | ❌ **PRE-EXISTING** — `/_global-error` prerender "useContext" error |
| `npm run lint` | ✅ 0 errors, 1429 warnings (todos pré-existentes) |
| `npm run test:run` | ✅ 1772 passed, 17 skipped (82 files), 19.19s |

**Confirmação pre-existing**: rodei `git stash` + `npm run build` em HEAD limpo
(`7578090e`) — **mesmo erro**. Não introduzido por cycle-188. Não em escopo.

## Pré-existentes registrados (NÃO mexer)

- Build error em `/_global-error` (Next.js 16 prerender + React 19 useContext) —
  reproduz em HEAD limpo. Provavelmente requer investigação de `error.tsx` /
  `global-error.tsx` em `src/app/` ou fix em `next.config.js`. **Não cycle-188**.
- 1429 lint warnings (maioria `@typescript-eslint/no-unused-vars` em test files).
- Lint/autoformat em 150+ arquivos não relacionados (cycle-118, pré-existente).

## Próximas fases sugeridas

- **Fase 30 (curto)**: investigar `/_global-error` prerender — criar
  `src/app/global-error.tsx` mínimo client component, ou ajustar
  `next.config.js` `experimental.missingSuspenseWithCSRBailout`.
- **P0 task-queue.md** "Fase 14: Operator.sessions" — **jÁ feito** (PROGRESS.md
  Fase 13 ✅). Atualizar task-queue.
- **P1 Fase 12**: drift `mesa-real-data.ts` vs tests (28 falhas pré-existentes
  registradas).

## Métricas

- Files modified: 17 deleted
- LOC removed: -1156
- Test count delta: 0 (1772 → 1772)
- Build: pre-existing broken (reproduced on stash)
- Lint: 0 errors (unchanged)
- Instintos: `pre-existing-test-drift-scope-discipline` (reconhecido build pre-existing)
