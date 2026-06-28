# Wave 27 — Deploy Production Runbook

> **Data**: 2026-06-28
> **Branch**: main @ 252d81c8
> **Autor**: Coder + Caio (Wave 27 — DEPLOY 4/6)
> **Status**: ✅ DELIVERED — substitui/atualiza `DEPLOY.md` da Wave 11
> **Pré-requisito**: secrets gerados e armazenados no cofre (ver `docs/SECRETS-CHECKLIST-W27.md`)

---

## 🎯 Objetivo

Runbook operacional **fim-a-fim** para promover código de `main` → produção no Vercel com segurança, observabilidade e rollback rápido. Cobre:

1. **Pre-deploy checklist** (10 itens — gate defensivo)
2. **Deploy steps** (Vercel — 6 passos)
3. **Post-deploy verification** (4 smoke checks)
4. **Rollback** (3 caminhos, ordem de preferência)
5. **Troubleshooting** (8 cenários comuns)

---

## 📦 Artefatos novos desta wave

| Arquivo | Status | Função |
|---------|--------|--------|
| `src/lib/env.ts` | ✅ criado | Zod schema — valida todas env vars no startup, fail-fast em prod |
| `.env.example` | ✅ atualizado | Definitivo (Wave 27+) — 13 seções, cobre TODOS os vars consumidos pelo código |
| `scripts/verify-env.sh` | ✅ criado | Checagem runtime de env vars + conectividade (DB, Supabase, OpenAI) |
| `docs/SECRETS-CHECKLIST-W27.md` | ✅ criado | Onboarding, rotação, resposta a comprometimento |
| `docs/DEPLOY-RUNBOOK-W27.md` | ✅ criado | Este arquivo |

> **Compatibilidade**: o runbook Wave 11 (`docs/DEPLOY-WAVE11.md` + `DEPLOY.md`) permanece como histórico. O **gate oficial** agora é o conjunto:
>
> ```bash
> bash scripts/verify-env.sh              # confirma env vars + conectividade
> bash scripts/pre-deploy-check.sh        # TSC + lint + imports + mig
> ```

---

## ✅ Pre-deploy checklist (10 itens)

> **Regra**: nenhum item pode estar **vermelho**. Amarelo (warning) só é aceitável se aprovado pelo lead.

### 1. **TypeScript** — 0 errors

```bash
npx tsc --noEmit --skipLibCheck
```

- **Esperado**: exit 0, sem output
- **Em sandbox OOM**: skip com `bash scripts/pre-deploy-check.sh --skip-tsc` e validar no CI

### 2. **Lint** — 0 critical

```bash
npm run lint
```

- **Esperado**: 0 errors (warnings OK se documentados)
- **CI strict**: `npm run lint -- --max-warnings=0`

### 3. **Tests** — passing

```bash
npm run test:run               # unit
npm run e2e:smoke              # critical flows (smoke suite)
```

- **Esperado**: 100% pass. Suites grandes (visual regression) podem ser opcionais no gate de PR.
- **Coverage floor**: verificar `vitest run --coverage` ≥ 70% (regra do projeto).

### 4. **Security audit** — 0 high

```bash
npm audit --audit-level=high
```

- **Esperado**: 0 high/critical vulnerabilities
- **Moderate**: documentar no PR se não for corrigível imediatamente.

### 5. **Env vars** — todas setadas

```bash
bash scripts/verify-env.sh
```

- **Esperado**: 🟢 green para todas as required vars; 🟢 green nos connectivity checks (DB, Supabase, OpenAI).
- **Quando falha**: ver `docs/SECRETS-CHECKLIST-W27.md` § Como pegar um secret.

### 6. **Database migrations** — aplicadas

```bash
npx prisma migrate status
```

- **Esperado**: "Database schema is up to date" — sem pending migrations.
- **Se há pendentes**: aplicar **antes** do deploy (`npx prisma migrate deploy`) ou em CI job separado.

### 7. **Supabase storage buckets** — configurados

- Buckets esperados: `avatars`, `posts-media`, `articles`, `temp` (ver `scripts/setup-supabase-storage.sh`).
- Cada bucket deve ter policies RLS ativas (default deny + grants específicos).

### 8. **DNS** — configurado

- Domínio apex (`cabaladoscaminhos.com.br`) + `www` apontando para Vercel (CNAME `cname.vercel-dns.com`).
- Verificar com: `dig cabaladoscaminhos.com.br +short` → deve retornar `76.76.21.21` (Vercel).

### 9. **SSL** — válido e cobindo HSTS preload

