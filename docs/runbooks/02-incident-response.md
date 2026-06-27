# Runbook 02 — Incident Response

> **Quando usar:** Algo quebrou em produção (5xx > 1%, latência p95 > 5s,
> feature crítica parada, ou falha de segurança confirmada).
>
> **Princípio:** contenção primeiro, diagnóstico depois, postmortem por último.

---

## Severidades

| Sev | Impacto | SLA resposta | SLA mitigado |
|-----|---------|--------------|--------------|
| **SEV-1** | Site down, login quebrado, vazamento de dados | 5 min | 1 hora |
| **SEV-2** | Feature crítica parcial (ex: Akasha IA offline mas feed funciona) | 15 min | 4 horas |
| **SEV-3** | Bug visual, latência alta em rota secundária | 1 hora | 1 dia útil |

---

## Playbook SEV-1 (5 min)

### 0. Pare e avalie

- **Não entre em pânico.** Abra `#incidents` (Slack) → declare: "🚨 SEV-1: <descrição curta>".
- **Identifique o sintoma exato:** 5xx? Loop infinito? Erro de DB? Vazamento?
- **Colete evidências:** `X-Request-Id` do log, screenshot, link do Sentry.

### 1. Contenha (≤ 5 min)

**Opção A — Rollback rápido:**

```bash
# Via Vercel CLI (mais rápido)
vercel rollback https://akasha.com.br

# Ou dashboard: Promote deployment anterior
```

**Opção B — Feature flag off:**

Se o problema é feature nova, desligue via env var:

```bash
# Vercel → Settings → Environment Variables
# Adicionar/alterar FEATURE_X_ENABLED=false → redeploy automático
```

**Opção C — Circuit breaker:**

Akasha IA tem circuit breaker embutido (`src/lib/ai/openai.ts`). Se OpenAI está
instável, o breaker abre sozinho e retorna 503 com mensagem clara. Verifique
em `#status-openai` (ou status.openai.com) antes de intervir.

### 2. Comunique

Post em `#incidents` a cada 15 min com:

```
[SEV-1] <HH:MM UTC> Status: <investigando|contido|mitigado|resolvido>
Ação: <rollback / feature flag / etc>
ETA: <quando esperamos restaurar>
Próximo update: <HH:MM>
```

### 3. Mitigue (≤ 1 hora)

- Restaurar serviço a estado funcional
- Confirmar com smoke test (`pnpm e2e:smoke`)
- Postar "✅ Mitigado em <HH:MM>" no Slack

### 4. Postmortem (≤ 48 horas)

Crie `docs/INCIDENTS/YYYY-MM-DD-<slug>.md` com:

- Timeline (UTC) — o que aconteceu, quando, o que foi feito
- Root cause (5 whys)
- Action items (com dono + prazo)
- O que aprendemos / o que mudar

---

## Cenários comuns

### 🔴 5xx em massa no `/api/posts`

**Sintomas:** Sentry lotado de `PrismaClientKnownRequestError`, PostHog mostra 500+
**Causa provável:** Conexão DB esgotada (Supabase pool limit)
**Ações:**

```bash
# 1. Verificar pool stats (Supabase dashboard → Database → Connection pooler)
# 2. Se pool no limite: reiniciar serverless functions (Vercel → redeploy)
# 3. Se persistir: ver runbook 03 (scaling)
```

### 🔴 Akasha IA retorna 503 (circuit breaker aberto)

**Sintomas:** Todas as chamadas `/api/akashic/chat` retornam 503
**Causa provável:** OpenAI com outage ou chave revogada
**Ações:**

