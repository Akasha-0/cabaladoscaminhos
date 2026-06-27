# Cabala dos Caminhos — Índice da Documentação

> **Versão:** 3.0 (Wave 11 — Docs Governance) | **Atualizado:** 2026-06-27
> **Proprietário:** Gabriel (Operador)
> **Status:** Produção · v0.1.0-rc.1

> ⚠️ **Histórico:** Documentação da v1.0 (B2B Cockpit Oracular) está em `docs/archive/` (a partir de wave 11). A versão ativa é **v3.0 (comunidade universalista + Akasha IA curadora)**.
>
> Veja: [VISION.md](../VISION.md) | [ARCHITECTURE.md](../ARCHITECTURE.md) | [README.md](../../README.md)

---

## 🗺️ Índice visual

```
docs/
├─ 00_README.md                   ← VOCÊ ESTÁ AQUI
│
├─ [Núcleo do projeto]            ← O QUE + POR QUÊ
│  ├─ VISION.md                   ← Visão de produto + roadmap macro
│  ├─ ARCHITECTURE.md             ← Stack, módulos, integrações
│  ├─ README.md                   ← Entry point técnico
│  └─ AGENTS.md                   ← Workflow de agentes
│
├─ [Operacional]                 ← COMO + QUANDO
│  ├─ API-REFERENCE.md            ⭐ Todas as 33 rotas documentadas
│  ├─ TROUBLESHOOTING.md          ⭐ Erros comuns + soluções
│  ├─ OPERATIONS.md               ← Cadência 24/7 dos crons
│  ├─ OPERATIONS-24-7.md          ← Versão detalhada
│  └─ runbooks/
│     ├─ 01-deploy.md             ⭐ Deploy step-by-step
│     ├─ 02-incident-response.md  ⭐ Quando algo quebra
│     ├─ 03-scaling.md            ⭐ Quando Supabase/OpenAI estão no limite
│     ├─ 04-database-migration.md ⭐ Como migrar sem quebrar prod
│     └─ 05-backup-restore.md     ⭐ Estratégia de backup
│
├─ [Produto & Especificações]     ← FEATURES + REGRAS
│  ├─ 01_product-brief.md
│  ├─ 02_prd.md
│  ├─ 03_architecture-spec.md
│  ├─ 04_data-model.md
│  ├─ 05_uiux-spec.md
│  ├─ 06_ai-engine-spec.md
│  ├─ 07_epics-stories.md
│  └─ 08_roadmap.md
│
├─ [Desenvolvimento]              ← BUILD + CODE
│  ├─ CI-CD-GUIDE.md              ← Pipeline GitHub Actions + Vercel
│  ├─ SUPABASE-SETUP.md           ← Setup inicial Supabase
│  ├─ PWA-SETUP.md                ← Service worker + manifest
│  ├─ MOBILE-DESIGN-GUIDE.md      ← Padrões mobile-first
│  ├─ DESIGN-SYSTEM.md            ← Componentes + tokens
│  ├─ TESTING-GUIDE.md            ← Estratégia de testes
│  ├─ TEST-SETUP.md               ← Setup Vitest + Playwright
│  ├─ PERFORMANCE-BUDGETS.md      ← Metas LCP/CLS/INP
│  └─ QUALITY-STANDARDS.md        ← Padrões de código
│
├─ [Akasha IA — MVP Wave 10]
│  ├─ AKASHIA-IA-MVP-WAVE10.md    ← Spec completa da Akasha
│  ├─ AI-PROMPT-base.md           ← System prompt base
│  └─ CONTENT-WAVE10.md           ← Corpus RAG inicial
│
├─ [Ondas recentes]
│  ├─ WAVE-10-ORCHESTRATION.md    ← Log de orquestração
│  ├─ E2E-DELIVERABLE-WAVE10.md
│  ├─ E2E-TESTS-WAVE10.md
│  ├─ MOBILE-A11Y-FIXES-WAVE10.md
│  ├─ PERF-FIXES-WAVE10.md
│  └─ SECURITY-FIXES-WAVE10.md
│
├─ [Auditoria & Saúde]
│  ├─ SECURITY-AUDIT.md           ← LGPD + OWASP Top 10
│  ├─ PERFORMANCE-AUDIT.md
│  ├─ UX-AUDIT.md
│  ├─ HONEST-AUDIT-24-7.md
│  ├─ HEALTH-LOG.md
│  ├─ HEALTH-SNAPSHOT.md
│  └─ BUGS.md
│
├─ [Continuidade]
│  ├─ EVOLUTION-LOG.md            ← Revs incrementais da arquitetura
│  ├─ CYCLE-LOG.md
│  ├─ DEV-LOG.md
│  ├─ WEEKLY-PLAN.md
│  ├─ WEEKLY-SUMMARY.md
│  ├─ ROADMAP-Q3-2026.md
│  ├─ MARKET-VALIDATION.md
│  └─ STRATEGY-chain-of-thought.md
│
├─ [Comunidade & Notificações]
│  ├─ API-POSTS.md
│  ├─ AUTH-FLOW.md
│  ├─ DATA-FLOW.md
│  ├─ NOTIFICATIONS-SPEC.md
│  ├─ NOTIFICATIONS-REALTIME.md
│  └─ EMAIL-TEMPLATES.md
│
├─ [Decisões]
│  ├─ adr/                        ← Architecture Decision Records
│  ├─ VALIDATION-CRITERIA.md
│  ├─ MAIN-DIVERGENCE.md          ← Diff entre docs e código
│  ├─ MISSING-CONFIGS.md
│  └─ DEPRECATION-STATUS.md
│
└─ [Auto-trigger / Feedback]
   ├─ AUTO-TRIGGER.md
   ├─ FEEDBACK-LOOP.md
   └─ COMPETITOR-WATCH.md
```

