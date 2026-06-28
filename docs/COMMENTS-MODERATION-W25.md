# Wave 25 — Comments Moderation (2026-06-28)

## TL;DR

Wave 25 entrega o **mínimo viável de moderação de comentários**: usuários
autenticados podem **reportar** comentários; moderadores (papel `MODERATOR`)
e admins (papel `ADMIN`) podem **ver e agir** (hide / dismiss / delete) na
fila `/admin/moderation`.

**Escopo entregue:**

| Item | Status | Onde |
|---|---|---|
| Schema `User.isModerator` + migration | ✅ novo | `prisma/schema.prisma`, `prisma/migrations/20260628_user_is_moderator/migration.sql` |
| `POST /api/comments/[id]/report` | ✅ novo | `src/app/api/comments/[id]/report/route.ts` |
| `GET /api/admin/moderation/queue` | ✅ já existia (Wave 20) — gate atualizado para `requireModerator` | `src/app/api/admin/moderation/queue/route.ts` |
| `POST /api/admin/moderation/flags/[id]/resolve` | ✅ já existia (Wave 20) — gate atualizado para `requireModerator` | `src/app/api/admin/moderation/flags/[id]/route.ts` |
| `POST /api/admin/flags/[id]/action` | ✅ já existia — gate atualizado para `requireModerator` (era `requireAdmin`) | `src/app/api/admin/flags/[id]/action/route.ts` |
| Página `/admin/moderation` | ✅ já existia (Wave 20) — gate atualizado para `requireModerator` | `src/app/(admin)/moderation/page.tsx` |
| Botão "Denunciar" no `CommentThread` | ✅ já existia (Wave 14/20) — `FlagButton` + `FlagModal` | `src/components/moderation/FlagButton.tsx`, `FlagModal.tsx` |
| Wire do botão para endpoint novo | ✅ ATUALIZADO — `FlagModal` agora chama `/api/comments/[id]/report` para `targetType='COMMENT'` | `src/components/moderation/FlagModal.tsx` |
| Helper `requireModerator()` | ✅ novo | `src/lib/admin/session.ts` |
| Rate limiting | ✅ 10 reports/min por userId (anti-spam) | `src/lib/rate-limit.ts` (já existia), aplicado na rota nova |
| Auditoria | ✅ AuditLog `COMMENT_DELETED` (proxy) com metadata `event=COMMENT_REPORTED` | implícito na rota de report |

**Rotas adicionadas:** 1 (report). **Rotas atualizadas:** 4. **Helpers novos:** 1 (`requireModerator`).

---

## 1. Schema Prisma

### Mudança em `User` (aditiva)

```prisma
model User {
  // ... campos existentes ...
  isModerator Boolean @default(false)  // ← NOVO (Wave 25)
}
```

**Migration:** `prisma/migrations/20260628_user_is_moderator/migration.sql`
- `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN NOT NULL DEFAULT FALSE;`
- `CREATE INDEX IF NOT EXISTS idx_users_is_moderator ON users(is_moderator);`
- Idempotente e verificado em bloco `DO $$`.

### Modelo `Flag` (já existente, Wave 14)

A moderação de comentários **reusa** o modelo `Flag` unificado (não cria um
`CommentReport` paralelo — violaria a consistência do schema). Flags com
`targetType='COMMENT'` são os "CommentReports" do W25.

| Campo | Tipo | Uso |
|---|---|---|
| `id` | cuid | PK |
| `targetType` | enum | `COMMENT` (W25 foca aqui) |
| `targetId` | string | `commentId` |
| `reporterId` | string | quem denunciou |
| `reason` | enum | `SPAM \| HARASSMENT \| MISINFO \| OTHER` |
| `description` | text? | contexto opcional (≤ 500 chars) |
| `status` | enum | `PENDING \| REVIEWED \| ACTIONED \| DISMISSED` |
| `createdAt` | timestamp | fila ordenada por este |
| `reviewedAt` | timestamp? | quando moderador agiu |
| `reviewerId` | string? | moderador/admin que resolveu |
| `actionTaken` | string? | `dismiss \| hide \| delete \| warn` |

