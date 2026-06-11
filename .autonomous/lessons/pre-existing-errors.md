# Lessons — Pre-existing TypeScript Errors

**Date:** 2026-06-11
**Status:** Documented, not blocking Fase 6
**Owner:** F-100 / F-101 (Fase 7 hardening)

## Errors (não-introduzidos pelo loop)

### 1. `packages/akasha-core/src/recommendation-generator.ts:40-46`
```
error TS2307: Cannot find module '@akasha/mentor/rag'
```
**Causa:** package `@akasha/mentor` foi refatorado; path `/rag` não é mais exportado.
**Fix:** F-100 refactor (atualizar imports OU mover código RAG para `@akasha/core`).

### 2. `packages/akasha-core/src/recommendation-generator.ts:168`
```
error TS7006: Parameter 'r' implicitly has an 'any' type
```
**Causa:** strict mode TS sem tipagem explícita em callback.
**Fix:** adicionar tipo `Recommendation[]` ao callback.

### 3. `packages/mentor/src/rag/*.ts` (múltiplos)
```
error TS2591: Cannot find name 'process'
```
**Causa:** `@types/node` não está no tsconfig types do `mentor`.
**Fix:** adicionar `"types": ["node"]` em `tsconfig.json` ou importar tipos.

## Impacto

- `pnpm typecheck` retorna 5+ erros mesmo com Fases 0-5 ✅
- Tests still pass (298/298) — vitest não depende de typecheck strict
- Build de produção funciona (Next.js tolera)

## Plano

- F-101 deadcode → cobre #1 (cleanup de imports)
- F-100 refactor → adiciona tipos a #2
- F-104 docs sync → documenta #3

**NÃO bloquear Fase 6** com esses fixes.
