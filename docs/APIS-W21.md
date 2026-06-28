# Akasha Portal — APIs Wave 21 (P0 Critical Fix 2/6)

> **Data:** 2026-06-28
> **Wave:** 21 — P0 CRITICAL FIX 2/6 (4 APIs faltantes identificadas no audit W19)
> **Status:** ✅ Implementadas (pendente `prisma migrate` + `prisma generate`)

Esta onda entrega **7 endpoints** (3 novos + 3 helpers + 1 método adicional em endpoint existente) cobrindo:

1. **Biblioteca Akasha** — listagem e detalhe de artigos
2. **Social Graph** — follow/unfollow + listas de followers/following
3. **Reading Progress** — "continue de onde parou"

---

## Sumário dos endpoints

| # | Método | Endpoint | Auth | Status | Cache |
|---|--------|----------|------|--------|-------|
| 1 | GET | `/api/articles` | público | ✅ novo | s-maxage=60, swr=300 |
| 2 | GET | `/api/articles/[slug]` | público | ✅ novo | s-maxage=300, swr=600 |
| 3 | POST | `/api/articles/[slug]/read-progress` | autenticado | ✅ novo | no-store |
| 4 | POST | `/api/users/[id]/follow` | autenticado | ✅ já existia (toggle) | no-store |
| 5 | DELETE | `/api/users/[id]/follow` | autenticado | ✅ novo (idempotente) | no-store |
| 6 | GET | `/api/users/[id]/followers` | semi-público* | ✅ novo | no-store |
| 7 | GET | `/api/users/[id]/following` | semi-público* | ✅ novo | no-store |

\* Semi-público: regras de privacidade via `SpiritualProfile.visibility` (PUBLIC/COMMUNITY/PRIVATE).

---

## 1. GET /api/articles

Lista artigos da Biblioteca Akasha com filtros ricos.

### Query params

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `q` | string | — | Full-text search (portuguese, Wave 18) + trigram fallback |
| `tradition` | string | — | Slug canônico (cabala, ifa, tantra, xamanismo, ...) |
| `tag` | string | — | Match em `tags[]` (has) |
| `level` | enum | — | `ANECDOTAL` \| `LOW` \| `MEDIUM` \| `HIGH` |
| `format` | enum | — | `SCIENTIFIC_PAPER` \| `MAGAZINE_ARTICLE` \| `BOOK` \| `VIDEO` \| `PODCAST` \| `ESSAY` |
| `author` | string | — | Author name (has em `authors[]`) |
| `yearFrom` | int | — | Ano mínimo (publicação) |
| `yearTo` | int | — | Ano máximo |
| `cursor` | string | — | Cursor base64 da página anterior |
| `limit` | int | 20 | 1..50 |
| `sort` | enum | `recent` | `recent` \| `popular` \| `most-viewed` \| `most-bookmarked` \| `most-cited` |

### Resposta

```json
{
  "data": {
    "articles": [
      {
        "id": "ck...",
        "slug": "mbsr-meta-analysis-2019",
        "title": "MBSR Meta-Analysis (2019)",
        "summary": "Revisão sistemática de 38 RCTs...",
        "authors": ["Khoury B", "Shannon M", "Vanderboom M"],
        "journal": "Journal of Psychosomatic Research",
        "year": 2019,
        "doi": "10.1016/j.jpsychores.2019.01.001",
        "url": "https://doi.org/10.1016/...",
        "tags": ["mbsr", "meditacao", "meta-analysis"],
        "tradition": "meditacao",
        "evidenceLevel": "HIGH",
        "type": "SCIENTIFIC_PAPER",
        "language": "en",
        "citations": 142,
        "viewCount": 2841,
        "bookmarkCount": 87,
        "likesCount": 312,
        "publishedAt": "2019-03-15T00:00:00.000Z",
        "createdAt": "2026-06-15T12:34:56.000Z",
        "readingTimeMinutes": 12
      }
    ],
    "nextCursor": "eyJpZCI6ImNrLi4uIiwidiI6MTcxODM0MDAwMDAwMH0",
    "total": 312
  },
  "meta": {
    "timestamp": "...",
    "nextCursor": "...",
    "total": 312,
    "count": 20
  }
}
```

