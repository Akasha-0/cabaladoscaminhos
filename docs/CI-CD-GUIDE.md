# CI/CD Guide — Akasha Portal

> Como funciona o pipeline, como adicionar secrets, configurar Vercel, e debugar falhas.

---

## 📋 Visão geral

```
PR aberto → CI roda (lint + type + test + build)
          → Preview deploy (Vercel)
          → Code review
          → CI passa + aprovações → Merge
          → Deploy produção (auto via Vercel integration)

Dependabot abre PR → CI roda → Auto-merge (patch/minor) se label `auto-merge`
```

**Workflows ativos:**

| Arquivo | Trigger | Função |
|---------|---------|--------|
| `.github/workflows/ci.yml` | push em main/develop/feat/fix, qualquer PR | Lint, type check, tests (Node 20+22), build, summary |
| `.github/workflows/preview-deploy.yml` | PR aberto/sincronizado/fechado | Vercel preview + comentário com URL + cleanup |
| `.github/workflows/auto-merge.yml` | PR do Dependabot com label `auto-merge` | Ativa squash auto-merge se CI passar |
| `.github/workflows/ADR-LINT.yml` | push em docs/adr/** | Valida estrutura dos ADRs |
| `.github/workflows/quality-evals.yml` | push em src/** | Roda quality-eval (Akasha IA) |
| `.github/workflows/security.yml` | push em main, schedule semanal | Snyk / CodeQL |

---

## 🔐 Secrets necessários

### Onde adicionar

GitHub → Settings → Secrets and variables → Actions → **New repository secret**

### Lista completa

| Secret | Onde usar | Como obter |
|--------|-----------|------------|
| `VERCEL_TOKEN` | `preview-deploy.yml` | Vercel → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | `preview-deploy.yml` | Vercel → Settings → General → Team ID |
| `VERCEL_PROJECT_ID` | `preview-deploy.yml` | Vercel → Project → Settings → General → Project ID |
| `CODECOV_TOKEN` | `ci.yml` (upload coverage) | codecov.io → repo settings |
| `SNYK_TOKEN` | `security.yml` (se usar) | snyk.io → account settings |

### Environment-specific secrets (Vercel)

Secrets de runtime (Supabase URL, OpenAI key, Stripe secret) **não ficam no GitHub**. Configure direto em:
- **Vercel → Project → Settings → Environment Variables**

Cada env (Production, Preview, Development) tem o próprio set. Mínimo necessário:

```bash
# Production
DATABASE_URL=postgres://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://akasha.com.br

# Preview (mesmo projeto, mas com DB de staging)
DATABASE_URL=postgres://staging-...
# ... etc, com keys de TESTE
```

---

## 🚀 Vercel — Setup inicial

### 1. Conectar repo

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Selecione `Akasha-0/cabaladoscaminhos`
3. Framework preset: **Next.js** (autodetectado)
4. Build command: deixe vazio (lê do `vercel.json`)
5. Install command: deixe vazio (lê do `vercel.json`)
6. Output directory: deixe vazio (Next.js padrão)

### 2. Configurar environments

Vercel → Project → Settings → Environments:

| Environment | Branch | Auto-deploy |
|-------------|--------|-------------|
| Production | `main` | ✅ |
| Preview | todos os outros | ✅ |
| Development | — | ❌ (local) |

### 3. Validar primeiro deploy

```bash
git checkout main
git pull
vercel pull --yes --environment=production --token=$VERCEL_TOKEN
vercel build --yes --token=$VERCEL_TOKEN
vercel deploy --prebuilt --token=$VERCEL_TOKEN --prod
```

Se isso funcionar, a integração GitHub está OK.

---

## 🤖 Dependabot + Auto-merge

### Como funciona

1. **Dependabot** abre PR semanal (segunda 09:00 BRT) com updates agrupados
2. **`dependabot.yml` aplica label `auto-merge`** em PRs patch/minor
3. **`auto-merge.yml` valida** que é Dependabot + tem label + CI passa
4. **GitHub auto-merge** faz squash merge

### Quando o auto-merge NÃO dispara

| Situação | Comportamento |
|----------|---------------|
| Major version bump | Comentário explica, requer revisão humana |
| Draft PR | Aguarda marcar como Ready |
| CI falhou | Auto-merge fica suspenso até CI passar |
| PR sem label `auto-merge` | Não auto-merge (workflow ignora) |

### Desabilitar auto-merge temporariamente

```bash
# Remove o label do PR específico
gh pr edit <PR_NUMBER> --remove-label auto-merge
```

Ou globalmente: desabilite o workflow em `.github/workflows/auto-merge.yml` via Actions tab → workflow → Disable.

---

## 🛠️ Como rodar CI localmente

Antes de abrir PR, valide localmente:

```bash
# 1. Type check
pnpm tsc --noEmit --skipLibCheck

# 2. Lint
pnpm lint

# 3. Tests
pnpm vitest run

# 4. Build (simula Vercel)
pnpm build

# OU tudo de uma vez (já temos script)
pnpm ci:local
```

---

## 🔍 Debugar falhas de CI

### "pnpm install" falhou

- **Lockfile drift**: rode `pnpm install` localmente e commite `pnpm-lock.yaml`
- **Versão Node errada**: CI usa Node 22, seu local deve bater (`node -v`)
- **Cache corrompido**: force refresh em Actions → workflow run → "Re-run jobs" (marca "Re-run failed jobs" + "clean caches")

### TypeScript error no CI mas não local

- Cache do `tsc` (`.tsbuildinfo`) — apaga `find . -name '*.tsbuildinfo' -delete`
- Versão de `@types/*` diferente — `pnpm install` na pasta raiz

### Tests passam local mas falham em CI

- **Timing**: testes com `setTimeout` ficam flaky em runners mais lentos — aumente timeout ou mock tempo
- **Environment variables**: faltou secret no CI; copie `.env.test` pra ter os mesmos defaults
- **Porta ocupada**: testes E2E às vezes tentam subir servers — garanta que não há `next dev` rodando

### Build Next.js falha em CI

- **OOM (Out of Memory)**: workflow já seta `NODE_OPTIONS=--max-old-space-size=4096`; se persistir, remova `--experimental-build-mode=compile` no package.json
- **Prisma client não gerou**: CI roda `pnpm db:generate` antes do build — se mudar schema sem commitar, vai falhar
- **Env var faltando no build**: secrets de runtime DEVEM estar no Vercel, não no GitHub. Build falha se referência `process.env.X` sem fallback

### Preview deploy não comentou no PR

1. Verifique se `VERCEL_TOKEN` está correto (Settings → Secrets)
2. Verifique se a action `marocchino/sticky-pull-request-comment@v2` tem permissão `pull-requests: write` (workflow já tem)
3. Verifique logs: Actions → workflow run → step "Comment PR with preview URL"

### Auto-merge não funcionou

- PR é **major**? Major NUNCA auto-merge (deliberado)
- PR é **draft**? Marque como Ready
- CI está **vermelho**? Espere CI passar
- Label `auto-merge` está aplicada? `gh pr view <PR> --json labels`

---

## 🚨 Quando o build de produção QUEBRA

1. **Não entre em pânico** — main protegida por branch protection
2. Faça revert do commit problemático:
   ```bash
   git revert <SHA>
   git push origin main
   ```
3. Vercel faz rollback automático pro último deploy funcional se build falhar (mas não se build passa e runtime quebra)

### Rollback manual no Vercel

Vercel → Project → Deployments → escolha o último deploy funcional → ⋯ → **Promote to Production**

---

## 📊 Métricas pra monitorar

| Métrica | Onde olhar | Esperado |
|---------|------------|----------|
| Build time | Actions → workflow run | < 5min |
| Test coverage | codecov.io badge no README | > 70% |
| Lighthouse score | Vercel Speed Insights | > 90 mobile |
| Deploy frequency | Insights → Deployments | 5-10/dia (commits em main) |
| Lead time PR → merge | Insights → Activity | < 24h |

---

## 🆘 Contatos de emergência

- **Vercel caiu**: status.vercel.com — Vercel geralmente recupera em <30min
- **GitHub Actions down**: status.github.com — Actions costuma ter degradação mas não outage total
- **Dependabot não abriu PR**: verifique `.github/dependabot.yml` syntax em github.com/dependabot
- **Codecov falhou**: cobertura é warning, não bloqueia merge

---

## 🔗 Referências

- [Vercel Docs — Next.js](https://vercel.com/docs/frameworks/nextjs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
- [pnpm action-setup](https://github.com/pnpm/action-setup)
- [Codecov Action v4](https://github.com/codecov/codecov-action)
- ADR-0002 (Supabase) — explica env vars de runtime
- ADR-0001 (Next.js 16) — explica build mode experimental