> ⭐ = documentos críticos para produção (Wave 11 — Docs Governance)

---

## 📚 Sumário executivo por documento

### Núcleo do projeto

| Doc | Cobre | Para quem |
|-----|-------|-----------|
| [VISION.md](../VISION.md) | Visão de produto, roadmap macro, valores | Todos |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Stack, módulos, integrações, decisões | Devs + arquitetos |
| [README.md](../../README.md) | Setup local, scripts, primeiros passos | Novos devs |
| [AGENTS.md](../AGENTS.md) | Workflow dos agentes Mavis | AI agents |

### Operacional (produção)

| Doc | Cobre | Quando consultar |
|-----|-------|------------------|
| [API-REFERENCE.md](./API-REFERENCE.md) | **Todas as 33 rotas** + auth + rate limit + erros | Antes de integrar com API |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | **Erros comuns** (build/runtime/deploy) + soluções | Quando algo quebra |
| [runbooks/01-deploy.md](./runbooks/01-deploy.md) | Deploy step-by-step | Antes de cada release |
| [runbooks/02-incident-response.md](./runbooks/02-incident-response.md) | **SEV-1/2/3** playbooks | Quando prod está down |
| [runbooks/03-scaling.md](./runbooks/03-scaling.md) | Estratégia de escala por camada | Quando cresce tráfego |
| [runbooks/04-database-migration.md](./runbooks/04-database-migration.md) | Migrations seguras | Antes de mudar schema |
| [runbooks/05-backup-restore.md](./runbooks/05-backup-restore.md) | Backup/restore strategy | Antes de migration destrutiva |
| [OPERATIONS.md](./OPERATIONS.md) | Cadência dos 6 crons + manutenção 24/7 | Quando quer entender ops |

### Produto & Especificações

