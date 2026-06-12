# Lesson — vitest mock path MUST match import path exactly

**Date:** 2026-06-11
**Session:** N+13
**Commit:** c16ecd53

## Contexto

`tests/api/akasha/transits/today.test.ts` tinha 4 testes falhando
silenciosamente. Sintoma:
- `expect(res.status).toBe(200)` → recebia 503
- `expect(cacheControl).toMatch(/max-age=/)` → `cacheControl` era `null`

A primeira vista parece "Redis mock não funciona" ou "Cache-Control
não foi setado". Mas o problema era mais simples: **o mock path
não bate com o import path**.

## Aprendizado

`vi.mock(path)` é resolvido pelo mesmo alias resolver que `import`.
Se o código diz `import from '@/lib/infrastructure/redis'` e o teste
diz `vi.mock('@/lib/redis', ...)`, **o mock não é aplicado** — o
teste importa o módulo real, que tenta conectar em Redis de verdade
e cai no path 503 do fallback.

A causa: 2 caminhos muito parecidos mas um está em `infrastructure/`
e outro é o "curto". Em código novo é fácil errar.

Como detectar:
1. Roda teste isolado — falha previsível
2. Lê stack trace do erro
3. Verifica `vi.mock` vs `import` paths byte por byte

## How to apply

Antes de commitar qualquer teste novo com `vi.mock`:

```bash
# extrai path do mock e do import e compara
grep -n "vi.mock\|from '@/lib" tests/novo.test.ts src/app/api/.../route.ts
```

Ou adiciona um helper que falha alto se o mock não foi aplicado:

```ts
const { getRedisClient } = await import('@/lib/infrastructure/redis')
expect(getRedisClient).toBe(mockFn) // sanity check do mock
```

Também afeta o segundo achado: `vitest.config.ts` tinha alias para
`@akasha/types`, `@akasha/core-astrology` etc. mas faltava
`@akasha/core` (que **tsconfig.json** tinha). Rotas importando de
`@akasha/core` corriam o risco de resolução silenciosa errada.

Checklist: **tsconfig paths ⊃ vitest.config aliases**. Se um está
e o outro não, drift.

## Métricas

- Diff: 2 insertions, 1 deletion (2 files)
- Tests: 4/4 transit test (era 0/4)
- Full suite: 234 falhas → 234 falhas (pre-existing pollution, sem regressão)
- Typecheck: 0 errors
- F-217 added, passes:true
