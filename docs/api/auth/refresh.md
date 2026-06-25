---
sidebar_position: 4
title: POST /api/akasha/auth/refresh
description: Rotação de access + refresh token — previne replay attacks via jti tracking.
---

# `POST /api/akasha/auth/refresh`

Rotaciona o par de tokens (access + refresh) usando o cookie de refresh
válido. Implementa **refresh token rotation** com tracking de `jti` no
DB — se o `jti` apresentado não bater com o armazenado, a sessão é
invalidadada (defesa contra replay/token theft).

> **Refresh token rotation**: cada refresh emite um **novo** par de
> tokens e invalida o anterior. O `jti` (JWT ID) do novo refresh é
> armazenado em `User.currentRefreshTokenJti`. Se um atacante tentar
> reusar um refresh token antigo, o servidor detecta mismatch e zera o
> campo, forçando re-login.

## Autenticação

Requer apenas o cookie `__Host-akasha_refresh` (refresh token). O
access token (`__Host-akasha_session`) **não é necessário** para esta
rota — é justamente o caso de uso quando ele expira.

## Request

Sem body. Cookies necessários:

| Cookie | Obrigatório | Descrição |
| --- | --- | --- |
| `__Host-akasha_refresh` | Sim | Refresh token JWT (TTL 30 dias). |

## Response

### Sucesso — `200 OK`

```json
{
  "message": "Token renovado"
}
```

Headers:

```
Set-Cookie: __Host-akasha_session=<novo-access-token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=900
Set-Cookie: __Host-akasha_refresh=<novo-refresh-token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000
```

> Os dois cookies anteriores são sobrescritos — o navegador passa a
> enviar apenas os novos valores.

### Erros

| Status | Body | Quando | Ação do servidor |
| --- | --- | --- | --- |
| `401` | `{ "error": "Refresh token ausente. Faça login novamente." }` | Cookie `__Host-akasha_refresh` não enviado. | Nenhuma (sem cookie para limpar). |
| `401` | `{ "error": "Refresh token inválido. Faça login novamente." }` | JWT malformado ou assinatura inválida. | Limpa ambos os cookies de sessão. |
| `401` | `{ "error": "Usuário não encontrado. Faça login novamente." }` | `payload.sub` não corresponde a nenhum `User`. | Limpa ambos os cookies. |
| `401` | `{ "error": "Sessão expirada. Faça login novamente." }` | **jti mismatch** — token foi rotacionado ou é replay. **Possível sinal de theft.** | Limpa ambos os cookies **e** zera `User.currentRefreshTokenJti`. |
| `500` | `{ "error": "Internal server error" }` | Erro inesperado (DB indisponível, etc.). | Log estruturado com request ID. |

## Exemplos

### Refresh bem-sucedido

```bash
curl -i -X POST https://akasha.example.com/api/akasha/auth/refresh \
  -b "__Host-akasha_refresh=eyJ..."
```

Resposta:

```
HTTP/1.1 200 OK
Set-Cookie: __Host-akasha_session=<novo>; ...
Set-Cookie: __Host-akasha_refresh=<novo>; ...

{"message":"Token renovado"}
```

### jti mismatch (token reuse detectado)

```bash
# Atacante tenta usar um refresh token já rotacionado:
curl -i -X POST https://akasha.example.com/api/akasha/auth/refresh \
  -b "__Host-akasha_refresh=<antigo-jti>"
```

Resposta:

```
HTTP/1.1 401 Unauthorized
Set-Cookie: __Host-akasha_session=; Max-Age=0; ...
Set-Cookie: __Host-akasha_refresh=; Max-Age=0; ...

{"error":"Sessão expirada. Faça login novamente."}
```

> **Por quê invalidar tudo?** Se um atacante conseguiu o refresh token
> antigo (ex: via XSS), a detecção de jti mismatch permite **revogar
> proativamente** o dispositivo comprometido. O usuário legítimo
> precisará logar novamente.

## Notas de segurança

- **Refresh token TTL**: 30 dias. Access token: 15 minutos.
- **Single-use refresh**: cada refresh token só pode ser usado uma
  vez. O novo token é gerado e o `jti` antigo é sobrescrito.
- **jti tracking**: armazenado em `User.currentRefreshTokenJti`
  (campo único por usuário). Em DB outage, a rotação é abortada.
- **Defesa contra theft**: se um atacante usa um refresh token antes
  do usuário legítimo, o usuário legítimo verá um 401 ao tentar
  refresh — mas nesse caso o servidor **já invalidou** a sessão do
  atacante. Trade-off: UX vs segurança (preferimos segurança).

## Veja também

- [`POST /api/akasha/auth/login`](./login.md) — emitir sessão inicial
- [`POST /api/akasha/auth/logout`](./logout.md) — encerrar sessão