---

## 2. RBAC — quem vê o quê

### Papéis

- **`USER`** (default): pode reportar comentários. Não vê a fila.
- **`MODERATOR`** (`User.isModerator = true`): pode ver a fila e tomar
  ações (`hide` / `dismiss` / `delete` / `warn`) **em qualquer flag**.
- **`ADMIN`** (env `ADMIN_EMAILS` OU `User.planoAssinatura='ADMIN'`):
  super-set — pode tudo que moderador pode + acesso a outros painéis admin.

### Helper `requireModerator()`

Localizado em `src/lib/admin/session.ts`. Retorna shape discriminado:

```ts
type ModeratorSessionResult =
  | { ok: true; userId; email; role: 'ADMIN' | 'MODERATOR' }
  | { ok: false; reason: 'no_session' | 'not_admin' | 'not_moderator' | 'config_error' };
```

Política de resolução:
1. Tenta `requireAdmin()` primeiro — se OK, retorna `role='ADMIN'`.
2. Em prod com `ADMIN_EMAILS` faltando → `config_error` (fail-closed).
3. Caso contrário, carrega `User.isModerator` do DB. Se `true` → `role='MODERATOR'`.

### Aplicação do gate

| Endpoint | Gate |
|---|---|
| `POST /api/comments/[id]/report` | `supabase.auth.getUser()` (qualquer logado) + rate limit |
| `GET /api/admin/moderation/queue` | `requireModerator()` |
| `POST /api/admin/moderation/flags/[id]/resolve` | `requireModerator()` |
| `POST /api/admin/flags/[id]/action` | `requireModerator()` |
| `GET /admin/moderation` (página) | `requireModerator()` + redirect se não OK |

---

## 3. API Endpoints

### `POST /api/comments/[id]/report` (NOVO)

**Body:**
```json
{
  "reason": "SPAM" | "HARASSMENT" | "MISINFO" | "OTHER",
  "description": "string opcional ≤ 500 chars"
}
```

**Comportamento:**
- Requer user autenticado (Supabase auth).
- Rate limit: **10 reports/min** por `userId` (anti-spam de denúncia).
- Valida `commentId` existe e não está `deletedAt`.
- **Anti self-report**: se `comment.authorId === userId` → 400.
- **Idempotência**: se já existe `Flag PENDING` do mesmo user pro mesmo
  comment, devolve a existente com `alreadyReported: true` (200). Evita
  duplicata por double-click.
- Cria `Flag` com `targetType='COMMENT'` + `auditLog` (best-effort).

**Response 201:**
```json
{
  "data": {
    "id": "ckxxx",
    "reason": "SPAM",
    "description": null,
    "alreadyReported": false,
    "createdAt": "2026-06-28T07:35:00.000Z"
  },
  "meta": { "commentId": "...", "rateLimitRemaining": 9 }
}
```

**Errors:**
- `401 UNAUTHORIZED` — não logado.
- `404 NOT_FOUND` — comentário não existe / já foi removido.
- `400 BAD_REQUEST` — body inválido, ou self-report.
- `429 RATE_LIMIT_EXCEEDED` — 10 reports em 60s.

### `GET /api/admin/moderation/queue` (existente, gate novo)

**Query:** `?status=PENDING|REVIEWED|ACTIONED|DISMISSED&limit=50`
**Auth:** `requireModerator()`. Retorna 403 se não OK.

### `POST /api/admin/moderation/flags/[id]/resolve` (existente, gate novo)

**Body:** `{ "action": "dismiss" | "hide" | "delete" | "warn" }`
**Auth:** `requireModerator()`.

Efeitos:
- `dismiss` → `flag.status=DISMISSED`, sem efeito no conteúdo.
- `hide`/`delete` → `flag.status=ACTIONED` + `Comment.deletedAt=now()` (soft-delete).
- `warn` → `flag.status=ACTIONED`, no-op no alvo (Wave 21 tinha planejado
  notif; ficou no-op no W25).

