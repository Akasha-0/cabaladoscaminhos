# D-049 — User Webhooks (Wave 19.1)

**Status:** PROPOSAL — awaiting human approval (per `prisma/AGENTS.md` D1)
**Date:** 2026-06-25
**Author:** Wave 19.1 subagent
**Plan:** `.hermes/plans/wave-19-extensibility-2026-06-24.md` seção 19.1

## Goal

Permitir que o usuário registre URLs HTTPS próprias (Zapier, Make, n8n,
integrações customizadas) para receber POSTs quando eventos do próprio
tenant ocorrem (notification.created, diario.published, etc).

## Schema diff

Novo model em `apps/akasha-portal/prisma/schema.prisma`:

```prisma
model Webhook {
  id           String    @id @default(cuid())
  userId       String
  url          String
  events       String[]
  secret       String
  secretFingerprint String
  isActive     Boolean   @default(true)
  lastCalledAt DateTime?
  lastError    String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([userId])
  @@index([isActive])
  @@map("webhooks")
}
```

## Migration

`apps/akasha-portal/prisma/migrations/20260625090000_webhooks/migration.sql`
(CREATE TABLE + 2 indexes).

To apply (humano, após aprovação):
```
pnpm exec prisma migrate dev --name webhooks
```

## LGPD

- Webhooks são userId-only — NUNCA há broadcast/cross-user access
  (filtro obrigatório por `userId` em todas as queries).
- `secret` é HMAC gerado server-side (random 32 bytes), NUNCA derivado
  de dado pessoal do user. Não vaza PII mesmo se o user revogar
  consentimento.
- Não persistimos o body do payload entregue — apenas metadata de
  status (`lastCalledAt`, `lastError`). Minimização Art. 33 §II.
- `secretFingerprint` (sha256 prefix 8 chars) é derivado do secret
  random, não de dado pessoal.

## Security

- `url` validado https-only, não-localhost, não-IP-privado na camada
  de aplicação (`POST /api/webhooks`).
- HMAC-SHA256(secret, body) no header `X-Akasha-Signature` — verification
  com `timingSafeEqual` no consumer (helper em
  `lib/application/webhooks/signature.ts`).
- `secret` retornado ao user **UMA ÚNICA VEZ** no POST. Em GET/PATCH
  expomos apenas `secretFingerprint`.
- `deleteMany` por `(id, userId)` — 0 affected = 404 (IDOR-safe).

## Risco / Rollback

- Aditiva — 1 tabela nova, 0 alterações destrutivas. Sem risco de
  regressão Wave 9-18.
- Rollback: `DROP TABLE webhooks;` (destructive — só se nenhum webhook
  foi criado em prod).