### Comportamento

- **Sem `q`**: usa filtros Prisma nativos + ordenação. Mais barato.
- **Com `q`**: usa `searchVector tsvector` (portuguese) + fallback trigram.
  Termo é sanitizado (remove chars especiais perigosos) e montado como
  `palavra1 & palavra2 & ...` (AND lógico).
- **Cursor**: `base64url({id, v})` onde `v` é o valor de ordenação
  secundário (`createdAt epoch ms`, `viewCount`, etc).
- **Cache**: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.

### Erros

- `400 VALIDATION_ERROR` — query params inválidos
- `500 INTERNAL_ERROR` — erro inesperado

---

## 2. GET /api/articles/[slug]

Detalhe completo de um artigo + related articles.

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `slug` | string | Slug canônico do artigo (ex: `mbsr-meta-analysis-2019`) |

### Resposta

```json
{
  "data": {
    "id": "ck...",
    "slug": "mbsr-meta-analysis-2019",
    "title": "MBSR Meta-Analysis (2019)",
    "summary": "...",
    "content": "# Conteúdo completo em markdown...",
    "authors": ["Khoury B", "Shannon M"],
    "journal": "...",
    "year": 2019,
    "doi": "...",
    "url": "...",
    "references": [{"title": "...", "doi": "...", "year": 2018}],
    "tags": ["mbsr", "meditacao"],
    "topics": ["mbsr", "meditacao"],
    "tradition": "meditacao",
    "evidenceLevel": "HIGH",
    "type": "SCIENTIFIC_PAPER",
    "language": "en",
    "citations": 142,
    "viewCount": 2842,
    "bookmarkCount": 87,
    "likesCount": 312,
    "contributor": "seed-bot@akasha",
    "curatedBy": "user_abc123",
    "source": "openalex-id-W123",
    "publishedAt": "2019-03-15T00:00:00.000Z",
    "createdAt": "2026-06-15T...",
    "updatedAt": "2026-06-20T...",
    "readingTimeMinutes": 18,
    "relatedArticles": [ /* até 5 artigos da mesma tradição */ ]
  },
  "meta": { "slug": "...", "viewCount": 2842 }
}
```

### Comportamento

- **viewCount++ em background** (fire-and-forget) — não bloqueia a response.
- **relatedArticles**: top 5 artigos da mesma tradição, ordenados por
  `viewCount DESC`.
