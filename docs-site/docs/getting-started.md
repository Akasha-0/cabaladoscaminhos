---
slug: /getting-started
title: Getting Started
sidebar_position: 2
description: Como clonar, instalar, configurar e rodar o Akasha Portal localmente.
---

# Getting Started

> **PT-BR + EN** — guia completo de setup local do Akasha Portal.

## 1. Pré-requisitos

| Ferramenta | Versão  | Como verificar     |
|------------|---------|---------------------|
| Node.js    | ≥ 20    | `node --version`    |
| pnpm       | ≥ 9     | `pnpm --version`    |
| PostgreSQL | ≥ 15    | `psql --version`    |
| Git        | ≥ 2.30  | `git --version`     |

Recomendamos também:

- **Supabase** (produção) ou Postgres local (dev)
- Um cliente Git GUI opcional
- **Node 20 LTS** ou superior

## 2. Clone

```bash
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos
```

## 3. Install

O monorepo usa **pnpm workspaces** com Turbo. Os packages internos
(`@akasha/core`, `@akasha/mentor`, etc.) são linkados automaticamente.

```bash
pnpm install
```

:::note
Se você usa `npm` ou `yarn`, funciona para packages isolados, mas
**scripts workspace-wide** exigem `pnpm`.
:::

## 4. Variáveis de ambiente

Copie o arquivo de exemplo e edite:

```bash
cp .env.example .env
```

Variáveis obrigatórias:

```bash
# Database
DATABASE_URL=postgresql://user:senha@localhost:5432/akasha
DIRECT_URL=postgresql://user:senha@localhost:5432/akasha

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Auth
AKASHA_JWT_SECRET=mude-32-caracteres-minimo
AKASHA_SESSION_COOKIE=akasha_session

# Cron
CRON_SECRET=mude-32-caracteres-minimo

# Opcional — provedores LLM
OPENAI_API_KEY=sk-proj-xxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

:::warning
**Nunca commite `.env`** — está em `.gitignore`. Use `.env.example`
como template versionado.
:::

## 5. Banco de dados

```bash
# Aplica schema Prisma
pnpm db:push

# Ou com migrations
pnpm db:migrate

# Studio (GUI)
pnpm db:studio
```

## 6. Dev server

```bash
# Portal Next.js (PWA)
pnpm dev:portal
# → http://localhost:3000

# Esta documentação (Docusaurus)
pnpm docs:dev
# → http://localhost:3001

# Mentor CLI
pnpm dev:mentor
```

## 7. Testes

```bash
pnpm test            # watch mode
pnpm test:run        # CI mode
pnpm test:core       # só core packages
pnpm test:e2e:browser   # Playwright
```

## 8. Build de produção

```bash
pnpm build           # portal + packages
pnpm docs:build      # documentação estática → docs-site/build/
```

## 🐛 Troubleshooting

| Sintoma                                | Causa provável                      | Solução                                |
|----------------------------------------|--------------------------------------|----------------------------------------|
| `EADDRINUSE :3000`                     | Outra app usando a porta            | `lsof -i :3000` + `kill`               |
| `Prisma Client não encontrado`         | `prisma generate` não rodou         | `pnpm db:generate`                     |
| `Module not found: @akasha/core`       | TS paths não resolveram             | Reiniciar editor + `pnpm typecheck`    |
| `Cookies() should be awaited`          | Next.js 15+ async cookies           | `const c = await cookies()`            |
| `CORS policy` em chamada MCP           | Origem não whitelisted              | Adicionar origin em `next.config.ts`   |

## 📚 Próximos passos

- **[Arquitetura](./architecture/intro)** — entenda os 5 Pilares e o Mentor
- **[API Reference](./api/intro)** — endpoints REST e auth
- **[Contribuindo](./contributing/intro)** — padrões de PR, testes, deploy
