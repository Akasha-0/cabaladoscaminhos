# Lesson — Refactor agent introduced circular import + missing data wiring

**Date:** 2026-06-16
**Session:** N+30 (loop/w2, akasha-evolution iter 7)
**Commits involved:** 1c27c7de (broken), 3046a6ba (fix), ef3a867d (v0.8.0, partial refactor)

## Contexto

Durante a iteração 7 do akasha-evolution, o agent `large_file`
(ta-1781622042-4) tentou extrair helpers de `packages/core-iching/src/practices.ts`
(1001L) seguindo as regras do task:

> Extract ONE helper module from ONE oversized file

O agent extraiu DOIS módulos (não um) e introduziu **3 bugs fatais**:

### Bug 1: Circular import
- `practices.ts` (topo): `export { ... } from './practices-lookup'`
- `practices-lookup.ts`: `import { PRACTICES } from './practices'`
- Resultado: ao carregar `practices-lookup.ts`, `PRACTICES` ainda é
  `undefined` porque `practices.ts` está em loading (espera o
  re-export ser resolvido primeiro).
- Erro runtime: `TypeError: Cannot read properties of undefined
  (reading 'map')` em `PRACTICES_BY_ID = Object.fromEntries(PRACTICES.map(...))`

### Bug 2: Incomplete extraction (redeclaration)
- `practices.ts` linhas 971-1004 mantinha as 6 funções declaradas
  LOCALMENTE (`getPractice`, `getPracticesByElement`, etc.)
- Simultaneamente, `practices.ts` linhas 16-22 re-exportava as MESMAS
  6 funções de `./practices-lookup`
- Resultado: 12 erros de redeclaration (TS2323 + TS2484) por função
- Total: 27 erros de typecheck

### Bug 3: Missing data wiring
- 5 práticas de Cromoterapia foram MOVIDAS para
  `practices-cromoterapia.ts`
- MAS o `PRACTICES` array em `practices.ts` (que era o agregador)
  NÃO foi atualizado para fazer spread das 5 removidas
- Test `getAllPractices() should return 49` falhava retornando 44

## Correção aplicada (commit 3046a6ba)

```bash
git checkout e9ee39ac -- packages/core-iching/src/practices.ts
rm packages/core-iching/src/practices-cromoterapia.ts
rm packages/core-iching/src/practices-lookup.test.ts
rm packages/core-iching/src/practices-lookup.ts
git add -A
git commit -m "fix: revert broken refactor..."
```

Triad após fix:
- typecheck: ✅ 0 errors
- vitest (core-iching): ✅ 43/43 tests
- working tree limpo para código de produção

## Aprendizado

1. **Extraction agents devem verificar O BIDIRECIONAL do import graph.**
   - Quando o original `practices.ts` re-exporta de `./practices-lookup`
   - E `practices-lookup.ts` precisa de `PRACTICES` (data) do original
   - A solução é **NÃO re-exportar**, mas sim **MOVER** o data
     `PRACTICES` para um módulo neutro (ex: `practices-data.ts`) que
     AMBOS importam.

2. **Mover funções SEM mover dados causa regressions invisíveis.**
   O test passou 16/16 antes do refactor (PRACTICES tinha 49 entries).
   Após o refactor, retornou 44 (5 de cromoterapia faltando).
   O typecheck e a suite de TESTES estão no mesmo projeto, mas
   o agent só rodou `pnpm test:run` (que pode ter passado nos
   módulos que ele rodou, mas não na suite completa).

3. **A regra "ONE helper module" no task é CRÍTICA.** O agent
   extraiu 2 módulos (`practices-lookup` + `practices-cromoterapia`),
   violando o scope. Isso forçou mudanças em 2 direções de cada vez.

4. **QA do daemon não detectou.** O daemon rodou `pnpm typecheck`
   (que ainda passou na primeira metade do processo do agent) e
   aprovou o commit. O bug só foi visível quando o test suite
   completo rodou.

5. **Pre-existing test failure ignorada:** O test
   `akasha-core.test.ts > Ana (com hora) — gera 5 Pilares`
   falhava ANTES do refactor (Etogundá não match regex). Esta
   falha foi absorvida pelo ruído.

## Sugestão de patch (proposal only — não aplicada)

Reforçar o prompt do agent large_file:

```diff
+ RULES — EXACTLY FOLLOW:
  1. Run `git status` first
  2. Read the target file and identify ONE natural group (50-150L)
  3. Create a new helper file in the same directory
- 4. Update the original file to import from the new helper
+ 4. Update the original file to import from the new helper
+    AND remove the moved code from the original
+    AND verify the import graph has no cycles:
+    `pnpm tsc --noEmit packages/<pkg>/`
  5. Run `pnpm typecheck` — must pass
- 6. Run `pnpm test:run` — must not break existing tests
+ 6. Run `pnpm test:run packages/<pkg>/` — must pass 100% of
+    tests in the affected package (NOT just smoke)
  7. Commit: ...
+ 8. CHECK: `git grep "<function_name>" packages/<pkg>/` should
+    show only ONE definition of each moved function
```

## Custo medido

- 27 typecheck errors (2 horas para diagnosticar e corrigir)
- 1 release v0.9.0 foi feito com código quebrado (o daemon não detectou)
- 1 fix commit (3046a6ba) necessário para restaurar triad
- ~3 horas wall-clock de debugging + 1 lesson

## Estado final

- Código: revertido para estado pré-refactor (993L, 49 practices)
- Triad: typecheck ✅, tests core-iching 43/43 ✅
- Test pre-existente ainda falha: `akasha-core.test.ts > Ana`
  (não relacionado a este fix)
- Próxima iteração do loop pode tentar o refactor novamente
  com as regras reforçadas (se proposal for aceita)
