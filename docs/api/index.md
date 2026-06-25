---
sidebar_position: 1
title: API Reference
description: Referência de endpoints HTTP do Akasha Portal — autenticação, Mentor, MCP e administração.
---

# API Reference

Referência canônica dos endpoints HTTP públicos do **Akasha Portal** (Next.js
16, App Router). Esta página lista todos os route handlers documentados;
clique em cada rota para ver schema de request, response, erros e exemplos
de uso com `curl`.

> **Importante**: o site de documentação em Docusaurus é gerado a partir
> desta pasta. Esta página-mãe é o índice; cada rota tem sua página
> dedicada em `docs/api/<domínio>/`.

## Convenções comuns

Todas as rotas vivem sob o prefixo `/api` e seguem estas convenções:

| Aspecto | Convenção |
| --- | --- |
| **Método** | `GET` = leitura · `POST` = criar · `PATCH` = atualizar · `DELETE` = remover |
| **Autenticação** | Cookie `__Host-akasha_session` (JWT) ou `requireAkashaApi` (server-side) |
| **Content-Type** | `application/json` (entrada e saída) — exceto `text/event-stream` no Mentor |
| **Validação** | Zod em rotas mutating — erro retorna `400 Dados inválidos` |
| **Erros** | JSON `{ "error": "code" }` com status HTTP apropriado |
| **Rate limit** | Ver cabeçalho `Retry-After` quando status é `429` |
| **CORS** | Configurado em `middleware.ts` (CSP + headers de segurança) |

### Autenticação (cookies)

Rotas autenticadas exigem o cookie `__Host-akasha_session` (HttpOnly,
Secure, SameSite=Lax) emitido por `POST /api/akasha/auth/login`. O
refresh é automático via `POST /api/akasha/auth/refresh` quando o access
token (TTL 15 min) expira.

### Formato de erro padrão

```json
{
  "error": "Mensagem humana legível em PT-BR",
  "details": { /* opcional, apenas em 400 ZodError */ }
}
```

Códigos de status mais comuns:

| Status | Significado |
| --- | --- |
| `200 OK` | Sucesso |
| `201 Created` | Recurso criado (cadastro) |
| `307 Redirect` | Login bem-sucedido → redireciona para `return` ou `/{locale}/conta` |
| `400 Bad Request` | Payload inválido (Zod) |
| `401 Unauthorized` | Sem credencial ou token inválido/expirado |
| `402 Payment Required` | Sem créditos (Mentor) — **gate neutralizado via ADR-010** |
| `403 Forbidden` | Sem permissão (rotas ADMIN) |
| `404 Not Found` | Recurso inexistente |
| `405 Method Not Allowed` | Método não suportado pela rota |
| `429 Too Many Requests` | Rate limit excedido — veja `Retry-After` |
| `500 Internal Server Error` | Erro inesperado do servidor |

## Índice de rotas

### `/api/akasha/auth/*` — Autenticação

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| `POST` | [`/api/akasha/auth/login`](./auth/login.md) | Não | Login com email + senha. Retorna `307` com cookies `Set-Cookie` ou `401` se credenciais inválidas. |
| `POST` | [`/api/akasha/auth/register`](./auth/register.md) | Não | Cadastro LGPD-compliant (consentimento explícito). Concede 10 créditos de signup. |
| `GET` | [`/api/akasha/auth/me`](./auth/me.md) | Sim | Retorna perfil do usuário autenticado (id, email, name, locale, pushEnabled, ichingEnabled, birthDate, birthCity). |
| `PATCH` | [`/api/akasha/auth/me`](./auth/me.md) | Sim | Atualiza flags do perfil (atualmente `ichingEnabled` — opt-in LGPD para sorteio diário de I Ching). |
| `POST` | [`/api/akasha/auth/refresh`](./auth/refresh.md) | Refresh cookie | Rotaciona access + refresh token (refresh token rotation com `jti` único). |
| `POST` | [`/api/akasha/auth/logout`](./auth/logout.md) | Não | Limpa cookies de sessão. Idempotente. |

### `/api/mentor/*` — Mentor Akáshico

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| `POST` | [`/api/mentor/ask`](./mentor/ask.md) | Sim | Streaming SSE (Server-Sent Events) com resposta do Mentor. Cobra 1 crédito por mensagem (gate neutralizado via ADR-010). |

### `/api/mcp` — Model Context Protocol

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| `GET` | [`/api/mcp`](./mcp/tools.md) | Não | Health check + lista tools/resources/prompts registrados. |
| `POST` | [`/api/mcp`](./mcp/tools.md) | Não | JSON-RPC 2.0 dispatch: `initialize`, `ping`, `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list`. |

### `/api/admin/*` — Administração (role ADMIN)

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| `POST` | [`/api/admin/credits/grant`](./admin/credits-grant.md) | ADMIN | Concede créditos manualmente a um usuário. Cria `CreditEntry` com `reason='admin_grant'`. |
| `POST` | [`/api/admin/credits/reconcile`](./admin/credits-reconcile.md) | ADMIN | Roda reconciliação entre ledger de créditos e contagem de consultas ao Mentor. |
| `POST` | [`/api/admin/webhooks/grimoire-sync`](./admin/webhooks-grimoire-sync.md) | HMAC / Bearer / ADMIN | Sincroniza textos do grimório a partir de webhook GitHub. |

## Rotas ainda não documentadas

O Akasha Portal possui **65+ rotas** ao todo (ver
`apps/akasha-portal/src/app/api/`). Esta referência cobre apenas os
endpoints de **Auth**, **Mentor**, **MCP** e **Admin** — domínios mais
consultados por integrações externas. Rotas de domínio específico
(Mandala, Diário, Pesquisa, etc.) serão adicionadas em waves futuras.

> Rotas marcadas como “planejado” no Wave 15.3 plan (metrics, audit-logs,
> users em `/api/admin/*`) **não existem no código atual** e portanto não
> são documentadas aqui. Quando forem implementadas, novas páginas serão
> adicionadas seguindo o mesmo padrão.

## Versionamento

Esta documentação reflete o estado do branch `main` em
**2026-06-24** (commit `43a8b8d9`). Mudanças em contrato de API devem
ser refletidas aqui no mesmo PR — abra uma issue em
`.hermes/plans/` para sinalizar lacunas.

## Próximos passos

- [Login](./auth/login.md) — começar autenticação
- [Mentor ask](./mentor/ask.md) — streaming com SSE
- [MCP tools](./mcp/tools.md) — integração com agentes externos
