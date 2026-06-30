# Operations Runbook — Akasha Portal

> **Versão:** 1.0 | **Data:** 2026-06-30 | **Wave:** 32 (DOCUMENTATION 6/8)
> **Idioma:** PT-BR
> **Stack:** Vercel (Edge) · Supabase · Stripe · OpenAI · MiniMax · Sentry · PostHog
> **Owner:** DevOps + Coder
> **On-call rotation:** ver PagerDuty (interno)

---

## 1. Visão geral

Este runbook cobre **operação cotidiana** da Akasha Portal em produção. Para **deploy procedure**, veja `docs/DEPLOY-RUNBOOK-W27.md` (Wave 27, atualizado).

### 1.1 SLA & SLO

| Métrica | SLO | Error budget |
|---------|-----|--------------|
| Uptime | 99.5% (mensal) | ~3.6h/mês |
| Latência p95 API | < 800ms | — |
| Latência p95 página | < 2.5s (LCP) | — |
| Erro rate 5xx | < 0.5% | — |
| Akasha chat TTFT | < 2s | — |

---

## 2. Deploy procedure (resumo)

> **Detalhamento:** `docs/DEPLOY-RUNBOOK-W27.md` (Wave 27).

### 2.1 Pre-deploy gate

```bash
pnpm typecheck              # TSC = 0
pnpm lint                   # ESLint = 0
pnpm test                   # All pass
bash scripts/verify-env.sh  # Env vars válidas
bash scripts/pre-deploy-check.sh
```

### 2.2 Deploy

```bash
# 1. Merge PR para main (via GitHub UI após aprovação)
# 2. Vercel auto-deploy canary (10% por 5min)
# 3. Verificar Sentry + PostHog (erros novos? latência subiu?)
# 4. Vercel promotes para 100%
```

### 2.3 Rollback

```bash
# Opção A: Vercel dashboard → Deployments → Promote previous
# Opção B: CLI
vercel rollback
# Opção C: reverter commit
git revert <sha>
git push origin main
```

---

## 3. Monitoring

### 3.1 Sentry (error tracking)

- **URL:** https://sentry.io/akasha-portal
- **Alertas:** email + Slack `#ops-alerts` quando:
  - Erro 5xx > 10/min
  - Nova exception type aparece
  - Performance degradation > 30%

**Como investigar:**
1. Abrir issue no Sentry
2. Verificar `tags.environment` (production / preview / development)
3. Verificar `tags.userId` se afeta múltiplos users
4. Conferir breadcrumbs (sequence de eventos antes do erro)
5. Reproduzir localmente se possível

### 3.2 PostHog (analytics + funnels)

- **URL:** https://posthog.com/akasha
- **Dashboards críticos:**
  - Signup → First Post (funnel)
  - Akasha chat engagement (queries/dia, retention D7)
  - Marketplace GMV (semanal)
  - Erros de validação (quais campos falham mais)
- **Feature flags:** `flags` tab

### 3.3 Vercel (infra)

- **URL:** https://vercel.com/akasha/dashboard
- **Métricas-chave:**
  - Request volume
  - Function execution time
  - Cold starts
  - Bandwidth
  - Build duration

### 3.4 Supabase (DB + Auth)

- **Studio:** https://app.supabase.com/project/akasha
- **Métricas-chave:**
  - DB CPU + memory
  - Connection pool (use Supavisor em prod)
  - Query slow log (>1s)
  - Auth events (failed logins, suspicious activity)

---

## 4. Backup strategy

### 4.1 Database (Supabase)

- **Automático:** daily snapshots (retenção 7 dias)
- **Manual antes de mudanças grandes:**
  ```bash
  npx supabase db dump --file backup-$(date +%Y%m%d).sql
  ```
- **Restore:**
  ```bash
  npx supabase db reset
  psql -h <host> -U postgres -d postgres -f backup-20260630.sql
  ```

### 4.2 Storage (Supabase Storage)

- **Replicação:** cross-region (us-east-1 ↔ us-west-1)
- **Retention:** indefinida para conteúdo público; 30 dias para drafts privados
- **Restore:** download do bucket correspondente via Studio ou CLI

### 4.3 Secrets

- **Vault:** Vercel Environment Variables (criptografado em rest)
- **Rotação:** trimestral (ver `docs/SECRETS-CHECKLIST-W27.md`)
- **Backup:** cópia offline em cofre gerenciado pelo lead

### 4.4 Disaster recovery

| Cenário | RTO | RPO | Procedimento |
|---------|-----|-----|--------------|
| DB corruption | < 4h | < 24h | Restore do último backup + replay de mutations |
| Region outage | < 1h | < 1h | Vercel failover automático |
| Secret leak | < 1h | — | Rotação imediata + invalidação de tokens |
| Account compromise | < 2h | — | Reset senha + revogar sessões + audit log |

---

## 5. Incident response

### 5.1 Severidade

