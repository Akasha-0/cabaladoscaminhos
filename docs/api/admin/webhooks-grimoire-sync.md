---
sidebar_position: 3
title: POST /api/admin/webhooks/grimoire-sync
description: ADMIN — sincroniza textos do grimório a partir de webhook GitHub.
---

# `POST /api/admin/webhooks/grimoire-sync`

Sincroniza os textos do **grimório** (conteúdo esotérico dos 5 Pilares)
a partir de um webhook. Pensado para ser disparado por um GitHub Action
quando há mudanças em `packages/*/src/textos/`.

Suporta **três métodos de autenticação** (em ordem de precedência):

1. **HMAC-SHA256** do GitHub via header `X-Hub-Signature-256`
   (recomendado para integração GitHub → Akasha).
2. **Bearer token** via header `Authorization: Bearer <GRIMOIRE_SYNC_SECRET>`.
3. **Cookie de sessão ADMIN** (mesmo padrão de outras rotas `/api/admin/*`).

> **`GET` retorna `405`**: rota explicitamente rejeita GET para evitar
> disparo acidental via browser/curl sem intenção.

## Autenticação

**Uma das três**:

- Header `X-Hub-Signature-256: sha256=<hex>` válido (HMAC do body com
  `GITHUB_WEBHOOK_SECRET`), **OU**
- Header `Authorization: Bearer <GRIMOIRE_SYNC_SECRET>`, **OU**
- Cookie `__Host-akasha_session` válido com `role='ADMIN'`.

Falha → `401 Unauthorized`.

## Request

### Headers (autenticação — uma das três)

| Cenário | Header | Valor |
| --- | --- | --- |
| GitHub webhook | `X-Hub-Signature-256` | `sha256=<hmac-hex>` |
| Bearer token | `Authorization` | `Bearer <GRIMOIRE_SYNC_SECRET>` |
| ADMIN cookie | `Cookie` | `__Host-akasha_session=<jwt>` |

### Body

Body **opaco** — passado verbatim para verificação HMAC quando
aplicável. Em geral é o payload de webhook do GitHub (push event).

```json
{
  "ref": "refs/heads/main",
  "repository": { "full_name": "cabala-dos-caminhos" },
  "commits": [
    { "id": "abc123", "message": "feat: atualizar textos do Pilar Cabala" }
  ]
}
```

> O body não é parseado pela rota — apenas validado via HMAC. O
> conteúdo é logado para auditoria.

## Response

### Sucesso — `200 OK`

```json
{
  "message": "Sincronização concluída.",
  "synced": 12,
  "skipped": 0,
  "errors": [],
  "startedAt": "2026-06-24T22:00:00Z",
  "finishedAt": "2026-06-24T22:00:01.234Z"
}
```

### Erros

| Status | Body | Quando |
| --- | --- | --- |
| `401` | `{ "error": "Não autorizado. Requer HMAC-SHA256, Bearer token de webhook, ou login ADMIN." }` | Nenhum dos 3 métodos de auth bateu. |
| `405` | `{ "error": "Método não permitido. Utilize POST para sincronizar o grimório." }` | `GET` chamado acidentalmente. |
| `500` | `{ "error": "Falha durante a sincronização", "details": "<msg>" }` | Erro durante `syncGrimoire()` (DB, FS, parse). |

## Exemplos

### GitHub webhook (HMAC)

```bash
# GitHub Action sends:
curl -X POST https://akasha.example.com/api/admin/webhooks/grimoire-sync \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$(openssl dgst -sha256 -hmac "$GITHUB_WEBHOOK_SECRET" -hex < payload.json | awk '{print $2}')" \
  --data-binary @payload.json
```

Resposta:

```json
{
  "message": "Sincronização concluída.",
  "synced": 12,
  "skipped": 0,
  "errors": [],
  "startedAt": "2026-06-24T22:00:00Z",
  "finishedAt": "2026-06-24T22:00:01.234Z"
}
```

### Bearer token (script)

```bash
curl -X POST https://akasha.example.com/api/admin/webhooks/grimoire-sync \
  -H "Authorization: Bearer $GRIMOIRE_SYNC_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### ADMIN manual

```bash
curl -X POST https://akasha.example.com/api/admin/webhooks/grimoire-sync \
  -H "Cookie: __Host-akasha_session=<admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Tentativa GET (rejeitada)

```bash
curl https://akasha.example.com/api/admin/webhooks/grimoire-sync
```

Resposta:

```
HTTP/1.1 405 Method Not Allowed

{"error":"Método não permitido. Utilize POST para sincronizar o grimório."}
```

### Sem auth (rejeitada)

```bash
curl -X POST https://akasha.example.com/api/admin/webhooks/grimoire-sync
```

Resposta:

```
HTTP/1.1 401 Unauthorized

{"error":"Não autorizado. Requer HMAC-SHA256, Bearer token de webhook, ou login ADMIN."}
```

## Notas de segurança

- **HMAC `timingSafeEqual`**: comparação em tempo constante para evitar
  timing attacks na verificação de assinatura.
- **Defesa em profundidade**: se HMAC falha, o servidor ainda tenta
  Bearer / ADMIN antes de retornar 401 — falha de um método não revela
  que outro está configurado.
- **`dynamic = 'force-dynamic'`**: rota não cacheada (necessário por
  manipular dados mutáveis).

## Veja também

- [`POST /api/admin/credits/grant`](./credits-grant.md) — gerenciar créditos
