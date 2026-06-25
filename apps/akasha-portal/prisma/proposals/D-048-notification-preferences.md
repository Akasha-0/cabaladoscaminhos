# D-048 — Notification Preferences (Wave 18.2)

**Status:** PROPOSAL — awaiting human approval (per `prisma/AGENTS.md` D1)
**Date:** 2026-06-24
**Author:** Wave 18.2 subagent
**Plan:** `.hermes/plans/wave-18-features2-2026-06-24.md` seção 18.2

## Goal

Allow users to opt-out of specific notification types (DIARIO / MENTOR /
CONEXOES / CREDITS / SYSTEM) individually, with a UI at `/conta/notifications`.

## Schema diff

New model appended to `apps/akasha-portal/prisma/schema.prisma`:

```prisma
model NotificationPreference {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  enabled   Boolean          @default(true)
  updatedAt DateTime         @updatedAt

  @@unique([userId, type])
  @@index([userId])
  @@map("notification_preferences")
}
```

## Migration

`apps/akasha-portal/prisma/migrations/20260624000005_notification_preferences/migration.sql`
(CREATE TABLE + 2 indexes).

To apply (humano, após aprovação):
```
pnpm exec prisma migrate dev --name notification_preferences
```

## Decisions

1. **Tabela esparsa vs. 5 colunas no User** — esparsa ganha:
   - Não precisa migration por tipo novo no futuro (basta estender enum).
   - Query por tipo (`where: { type: DIARIO, enabled: true }`) é trivial.
   - LGPD: mínima informação persistida (rows existem só quando user opt-out).

2. **Default `enabled: true`** — opt-out model. "All on" é o default razoável.
   User que não mexeu na página recebe todas notificações.

3. **`@@unique([userId, type])`** — suporta upsert no PATCH
   (`prisma.notificationPreference.upsert`).

4. **Sem FK para User** — segue o pattern do `AuditLog` (sobrevivência à
   exclusão). Aqui Cascade seria aceitável, mas manter consistente simplifica
   mental model. LGPD Art. 18 §V (direito ao esquecimento) é atendido: cascade
   ao deletar user via soft-delete flag (Wave 8.3) ou hard-delete manual.

5. **`updatedAt @updatedAt`** — Prisma gerencia auto. Útil para audit futuro
   ("user desativou DIARIO em 2026-07-01").

## Application-layer changes (Wave 18.2 já implementa)

- `createNotification()` em `lib/application/notifications/create.ts` ganha
  check de preferência **antes** do `prisma.notification.create`. Se disabled
  → return `null` (skip silenciosamente).
- `lib/application/notifications/preferences.ts` (novo) expõe:
  - `getUserPreferences(userId)` → `NotificationType[]` de tipos desativados
  - `setPreference(userId, type, enabled)` → upsert
  - `isTypeEnabled(userId, type)` → boolean (chamado por createNotification)
- `GET /api/notifications/preferences` → retorna todas prefs (default all on)
- `PATCH /api/notifications/preferences` → upsert single
- `/conta/notifications` page com 5 toggles + texto explicativo

## Risks & rollback

- **Risco baixo:** additive change, no destructive ops. Backward compatible.
- **Rollback:** `DROP TABLE notification_preferences` (após humano deletar
  rows). Sem impacto em `notifications` table ou auth.
- **Backfill:** N/A — tabela vazia em prod. Default "all enabled" é o
  comportamento anterior (sempre criou notificação).

## Verification

- `pnpm --filter akasha-portal typecheck` (0 errors)
- `pnpm --filter akasha-portal test:run` (incluindo novos testes de
  preferences e do opt-out em createNotification)
- Manual: ir em `/conta/notifications`, desativar DIARIO, gerar
  notificação DIARIO via admin → não deve aparecer no bell.