- **readingTimeMinutes**: estimativa baseada em `content` (200 palavras/min).
- **Cache**: `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.

### Erros

- `400 BAD_REQUEST` — slug ausente
- `404 NOT_FOUND` — artigo não encontrado

---

## 3. POST /api/articles/[slug]/read-progress

Salva progresso pessoal de leitura ("continue de onde parou").

### Auth

🔒 Requer login (`requireViewer()`).

### Body

```json
{
  "percentRead": 65,
  "lastPosition": "paragraph-12"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `percentRead` | int 0..100 | sim | Porcentagem lida (clamp na API) |
| `lastPosition` | string | não | Posição livre (índice do parágrafo, scroll offset, etc). Máx 200 chars. |

### Resposta (200)

```json
{
  "data": {
    "articleId": "ck...",
    "percentRead": 65,
    "lastPosition": "paragraph-12",
    "completedAt": null,
    "readAt": "2026-06-28T01:52:34.000Z",
    "updatedAt": "2026-06-28T01:52:34.000Z"
  },
  "meta": { "timestamp": "..." }
}
```

### Comportamento idempotente

- **Upsert** por `(userId, articleId)` via `@@unique`.
- **`percentRead` é monotônico**: nunca regredimos. Se o cliente enviar
  `percentRead=20` e o registro já tem `percentRead=65`, mantemos `65`.
- **`completedAt`**: setado uma única vez, na primeira vez que atinge `100%`.
- **`readAt`**: atualizado em cada save (permite ordenação "continue de onde parou").
- **Sem rate limit específico** — operação barata (1 upsert).

### Erros

- `400 BAD_REQUEST` — JSON inválido / schema inválido
- `401 UNAUTHORIZED` — sem login
- `404 NOT_FOUND` — artigo não encontrado

---

## 4. POST /api/users/[id]/follow (existente — toggle)

> Já existia na Wave 11. Mantido **sem alterações** — atende o requisito
> "Toggle (se já segue, deixa de seguir)".

### Auth

🔒 Requer login. Rate limit: 50/h por user (`'follow'` bucket).

### Comportamento

- **Toggle**: se já existe follow → deleta; senão → cria.
- **Notificação** para o seguido quando o follow é criado (`type=FOLLOW`).
- Retorna `{ following: boolean, followersCount: number }`.

---

## 5. DELETE /api/users/[id]/follow (novo — idempotente)

Diferente do POST (que é toggle), este método **sempre remove** o follow.

### Auth

🔒 Requer login. Rate limit: 50/h por user (`'follow'` bucket).

### Resposta (200)

```json
{
  "data": {
    "removed": true,
    "following": false,
    "followersCount": 312
  },
  "meta": { "timestamp": "..." }
}
```

Se o follow não existir: `{ removed: false, following: false, followersCount: N }`.

### Comportamento

- **Idempotente**: múltiplos DELETE retornam o mesmo resultado.
- **Erros**:
  - `400 BAD_REQUEST` — self-follow
  - `401 UNAUTHORIZED` — sem login
  - `429 RATE_LIMIT_EXCEEDED` — excedeu 50/h

---

## 6. GET /api/users/[id]/followers

Lista os seguidores do user (quem segue `id`).

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID do user alvo |

### Query params

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `cursor` | string | — | Cursor base64 da página anterior |
| `limit` | int | 30 | 1..100 |

### Privacy (Wave 21 — Caio)

Baseado em `SpiritualProfile.visibility`:

| Visibility | Quem pode ver |
|------------|---------------|
| `PUBLIC` | qualquer pessoa (mesmo sem login) |
| `COMMUNITY` | só usuários logados |
| `PRIVATE` | só o próprio dono |
| sem SpiritualProfile | só o próprio dono (conservador) |

### Resposta (200)

```json
{
  "data": {
    "users": [
      {
        "userId": "ck...",
        "displayName": "Maria Silva",
        "bio": "Curiosa da Cabala...",
        "avatarUrl": null,
        "tradition": "cabala",
        "followedAt": "2026-06-15T..."
      }
    ],
    "nextCursor": "eyJ...",
    "total": 312
  },
  "meta": { "targetUserId": "...", "nextCursor": "...", "total": 312, "count": 30 }
}
```

### Erros

- `400 BAD_REQUEST` — id ausente
- `403 FORBIDDEN` — lista privada (mensagem genérica)
- `401` — implícito se COMMUNITY sem login (mas retorna 403 para não vazar)

---

## 7. GET /api/users/[id]/following

Lista quem `id` segue (mesmo shape que `/followers`).

Mesmas regras de privacidade.

---

## Schema — Migration necessária

A model `ArticleReadingProgress` foi adicionada ao schema.prisma.

**Aplicar migration:**

```bash
cd /workspace/cabaladoscaminhos
psql $DATABASE_URL -f prisma/migrations/20260628_000000_article_reading_progress/migration.sql
npx prisma generate
```

> O arquivo `migration.sql` é idempotente (usa `CREATE TABLE IF NOT EXISTS`).

### Estrutura da tabela

```sql
article_reading_progress (
  id              TEXT PRIMARY KEY,
  userId          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  articleId       TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  percentRead     INTEGER NOT NULL DEFAULT 0,
  lastPosition    TEXT,
  completedAt     TIMESTAMP(3),
  readAt          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (userId, articleId)
);
```

---

## Helpers de domínio

### `src/lib/community/articles.ts`

- `listArticles(q)` — listagem com filtros
- `getArticleBySlug(slug)` — detalhe + related
- `incrementArticleView(id)` — view++ background
- `saveReadingProgress(input)` — upsert idempotente
- `getReadingProgress(userId, articleId)` — fetch

### `src/lib/community/follow.ts`

- `listFollowers({targetUserId, cursor, limit})`
- `listFollowing({targetUserId, cursor, limit})`
- `canViewFollowList(targetUserId, viewerId)` — privacy check
- `unfollowUser({followerId, followedId})` — idempotente

### `src/lib/validators/articles.ts`

- `ArticleListQuerySchema` — query params de listagem
- `ReadProgressSchema` — body de read-progress
- `FollowListQuerySchema` — query params de followers/following

---

## Validações implementadas

### Auth

Todos endpoints de mutação chamam `requireViewer()`:
- `POST /api/articles/[slug]/read-progress`
- `POST /api/users/[id]/follow`
- `DELETE /api/users/[id]/follow`

### Rate limit (por user autenticado)

| Endpoint | Action key | Limite |
|----------|-----------|--------|
| `POST /follow` | `follow` | 50/h |
| `DELETE /follow` | `follow` | 50/h |
| `POST /read-progress` | (sem rate limit — operação barata) | — |

### Cache headers (Wave 11 perf pattern)

| Endpoint | Cache-Control |
|----------|---------------|
| `GET /api/articles` | `public, s-maxage=60, stale-while-revalidate=300` |
| `GET /api/articles/[slug]` | `public, s-maxage=300, stale-while-revalidate=600` |
| `POST /api/articles/[slug]/read-progress` | `no-store` |
| `POST/DELETE /api/users/[id]/follow` | `no-store` |
| `GET /api/users/[id]/followers` | `no-store` |
| `GET /api/users/[id]/following` | `no-store` |

---

## Limitações conhecidas

1. **Migration não foi aplicada** — o sandbox bloqueia `psql`/`prisma migrate`.
   O usuário (ou follow-up session) precisa aplicar manualmente:
   ```bash
   psql $DATABASE_URL -f prisma/migrations/20260628_000000_article_reading_progress/migration.sql
   npx prisma generate
   ```

2. **Sem testes automatizados** — o time-box de 25min priorizou implementação.
   Testes de integração (vitest) são recomendados como follow-up:
   - `tests/api/articles-list.spec.ts`
   - `tests/api/articles-detail.spec.ts`
   - `tests/api/read-progress.spec.ts`
   - `tests/api/follow.spec.ts`
   - `tests/api/followers.spec.ts`

3. **Display names** — `FollowUserDto.displayName` usa `SpiritualProfile.birthName`.
   Se o profile não tiver birthName, retorna `null` (UI deve mostrar fallback).
   `avatarUrl` é sempre `null` no MVP — pode ser preenchido via Supabase Storage.

4. **Sem follower count denormalizado no User** — cada listagem faz um COUNT().
   Para escalas grandes (>10k followers), considerar denormalizar via trigger.

---

## Próximos passos sugeridos

1. Aplicar migration + gerar Prisma Client
2. Testes de integração (vitest + Playwright)
3. Adicionar `users_count` denormalizado no `SpiritualProfile`
4. UI components: `<ArticleList />`, `<ArticleDetail />`, `<FollowButton />`,
   `<FollowersList />`, `<ReadingProgressBar />`
5. Webhook realtime: notificar o seguido via WebSocket (Realtime Channel)
6. Cron: arquivar artigos com `viewCount=0` e `createdAt > 1y`