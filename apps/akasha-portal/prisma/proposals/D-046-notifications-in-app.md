# D-046 — Notifications In-App (Wave 13.3)

**Status:** `awaiting_human_approval`
**Date:** 2026-06-24
**Author:** Hermes subagent (wave-13.3-notifications)
**Branch:** `wave-13.3-notifications`
**Worktree:** `/home/skynet/cabala-dos-caminhos-worktrees/wave-13.3`

---

## 1. Motivation

O portal hoje **não tem nenhum canal in-app** para informar o usuário sobre
eventos relevantes:

- Novo diário (Mandato do Dia) disponível
- Resposta do Mentor chegou (async — apenas push web existe hoje, opcional)
- Match em Conexões (compatibilidade alta com outro usuário)
- Saldo de créditos baixo (precisa comprar mais)

Sem notifications in-app, o usuário precisa **lembrar ativamente** de abrir o
portal para descobrir essas coisas. Isso quebra o engagement loop que torna o
produto viciante de forma saudável (espiritual, não dopaminérgica).

A Wave 13 priorizou isso em #3 por ROI (effort vs value), conforme
`.hermes/plans/wave-13-features-2026-06-24.md` § 13.3.

## 2. Proposed schema change

Adicionar model `Notification` ao `schema.prisma` (apps/akasha-portal):

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  body      String
  href      String?          // rota interna opcional (ex: /meu-dia, /diario/123)
  readAt    DateTime?        // null = não lida; DateTime = timestamp de leitura
  createdAt DateTime         @default(now())

  @@index([userId, readAt])   // query principal: "notificações não-lidas do user X"
  @@index([userId, createdAt]) // query "últimas N do user X"
  @@map("notifications")
}