### `POST /api/admin/flags/[id]/action` (existente, gate novo)

Endpoint legado do Wave 14 com semântica similar ao `/resolve`. **Gate
atualizado de `requireAdmin` para `requireModerator`** para paridade.

---

## 4. UI

### Botão "Denunciar"

Já existe em `src/components/community/CommentThread.tsx:189` (wave 14).
Renderiza `<FlagButton targetType="COMMENT" targetId={comment.id} />`.

**Mudança W25:** `FlagModal.handleSubmit` agora roteia por `targetType`:
- `COMMENT` → `POST /api/comments/${targetId}/report` (corpo: `{reason, description}`).
- Outros (`POST`/`USER`/`GROUP`) → mantém fallback em `POST /api/flags`
  (handler de content report nesses targets é trabalho futuro, fora do W25).

### Página `/admin/moderation`

Já existe em `src/app/(admin)/moderation/page.tsx` (Wave 20). **Gate
atualizado** para `requireModerator()` — redireciona para
`/auth/login?next=/admin/moderation&reason=not_authorized` se não OK.

UI mostra:
- Header com contagem total + breakdown por `reason` (SPAM/HARASSMENT/MISINFO/OTHER).
- `<ModerationQueue>` com lista de flags + botões de ação.

---

## 5. Auditoria & Segurança

### Audit log

Cada `POST /api/comments/[id]/report` registra:
```ts
auditLog.create({
  actorId: userId,
  targetId: commentId,
  action: 'COMMENT_DELETED', // proxy — não temos COMMENT_REPORTED no enum ainda
  metadata: {
    event: 'COMMENT_REPORTED',
    flagId, reason, hasDescription,
  }
})
```

Cada ação de moderador (resolve/action) registra `ADMIN_CONTENT_REMOVE` (ou
`ADMIN_USER_BAN` como proxy para `warn`) com metadata incluindo
`actorRole: 'ADMIN' | 'MODERATOR'`.

### Rate limiting

- 10 reports/min por userId (proteção contra spam coordenado).
- Aplicado **antes** do `prisma.findUnique` (rejeição barata).
- Reset é global (Map in-memory); suficiente para MVP. Em produção
  multi-instância, migrar para Upstash Redis (já temos skill `security`
  documentando — ver TODO abaixo).

### LGPD / privacidade do reporter

- Reporter nunca é exposto publicamente (anti-retaliação).
- Reporter vê status da própria denúncia apenas no próprio perfil
  (não implementado nesta wave — TODO futuro).
- Apenas moderadores veem o `reporterId` internamente.

### Validação

- `Comment.deletedAt IS NULL` é checado antes de aceitar report (não
  desperdiça moderation budget em conteúdo já removido).
- `comment.authorId === userId` é rejeitado (anti self-report — não faz
  sentido e abre vetor de ruído na fila).

---

## 6. Como promover alguém a moderador (manual)

**Por enquanto, sem UI.** Operacional via DB:

```sql
UPDATE users SET is_moderator = true WHERE email = 'alice@example.com';
```

Validação:
```sql
SELECT email, is_moderator FROM users WHERE is_moderator = true;
```

**TODO Wave futura:** rota admin `POST /api/admin/users/[id]/role` para
promover/rebaixar (com audit log de mudança de papel).

---

## 7. Como testar manualmente

### Reportar (precisa estar logado)

```bash
TOKEN="<supabase-access-token>"
COMMENT_ID="<commentId-alvo>"
curl -sX POST "http://localhost:3000/api/comments/$COMMENT_ID/report" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"SPAM","description":"link de phishing no comentário"}' | jq
```

### Ver fila (precisa ser ADMIN ou MODERATOR)

```bash
curl -s "http://localhost:3000/api/admin/moderation/queue?status=PENDING&limit=20" \
  -H "Cookie: sb-access-token=$TOKEN" | jq
```

### Resolver (precisa ser ADMIN ou MODERATOR)

