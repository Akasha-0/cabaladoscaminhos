---
sidebar_position: 5
title: Rotas planejadas (Admin)
description: Endpoints administrativos ainda não implementados — metrics, audit-logs, users.
---

# Rotas administrativas planejadas

Esta página documenta endpoints administrativos **planejados** mas
**ainda não implementados** no código atual (commit `43a8b8d9`, branch
`main`). Serão adicionados aqui conforme forem entregues em waves
futuras.

> **Política**: não documentamos rotas inexistentes (ver constraint
> do Wave 15.3 plan). Quando cada rota for implementada, ela ganha
> uma página dedicada em `docs/api/admin/` e o índice em
> [`/api`](../index.md) é atualizado.

## `GET /api/admin/metrics` — métricas operacionais

**Status:** 🔴 não implementado.

Plano: expor métricas agregadas de uso (consultas ao Mentor, cadastros,
grants, conversões) para dashboard admin. Formato provável:
Prometheus exposition ou JSON.

## `GET /api/admin/audit-logs` — trilha de auditoria

**Status:** 🔴 não implementado.

Plano: listar eventos sensíveis (`admin_grant`, `user_suspended`,
`password_reset`, `consent_revoked`) com filtros por período, userId e
tipo. Útil para compliance LGPD (Art. 37 — registro de operações de
tratamento).

> Ver Wave 14.5 (`wave-14.5-audit-logs`) para o plano original.

## `GET` / `PATCH /api/admin/users` — gestão de usuários

**Status:** 🔴 não implementado.

Plano: CRUD administrativo de usuários (listar, suspender, reativar,
reset de senha). Atualmente a única operação admin via API é
`/api/admin/credits/grant`.

> Ver Wave 14.2 (`wave-14.2-user-mgmt`) para o plano original.

## Status atual de `/api/admin/*`

| Endpoint | Status | Página |
| --- | --- | --- |
| `POST /api/admin/credits/grant` | ✅ implementado | [credits-grant.md](./credits-grant.md) |
| `POST /api/admin/credits/reconcile` | ✅ implementado | [credits-reconcile.md](./credits-reconcile.md) |
| `POST /api/admin/webhooks/grimoire-sync` | ✅ implementado | [webhooks-grimoire-sync.md](./webhooks-grimoire-sync.md) |
| `GET /api/admin/metrics` | 🔴 planejado | este arquivo |
| `GET /api/admin/audit-logs` | 🔴 planejado | este arquivo |
| `GET/PATCH /api/admin/users` | 🔴 planejado | este arquivo |
