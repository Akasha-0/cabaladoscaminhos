---
sidebar_position: 2
title: POST /api/akasha/auth/register
description: Cadastro LGPD-compliant com consentimento explícito — concede 10 créditos de signup.
---

# `POST /api/akasha/auth/register`

Cria uma nova conta de usuário. Requer **consentimento LGPD explícito**
(`consent: true` no body) e aplica rate limit anti-spam de contas
(3 cadastros/hora por IP). Em sucesso, cria o usuário, concede
**10 créditos de signup** (`CreditEntry` com `reason='signup_grant'`) e
retorna `201 Created`.

> **AD-T5-C (LGPD)**: o campo `consent` é obrigatório e validado como
> `literal(true)` — sem consentimento explícito, o cadastro é rejeitado
> em `400`. O timestamp do consentimento é persistido em `User.consentAt`.

> **Wave 12.5 — anti-enumeração + anti-spam**: rate limit strict de
> **3 cadastros/hora por IP**. Respostas de email duplicado retornam
> `201` com a mesma mensagem genérica para evitar enumeração de emails.

## Autenticação

Não requer autenticação prévia.

## Request

### Headers

| Header | Obrigatório | Descrição |
| --- | --- | --- |
| `Content-Type` | Sim | `application/json` |

### Body (JSON)

```json
{
  "email": "user@example.com",
  "password": "minha-senha-segura",
  "name": "Nome Completo",
  "birthDate": "1990-04-15",
  "birthTime": "14:30",
  "birthCity": "São Paulo",
  "birthLatitude": -23.5505,
  "birthLongitude": -46.6333,
  "birthTimezone": "America/Sao_Paulo",
  "consent": true
}
```

| Campo | Tipo | Obrigatório | Validação | Descrição |
| --- | --- | --- | --- | --- |
| `email` | `string` | Sim | Trim + lowercase + RFC 5322 | Email único no sistema. |
| `password` | `string` | Sim | `min(8)` | Senha em texto puro (mín. 8 caracteres). Hash bcrypt cost 12. |
| `name` | `string` | Sim | `min(2)` | Nome completo. |
| `birthDate` | `string` | Sim | Regex `YYYY-MM-DD` | Data de nascimento ISO 8601 (sem timezone). |
| `birthTime` | `string` | Não | — | Hora local de nascimento (ex: `14:30`). Necessária para cálculo de ascendente. |
| `birthCity` | `string` | Sim | `min(1)` | Cidade de nascimento (human-readable). |
| `birthLatitude` | `number` | Não | — | Latitude em graus decimais. Usada para mapa astral. |
| `birthLongitude` | `number` | Não | — | Longitude em graus decimais. |
| `birthTimezone` | `string` | Não | — | IANA timezone (ex: `America/Sao_Paulo`). |
| `consent` | `true` | Sim | **`literal(true)`** | Consentimento LGPD explícito. **Apenas `true` é aceito**. |

## Response

### Sucesso — `201 Created`

```json
{
  "message": "Conta criada. Verifique seu e-mail."
}
```

> A mensagem é genérica — também retornada em caso de email já
> cadastrado, para evitar enumeração. **O usuário é criado e os 10
> créditos são creditados apenas na primeira chamada.**

### Email duplicado (anti-enumeração)

Mesmo status `201` e mesma mensagem — por segurança, o servidor não
revela que o email já existe:

```json
{
  "message": "Conta criada. Verifique seu e-mail."
}
```

### Erros

| Status | Body | Quando |
| --- | --- | --- |
| `400` | `{ "error": "Dados inválidos", "details": <ZodFlatten> }` | Qualquer campo com validação falhada (email, senha < 8, `consent !== true`, `birthDate` mal-formado, etc.). |
| `429` | `{ "error": "Muitas tentativas...", "retryAfterSeconds": <int> }` | Rate limit strict excedido (3/hora por IP). Header `Retry-After`. |

## Exemplos

### Cadastro completo

```bash
curl -X POST https://akasha.example.com/api/akasha/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nova@example.com",
    "password": "minha-senha-segura",
    "name": "Maria Silva",
    "birthDate": "1990-04-15",
    "birthTime": "14:30",
    "birthCity": "São Paulo",
    "birthLatitude": -23.5505,
    "birthLongitude": -46.6333,
    "birthTimezone": "America/Sao_Paulo",
    "consent": true
  }'
```

Resposta:

```json
{
  "message": "Conta criada. Verifique seu e-mail."
}
```

### Cadastro sem consentimento LGPD (rejeitado)

```bash
curl -X POST https://akasha.example.com/api/akasha/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nova@example.com",
    "password": "minha-senha-segura",
    "name": "Maria Silva",
    "birthDate": "1990-04-15",
    "birthCity": "São Paulo",
    "consent": false
  }'
```

Resposta:

```json
{
  "error": "Dados inválidos",
  "details": {
    "fieldErrors": {
      "consent": ["É necessário consentir com o tratamento dos dados"]
    }
  }
}
```

### Senha muito curta

```bash
curl -X POST https://akasha.example.com/api/akasha/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nova@example.com",
    "password": "abc",
    "name": "Maria",
    "birthDate": "1990-04-15",
    "birthCity": "São Paulo",
    "consent": true
  }'
```

Resposta:

```json
{
  "error": "Dados inválidos",
  "details": {
    "fieldErrors": {
      "password": ["Senha deve ter ao menos 8 caracteres"]
    }
  }
}
```

## Efeitos colaterais

1. **`User`** row criado com `passwordHash` (bcrypt cost 12) e `consentAt = NOW()`.
2. **`CreditEntry`** criado com `delta=+10`, `reason='signup_grant'`,
   `balance=10`.
3. Email de verificação enviado (link ainda não implementado — ver
   roadmap).

## Notas de segurança

- **Hash de senha**: bcrypt com cost factor 12 (≈250ms em hardware
  moderno). Trade-off CPU vs brute-force.
- **Consentimento persistido**: `User.consentAt` registra o timestamp
  para auditoria LGPD (Art. 33).
- **Anti-enumeração**: emails duplicados retornam a mesma resposta
  genérica `201` com a mesma mensagem.
- **Rate limit por IP**: 3 cadastros/hora (UX: usuário humano cria
  conta uma vez; >3/hora é script).

## Veja também

- [`POST /api/akasha/auth/login`](./login.md) — autenticar após cadastro
- [`POST /api/akasha/credits/claim-signup-bonus`](./credits.md) — claim
  de bônus (rota legada — signup_grant agora é automático)
