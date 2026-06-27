# API Reference — Akasha Portal

> **Versão:** 1.0 | **Última atualização:** 2026-06-27 | **Wave:** 11 (Docs Governance)
> **Fonte:** `src/app/api/**/route.ts` (33 rotas ativas em main @ 946b9011)
> **Base URL:** `https://akasha.com.br` (prod) · `http://localhost:3000` (dev)

---

## Sumário

1. [Convenções](#convenções)
2. [Autenticação](#autenticação)
3. [Rate Limits](#rate-limits)
4. [Códigos de erro](#códigos-de-erro)
5. [Endpoints por domínio](#endpoints-por-domínio)
   - [Auth](#auth-)
   - [Posts](#posts-)
   - [Comments](#comments-)
   - [Likes](#likes-)
   - [Groups](#groups-)
   - [Users](#users-)
   - [Notifications](#notifications-)
   - [Search](#search-)
   - [Akasha IA](#akasha-ia-)
   - [Waitlist](#waitlist-)
6. [Gerador automático](#gerador-automático)

---

## Convenções

| Item | Padrão |
|------|--------|
| Versão | Sem prefixo (`/api/...`, não `/v1/api/...`) |
| Formato | `application/json; charset=utf-8` |
| Auth | Cookie `sb-<project-ref>-auth-token` (Supabase SSR) ou `Authorization: Bearer <jwt>` |
| Paginação | Cursor-based (`cursor`, `limit`) |
| Timestamps | ISO 8601 UTC (`2026-06-27T15:00:00Z`) |
| IDs | cuid (Prisma) — `ck1234abc...` |
| Idempotência | Likes/Follow usam toggle; demais POSTs não são idempotentes |

Todas as rotas passam pelo `middleware.ts` raiz, que aplica:

1. **Rate limit global** — 100 req/min por IP (`RATE_LIMIT_CONFIG.windowMs=60000`)
2. **Rate limit de posts** — 10 posts/min por usuário (`@/lib/community/rate-limit.ts`)
3. **CORS** — `ALLOWED_ORIGINS` (env var; em prod é obrigatório, fallback `same-origin`)
4. **Security headers** — HSTS, CSP-pendente, X-Frame-Options DENY, etc.
5. **Auth Supabase** — rotas protegidas redirecionam pra `/login?redirectTo=...`

---

## Autenticação

```bash
# Login via cookie (form data)
curl -X POST https://akasha.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@example.com","password":"senha-forte"}'

# Resposta 200
{ "success": true, "user": { "id": "ck...", "email": "user@example.com" } }

# Login 401 — credenciais inválidas
{ "error": "Invalid login credentials" }

# Status check (somente dev)
curl https://akasha.com.br/api/auth/status
# → 404 em produção (rota debug, ver docs/SECURITY-FIXES-WAVE10.md F11)
```

JWT em header (alternativa para fetchers):

```bash
curl https://akasha.com.br/api/posts \
  -H "Authorization: Bearer <supabase-jwt>" \
  -b cookies.txt
```

---

## Rate Limits

| Rota | Limite | Janela | Identificador |
|------|--------|--------|---------------|
| `*` (global, via middleware) | 100 req | 1 min | IP |
| `POST /api/posts` | 10 posts | 1 min | user.id |
| `POST /api/posts/:id/like` | 60 likes | 1 min | user.id (in-memory, MVP) |
| `POST /api/akashic/chat` | 30 msgs | 1 min | user.id (token-bucket) |
| `POST /api/groups` | 5 grupos | 1 hora | user.id |

Resposta 429 (Too Many Requests):

```json
{
  "error": "rate_limit_exceeded",
  "message": "Você excedeu o limite de 10 posts por minuto",
  "retryAfter": 42
}
```

Header `Retry-After` indica segundos até reset.

---

## Códigos de erro

| Status | `error` code | Quando |
|--------|--------------|--------|
| 400 | `validation_error` | Body inválido (Zod fail) |
| 401 | `unauthorized` | Sessão expirada ou ausente |
| 403 | `forbidden` | Autenticado mas sem permissão (ex: moderar post alheio) |
| 404 | `not_found` | Recurso inexistente ou soft-deleted |
| 409 | `conflict` | Username/handle já em uso |
| 429 | `rate_limit_exceeded` | Limite de requisições excedido |
| 500 | `internal_error` | Bug; checar `X-Request-Id` no log |
| 502 | `upstream_error` | OpenAI falhou após retries |
| 503 | `circuit_open` | Circuit breaker aberto (Akasha IA) |
| 504 | `timeout` | Operação > 30s |

Headers úteis em todas as respostas:

```
X-Request-Id: <uuid>          # rastrear no PostHog / Vercel logs
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1719499200
```

---

## Endpoints por domínio

### Auth (`/api/auth/*`)

#### `POST /api/auth/login`

| Campo | Detalhe |
|-------|---------|
| **Auth** | Pública |
| **Body** | `{ "email": string, "password": string }` |
| **200** | `{ success: true, user: { id, email, ... } }` + cookie `sb-*-auth-token` |
| **400** | Email/senha ausentes |
| **401** | Credenciais inválidas |
| **500** | Erro interno (Supabase fora?) |

```bash
curl -X POST https://akasha.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","password":"S3nh@F0rte!"}'
```

#### `POST /api/auth/logout`

Invalida sessão Supabase (não apenas cookie — corrige bug wave 10 F2).

```bash
curl -X POST https://akasha.com.br/api/auth/logout \
  -b cookies.txt -c cookies.txt
# → 303 redirect /login (form-based) ou 200 JSON
```

#### `POST /api/auth/register`

```bash
curl -X POST https://akasha.com.br/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@example.com",
    "password": "S3nh@F0rte!",
    "nomeCompleto": "Ana Silva",
    "dataNascimento": "1990-05-15"
  }'
```

> ⚠️ Cria usuário via `supabase.auth.admin.createUser` (service-role key). Em prod usar fluxo normal de signup (`/register` UI), que envia email de confirmação.

#### `POST /api/auth/login-form`

Submissão tradicional de form (HTML `<form action>`). Retorna 303 redirect.

#### `POST /api/auth/create-test`

Cria usuário de teste (somente dev/staging). Nunca habilitado em prod.

#### `POST /api/auth/test`

Health check de auth — verifica se Supabase responde. Retorna `{ ok: bool, latencyMs: number }`.

#### `GET /api/auth/status`

⚠️ **Dev-only** — retorna 404 em prod. Lista cookies + estado da sessão.

---

### Posts (`/api/posts/*`)

#### `GET /api/posts`

Lista paginada do feed. Cursor pagination.

| Query | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `cursor` | string | — | Cursor opaco (post id) |
| `limit` | int | 20 | Max 100 |
| `filter` | enum | `recent` | `recent`, `para-voce`, `trending` |
| `tradition` | string | — | Filtro por tradição (umbanda, candomble, etc) |
| `topic` | string | — | Tag/tópico |
| `authorId` | cuid | — | Posts de um autor |
| `groupSlug` | string | — | Posts de um grupo |

```bash
curl https://akasha.com.br/api/posts?filter=para-voce&limit=20 \
  -b cookies.txt
```

Resposta 200:

```json
{
  "data": [
    {
      "id": "ck...",
      "title": "Axé e saúde",
      "body": "...",
      "authorId": "ck...",
      "groupId": "ck...",
      "likesCount": 42,
      "commentsCount": 7,
      "likedByMe": true,
      "createdAt": "2026-06-27T14:00:00Z"
    }
  ],
  "nextCursor": "ck...",
  "hasMore": true
}
```

#### `POST /api/posts`

Cria novo post (autenticado).

| Body | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `title` | string | sim | 3–200 chars |
| `body` | string | sim | 1–10.000 chars |
| `groupId` | cuid | não | Post em grupo (precisa ser membro) |
| `tradition` | enum | não | `umbanda`, `candomble`, `espiritismo`, `umbanda-candomble`, `cristianismo-misticismo`, `budismo`, `hinduismo`, `taoismo`, `xamanismo`, `tradicoes-classicas`, `outros` |
| `tags` | string[] | não | Max 5 tags |

```bash
curl -X POST https://akasha.com.br/api/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Axé e saúde no terreiro",
    "body": "Compartilhando uma reflexão...",
    "tags": ["axé", "saúde"]
  }'
```

Resposta 201:

```json
{ "data": { "id": "ck...", "title": "...", "createdAt": "..." } }
```

**Erros:**

| Status | Causa |
|--------|-------|
| 400 | Validação Zod falhou |
| 401 | Não autenticado |
| 403 | Não é membro do grupo |
| 429 | 10 posts/min excedido |

#### `GET /api/posts/:id`

Detalhe de um post (incluindo likes e comments count). Soft-deleted → 404.

#### `PATCH /api/posts/:id`

Atualiza post (somente autor). Body parcial de `CreatePostSchema`.

#### `DELETE /api/posts/:id`

Soft delete (somente autor). Mantém no banco (`deletedAt` setado).

---

### Comments (`/api/posts/:id/comments/*`)

#### `GET /api/posts/:id/comments`

Lista comentários paginados. Side-effect: marca como lidos (notifications).

| Query | Tipo | Default |
|-------|------|---------|
| `cursor` | string | — |
| `limit` | int | 20 |

#### `POST /api/posts/:id/comments`

Cria comentário. **Side-effect:** dispara notificação pro autor do post.

```bash
curl -X POST https://akasha.com.br/api/posts/ck1234/comments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{ "body": "Muito bom seu post!" }'
```

---

### Likes (`/api/posts/:id/like/*`)

#### `POST /api/posts/:id/like`

Toggle like (autenticado). Idempotente no nível de toggle — se já curtiu, descurte.

```bash
curl -X POST https://akasha.com.br/api/posts/ck1234/like -b cookies.txt
# → { "liked": true, "likesCount": 43 }
# ou, se já curtia:
# → { "liked": false, "likesCount": 42 }
```

---

### Groups (`/api/groups/*`)

#### `GET /api/groups`

Lista grupos com filtros:

| Query | Tipo | Descrição |
|-------|------|-----------|
| `tradition` | string | Tradição |
| `isPublic` | bool | Público/privado |
| `mine` | bool | Apenas grupos que sou membro |
| `search` | string | Busca no nome/descrição |
| `limit` | int | Default 20 |

#### `POST /api/groups`

Cria grupo. Criador vira ADMIN automaticamente.

```bash
curl -X POST https://akasha.com.br/api/groups \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Cabala Viva",
    "slug": "cabala-viva",
    "description": "Estudos cabalísticos avançados",
    "isPublic": true,
    "tradition": "judaísmo-mística"
  }'
```

#### `GET /api/groups/:slug`

Detalhes + flag `isMember`/`viewerRole` (ADMIN/MODERATOR/MEMBER/NULL).

#### `PATCH /api/groups/:slug`

Atualiza (somente ADMIN/MODERATOR).

#### `DELETE /api/groups/:slug`

Soft delete (somente ADMIN). Cascade: posts do grupo ficam órfãos mas preservados.

#### `GET /api/groups/:slug/posts`

Posts do grupo (cursor pagination).

#### `GET /api/groups/:slug/members`

Lista membros com role.

#### `POST /api/groups/:slug/members`

- Se grupo público → join direto
- Se privado + invite token → processa invite

```bash
# Join direto
curl -X POST https://akasha.com.br/api/groups/cabala-viva/members -b cookies.txt

# Processar invite
curl -X POST https://akasha.com.br/api/groups/cabala-viva/members \
  -d '{ "inviteToken": "abc123..." }' -b cookies.txt
```

#### `DELETE /api/groups/:slug/members`

Leave (self) ou remove (ADMIN/MODERATOR).

#### `POST /api/groups/:slug/invite`

Cria convite (ADMIN/MODERATOR). Retorna `{ token, expiresAt, url }`.

#### `GET /api/groups/:slug/invite`

Lista convites pendentes.

---

### Users (`/api/users/*`)

#### `GET /api/users/profile`

Resolve perfil público por handle (id, email, ou local-part).

```bash
curl 'https://akasha.com.br/api/users/profile?handle=ana-silva'
```

Resposta:

```json
{
  "data": {
    "id": "ck...",
    "handle": "ana-silva",
    "displayName": "Ana Silva",
    "bio": "Curiosa do axé...",
    "avatarUrl": null,
    "coverUrl": null,
    "postsCount": 23,
    "followersCount": 142,
    "followingCount": 87,
    "joinedAt": "2026-01-15T..."
  }
}
```

#### `POST /api/users/:id/follow`

Toggle follow (autenticado).

```bash
curl -X POST https://akasha.com.br/api/users/ck1234/follow -b cookies.txt
# → { "following": true, "followersCount": 143 }
```

---

### Notifications (`/api/notifications/*`)

#### `GET /api/notifications`

Lista notificações paginadas do usuário autenticado.

| Query | Tipo | Default |
|-------|------|---------|
| `cursor` | string | — |
| `limit` | int | 20 (max 100) |
| `filter` | enum | `all` (`all`, `unread`, `read`) |
| `type` | enum | — | `LIKE`, `COMMENT`, `POST_REPLY`, `FOLLOW`, `MENTION`, `GROUP_INVITE`, `GROUP_POST`, `GROUP_ROLE_CHANGE`, `ARTICLE_RECOMMENDATION`, `ARTICLE_PUBLISHED`, `SYSTEM_ALERT`, `MODERATION_ACTION`, `DIGEST_WEEKLY` |

#### `PATCH /api/notifications/:id/read`

Marca notificação individual como lida.

#### `PATCH /api/notifications/read-all`

Marca todas como lidas. Retorna `{ updated: number }`.

#### `GET /api/notifications/preferences` / `PATCH /api/notifications/preferences`

Lê/atualiza preferências (por tipo + canal: email/push/in-app).

```bash
curl -X PATCH https://akasha.com.br/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "preferences": [
      { "type": "COMMENT", "email": true, "push": false, "inApp": true },
      { "type": "DIGEST_WEEKLY", "email": true, "push": false, "inApp": false }
    ]
  }'
```

#### `POST /api/notifications/push` / `DELETE /api/notifications/push` / `GET /api/notifications/push`

Registra/remove/lista web-push subscriptions (VAPID).

#### `GET /api/notifications/stream`

Server-Sent Events (SSE) para notificações em tempo real. Mantém conexão aberta.

```bash
curl -N https://akasha.com.br/api/notifications/stream \
  -H "Accept: text/event-stream" \
  -b cookies.txt
# → event: notification
#   data: {"id":"ck...","type":"COMMENT","title":"...","createdAt":"..."}
```

> ⚠️ Requer suporte a SSE no cliente (EventSource API).

#### `GET /api/notifications/spiritual`

Notificações personalizadas baseadas em efemérides (Akasha IA curadora — wave 10).

#### `GET /api/notifications/templates` / `POST /api/notifications/templates`

Lista/cria templates (ADMIN).

#### `GET /api/notifications/unsubscribe` / `POST /api/notifications/unsubscribe`

One-click unsubscribe (LGPD compliance). Token HMAC + redirect UI.

---

### Search (`/api/search/*`)

#### `GET /api/search`

Busca unificada (posts, articles, users, groups, tags).

| Query | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `q` | string | `""` | Query string |
| `type` | enum | `all` | `all`, `posts`, `articles`, `users`, `groups`, `tags` |
| `cursor` | string | — | Cursor pagination |
| `limit` | int | 20 | Max 50 |
| `tradition` | string | — | Filtro por tradição |
| `tag` | string | — | Filtro por tag |
| `sort` | enum | `relevance` | `relevance`, `recent`, `popular` |
| `from` / `to` | ISO 8601 | — | Filtro de data |

```bash
curl 'https://akasha.com.br/api/search?q=ax%C3%A9&type=posts&sort=relevance&limit=20'
```

**Cache:** ISR 60s (`revalidate = 60` em `route.ts`).

#### `GET /api/search/suggestions`

Autocomplete — query `q` (>= 2 chars), retorna top 8 sugestões de posts/tags/users.

---

### Akasha IA (`/api/akashic/*`)

#### `POST /api/akashic/chat`

Chat principal (Wave 10 — Akasha IA curadora).

| Body | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `message` | string | sim | 1–2.000 chars |
| `tradition` | enum | não | Filtra RAG por tradição |
| `history` | array | não | Max 20 mensagens anteriores (`{role, content}`) |

```bash
curl -X POST https://akasha.com.br/api/akashic/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "message": "O que significa o Odu Ogbe?",
    "tradition": "candomble",
    "history": [
      {"role":"user","content":"..."},
      {"role":"assistant","content":"..."}
    ]
  }'
```

Resposta 200:

```json
{
  "reply": "O Odu Ogbe é o primeiro dos 16 Odus principais...",
  "sources": [
    {
      "id": "ck...",
      "title": "Os 16 Odus de Ifá",
      "tradition": "candomble",
      "relevance": 0.92
    }
  ]
}
```

**Erros:**

| Status | Causa |
|--------|-------|
| 400 | Mensagem vazia ou > 2000 chars |
| 429 | Rate limit (30 msgs/min) |
| 502 | OpenAI falhou após retries |
| 503 | Circuit breaker aberto |
| 504 | Timeout (30s) |

**Stack interno:** sanitize → RAG (pgvector) → buildAkashaPrompt (8 regras éticas) → OpenAI → parse.

#### `POST /api/akashic/chat/stream`

Versão streaming (SSE) do chat. Mesma interface, resposta incremental.

```bash
curl -N -X POST https://akasha.com.br/api/akashic/chat/stream \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{ "message": "..." }'
# → event: token
#   data: {"delta":"O "}
# → event: token
#   data: {"delta":"Odu "}
# → ...
# → event: done
#   data: {"sources":[...]}
```

#### `GET /api/akashic/records`

Lista registros históricos de chat do usuário (auditoria + re-leitura).

---

### Waitlist (`/api/waitlist`)

#### `POST /api/waitlist`

Captura email da landing `/validacao`. Persistência: arquivo JSON local (`data/waitlist.json`).

```bash
curl -X POST https://akasha.com.br/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "interessado@example.com",
    "source": "landing",
    "referrer": "https://google.com",
    "utm": { "source": "twitter", "campaign": "beta" }
  }'
```

Resposta 200:

```json
{
  "position": 42,
  "capacity": 50,
  "message": "Você está na posição 42 da lista beta"
}
```

**Rate limit:** já aplicado pelo middleware global (100 req/min).

**Próximo passo:** migrar para Prisma + email transacional (ver `docs/VALIDACAO-LANDING.md`).

---

## Gerador automático

A lista acima foi gerada a partir do comando:

```bash
find src/app/api -name route.ts -type f | sort
```

Para regenerar este documento (com metadados extras):

```bash
# scripts/generate-api-reference.sh
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

output="docs/API-REFERENCE.md"
echo "# API Reference (auto-gerado em $(date -Iseconds))" > "$output"
echo "" >> "$output"

find src/app/api -name "route.ts" -type f | sort | while read -r f; do
  methods=$(grep -oE "export async function (GET|POST|PATCH|PUT|DELETE|OPTIONS)" "$f" \
            | grep -oE "(GET|POST|PATCH|PUT|DELETE|OPTIONS)" | sort -u | tr '\n' ',' | sed 's/,$//')
  rel=${f#src/app/api}
  echo "## \`${rel%/route.ts}\`" >> "$output"
  echo "- **Métodos:** ${methods:-NONE}" >> "$output"
  echo "- **Arquivo:** \`${f}\`" >> "$output"
  echo "" >> "$output"
done

echo "✅ API Reference regenerado: $output ($(wc -l < "$output") linhas)"
```

> Rode após adicionar/renomear rota. **Não substitui** a documentação manual de body/response — apenas garante que a lista de rotas esteja em sincronia com o código.

---

## Próximos passos

1. **OpenAPI spec** — gerar `openapi.yaml` automaticamente a partir das Zod schemas (`zod-to-openapi`). Roadmap wave 12.
2. **Postman collection** — exportar para `.postman_collection.json` (facilita onboarding de devs).
3. **Rate limit Redis** — substituir in-memory por Upstash quando bater 100 req/s em produção (wave 11+).
4. **Webhook signatures** — adicionar HMAC nos webhooks (Stripe, Resend) para audit + replay protection.

---

> **Mantido por:** Documentation Steward · Wave 11 (Trilha 9)
> **Próxima revisão:** quando ≥ 5 rotas forem adicionadas/removidas.