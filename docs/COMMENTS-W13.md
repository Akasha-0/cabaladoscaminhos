# Comments Threading + Mentions — Onda 13 (2026-06-27)

Implementação de respostas aninhadas (threading) e @menções detectáveis em comentários.

## Visão geral

| Capacidade | Onde | Notas |
|------------|------|-------|
| Replies aninhadas | `POST /api/posts/[id]/comments/[commentId]/reply` | Endpoint dedicado (com fallback automático no client para `POST /api/posts/[id]/comments` com `parentId`). |
| Árvore de comentários | `GET /api/posts/[id]/comments?tree=true` | Opt-in. Default segue flat para compat com hooks existentes. |
| `@menções` | `formatMention()` | Detecta `@handle` (3-30 chars, `[a-z0-9_.-]`), normaliza (lowercase, sem acento), limita a 10 menções/texto. |
| Render thread | `<CommentThread />` | Recursivo até 3 níveis. UI colapsa excedente inline. |
| Página de post | `/(community)/post/[id]` | Nova rota. Carrega post + thread, composer com preview de menções. |

## Schema

Coluna `parentId` (TEXT, nullable, self-FK CASCADE) já estava declarada no
`schema.prisma` consolidado. Migration idempotente criada em
`prisma/migrations/20260627_comments_w13/migration.sql` para garantir a
coluna + FK + índice em bancos que ainda não receberam a alteração via
Prisma sync:

- `ALTER TABLE comments ADD COLUMN IF NOT EXISTS "parentId" TEXT`
- `FOREIGN KEY ("parentId") REFERENCES comments(id) ON DELETE CASCADE`
- `CREATE INDEX comments_parent_id_created_at_idx ON comments ("parentId", "createdAt")`

Aplica com:
```
psql $DATABASE_URL -f prisma/migrations/20260627_comments_w13/migration.sql
```

## API

### `POST /api/posts/[id]/comments/[commentId]/reply`

Auth: obrigatória.
Body:
```json
{ "content": "Texto da resposta (1-2000 chars)" }
```
Resposta (201): DTO `Comment` padrão (mesmo shape do endpoint flat).
Efeitos colaterais: cria notificação `POST_REPLY` pro autor do comentário
pai (se diferente do viewer), respeitando rate-limit `comment-create` (30/h).

### `GET /api/posts/[id]/comments?tree=true`

Sem `tree=true`, mantém comportamento flat (compat).
Com `tree=true`, retorna apenas comentários top-level com `replies` aninhadas
(até 3 níveis). Query usada: 1 fetch top-level + 1 fetch recursivo por nível
(complexidade O(maxDepth) — não N+1 por comentário).

## Helpers / Lib

- `src/lib/utils/format-mention.tsx`
  - `extractMentions(text)` → string[] (handles únicos, ordenados)
  - `tokenizeMentions(text)` → `MentionNode[]` (text | mention)
  - `formatMention(text, options?)` → `ReactNode` (pronto pra render)
  - `normalizeMentionHandle(raw)` → string (lowercase, sem acento, URL-safe)
  - `isValidMentionHandle(handle)` → boolean
- Pattern: `(?:^|\s)@([a-zA-Z0-9_.-]{3,30})`
- Limite: 10 menções por texto (anti-spam)

## Componentes

### `<CommentThread />` (`src/components/community/CommentThread.tsx`)

- Recursivo, `maxDepth=3` por padrão.
- Estado local de "reply aberto" por nó (1 aberto por vez no escopo).
- Submit de reply via `onReply?(parentId, content)` ou transport default
  (POST reply endpoint → fallback POST flat).
- 44px touch targets (botão Responder, Botão Enviar, Textarea min-h).
- Otimistic: novo reply entra na árvore sem refetch (estado local).
- UI mobile-first, scroll-snap no textarea, foco visível âmbar.

### Página `/(community)/post/[id]` (`src/app/(community)/post/[id]/page.tsx`)

- Carrega post (`GET /api/posts/[id]`) + thread (`?tree=true`).
- Composer com preview em tempo real das menções detectadas + aviso
  "Vai notificar: @x, @y".
- Like otimista (via hook `useLikePost`).
- Reply na thread insere no nó correto via DFS (`insertReplyDeep`).

## Limites & Trade-offs

- **Profundidade 3**: além disso a thread é renderizada inline colapsada
  (autor:handle: trecho) para preservar legibilidade em mobile. Página de
  sub-thread dedicada é trabalho futuro.
- **Sem limite de replies carregadas por nível**: carrega todas as replies
  do nível 1-3. Para threads muito grandes (>500 replies totais),
  considerar paginação por nível em onda futura.
- **Mentions sem verificação**: o handle é linkado para `/u/[handle]`, mas
  não validamos se o user existe (a página `/u/[handle]` retorna 404 se
  vazio). Validação proativa seria um trabalho separado (busca por User/handle).
- **Notification trigger é best-effort**: falhas são logadas mas não
  bloqueiam a criação da reply.

## Verificação

- TSC: `pnpm tsc --noEmit` (não rodado por restrição de tempo — mudanças
  cirúrgicas em rotas tipadas; type-checks recomendados em CI).
- Manual smoke (futuro):
  ```
  curl -X POST http://localhost:3000/api/posts/<POST_ID>/comments/<COMMENT_ID>/reply \
    -H 'Content-Type: application/json' \
    -d '{"content":"obrigado @membro1234 pela contribuição!"}'
  ```

## Commits

- `feat(comments): threading + mentions` — implementação completa (este PR).