| Sev | Definição | Resposta | Exemplo |
|-----|-----------|----------|---------|
| **P0** | Plataforma down | Imediata, todos | 5xx em massa, DB down |
| **P1** | Feature crítica quebrada | < 1h | Akasha IA off, pagamento falhando |
| **P2** | Feature secundária quebrada | < 4h | Notificações atrasadas, busca lenta |
| **P3** | Bug menor / cosmético | < 24h | Texto errado, alinhamento off |

### 5.2 Procedimento (P0/P1)

1. **Acknowledge** no PagerDuty (ack < 5min)
2. **Avaliar** — abrir canal `#inc-<timestamp>` no Slack
3. **Comunicar** — `#status` post para usuários (template abaixo)
4. **Mitigar** — rollback, feature flag off, etc.
5. **Resolver** — fix definitivo
6. **Post-mortem** — em até 48h, documento em `docs/postmortems/YYYY-MM-DD-incident.md`

### 5.3 Template de comunicação

```
🚧 Investigando: [sintoma breve]
Impacto: [quem é afetado e como]
Status: [investigando / mitigado / resolvido]
Atualização: [a cada 15min até resolver]
```

### 5.4 Escalation path

1. **On-call engineer** (PagerDuty)
2. **Tech lead** (se P0/P1)
3. **CTO** (se P0 > 30min ou impacto financeiro)

---

## 6. Scaling

### 6.1 Quando escalar

| Sinal | Threshold | Ação |
|-------|-----------|------|
| DB CPU | > 70% sustentado | Upgrade Supabase plan + connection pool |
| Edge functions | p95 > 1s | Code review + caching |
| Storage | > 80% quota | Limpar drafts antigos + upgrade |
| Bandwidth | > 80% quota | CDN config + compress images |

### 6.2 Como escalar

**Vertical (rápido):**
- Supabase: `Settings → Infrastructure → Upgrade`
- Vercel: plano Pro → Enterprise

**Horizontal (sustentado):**
- DB read replicas (Supabase Pro+)
- Edge caching (Vercel KV / Redis)
- CDN para assets (já ativo)

### 6.3 Carga esperada (12 meses)

| Métrica | Hoje (beta) | 6 meses | 12 meses |
|---------|-------------|---------|----------|
| MAU | 50 | 5.000 | 50.000 |
| DAU | 20 | 1.500 | 15.000 |
| Posts/dia | 30 | 1.500 | 15.000 |
| Akasha msgs/dia | 100 | 10.000 | 100.000 |
| Storage | 2GB | 100GB | 1TB |

---

## 7. Cron jobs (verificação diária)

> **Auth:** header `Authorization: Bearer ${CRON_SECRET}`

| Cron | Path | Schedule | Verificar |
|------|------|----------|-----------|
| Publish scheduled posts | `/api/cron/publish-scheduled` | `* * * * *` (a cada minuto) | Log de posts publicados |
| Curate articles (IA) | `/api/cron/curate-articles` | `0 */6 * * *` (a cada 6h) | Novos artigos na home |
| Process email queue | `/api/cron/process-email-queue` | `*/5 * * * *` (a cada 5min) | Mailpit em dev; Resend dashboard em prod |
| Consciousness evolve | `/api/cron/consciousness-evolve` | `0 3 * * *` (3h UTC) | Métricas de comunidade |
| Weekly digest | `/api/cron/weekly-digest` | `0 9 * * 1` (segunda 9h UTC) | Newsletter enviada |

**Como verificar logs:**
```bash
# Vercel
vercel logs --filter="path:/api/cron/publish-scheduled"

# Supabase
# Studio → Logs → API
```

---

## 8. Comandos úteis

### 8.1 Investigação rápida

```bash
# Últimas 100 linhas de log de produção
vercel logs --prod --tail=100

# Status de uma function específica
vercel inspect <deployment-url>

# Métricas do DB
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Top 10 queries lentas (Supabase)
# Studio → Database → Query Performance
```

### 8.2 Manutenção

```bash
# Vacuum + analyze (Supabase)
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Limpar drafts > 30 dias
psql $DATABASE_URL -c "DELETE FROM drafts WHERE created_at < NOW() - INTERVAL '30 days';"

# Invalidar cache do Vercel
vercel cache invalidate
```

### 8.3 Reset de feature flag

```bash
# Via PostHog API
curl -X POST https://posthog.com/api/projects/@akasha/feature_flags/akasha_v2/ \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -d '{"active": false}'
```

---

## 9. Contatos

| Função | Contato |
|--------|---------|
| Tech lead | tech-lead@akashaportal.com.br |
| DevOps | devops@akashaportal.com.br |
| Supabase support | support@supabase.com (plan Pro) |
| Vercel support | vercel.com/support (plan Pro) |
| Sentry | support@sentry.io |
| Stripe support | support.stripe.com |

---

## 10. Próximo passo

- **Deploy detalhado:** `docs/DEPLOY-RUNBOOK-W27.md`
- **Dev guide:** `docs/dev/DEVELOPER-GUIDE.md`
- **API reference:** `docs/api/API-REFERENCE-W32.md`
- **Postmortems:** `docs/postmortems/`
- **Runbooks específicos:** `docs/runbooks/`