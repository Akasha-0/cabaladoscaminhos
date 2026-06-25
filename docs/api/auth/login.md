---
sidebar_position: 1
title: POST /api/akasha/auth/login
description: Login com email e senha — emite cookies de sessão (access + refresh) e redireciona 307.
---

# `POST /api/akasha/auth/login`

Autentica um usuário existente com email e senha. Em sucesso, emite os
cookies `__Host-akasha_session` (access token, TTL 15 min) e
`__Host-akasha_refresh` (refresh token, TTL 30 dias) e retorna
`307 Temporary Redirect` para o destino solicitado.

> **Wave 12.5 — anti-bruteforce**: rate limit strict de **5
> tentativas/min por IP** (identificador HMAC-hashed, LGPD-safe). Veja
> `Retry-After` no header da resposta `429`.

## Autenticação

Não requer autenticação prévia — é o endpoint que **emite** a sessão.

## Request

### Headers

| Header | Obrigatório | Descrição |
| --- | --- | --- |
| `Content-Type` | Sim | `application/json` |
| `X-Forwarded-For` / IP real | — | Usado para rate limit por IP |

### Query params

| Param | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| `locale` | `string` | `pt-BR` | Locale para redirecionamento pós-login (ex: `pt-BR`, `en`). |
| `return` | `string` | `/{locale}/conta` | Path de retorno após login. **Validado contra open redirect** — se for URL absoluta off-origin, é clampado para `/conta`. |

### Body (JSON)

```json
{
  "email": "user@example.com",
  "password": "minha-senha-segura"
}
```

| Campo | Tipo | Validação | Descrição |
| --- | --- | --- | --- |
| `email` | `string` | Trim + lowercase + RFC 5322 | Email do usuário. |
| `password` | `string` | `min(1)` | Senha em texto puro. Comparada via `bcrypt.compare`. |

## Response

### Sucesso — `307 Temporary Redirect`

O navegador recebe `Set-Cookie` e segue o `Location`. **A resposta
em si não tem body JSON.**

Headers críticos:

```
HTTP/1.1 307 Temporary Redirect
Location: /pt-BR/conta
Set-Cookie: __Host-akasha_session=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=900
Set-Cookie: __Host-akasha_refresh=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000
```

> **Open redirect protection**: se `return` apontar para origin externo
> (ex: `https://evil.com`), o servidor clampa para `/{locale}/conta`.

### Erros

| Status | Body | Quando |
| --- | --- | --- |
| `400` | `{ "error": "Dados inválidos", "details": <ZodFlatten> }` | Email mal-formado ou senha vazia. |
| `401` | `{ "error": "Credenciais inválidas" }` | Usuário não existe **ou** senha incorreta. (Mensagem única — anti-enumeração.) |
| `429` | `{ "error": "Muitas tentativas...", "retryAfterSeconds": <int> }` | Rate limit strict excedido (5/min por IP). Header `Retry-After: <segundos>`. |

## Exemplos

### Login básico (curl)

```bash
curl -i -X POST https://akasha.example.com/api/akasha/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"minha-senha-segura"}'
```

Resposta (cookies omitidos):

```
HTTP/1.1 307 Temporary Redirect
Location: /pt-BR/conta
Set-Cookie: __Host-akasha_session=eyJ...; ...
Set-Cookie: __Host-akasha_refresh=eyJ...; ...
```

### Login com redirect customizado

```bash
# Após autenticar, redireciona para /pt-BR/dashboard em vez de /conta
curl -i -X POST "https://akasha.example.com/api/akasha/auth/login?return=%2Fpt-BR%2Fdashboard" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"minha-senha-segura"}'
```

### Erro de credenciais

```bash
curl -X POST https://akasha.example.com/api/akasha/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"errada"}'
```

```json
{
  "error": "Credenciais inválidas"
}
```

### Erro de rate limit

```bash
# Após 5 tentativas em 1 minuto do mesmo IP:
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'

{
  "error": "Muitas tentativas de login. Tente novamente em 60 segundos.",
  "retryAfterSeconds": 60
}
```

## Notas de segurança

- **bcrypt cost factor 12** para hash de senhas (ver
  `apps/akasha-portal/src/app/api/akasha/auth/register/route.ts`).
- **JWT HS256** com secret ≥ 32 bytes (env `JWT_SECRET`).
- **Access token TTL**: 15 min (curto para reduzir janela de replay).
- **Refresh token rotation**: cada login emite um novo `jti` único e
  sobrescreve `user.currentRefreshTokenJti` no DB, invalidando refresh
  tokens antigos.
- **CSP em respostas de erro**: até mesmo 401/429 retornam
  `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`
  (defesa em profundidade).

## Veja também

- [`POST /api/akasha/auth/register`](./register.md) — criar conta
- [`POST /api/akasha/auth/refresh`](./refresh.md) — rotacionar tokens
- [`POST /api/akasha/auth/logout`](./logout.md) — encerrar sessão
- [`GET /api/akasha/auth/me`](./me.md) — perfil autenticado
