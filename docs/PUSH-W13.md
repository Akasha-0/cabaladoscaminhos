# Web Push Notifications — Onda 13 (PUSH-W13)

> **Status:** ✅ DELIVERED (code complete) · ⚠️ TSC NOT RUN (env hang)
> **Data:** 2026-06-27
> **Autor:** Coder
> **Wave:** 13 — Real-time + Notifications (final push layer)
> **Refs:** `IDEIA.md` §Notificações, `docs/ARCHITECTURE-v3.md`, `src/lib/notifications/`

---

## 1. Resumo executivo

Implementação completa da camada **Web Push real** (RFC 8030 + VAPID) no Akasha Portal. Substitui o stub "logged" por um pipeline server-side baseado em [`web-push`](https://github.com/web-push-libs/web-push), persistido em `PushSubscription` (Prisma).

**Antes:**
- `src/lib/notifications/push.ts` — wrapper lazy com fallback a `console.log`.
- Endpoint `/api/notifications/push/subscribe` — **inexistente**.
- Endpoint `/api/notifications/push/test` — **inexistente**.
- Service Worker (`public/sw.js`) — já tinha handler `push`, mas sem `pushsubscriptionchange`.
- Trigger (`triggers.ts`) — chamava `sendPush` com fallback básico.

**Depois (esta entrega):**
- ✅ `src/lib/notifications/push-server.ts` — wrapper server-side real (`web-push` + Prisma).
- ✅ `src/app/api/notifications/push/subscribe/route.ts` — POST/GET/DELETE (VAPID pub key, save, remove).
- ✅ `src/app/api/notifications/push/test/route.ts` — POST dev-only (envia push de teste).
- ✅ `src/components/notifications/EnablePushButton.tsx` — CTA genérico (estilo botão flutuante).
- ✅ `src/components/notifications/HeaderPushButton.tsx` — pill no header (top-right).
- ✅ `src/app/layout.tsx` — adiciona `<HeaderPushButton />` + `<EnablePushButton />` fallback.
- ✅ `public/sw.js` — adiciona handler `pushsubscriptionchange` (sincroniza com backend).
- ✅ `src/lib/notifications/triggers.ts` — `dispatchPush` usa `push-server` com fallback ao legacy.
- ✅ `src/lib/notifications/index.ts` — barrel exportado com `push-server` (wins collisions).
- ✅ `src/lib/notifications/__tests__/push-server.test.ts` — testes enxutos (VAPID, subscribe, send).
- ✅ `package.json` — adiciona `web-push@^3.6.7` (devDep usada server-side).

---

## 2. Modelo de dados (já existente)

`PushSubscription` (Prisma, `prisma/schema.prisma`) — **sem mudanças**:

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique  // RFC 8030 — chave de dedup
  p256dh    String              // ECDH pub key (base64 url-safe)
  auth      String              // 16-byte auth secret (base64 url-safe)
  userAgent String?
  ipAddress String?
  active    Boolean  @default(true)
  lastSentAt DateTime?
  lastError  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
  @@index([active, userId])
  @@map("push_subscriptions")
}
```

---

## 3. Setup VAPID (uma vez por ambiente)

### 3.1 Gerar chaves

```bash
npx web-push generate-vapid-keys
```

Saída:
```
=======================================
Public Key:
BPdMq... (base64 url-safe, ~88 chars)
Private Key:
abc... (base64 url-safe, ~44 chars)
=======================================
```

### 3.2 Configurar `.env.local`

```bash
# Web Push (RFC 8030) — NUNCA commitar, NUNCA expor no client
VAPID_PUBLIC_KEY=BPdMq...your_public_key_here
VAPID_PRIVATE_KEY=abc...your_private_key_here
VAPID_SUBJECT=mailto:admin@akasha.app
# ou https://akasha.app (alguns browsers exigem URL válida)
```

### 3.3 Verificar (sanity check)

```bash
curl http://localhost:3000/api/notifications/push/subscribe
# → {"configured": true, "publicKey": "BPdMq..."}
```

---

## 4. API Reference

### 4.1 `GET /api/notifications/push/subscribe`

Retorna configuração VAPID para o client.

**Resposta (VAPID configurado):**
```json
{
  "configured": true,
  "publicKey": "BPdMq..."
}
```

**Resposta (VAPID ausente, dev):**
```json
{
  "configured": false,
  "message": "VAPID não configurado neste ambiente. Push funcionará em modo log (dev)."
}
```

### 4.2 `POST /api/notifications/push/subscribe`

Registra (ou atualiza) uma PushSubscription.

**Auth:** requerida.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/abc...",
  "keys": {
    "p256dh": "BCbase64...",
    "auth": "AAbase64..."
  }
}
```

**Resposta (sucesso):**
```json
{
  "ok": true,
  "id": "clxxx...",
  "created": true
}
```

`created: false` significa que o `endpoint` já existia — fizemos **update** (reativação).

### 4.3 `DELETE /api/notifications/push/subscribe`

