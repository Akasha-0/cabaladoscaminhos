# API — Posts

API REST para o feed de posts da comunidade Akasha. Persistida em PostgreSQL via Prisma. Suporta paginação cursor-based, likes, comentários encadeados e referências científicas.

## Visão geral

| Recurso     | Endpoint                              | Métodos        | Auth    |
|-------------|----------------------------------------|----------------|---------|
| Posts       | `/api/posts`                          | GET, POST      | POST autenticado |
| Post único  | `/api/posts/[id]`                     | GET, PATCH, DELETE | PATCH/DELETE autenticado |
| Like        | `/api/posts/[id]/like`                | POST           | Autenticado |
| Comentários | `/api/posts/[id]/comments`            | GET, POST      | POST autenticado |

### Envelope de resposta

Todos endpoints retornam um envelope padronizado:

```json
// Sucesso
{
  "data": { /* payload */ },
  "meta": {
    "timestamp": "2026-06-27T00:00:00.000Z",
    "nextCursor": "abc123" | null,
    "total": 123
  }
}

// Erro
{
  "error": {
    "code": 4002,
    "message": "Dados inválidos",
    "details": { /* opcional, ex: zod issues */ }
  },
  "meta": { "timestamp": "..." }
}
```

### Códigos de erro

| code | HTTP | Significado                   |
|------|------|-------------------------------|
| 4000 | 400  | Bad request                   |
| 4001 | 401  | Não autenticado               |
| 4002 | 400  | Erro de validação             |
| 4003 | 403  | Sem permissão                 |
| 4004 | 404  | Não encontrado                |
| 4029 | 429  | Rate limit excedido           |
| 5000 | 500  | Erro interno                  |

### Autenticação

Os endpoints autenticados leem o usuário atual via Supabase server client (`src/lib/supabase-server.ts`). Em ambiente dev/sem Supabase configurado, aceitamos o header `x-dev-user-id` para destravar a UI durante desenvolvimento e seeds.

```
GET /api/posts
x-dev-user-id: user-test
```

---

## GET /api/posts

Lista paginada do feed. Cursor-based pagination.

### Query params

| Param       | Tipo     | Default | Limite   | Descrição                                |
|-------------|----------|---------|----------|------------------------------------------|
| `cursor`    | string   | —       | —        | Cursor opaco (base64) da página anterior |
| `limit`     | number   | 20      | 1..50    | Tamanho da página                        |
| `tradition` | string   | —       | —        | Filtro por tradição (cabala, ifa, …)     |
| `topic`     | string   | —       | —        | Filtro por tópico                        |
| `authorId`  | string   | —       | —        | Posts de um autor específico             |
| `groupSlug` | string   | —       | —        | Posts dentro de um grupo                 |

### Exemplo

```bash
curl 'http://localhost:3000/api/posts?limit=10&tradition=cabala'
```

### Resposta

```json
{
  "data": {
    "posts": [
      {
        "id": "ckxxx",
        "author": {
          "id": "user-1",
          "handle": "user-1",
          "displayName": "Membro abc1"
        },
        "content": "Texto do post",
        "type": "TEXT",
        "tradition": "cabala",
        "topic": "meditacao",
        "groupName": null,
        "groupSlug": null,
        "mediaUrls": [],
        "references": [],
        "likesCount": 5,
        "commentsCount": 2,
        "sharesCount": 0,
        "liked": false,
        "bookmarked": false,
        "createdAt": "2026-06-27T00:00:00.000Z",
        "updatedAt": "2026-06-27T00:00:00.000Z"
      }
    ],
    "nextCursor": "eyJ0IjoiMjAyNi0wNi0yN1QwMDowMDowMC4wMDBaIiwiaSI6ImNreHh4In0",
    "total": 47
  },
  "meta": {
    "timestamp": "2026-06-27T00:00:00.000Z",
    "nextCursor": "eyJ0Ijoi...",
    "total": 47,
    "count": 1
  }
}
```

---

## POST /api/posts

Cria um novo post. **Requer autenticação.** Rate limit: 10 posts/min por usuário.

### Body

```json
{
  "content": "Texto do post (1-4000 chars)",
  "type": "TEXT" | "LINK" | "ARTICLE" | "QUESTION" | "EXPERIENCE" | "PRACTICE",
  "tradition": "cabala" | null,
  "topic": "meditacao" | null,
  "groupSlug": "cabala" | null,
  "mediaUrls": ["https://..."],
  "references": [
    { "title": "Paper X", "url": "https://...", "doi": "10...", "year": 2024 }
  ],
  "mentions": ["cabala", "ifa"]
}
```

### Exemplo

```bash
curl -X POST http://localhost:3000/api/posts \
  -H 'Content-Type: application/json' \
  -H 'x-dev-user-id: user-test' \
  -d '{
    "content": "Primeiro post via API",
    "type": "TEXT",
    "tradition": "cabala"
  }'
```

### Resposta (201 Created)

```json
{
  "data": { /* Post object */ },
  "meta": { "timestamp": "..." }
}
```

### Erros

- `400 Validation` — content vazio, > 4000 chars, type inválido, etc
- `401 Unauthorized` — sem autenticação
- `429 Rate limit` — 10 posts/min excedido

