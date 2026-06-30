# API Reference — Akasha Portal (Wave 32)

> **Versão:** 2.0 | **Data:** 2026-06-30 | **Wave:** 32 (DOCUMENTATION 6/8)
> **Stack:** Next.js 16 App Router · Supabase (Auth + Postgres + Storage) · Stripe Connect
> **Source of truth:** `src/app/api/**/route.ts` (118 rotas ativas em `main`)
> **Base URL:** `https://akasha.com.br` (prod) · `http://localhost:3000` (dev)
> **Language:** EN (technical)

> **Compatibilidade:** este documento **substitui** `docs/API-REFERENCE.md` (Wave 11, 33 rotas). Veja `CHANGELOG.md` W32 para diff.

---

## 1. Convenções

| Item | Padrão |
|------|--------|
| Path versioning | None (`/api/...`, não `/v1/...`) |
| Content-Type | `application/json; charset=utf-8` |
| Auth | Supabase cookie `sb-<ref>-auth-token` **ou** `Authorization: Bearer <jwt>` |
| Pagination | Cursor-based: `?cursor=<id>&limit=<n>` (default 20, max 100) |
| Timestamps | ISO 8601 UTC (`2026-06-30T15:24:45Z`) |
| IDs | cuid2 (Prisma) — `ck1234abc...` |
| Idempotência | Likes/Follow = toggle; demais POSTs são não-idempotentes |

### 1.1 Middleware global

Todas as rotas passam por `middleware.ts`:

1. **Rate limit global** — 100 req/min por IP (configurável via `RATE_LIMIT_*`)
2. **Rate limit por feature** — `POST /posts` 10/min, `POST /akashic/chat` 30/min
3. **CORS** — `ALLOWED_ORIGINS` (env var; obrigatório em prod)
4. **Security headers** — HSTS, X-Frame-Options DENY, CSP (pendente), Referrer-Policy
5. **Auth gate** — rotas protegidas redirecionam para `/login?redirectTo=...`

---

## 2. Autenticação

### 2.1 Login (cookie-based)

```bash
curl -X POST https://akasha.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@example.com","password":"senha-forte"}'
```

**200 OK**
```json
{ "success": true, "user": { "id": "ck...", "email": "user@example.com" } }
```

**401 Unauthorized**
```json
{ "error": "invalid_credentials", "message": "Email ou senha incorretos" }
```

### 2.2 Bearer Token (server-to-server / mobile)

```bash
curl https://akasha.com.br/api/posts \
  -H "Authorization: Bearer <supabase-jwt>" \
  -b cookies.txt
```

### 2.3 Endpoints de auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (form data) |
| POST | `/api/auth/login-form` | Login (server action, Next.js form) |
| POST | `/api/auth/logout` | Logout (limpa cookie + invalida sessão) |
| POST | `/api/auth/register` | Registro de novo usuário |
| POST | `/api/auth/reset-password` | Inicia reset de senha |
| POST | `/api/auth/resend-verification` | Reenvia email de verificação |
| GET | `/api/auth/status` | Status da sessão (dev only — 404 em prod) |
| POST | `/api/auth/profile-auto-create` | Auto-cria perfil após signup |
| POST | `/api/auth/create-test` | Cria user de teste (dev only) |
| POST | `/api/auth/test` | Test de conexão |

---

## 3. Rate Limits

| Rota | Limite | Janela | Identificador |
|------|--------|--------|---------------|
| `*` (global) | 100 req | 1 min | IP |
| `POST /api/posts` | 10 posts | 1 min | user.id |
| `POST /api/posts/:id/like` | 60 likes | 1 min | user.id |
| `POST /api/posts/:id/comments` | 30 comentários | 1 min | user.id |
| `POST /api/akashic/chat` | 30 msgs | 1 min | user.id (token-bucket) |
| `POST /api/groups` | 5 grupos | 1 hora | user.id |
| `POST /api/articles` | 10 artigos | 1 hora | user.id (mentor+) |

