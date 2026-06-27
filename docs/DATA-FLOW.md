# Data Flow — Posts (UI → Action → Prisma → UI)

Este documento descreve como os dados de posts fluem pela stack. Mostra o caminho completo de uma criação de post e de um like, ilustrando a separação entre Client Components, Hooks, Server Actions, API Routes e a camada Prisma.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Browser (React 19 + Next.js 16 App Router)                              │
│                                                                          │
│  ┌────────────────────┐    ┌────────────────────────────────────────┐    │
│  │  CreatePost.tsx    │    │  feed/page.tsx                          │    │
│  │  (Client)          │    │  (Client Component)                     │    │
│  │                    │    │                                          │    │
│  │  • valida Zod      │    │  usa: useFeed, useLikePost, useDeletePost│    │
│  │  • submit          │    │                                          │    │
│  └────────┬───────────┘    └─────────┬───────────────────────────────┘    │
│           │ onCreate                 │                                      │
│           ▼                          ▼                                      │
│  ┌──────────────────────────────────────────────────────┐                │
│  │  Hooks (src/hooks/usePosts.ts)                        │                │
│  │                                                       │                │
│  │  • useFeed      → fetch /api/posts?cursor=X           │                │
│  │  • useCreatePost → fetch POST /api/posts             │                │
│  │  • useLikePost  → fetch POST /api/posts/[id]/like    │                │
│  │  • useDeletePost → fetch DELETE /api/posts/[id]      │                │
│  │                                                       │                │
│  │  • Atualização otimista (UI antes do servidor)        │                │
│  │  • Rollback em caso de erro                           │                │
│  └─────────────────────┬────────────────────────────────┘                │
│                        │                                                    │
└────────────────────────┼────────────────────────────────────────────────────┘
                         │ HTTP / JSON
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Server (Next.js Route Handlers + Server Actions)                         │
│                                                                          │
│  ┌───────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │  /api/posts/route.ts          │   │  src/app/actions/posts.ts      │  │
│  │  /api/posts/[id]/route.ts     │   │  (Server Actions)               │  │
│  │  /api/posts/[id]/like/route.ts│   │                                 │  │
│  │  /api/posts/[id]/comments/... │   │  • createPostAction             │  │
│  │                               │   │  • updatePostAction             │  │
│  │  • Zod validation             │   │  • deletePostAction             │  │
│  │  • Auth via Supabase server   │   │  • toggleLikeAction             │  │
│  │  • Rate limit (10/min)        │   │  • createCommentAction          │  │
│  │  • revalidatePath('/feed')    │   │  • getFeedServer                │  │
│  └────────┬──────────────────────┘   └────────┬────────────────────────┘  │
│           │                                  │                            │
│           └──────────────┬───────────────────┘                            │
│                          ▼                                                │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  src/lib/community/posts.ts (Camada de Domínio)                    │  │
│  │                                                                     │  │
│  │  • postToDto       — Prisma Post → API DTO                         │  │
│  │  • getFeed         — query com cursor pagination                   │  │
│  │  • createPost      — INSERT com denormalização de groupSlug → id    │  │
│  │  • updatePost      — UPDATE com ownership check                    │  │
│  │  • deletePost      — soft delete (deletedAt = now)                 │  │
│  │  • toggleLike      — INSERT/DELETE + UPDATE likesCount             │  │
│  │  • listComments    — query com cursor                              │  │
│  │  • createComment   — INSERT + UPDATE commentsCount                 │  │
│  │                                                                     │  │
│  │  Errors tipados: PostNotFoundError, PostForbiddenError, …          │  │
│  └────────────────────────┬───────────────────────────────────────────┘  │
│                           ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  src/lib/community/auth.ts                                          │  │
│  │                                                                     │  │
│  │  • getViewer / requireViewer                                        │  │
│  │  • Lê usuário do Supabase (cookies server-side)                     │  │
│  │  • Fallback dev: header x-dev-user-id                               │  │
│  └────────────────────────┬───────────────────────────────────────────┘  │
│                           ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  src/lib/prisma.ts                                                  │  │
│  │                                                                     │  │
│  │  • Singleton PrismaClient + PrismaPg adapter                       │  │
│  │  • Pool PG (max 5 conn, idle 10s)                                  │  │
│  └────────────────────────┬───────────────────────────────────────────┘  │
│                           ▼                                               │
└───────────────────────────┼──────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL                                                              │
│                                                                          │
│  Tabelas: posts, comments, likes, groups, users, follows,                │
│           spiritual_profiles, notifications, etc.                       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Fluxo detalhado — Criar um post

