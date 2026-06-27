# 🔔 Notificações — Especificação Técnica

> **Status:** ✅ Implementado (Onda 3 — `feat/notifications-real`, 2026-06-27)
> **Owner:** Akasha Portal team
> **Versão:** 1.0

Sistema de notificações funcional para a comunidade Akasha. Substitui
o mock de 7 notificações hardcoded em `/notifications` por uma stack
completa: in-app + email + Web Push, com preferências granulares,
batch automático, e compliance LGPD.

---

## 🎯 Objetivos

1. **In-app em tempo real** — polling 30s (com Supabase Realtime opt-in)
2. **Email transacional** — Resend com templates por tipo (desabilitado em dev)
3. **Web Push opt-in** — VAPID, RFC 8030, subscriptions persistidas
4. **Preferências granulares** — opt-in/out por tipo e canal
5. **Batch automático** — 5 likes → 1 notif "+5 curtidas"
6. **LGPD-friendly** — unsubscribe one-click, link "deletar conta" em todo email

---

## 🏛️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                      EVENTOS (server-side)                     │
│  posts/[id]/like     ─┐                                        │
│  posts/[id]/comments ─┼─► triggers.ts                          │
│  users/[id]/follow   ─┘   • valida prefs                       │
│                          • skip self-notif                     │
│                          • batch (groupKey)                    │
│                          • upsert row                          │
│                                │                               │
│              ┌─────────────────┼─────────────────┐             │
│              ▼                 ▼                 ▼             │
│         Notification      Email (Resend)    Push (web-push)   │
│         (Prisma)          ou console.log     ou console.log    │
│              │                                                   │
└──────────────┼──────────────────────────────────────────────────┘
               ▼
       ┌─────────────────────────────────┐
       │   /api/notifications (GET)      │  ◄── useCommunityNotifications
       │   /api/notifications/[id]/read  │      (polling 30s + Supabase Realtime)
       │   /api/notifications/read-all   │
       │   /api/notifications/preferences│
       │   /api/notifications/unsubscribe│
       │   /api/notifications/push       │
       └─────────────────────────────────┘
                       │
                       ▼
                ┌──────────────┐
                │ /notifications│ ◄── NotificationBell (badge + dropdown)
                │   (page.tsx)  │     Page (lista + filtros)
                └──────────────┘
```

---

## 📦 Schema Prisma

Adicionado em `prisma/community.prisma` e migrado por
`scripts/migrations/notifications.sql`:

### Notification (estendido)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `cuid` | PK |
| `userId` | `String` | Recipient |
| `type` | `NotificationType` | LIKE, COMMENT, POST_REPLY, FOLLOW, MENTION, GROUP_INVITE, GROUP_POST, GROUP_ROLE_CHANGE, ARTICLE_RECOMMENDATION, ARTICLE_PUBLISHED, SYSTEM_ALERT, MODERATION_ACTION, DIGEST_WEEKLY |
| `actorId` | `String?` | Quem causou |
| `entityType` | `EntityType?` | POST, COMMENT, USER, GROUP, ARTICLE, MENTION, SYSTEM |
| `entityId` | `String?` | ID da entidade |
| `postId`, `commentId`, `groupId`, `articleId` | `String?` | Atalhos denormalizados |
| `groupKey` | `String?` | Chave de batch (`post:<id>:LIKES`) — **UNIQUE por userId** |
| `count` | `Int` | Contador quando batched (default 1) |
| `actorSnapshot` | `Json?` | Snapshot do ator mais recente |
| `payload` | `Json?` | `{preview, excerpt, link, ...}` |
| `read` | `Boolean` | Lida? |
| `readAt` | `DateTime?` | Quando foi marcada como lida |
| `emailedAt` | `DateTime?` | Quando email foi enviado |
| `pushedAt` | `DateTime?` | Quando push foi entregue |
| `createdAt`, `updatedAt` | `DateTime` | Timestamps |

**Índices:**
- `(userId, read, createdAt DESC)` — query principal do feed
- `(userId, createdAt DESC)` — histórico
- `(userId, type, createdAt DESC)` — filtro por tipo
- `(groupKey)` — batch lookup
- UNIQUE `(userId, groupKey)` — habilita upsert

### NotificationPreference (nova)

```prisma
model NotificationPreference {
  id            String   @id @default(cuid())
  userId        String
  type          NotificationType
  inApp         Boolean  @default(true)
  email         Boolean  @default(true)
  push          Boolean  @default(false)   // opt-in
  weeklyDigest  Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, type])
  @@index([userId])
}
```

### PushSubscription (nova)

```prisma
model PushSubscription {
  id          String   @id @default(cuid())
  userId      String
  endpoint    String   @unique             // RFC 8030
  p256dh      String                        // chave de criptografia
  auth        String                        // auth secret
  userAgent   String?
  ipAddress   String?
  active      Boolean  @default(true)
  lastSentAt  DateTime?
  lastError   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([active, userId])
}
```

### UnsubscribeToken (nova)

```prisma
model UnsubscribeToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique               // opaco, 32 bytes hex
  type      String?                         // null = all
  expiresAt DateTime                        // 30 dias
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

