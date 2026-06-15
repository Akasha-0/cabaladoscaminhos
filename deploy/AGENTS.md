# Deploy DOX

## Purpose

Configurações de deployment, infraestrutura, e runtime de produção
para o monorepo `cabala-dos-caminhos` (Akasha OS, Cabala dos Caminhos,
e módulos associados).

## Stack de Produção (atual)

- **Frontend host**: [Vercel](https://vercel.com) (Fluid Compute, default)
- **Domínio**: TBD (atualmente Vercel preview URL)
- **CI/CD**: Vercel Git Integration (push to `loop/w2` ou `main` → preview; merge → production)
- **Database**: PostgreSQL + pgvector (local dev: Docker; prod: Vercel Marketplace Postgres ou Neon)
- **Cache**: Vercel KV / Marketplace (não usado atualmente)
- **Object storage**: Vercel Blob (futuro, para assets de signos/ervas)
- **Auth**: JWT custom (cookie httpOnly `akasha_session`) — `@/lib/application/auth/akasha-jwt`
- **Observability**: Vercel Analytics + Logs

> **Nota (Jun 2026)**: Vercel Fluid Compute é o default — não Edge Functions
> (deprecated), Node.js 24 LTS, full Node.js em Middleware. Ver
> [Vercel knowledge-update 2026-02-27](https://vercel.com/docs) para detalhes.

## Ownership

- `systemd/`: Unit files para serviços systemd (legado / self-hosted, NÃO usado em produção Vercel)
  - Backup de unit files para deploy self-hosted em VPS (DigitalOcean/Hetzner)
  - Mantido para disaster recovery se Vercel ficar indisponível

## Vercel Configuration

- `apps/akasha-portal/vercel.json` (ou `vercel.ts` — preferir TypeScript)
- `@akasha/core*` packages: build via Turbo (`pnpm turbo run build --filter=akasha-portal`)
- Environment vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `OPENROUTER_API_KEY`

## Local Contracts

- Scripts de deployment devem ser **idempotentes** (rerunnable sem side-effects)
- Configurações de produção **separadas de dev** (`.env.production` vs `.env.local`)
- Migrations Prisma: `prisma migrate deploy` em CI, NUNCA `prisma db push` em prod
- Schemas Prisma 7+ vivem em `prisma.config.ts` (URL movido para lá)
- Next.js `output: 'export'` **PROIBIDO** (incompatível com `cookies()` em rotas auth)

## Work Guidance

- **Vercel-first**: 95% dos deploys são Vercel (zero config para Next.js)
- **Backups automáticos** (self-hosted): systemd timers diários
- **Verificar em preview** antes de merge para `main`
- **Rollback**: Vercel dashboard → Deployments → Promote to Production
- **Secrets**: `vercel env pull` para local; nunca commitar `.env*`
- **Logs**: `vercel logs [deployment-url]` ou dashboard
- **VAPID keys** (futuro, F-228 mobile): `npx web-push generate-vapid-keys`

## Verification

- `vercel env ls` — listar env vars
- `vercel logs --follow` — stream de logs
- `pnpm --filter akasha-portal build` — build local sanity check
- `systemctl status <service>` (apenas self-hosted)
- `journalctl -u <service> -f` (apenas self-hosted)

## Migration Plan: Vercel Edge → Fluid Compute (Jun 2026)

- `middleware.ts` em `apps/akasha-portal/` — converter de Edge runtime para Fluid (full Node.js)
- Funções API em `apps/akasha-portal/src/app/api/` — já em Fluid, sem mudança
- `vercel.json` (legado) → `vercel.ts` (recomendado Jun 2026+)

## Child DOX Index

- `systemd/` — Unit files para deploy self-hosted (legado, mantido para DR)
