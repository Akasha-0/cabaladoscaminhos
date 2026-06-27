# 🚀 Akasha Portal — Operações 24/7 Intensificadas

> **Versão:** 2.0 | **Data:** 2026-06-27
> **Status:** Sistema intensificado em produção

Este documento descreve o **sistema 24/7 intensificado** que mantém o Akasha Portal evoluindo constantemente, com cadência rotativa de ondas de pesquisa + implementação.

---

## TL;DR

- **6 crons diários** rodando em produção (evolução, dev, health, planning, research, testes)
- **5 ondas de planos paralelos** pré-fabricadas (wave-2 → wave-6) rodando em sequência automática
- **Max 4-5 tasks paralelas** por onda, com producers Coder + General
- **Auto-trigger**: cada onda termina → próxima onda dispara automaticamente
- **Cadência alvo**: ~3-5 horas de trabalho efetivo por dia dos agents

---

## 🎯 Princípios do sistema intensificado

1. **Nunca parar** — sempre há 1+ plano rodando + 6 crons agendados
2. **Trabalho paralelo** — 4-5 tasks simultâneas por onda
3. **Auto-disparo** — onda termina → próxima onda começa
4. **Documentação viva** — cadernos de bordo atualizados por cada cron
5. **Human-in-the-loop** — só decisões grandes voltam pro user
6. **Graceful degradation** — se 1 task falha, plano continua
7. **Pequenas vitórias** — 1 feature por task, não grandes refactors

---

## 🕐 Mapa de cadência (24h)

```
HORÁRIO (UTC)        EVENTO                          AGENTE
─────────────────────────────────────────────────────────────────────
00:00 ────────────  Health check                     Mavis (cron)
01:00 ────────────  Wave de produção noturna         Coder + General
03:00 ────────────  (processando)
06:00 ────────────  (processando)
08:00 domingo ────  Planning semanal                 Mavis (cron)
09:00 ────────────  Evolução + priorização           Mavis (cron)
10:00 segunda ────  Research semanal                 Mavis (cron)
12:00 ────────────  Health check                     Mavis (cron)
14:00 ────────────  Implementação contínua           Mavis (cron)
18:00 ────────────  Bateria de testes                Mavis (cron)
20:00 ────────────  Wave de produção noturna         Coder + General
22:00 ────────────  (processando)
23:00 ────────────  Decisão do dia                   Mavis (cron)

+ Ondas paralelas ad-hoc conforme necessidade
```

---

## 🤖 Os 6 crons ativos (intensificados)

### 1. `akasha-dev-implementation` (todo dia 14h)
- **Função:** Implementa features prioritárias + commita
- **Intensidade:** 1-2 features por dia
- **Output:** Commits na branch `feat/community-platform`

### 2. `akasha-evolution-daily` (todo dia 9h)
- **Função:** Identifica gaps, prioriza tarefas baseado em VISION/STRATEGY
- **Output:** `docs/EVOLUTION-LOG.md`

### 3. `akasha-health-check-12h` (cada 12h)
- **Função:** Health check do projeto
- **Output:** `docs/HEALTH-LOG.md`

### 4. `akasha-planning-weekly` (domingo 8h)
- **Função:** Plano da semana, priorização
- **Output:** `docs/WEEKLY-PLAN.md`

### 5. `akasha-research-weekly` (segunda 10h)
- **Função:** Papers, regulamentação, concorrência
- **Output:** `docs/EVIDENCE-MAP.md` + `docs/REGULATORY-ALERTS.md` + `docs/COMPETITOR-WATCH.md`

### 6. `akasha-tests-pre-release` (todo dia 18h)
- **Função:** Bateria de testes + relatório
- **Output:** `docs/TEST-REPORT.md`

---

## 🌊 As 5 ondas pré-fabricadas (sistema intensificado)

Todas em `/workspace/.mavis/plans/draft/wave-*.yaml`. Cada uma roda 4-5 tasks em paralelo.

### Wave 2 — Auth + Onboarding (MVP core) ⏳ ATIVA
- **Track 1:** Supabase auth completa (signup, login, logout, middleware)
- **Track 2:** OnboardingEspiritual 5 passos (nome, data, hora, local, tradições)
- **Track 3:** API Posts real (substituir MOCK_POSTS)
- **Track 4:** Smoke tests E2E (Playwright)

### Wave 3 — Conteúdo + UX (próxima)
- **Track 1:** Biblioteca curada 50+ artigos científicos
- **Track 2:** Search + descoberta (full-text PG + autocomplete)
- **Track 3:** Mobile polish + PWA instalável
- **Track 4:** Notificações reais (in-app + email)
- **Track 5:** Grupos e comunidades (12 grupos por tradição)

### Wave 4 — Akasha IA (core feature)
- **Track 1:** Chat MVP (OpenAI streaming + pgvector RAG + 8 regras éticas)
- **Track 2:** Prompt iteration (versioning + A/B test + eval set)
- **Track 3:** Multi-language (PT-BR + EN + ES)
- **Track 4:** Voice mode (STT + TTS MiniMax)