---

## GET /api/posts/[id]

Detalhe de um post.

```bash
curl http://localhost:3000/api/posts/ckxxx
```

Resposta: `{ "data": { ...post... }, "meta": {...} }`. Retorna 404 se o post não existe ou foi deletado.

---

## PATCH /api/posts/[id]

Atualiza campos do post. **Requer auth + ser o autor.**

### Body

Mesmos campos do POST, todos opcionais.

### Erros

- `403 Forbidden` — usuário não é o autor
- `404 Not Found` — post não existe
- `400 Validation` — dados inválidos

---

## DELETE /api/posts/[id]

Soft delete (campo `deletedAt` populado). **Requer auth + ser o autor.**

```bash
curl -X DELETE http://localhost:3000/api/posts/ckxxx \
  -H 'x-dev-user-id: user-test'
```

Resposta: `{ "data": { "deleted": true }, "meta": {...} }`.

---

## POST /api/posts/[id]/like

Toggle like do post. Cria se não existe, remove se existe.

```bash
curl -X POST http://localhost:3000/api/posts/ckxxx/like \
  -H 'x-dev-user-id: user-test'
```

### Resposta

```json
{
  "data": {
    "liked": true,
    "likesCount": 6
  },
  "meta": { "timestamp": "..." }
}
```

---

## GET /api/posts/[id]/comments

Lista comentários paginados.

### Query

| Param      | Tipo   | Default | Limite |
|------------|--------|---------|--------|
| `cursor`   | string | —       | —      |
| `limit`    | number | 20      | 1..100 |
| `parentId` | string | null    | —      |

```bash
curl http://localhost:3000/api/posts/ckxxx/comments?limit=20
```

---

## POST /api/posts/[id]/comments

Cria comentário. **Requer auth.**

### Body

```json
{
  "content": "Comentário (1-2000 chars)",
  "parentId": "ckyyy" | null
}
```

---

## Modelos Prisma

Modelos relevantes (`prisma/schema.prisma`):

```prisma
model Post {
  id        String   @id @default(cuid())
  authorId  String
  content   String
  type      PostType @default(TEXT)
  tradition String?
  topic     String?
  mediaUrls String[]
  linkUrl   String?
  references Json?
  groupId   String?
  group     Group?
  likesCount    Int @default(0)
  commentsCount Int @default(0)
  sharesCount   Int @default(0)
  comments Comment[]
  likes    Like[]
  deletedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Comment {
  id        String @id @default(cuid())
  postId    String
  post      Post
  authorId  String
  content   String
  parentId  String?
  parent    Comment?
  replies   Comment[]
  likesCount Int @default(0)
  likes      CommentLike[]
  deletedAt  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Like {
  userId    String
  postId    String
  post      Post
  createdAt DateTime @default(now())
  @@id([userId, postId])
}
```

---

## Hooks de cliente

`src/hooks/usePosts.ts` expõe:

| Hook            | Função                                              |
|-----------------|-----------------------------------------------------|
| `useFeed`       | Lista paginada + cursor + refresh + loadMore        |
| `useCreatePost` | Cria novo post (otimistic prepend)                  |
| `useLikePost`   | Toggle like com atualização otimista + rollback     |
| `useDeletePost` | Soft delete com remoção otimista                    |
| `useUpdatePost` | PATCH parcial                                       |
| `useComments`   | Lista de comentários com paginação                  |

### Exemplo de uso

```tsx
'use client';

import { useFeed, useLikePost } from '@/hooks/usePosts';

export function MyFeed() {
  const feed = useFeed({ limit: 20 });
  const { toggleLike } = useLikePost(feed);

  if (feed.loading) return <Skeleton />;
  if (feed.error) return <Error onRetry={feed.refresh} />;

  return (
    <>
      {feed.posts.map((p) => (
        <PostCard key={p.id} post={p} onLike={toggleLike} />
      ))}
      {feed.hasMore && <button onClick={feed.loadMore}>Carregar mais</button>}
    </>
  );
}
```

---

## Server Actions

`src/app/actions/posts.ts` — mutações que podem ser chamadas direto de Client Components (sem precisar fazer `fetch`).

```tsx
'use client';
import { createPostAction, toggleLikeAction } from '@/app/actions/posts';

const r = await createPostAction({ content: 'oi', type: 'TEXT' });
if (r.ok) console.log(r.data);
```

Todas as actions revalidam `/feed` automaticamente após mutação.

---

## Seed de desenvolvimento

```bash
pnpm seed:posts
# ou
tsx prisma/seed/posts.ts
```

Cria 3 grupos (`cabala`, `ifa`, `xamanismo`) e 20 posts variados com 5 tradições e autores `seed-author-1..8`. Idempotente: limpa posts seed antes de inserir.

---

## Rate limit

Implementação in-memory em `src/lib/community/rate-limit.ts`. Chave = `post:<userId>`. Limite padrão: 10 requests / 60s. Para produção, substituir por Redis (já temos `ioredis` instalado).

```ts
import { checkPostRateLimit } from '@/lib/community/rate-limit';

const result = checkPostRateLimit(userId);
if (!result.allowed) {
  // 429 Too Many Requests
}
```