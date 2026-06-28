# APIs Push + Upload + Admin Audit + Events RSVP — Wave 21

**Wave:** 21 (2026-06-28)
**Branch:** main
**Status:** ✅ Implementado (7 endpoints)
**Refs:** W19 audit, W13 push foundations, W20 admin, Wave 11 LGPD audit log

---

## Visão Geral

A W19 audit identificou 10+ APIs faltantes no escopo de push notifications, upload de mídia, auditoria administrativa e RSVP de eventos. Este wave preenche 7 dessas lacunas com um escopo cirúrgico — sem dependências novas, sem quebra de contratos existentes.

| Endpoint                                  | Método | Auth     | Função                                          |
| ----------------------------------------- | ------ | -------- | ----------------------------------------------- |
| `/api/push/vapid-public-key`              | GET    | Pública  | Retorna VAPID public key (RFC 8030 setup)       |
| `/api/push/subscribe`                     | POST   | Required | Persiste PushSubscription                       |
| `/api/push/subscribe`                     | DELETE | Required | Remove PushSubscription (idempotente)           |
| `/api/upload`                             | POST   | Required | Upload mídia (image/video/audio, ≤ 50MB)        |
| `/api/notifications/unread-count`         | GET    | Required | Contador de não-lidas (badge da UI)             |
| `/api/admin/audit/log`                    | GET    | Admin    | Lista audit logs (LGPD Art. 37) + export CSV   |
| `/api/events/[id]/rsvp`                   | POST   | Required | RSVP 3-estados (going/maybe/declined)           |

**Não implementadas nesta wave (fora de escopo W21):**
- `/api/push/send` (server-only, não é API pública)
- `/api/push/test` (testes admin usam diretamente `sendPush()`)
- `/api/admin/audit/export` (CSV já embutido em `/log?format=csv`)
- `/api/events/[id]/cancel` (operação admin-only; backlog)

---

## 1. Push Notifications

### `GET /api/push/vapid-public-key`

**Função:** Expõe a VAPID public key para o browser iniciar `pushManager.subscribe()`.
**Auth:** Pública (por design — chave pública é pública no RFC 8030).
**Cache:** `public, s-maxage=3600, stale-while-revalidate=86400`.

**Resposta 200:**
```json
{
  "data": {
    "publicKey": "BPx9a7c...",
    "available": true
  },
  "meta": { "timestamp": "2026-06-28T...", "length": 87 }
}
```

**Resposta 503 (sem VAPID configurado):**
```json
{
  "error": {
    "code": 5000,
    "message": "Push notifications não configuradas (VAPID ausente). Defina VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY no servidor."
  }
}
```

**Configuração:**
```bash
# Gerar chaves VAPID (uma vez):
npx web-push generate-vapid-keys

# .env (server-only):
VAPID_PUBLIC_KEY=BPx9a7c...          # exposta no client via este endpoint
VAPID_PRIVATE_KEY=...                 # NUNCA expor
VAPID_SUBJECT=mailto:admin@akasha.app # ou https://akasha.app
```

**Cliente (uso típico):**
```ts
const res = await fetch('/api/push/vapid-public-key');
const { data } = await res.json();
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: data.publicKey,
});
await fetch('/api/push/subscribe', {
  method: 'POST',
  body: JSON.stringify({
    endpoint: sub.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
      auth: arrayBufferToBase64(sub.getKey('auth')),
    },
  }),
});
```

---

### `POST /api/push/subscribe`

