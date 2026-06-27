# Test Report — Filtro "Para você" (recommendation engine)

**Data:** 2026-06-27
**Branch:** main (work-in-progress, not pushed)
**Status:** ❌ Tests não puderam ser executados no sandbox

## Status por Deliverable

| Deliverable | Status | Notas |
|---|---|---|
| `getFeedPersonalized()` em `src/lib/community/posts.ts` | ✅ Entregue | Função completa com scoring (10/5/3) |
| Validador `filter` em `FeedQuerySchema` | ✅ Entregue | Aceita `'all' \| 'seguindo' \| 'grupos' \| 'tendencias' \| 'para-voce'` |
| Rota `GET /api/posts?filter=para-voce` | ✅ Entregue | Com fallback pra `filter=all` se viewer anônimo |
| Hook `useFeed` aceita `filter` | ✅ Entregue | Forward automático via query string |
| Tab "Para você" no feed page | ✅ Entregue | Com empty state customizado |
| `__tests__/api/posts-para-voce.test.ts` | ✅ Criado (5 casos) | ⚠️ Não executado |
| TypeScript `--noEmit` | ✅ Zero errors nos arquivos alterados | (csstype error é preexistente, não relacionado) |
| Vitest run | ❌ **BLOQUEADO** | Bus error (sandbox 2GB RAM, sem swap) |

## Investigation — Por que os tests não rodaram

```bash
$ NODE_OPTIONS="--max-old-space-size=512" ./node_modules/.bin/vitest run __tests__/api/posts-para-voce.test.ts
EXIT=135
Bus error (core dumped)
```

- **Memória disponível no sandbox:** 2048 MB total, 0 MB swap
- **Comportamento:** Vitest falha com `Bus error` (signal 7, SIGBUS) antes mesmo de emitir qualquer linha de output
- **Reproduzido também em `posts.test.ts` (teste existente)** — não é problema do código novo
- **Root cause:** Limite de memória do cloud sandbox, não bug no código nem nos tests

## Procedure vs Reality

| O que deveria acontecer | O que aconteceu |
|---|---|
| `vitest run` carrega setup, mocks, executa 5 describe blocks | `Bus error` durante carregamento |
| `expect(body.data.posts[0].id).toBe('p-combo')` valida ranking | Nunca chega no expect |
| Output colorizado com PASS/FAIL | Sem output (process morre antes) |

## Cobertura teórica (5 casos, ainda não validados runtime)

1. **Viewer sem tradições seguidas** → todos os posts score 0, ordem cronológica desc
2. **Viewer com tradições seguidas** → posts com `tradition` matching sobem no ranking
3. **Viewer anônimo** → fallback pro feed global (`filter=all`), sem chamar `groupMember`/`follow`
4. **Post em grupo seguido** → boost +5, mesmo sem match de tradição
5. **Score combinado** → tradição (+10) + grupo (+5) + like de seguido (+3) = 18, sempre primeiro

Pesos definidos em `RECOMMEND_WEIGHTS` (constante exportada de `posts.ts`):
```ts
TRADITION_MATCH: 10,
FOLLOWED_GROUP: 5,
FOLLOWED_AUTHOR_LIKE: 3,
```

## Changed Files

- `src/lib/community/posts.ts` — adicionado `getFeedPersonalized()` + `RECOMMEND_WEIGHTS`
- `src/lib/validators/posts.ts` — adicionado `filter` ao `FeedQuerySchema`
- `src/app/api/posts/route.ts` — handler para `filter=para-voce` com fallback
- `src/hooks/usePosts.ts` — `UseFeedOptions.filter` forward via query string
- `src/app/(community)/feed/page.tsx` — tab "Para você" + empty state customizado
- `__tests__/api/posts-para-voce.test.ts` — **NOVO**, 5 casos

## Próximos Passos

1. Rodar `pnpm test:run __tests__/api/posts-para-voce.test.ts` localmente (fora do sandbox)
2. Se algum caso falhar, ajustar scoring ou mocks e re-rodar
3. Validar integração manual: logar, seguir 1 grupo de tradição "cabala", criar post com tradição "cabala", confirmar que aparece no topo do filtro "Para você"