enum NotificationType {
  DIARIO     // novo Mandato do Dia disponível
  MENTOR     // resposta async do Mentor
  CONEXOES   // match ou mensagem em Conexões
  CREDITS    // saldo baixo (< 5 créditos)
  SYSTEM     // avisos da plataforma (manutenção, etc)
}
```

### 2.1 Campos explicados

| Campo | Tipo | Por quê |
|---|---|---|
| `userId` | FK → User | só `userId` direto, NÃO `zeladorId` (notifications são do **próprio usuário**, não multi-tenant) |
| `type` | enum | permite filtrar por categoria e estilizar ícone/cor |
| `title` | String (≤120 chars) | subject curto da notificação |
| `body` | String (≤500 chars) | corpo (preview no dropdown) |
| `href` | String? | deep link opcional; null = sem destino (ex: avisos de sistema sem CTA) |
| `readAt` | DateTime? | null = não-lida (badge); setar = marca como lida |
| `createdAt` | DateTime | ordenação padrão no dropdown |

### 2.2 Índices

- `@@index([userId, readAt])` — query mais comum: `WHERE userId=? AND readAt IS NULL ORDER BY createdAt DESC`
- `@@index([userId, createdAt])` — "últimas N notificações (lidas + não-lidas)" para o dropdown

### 2.3 Reverse relation no `User`

Adicionar em `model User`:

```prisma
notifications Notification[]
```

Logo após `exerciseCompletions ExerciseCompletion[]` (linha 56).

## 3. Trade-offs

| Alternativa | Trade-off | Decisão |
|---|---|---|
| 1 tabela única `Notification` polimórfica (type enum) | simples, fácil filtrar | **escolhida** ✅ |
| Tabela por tipo (`DiarioNotification`, `MentorNotification`...) | mais type-safe, queries específicas | overkill — type já é enum, e body/title são strings livres |
| Reusar `Consultation` para mensagens do Mentor | duplicaria dados; `Consultation` é a sessão, não a notificação | rejeitada |
| Soft-delete (`deletedAt`) em vez de marcar como lida | complica queries, UI fica ambígua | rejeitada — `readAt` é o suficiente |

## 4. Migration plan (HUMAN APPLIES)

Esta é uma mudança **proposta**, NÃO aplicada. O
[`prisma/AGENTS.md`](./AGENTS.md) local explicita:

> **NUNCA** rodar `pnpm exec prisma migrate dev` ou `pnpm db:push` sem
> aprovação humana explícita.

### Steps para Gabriel (após aprovação):

1. Revisar este PROPOSAL
2. Confirmar que o model + enum + reverse relation estão OK
3. Rodar manualmente:
   ```bash
   cd apps/akasha-portal
   pnpm exec prisma migrate dev --name notifications
   ```
   (Prisma vai detectar a diferença entre `schema.prisma` e o DB, gerar o SQL,
   e aplicar. Em prod, `migrate deploy` é separado.)

### Rollback

Se for necessário reverter:

```sql
DROP TABLE IF EXISTS notifications;
DROP TYPE IF EXISTS "NotificationType";
```

E reverter o `schema.prisma` (3 mudanças: `model Notification`, `enum
NotificationType`, `User.notifications Notification[]`).

### Risk surface

- Tabela nova: sem dados existentes → zero risco de corromper
- `onDelete: Cascade` no `userId`: se um User for deletado, suas notificações
  vão junto (consistente com `PushSubscription`, `ChatMessage`, etc.)
- Reverse relation: só adiciona campo, não remove nada existente → sem risco

## 5. Out of scope desta Wave

- **SSE/WebSocket push** em tempo real (Wave 14 — user explicitou "polling
  simples por enquanto" no plano Wave 13)
- **Push web integration** com as notifications (já existe `PushSubscription`
  + Wave 8 web-push setup; Wave 14 conecta)
- **Email digest** de notifications não-lidas
- **Notification preferences** (UI de opt-in/out por tipo — vem com Wave 14
  quando SSE chegar)

## 6. Validation

- `pnpm --filter akasha-portal db:generate` regenera o client sem erros
- `pnpm --filter akasha-portal typecheck` (model Notification é referenciado
  pelo helper `createNotification` e pela API route)
- `pnpm --filter akasha-portal test:run` (testes do helper + API route)
- `pnpm --filter akasha-portal i18n:check` (parity pt-BR/en das novas chaves)

## 7. Files modified por esta Wave

| Layer | Arquivo | Tipo |
|---|---|---|
| Schema | `prisma/schema.prisma` | modified (model + enum + reverse relation) |
| Schema doc | `prisma/proposals/D-046-notifications-in-app.md` | new (este arquivo) |
| App layer | `src/lib/application/notifications/create.ts` | new (helper) |
| App layer | `src/lib/application/notifications/create.test.ts` | new (helper test) |
| App layer | `src/lib/application/notifications/types.ts` | new (NotificationType re-export + DTOs) |
| API | `src/app/api/notifications/route.ts` | new (GET, PATCH) |
| API | `src/app/api/notifications/[id]/route.ts` | new (PATCH single) |
| API | `src/app/api/notifications/__tests__/route.test.ts` | new |
| Component | `src/components/akasha/notifications/NotificationsBell.tsx` | new |
| Component | `src/components/akasha/notifications/NotificationsBell.test.tsx` | new |
| Layout | `src/components/akasha/layout/BottomNav.tsx` | modified (slot para bell — mobile) |
| Layout | (desktop header / `[locale]/(akasha)/layout.tsx`) | modified (slot para bell — desktop) |
| i18n | `messages/{en,pt-BR}.json` + `src/i18n/{en,pt-BR}.json` | modified (3-4 chaves) |

## 8. Próximo passo (Wave 14)

- SSE stream `/api/notifications/stream` para badge live
- Conectar `PushSubscription` à criação de notifications (criar também push
  web quando usuário tem `pushEnabled=true`)
- Notification preferences (opt-out por tipo)

---

**Authored-by:** Hermes subagent wave-13.3 (2026-06-24)
**Aguardando:** Gabriel approval + manual `prisma migrate dev`