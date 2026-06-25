---
sidebar_position: 5
title: POST /api/akasha/auth/logout
description: Encerra a sessão — limpa cookies de access + refresh. Idempotente.
---

# `POST /api/akasha/auth/logout`

Encerra a sessão do usuário, limpando os cookies `__Host-akasha_session`
e `__Host-akasha_refresh`. **Idempotente** — pode ser chamada
multiplas vezes sem erro (mesmo se já não houver sessão).

## Autenticação

Não requerida. A rota limpa os cookies independentemente do estado
de autenticação.

## Request

Sem body, sem headers obrigatórios.

## Response

### Sucesso — `200 OK`

```json
{
  "message": "Sessão encerrada"
}
```

Headers:

```
Set-Cookie: __Host-akasha_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
Set-Cookie: __Host-akasha_refresh=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
```

> Os cookies são limpos via `Max-Age=0` — o navegador os remove
> imediatamente. **Não zera `User.currentRefreshTokenJti` no DB** —
> ver notas de segurança abaixo.

## Exemplos

### Logout básico

```bash
curl -i -X POST https://akasha.example.com/api/akasha/auth/logout
```

Resposta:

```
HTTP/1.1 200 OK
Set-Cookie: __Host-akasha_session=; Max-Age=0; ...
Set-Cookie: __Host-akasha_refresh=; Max-Age=0; ...

{"message":"Sessão encerrada"}
```

### Logout após sessão expirada (idempotente)

```bash
# Mesmo sem cookie de sessão, a rota responde 200 com Set-Cookie de limpeza.
curl -i -X POST https://akasha.example.com/api/akasha/auth/logout
```

## Notas de segurança

- **SameSite=Strict** nos cookies de limpeza (vs `Lax` nos de emissão)
  — defense-in-depth contra CSRF em cenários de logout cross-site.
- **`Max-Age=0`** ao invés de expiração no passado — padrão seguro
  cross-browser.
- **Não invalida o `jti` no DB**: o logout **client-side** limpa os
  cookies do navegador. Se um atacante já copiou os tokens, eles
  continuam válidos até a expiração natural (15 min access / 30 dias
  refresh). Para invalidação server-side imediata, mude a senha do
  usuário (que trigga rotação forçada).

## Veja também

- [`POST /api/akasha/auth/login`](./login.md) — emitir nova sessão
- [`POST /api/akasha/auth/refresh`](./refresh.md) — rotacionar tokens