| Doc | Cobre | Status |
|-----|-------|--------|
| [01_product-brief.md](./01_product-brief.md) | Brief original (v1) | ⚠️ Histórico (v3 em VISION.md) |
| [02_prd.md](./02_prd.md) | PRD original | ⚠️ Histórico |
| [03_architecture-spec.md](./03_architecture-spec.md) | Spec técnica original | ⚠️ Superseded por ARCHITECTURE.md |
| [04_data-model.md](./04_data-model.md) | Schema Prisma | ✅ Atual (verificar schema.prisma) |
| [05_uiux-spec.md](./05_uiux-spec.md) | UX spec original | ⚠️ Parcial |
| [06_ai-engine-spec.md](./06_ai-engine-spec.md) | AI engine (correlation matrix) | ✅ Núcleo do produto |
| [07_epics-stories.md](./07_epics-stories.md) | Backlog estruturado | ✅ Atual |
| [08_roadmap.md](./08_roadmap.md) | Roadmap por fase | ✅ Atual |

> ⚠️ Documentos marcados "Histórico" se referem à v1.0 (B2B). Use [VISION.md](../VISION.md) e [ARCHITECTURE.md](../ARCHITECTURE.md) para a versão ativa (v3.0).

### Desenvolvimento

| Doc | Cobre | Quando consultar |
|-----|-------|------------------|
| [CI-CD-GUIDE.md](./CI-CD-GUIDE.md) | GitHub Actions + Vercel pipeline | Setup de CI |
| [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) | Setup inicial de projeto Supabase | Primeira vez configurando |
| [PWA-SETUP.md](./PWA-SETUP.md) | Service worker + manifest | Para mobile / offline |
| [MOBILE-DESIGN-GUIDE.md](./MOBILE-DESIGN-GUIDE.md) | Padrões mobile-first | Ao desenvolver UI |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | Tokens + componentes | Ao criar/modificar UI |
| [TESTING-GUIDE.md](./TESTING-GUIDE.md) | Estratégia de testes | Antes de escrever testes |
| [TEST-SETUP.md](./TEST-SETUP.md) | Setup Vitest + Playwright | Primeira vez rodando testes |
| [PERFORMANCE-BUDGETS.md](./PERFORMANCE-BUDGETS.md) | Metas Core Web Vitals | Antes de release |
| [QUALITY-STANDARDS.md](./QUALITY-STANDARDS.md) | Padrões de código | Em code review |

### Akasha IA (MVP Wave 10)

| Doc | Cobre | Status |
|-----|-------|--------|
| [AKASHIA-IA-MVP-WAVE10.md](./AKASHIA-IA-MVP-WAVE10.md) | Spec completa: 8 regras éticas + RAG + chat | ✅ Shipped |
| [AI-PROMPT-base.md](./AI-PROMPT-base.md) | System prompt base | ✅ Ativo |
| [CONTENT-WAVE10.md](./CONTENT-WAVE10.md) | Corpus inicial (8 tradições) | ✅ Indexado em pgvector |

### Auditoria & Saúde

| Doc | Cobre | Quando consultar |
|-----|-------|------------------|
| [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) | LGPD + OWASP + threat model | Antes de PR de auth/dados |
| [PERFORMANCE-AUDIT.md](./PERFORMANCE-AUDIT.md) | Bundle size, queries lentas, LCP | Antes de release |
| [UX-AUDIT.md](./UX-AUDIT.md) | Auditoria de UX/UI | Antes de release |
| [HONEST-AUDIT-24-7.md](./HONEST-AUDIT-24-7.md) | O que está funcionando vs quebrado | Status check |
| [HEALTH-LOG.md](./HEALTH-LOG.md) | Histórico de health checks | Investigar regressões |
| [HEALTH-SNAPSHOT.md](./HEALTH-SNAPSHOT.md) | Última snapshot de saúde | Status atual |
| [BUGS.md](./BUGS.md) | Lista priorizada de bugs | Triagem |

### Continuidade

