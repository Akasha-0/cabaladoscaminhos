# DELIVERABLE W14 — Post Bookmarks + Reading History

**Data:** 2026-06-27 19:31 UTC
**Agente:** Coder
**Branch:** main
**Tarefa:** Bookmark posts (com collections) + histórico pessoal de leitura
**Tempo alvo:** 15 min · **Status:** ✅ Arquivos entregues · ⚠️ Commit pendente (env travou)

---

## 1. Schema (`prisma/schema.prisma`)

Adicionados **2 novos models** (não há colisão com `Bookmark` existente, que é para `Article` da Biblioteca):

### `PostBookmark` → `post_bookmarks`
- `id` (cuid), `userId`, `postId`, `collectionName` (default `'default'`), `createdAt`
- `@@unique([userId, postId, collectionName])` — toggle idempotente
- Indexes: `(userId, collectionName, createdAt)`, `(userId, createdAt)`, `(postId)`

### `ReadingHistory` → `reading_history`
- `id` (cuid), `userId`, `postId`, `percentRead` (default 0), `readAt`, `createdAt`
- `@@unique([userId, postId])` — upsert idempotente
- Indexes: `(userId, readAt)`, `(postId)`

**Decisão de naming:** mantido `PostBookmark` (não `Bookmark`) para não colidir com o model `Bookmark` já existente, que é específico para `Article` da Biblioteca Akasha. Mesma justificativa do README do schema.

---

## 2. Migration (`prisma/migrations/20260627_030000_post_bookmarks_reading_history/migration.sql`)

Idempotente (usa `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` / `DROP INDEX IF EXISTS`):
- `CREATE TABLE post_bookmarks` + UNIQUE constraint + 3 indexes + FK para `posts` (CASCADE)
- `CREATE TABLE reading_history` + UNIQUE constraint + 2 indexes + FK para `posts` (CASCADE)
- Bloco de verificação final (`RAISE NOTICE`) confirmando que ambas tabelas existem

Padrão consistente com migrations Wave 13 (`20260627_020000_events`, `20260627_comments_w13`).

---

## 3. Backend helpers (`src/lib/community/bookmarks.ts`)

Funções exportadas:
- `togglePostBookmark({userId, postId, collectionName})` → `{bookmarked, collectionName}`
- `removePostBookmark(...)` → `{removed, collectionName}` (idempotente)
- `listPostBookmarks({userId, collectionName?, limit?})` → `{items, collections: [{name, count}], total}`
- `trackPostRead({userId, postId, percentRead?})` → upsert com regra **percentRead monotônico** (nunca regride)
- `listReadingHistory({userId, limit?})` → `{items, total}`

Detalhes:
- `collectionName` é normalizado (trim, lowercase, max 60 chars) — vazio → `'default'`
- `percentRead` clampado em [0, 100], arredondado
- `limit` clampado em [1, 100], default 30
- Cache local em `getBookmarksForViewer` evita N+1 no feed (1 query batch por usuário)

---

## 4. Mudança em `src/lib/community/posts.ts`

- `postToDto(post, viewerId)` agora é **async** (busca estado de bookmark)
- Adicionado helper `getBookmarksForViewer()` com cache in-memory por userId (evita N+1)
- `createPost`, `updatePost` agora fazem `await postToDto(...)` (era síncrono)
- `getFeed` e `getFeedPersonalized` agora usam `Promise.all(slice.map(p => postToDto(p, viewerId)))` — paraleliza, ainda mais rápido que o loop sequencial

---

## 5. API Endpoints (5 routes)

| # | Método | Path | Auth | Body / Query | Status |
|---|--------|------|------|--------------|--------|
| 1 | POST | `/api/posts/[id]/bookmark` | ✅ | `{collectionName?}` | toggle, retorna `{bookmarked, collectionName}` |
| 2 | DELETE | `/api/posts/[id]/bookmark` | ✅ | `{collectionName?}` | remove idempotente, retorna `{removed, collectionName}` |
| 3 | GET | `/api/users/me/bookmarks` | ✅ | `?collection=X&limit=N` | `{items, collections, total}` |
| 4 | POST | `/api/posts/[id]/read` | ✅ | `{percentRead: 0-100}` | upsert, retorna `{postId, percentRead, readAt}` |
| 5 | GET | `/api/users/me/history` | ✅ | `?limit=N` | `{items, total}` |

**Padrão de resposta:** envelope `{data, meta}` via `ok()` helper (consistente com o resto do projeto).
**Rate limit:** aplicado via `checkUserRateLimit(viewer.id, 'like')` (200/h — generous para tracking contínuo de leitura).
**Erros:** 401 (sem auth), 404 (post não existe/deletado), 429 (rate limit), 400 (JSON inválido), 500 (interno).

---

## 6. Componentes (4)

### `src/components/community/BookmarkButton.tsx`
- **Standalone** — recebe `postId` + `bookmarked` inicial, gerencia estado próprio
- **Optimistic flip** com rollback em erro
- Usa `Bookmark` / `BookmarkCheck` (lucide-react) + `Loader2` no pending
- `aria-pressed` + `aria-label` (i18n via prop) + `title` contextual
- 44px touch target (sm e md)
- Aciona `onChange?(bookmarked)` após confirmação do servidor

### `src/components/community/ReadProgressBar.tsx`
- **Sticky no topo** do article (default) ou fixed (opcional)
- Calcula `percentRead` via `getBoundingClientRect` do `<article data-post-content>`
- `requestAnimationFrame` para throttling do scroll handler
- Throttle de tracking: só faz POST a cada **5%** de progresso (≥10% para começar)
- `keepalive: true` no fetch (tracking não bloqueia navegação)
- Cleanup ping 100% no unmount (última leitura completa)
- ARIA: `role="progressbar"` + `aria-valuenow/min/max` + `aria-label`