**Função:** Persiste PushSubscription do browser no Prisma.
**Auth:** Required (requireViewer).
**Idempotente:** re-subscribe atualiza a chave e reativa.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wt...",
    "auth": "tBHItJI5svbpez7KI4CCXg=="
  }
}
```

**Resposta 201 (novo):**
```json
{
  "data": {
    "id": "ck123abc...",
    "endpoint": "https://fcm.googleapis.com/...",
    "created": true
  }
}
```

**Resposta 200 (já existia):**
```json
{
  "data": { "id": "ck123abc...", "endpoint": "...", "created": false }
}
```

**Resposta 400 (schema inválido):** `{ "error": { "code": 4002, "message": "Dados inválidos", "details": { "issues": [...] } } }`
**Resposta 401:** `{ "error": { "code": 4001, "message": "Você precisa estar logado..." } }`

---

### `DELETE /api/push/subscribe`

**Função:** Remove PushSubscription.
**Auth:** Required (requireViewer).
**Idempotente:** retorna `removed=false` se já não existia.
**Ownership:** 403 se a subscription pertence a outro user.

**Body:**
```json
{ "endpoint": "https://fcm.googleapis.com/fcm/send/..." }
```

**Resposta 200:**
```json
{ "data": { "endpoint": "https://fcm.googleapis.com/...", "removed": true } }
```

---

## 2. Upload de Mídia

### `POST /api/upload`

**Função:** Recebe multipart/form-data, valida tipo/tamanho, sobe para Supabase Storage, retorna URL pública.
**Auth:** Required.
**Rate limit:** 20 uploads / hora / user (in-memory).
**Storage:** Supabase Storage bucket `post-media` (service role).

**Body (multipart/form-data):**
- `file` (obrigatório): um único arquivo.

**Validações:**
- MIME deve começar com `image/`, `video/` ou `audio/`
- Tamanho: 1 byte – 50 MB
- Bucket `post-media` deve existir (senão → 503)

**Resposta 201:**
```json
{
  "data": {
    "url": "https://your-project.supabase.co/storage/v1/object/public/post-media/user-abc/uuid.jpg",
    "path": "user-abc/uuid.jpg",
    "kind": "image",
    "mimeType": "image/jpeg",
    "size": 245678,
    "filename": "foto.jpg"
  },
  "meta": {
    "userId": "user-abc",
    "rateLimitRemaining": 19
  }
}
```

**Erros:**
- 400 — sem `file`, MIME inválido, > 50MB
- 401 — sem auth
- 429 — rate limit (ver `meta.rateLimitRemaining`)
- 503 — Storage não configurado (`SUPABASE_SERVICE_ROLE_KEY` ausente)
- 500 — falha no upload

**Cliente (uso típico):**
```ts
const fd = new FormData();
fd.append('file', file);
const res = await fetch('/api/upload', { method: 'POST', body: fd });
const { data } = await res.json();
await fetch('/api/posts', {
  method: 'POST',
  body: JSON.stringify({ content: '...', mediaUrls: [data.url] }),
});
```

**Path do storage:** `post-media/{userId}/{uuid}.{ext}` — segmentado por user para facilitar cleanup futuro via RLS / cron.

**Auditoria:** cada upload grava `AuditLog { actorId, action: POST_CREATED, metadata: { event: 'media_upload', kind, size, ... } }` (best-effort — não bloqueia response).

**Setup do bucket (one-time):**
```sql
-- No SQL Editor do Supabase:
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