```
1. USER clica em "Publicar" no CreatePost.tsx
   └─► handleSubmit()
       └─► Zod safeParse({ content, type, tradition, topic })
           └─► onCreate(input) (callback do feed/page.tsx)
               └─► createPost(input) do useCreatePost hook
                   └─► fetch POST /api/posts
                       └─► route handler em src/app/api/posts/route.ts
                           ├─► requireViewer() — pega user do Supabase
                           ├─► checkPostRateLimit(userId)
                           ├─► Zod safeParse do body
                           ├─► createPost() em src/lib/community/posts.ts
                           │   ├─► prisma.group.findUnique({slug}) → groupId
                           │   └─► prisma.post.create({...}) → row
                           ├─► postToDto(row, viewerId) → DTO
                           └─► ok({ data: post }, { status: 201 })
                       └─► Resposta JSON { data, meta }
                   └─► on success: feed.prependPost(post)
                       └─► setPosts((prev) => [post, ...prev])
                           └─► React re-renderiza com novo post no topo
```

### Pontos chave

- **Validação dupla**: Zod roda no client (`CreatePostSchema.safeParse`) E no server (`route.ts`). O do client é UX (mensagem instantânea), o do server é segurança (última palavra).
- **Otimistic update**: o hook já poderia inserir um post "temporário" no array antes da resposta, mas no MVP usamos prepend após 201 — fica simples e correto. Like já tem update otimista com rollback.
- **Revalidação**: server actions chamam `revalidatePath('/feed')`. As API routes também (para casos onde são usadas direto de Server Components).

---

## Fluxo detalhado — Like

```
1. USER clica no ❤ do PostCard
   └─► onLike(postId) callback
       └─► toggleLike(postId) do useLikePost hook
           ├─► Snapshot: { liked, likesCount } atuais
           ├─► updatePost(postId, {
           │     liked: !liked,
           │     likesCount: liked ? count-1 : count+1
           │   })
           │   └─► React re-renderiza com ❤ preenchido (instantâneo!)
           │
           └─► fetch POST /api/posts/[id]/like
               └─► route handler
                   ├─► requireViewer()
                   ├─► toggleLike() em src/lib/community/posts.ts
                   │   ├─► SELECT post WHERE id (404 se deletado)
                   │   ├─► SELECT like WHERE userId+postId
                   │   ├─► DELETE or INSERT like
                   │   ├─► UPDATE post SET likesCount = likesCount ± 1
                   │   └─► SELECT post WHERE id (fresh likesCount)
                   └─► ok({ data: { liked, likesCount } })
               └─► on success: updatePost(postId, { liked, likesCount })
                   └─► Reconcilia com valor do servidor
               └─► on error: updatePost(postId, previousLiked, previousCount)
                   └─► Rollback visual
```

### Atualização otimista

| Estado       | UI                  | Servidor                |
|--------------|---------------------|-------------------------|
| Idle         | `liked=false`       | `likesCount=5`          |
| Click        | `liked=true` (otim) | (request em voo)        |
| Sucesso      | `liked=true`        | `likesCount=6`          |
| Erro         | `liked=false` (rollback) | `likesCount=5`      |

---

## Fluxo — Listar feed

```
1. Componente /feed/page.tsx monta
   └─► useFeed({ limit: 20 })
       └─► useEffect → fetchPage(null, replace=true)
           └─► fetch GET /api/posts?limit=20
               └─► route handler
                   ├─► getViewer() — não falha se não logado
                   ├─► FeedQuerySchema.safeParse(searchParams)
                   └─► getFeed(query, viewerId) em src/lib/community/posts.ts
                       ├─► Prisma Post.findMany com cursor where + orderBy
                       ├─► SELECT extra: group, likes[], comments[]
                       ├─► Map rows → postToDto (com flag liked por viewer)
                       ├─► Monta nextCursor (base64 de {createdAt, id})
                       └─► Retorna { posts, nextCursor, total }
               └─► Resposta JSON { data, meta }
           └─► setPosts(data.posts); setCursor(nextCursor); setLoading(false)
           └─► Componente renderiza lista

2. USER clica em "Carregar mais"
   └─► loadMore()
       └─► fetch GET /api/posts?cursor=X&limit=20
       └─► setPosts((prev) => [...prev, ...new])
       └─► Atualiza cursor
```

