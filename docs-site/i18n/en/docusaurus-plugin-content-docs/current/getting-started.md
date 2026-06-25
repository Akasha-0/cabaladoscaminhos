---
slug: /getting-started
title: Getting Started
sidebar_position: 2
description: How to clone, install, configure and run Akasha Portal locally.
---

# Getting Started

> **PT-BR + EN** — full local setup guide for Akasha Portal.

## 1. Prerequisites

| Tool         | Version | How to check        |
|--------------|---------|---------------------|
| Node.js      | ≥ 20    | `node --version`    |
| pnpm         | ≥ 9     | `pnpm --version`    |
| PostgreSQL   | ≥ 15    | `psql --version`    |
| Git          | ≥ 2.30  | `git --version`     |

We also recommend:

- **Supabase** (production) or local Postgres (dev)
- An optional Git GUI client
- **Node 20 LTS** or newer

## 2. Clone

```bash
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos
```

## 3. Install

The monorepo uses **pnpm workspaces** with Turbo. Internal packages
(`@akasha/core`, `@akasha/mentor`, etc.) are linked automatically.

```bash
pnpm install
```

:::note
If you use `npm` or `yarn`, it works for individual packages, but
**workspace-wide scripts** require `pnpm`.
:::

## 4. Environment variables

Copy the example file and edit:

```bash
cp .env.example .env
```

Required variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/akasha
DIRECT_URL=postgresql://user:password@localhost:5432/akasha

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Auth
AKASHA_JWT_SECRET=change-me-32-chars-minimum
AKASHA_SESSION_COOKIE=akasha_session

# Cron
CRON_SECRET=change-me-32-chars-minimum

# Optional — LLM provider
OPENAI_API_KEY=sk-proj-xxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

:::warning
**Never commit `.env`** — it is in `.gitignore`. Use `.env.example` as
the versioned template.
:::

## 5. Database

```bash
# Apply Prisma schema
pnpm db:push

# Or with migrations
pnpm db:migrate

# Studio (GUI)
pnpm db:studio
```

## 6. Dev server

```bash
# Portal Next.js (PWA)
pnpm dev:portal
# → http://localhost:3000

# This documentation (Docusaurus)
pnpm docs:dev
# → http://localhost:3001

# Mentor CLI
pnpm dev:mentor
```

## 7. Tests

```bash
pnpm test            # watch mode
pnpm test:run        # CI mode
pnpm test:core       # core packages only
pnpm test:e2e:browser   # Playwright
```

## 8. Production build

```bash
pnpm build           # portal + packages
pnpm docs:build      # static docs → docs-site/build/
```

## 🐛 Troubleshooting

| Symptom                                | Likely cause                          | Solution                                |
|----------------------------------------|---------------------------------------|-----------------------------------------|
| `EADDRINUSE :3000`                     | Another app on that port              | `lsof -i :3000` + `kill`                |
| `Prisma Client not found`              | `prisma generate` not run             | `pnpm db:generate`                      |
| `Module not found: @akasha/core`       | TS paths not resolving                | Restart editor + `pnpm typecheck`       |
| `Cookies() should be awaited`          | Next.js 15+ async cookies             | `const c = await cookies()`             |
| `CORS policy` on MCP call              | Origin not whitelisted                | Add origin in `next.config.ts`          |

## 📚 Next steps

- **[Architecture](./architecture/intro)** — understand the 5 Pillars and Mentor
- **[API Reference](./api/intro)** — REST endpoints and auth
- **[Contributing](./contributing/intro)** — PR patterns, tests, deploy
