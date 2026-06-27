# Deploy Runbook — Akasha Portal (Wave 11)

> **Production deploy manual + automação Vercel.** Leia antes do primeiro deploy.
> Para troubleshooting de CI/build, ver [docs/CI-CD-GUIDE.md](./docs/CI-CD-GUIDE.md).

---

## 📋 TL;DR (60 segundos)

```bash
# 1. Validar tudo antes
bash scripts/pre-deploy-check.sh

# 2. Se passou: deploy
git push origin main
# Vercel auto-deploy via GitHub integration. Acompanhe em:
# https://vercel.com/akasha/cabaladoscaminhos/deployments

# 3. Smoke test pós-deploy
curl -I https://cabaladoscaminhos.com.br
```

Se algo quebrar, ver [§ Rollback](#-rollback).

---

## 🎯 Visão geral do pipeline

```
Developer push (main)
  ↓
GitHub Actions CI gate
  ├── type-check (tsc)
  ├── build (next build)
  ├── vitest + playwright
  └── preview deploy (PR only)
       ↓
       Merge to main
            ↓
            Vercel production deploy (auto)
                 ↓
                 Crons (notificações + embeddings)
                      ↓
                      Sentry/PostHog telemetry
```

**Branch policy:**

| Branch | Auto-deploy | Destino |
|--------|-------------|---------|
| `main` | ✅ Vercel production | `https://cabaladoscaminhos.com.br` |
| PRs contra `main`/`develop` | ✅ Vercel preview | `https://cabaladoscaminhos-*.vercel.app` |
| `develop` | ✅ Vercel preview (alias) | `https://develop.cabaladoscaminhos.com.br` (opt-in) |
| qualquer outra | ❌ | não-deploya |

---

## 📦 Pré-requisitos

### Contas e serviços externos

| Serviço | Por quê | Onde criar |
|---------|---------|------------|
| **Vercel** | Hosting + crons + edge | https://vercel.com/signup (conta GitHub) |
| **Supabase** | Postgres + Auth + Storage + Realtime | https://supabase.com (free tier OK pra staging) |
| **OpenAI** | Akasha IA (LLM primário) | https://platform.openai.com (API key) |
| **Upstash Redis** | Rate-limit + cache (opcional) | https://upstash.com |
| **Resend** | Email transacional | https://resend.com |
| **PostHog** | Analytics + feature flags | https://posthog.com |
| **Sentry** | Error tracking (opcional mas recomendado) | https://sentry.io |

### Ferramentas locais

```bash
node --version    # >= 22.x (Vercel default; CI roda 22)
pnpm --version    # >= 9.x
vercel --version  # opcional, pode usar Dashboard
```

---

## 🚀 Setup inicial (primeira vez)

### 1. Conectar repo ao Vercel

1. Acesse https://vercel.com/new
2. Selecione `Akasha-0/cabaladoscaminhos`
3. Framework preset: **Next.js** (autodetectado)
4. **Build command**: deixe vazio (lê de `vercel.json`)
5. **Install command**: deixe vazio (lê de `vercel.json`)
6. **Output directory**: deixe vazio (Next.js padrão = `.next`)
7. **Node version**: 22
8. Clicar **Deploy** (vai falhar pq faltam env vars — tudo bem, é esperado)

### 2. Configurar environments no Vercel

Vercel → Project → Settings → Environments:

| Environment | Branch | Auto-deploy | Proteção |
|-------------|--------|-------------|----------|
| Production | `main` | ✅ | Requer CI ✅ + review ✅ |
| Preview | todos exceto main | ✅ | nenhum (preview é público) |
| Development | — | ❌ | n/a (dev local) |

### 3. Configurar env vars (Production)

Vercel → Project → Settings → Environment Variables → **Production**

> Copie de [.env.example](./.env.example). Vars marcadas como `# OPTIONAL`
> podem ficar vazias (app tem fallback). Mínimo viável:

```bash
# Database (Supabase pooler)
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI (pelo menos um provider)
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://cabaladoscaminhos.com.br

# Cron auth
CRON_SECRET=$(openssl rand -hex 32)

# CORS
ALLOWED_ORIGINS=https://cabaladoscaminhos.com.br

# Email (Resend)
RESEND_API_KEY=re_...
NOTIFICATION_EMAIL_FROM=Akasha Portal <noreply@cabaladoscaminhos.com.br>
```

> ⚠️ **NUNCA** use service_role key no client. `SUPABASE_SERVICE_ROLE_KEY` é
> server-only — Vercel enforça isso automaticamente (vars sem `NEXT_PUBLIC_`
> não vão pro bundle do client).

### 4. Configurar env vars (Preview)

Mesmo set, mas com **keys de staging** (Supabase separado, OpenAI key de teste).

Vercel → Project → Settings → Environment Variables → **Preview**

```bash
DATABASE_URL=postgresql://postgres.STAGING_REF:...@...pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://STAGING_REF.supabase.co
# ... etc, com keys de TESTE
```

### 5. Configurar secrets do GitHub (CI)

GitHub → Settings → Secrets and variables → Actions → **New repository secret**

| Secret | Obrigatório | Onde usar |
|--------|-------------|-----------|
| `VERCEL_TOKEN` | ✅ (se quiser CI deploy) | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | ✅ | Vercel → Settings → General |
| `VERCEL_PROJECT_ID` | ✅ | Vercel → Project → Settings → General |
| `CODECOV_TOKEN` | opcional | codecov.io → repo settings |
| `SNYK_TOKEN` | opcional | snyk.io → account settings |

---

## ✅ Deploy manual (production)

### Via GitHub (recomendado)

```bash
# 1. Validar tudo antes
bash scripts/pre-deploy-check.sh
# Esperado: ✅ TUDO OK (exit 0)

# 2. Se passou: commit + push
git add .
git commit -m "feat(scope): descrição"
git push origin main

# 3. Acompanhar em:
# https://vercel.com/akasha/cabaladoscaminhos/deployments
```

### Via Vercel CLI (emergência / hotfix direto)

```bash
# 1. Pull de variáveis + settings
vercel pull --yes --environment=production --token=$VERCEL_TOKEN

# 2. Build local (Vercel parity)
vercel build --yes --token=$VERCEL_TOKEN

# 3. Deploy (--prod força produção)
vercel deploy --prebuilt --token=$VERCEL_TOKEN --prod
```

### Via Vercel Dashboard (sem CLI)

1. Vercel → Project → Deployments → **Create Deployment**
2. Branch: `main`
3. Clicar **Deploy**
4. Aguardar build (~3-5min)

---

## 🔍 Smoke tests pós-deploy

Imediatamente após deploy em produção:

```bash
# 1. Homepage (esperado: 200)
curl -I https://cabaladoscaminhos.com.br

# 2. Health check (se tiver /api/health)
curl -s https://cabaladoscaminhos.com.br/api/health | jq

# 3. Auth endpoint (esperado: 401 sem token, não 500)
curl -I https://cabaladoscaminhos.com.br/api/auth/session

# 4. Akashic IA (esperado: 401 ou 503, não 500)
curl -I -X POST https://cabaladoscaminhos.com.br/api/akashic/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# 5. Notifications (esperado: 401 sem token)
curl -I https://cabaladoscaminhos.com.br/api/notifications
```

**Critérios de aceitação:**

- [ ] Homepage retorna 200 (não 5xx)
- [ ] Sem erros novos no Sentry (últimos 5min)
- [ ] Sem spike de erros 5xx no Vercel Logs
- [ ] PostHog recebendo pageviews (verifique `https://us.i.posthog.com/activity`)
- [ ] Cron jobs rodando (ver logs em `/api/notifications/templates` e `/api/akashic/refresh-embeddings`)

---

## 🔄 Rollback

### Automático (Vercel)

Vercel mantém últimos **6 deploys em produção**. Se um deploy quebra:

1. Vercel → Project → Deployments
2. Encontrar último deploy funcional
3. ⋯ → **Promote to Production**
4. Confirmação: ~30s

### Manual via git

```bash
# Reverter o commit
git revert <SHA>
git push origin main
# Vercel auto-deploya o revert
```

### Manual via CLI

```bash
vercel rollback --token=$VERCEL_TOKEN
```

---

## 🛠️ Troubleshooting

### Build falhou: "Prisma client not generated"

**Causa:** `vercel.json` build command pulou `db:generate`.

**Fix:**
```bash
# Verificar que buildCommand em vercel.json é:
"buildCommand": "pnpm db:generate && pnpm build"
```

### Build falhou: OOM (Out of Memory)

**Causa:** Build pesado (Next.js 14+ com experimental build mode).

**Mitigação:**
- `vercel.json` já seta `NODE_OPTIONS=--max-old-space-size=4096` em `build.env`.
- Se persistir, comentar a linha experimental em `package.json`:
  ```json
  "build": "next build"  // sem --experimental-build-mode
  ```

### Build falhou: "Env var X is required"

**Causa:** Falta env var no Vercel.

**Fix:** Vercel → Project → Settings → Environment Variables → Production → adicionar var faltante → redeploy.

### Cron não está rodando

> **Status atual (Wave 11)**: crons estao **desabilitados** intencionalmente em `vercel.json`
> (handlers nao implementados — ver [docs/DEPLOY-WAVE11.md §Findings](./docs/DEPLOY-WAVE11.md)).

Para habilitar crons quando os handlers existirem:
1. Editar `vercel.json` adicionando entradas em `"crons": []`
2. Garantir que o handler valida `Authorization: Bearer ${CRON_SECRET}`
3. Deploy — Vercel agenda automaticamente

### "ECONNREFUSED" em prod mas funciona local

**Causa:** `DATABASE_URL` aponta pra localhost.

**Fix:** Trocar para Supabase pooler (porta 6543):
```
postgresql://postgres.REF:PASS@aws-0-REGION.pooler.supabase.com:6543/postgres
```

### "fetch failed" em chamadas pra OpenAI / Anthropic

**Causa:** Função serverless sem timeout suficiente.

**Fix:** `vercel.json` já tem `maxDuration: 60` e `memory: 1024` em `src/app/api/akashic/**`. Se ainda falhar, verificar rate limit do provider.

### Preview deploy não comentou no PR

**Causa 1:** Secret `VERCEL_TOKEN` ausente ou expirado.

**Causa 2:** Workflow `deploy-preview.yml` não rodou (verifique Actions tab).

**Fix:**
1. GitHub → Settings → Secrets → verificar `VERCEL_TOKEN`
2. Actions → workflow run → step "Deploy to Vercel" → ver logs

### Deploy passa mas app quebra em runtime

**Causa:** Env var de runtime faltando OU schema mismatch entre DB e Prisma.

**Debug:**
```bash
# 1. Logs de runtime (últimos 30min)
vercel logs cabaladoscaminhos --token=$VERCEL_TOKEN --since=30m

# 2. Sentry (se configurado)
# https://sentry.io → Issues → New errors

# 3. PostHog
# https://us.i.posthog.com → Activity
```

---

## 📊 Monitoring (pós-deploy)

### Métricas-chave

| Métrica | Onde olhar | Esperado | Alerta |
|---------|------------|----------|--------|
| Build duration | Vercel → Deployments | < 5min | > 8min |
| LCP (Largest Contentful Paint) | Vercel Analytics | < 2.5s | > 4s |
| 5xx error rate | Vercel Logs | < 0.1% | > 1% |
| Build success rate | Vercel → Deployments | > 95% | < 80% |
| Cron success | Logs de `/api/notifications/templates` | 100% | < 95% |

### Alertas configurados

- **Vercel**: email notification em build failure (configurado em Settings → Notifications)
- **Sentry**: alert em new issue com > 5 ocorrências (configurar em sentry.io → Alerts)
- **PostHog**: weekly summary (configurar em posthog.com → Subscriptions)

---

## 📝 Checklist de release (production gate)

Antes de cada release em produção:

```markdown
- [ ] Branch `main` está verde em CI (tsc + lint + test + build)
- [ ] `bash scripts/pre-deploy-check.sh` retorna exit 0
- [ ] Migrations Prisma aplicadas em prod (`npx prisma migrate status`)
- [ ] Env vars em produção batem com `.env.example` (sem placeholders)
- [ ] CHANGELOG.md atualizado
- [ ] Smoke tests pós-deploy passaram (curl + Sentry + PostHog)
- [ ] Vercel logs sem novos erros 5xx nos 10min após deploy
- [ ] Postmortem se houve rollback (link no CHANGELOG)
```

---

## 🔗 Links úteis

- **Vercel Dashboard**: https://vercel.com/akasha/cabaladoscaminhos
- **Supabase Dashboard**: https://app.supabase.com/project/PROJECT_REF
- **Sentry**: https://sentry.io/organizations/akasha/issues
- **PostHog**: https://us.i.posthog.com
- **OpenAI Usage**: https://platform.openai.com/usage
- **Status page Akasha**: https://status.cabaladoscaminhos.com.br (TODO: criar)

---

## 📚 Documentação complementar

- [docs/CI-CD-GUIDE.md](./docs/CI-CD-GUIDE.md) — Pipeline CI/CD completo
- [docs/SUPABASE-SETUP.md](./docs/SUPABASE-SETUP.md) — Setup Supabase detalhado
- [docs/PERFORMANCE-BUDGETS.md](./docs/PERFORMANCE-BUDGETS.md) — Limites de performance
- [docs/SECURITY-AUDIT.md](./docs/SECURITY-AUDIT.md) — Threat model
- [CHANGELOG.md](./CHANGELOG.md) — Histórico de releases

---

> **Última atualização**: Wave 11 (2026-06-27) — Refactor completo do deploy config.
> Mudanças principais: vercel.json otimizado, .vercelignore, pre-deploy-check.sh, workflow deploy-preview.yml.