| Doc | Cobre | Quando consultar |
|-----|-------|------------------|
| [EVOLUTION-LOG.md](./EVOLUTION-LOG.md) | Revs incrementais da arquitetura | Auditoria de mudanças |
| [CYCLE-LOG.md](./CYCLE-LOG.md) | Log de ciclos de desenvolvimento | Auditoria |
| [WEEKLY-PLAN.md](./WEEKLY-PLAN.md) | Plano semanal | Planejamento |
| [WEEKLY-SUMMARY.md](./WEEKLY-SUMMARY.md) | Resumo semanal | Status |
| [ROADMAP-Q3-2026.md](./ROADMAP-Q3-2026.md) | Roadmap Q3 | Planejamento trimestral |
| [MARKET-VALIDATION.md](./MARKET-VALIDATION.md) | Validação de mercado | Estratégia |
| [STRATEGY-chain-of-thought.md](./STRATEGY-chain-of-thought.md) | Raciocínio estratégico | Entender decisões |

---

## 🔍 Como encontrar o que você precisa

### "Como faço deploy?"

→ [runbooks/01-deploy.md](./runbooks/01-deploy.md)

### "Como integro com a API?"

→ [API-REFERENCE.md](./API-REFERENCE.md) → seção do domínio → curl example

### "Algo quebrou em prod!"

→ [runbooks/02-incident-response.md](./runbooks/02-incident-response.md) → classificar severidade → playbook

### "Erro X apareceu, o que fazer?"

→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → buscar pelo erro → causa + solução + runbook

### "Preciso mudar o banco de dados"

→ [runbooks/04-database-migration.md](./runbooks/04-database-migration.md) → escolher cenário similar

### "Como escalar antes do lançamento?"

→ [runbooks/03-scaling.md](./runbooks/03-scaling.md) → checklist de launch

### "Como fazer backup?"

→ [runbooks/05-backup-restore.md](./runbooks/05-backup-restore.md) → seção estratégia

### "Quais são as decisões arquiteturais?"

→ [adr/](./adr/) + [ARCHITECTURE.md](../ARCHITECTURE.md)

### "O que está funcionando?"

→ [HEALTH-SNAPSHOT.md](./HEALTH-SNAPSHOT.md) + [HONEST-AUDIT-24-7.md](./HONEST-AUDIT-24-7.md)

---

## 🛠️ Ferramentas de manutenção

| Script | Propósito | Quando rodar |
|--------|-----------|--------------|
| `scripts/check-docs.sh` | **Procura TODOs + links quebrados + docs desatualizados** | Antes de PR de docs (obrigatório) |
| `scripts/ci-local.sh` | Simula CI completo localmente | Antes de push |
| `scripts/verify-notifications-realtime.ts` | Valida fluxo SSE de notificações | Após mudança em notifications |
| `scripts/check-bundle-size.ts` | Verifica size do bundle | Antes de release |
| `scripts/embed-articles.ts` | Re-indexa artigos no pgvector | Após adicionar conteúdo |

---

## 📋 Manutenção

### Adicionando um novo documento

1. Criar arquivo em `docs/<nome>.md`
2. Adicionar entrada neste índice (`00_README.md`)
3. Rodar `bash scripts/check-docs.sh` (deve passar)
4. PR com label `docs`

### Atualizando documento existente

1. Editar `docs/<nome>.md`
2. Atualizar timestamp no topo do arquivo
3. Adicionar entrada em [EVOLUTION-LOG.md](./EVOLUTION-LOG.md) se mudança for significativa
4. PR com label `docs`

### Deprecando documento

1. Mover para `docs/archive/<wave>-<nome>.md`
2. Marcar como `⚠️ DEPRECATED` no topo
3. Atualizar índice

---

## 📊 Saúde da documentação (Wave 11)

| Métrica | Valor | Status |
|---------|-------|--------|
| Total de docs | 68 (v1) + 7 (wave 11) | 🟢 |
| Docs ⭐ críticos | 7 (API, TROUBLESHOOTING, 5 runbooks) | 🟢 |
| Docs ⚠️ históricos (v1) | 8 (precisam mover para archive/) | 🟡 |
| Docs com TODOs pendentes | verificar via `scripts/check-docs.sh` | 🟡 |
| Última docs governance | 2026-06-27 (Wave 11) | 🟢 |

---

> **Mantido por:** Documentation Steward · Wave 11 (Trilha 9)
> **Próxima revisão:** mensal ou quando ≥ 3 docs novos forem adicionados.