```bash
FLAG_ID="<flagId>"
curl -sX POST "http://localhost:3000/api/admin/moderation/flags/$FLAG_ID/resolve" \
  -H "Cookie: sb-access-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"hide"}' | jq
```

---

## 8. FORA de escopo (deferred)

| Feature | Por que não W25 | Próxima wave plausível |
|---|---|---|
| Auto-moderação por IA (classificação de reports) | Fora do escopo do MVP; humano decide. | W26+ se houver volume justificando |
| Strike / ban system (3 strikes = ban) | Mudança estrutural, precisa de modelo `UserStrike` + cooldown. | W27 |
| Notificação ao autor do comentário ("seu comentário foi ocultado") | Precisamos adicionar `COMMENT_HIDDEN_NOTIFICATION` ao enum NotificationType. | W26 (paralelo à notif de eventos) |
| Appeal flow ("autor pede revisão") | Precisa de `CommentAppeal` model + estado novo. | W28 |
| Promover moderador via UI admin | Spec não pediu. Manual via DB por enquanto. | W26 |
| Report de POST / USER / GROUP via endpoint dedicado | Spec W25 cobre só COMMENT. Endpoints `/api/posts/[id]/report` etc. ficam para wave futura. | W26 |
| Reporter vê status da própria denúncia no perfil | Requer rota `GET /api/flags?reporterId=me`. | W26 |
| Rate limit distribuído (Upstash) | Map in-memory funciona no MVP single-instance; precisa migrar para prod. | Antes de ir a prod |
| Migration aplicada | W25 não roda migrations em prod. Owner aplica manualmente. | — |
| TSC validation em sandbox | Não rodável por timeout >100s. CI deve validar. | — |

---

## 9. Verificações para o Verifier

- [ ] `npx prisma generate` (em dev) — sem erros.
- [ ] `npx tsc --noEmit --skipLibCheck` — 0 erros.
- [ ] Migration `prisma/migrations/20260628_user_is_moderator/migration.sql`
      é idempotente e auto-verificada.
- [ ] `POST /api/comments/[id]/report` rejeita sem auth (401).
- [ ] Rate limit dispara após 10 requests/min.
- [ ] Self-report rejeitado (400).
- [ ] Idempotência: 2º report idêntico devolve `alreadyReported: true`.
- [ ] `GET /api/admin/moderation/queue` retorna 403 sem `requireModerator`.
- [ ] User com `isModerator=true` consegue ver e agir na fila.
- [ ] `hide` em COMMENT seta `Comment.deletedAt`.
- [ ] Audit log tem `event=COMMENT_REPORTED` e `event=FLAG_RESOLVED`.

---

## 10. Notas para Lina (Designer)

- Página `/admin/moderation` já tem visual coerente com `/admin` (cards
  stats + queue table). W25 não muda visual; só gate.
- O badge "papel: ADMIN" / "papel: MODERATOR" no header é texto pequeno,
  intencional — staff sabe seu papel. Não é UX-public-facing.
- Se quiser UI para promover moderador, é trabalho separado (não W25).

---

## 11. Notas para Caio (AppSec)

- Rate limit é in-memory — não sobrevive a restart nem é compartilhado entre
  instâncias. **Bloqueador para prod.** Trocar por Upstash antes de
  habilitar em produção. Refs: skill `security` §4 (Rate Limiting).
- Idempotency check é por `(targetType, targetId, reporterId, status=PENDING)`
  — pode dar race condition se 2 requests paralelos chegarem juntos
  (Prisma não tem constraint unique composta para esses 4 campos). Em
  prática, o rate limit de 10/min + double-click humano não torna isso
  explorável, mas vale adicionar unique index composto em wave futura.
- Reporter nunca aparece em response pública; só moderadores veem
  internamente. **OK** para LGPD-art. 18 (anti-retaliação).
- `auditLog.action='COMMENT_DELETED'` é proxy porque o enum não tem
  `COMMENT_REPORTED`. Considerar adicionar à próxima expansão do enum.
