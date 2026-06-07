---
name: cycle-189
description: quick — 2026-06-03 — feat(app): add src/app/global-error.tsx root error boundary
metadata:
  type: project
  cycle: 189
  mode: quick
  duration_s: ~600
  originSessionId: cabala-quick-loop
---

# Cycle 189 — quick — 2026-06-03

## Mudanças

- **Commit `eee63d7d`**: `feat(app): add src/app/global-error.tsx root error boundary`
- **1 arquivo criado, +69 LOC**:
  - `src/app/global-error.tsx` — client component com próprio `<html>/<body>`,
    exibe `error.digest` e botão "Tentar novamente" chamando `reset()`.
- **Tentativas revertidas (surgical)**: `dynamic = 'force-dynamic'` em
  `not-found.tsx`/`global-error.tsx`/`layout.tsx` — todos no-op em client
  components, não destravam o prerender de `/_global-error`.

## Verificação

| Gate | Result |
|------|--------|
| `npm run build` | ❌ **PRE-EXISTING** — `/_global-error` useContext null (mesma falha de cycle-188) |
| `npm run lint` | ✅ 0 errors, 1429 warnings (todos pré-existentes) |
| `npm run test:run` | ✅ 1772 passed, 17 skipped (82 files), 24.19s — 0 regressões |

## Pré-existentes registrados (NÃO mexer)

- Build error em `/_global-error` (Next.js 16 prerender + React 19 useContext) —
  reproduz em HEAD limpo. **Root cause**: `next/font/google` no `layout.tsx`
  cria contexto React 19 indisponível durante prerender de `/_global-error`.
- 1429 lint warnings (maioria `@typescript-eslint/no-unused-vars` em test files).
- Autoformat modificou `layout.tsx` (150 linhas) + `not-found.tsx` (49 linhas)
  durante o ciclo — **revertido** antes do commit (regra surgical changes).

## Investigação do build error

Tentativas que **NÃO funcionam** em Next.js 16.2.6 + React 19.2.4:
- `export const dynamic = 'force-dynamic'` em client component (no-op)
- `export const dynamic = 'force-dynamic'` no root layout (não afeta implicit `/_global-error`)
- `global-error.tsx` com próprio `<html>/<body>` (renderiza bem em runtime, prerender continua falhando)

**Fix que provavelmente funciona** (próximo ciclo):
- Substituir `next/font/google` em `layout.tsx` por `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` direto no `<head>`. CSS variables `--font-cinzel` etc. precisariam ser redefinidas manualmente em `globals.css` ou via `:root { font-family: ... }`.
- OU: downgrade `next.config.ts` para forçar `output: 'standalone'` que pula prerender de implicit error pages.
- OU: investigar flag `experimental.missingSuspenseWithCSRBailout`.

## Próximas fases sugeridas

- **Fase 30 (curto, 30min)**: substituir `next/font/google` por `<link>` no root layout — destrava o build. É P0 desde cycle-188.
- **P0 task-queue.md** "Fase 14: Operator.sessions" — **já feito** (PROGRESS Fase 13 ✅). Atualizar task-queue.

## Métricas

- Files modified: 1 created, 2 reverted
- LOC: +69
- Test count delta: 0 (1772 → 1772)
- Build: pre-existing broken
- Lint: 0 errors (unchanged)
- Instintos: `pre-existing-test-drift-scope-discipline`, `surgical-changes-no-autoformat-cleanup`