---

## 🔧 Camadas

### 1. Triggers (`src/lib/notifications/triggers.ts`)

Entry point: `createNotification(input)`.

**Comportamento:**

1. **Sanity check** — userId + type obrigatórios; senão retorna `skipped: 'invalid'`.
2. **Self-notification skip** — se `actorId === userId` e tipo não-crítico, retorna `skipped: 'self-notification'`.
3. **Resolve preferências** — busca `NotificationPreference` do user, mescla com `DEFAULT_PREFERENCES`.
4. **Critical bypass** — `SYSTEM_ALERT` e `MODERATION_ACTION` ignoram preferências (sempre entrega).
5. **In-app (DB)** — se tipo batchable + groupKey já existe (não lida), incrementa `count`. Senão cria nova row.
6. **Fanout assíncrono** — dispara email + push em background (não bloqueia).

**Tipos batchable:** `LIKE`, `GROUP_POST`, `ARTICLE_PUBLISHED`.
**Tipos never-batch:** `MENTION`, `POST_REPLY`, `COMMENT`, `FOLLOW`, `GROUP_INVITE`, `GROUP_ROLE_CHANGE`, `SYSTEM_ALERT`, `MODERATION_ACTION`.

### 2. Email (`src/lib/notifications/email.ts`)

- **Provider:** Resend (REST API).
- **Dev mode:** `console.log` ao invés de enviar (regra do projeto).
- **Templates por tipo** — 13 templates (1 por tipo), todos email-safe (table-based, inline styles, sem JS).
- **LGPD footer** — todo email tem 3 links: Preferências, Cancelar inscrição, Excluir conta.
- **List-Unsubscribe header** — RFC 8058 One-Click.

**Função principal:** `sendNotificationEmail({to, notification, unsubscribeUrl, preferencesUrl, deleteAccountUrl})`.

### 3. Push (`src/lib/notifications/push.ts`)

- **Provider:** `web-push` lib (já em deps).
- **VAPID:** lido de env (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).
- **Dev mode:** `console.log` ao invés de enviar.
- **Subscription management:** `saveSubscription`, `removeSubscription`, `listSubscriptions`.
- **Cleanup automático:** subscriptions 410/404 são marcadas como `active=false`.

### 4. API Endpoints

| Rota | Método | Descrição |
|---|---|---|
| `/api/notifications` | `GET` | Lista paginada (cursor) + unreadCount |
| `/api/notifications/[id]/read` | `PATCH` | Marca única como lida |
| `/api/notifications/read-all` | `PATCH` | Marca todas (com filtro opcional) |
| `/api/notifications/preferences` | `GET`/`PATCH` | Lê/atualiza preferências |
| `/api/notifications/unsubscribe` | `GET`/`POST` | Processa token de unsubscribe |
| `/api/notifications/push` | `GET`/`POST`/`DELETE` | Gerencia push subscriptions |

Todos requerem auth via `getViewer()` (que aceita `x-dev-user-id` em dev).

### 5. Hook (`src/hooks/useCommunityNotifications.ts`)

**Opções:**
- `pollingInterval` (default 30000ms)
- `enableRealtime` (default false — Supabase Realtime é opt-in)
- `initialFilter`, `initialType`
- `onNewNotification`

**API:**
- `notifications`, `unreadCount`, `isLoading`, `error`, `connectionStatus`
- `fetch()`, `fetchMore()`, `refresh()`
- `markAsRead(id)`, `markAllAsRead(type?)`
- `isRealtimeActive`

**Otimizações:**
- Optimistic update no `markAsRead` (não bloqueia UX).
- Dedup via `knownIds` Set (evita disparar `onNewNotification` duplicado).
- Cleanup de intervals no unmount.

### 6. UI Components