**429 Too Many Requests:**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Você excedeu o limite de 10 posts por minuto",
  "retryAfter": 42
}
```

---

## 4. Códigos de erro

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Continuar |
| 201 | Created | Recurso criado |
| 204 | No Content | Sucesso sem body |
| 400 | Bad Request | Validar payload |
| 401 | Unauthorized | Re-autenticar |
| 403 | Forbidden | Permissão insuficiente |
| 404 | Not Found | Recurso inexistente |
| 409 | Conflict | Estado inconsistente (ex: email já existe) |
| 422 | Unprocessable Entity | Validação falhou |
| 429 | Too Many Requests | Retry após `retryAfter` |
| 500 | Internal Server Error | Reportar se persistir |
| 503 | Service Unavailable | Manutenção — tentar depois |

**Formato padrão de erro:**
```json
{
  "error": "validation_failed",
  "message": "Email inválido",
  "details": { "field": "email", "code": "invalid_format" }
}
```

---

## 5. Endpoints por domínio

### 5.1 Auth (10 rotas)

```
POST   /api/auth/login
POST   /api/auth/login-form
POST   /api/auth/logout
POST   /api/auth/register
POST   /api/auth/reset-password
POST   /api/auth/resend-verification
GET    /api/auth/status
POST   /api/auth/profile-auto-create
POST   /api/auth/create-test
POST   /api/auth/test
```

### 5.2 Posts (10 rotas)

```
GET    /api/posts                       # Lista paginada (cursor)
POST   /api/posts                       # Criar post
GET    /api/posts/:id                   # Detalhe
PATCH  /api/posts/:id                   # Editar (owner only)
DELETE /api/posts/:id                   # Apagar (owner ou admin)
POST   /api/posts/:id/like              # Toggle like
POST   /api/posts/:id/bookmark          # Toggle bookmark
POST   /api/posts/:id/read              # Marca como lido
POST   /api/posts/:id/publish           # Publica draft
POST   /api/posts/:id/schedule          # Agenda publicação
GET    /api/posts/:id/comments          # Lista comentários
POST   /api/posts/:id/comments          # Criar comentário
POST   /api/posts/:id/comments/:commentId/reply  # Responder
```

**Exemplo — criar post:**
```bash
curl -X POST https://akasha.com.br/api/posts \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hoje minha meditação foi sobre o Orí...",
    "traditionId": "ck_candomble",
    "visibility": "public",
    "images": ["https://akasha.com.br/storage/post-1.jpg"]
  }'
```

**201 Created:**
```json
{
  "id": "ck_post_xyz",
  "authorId": "ck_user_abc",
  "content": "Hoje minha meditação foi sobre o Orí...",
  "traditionId": "ck_candomble",
  "visibility": "public",
  "publishedAt": "2026-06-30T15:24:45Z",
  "likes": 0,
  "comments": 0,
  "akashaInsight": null
}
```

### 5.3 Articles (8 rotas)

```
GET    /api/articles                    # Lista artigos curados
POST   /api/articles                    # Criar (mentor+)
GET    /api/articles/:slug              # Detalhe
PATCH  /api/articles/admin/:slug        # Editar (admin)
DELETE /api/articles/admin/:slug        # Apagar (admin)
POST   /api/articles/:slug/bookmark     # Toggle bookmark
POST   /api/articles/:slug/read-progress # Update progresso
GET    /api/articles/featured           # Artigos em destaque
GET    /api/articles/admin              # Lista admin
```

### 5.4 Akashic / Akasha IA (4 rotas)

```
POST   /api/akashic/chat                # Conversa (não-stream)
POST   /api/akashic/chat/stream         # Conversa streaming (SSE)
POST   /api/akashic/feedback            # Feedback 👍/👎
GET    /api/akashic/records             # Histórico de conversas
```

**Exemplo — streaming chat:**
```bash
curl -N -X POST https://akasha.com.br/api/akashic/chat/stream \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"message": "O que é Orí em Candomblé?", "conversationId": null}'
```

**Response (Server-Sent Events):**
```
event: chunk
data: {"delta":"O Orí é a "}

event: chunk
data: {"delta":"cabeça espiritual..."}

