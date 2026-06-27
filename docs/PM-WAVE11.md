# PM WAVE 11 — Resumo Executivo + Decisões

> **Data:** 2026-06-27 | **Trilha:** 3 (PM) | **Wave:** 11 | **Owner:** Tomás (PM)
> **Entrega principal:** [`ROADMAP-Q4-2026.md`](../ROADMAP-Q4-2026.md) — 44KB, top 10 features ICE-scored, 3 marcos mensais (Out/Nov/Dez), OKRs + métricas + backlog Q1/2027

---

## TL;DR (1 minuto)

Akasha Portal entra em **Q4 2026 (out-dez)** com a plataforma no ar (v0.1.0-rc.1) e os 3 marcos Q3 concluídos. Q4 é o trimestre de **profundidade > largura**: aprofundar Akasha IA (multi-tradição, feedback, persistência), comunidade (threading, rich media, push), e abrir para o mundo (i18n EN, search semântico, citations acadêmicas).

**Top 3 features por ICE:**
1. **Akasha IA Multi-Tradição (12→20+)** — ICE 24
2. **Notificações Push Reais (Web Push + opt-in LGPD)** — ICE 24
3. **Akasha IA Feedback Loop (👍/👎 + persistência)** — ICE 23

**3 marcos mensais:**
- **Marco 4 (out)** — Profundidade Social (notificações, rich media, threading)
- **Marco 5 (nov)** — Akasha IA Pessoal (multi-tradição, feedback, daily reflection, conversation persistence)
- **Marco 6 (dez)** — Abertura Global + Polish (i18n EN, search v2, citations v2)

---

## Decisões tomadas nesta wave

### D1. Não priorizar 5 features do conjunto sugerido (princípio + fit + risco)

| Feature | Motivo da depriorização |
|---|---|
| **Marketplace de livros/práticas (afiliados)** | Viola princípio "gratuito, sem fins lucrativos" (VISION §1) |
| **Mentorship pairing 1:1** | Viola "não substitui profissional" (VISION §9); melhor deixar orgânico via grupos |
| **Marketplace local (terapeutas, retiros)** | Viola "NÃO é marketplace" (ARCHITECTURE §1); fora do escopo |
| **Integração Apple Health / Google Fit** | Fit fraco com comunidade de espiritualidade universalista |
| **Karma/reputation system** | Risco cultural: gamificação pode azedar comunidade espiritual |

**Por que registrar:** o owner sugeriu 15 features; só 10 entraram. Documentar depriorização explícita evita "onde está X?" mais tarde. Cada depriorização tem justificativa rastreável (princípio do VISION, ARCHITECTURE ou risco).

### D2. Bundle Akasha IA Feedback Loop + Conversation Persistence (mesma sprint)

Em vez de fazer 2 features separadas (Feedback Loop na sprint 1, Persistence na sprint 2), **bundle na mesma sprint** porque:
- Compartilham schema (AiMessage + AiConversation já existem)
- Compartilham LGPD consent flow
- Compartilham UI (history mostra feedback inline)
- Economiza ~3-4 dias de coordination

### D3. North Star Metric mudou: WAC → WEM

Q3 usou **Weekly Active Contributors (WAC)** — só quem cria conteúdo. Q4 muda para **Weekly Engaged Members (WEM)** — quem **interage profundamente** (cria, responde, lê artigo completo, responde daily reflection, opt-in push).

**Por que:** comunidade de espiritualidade valoriza leitura contemplativa tanto quanto criação. WEM captura qualidade > quantidade.

**Meta Q4:** 1.500 WEM até final dez (vs ~500 WAC esperados em final Q3).

### D4. 3 OKRs em vez de 2

Q3 teve 2 OKRs. Q4 tem 3:
- **O1**: Aprofundar relação com Akasha IA (multi-tradição, feedback, personalização)
- **O2**: Engajamento profundo via conteúdo multimodal (threading, áudio, push, search)
- **O3**: Preparar audiência global sem diluir BR (i18n EN, sem quebrar comunidade BR)

