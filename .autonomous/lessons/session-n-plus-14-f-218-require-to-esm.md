# Lesson — F-218 `require()` to ESM import refactor

**Date:** 2026-06-11
**Session:** N+14
**Commit:** 1dfd7881 — fix(core-iching): replace lazy require('./practices') with top-level ESM import

## Contexto

F-218 estava marcado `passes: null` no `feature_list.json` desde N+13
(mencionava `require` em `packages/core-iching/src/hexagrams.ts` e
`process` em `packages/mentor/src/rag/*`). O `pnpm typecheck` rodando
no root passava porque o `tsc` não bloqueia `require()` em módulo
ESM (apenas ESLint via `@typescript-eslint/no-require-imports`).
Sessão N+10 já tinha zerado typecheck via stub de framer-motion, e
N+13 fixou o `redis` mock path. F-218 ficou órfão.

## Aprendizado

1. **Lazy `require()` é red flag** — `hexagrams.ts:290` usava
   `const { PRACTICES } = require('./practices')` dentro de um wrapper
   `getPracticesById()`. Comentário dizia "para evitar dependência
   circular", mas `practices.ts` só importa `type` de `./types` (zero
   valor import). Não há ciclo real.

2. **Sempre verificar imports antes de aceitar lazy load** — basta
   rodar `grep "^import" src/<outro>.ts` para confirmar. Cycle 114
   reforça o instinto "agents-md-derive-not-invent-correspondences":
   paralelamente, "verify-deps-before-lazy-load" — wrappers de
   lazy load são placeholders para `import` direto na maioria dos
   casos.

3. **PostToolUse:Edit hook pegou o call site órfão** — após remover
   `getPracticesById()`, o advisory detectou que a chamada na linha
   304 (`getPracticesById()[id]`) ainda existia e quebraria runtime
   com `ReferenceError`. Fix imediato: `PRACTICES_BY_ID[id]`.

4. **Refactor = net negativo de linhas** — 11 LOC removidos (-11/+6),
   mesma semântica, anti-pattern eliminado. Padrão "minimum code that
   solves the problem" do CLAUDE.md §2 satisfeito.

5. **Verify triad em escopo local + smoke do root** — 43/43
   `packages/core-iching` passa; root mostra 234/1367 fail (pré-existente
   de pollution cycles 102-113). Não introduzi regressão.

## Como aplicar

Próxima sessão: ao ver `require()` em módulo ESM, fazer:
```
1. grep "^import" no arquivo-alvo do require
2. Se só types → substituir por top-level `import { X } from ...`
3. Remover wrapper lazy
4. Atualizar call site inline
5. pnpm typecheck + pnpm test:run <pacote> (isolated, não root)
6. Commit fix + fechar F-NNN passes:null
```

Aplicar mesma checagem em `packages/mentor/src/rag/*` para o
`process not found` que F-218 mencionava (provavelmente usa
`process.env.X` em Edge runtime; substituir por `import { env } from
'@next/env'` ou guardar em closure). Mas isso é F-NNN separada.

**Why:** Hooks PostToolUse são a única defesa contra call sites
órfãos em refactors que removem wrappers. Não ignorar advisories.

**How to apply:** Trust hook output. Re-read file após Edit que
remove função, antes de prosseguir.