**`NotificationBell`** (`src/components/community/NotificationBell.tsx`)
- Substitui o badge estático do CommunityNav.
- Mostra top 10 notificações mais recentes em dropdown.
- Click → marca como lida + navega pro entity.

**`/notifications` page** (`src/app/(community)/notifications/page.tsx`)
- Filtros: todas, não lidas, lidas, por tipo.
- Empty state (com CTA "explorar feed") + loading skeleton.
- Botão "Marcar todas como lidas".
- Link pra `/settings/notifications` (preferências).

---

## 🔐 Segurança & LGPD

- **Ownership check** — todo endpoint valida que `notification.userId === viewer.id` antes de mutar.
- **Token opaco de unsubscribe** — 32 bytes hex (256 bits de entropia), expira em 30 dias, single-use.
- **VAPID public key** — exposto via API pra subscription client-side; private key nunca exposto.
- **Rate limiting** — TODO (Phase 2): limite de emails por user/dia para evitar abuse.
- **Retenção de dados** — TODO (Phase 2): delete conta deve apagar notifications, preferences, push_subscriptions, unsubscribe_tokens.

---

## ⚙️ Variáveis de ambiente

```bash
# Email (Resend)
RESEND_API_KEY=re_xxx                  # production
NOTIFICATION_EMAIL_FROM="Akasha <no-reply@akasha.app>"

# Web Push (VAPID)
VAPID_PUBLIC_KEY=BGd...                # base64url, ~88 chars
VAPID_PRIVATE_KEY=abc...               # base64url, ~44 chars
VAPID_SUBJECT=mailto:admin@akasha.app  # contato do servidor

# URLs
NEXT_PUBLIC_APP_URL=https://akasha.app  # usado em links de unsubscribe
```

**Gerar VAPID keys:**

```bash
npx web-push generate-vapid-keys
```

---

## 🧪 Como testar localmente

### 1. Aplicar migration

```bash
psql "$DATABASE_URL" -f scripts/migrations/notifications.sql
```

### 2. (Opcional) Sincronizar Prisma schema

```bash
# Copie os modelos Notification estendido, NotificationPreference,
# PushSubscription, UnsubscribeToken de community.prisma para schema.prisma
pnpm db:generate
```

### 3. Rodar testes

```bash
pnpm test __tests__/notifications-api.test.ts
pnpm test __tests__/notification-triggers.test.ts
pnpm test __tests__/email-templates.test.ts
pnpm test __tests__/useCommunityNotifications.test.ts
```

### 4. Trigger manual de notificação (dev)

```ts
import { createNotification } from '@/lib/notifications';

// Em um endpoint de dev:
await createNotification({
  userId: 'dev-user-id',
  type: 'LIKE',
  actorId: 'other-user',
  payload: { preview: 'Test like', link: '/post/1' },
});
```

Em dev, emails/pushes são `console.log` ao invés de enviados (ver `src/lib/notifications/email.ts` e `push.ts`).

---

## 📋 Roadmap

### ✅ Implementado (Onda 3)

- [x] Schema Prisma estendido
- [x] Triggers com batching
- [x] API endpoints completos
- [x] Email via Resend + dev fallback
- [x] Push opt-in + VAPID
- [x] Hook com polling 30s
- [x] NotificationBell + page refatorada
- [x] Preferências granulares
- [x] Unsubscribe token + LGPD footer
- [x] Triggers wired em like/comment/follow

### 🚧 Próximas ondas

- [ ] **Digest semanal** — job cron que agrega GROUP_POST, ARTICLE_PUBLISHED, FOLLOW, LIKE em um email único.
- [ ] **Supabase Realtime por padrão** — substituir polling por SSE quando conectado.
- [ ] **Rate limiting** — limite por user/tipo/hora.
- [ ] **Soft delete de notifs** — limpar após 90 dias (job cron).
- [ ] **Ações inline** — "Aceitar convite", "Seguir de volta" direto da notif.
- [ ] **Notification sounds** — web audio API para eventos críticos.
- [ ] **Mobile push (FCM/APNs)** — quando app nativo sair.

---

## 🔗 Referências

- [EMAIL-TEMPLATES.md](./EMAIL-TEMPLATES.md) — Templates de email por tipo.
- [API-POSTS.md](./API-POSTS.md) — Endpoints que disparam triggers.
- [Supabase Realtime docs](https://supabase.com/docs/guides/realtime)
- [Web Push Protocol (RFC 8030)](https://datatracker.ietf.org/doc/html/rfc8030)
- [Resend API docs](https://resend.com/docs/api-reference/emails/send-email)