**Por que 3:** Q4 tem frentes distintas (IA / comunidade / i18n) que merecem tracking separado. Combinar em 2 OKR forçaria priorização artificial.

### D5. Feature 9 (i18n) tem confidence 6/10 (não 8)

EN é arriscado em comunidade PT-BR-first. Mitigação no plano:
- Começar EN-only read (não postar)
- Métricas separadas BR vs EN
- 30 artigos EN revisados por Curator (não apenas tradução de máquina)
- Conservador: 10% EN até final dez (não 30%)

### D6. Curator Iyá é o gargalo principal do Q4

Curador vai precisar:
- Curar 8 tradições novas (≥5 artigos cada = 40 artigos)
- Revisar 100+ prompts de daily reflection
- Revisar 100+ feedbacks da Akasha IA
- Auditar 30 traduções EN

**Mitigação:**
- 2-3 assistentes de curadoria treinados
- AI-assisted triage para reviews (LLM pré-filtra 👎 óbvios)
- Nem tudo precisa Curator no loop (low-risk tasks direto)

---

## Top 10 features — visão compacta

| # | Feature | ICE | Esforço | Marco | Owner |
|---|---|:---:|---|---|---|
| 1 | Akasha IA Multi-Tradição (12→20+) | 24 | M | Marco 5 | Curator + Coder |
| 2 | Notificações Push Reais (Web Push + opt-in LGPD) | 24 | M | Marco 4 | Coder + Security |
| 3 | Akasha IA Feedback Loop (👍/👎 + persistência) | 23 | M-L | Marco 5 | Curator + Coder + PM |
| 4 | Daily Reflection Prompt (push + curadoria) | 22 | S-M | Marco 5 | Curator + Coder |
| 5 | Posts com Rich Media (áudio/podcast embed) | 21 | M | Marco 4 | Coder + Designer |
| 6 | Comments Threading + @mentions | 21 | M | Marco 4 | Coder + Designer |
| 7 | Akasha IA Conversation Persistence (history + LGPD export) | 21 | M | Marco 5 | Coder + Security |
| 8 | Search v2 (semantic com pgvector embeddings) | 20 | M | Marco 6 | Coder + Performance |
| 9 | Translation i18n (PT-BR + EN launch) | 18 | L | Marco 6 | Coder + Curator + Designer |
| 10 | Citation System v2 (DOI + crossref + BibTeX) | 19 | M | Marco 6 | Curator + Coder |

---

## Gaps conhecidos (próximas waves)

| Gap | Origem | Status |
|---|---|---|
| Branch `feat/community-platform` + `feat/notifications-real` ainda não pushed | Wave 2 + Wave Notificações | 🟡 Working tree pronto, depende de bash |
| 621 TSC errors pré-existentes (não-introduzidos) | Migração schema incompleta | 🟡 P0 #1 (merge schema) ainda pendente |
| Sandbox 2GB trava paralelismo (workers OOM) | Limitação de infra | 🟡 `max_concurrency=2-3` em todos os YAMLs |
| Cadence gap de commits (cron `akasha-evolution-daily` quebrado) | Bug tool wrapper `mavis cron` | 🟡 Workaround: planos pré-fabricados |
| Worktree cleanup: 5+ branches mortas de waves anteriores | Histórico | 🟡 Higiene pendente |

> **Para Q4, esses gaps podem virar blockers** se não forem limpos em jul-ago. Recomendo ao PM priorizar junto com Wave 12 (Quality Sprint) entre Q3 final e Q4 início.

---

## Conexão com docs anteriores