Remove subscription por endpoint. **Idempotente** + **autorização** (só remove se pertence ao viewer).

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/abc..."
}
```

**Resposta:**
```json
{ "ok": true, "removed": true }
```

`removed: false` significa que não existia (idempotente — não é erro).

### 4.4 `POST /api/notifications/push/test` (DEV ONLY)

Envia push de teste para o usuário autenticado. Retorna **404 em produção** (oculta a rota).

**Auth:** requerida.
**Body (todos opcionais):**
```json
{
  "title": "Teste manual",
  "body": "Push de teste — se você está vendo, SW está ativo!",
  "url": "/dashboard"
}
```

**Resposta:**
```json
{
  "ok": true,
  "success": true,
  "sent": 1,
  "failed": 0,
  "channel": "sent"
}
```

`channel` pode ser `"sent"` (real), `"logged"` (dev sem VAPID), `"no-subscriptions"`, ou `"error"`.

---

## 5. Comportamento do `sendPush` (`src/lib/notifications/push-server.ts`)

| Cenário | `channel` | `success` | Notas |
|---------|-----------|-----------|-------|
| Sem subscriptions ativas | `no-subscriptions` | `true` | early return |
| Dev sem VAPID + tem subs | `logged` | `true` | `console.log` (não bloqueia) |
| Prod sem VAPID + tem subs | `error` | `false` | **bloqueia** — sem VAPID não autentica |
| web-push instalado + VAPID ok | `sent` | `failed===0 ? true : false` | Real, com tratamento de 404/410 |

**Cleanup automático:** subscriptions com 404/410 são marcadas `active=false` (mantém histórico).

---

## 6. Service Worker (`public/sw.js`)

Handlers adicionados/atualizados:

1. **`push`** (já existia) — renderiza `showNotification` com title/body/icon/actions.
2. **`pushsubscriptionchange`** (NOVO) — sincroniza com backend quando browser invalida subscription.
   - Re-subscreve via `PushManager.subscribe(...)` (usa mesma VAPID pub key).
   - POST `/api/notifications/push/subscribe` com nova sub.
   - DELETE endpoint antigo (se mudou).
3. **`notificationclick`** (já existia) — abre/foca janela, navega para URL do payload.

---

## 7. Triggers integration (`src/lib/notifications/triggers.ts`)

`dispatchPush` agora:

```ts
async function dispatchPush(dto, userId) {
  let result;
  try {
    result = await sendPushFromNotification(userId, dto);  // push-server
  } catch {
    result = await sendPushLegacy(prisma, userId, dto);     // fallback
  }
  // Marca pushedAt se delivered (sent OU logged em dev)
  if (result.channel === 'sent' || result.channel === 'logged') {
    await prisma.notification.update({
      where: { id: dto.id },
      data: { pushedAt: new Date() },
    });
  }
}
```

Comportamento preservado: `no-subscriptions` não bloqueia, `error` loga mas não atualiza `pushedAt`.

---

## 8. UI — Botões de opt-in

### 8.1 `HeaderPushButton` (header-aware)

Renderiza no canto superior direito (`fixed top-3 right-3 z-40`):

| State | Visual |
|-------|--------|
| Idle (sem sub) | 🟡 "Ativar notificações" (amber pill) |
| Requesting | ⚪ Loader (spinner) |
| Subscribing | ⚪ Loader |
| Subscribed | 🟢 "On" (emerald pill) |
| Denied | ⚫ "Bloq." (zinc) |
| Error | 🔴 "Retry" (red) |
| Unsupported / sem auth | (não renderiza) |

### 8.2 `EnablePushButton` (fallback flutuante)

Posicionado `fixed bottom-4 left-4 z-30 shadow-lg`. Aparece mesmo sem header — útil para testes isolados.

Ambos compartilham a mesma máquina de estado (callback `handleEnable`).

---

## 9. Fluxo end-to-end (browser)

```
1. User clica "Ativar notificações"
   ↓
2. Notification.requestPermission() → "granted"
   ↓
3. navigator.serviceWorker.ready → Registration
   ↓
4. GET /api/notifications/push/subscribe → { configured, publicKey }
   ↓
5. reg.pushManager.subscribe({
     userVisibleOnly: true,
     applicationServerKey: <VAPID pub key>
   })
   ↓
6. POST /api/notifications/push/subscribe {
     endpoint, keys: { p256dh, auth }
   }
   ↓
7. Backend salva em PushSubscription (userId, endpoint, p256dh, auth, ...)
   ↓
8. ✅ Estado: subscribed
```

**Quando chega push real:**

```
Server (web-push.sendNotification) → FCM/Mozilla Push Service → Browser
   ↓
SW 'push' event → self.registration.showNotification(...)
   ↓