### Wave 5 — Moderação + Compliance + Segurança
- **Track 1:** Detoxify PT-BR (22 categorias + crisis resources)
- **Track 2:** LGPD compliance (consent, export, delete, audit)
- **Track 3:** Security hardening (rate limit, CSP, headers, sanitização)
- **Track 4:** Backup + disaster recovery

### Wave 6 — Analytics + Growth
- **Track 1:** PostHog analytics (privacy-first + funis + cohorts)
- **Track 2:** SEO + content (blog + 4 landing pages + 10 posts)
- **Track 3:** Referral program (viral loops + anti-fraud)
- **Track 4:** CRO (3 variantes de /validacao + A/B test)

---

## 🔄 Auto-trigger pipeline

```
Wave 2 termina (4-5h)
    ↓
Dispara Wave 3
    ↓
Wave 3 termina (4-5h)
    ↓
Dispara Wave 4
    ↓
Wave 4 termina (4-5h)
    ↓
Dispara Wave 5
    ↓
Wave 5 termina (4-5h)
    ↓
Dispara Wave 6
    ↓
Wave 6 termina (4-5h)
    ↓
Volta pra Wave 2 (com tasks atualizadas baseado no que foi aprendido)
```

**Cadência total: ~25-30 horas de trabalho distribuídas em 5-7 dias reais.**

---

## 🧠 Composição de agents por onda

| Wave | Producers | Por quê |
|---|---|---|
| 2 (Auth + Onboarding + Posts) | 3× Coder + 1× General | Coder é ideal pra implementação; General pra setup |
| 3 (Conteúdo + UX) | 5× General | Pesquisa + implementação de features menores |
| 4 (Akasha IA) | 4× Coder | IA + prompt engineering precisa de profundidade técnica |
| 5 (Moderação + Security) | 4× General + Coder mix | Compliance + código sensível |
| 6 (Analytics + Growth) | 4× General | Marketing + integração de ferramentas |

> **Nota:** Sistema tem agentes Coder e General. Verifique antes de lançar waves que dependem de outros tipos (Tester, Designer, etc) — adapte para os disponíveis.

---

## 📊 Cadernos de bordo (alimentados pelos crons)

| Documento | Alimentado por | Pra quê |
|---|---|---|
| `docs/EVOLUTION-LOG.md` | akasha-evolution-daily | Lista priorizada do que fazer |
| `docs/HEALTH-LOG.md` | akasha-health-check-12h | Histórico de saúde |
| `docs/DEV-LOG.md` | akasha-dev-implementation | Decisões de implementação |
| `docs/TEST-REPORT.md` | akasha-tests-pre-release | Status dos testes |
| `docs/WEEKLY-PLAN.md` | akasha-planning-weekly | Plano semanal |
| `docs/REGULATORY-ALERTS.md` | akasha-research-weekly | Alertas legais |
| `docs/COMPETITOR-WATCH.md` | akasha-research-weekly | Movimento da concorrência |

---

## 🎯 Estado atual (2026-06-27)

### Em produção
- ✅ 6 crons ativos
- ✅ Wave 2 rodando (4 tasks: Auth, Onboarding, Posts API, Smoke Tests)
- ✅ 5 waves pré-fabricadas (wave-2 → wave-6)
- ✅ 5 deliverables de pesquisa do plano anterior
- ✅ Cadernos de bordo inicializados

### Pendências
- ❌ Tool wrapper tem bug em `cron create` (não conseguimos adicionar mais crons)
- ❌ Wave 3 ainda não disparada (aguarda Wave 2 terminar)
- ❌ Algumas features precisam Supabase configurado (env vars)

---

## 🔧 Como adicionar nova onda

1. Crie `/workspace/.mavis/plans/draft/wave-N-nome.yaml`
2. Use `assigned_to: Coder` ou `assigned_to: General` (verifique agentes disponíveis)
3. Cada task deve ter `verify_skip_reason` (para evitar crash do engine)
4. Documente objetivo da onda aqui em OPERATIONS-24-7.md
5. Lance: `team({ command: "run", args: { plan_path: "/workspace/.mavis/plans/draft/wave-N.yaml" } })`

---

## ⚠️ Limitações conhecidas

1. **Tool wrapper bug:** `cron create`, `cron update`, `agent create` não recebem args (sempre undefined)
2. **Sandbox RAM:** 2GB impede `next build` e `vitest run` completos
3. **PRs:** sistema atual não consegue abrir PRs automáticos (precisa de `gh` CLI configurado)
4. **Merge:** NUNCA merge automático — sempre revisão humana

---

> **Última atualização:** 2026-06-27 00:55 UTC
> **Próxima revisão:** Semanal (cron `akasha-planning-weekly`)