| Doc | Relação com este |
|---|---|
| [`ROADMAP-Q3-2026.md`](ROADMAP-Q3-2026.md) | Predecessor — Q3 marcos 1-3 que Q4 assume como completos |
| [`VISION.md`](../VISION.md) | Princípios que guiam depriorização (D1) e North Star (D3) |
| [`ARCHITECTURE.md`](../ARCHITECTURE.md) | Restrições técnicas que definem Effort das features |
| [`docs/STRATEGY-chain-of-thought.md`](STRATEGY-chain-of-thought.md) | Filosofia universalista que fundamenta Feature 1 (multi-tradição) |
| [`docs/AKASHIA-IA-MVP-WAVE10.md`](AKASHIA-IA-MVP-WAVE10.md) | Estado atual da Akasha IA (MVP) que Q4 expande |
| [`docs/EVOLUTION-LOG.md`](EVOLUTION-LOG.md) | Caderno de bordo com gaps estruturais a fechar antes de Q4 |

---

## O que NÃO entra no Q4 (com motivo)

| Feature | Por que ficou de fora | Onde mora |
|---|---|---|
| Voice mode (TTS) | Esperar feedback Q4 confirmar demanda | Backlog Q1/2027 |
| Live streams (meditação guiada) | Operacionalmente pesado | Backlog Q1/2027 |
| App nativo (RN) | PWA funciona; nativo só se growth justificar | Backlog Q1/2027 |
| Feed "Para você" v2 | Depende de base maior + ≥1000 WEM | Backlog Q1/2027 |
| i18n ES + FR | PT-BR + EN já é step gigante | Backlog Q1/2027 |
| Co-evolução IA fine-tuning | Marco 5 captura feedback; fine-tuning é Q1 | Backlog Q1/2027 |
| Eventos online (calendário workshops) | Operacionalmente pesado; avaliar após daily reflection validar engagement | Backlog Q1/2027 |
| Karma/reputation contextual | Risco cultural; reavaliar após feedback | Backlog Q1/2027 |
| API pública para devs | Só faz sentido com ≥5000 WEM | Backlog (sem prazo) |
| Integração calendário lunar | Nice-to-have | Backlog Q1/2027 |

---

## Métricas de sucesso Q4 (resumo)

### North Star: Weekly Engaged Members (WEM)
**Meta:** 1.500 WEM até 31/dez (vs ~500 WAC esperados em Q3 final)

### Supporting (3):
- **Daily Reflection Stickiness** ≥ 40%
- **AI Conversation Depth** ≥ 7 mensagens/conversa (atual ~3.5)
- **Cross-Tradition Reads** ≥ 35%

### Counter (saúde):
- NPS ≥ 40 | Churn ≤ 8% | Report ≤ 5% | P95 ≤ 500ms | Lighthouse ≥ 90 | LGPD = 0 | AI 👎 ≤ 30% | Push unsub ≤ 5%

---

## Próximos passos (recomendação do PM)

### Antes do Q4 começar (jul-ago, 4-6 semanas):

1. **Limpar gaps estruturais** — fechar BUG-001 (merge schema), push de branches pendentes, higene de branches mortas
2. **QUALITY-STANDARDS Sprint** — Wave 12 dedicada a: pre-push typecheck hook, hygiene script, ADR source-of-truth
3. **Spike técnico i18n** — decidir next-intl vs alternativa em ago (antes de comprometer Feature 9)
4. **Curator capacity plan** — treinar 2-3 assistentes de curadoria, AI-assisted triage pipeline

### Primeira sprint de Q4 (01-15/out):

1. **Feature 2 (Notificações Push)** — código já existe, deploy + validação
2. **Feature 5 (Rich Media)** — Supabase Storage + player mobile-first
3. **Setup PostHog** — instrumentação dos 3 KR macro (WEM, DRS, ACD)

---

> **Status:** ✅ Documento completo + commits pendentes (bash indisponível nesta janela)
> **Próxima ação:** Conventional commits (`docs(pm): roadmap Q4 2026 + top 10 features ICE-scored`) + push quando bash voltar
> **Mantido por:** Tomás (PM)