---

## 7. Páginas (2)

### `src/app/(community)/me/bookmarks/page.tsx`
- Lista os posts salvos do usuário
- **Sidebar de collections** (chips horizontais, mobile-first com `overflow-x-auto`)
- Filtro por collection (null = "Todas")
- Estado vazio com CTA para o feed
- Otimisticamente remove item ao desfavoritar
- Erro 401/429/etc com retry button (44px)

### `src/app/(community)/me/history/page.tsx`
- Lista leituras recentes, ordenadas por `readAt desc`
- Cada item mostra preview + **barra de progresso** (% lido)
- Estado vazio com CTA para o feed
- Mobile-first: cards compactos, line-clamp de 4 linhas no preview

---

## 8. Integração em código existente

### `src/components/community/PostCard.tsx`
- Removido import `Bookmark` (lucide) — agora usa o novo `BookmarkButton`
- Adicionado import `BookmarkButton`
- Substituído o `<button onClick={onBookmark}>` inline pelo `<BookmarkButton postId={...} bookmarked={...} size="sm" onChange={...} />`
- Mantido o prop `onBookmark?: (id: string) => void` no PostCard para back-compat (chamado dentro de `onChange` para tracking/analytics no parent)

### `src/app/(community)/post/[id]/page.tsx`
- Adicionado import `ReadProgressBar`
- Inserido `<ReadProgressBar postId={postId} articleSelector="article[data-post-content]" mode="sticky" />` no topo do `<main>`
- Envolvido o `<PostCard>` com `<article data-post-content>` (mede progresso do conteúdo do post)

### `src/app/api/posts/[id]/route.ts`
- Adicionado `await` em `return ok(await postToDto(post, viewer?.id ?? null))` (era sync)

---

## 9. Verificação

### TSC
- **NÃO executado** — `npx tsc --noEmit` travou após 120s no sandbox (regra: skip + documenta se trava)
- Mudanças críticas com `await` foram revisadas manualmente: `postToDto` agora é async e todos os callers foram atualizados (route.ts, posts.ts, bookmarks.ts)

### Testes existentes
- `__tests__/community/posts-likes.test.ts` cobre apenas `toggleLike` (não toca em `postToDto`) — **não deve quebrar**
- `__tests__/community/groups.test.ts` — não relacionado
- Não foram adicionados testes nesta onda (escopo era 15min)

### Padrão
- Mobile-first ✓ (44px touch targets em todos os botões)
- Acessibilidade ✓ (aria-pressed, aria-label, role=progressbar, aria-valuenow)
- Idempotência ✓ (UNIQUE constraints + upsert + remove idempotente)
- i18n-ready ✓ (labels via props, sem hardcoded PT-BR onde impacta UX)
- Sem libs novas ✓
- Sem push ✓

---

## 10. Commit

- **Mensagem preparada:** `feat(posts): bookmarks + reading history`
- **Status:** ⚠️ **NÃO CONCLUÍDO** — `git add -A` travou repetidamente no sandbox (timeouts de 30s+120s+180s em cada tentativa, sem progress visível). Nenhum lock file deixado para trás (`.git/index.lock` não existe).
- **Workaround:** executar localmente:
  ```bash
  cd /workspace/cabaladoscaminhos
  git add prisma/schema.prisma \
          prisma/migrations/20260627_030000_post_bookmarks_reading_history/migration.sql \
          src/lib/community/bookmarks.ts \
          src/lib/community/posts.ts \
          src/app/api/posts/[id]/bookmark/route.ts \
          src/app/api/posts/[id]/read/route.ts \
          src/app/api/users/me/bookmarks/route.ts \
          src/app/api/users/me/history/route.ts \
          src/app/api/posts/[id]/route.ts \
          src/components/community/BookmarkButton.tsx \
          src/components/community/ReadProgressBar.tsx \
          src/components/community/PostCard.tsx \
          "src/app/(community)/me/bookmarks/page.tsx" \
          "src/app/(community)/me/history/page.tsx" \
          "src/app/(community)/post/[id]/page.tsx"
  git commit -m "feat(posts): bookmarks + reading history

  - Schema: PostBookmark (collections) + ReadingHistory
  - 5 API endpoints: bookmark toggle/list/delete, read track, history
  - BookmarkButton (optimistic), ReadProgressBar (sticky)
  - Pages: /me/bookmarks, /me/history
  - postToDto agora async (busca bookmarked state com cache anti-N+1)"
  ```

---

## 11. Arquivos criados / modificados

### Criados (9)
- `prisma/migrations/20260627_030000_post_bookmarks_reading_history/migration.sql`
- `src/lib/community/bookmarks.ts`
- `src/app/api/posts/[id]/bookmark/route.ts`
- `src/app/api/posts/[id]/read/route.ts`
- `src/app/api/users/me/bookmarks/route.ts`
- `src/app/api/users/me/history/route.ts`
- `src/components/community/BookmarkButton.tsx`
- `src/components/community/ReadProgressBar.tsx`
- `src/app/(community)/me/bookmarks/page.tsx`
- `src/app/(community)/me/history/page.tsx`
- `DELIVERABLE-W14-BOOKMARKS-HISTORY.md` (este)

### Modificados (4)
- `prisma/schema.prisma` (+2 models)
- `src/lib/community/posts.ts` (postToDto async, callers atualizados)
- `src/app/api/posts/[id]/route.ts` (await postToDto)
- `src/components/community/PostCard.tsx` (BookmarkButton no lugar do botão inline)
- `src/app/(community)/post/[id]/page.tsx` (ReadProgressBar + wrapper `<article data-post-content>`)

**Total: 10 criados + 5 modificados = 15 arquivos**