event: done
data: {"conversationId":"ck_conv_123","citations":[...]}
```

### 5.5 Oráculos (4 rotas)

```
POST   /api/oraculo/astrologia          # Mapa astral
POST   /api/oraculo/mapa-completo       # Mapa completo (astrologia + cruzamentos)
POST   /api/oraculo/numerologia         # Numerologia cabalística
GET    /api/oraculo/historico           # Histórico de leituras
```

### 5.6 Marketplace / Payments (7 rotas)

```
POST   /api/payments/charge             # Criar cobrança Stripe
POST   /api/payments/refund             # Reembolso
POST   /api/payments/release            # Liberar repasse (D+2)
GET    /api/payments/transactions       # Histórico
POST   /api/payments/webhook            # Webhook Stripe
POST   /api/payments/connect/onboard    # Onboarding Stripe Connect
GET    /api/payments/connect/status     # Status da conta Connect
```

### 5.7 Notifications (12 rotas)

```
GET    /api/notifications               # Lista
POST   /api/notifications/read-all      # Marcar todas como lidas
GET    /api/notifications/unread-count  # Contador
POST   /api/notifications/unsubscribe   # Cancelar inscrição
GET    /api/notifications/stream        # SSE real-time
POST   /api/notifications/smart-send    # IA decide timing
GET    /api/notifications/sacred-calendar  # Calendário sagrado
GET    /api/notifications/spiritual     # Notif. espirituais
GET    /api/notifications/templates     # Templates (admin)
POST   /api/notifications/preferences   # Atualizar prefs
GET    /api/notifications/preferences/profile
POST   /api/notifications/push          # Enviar push (admin)
POST   /api/notifications/push/subscribe
POST   /api/notifications/push/test
```

### 5.8 Users (8 rotas)

```
GET    /api/users/me                    # Perfil próprio
GET    /api/users/me/bookmarks          # Posts salvos
GET    /api/users/me/history            # Histórico de leitura
GET    /api/users/:id                   # Perfil público
GET    /api/users/:id/followers         # Seguidores
GET    /api/users/:id/following         # Seguindo
POST   /api/users/:id/follow            # Toggle follow
GET    /api/users/profile              # Editar perfil (form)
POST   /api/users/:id/export            # Exportar dados (LGPD)
POST   /api/users/:id/delete-account    # Apagar conta (LGPD)
```

### 5.9 Groups (3 rotas)

```
GET    /api/groups                      # Lista
POST   /api/groups                      # Criar
POST   /api/groups/:id/join             # Toggle membership
```

### 5.10 Events (4 rotas)

```
GET    /api/events                      # Lista
POST   /api/events                      # Criar
POST   /api/events/:id/rsvp             # Toggle RSVP
POST   /api/events/:id/join             # Entrar (legacy alias)
GET    /api/events/:id/participants     # Lista participantes
```

### 5.11 Comments (integrado em Posts)

Veja §5.2 — comments são sub-recursos de posts.

### 5.12 Search (2 rotas)

```
GET    /api/search                      # Full-text (posts + users + articles)
GET    /api/search/suggestions          # Autocomplete
```

### 5.13 Reactions (1 rota)

```
POST   /api/reactions                   # Toggle reaction (post ou comment)
```

### 5.14 Drafts (2 rotas)

```
GET    /api/drafts                      # Lista drafts do user
POST   /api/drafts                      # Criar draft
GET    /api/drafts/:id                  # Detalhe
PATCH  /api/drafts/:id                  # Editar
DELETE /api/drafts/:id                  # Apagar
```

### 5.15 Admin (12 rotas)

```
GET    /api/admin/users                 # Lista users
POST   /api/admin/users/:id/ban         # Banir
POST   /api/admin/users/:id/promote-mentor  # Promover a mentor
GET    /api/admin/flags                 # Lista flags
POST   /api/admin/flags/:id/action      # Ação sobre flag
GET    /api/admin/moderation/queue      # Fila de moderação
POST   /api/admin/moderation/flags/:id  # Decidir flag
GET    /api/admin/metrics/:name         # Métricas específicas
GET    /api/admin/funnel-metrics        # Funis
GET    /api/admin/audit/log             # Audit log
POST   /api/admin/newsletter/send       # Enviar newsletter
```

### 5.16 Consciousness (2 rotas)

```
POST   /api/consciousness/track         # Tracking evento de consciência
GET    /api/consciousness/insights      # Insights agregados
```

### 5.17 Consent / LGPD (1 rota)

```
GET    /api/consent                     # Obter consentimentos
POST   /api/consent                     # Atualizar (opt-in/out)
```

### 5.18 Cron (5 rotas — internas, auth por header)

```
POST   /api/cron/publish-scheduled      # Publica posts agendados
POST   /api/cron/curate-articles        # Curadoria IA de artigos
POST   /api/cron/process-email-queue    # Fila de emails
POST   /api/cron/consciousness-evolve   # Evolução da consciência
POST   /api/cron/weekly-digest          # Newsletter semanal
```

> **Auth cron:** header `Authorization: Bearer ${CRON_SECRET}` (env var obrigatória).

### 5.19 Push (3 rotas — legacy, sucessor: notifications/push)

```
POST   /api/push/subscribe              # Subscribe
POST   /api/push/unsubscribe            # Unsubscribe
GET    /api/push/vapid-public-key       # Chave pública VAPID
```

### 5.20 Flags / Feature Flags (3 rotas)

```
GET    /api/flags                       # Lista todas
GET    /api/flags/:name                 # Detalhe
POST   /api/experiments/:name/assign    # Atribuir experimento
GET    /api/experiments/:name/assign    # Status do experimento
```

### 5.21 Other

```
POST   /api/upload                      # Upload (S3/Supabase Storage)
GET    /api/email/subscribe-welcome     # Email subscribe
POST   /api/waitlist                    # Waitlist signup
GET    /api/mentorship                  # Mentores disponíveis
POST   /api/newsletter                  # Subscribe newsletter
GET    /api/health                      # Health check
```

---

## 6. Schemas comuns

### 6.1 Post

```typescript
interface Post {
  id: string;                    // cuid2
  authorId: string;
  content: string;               // max 5000 chars
  traditionId: string | null;
  visibility: 'public' | 'group' | 'private';
  images: string[];              // URLs
  publishedAt: string | null;    // ISO 8601
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  akashaInsight: AkashaInsight | null;
}
```

### 6.2 User

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  favoriteTradition: string | null;
  role: 'user' | 'mentor' | 'admin';
  verified: boolean;
  createdAt: string;
}
```

