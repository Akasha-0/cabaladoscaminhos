---
sidebar_position: 2
title: POST /api/admin/credits/reconcile
description: ADMIN — reconcilia ledger de créditos vs consultas ao Mentor.
---

# `POST /api/admin/credits/reconcile`

Roda reconciliação entre o **ledger de créditos** (`CreditEntry`) e a
contagem de **consultas ao Mentor** registradas. Detecta drift (ex:
créditos cobrados sem `CreditEntry`, ou `CreditEntry` órfãs).

**Restrito a `role='ADMIN'`**. Pode ser disparado manualmente ou via
cron job (recomendado: 1x/dia).

> Veja `apps/akasha-portal/src/lib/application/admin/credit-reconciliation.ts`
> para o algoritmo completo de reconciliação.

## Autenticação

**Obrigatória — role `ADMIN`**.

Falha → `401 Unauthorized` ou `403 Forbidden`.

## Request

### Headers

| Header | Obrigatório | Descrição |
| --- | --- | --- |
| `Content-Type` | Sim | `application/json` (pode ser vazio `{}`) |
| `Cookie: __Host-akasha_session=<jwt>` | Sim | Token de acesso de ADMIN. |

### Body (JSON) — opcional

```json
{
  "since": "2026-06-01T00:00:00Z"
}
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `since` | `string` (ISO 8601) | Janela inicial de reconciliação. Default: todo o histórico. |
| `dryRun` | `boolean` | (Reservado — atualmente não implementado nesta rota.) Se true, retorna o relatório sem aplicar correções. |

## Response

### Sucesso — `200 OK`

```json
{
  "report": {
    "startedAt": "2026-06-24T22:50:00Z",
    "finishedAt": "2026-06-24T22:50:01.234Z",
    "since": "2026-06-01T00:00:00Z",
    "usersChecked": 142,
    "ledgerEntries": 1024,
    "mentorConsultations": 998,
    "drift": {
      "missingCreditEntries": 2,
      "orphanCreditEntries": 0,
      "balanceMismatch": 1
    },
    "details": [
      {
        "userId": "clxxx",
        "email": "user@example.com",
        "expectedBalance": 10,
        "actualBalance": 9,
        "delta": -1,
        "reason": "Mentor consultation on 2026-06-15T... not recorded in ledger"
      }
    ]
  }
}
```

| Campo | Descrição |
| --- | --- |
| `usersChecked` | Total de usuários verificados no período. |
| `ledgerEntries` | Total de `CreditEntry` no período. |
| `mentorConsultations` | Total de chamadas ao Mentor no período (via `MentorMessage` ou similar). |
| `drift` | Sumário de discrepâncias encontradas. |
| `details` | Lista de discrepâncias específicas por usuário (amostra). |

### Erros

| Status | Body | Quando |
| --- | --- | --- |
| `401` | `{ "error": "Unauthorized" }` | Sem cookie ou JWT inválido. |
| `403` | `{ "error": "Acesso restrito a ADMIN" }` | Usuário autenticado não é ADMIN. |

## Exemplos

### Reconciliação completa

```bash
curl -X POST https://akasha.example.com/api/admin/credits/reconcile \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-akasha_session=<admin-jwt>" \
  -d '{}'
```

Resposta (sem drift):

```json
{
  "report": {
    "startedAt": "2026-06-24T22:00:00Z",
    "finishedAt": "2026-06-24T22:00:00.842Z",
    "usersChecked": 142,
    "ledgerEntries": 1024,
    "mentorConsultations": 998,
    "drift": {
      "missingCreditEntries": 0,
      "orphanCreditEntries": 0,
      "balanceMismatch": 0
    },
    "details": []
  }
}
```

### Reconciliação desde uma data específica

```bash
curl -X POST https://akasha.example.com/api/admin/credits/reconcile \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-akasha_session=<admin-jwt>" \
  -d '{"since":"2026-06-01T00:00:00Z"}'
```

### Cron job (verificação diária)

```bash
# crontab -e
0 3 * * * curl -s -X POST https://akasha.example.com/api/admin/credits/reconcile \
  -H "Cookie: __Host-akasha_session=$(cat /run/secrets/admin-jwt)" \
  -d '{}' | mail -s "Daily credit reconciliation" admin@akasha.example
```

## Notas

- **Algoritmo**: `reconcileCredits({ since })` cruza `CreditEntry` (ledger)
  com contagem de `MentorMessage` ou `MentorAudit` por userId. Drift
  é a diferença entre esperado vs real.
- **Idempotência**: rodar múltiplas vezes no mesmo período produz o
  mesmo relatório (read-only).
- **dryRun reservado**: parâmetro está documentado mas **não
  implementado nesta rota** — reports são sempre report-only.
  Auto-correção virá em wave futura.

## Veja também

- [`POST /api/admin/credits/grant`](./credits-grant.md) — concede créditos manualmente