1. Checar [status.openai.com](https://status.openai.com)
2. Se OpenAI OK: testar chave direto:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```
3. Se chave revogada: rotacionar via [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → atualizar Vercel env var
4. Forçar reset do circuit breaker (próximo deploy ou restart)

### 🔴 Login quebrado (401 em todas tentativas)

**Sintomas:** `/api/auth/login` retorna 500 ou "Invalid login credentials" para todos
**Causas prováveis:**
- SUPABASE_SERVICE_ROLE_KEY rotacionada sem atualizar Vercel
- Supabase project pausado (free tier inativo)
- DNS do Supabase não resolveu (raro)

**Ações:**

```bash
# Verificar Supabase
curl https://<project-ref>.supabase.co/auth/v1/health

# Verificar env vars na Vercel (production)
vercel env ls production

# Se necessário, rotacionar chave Supabase + redeploy
```

### 🔴 Latência p95 > 5s no feed

**Sintomas:** PostHog mostra TTFB > 5s em `/api/posts?filter=para-voce`
**Causa provável:** Recommendation engine fazendo query pesada sem índice
**Ações:**

1. Verificar query lenta:
   ```sql
   -- Supabase SQL Editor
   SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
   ```
2. Se índice faltando: criar via migration (ver runbook 04)
3. Se for hot spot: adicionar cache (Redis) — ver runbook 03

### 🔴 Web-push não funciona após deploy

**Sintomas:** Usuários não recebem push; subscriptions existem mas nada dispara
**Causa provável:** `VAPID_PRIVATE_KEY` mudou (rotacionada) mas `NEXT_PUBLIC_VAPID_PUBLIC_KEY` continua a antiga
**Ações:**

```bash
# 1. Verificar par de chaves (devem ser geradas juntas)
openssl ecparam -name prime256v1 -genkey -noout -out vapid_private.pem
openssl ec -in vapid_private.pem -pubout -out vapid_public.pem

# 2. Atualizar ambas na Vercel
vercel env rm VAPID_PRIVATE_KEY production
vercel env add VAPID_PRIVATE_KEY production  # novo valor
vercel env rm NEXT_PUBLIC_VAPID_PUBLIC_KEY production
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production  # novo valor

# 3. Redeploy
```

### 🔴 Vazamento de dados (security incident)

**Sintomas:** Bug reporta exposição de dados privados (email, senha, JWT)
**Ações imediatas (NÃO espere postmortem):**

1. **Confirmar:** reproduzir em ambiente controlado; coletar evidências
2. **Conter:** bloquear rota vulnerável (feature flag off ou rollback)
3. **Notificar:** abrir ticket segurança com prioridade P0 + acionar LGPD (72h para ANPD se envolve dados pessoais brasileiros)
4. **Investigar:** logs, quem acessou o quê, scope do leak
5. **Comunicar usuários afetados** (template em `docs/EMAIL-TEMPLATES.md`)

---

## Ferramentas

| Ferramenta | URL | Uso |
|------------|-----|-----|
| Vercel dashboard | vercel.com/dashboard | Deployments, env vars, logs |
| Supabase dashboard | app.supabase.com | DB queries, auth logs |
| Sentry | sentry.io | Error tracking, performance |
| PostHog | posthog.com | Analytics, funnels, error rates |
| OpenAI status | status.openai.com | Upstream da Akasha IA |
| Upstash console | console.upstash.com | Redis health |
| GitHub Actions | github.com/Akasha-0/cabaladoscaminhos/actions | CI runs |

---

## On-call

- **Primary:** Gabriel (operador) — backup: Mavis team (crons)
- **Escalar:** se SEV-1 sem resposta em 15 min → chamar backup
- **Fora do horário:** SEV-1 = ligar; SEV-2 = Slack + email; SEV-3 = Slack normal

---

## Referências

- [Google SRE Book — Incident Response](https://sre.google/sre-book/managing-incidents/)
- [PagerDuty — Incident Response Templates](https://response.pagerduty.com/)
- `docs/SECURITY-AUDIT.md` — vulnerabilidades conhecidas
- `docs/OPERATIONS.md` — visão geral de ops 24/7
- `docs/TROUBLESHOOTING.md` — erros comuns de dev/build/runtime