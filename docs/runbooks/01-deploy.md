# Runbook 01 — Deploy

> **Quando usar:** Antes de cada deploy em produção, ou durante rollout de
> feature crítica. **TL;DR:** merge em `main` → CI roda → Vercel auto-deploy.
> feature crítica. **TL;DR:** merge em `main` → CI roda → Vercel auto-deploy.

---

## Pré-condições (checklist)

Antes de fazer merge em `main`, confirme:

- [ ] Branch atualiza com `origin/main` (`git fetch origin && git rebase origin/main`)
- [ ] CI verde no PR (lint + typecheck + tests + build)
- [ ] Code review aprovado (≥ 1 aprovação)
- [ ] Sem secrets novos commitados (`git diff origin/main -- ':!*.md' | grep -iE '(api[_-]?key|password|token|secret)'` → deve ser vazio)
- [ ] Se mudou `prisma/schema.prisma`: migration criada e testada localmente
- [ ] Se mudou `.env.example`: variáveis novas adicionadas também na Vercel (Production + Preview)
- [ ] Se mudou rotas em `src/app/api/**/route.ts`: API Reference atualizada (`bash scripts/check-docs.sh`)

---

## Fluxo de deploy

```
PR aberto/merge → CI (GitHub Actions)
                 ├─ lint (eslint)
                 ├─ typecheck (tsc --noEmit)
                 ├─ tests (vitest)
                 ├─ build (next build)
                 └─ quality-evals (se src/** mudou)

Merge em main    → Vercel production deploy
                 ├─ installCommand: pnpm install --frozen-lockfile
                 ├─ buildCommand: pnpm db:generate && pnpm build
                 └─ region: gru1 (São Paulo)

SLA Vercel       → ~2-4 min do merge até DNS propagado
```

---

## Passo a passo (manual, se automação falhar)

### 1. Validar localmente

```bash
# Limpar artefatos antigos
rm -rf .next node_modules/.cache

# Reinstalar (pnpm é estrito com lockfile)
pnpm install --frozen-lockfile

# Validar tipo
pnpm exec tsc --noEmit

# Rodar testes
pnpm test:run

# Build (simula Vercel)
pnpm build
```

Se qualquer passo falhar, **NÃO faça merge**.

### 2. Merge em main

```bash
# Atualizar branch local
git checkout main
git pull origin main

# Merge (preferir squash via PR; merge local só em hotfix)
git merge --squash feat/minha-feature
git commit -m "feat: descrição do que foi feito"
git push origin main
```

### 3. Acompanhar Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard) → projeto **cabala-dos-caminhos**
2. Aba **Deployments** → entrada mais recente deve estar **Building** → **Ready**
3. Se falhar:
   - Clique no deployment → aba **Logs** → copie o erro
   - Abra issue em `#deploys` (Slack) com: branch, SHA, link do log, screenshot
   - Rollback: clique nos 3 pontos → **Promote to Production** em deployment anterior

### 4. Validar em produção

```bash
# Health check básico
curl -fsS https://akasha.com.br/api/auth/test
# → { "ok": true, "latencyMs": 87 }

# Smoke test (Playwright)
pnpm e2e:smoke
```

Se algum teste falhar em prod (mas passou em CI), veja o [runbook 02 — Incident Response](./02-incident-response.md).

---

## Variáveis de ambiente (Vercel)

### Production

| Nome | Tipo | Origem |
|------|------|--------|
| `DATABASE_URL` | string | Supabase pooler (porta 6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | string | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | string | Supabase dashboard (anon-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | string ⚠️ | Supabase dashboard (server-only) |
| `OPENAI_API_KEY` | string ⚠️ | OpenAI platform |
| `REDIS_URL` | string | Upstash ou Vercel KV |
| `RESEND_API_KEY` | string ⚠️ | Resend dashboard |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | string | Web-Push public |
| `VAPID_PRIVATE_KEY` | string ⚠️ | Web-Push private |
| `POSTHOG_KEY` | string | PostHog project settings |
| `SENTRY_DSN` | string | Sentry project settings |
| `NEXT_PUBLIC_APP_URL` | string | `https://akasha.com.br` |
| `ALLOWED_ORIGINS` | string | `https://akasha.com.br,https://www.akasha.com.br` |
| `NODE_ENV` | auto | `production` (Vercel injeta) |

### Preview (cada PR)

Mesma estrutura, mas:
- `DATABASE_URL` aponta para **branch de staging** do Supabase
- `OPENAI_API_KEY` é chave de **dev** (com limite mensal baixo)
- `NEXT_PUBLIC_APP_URL` é a URL do preview deploy

> ⚠️ Service-role keys **NUNCA** devem ser `NEXT_PUBLIC_*` (vazam no client bundle).

---

## Rollback

```bash
# Via Vercel CLI
vercel rollback https://akasha.com.br

# Ou via dashboard
# Deployments → selecione o anterior → Promote to Production

# Banco: rollback de migration (ver runbook 04)
pnpm prisma migrate resolve --rolled-back <migration_name>
```

---

## Pós-deploy

1. **Anunciar em `#deploys`:** "🚀 Deploy main @ <sha>: <descrição>"
2. **Monitorar métricas** por 30 min: PostHog (erro 5xx), Sentry (issues novas), Vercel Analytics (latência p95)
3. **Smoke test manual:** login + criar post + Akasha IA chat
4. **Documentar no CHANGELOG.md** se for release visível

---

## Referências

- [Vercel docs — Deployments](https://vercel.com/docs/concepts/deployments/overview)
- [Supabase — Connection pooler](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Next.js — Production checklist](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- `docs/CI-CD-GUIDE.md` — pipeline completo
- `docs/SUPABASE-SETUP.md` — setup inicial de projeto