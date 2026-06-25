---
sidebar_position: 1
title: POST /api/admin/credits/grant
description: ADMIN — concede créditos manualmente a um usuário. Cria CreditEntry auditável.
---

# `POST /api/admin/credits/grant`

Concede créditos manualmente a um usuário. **Restrito a usuários com
`role='ADMIN'`**. Cria uma `CreditEntry` no ledger com
`reason='admin_grant'` (ou um reason customizado) — totalmente
auditável.

> **Casos de uso**:
> - Founder (Gabriel) testar o Mentor sem passar pelo Stripe.
> - Customer support comping créditos por reembolso ou promoção.
> - Backfill manual se o signup_grant falhou (race condition, etc.).

## Autenticação

**Obrigatória — role `ADMIN`**.

1. Cookie `__Host-akasha_session` válido (JWT access).
2. `User.role === 'ADMIN'` no DB.

Falha → `401 Unauthorized` (sem cookie) ou `403 Forbidden` (sem role).

## Request

### Headers

| Header | Obrigatório | Descrição |
| --- | --- | --- |
| `Content-Type` | Sim | `application/json` |
| `Cookie: __Host-akasha_session=<jwt>` | Sim | Token de acesso de ADMIN. |

### Body (JSON)

```json
{
  "userId": "clxxx...",
  "amount": 50,
  "reason": "Reembolso por cobrança duplicada"
}
```

| Campo | Tipo | Validação | Descrição |
| --- | --- | --- | --- |
| `userId` | `string` | `min(1)` | ID do usuário alvo. |
| `amount` | `number` | `int`, `positive`, `max(1000)` | Quantidade de créditos a conceder (sempre positivo). |
| `reason` | `string` | `max(200)`, opcional | Razão do grant. Default: `'admin_grant'`. Persistido em `CreditEntry.reason` para auditoria. |

## Response

### Sucesso — `200 OK`

```json
{
  "userId": "clxxx...",
  "email": "user@example.com",
  "grantedBy": "admin@akasha.example",
  "newBalance": 60,
  "entry": {
    "id": "cyyyy...",
    "userId": "clxxx...",
    "delta": 50,
    "reason": "Reembolso por cobrança duplicada",
    "balance": 60,
    "createdAt": "2026-06-24T..."
  }
}
```

| Campo | Descrição |
| --- | --- |
| `userId` | ID do usuário que recebeu os créditos. |
| `email` | Email do usuário (para confirmação visual). |
| `grantedBy` | Email do ADMIN que executou o grant. |
| `newBalance` | Saldo após o grant (soma do ledger). |
| `entry` | Row `CreditEntry` criada (id, delta, balance, createdAt, ...). |

### Erros

| Status | Body | Quando |
| --- | --- | --- |
| `400` | `{ "error": "Dados inválidos", "details": <ZodFlatten> }` | Body inválido (amount negativo, userId vazio, reason > 200 chars, etc.). |
| `401` | `{ "error": "Unauthorized" }` | Sem cookie ou JWT inválido. |
| `403` | `{ "error": "Acesso restrito a ADMIN" }` | Usuário autenticado não é ADMIN. |
| `404` | `{ "error": "Usuário não encontrado" }` | `userId` não corresponde a nenhum `User`. |

## Exemplos

### Grant de 50 créditos

```bash
curl -X POST https://akasha.example.com/api/admin/credits/grant \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-akasha_session=<admin-jwt>" \
  -d '{
    "userId": "clxxx123",
    "amount": 50,
    "reason": "Reembolso por cobrança duplicada"
  }'
```

Resposta:

```json
{
  "userId": "clxxx123",
  "email": "user@example.com",
  "grantedBy": "gabriel@akasha.example",
  "newBalance": 60,
  "entry": {
    "id": "cyyyy",
    "userId": "clxxx123",
    "delta": 50,
    "reason": "Reembolso por cobrança duplicada",
    "balance": 60,
    "createdAt": "2026-06-24T22:50:00Z"
  }
}
```

### Tentativa de grant sem permissão

```bash
# Usuário comum tenta chamar a rota:
curl -X POST https://akasha.example.com/api/admin/credits/grant \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-akasha_session=<user-jwt>" \
  -d '{"userId":"clxxx","amount":1000}'
```

Resposta:

```json
{ "error": "Acesso restrito a ADMIN" }
```

Status: `403 Forbidden`.

### Amount inválido (negativo)

```bash
curl -X POST https://akasha.example.com/api/admin/credits/grant \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-akasha_session=<admin-jwt>" \
  -d '{"userId":"clxxx","amount":-5}'
```

Resposta:

```json
{
  "error": "Dados inválidos",
  "details": {
    "fieldErrors": {
      "amount": ["Number must be greater than 0"]
    }
  }
}
```

## Notas

- **Atomicidade**: `CreditEntry.create` + `balance` calculado via
  `aggregate` no ledger. Race conditions podem produzir saldo
  incorreto sob concorrência extrema — `reconcile` detecta drift.
- **Audit trail**: todo grant vira `CreditEntry` consultável em
  reconciliação (`POST /api/admin/credits/reconcile`).
- **Sem limite de grant**: `amount.max(1000)` é validação Zod — ADMIN
  pode repetir grants se necessário.

## Veja também

- [`POST /api/admin/credits/reconcile`](./credits-reconcile.md) — auditar ledger