User click → SW 'notificationclick' → clients.openWindow(payload.url)
```

---

## 10. Testes

### 10.1 Unit (`src/lib/notifications/__tests__/push-server.test.ts`)

Cobertura cirúrgica (5 grupos, ~10 testes):

- **VAPID config:** missing/one-key/both-keys
- **subscribeUser:** new + update (dedup por endpoint)
- **unsubscribeUser:** exists + not-found (idempotente)
- **sendPush:** no-subscriptions, logged (dev sem VAPID), error (prod sem VAPID)

### 10.2 Manual smoke test

```bash
# 1. Garantir VAPID em .env.local
# 2. Dev server rodando
pnpm dev

# 3. Browser:
#    a. Login
#    b. Clica "Ativar notificações" no header
#    c. Aceita permissão

# 4. Em outro terminal:
curl -X POST http://localhost:3000/api/notifications/push/test \
  -H "Content-Type: application/json" \
  -H "x-dev-user-id: <your-test-user-id>" \
  -d '{"title":"Teste","body":"Funcionando!"}'
# → {"ok":true,"sent":1,"channel":"sent"}
```

---

## 11. Troubleshooting

| Sintoma | Causa provável | Fix |
|---------|----------------|-----|
| `channel: "error"` em prod | VAPID ausente | Setar `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` no host |
| `channel: "error"` + `web-push module not available` | `web-push` não instalado | `pnpm add -D web-push` (já está no package.json) |
| Browser não pede permissão | Sem HTTPS | Web Push exige HTTPS (ou `localhost`) |
| Subscription expira rápido (404) | Browser revogou permissão | Backend desativa automaticamente (cleanup) |
| Push chega mas SW não mostra | SW desatualizado | Recarregar página (skipWaiting) |
| VAPID_SUBJECT inválido | mailto: mal formado | Usar `mailto:admin@yourdomain.com` ou `https://yourdomain.com` |

---

## 12. Limites conhecidos

1. **Dependência de `web-push` instalada:** se faltar em ambiente self-hosted, o `import('web-push')` falha com `error: web-push module not available`. Solução: build-time check ou pino de versão.
2. **Sem retry queue:** se o send falha por rede (5xx transitório), não retentamos. Próximo push tentará novamente.
3. **Sem TTL configurável:** hardcoded em 24h. Suficiente para notificações de comunidade.
4. **Sem rate-limit por usuário:** confiamos no batching do trigger + `sendPush` ser rápido.
5. **Sem suporte a `topic` no payload:** Chrome extension API permite agrupar notificações. Não usado (basta `tag` para dedup visual).

---

## 13. Próximos passos (fora do escopo W13)

- [ ] **Cron de limpeza:** subscription inativa há >90 dias → DELETE (LGPD-friendly).
- [ ] **Telemetria:** dashboard de push delivery rate (sent/failed/expired).
- [ ] **Quiet hours:** respeitar `prefs.quietHours` antes de enviar.
- [ ] **A/B test de copy:** template variants por tipo de notificação.
- [ ] **iOS Push (Safari 16.4+):** já suportado se o usuário "adicionar à tela inicial".

---

## 14. Arquivos modificados/criados

### Criados
- `src/lib/notifications/push-server.ts` (novo, ~300 linhas)
- `src/app/api/notifications/push/subscribe/route.ts` (novo, ~140 linhas)
- `src/app/api/notifications/push/test/route.ts` (novo, ~95 linhas)
- `src/components/notifications/EnablePushButton.tsx` (novo, ~250 linhas)
- `src/components/notifications/HeaderPushButton.tsx` (novo, ~210 linhas)
- `src/lib/notifications/__tests__/push-server.test.ts` (novo, ~155 linhas)
- `scripts/check-tsc.sh` (novo, helper)
- `docs/PUSH-W13.md` (este arquivo)

### Modificados
- `package.json` — adiciona `web-push@^3.6.7` (devDep)
- `src/lib/notifications/triggers.ts` — `dispatchPush` usa `push-server` com fallback
- `src/lib/notifications/index.ts` — barrel re-exporta `push-server` antes de `push`
- `src/app/layout.tsx` — adiciona `<HeaderPushButton />` + `<EnablePushButton />`
- `public/sw.js` — adiciona handler `pushsubscriptionchange`

---

## 15. Verification status

- ✅ **Código criado e inspecionável** (todos os arquivos lidos e revisados).
- ⚠️ **TSC NÃO EXECUTADO** — ambiente sandbox com I/O hang durante `pnpm tsc`. **BLOCKED**.
- ⚠️ **Commit NÃO aplicado** — `git status` não pôde ser executado. **BLOCKED**.
- ⚠️ **Push NÃO testado em browser real** — requer `pnpm install` + `pnpm dev` + interação humana.

**Para destravar:**
1. Ambiente com I/O estável → rodar `pnpm install` + `pnpm tsc` + `pnpm test:run src/lib/notifications/__tests__/push-server.test.ts`.
2. Gerar VAPID keys e setar no `.env.local`.
3. Smoke test manual (seção 10.2).
4. `git add -A && git commit -m "feat(notifications): Web Push real com web-push lib"`.

**Honesto: nada foi commitado ainda.** Ver `docs/PUSH-W13.md` §15 para detalhes do bloqueio.