### 6.3 Akasha Insight

```typescript
interface AkashaInsight {
  conversationId: string;
  answer: string;
  traditions: string[];          // ex: ['cabala', 'candomble']
  citations: Citation[];
  confidence: 'high' | 'medium' | 'low';
  suggestedReading: Article[];
}
```

---

## 7. OpenAPI 3.0 spec (extracto)

> Spec completo em `docs/api/openapi.yaml` (gerado via `scripts/generate-openapi.ts`).

```yaml
openapi: 3.0.3
info:
  title: Akasha Portal API
  version: 2.0.0
  description: Spiritual community + IA curator
servers:
  - url: https://akasha.com.br
    description: Production
  - url: http://localhost:3000
    description: Local dev
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    cookieAuth:
      type: apiKey
      in: cookie
      name: sb-<ref>-auth-token
security:
  - bearerAuth: []
  - cookieAuth: []
paths:
  /api/posts:
    get:
      summary: List posts
      parameters:
        - name: cursor
          in: query
          schema: { type: string }
        - name: limit
          in: query
          schema: { type: integer, default: 20, maximum: 100 }
        - name: traditionId
          in: query
          schema: { type: string }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/Post' }
                  nextCursor: { type: string, nullable: true }
    post:
      summary: Create post
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [content]
              properties:
                content: { type: string, maxLength: 5000 }
                traditionId: { type: string }
                visibility: { type: string, enum: [public, group, private] }
                images: { type: array, items: { type: string } }
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Post' }
        '429':
          description: Rate limit
```

---

## 8. Webhooks

### 8.1 Stripe

`POST /api/payments/webhook` recebe eventos:

- `payment_intent.succeeded` → libera repasse (D+0 → D+2)
- `payment_intent.payment_failed` → notifica ofertante
- `account.updated` → status Stripe Connect
- `charge.refunded` → processa reembolso

**Verificação de assinatura:** `STRIPE_WEBHOOK_SECRET` (header `Stripe-Signature`).

---

## 9. Error handling patterns

### 9.1 Cliente

```typescript
const res = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ content: '...' }),
});

if (!res.ok) {
  const error = await res.json();
  // { error: 'rate_limit_exceeded', message: '...', retryAfter: 42 }
  throw new ApiError(error);
}
```

### 9.2 Server (Next.js)

Todas as rotas usam o helper `@/lib/api/response`:

```typescript
import { ok, error, rateLimited } from '@/lib/api/response';

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return error('unauthorized', 401);

  const body = await req.json();
  const post = await db.post.create({ data: body });

  return ok(post, 201);
}
```

---

## 10. Versionamento e deprecation

- **Não usamos** versionamento na URL (`/v1/...`)
- Breaking changes são **avisadas 30 dias antes** via header `Sunset` e email
- Rotas deprecated retornam `Deprecation: true` header + link para migração

---

## Próximo passo

- **Spec completo:** `docs/api/openapi.yaml`
- **Auth flow detalhado:** `docs/AUTH-FLOW.md`
- **Guia de uso para devs:** `docs/dev/DEVELOPER-GUIDE.md`