# Wave 27 — Secrets Checklist

> **Data**: 2026-06-28
> **Branch**: main @ 252d81c8
> **Autor**: Coder + Caio (Wave 27 — DEPLOY 4/6)
> **Propósito**: Guia operacional para **gerar, armazenar, rotacionar e revogar** todos os secrets consumidos pelo Cabala dos Caminhos.
> **Audiência**: DevOps, devs novos, auditores de segurança.

---

## 🔐 TL;DR — A regra de ouro

> **Nenhum secret fica no repo.**
>
> - Dev local → `.env.local` (gitignored)
> - CI → GitHub Actions Secrets (escopo: repo ou environment)
> - Vercel → Project Settings → Environment Variables (escopo: Production/Preview/Dev)
> - Backup off-site → 1Password / Bitwarden / cofre do time (criptografado)

**Antes de qualquer deploy**:
```bash
bash scripts/verify-env.sh   # confirma que tudo está setado e reachable
```

---

## 📦 Inventário de secrets (12 categorias)

> Total de secrets consumidos pelo código: **~45 vars** (ver `.env.example`).
> Categorizados em 12 grupos. Para cada um, listo: fornecedor, rotação, armazenamento.

### 1. Database — Supabase PostgreSQL

| Item | Valor |
|------|-------|
| **Var** | `DATABASE_URL` |
| **Fornecedor** | Supabase (Postgres + pgvector) |
| **Onde gerar** | Supabase Dashboard → Project → Settings → Database → Connection string |
| **Formato produção** | `postgresql://postgres.<project-ref>:<password>@aws-0-sa-east-1.pooler.supabase.com:6543/postgres` |
| **Formato dev** | `postgresql://postgres:password@localhost:5432/akasha` |
| **Rotação** | A cada 90 dias (manual) — Supabase → Database → Reset password |
| **Vault** | 1Password (categoria "Production / Supabase") |
| **Risco se vazar** | 🔴 CRÍTICO — leitura/escrita completa no DB |

### 2. Supabase — Auth & Storage

| Item | Valor |
|------|-------|
| **Var (anon)** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Var (server)** | `SUPABASE_SERVICE_ROLE_KEY` |
| **Fornecedor** | Supabase |
| **Onde gerar** | Project → Settings → API |
| **anon key** | Safe to expose (RLS é a defesa real) |
| **service_role key** | 🚨 NUNCA expor no client — bypassa RLS |
| **Rotação** | anon: nunca (rotacionar = quebrar todos clients); service_role: 180 dias |
| **Vault** | anon: 1Password (categoria "Public"); service_role: 1Password (categoria "Production") |
| **Risco se vazar** | anon: 🟢 baixo; service_role: 🔴 CRÍTICO |

### 3. Cache / Rate-limit — Redis

| Item | Valor |
|------|-------|
| **Var** | `REDIS_URL` |
| **Fornecedor** | Upstash Redis ou Vercel KV |
| **Onde gerar** | Upstash Console → Redis → Connect → REST + Redis URL |
| **Rotação** | A cada 90 dias (password rotation) |
| **Vault** | 1Password |
| **Risco se vazar** | 🟡 MÉDIO — bypass de rate-limit, cache poisoning |

### 4. AI providers — OpenAI

| Item | Valor |
|------|-------|
| **Var** | `OPENAI_API_KEY` |
| **Fornecedor** | OpenAI |
| **Onde gerar** | platform.openai.com → API keys → Create new secret key |
| **Rotação** | A cada 60 dias; revogar imediatamente se expor acidentalmente |
| **Vault** | 1Password (categoria "AI Providers") |
| **Risco se vazar** | 🟡 MÉDIO — custo (cuidado com quota) + uso indevido |

### 5. AI providers — MiniMax (Anthropic-compatible)

| Item | Valor |
|------|-------|
| **Var** | `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL` |
| **Fornecedor** | MiniMax |
| **Onde gerar** | MiniMax Dashboard → API Keys |
| **Rotação** | A cada 90 dias |
| **Vault** | 1Password |
| **Risco se vazar** | 🟡 MÉDIO |

### 6. Web Push — VAPID

| Item | Valor |
|------|-------|
| **Var** | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (public — safe), `VAPID_PRIVATE_KEY` |
| **Onde gerar** | `npx web-push generate-vapid-keys` |
| **Rotação** | Anual — push subscriptions antigas param de funcionar; comunicar usuários |
| **Vault** | private: 1Password; public: pode commitar (já é público por design) |
| **Risco se vazar (private)** | 🟡 MÉDIO — alguém pode mandar push spoofing |

### 7. Cron auth

| Item | Valor |
|------|-------|
| **Var** | `CRON_SECRET` |
| **Onde gerar** | `openssl rand -hex 32` |
| **Rotação** | Semestral; também rotacionar se rodar `vercel env ls` em log público |
| **Vault** | 1Password |
| **Risco se vazar** | 🟡 MÉDIO — bypass de auth em crons internos |