create policy "Users can upload own media"
on storage.objects for insert
to authenticated
using (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public read of post-media"
on storage.objects for select
to public
using (bucket_id = 'post-media');
```

---

## 3. Notifications

### `GET /api/notifications/unread-count`

**Função:** Contador de notificações não-lidas para o badge da UI.
**Auth:** Required.
**Cache:** `private, max-age=10` (browser revalida a cada 10s).

**Resposta 200:**
```json
{ "data": { "count": 7 }, "meta": { "userId": "user-abc" } }
```

**Cliente (uso típico):**
```ts
const { data } = await fetch('/api/notifications/unread-count').then(r => r.json());
setBadge(data.count);
```

**Por que cache de 10s e não 0?**
- Reduz queries (índice composto `userId, read, createdAt` cobre, mas conta-se muitas rows)
- Badge atualiza "quase em tempo real" sem polling agressivo
- Browser revalida via `If-None-Match` se evoluirmos para ETag (backlog)

---

## 4. Admin Audit Log

### `GET /api/admin/audit/log`

**Função:** Lista AuditLog com filtros + export CSV (LGPD Art. 37 — direito de acesso do titular).
**Auth:** Admin only (verifica `ADMIN_EMAILS` env OU `User.planoAssinatura='ADMIN'`).
**Formato:** JSON (default) ou CSV via `?format=csv`.

**Query params:**
- `userId` — filtra `actorId`
- `targetId` — filtra `targetId`
- `action` — enum `AuditAction` (ex: `LOGIN_SUCCESS`, `POST_CREATED`, `ADMIN_USER_BAN`)
- `dateFrom` — ISO 8601 (`createdAt >= dateFrom`)
- `dateTo` — ISO 8601 (`createdAt <= dateTo`)
- `page` — 1-based (default 1)
- `pageSize` — default 50, max 500
- `format` — `json` (default) | `csv`

**Resposta 200 (JSON):**
```json
{
  "data": [
    {
      "id": "ck123...",
      "actorId": "user-abc",
      "targetId": null,
      "action": "POST_CREATED",
      "metadata": { "postType": "TEXT", "hasMedia": false },
      "requestId": "req-...",
      "createdAt": "2026-06-28T01:30:00.000Z"
    }
  ],
  "meta": { "total": 1234, "page": 1, "pageSize": 50, "adminEmail": "admin@akasha.app" }
}
```

**Resposta 200 (CSV):**
```csv
id,actorId,targetId,action,requestId,createdAt,metadata
ck123...,user-abc,,POST_CREATED,req-...,2026-06-28T01:30:00.000Z,"{""postType"":""TEXT""}"
```
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="audit-log-2026-06-28.csv"`

**Erros:**
- 403 — não-admin (`requireAdmin` retorna `not_admin` ou `config_error`)

**Cliente (uso típico):**
```ts
// Dashboard admin — listagem paginada
const res = await fetch('/api/admin/audit/log?action=ADMIN_USER_BAN&page=1');
const { data, meta } = await res.json();

// Solicitação LGPD — export CSV
window.location = '/api/admin/audit/log?userId=alvo&format=csv';
```

**Política de retenção (Wave 11 — SECURITY-AUDIT):**
- AUTH/CONTENT: 12 meses
- LGPD: 24 meses
- Cron de purga é backlog W22

---

## 5. Events RSVP

### `POST /api/events/[id]/rsvp`

**Função:** RSVP 3-estados para eventos da comunidade.
**Auth:** Required.
**Substitui:** `/api/events/[id]/join` (legacy) — `/join` continua funcionando, mas apenas com semântica `going`.

**Body:**
```json
{ "status": "going" | "maybe" | "declined" }
```
(lowercase para ergonomia; mapeado para enum `EventRsvpStatus`.)

**Semântica:**
| Status      | Cria EventParticipant? | Incrementa `participantsCount`? | Dispara notif host? |
| ----------- | ---------------------- | ------------------------------- | ------------------- |
| `going`     | Sim (ou atualiza)      | Sim (se mudou de outro status)  | Sim (1ª vez)        |
| `maybe`     | Sim (ou atualiza)      | Não                             | Não                 |
| `declined`  | Sim (ou atualiza)      | Não                             | Não                 |

**Resposta 200:**
```json
{
  "data": {
    "eventId": "evt123",
    "userId": "user-abc",
    "status": "GOING",
    "changed": true,
    "participantsCount": 12
  }
}
```

**Erros:**
- 400 — ID inválido, schema inválido
- 401 — sem auth
- 404 — evento não existe
- 409 — `EventFullError` (going em evento lotado), `EventAlreadyStartedError`, `EventHostCannotChangeRsvpError` (host não muda o próprio RSVP — já conta como going)

**Schema migration:** `prisma/migrations/20260628_000000_event_rsvp_status/migration.sql`
- Adiciona enum `EventRsvpStatus` (GOING, MAYBE, DECLINED)
- Adiciona coluna `status` (default GOING — retro-compatível) e `statusUpdatedAt` em `event_participants`
- Adiciona índice composto `(eventId, status)` para queries do tipo "listar going de um evento"

**Cliente (uso típico):**
```ts
await fetch(`/api/events/${eventId}/rsvp`, {
  method: 'POST',
  body: JSON.stringify({ status: 'going' }),
});
```

**Side-effects:**
1. `Event.participantsCount` é ajustado conforme delta (going ↔ maybe/declined).
2. Se primeira transição para `going`, dispara `Notification` (type=SYSTEM_ALERT, kind=event_rsvp) para o host (best-effort).

---

## Compatibilidade e Migração

**Sem breaking changes:**
- `/api/events/[id]/join` continua funcionando (mapeado para `going`).
- `EventDto.viewerIsParticipant` continua true quando `status === GOING`.
- `EventParticipant.joinedAt` preservado.

**Novos campos DTO:**
- `EventDto.viewerRsvpStatus`: `'GOING' | 'MAYBE' | 'DECLINED' | null`
- `EventParticipantDto.status`: enum Prisma
- `EventParticipantDto.statusUpdatedAt`: ISO 8601

**DB migration (DBA):**
```bash
cd cabaladoscaminhos
npx prisma migrate deploy   # aplica 20260628_000000_event_rsvp_status
npx prisma generate          # regenera client com EventRsvpStatus
```

---

## Variáveis de Ambiente

| Var                          | Onde                  | Obrigatória?       | Notas                                        |
| ---------------------------- | --------------------- | ------------------ | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`   | server + client       | Sim                | URL do projeto Supabase                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | server + client    | Sim                | Anon key (RLS é linha de defesa)             |
| `SUPABASE_SERVICE_ROLE_KEY`  | server only           | Sim (para upload)  | Bypassa RLS — usar só em rotas autenticadas |
| `VAPID_PUBLIC_KEY`           | server (exposta)      | Para push          | Gerar com `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY`          | server only           | Para push prod     | NUNCA expor                                  |
| `VAPID_SUBJECT`              | server only           | Para push prod     | `mailto:admin@akasha.app`                    |
| `ADMIN_EMAILS`               | server only           | Sim (admin routes) | Lista separada por vírgula                   |

---

## Testes Manuais Recomendados

```bash
# 1. Push subscribe (precisa de VAPID configurado)
curl -X POST http://localhost:3000/api/push/subscribe \
  -H "Content-Type: application/json" \
  -H "x-dev-user-id: dev-user-1" \
  -d '{"endpoint":"https://fcm.googleapis.com/fcm/send/dummy","keys":{"p256dh":"BNcRd...","auth":"tBHI..."}}'

# 2. VAPID key (sem auth)
curl http://localhost:3000/api/push/vapid-public-key

# 3. Unread count
curl http://localhost:3000/api/notifications/unread-count \
  -H "x-dev-user-id: dev-user-1"

# 4. Upload (substituir <FILE> por um JPEG real)
curl -X POST http://localhost:3000/api/upload \
  -H "x-dev-user-id: dev-user-1" \
  -F "file=@<FILE>"

# 5. Admin audit log (precisa ADMIN_EMAILS configurado)
curl "http://localhost:3000/api/admin/audit/log?action=POST_CREATED&page=1" \
  -b "sb-access-token=..."

# 6. RSVP
curl -X POST http://localhost:3000/api/events/evt123/rsvp \
  -H "Content-Type: application/json" \
  -H "x-dev-user-id: dev-user-1" \
  -d '{"status":"going"}'
```

---

## Limitações Conhecidas

1. **Upload rate-limit é in-memory.** Em serverless multi-instância, o limite real é `20 × instâncias`. Trocar por Upstash Redis em prod (já temos `ioredis` instalado).
2. **Audit log retention cron** não está implementado. Backlog W22.
3. **Push só suporta Web Push API.** Nativo iOS/Android via mesma subscription não funciona (precisa de provider específico). Fora de escopo.
4. **`/api/upload` usa bucket público.** Para mídia privada, evoluir para signed URLs (issue separada).
5. **CSV export não pagina.** `pageSize` aplica antes do CSV; para export completo, iterate `?page=1&pageSize=500` em loop ou exportar via script DBA.

---

## Arquivos Criados/Modificados

```
src/app/api/push/subscribe/route.ts                    [NEW] POST+DELETE
src/app/api/push/vapid-public-key/route.ts             [NEW] GET
src/app/api/upload/route.ts                            [NEW] POST
src/app/api/notifications/unread-count/route.ts        [NEW] GET
src/app/api/admin/audit/log/route.ts                   [NEW] GET
src/app/api/events/[id]/rsvp/route.ts                  [NEW] POST
src/lib/supabase-admin.ts                              [NEW] client helper
src/lib/community/events.ts                            [MOD] +status handling
prisma/schema.prisma                                   [MOD] +EventRsvpStatus
prisma/migrations/20260628_000000_event_rsvp_status/  [NEW] SQL
docs/APIS-PUSH-W21.md                                  [NEW] this file
```

**Total:** 9 arquivos novos, 2 modificados, 1 migration SQL.