### Cursor pagination — por que não offset?

- **Offset** (`skip: 20`): quando há inserts no meio, posts podem duplicar ou pular. Performance degrada em tabelas grandes.
- **Cursor** (base64 de `{createdAt, id}`): estável mesmo com inserts. Performance O(log N) via índice `(createdAt, id)`. Padrão de Twitter, Instagram, GitHub.

---

## Estrutura de pastas — responsabilidades

```
src/
├── app/
│   ├── (community)/feed/
│   │   └── page.tsx              ← Client Component, usa useFeed
│   ├── actions/
│   │   └── posts.ts              ← Server Actions (mutações)
│   └── api/posts/
│       ├── route.ts              ← GET (lista), POST (cria)
│       ├── [id]/route.ts         ← GET, PATCH, DELETE
│       ├── [id]/like/route.ts    ← POST (toggle)
│       └── [id]/comments/route.ts← GET, POST
├── components/community/
│   ├── PostCard.tsx              ← Render de um post + menu
│   ├── CreatePost.tsx            ← Composer (textarea + submit)
│   ├── FeedSkeleton.tsx          ← Loading
│   ├── FeedEmpty.tsx             ← Empty state
│   └── FeedErrorBoundary.tsx     ← Error UI
├── hooks/
│   └── usePosts.ts               ← useFeed, useCreatePost, useLikePost, etc
├── lib/community/
│   ├── api.ts                    ← ok/fail envelope, ErrorCode
│   ├── auth.ts                   ← getViewer/requireViewer (Supabase + dev)
│   ├── posts.ts                  ← Prisma queries + DTO mapping
│   └── rate-limit.ts             ← in-memory 10/min
├── lib/validators/
│   └── posts.ts                  ← Zod schemas (CreatePost, etc)
└── types/
    └── community.ts              ← Post, Comment, Author, ApiResponse
```

---

## Camadas e contratos

| Camada            | Recebe                | Retorna              | Faz                                |
|-------------------|----------------------|----------------------|-------------------------------------|
| UI (React)        | Events do user       | JSX                  | Renderiza estado + dispara actions  |
| Hook              | State, callbacks     | State + funções      | Estado local + fetch + otimização   |
| API Route         | HTTP Request         | HTTP Response JSON   | Validação + auth + delegação        |
| Server Action     | Args                 | ActionResult<T>      | Validação + auth + delegação + revalidate |
| Domain (lib)      | Inputs tipados       | DTOs tipados         | Prisma queries + mapping            |
| Prisma            | Where/Data args      | Rows do DB           | SQL + cache de conexão              |

Cada camada só conhece a imediatamente abaixo. Trocar a UI (e.g. para React Native) não mudaria as outras camadas. Trocar o Prisma por Drizzle não mudaria a UI.

---

## O que NÃO está aqui

- **Notificações**: criação de `Notification` (NEW_COMMENT, NEW_LIKE, MENTION) — futuro.
- **FeedItem table**: pre-computação de feed personalizado (cron job) — fase 3.
- **Embeddings / busca semântica**: Fase 3 com pgvector.
- **Otimistic prepend para createPost**: implementado mas pode ser melhorado com tempId.

---

## Onde adicionar coisas

| Quero adicionar…               | Onde mexer                                  |
|--------------------------------|---------------------------------------------|
| Novo campo em Post             | `schema.prisma`, `lib/validators/posts.ts`, `lib/community/posts.ts` (postToDto) |
| Novo filtro no feed            | `FeedQuerySchema`, `getFeed()`               |
| Nova reação (🌟 além de ❤)     | Novo model Reaction + novo endpoint `/reactions` |
| WebSocket pra updates real-time| Layer separada; assinatura por postId       |
| Soft-delete de comentário      | Replica pattern em `comments.ts`             |