### 8. Email — Resend

| Item | Valor |
|------|-------|
| **Var** | `RESEND_API_KEY` |
| **Fornecedor** | Resend |
| **Onde gerar** | resend.com → API Keys → Create |
| **Rotação** | A cada 90 dias |
| **Vault** | 1Password |
| **Risco se vazar** | 🟡 MÉDIO — envio de email em nome do domínio |

### 9. Observabilidade — Sentry

| Item | Valor |
|------|-------|
| **Var** | `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| **Fornecedor** | Sentry.io |
| **Onde gerar** | sentry.io → Settings → Auth Tokens (scope: `project:releases`) |
| **Rotação** | auth_token: 90 dias |
| **Vault** | 1Password |
| **Risco se vazar (auth_token)** | 🟡 MÉDIO — alguém pode publicar release falsa |

### 10. Observabilidade — PostHog

| Item | Valor |
|------|-------|
| **Var** | `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_PROJECT_API_KEY` |
| **Fornecedor** | PostHog |
| **Onde gerar** | PostHog → Project → Settings → API Keys |
| **Rotação** | Anual (project key não é super-sensível — só ingesta de eventos) |
| **Vault** | 1Password |
| **Risco se vazar** | 🟢 baixo — só envia eventos anônimos |

### 11. Admin / Newsletter

| Item | Valor |
|------|-------|
| **Var** | `ADMIN_EMAILS`, `ADMIN_NEWSLETTER_SECRET` |
| **Onde gerar** | `ADMIN_NEWSLETTER_SECRET`: `openssl rand -hex 32` |
| **Rotação** | secret: anual; emails: conforme necessário |
| **Vault** | 1Password |
| **Risco se vazar (secret)** | 🟡 MÉDIO — alguém pode disparar newsletter |

### 12. Audit / LGPD

| Item | Valor |
|------|-------|
| **Var** | `AUDIT_IP_SALT` |
| **Onde gerar** | `openssl rand -hex 16` |
| **Rotação** | 🚨 NUNCA rotacionar — quebra o hashing de IPs antigos (não dá pra re-hashear). |
| **Vault** | 1Password (backup off-site crítico) |
| **Risco se vazar** | 🟢 baixo (mesmo com salt, IPs hasheados não são diretamente úteis) |

---

## 🔄 Política de rotação

| Categoria | Frequência | Automatizado? | Comando/Procedimento |
|-----------|------------|---------------|----------------------|
| **Database** | 90 dias | ❌ manual | Supabase Dashboard → Reset password |
| **Supabase service_role** | 180 dias | ❌ manual | Supabase → API → Regenerate service_role key |
| **Redis** | 90 dias | ❌ manual | Upstash → Rotate password |
| **OpenAI** | 60 dias | ❌ manual | platform.openai.com → Revoke + Create new |
| **MiniMax** | 90 dias | ❌ manual | MiniMax Dashboard → Rotate |
| **VAPID private** | Anual | ❌ manual | `npx web-push generate-vapid-keys` |
| **CRON_SECRET** | 180 dias | ❌ manual | `openssl rand -hex 32` + atualizar Vercel |
| **Resend** | 90 dias | ❌ manual | Resend → API Keys → Create new |
| **Sentry auth_token** | 90 dias | ❌ manual | Sentry → Auth Tokens → Regenerate |
| **PostHog** | Anual | ❌ manual | PostHog → API Keys → Rotate |
| **ADMIN_NEWSLETTER_SECRET** | Anual | ❌ manual | `openssl rand -hex 32` |
| **AUDIT_IP_SALT** | 🚨 NUNCA | n/a | semente única do projeto |

> **Próxima evolução (W28+):** automatizar rotação via GitHub Actions + 1Password CLI. Por enquanto, manual.

---

## 🆘 Resposta a comprometimento

### Passo 1 — Conter (minutos)

1. **Revogar** o secret imediatamente na plataforma de origem.
   - Ex: `platform.openai.com → API Keys → Revoke`
2. **Rotar** todas as chaves que compartilham escopo.
   - Ex: se `OPENAI_API_KEY` vazou, todas as 3 chaves de produção + preview + dev.
3. **Gerar nova chave** com nome descritivo (ex: `prod-2026-06-28-rotated`).

### Passo 2 — Investigar (horas)

1. **Logs**: revisar Sentry/PostHog/CloudWatch para atividade anômala no período.
2. **Database**: `SELECT * FROM audit_log WHERE created_at > '<compromise_time>'` — checar writes suspeitos.
3. **Custos**: se for API key (OpenAI, Resend), checar usage dashboard para confirmar uso indevido.

### Passo 3 — Atualizar (horas)

1. Atualizar `.env.local` localmente (se aplicável).
2. Atualizar **Vercel → Production / Preview / Development** (cada um separado).
3. Atualizar **GitHub Actions Secrets** (se usado em CI).
4. Atualizar **1Password** (registrar nova chave, marcar antiga como "revoked YYYY-MM-DD").

### Passo 4 — Comunicar

1. **Interno**: avisar time via canal #security-incident.
2. **Externo**: se houve vazamento de dados de usuário (DB, service_role key):
   - Notificar usuários em até 72h (LGPD Art. 48).
   - Reportar à ANPD se "risco relevante".
3. **Post-mortem**: agendar reunião em até 7 dias. Documentar timeline + root cause + action items.

### Passo 5 — Prevenir recorrência

| Vetor | Mitigação |
|-------|-----------|
| Secret em commit | `gitleaks` pre-commit hook + GitHub secret scanning |
| Secret em logs | Sanitização em `src/lib/logging.ts` (regex para sk-*, re_*, etc) |
| Secret em URL | NUNCA passar em query string; sempre header |
| Secret em screenshot | Redaction no Playwright; revisão de PRs |
| Secret em Slack | Não compartilhar plaintext; usar 1Password share link |

---

## 👶 Onboarding — dev novo

### Dia 1

1. **Acesso ao vault** — pedir ao lead para adicionar ao 1Password (categoria "Production").
2. **Conta Vercel** — adicionar como Member do projeto Cabala dos Caminhos.
3. **Conta Supabase** — adicionar ao projeto (role: Developer, NÃO Owner).
4. **Conta Sentry** — adicionar à organização (role: Member).
5. **Conta PostHog** — adicionar ao projeto (role: Viewer — não precisa de mais).

### Dia 1 — Setup local

```bash
# 1. Clonar repo
git clone git@github.com:Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos

# 2. Instalar deps
pnpm install --frozen-lockfile

# 3. Copiar env template
cp .env.example .env.local

# 4. Preencher .env.local com valores do 1Password
# (cada dev pega seu próprio subset de vars, NÃO tudo)

# 5. Rodar verifier
bash scripts/verify-env.sh

# 6. Subir dev server
pnpm dev
```

### Dia 1 — Verificação

```bash
# Tudo OK se output for:
#   ✅ PASS — todos os checks verdes

# Se algum check falhar, pedir ajuda ao lead — NÃO compartilhar seu próprio secret
# com outro dev (cada um pega direto do 1Password).
```

---

## 🔍 Auditoria / checklist periódico

### Mensal

- [ ] Revisar logs do GitHub Actions para commits com possível secret leak
- [ ] Checar Vercel → Logs para `process.env` em exception traces
- [ ] Revisar Sentry → Issues com stack trace mencionando env var

### Trimestral

- [ ] Rotar secrets no ciclo de rotação (ver tabela acima)
- [ ] Auditar acessos no 1Password (quem tem acesso a "Production")
- [ ] Revisar lista de ADMIN_EMAILS — remover ex-membros
- [ ] Verificar que `.env.local` não está em nenhum commit (`git log --all --full-history -- .env.local`)

### Anual

- [ ] Auditoria externa (security firm ou consultor)
- [ ] Penetration test
- [ ] Revisão da política de rotação (frequência ainda apropriada?)

---

## 🚨 Contatos em caso de incidente

| Função | Canal | SLA |
|--------|-------|-----|
| **Lead técnico** | @<lead-github> (Slack/Discord) | Resposta em 30min |
| **DevOps on-call** | PagerDuty rotation | Resposta em 15min |
| **Founder / decisão** | @<founder-github> | Resposta em 1h |
| **LGPD / jurídico** | <email-dpo> | Resposta em 24h |
| **Suporte plataforma** | Vercel / Supabase / OpenAI status pages | Status apenas |

---

## 📚 Documentação relacionada

- [DEPLOY-RUNBOOK-W27.md](./DEPLOY-RUNBOOK-W27.md) — Deploy procedure
- [.env.example](../.env.example) — Template de env vars (referência única)
- [src/lib/env.ts](../src/lib/env.ts) — Validador Zod (Wave 27)
- [scripts/verify-env.sh](../scripts/verify-env.sh) — Verificador runtime (Wave 27)
- [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) — Threat model
- [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) — Setup Supabase

---

## 🤝 Review checklist (para o reviewer do PR)

- [ ] Nenhum secret em plaintext (rodar `gitleaks detect --no-git` localmente)
- [ ] `.env.example` reflete schema do `src/lib/env.ts` (sincronizado)
- [ ] Onboarding cobre os 12 grupos de secrets sem expor valores reais
- [ ] Política de rotação está clara (frequência + comando)
- [ ] Runbook de comprometimento tem 5 passos concretos (contain, investigate, update, communicate, prevent)
- [ ] Contatos de incidente estão atualizados (verificar canais antes de mergear)

---

> **TL;DR**: 12 categorias de secrets, rotação trimestral, fail-fast em prod. Comprometimento tem playbook de 5 passos. Onboarding tem checklist de 1 dia.