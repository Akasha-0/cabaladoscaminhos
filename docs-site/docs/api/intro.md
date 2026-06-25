---
slug: /api/intro
title: API Reference — Introdução
sidebar_position: 1
description: Referência da API REST do Akasha Portal — autenticação, endpoints por recurso.
---

# API Reference

> **🚧 Em construção** — esta seção será populada pela **Wave 15.3**
> com OpenAPI spec auto-gerada a partir das rotas Next.js.

A API do Akasha Portal segue REST com 50+ endpoints em
`apps/akasha-portal/src/app/api/`. Categorias:

- **`/api/auth`** — login, logout, refresh, signup
- **`/api/mentor`** — chat, intent, RAG retrieval
- **`/api/mcp`** — Model Context Protocol tools
- **`/api/admin`** — dashboards, métricas, auditoria
- **`/api/leitura`** — CRUD de leituras (5 Pilares)
- **`/api/usuarios`** — perfil, preferências
- **`/api/cron`** — jobs agendados (vercel cron + CRON_SECRET)
- **`/api/export`** — PDF, JSON, CSV (Wave 13.4)

## Autenticação

Todas as rotas mutating exigem:

- Cookie `akasha_session` (HttpOnly, Secure, SameSite=Lax)
- Ou header `Authorization: Bearer <token>` (para MCP / cron)

A verificação é feita por `verifyAkashaToken` (cookie) ou
`requireAkashaApi` (auth wrapper). Cron usa `verifyCronSecret`.

## OpenAPI spec

A spec OpenAPI 3.1 será auto-gerada por um script (`scripts/generate-openapi.ts`)
que varre as rotas Next.js. Veja Wave 15.3.
