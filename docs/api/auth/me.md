---
sidebar_position: 3
title: GET/PATCH /api/akasha/auth/me
description: Perfil do usuário autenticado — leitura (GET) e atualização de flags (PATCH).
---

# `GET` / `PATCH /api/akasha/auth/me`

Lê (`GET`) ou atualiza (`PATCH`) o perfil do usuário autenticado. Ambos
os métodos requerem o cookie de sessão `__Host-akasha_session` válido.

> **Wave 12.5 — anti-scraping**: rate limit strict de **30 req/min por
> userId** (identificador HMAC-hashed, LGPD-safe). `GET /me` retorna
> PII (email, nome, birthDate) — proteção contra exfiltração em massa.

## Autenticação

**Obrigatória**. Cookie `__Host-akasha_session` (JWT access token).

Falha → `401 Unauthorized` com `{ "error": "Unauthorized" }`.

## `GET /api/akasha/auth/me`

Retorna dados básicos do perfil do usuário autenticado.

### Request

Sem body. Headers obrigatórios:

| Header | Descrição |
| --- | --- |
| `Cookie: __Host-akasha_session=<jwt>` | Token de acesso (TTL 15 min). |

### Response

#### Sucesso — `200 OK`

```json
{
  "id": "clxxx...",
  "email": "user@example.com",
  "name": "Maria Silva",
  "emailVerified": false,
  "locale": "pt-BR",
  "pushEnabled": true,
  "ichingEnabled": false,
  "birthDate": "1990-04-15",
  "birthTime": "14:30",
  "birthCity": "São Paulo"
}
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | `string` | UUID do usuário (cuid2). |
| `email` | `string` | Email cadastrado. |
| `name` | `string` | Nome completo. |
| `emailVerified` | `boolean` | `true` após confirmação de email. |
| `locale` | `string` | Locale preferido (`pt-BR`, `en`, etc.). |
| `pushEnabled` | `boolean` | Web Push notifications ativadas. |
| `ichingEnabled` | `boolean` | **Opt-in LGPD** para sorteio diário de I Ching (Akasha v0.0.5 T8). |
| `birthDate` | `string \| null` | Data de nascimento ISO (`YYYY-MM-DD`). |
| `birthTime` | `string \| null` | Hora local de nascimento. |
| `birthCity` | `string \| null` | Cidade de nascimento. |

#### Erros

| Status | Body | Quando |
| --- | --- | --- |
| `401` | `{ "error": "Unauthorized" }` | Sem cookie ou JWT inválido/expirado. |
| `429` | `{ "error": "Muitas requisições...", "retryAfterSeconds": <int> }` | Rate limit excedido (30/min por userId). |

### Exemplo (curl)

```bash
curl https://akasha.example.com/api/akasha/auth/me \
  -H "Cookie: __Host-akasha_session=eyJ..."
```

Resposta:

```json
{
  "id": "clxxxabc",
  "email": "user@example.com",
  "name": "Maria Silva",
  "emailVerified": false,
  "locale": "pt-BR",
  "pushEnabled": true,
  "ichingEnabled": false,
  "birthDate": "1990-04-15",
  "birthTime": "14:30",
  "birthCity": "São Paulo"
}
```

---

## `PATCH /api/akasha/auth/me`

Atualiza flags do perfil. **Atualmente apenas `ichingEnabled` é
aceito** (opt-in LGPD para sorteio diário de I Ching).

### Request

#### Body (JSON)

```json
{
  "ichingEnabled": true
}
```

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `ichingEnabled` | `boolean` | Não | Habilita (`true`) ou desabilita (`false`) o sorteio diário automático de hexagrama I Ching. |

> ⚠️ Pelo menos um campo deve ser enviado. Body sem nenhum campo
> reconhecível retorna `400 Nenhum campo atualizável`.

### Response

#### Sucesso — `200 OK`

```json
{
  "ichingEnabled": true
}
```

#### Erros

| Status | Body | Quando |
| --- | --- | --- |
| `400` | `{ "error": "Parâmetros inválidos" }` | Body não-JSON ou viola schema Zod. |
| `400` | `{ "error": "Nenhum campo atualizável" }` | Body sem `ichingEnabled` definido. |
| `401` | `{ "error": "Unauthorized" }` | Sem cookie ou JWT inválido. |
| `429` | `{ "error": "Muitas requisições..." }` | Rate limit excedido. |

### Exemplo (curl)

```bash
curl -X PATCH https://akasha.example.com/api/akasha/auth/me \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-akasha_session=eyJ..." \
  -d '{"ichingEnabled": true}'
```

Resposta:

```json
{
  "ichingEnabled": true
}
```

## Notas

- **LGPD (Akasha v0.0.5 T8)**: `ichingEnabled` é opt-in explícito por
  design — o sorteio diário de I Ching envolve geração de conteúdo
  simbólico personalizado, então o consentimento granular é necessário.
- **birthDate format**: retornado como `YYYY-MM-DD` (sem componente
  horário/timezone) — ISO 8601 date.

## Veja também

- [`POST /api/akasha/auth/login`](./login.md) — obter sessão
- [`POST /api/akasha/auth/refresh`](./refresh.md) — rotacionar token