- Vercel provisiona Let's Encrypt automaticamente.
- Verificar em [SSL Labs](https://www.ssllabs.com/ssltest/) — esperado A+.
- `Strict-Transport-Security` header já está em `vercel.json#headers`.

### 10. **Backup strategy** — pronta

- **Database**: Supabase tem PITR (point-in-time recovery) — verificar que está ATIVO no dashboard.
- **Storage**: Supabase Storage replica para multi-region; em paralelo, snapshot semanal via `pg_dump` para S3 off-site.
- **Logs**: PostHog + Sentry retêm 90 dias (default do plano).

---

## 🚀 Deploy steps (Vercel)

### Step 1 — Push para origin

```bash
git add <files>
git commit -m "feat/deploy: <conventional commit message>"
git push origin main
```

- **PR merges**: usar "Squash and merge" no GitHub para manter `main` linear.
- **Branch protection**: `main` requer 1 approving review + status checks verdes.

### Step 2 — Conectar repo ao Vercel (one-time)

1. Acesse https://vercel.com/new
2. Selecione `Akasha-0/cabaladoscaminhos` (GitHub App já instalada)
3. **Framework Preset**: Next.js (auto-detectado)
4. **Root Directory**: `./` (raiz)
5. **Build Command**: deixar vazio (vem de `vercel.json`)
6. **Install Command**: deixar vazio (vem de `vercel.json`)
7. **Output Directory**: `.next` (vem de `vercel.json`)

### Step 3 — Setar env vars em Vercel Dashboard

1. Project → Settings → Environment Variables
2. Para CADA var em `.env.example`, setar valores separados por ambiente:
   - **Production** (master/principal)
   - **Preview** (staging-like, com secrets de staging)
   - **Development** (opcional — Vercel CLI pode usar `.env.local`)
3. **Tip**: usar [Vercel CLI bulk import](https://vercel.com/docs/cli/env) com um arquivo `.env.production`:

   ```bash
   vercel env pull .env.production --environment=production
   # edita localmente
   vercel env push .env.production --environment=production
   ```

### Step 4 — Configurar domínios

1. Project → Settings → Domains
2. Adicionar `cabaladoscaminhos.com.br` (apex) + `www.cabaladoscaminhos.com.br`
3. Vercel mostra CNAME records para configurar no registrar (Registro.br, etc).
4. **Aguardar propagação DNS** (até 48h, geralmente < 1h).

### Step 5 — Enable preview deployments

1. Project → Settings → Git → Production Branch: `main`
2. Automatic deployments from GitHub: **ON**
3. **Branch deploys**: All branches (gera preview URL por PR)
4. **Protection bypass for**: deixar vazio (deployments sempre precisam de check verde).

### Step 6 — Deploy

**Automático** (push para `main`):

```bash
git push origin main
```

Vercel monitor `main` e dispara build → deploy em ~3min.

**Manual via CLI**:

```bash
npm i -g vercel
vercel login
vercel --prod                # production
vercel                       # preview
```

**Manual via Dashboard**:

Project → Deployments → "Create Deployment" → selecione branch + commit SHA.

---

## 🔍 Post-deploy verification

> **Janela de monitoramento**: 15min após deploy. Se algum check falhar, considerar rollback.

### 1. **Health endpoint**

```bash
curl -i https://cabaladoscaminhos.com.br/api/health
```

- **Esperado**: HTTP 200 + `status: "ok"`
- **503**: algum check crítico caiu (DB ou OpenAI). Investigar antes de rollback.

### 2. **Critical user flows** (E2E in prod)

```bash
BASE_URL=https://cabaladoscaminhos.com.br npx playwright test e2e/smoke.spec.ts
```

- **Esperado**: 16 specs (Wave 26) passam — cobre login, feed, post creation, etc.
- **Run em CI** pós-deploy: configurar job que dispara após `vercel deploy` succeeded.

### 3. **Sentry error rate baseline**

- Abrir [sentry.io/organizations/akasha/issues](https://sentry.io) → filtrar por release atual (`NEXT_PUBLIC_APP_VERSION`).
- **Baseline esperado**: < 0.1% error rate (1 erro / 1000 requests).
- **Se > 1%**: investigar issues novos — provavelmente regressão.

### 4. **PostHog event ingestion**

- PostHog → Activity → filtrar por "Last 5 minutes"
- **Esperado**: pageview events chegando em ~real-time (latência < 30s).
- **Se vazio**: PostHog SDK não inicializou — verificar `NEXT_PUBLIC_POSTHOG_KEY` + console do browser.

---

## ↩️ Rollback

> Ordem de preferência: **(a) revert commit → (b) instant rollback Vercel → (c) promote previous deployment**.

### (a) Revert + redeploy (preferido)

```bash
git revert <bad-commit-sha>
git push origin main
# Vercel dispara build do revert automaticamente
```

- **Quando usar**: bug confirmado, fix é simples.
- **Downtime**: ~3min (tempo de build).

### (b) Instant rollback via Vercel Dashboard

1. Project → Deployments
2. Encontrar último deployment estável (status "Ready")
3. ⋯ menu → "Promote to Production"

- **Quando usar**: precisa reverter AGORA, fix não está pronto.
- **Downtime**: ~30s (Vercel só aponta DNS).

### (c) Vercel CLI rollback

```bash
vercel rollback --yes
```

- **Quando usar**: idem (b), mas via terminal.
- **Downtime**: ~30s.

---

## 🛠 Troubleshooting (8 cenários comuns)

| # | Sintoma | Causa provável | Fix |
|---|---------|----------------|-----|
| 1 | Build falha com "Cannot find module '@/lib/...'" | Path alias quebrado ou arquivo deletado | `grep -r "@/lib/<missing>" src/`, recriar arquivo |
| 2 | Build OOM em `next build` | Bundle muito grande, prisma + pg + openai juntos | `NODE_OPTIONS=--max-old-space-size=4096` (já em `vercel.json`); checar bundle com `pnpm check:bundle` |
| 3 | Health endpoint retorna 503 com `database: ok=false` | DATABASE_URL errado ou DB down | Verificar connection string; testar com `psql $DATABASE_URL -c 'SELECT 1'` |
| 4 | Health retorna 503 com `openai: ok=false` | OPENAI_API_KEY inválida ou quota excedida | Regenerar key em platform.openai.com; verificar usage |
| 5 | Cron jobs não disparam | `CRON_SECRET` faltando ou path do cron errado | Verificar `vercel.json#crons`; checar logs em Vercel → Project → Logs |
| 6 | Push notifications não chegam | VAPID keys mal geradas ou subject inválido | Regenerar com `npx web-push generate-vapid-keys`; subject deve ser `mailto:admin@<domain>` |
| 7 | Erros CORS em produção | `ALLOWED_ORIGINS` não inclui domínio real | Adicionar `https://cabaladoscaminhos.com.br` à lista |
| 8 | Source maps não carregam no Sentry | `SENTRY_AUTH_TOKEN` faltando ou org/project errado | Setar token no Vercel; verificar `SENTRY_ORG=akasha SENTRY_PROJECT=cabala-dos-caminhos` |

---

## 📊 Métricas de release (pós-deploy)

Preencha este bloco no PR / canal #releases após cada deploy em prod:

```markdown
## Release YYYY-MM-DD — <commit-sha>

- **Wave**: W27+
- **Author**: @<github-handle>
- **Duration**: <X>min build + <Y>min smoke
- **Health check**: ✅ 200 OK
- **Sentry error rate**: <baseline>%
- **PostHog events**: <baseline>/min
- **Rollback**: <nenhuma | executada, motivo>
- **Notas**: <qualquer anomalia>
```

---

## 📚 Documentação relacionada

- [DEPLOY-RUNBOOK-W27.md](./DEPLOY-RUNBOOK-W27.md) — Este arquivo (Wave 27+)
- [DEPLOY-WAVE11.md](./DEPLOY-WAVE11.md) — Runbook Wave 11 (histórico)
- [SECRETS-CHECKLIST-W27.md](./SECRETS-CHECKLIST-W27.md) — Onboarding + rotação de secrets
- [CI-CD-GUIDE.md](./CI-CD-GUIDE.md) — Pipeline CI/CD
- [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) — Threat model
- [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) — Setup Supabase

---

## 🤝 Review checklist (para o reviewer do PR)

- [ ] `src/lib/env.ts` valida todas vars consumidas pelo código (grep `process.env` e cruzar)
- [ ] `.env.example` está sincronizado com schema (rodar `bash scripts/verify-env.sh --dry-run` e ver lista de required)
- [ ] `scripts/verify-env.sh` testa conectividade real (DB ping, OpenAI models list)
- [ ] Rollback tem ordem de preferência clara (revert > Vercel dashboard > CLI)
- [ ] Troubleshooting cobre os 8 cenários mais comuns do histórico do projeto
- [ ] Sem secrets commitados (rodar `gitleaks detect --no-git` localmente)

---

> **TL;DR**: 5 novos arquivos, validação fail-fast em prod, 10-item checklist defensivo, 3 caminhos de rollback. Runbook pronto pra produção.