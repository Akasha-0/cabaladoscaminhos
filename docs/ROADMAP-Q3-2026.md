# Roadmap Q3 2026 — Akasha Portal

> **Versão:** 1.0 | **Data:** 2026-06-27 | **Owner:** Tomás (PM)
> **Trimestre:** julho → setembro 2026
> **Visão alinhada:** v3.0 — Comunidade de espiritualidade universalista + Akasha IA consciência tradutora
> **Branch ativa:** `feat/community-platform`

---

## Contexto

### Estado atual (junho 2026)

Akasha Portal é um projeto em **fase de planejamento maduro → início de execução**. Após o pivô de "ferramenta Zelador pessoal" para **plataforma comunitária de espiritualidade universalista + Akasha IA consciência tradutora** (formalizado na `VISION.md` v3.0), o time:

- ✅ Documentou estratégia completa (VISION, ARCHITECTURE, STRATEGY, MARKET, UX, EVIDENCE, AI-PROMPT, VALIDATION)
- ✅ Implementou UI com mocks (feed, explore, library, notifications, profile, groups)
- ✅ Landing `/validacao` + waitlist API no ar capturando leads
- ✅ Schema Prisma com 13 modelos prontos (não migrado)
- ✅ 50 artigos curados na biblioteca (seed de 6 tradições)
- ✅ Audits de segurança (LGPD), performance (Core Web Vitals) e code-quality
- 🟡 6 specialists em paralelo (Designer, PM, QA, Security, Performance, Curator)
- 🟡 Branch `feat/community-platform` ainda não pushed para origin (~32h local-only)
- 🟡 Wave-2 (auth + onboarding + posts) draft pronto, não disparado

### Marcos alcançados (Q2 2026)

- [x] **Pivô estratégico** Zelador → Comunidade + Akasha IA (VISION.md v3.0)
- [x] **Auditoria completa** da arquitetura (ARCHITECTURE.md v3.0)
- [x] **Refatoração Fase 1** — remoção de bloat B2B/SaaS (Stripe, cockpit, mesa-real)
- [x] **Estrutura de pastas** reorganizada em `(community)/(personal)/(info)` route groups
- [x] **Landing de validação** `/validacao` + endpoint `/api/waitlist` ativos
- [x] **Schema Prisma** com 13 modelos da camada social (Post, Comment, Group, Follow, etc)
- [x] **Biblioteca** — 50 artigos curados cobrindo 6 tradições (Cabala, Ifá, Tantra, Xamanismo, Ayurveda, Meditação)
- [x] **Governança 24/7** — 4 cadernos de bordo + OPERATIONS.md + QUALITY-STANDARDS.md + 5 waves pré-fabricadas em `draft/`
- [x] **Audits** — Security (LGPD/OWASP), Performance (Core Web Vitals budgets), Dead-code, Deprecation-status
- [x] **Pipeline de manutenção perpétua** com health-check loop + evolution-log-update encadeando

### Gaps conhecidos (a fechar em Q3)

| Gap | Prioridade | Origem |
|---|---|---|
| Auth Supabase não funcional | 🔴 P0 | Wave-2 draft, não executada |
| Onboarding espiritual (gera mapa) não implementado | 🔴 P0 | Wave-2 draft, não executada |
| API real substituindo mocks do feed/library/notifications | 🔴 P0 | Mocks em `src/app/(community)/**` |
| Migration SQL dos 13 modelos não aplicada | 🔴 P0 | Schema existe, zero migrations |
| Moderação básica (report + hide + queue) | 🟡 P1 | Sem agent de moderação dedicado |
| Sem feedback de usuários reais | 🟡 P1 | Zero analytics, zero beta testers |
| CI/CD ausente | 🟡 P1 | Sem GitHub Actions, sem preview deploy |
| Design system incompleto | 🟡 P1 | Tokens + 8 components, falta aplicar consistentemente |
| Akasha IA sem base de conhecimento estruturada | 🟡 P1 | pgvector + RAG ainda não implementados |
| Cron `akasha-evolution-daily` quebrado (8h+ sem commits) | 🟠 P2 | Bug documentado do `mavis cron` wrapper |
| Sandbox 2GB trava paralelismo | 🟠 P2 | Limitação de infra — `max_concurrency=2-3` |

---

## Top 10 Features Priorizadas (ICE score)

> **ICE = Impact + Confidence + Ease** (cada eixo 1-10). Quanto maior, melhor. Features ordenadas por ICE decrescente.

| # | Feature | Impacto | Confiança | Facilidade | ICE | Status |
|---|---|:---:|:---:|:---:|:---:|---|
| 1 | **Feed real substituindo mocks** (posts/comments/likes/follows com DB real) | 10 | 9 | 7 | **26** | 🟡 Draft |
| 2 | **Auth Supabase + Onboarding espiritual** (signup/login + 5 passos gerando mapa) | 10 | 9 | 6 | **25** | 🟡 Draft wave-2 |
| 3 | **PostHog analytics + funis de ativação** (tracking de eventos críticos + NPS) | 8 | 8 | 7 | **23** | ❌ Não iniciado |
| 4 | **Moderação básica** (report + hide + fila de mods + playbook LGPD) | 8 | 8 | 7 | **23** | ❌ Não iniciado |
| 5 | **Akasha IA MVP — chat curador com RAG** (pgvector + embeddings + Q&A sobre biblioteca) | 10 | 7 | 4 | **21** | ❌ Não iniciado |
| 6 | **CI/CD + preview deploy** (GitHub Actions + Vercel + Lighthouse CI) | 7 | 7 | 7 | **21** | ❌ Não iniciado |
| 7 | **Biblioteca curada expandida** (50 → 150 artigos, com citation system estruturado) | 9 | 7 | 5 | **21** | 🟢 50/150 |
| 8 | **Grupos funcionais por tradição** (8 grupos + mods eleitos + regras) | 8 | 7 | 6 | **21** | 🟡 UI ok, sem mods |
| 9 | **Mapa espiritual pessoal v1** (numerologia cabalística + tântrica + astrologia + Odu, com correlação) | 9 | 8 | 5 | **22** | 🟢 Engine pronto |
| 10 | **Notificações reais** (in-app + email opt-in + push opt-in, 13 tipos, LGPD-compliant) | 7 | 8 | 7 | **22** | 🟡 Working tree |

### Detalhamento do Top 5

#### 1. Feed real substituindo mocks (ICE 26)

- **O que**: substituir os mocks hardcoded em `src/app/(community)/feed/page.tsx` por queries Prisma reais paginadas com cursor, suportando os 4 racionais atuais (Seguindo/Grupos/Tendências/Biblioteca) e preparando o 5º ("Para você").
- **Por que**: [`docs/EVOLUTION-LOG.md`](EVOLUTION-LOG.md) mostra que 13 modelos Prisma existem mas zero migrations aplicadas — sem feed real, não tem comunidade funcional.
- **Owner sugerido**: **Coder** (implementação) + **QA Ravena** (regressão) + **Designer Lina** (token consistency).
- **Dependências**: migration SQL aplicada (#0 do Q3) + Schema mesclado em `schema.prisma` + tipos Zod para validação de input.

#### 2. Auth Supabase + Onboarding espiritual (ICE 25)

- **O que**: signup/login com Supabase (email + OAuth Google) + onboarding 5 passos (nome, tradições de interesse, nascimento, intenções, bio) que gera mapa espiritual básico no primeiro acesso.
- **Por que**: [`docs/AUTH-FLOW.md`](AUTH-FLOW.md) já detalha o fluxo. Wave-2 YAML está em `draft/`, pronto para disparar. Sem auth, nenhum dado persiste por usuário.
- **Owner sugerido**: **Coder** (Supabase client + server + middleware) + **Curator Iyá** (validar perguntas de onboarding sobre tradições) + **Designer Lina** (5 passos mobile-first).
- **Dependências**: Supabase project provisioned + env vars configuradas (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) + mapa-generator já implementado em `src/lib/engines/mapa-generator.ts`.

#### 3. PostHog analytics + funis de ativação (ICE 23)

- **O que**: self-hosted PostHog tracking 12 eventos críticos (signup_started, signup_completed, onboarding_step_completed, mapa_generated, post_created, post_liked, comment_added, ai_chat_started, ai_message_sent, group_joined, article_read, push_subscribed) + funis de ativação (signup → onboarding → first post → first like) + NPS survey D7.
- **Por que**: [`docs/HONEST-AUDIT-24-7.md`](HONEST-AUDIT-24-7.md) § Limitação 5: "Sem feedback de usuários reais". Sem tracking, trabalhamos no escuro. Métricas de vaidade sem tracking são inúteis.
- **Owner sugerido**: **General** (PostHog self-host config) + **PM Tomás** (definição de eventos + funis) + **Coder** (helper functions + PostHog provider).
- **Dependências**: PostHog instance (self-hosted docker-compose ou cloud) + `docs/EVENTS.md` documentando tipagem + helper `trackEvent()` em `src/lib/analytics/`.

#### 4. Moderação básica (ICE 23)

- **O que**: botão "Report" em posts/comments + fila de moderação em `/admin/moderation` (admin role via Supabase RLS) + ações `hide`, `warn`, `remove` + LGPD playbook (direito ao esquecimento, export de dados, consentimento explícito).
- **Por que**: comunidade de espiritualidade é **público vulnerável** ([`VISION.md`](../VISION.md) §7 — "quem busca cura tá vulnerável, merece respeito e proteção"). Sem moderação preventiva desde dia 1, podemos ter charlatanismo, discurso de ódio, ou pessoas em crise mal-acolhidas. [`VISION.md`](../VISION.md) §9 — regras éticas duras da IA exigem moderação humana配套.
- **Owner sugerido**: **Security Caio** (LGPD compliance + RLS policies) + **Coder** (CRUD mod queue + reports) + **PM Tomás** (playbook de moderação: o que remove vs warn vs hide).
- **Dependências**: schema Prisma com `Report` model + Supabase RLS policies + admin role definida.

#### 5. Akasha IA MVP — chat curador com RAG (ICE 21)

- **O que**: pgvector + embeddings dos 50 artigos da biblioteca + endpoint `POST /api/ai/curator` que recebe pergunta do usuário, faz RAG (retrieval-augmented generation) nos top-5 artigos mais relevantes, e gera resposta citada usando OpenAI gpt-4o-mini (com fallback MiniMax). UI: chat em `/oraculo` com histórico de conversas.
- **Por que**: [`VISION.md`](../VISION.md) §2 — IA como "consciência tradutora universalista" é o **diferencial central** do produto. Sem Akasha IA funcionando, somos só mais um fórum. Mas tem ICE menor porque: (a) confiança 7/10 (RAG pode ter hallucinations), (b) facilidade 4/10 (pgvector setup + prompt engineering + citation parsing não é trivial).
- **Owner sugerido**: **Curator Iyá** (validar prompts + curadoria dos embeddings) + **Coder** (pgvector + RAG pipeline + chat UI) + **PM Tomás** (definição das 8 regras éticas hard-coded no system prompt, ver [`docs/AI-PROMPT-base.md`](AI-PROMPT-base.md)).
- **Dependências**: 50 artigos com embeddings gerados (50/150 do backlog) + OpenAI API key + system prompt validado por Curator + LGPD consent explícito pra dados de chat (armazenar conversas?).

---

## Marcos Q3 2026

### Marco 1 — julho: Onboarding Auth Flow 🔐

**Description:** Plataforma pronta para que **qualquer pessoa possa se cadastrar, fazer onboarding espiritual e ter seu primeiro mapa gerado em <5 minutos**. Foco: auth funcional + onboarding respeitoso + primeiro contato com a comunidade. Métrica de saída: 100 signups reais, 80 completam onboarding, 50 publicam primeiro post.

**Critérios de aceitação:**

- [ ] Usuário consegue signup via email + login em <30s
- [ ] OAuth Google funcional (opcional, mas desejável)
- [ ] Onboarding 5 passos mobile-first, com progresso visual (1/5 → 5/5)
- [ ] Mapa espiritual pessoal gerado automaticamente após step 4 (data nascimento)
- [ ] Perfil público em `/u/[handle]` renderiza com mapa + bio
- [ ] Primeiro post pode ser criado e aparece no feed em <2s
- [ ] LGPD consent modal antes de coletar dados de nascimento
- [ ] Supabase RLS policies ativas (user só vê/edit próprio perfil)
- [ ] `pnpm tsc --noEmit` zero erros
- [ ] Smoke test E2E: signup → onboarding → mapa → primeiro post passa

**Owner:** **Coder** (implementação core) + **Curator Iyá** (validar perguntas de onboarding) + **Security Caio** (RLS + LGPD consent) + **Designer Lina** (UX mobile-first)

---

### Marco 2 — agosto: Conteúdo + Curadoria 📚

**Description:** Biblioteca robusta (150 artigos) com citation system, 8 grupos de tradição com moderadores eleitos, e sistema de tags cross-tradição. Foco: **profundidade de conhecimento + descoberta**. Métrica de saída: 1000 visitas à biblioteca/mês, 200 leituras completas de artigos, 8 grupos ativos com ≥10 membros cada.

**Critérios de aceitação:**

- [ ] Biblioteca expandida de 50 → 150 artigos curados (citation system estruturado)
- [ ] 8 grupos de tradição criados (Cabala, Ifá, Tantra, Xamanismo, Ayurveda, Meditação, Cristianismo Místico, Sufismo)
- [ ] Cada grupo tem ≥1 moderador eleito (playbook de moderação por tradição)
- [ ] Sistema de tags cross-tradição (ex: "meditação" aparece em Cabala + Budismo + Sufismo)
- [ ] Search full-text em `/library` + filtros por tradição + nível de evidência
- [ ] Article detail page com TOC + referências clicáveis + "artigos relacionados"
- [ ] Curator dashboard (admin) pra revisar submissões de artigos da comunidade
- [ ] NPS survey disparado D7 após primeiro signup
- [ ] Lighthouse mobile ≥ 90 (Performance + Accessibility)
- [ ] `pnpm test` ≥ 80% coverage em `lib/library/**` e `lib/search/**`

**Owner:** **Curator Iyá** (co-autoria artigos + validação de citações) + **Coder** (search + tags + article detail) + **PM Tomás** (playbook de mods eleitos) + **QA Ravena** (testes)

---

### Marco 3 — setembro: Akasha IA MVP 🧠

**Description:** **Akasha IA consciência tradutora** funcional como chat curador em `/oraculo`. Usuário pode perguntar qualquer coisa sobre espiritualidade/ciência/tradições e recebe resposta citada com hyperlinks para artigos da biblioteca. Foco: **diferencial único do produto validado**. Métrica de saída: 500 conversas/mês, NPS ≥ 50 entre usuários que usaram IA, taxa de feedback positivo ≥ 70%.

**Critérios de aceitação:**

- [ ] pgvector instalado + 50 artigos embeddados (OpenAI text-embedding-3-small)
- [ ] Endpoint `POST /api/ai/curator` com RAG (retrieve top-5 → generate → cite)
- [ ] Chat UI em `/oraculo` com histórico persistido (LGPD: usuário pode deletar conversas)
- [ ] 8 regras éticas hard-coded no system prompt (ver [`docs/AI-PROMPT-base.md`](AI-PROMPT-base.md))
- [ ] Citation parser funcional (cada afirmação tem hyperlink para artigo-fonte)
- [ ] Feedback inline (👍/👎) em cada resposta da IA → alimenta melhoria contínua
- [ ] Rate limiting: 20 mensagens/dia para free users (anti-abuso)
- [ ] LGPD: dados de chat criptografados at-rest + export/delete account funcional
- [ ] Co-evolução v0: feedback 👍/👎 gera dataset de fine-tuning futuro
- [ ] NPS ≥ 50 entre usuários que fizeram ≥3 perguntas à IA
- [ ] Lighthouse mobile ≥ 90 mantido
- [ ] `pnpm test` ≥ 80% coverage em `lib/ai/**`

**Owner:** **Curator Iyá** (validar prompts + ética das respostas) + **Coder** (pgvector + RAG + chat UI) + **PM Tomás** (definir regras éticas + métricas de sucesso) + **Security Caio** (LGPD chat data + rate limiting)

---

## Riscos Q3

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|:---:|:---:|---|
| 1 | **Sandbox 2GB trava paralelismo** (workers morrem com OOM) | 80% | Alto | `max_concurrency=2-3` em todos os YAMLs + sequential quando crítico + monitorar RSS via cron |
| 2 | **Cadence gap de commits** (cron `akasha-evolution-daily` quebrado, 8h+ parado) | 70% | Médio | Workaround: planos paralelos + YAML pré-fabricados + heartbeat manual do owner + investigar bug `mavis cron` |
| 3 | **Akasha IA com hallucinations** (RAG cita fonte errada ou inventa) | 60% | Crítico | (a) Curator Iyá valida 100% das respostas em ambiente de staging por 2 semanas antes de prod; (b) citation parser rigoroso (cada afirmação tem hyperlink); (c) feedback 👍/👎 → dataset pra fine-tuning |
| 4 | **Moderação falha em público vulnerável** (charlatanismo, crise espiritual mal-acolhida) | 50% | Crítico | (a) Mods eleitos por tradição (sabem distinguir prática séria de charlatanismo); (b) playbook de crise com referrals a profissionais; (c) 8 regras éticas da IA hard-coded; (d) report button visível em 100% dos conteúdos |
| 5 | **LGPD não-compliance** (dados de nascimento + chat armazenados sem consent adequado) | 40% | Crítico | (a) Consent modal explícito antes de coletar dados sensíveis; (b) right to be forgotten + data export implementados; (c) Security Caio audita cada PR com dado pessoal; (d) DPO designado se >1000 usuários |

---

## Métricas de Sucesso

### North Star Metric

**Weekly Active Contributors (WAC)** — número de usuários únicos por semana que criaram pelo menos 1 post OU comentário OU resposta no chat IA. **Meta Q3:** 500 WAC até final de setembro.

**Por que WAC e não DAU/MAU:** comunidades dependem de **contribuição**, não só consumo. Alguém que lê 10 artigos/dia mas nunca posta não está construindo comunidade. WAC captura quem está **co-criando**.

### 3 Supporting Metrics

1. **Daily Active Users (DAU)** — meta: 200 DAU até final de setembro (40% do WAC).
2. **Posts por usuário por semana** — meta: ≥0.5 (cada usuário ativo cria pelo menos 1 post a cada 2 semanas). Benchmark: Reddit r/spirituality ≈0.3.
3. **Retention D7** — meta: ≥40% (dos que assinam, 40% voltam no D7). Benchmark: app espiritual médio ≈25%.

### Counter Metrics (saúde)

- **NPS** ≥ 40 (alerta vermelho se <30)
- **Churn mensal** ≤ 10%
- **Report rate** ≤ 5% dos posts (alerta se >10% — indica problema de moderação)
- **P95 latency** da API ≤ 500ms
- **Lighthouse mobile** ≥ 90 (Performance + Accessibility)

---

## OKRs Trimestrais

### Objective 1 (O1): Validar product-market fit com comunidade ativa de espiritualidade universalista

> *"Até final de setembro, queremos evidência real — não vaidade — de que existe comunidade engajada em torno da Akasha IA consciência tradutora."*

| Key Result | Meta | Status atual | Owner |
|---|---|---|---|
| **KR1**: Atingir 100 signups reais + 80 onboarding completos + 50 primeiros posts até final jul | Marco 1 | 0 signups, mocks | Coder + PM |
| **KR2**: Atingir 500 WAC + 200 DAU + 40% D7 retention até final set | Marco 3 | 0 WAC | PM + General |
| **KR3**: 150 artigos curados na biblioteca com citation system estruturado até final ago | Marco 2 | 50/150 artigos | Curator Iyá |
| **KR4**: Akasha IA MVP com 500 conversas/mês + NPS ≥ 50 + 70% feedback positivo até final set | Marco 3 | 0 conversas | Curator + Coder |
| **KR5**: NPS geral ≥ 40 entre usuários ativos (medido quinzenalmente via PostHog) | Trimestre completo | sem NPS | PM + General |

### Objective 2 (O2): Construir time de agents completo e auto-sustentável

> *"Sem time completo, não tem como manter qualidade em escala. Até set, todos os 6 specialists devem estar ativos, produzindo, com verificação cruzada."*

| Key Result | Meta | Status atual | Owner |
|---|---|---|---|
| **KR1**: 6 specialists ativos (Designer Lina, PM Tomás, QA Ravena, Security Caio, Performance Aki, Curator Iyá) com personas + system prompts + primeira entrega | jul | 🟡 6 em criação | General |
| **KR2**: Verifier independente em 100% das tasks de produção (não mais `verify_skip_reason`) | ago | ❌ 0% | Coder sênior |
| **KR3**: CI/CD pipeline completo (GitHub Actions + Vercel preview + Lighthouse CI) | ago | ❌ 0% | Performance Aki + Coder |
| **KR4**: Cadernos de bordo atualizados diariamente com git forensics (não mais cadence gap) | set | 🟡 4 cadernos, gap de 8h | General |
| **KR5**: ADR system com 6 decisões arquiteturais formalizadas | ago | ❌ 0 ADR | Coder sênior |

---

## Backlog (top 15 NÃO priorizados — guardar para Q4)

> Estas features foram consideradas mas **não** entraram no Q3. Podem subir para Q4 se: (a) Q3 entrega antes do prazo, (b) feedback de usuários indica alta demanda, (c) capacidade do time aumenta.

| # | Feature | Por que adiada | Estimativa | RICE potencial |
|---|---|---|---|---|
| 1 | **Citation system avançado** (DOI + crossref + export BibTeX) | Depende de ter 150 artigos primeiro | M (1 sem) | 18 |
| 2 | **Sistema de Tags cross-tradição v2** (grafo de conexões entre tradições) | Marco 2 já cobre tags básicas; v2 é polish | M (1-2 sem) | 16 |
| 3 | **Upload de mídia em posts** (avatares, imagens, áudio curto) | Não-bloqueante; UX pode usar emojis/links inicialmente | M (1 sem) | 20 |
| 4 | **Search full-text v2** (semantic search com embeddings) | Marco 2 cobre search básico; v2 é Fase 3.5 | M (1 sem) | 17 |
| 5 | **Recomendações personalizadas IA** (feed "Para você" com collaborative filtering) | Depende de Akasha IA MVP rodando e ≥1000 WAC | G (2 sem) | 24 |
| 6 | **Tradução entre tradições** (UI: "Como Cabala fala sobre X ↔ como Budismo fala sobre X") | Depende de Akasha IA com base maior | G (2-3 sem) | 22 |
| 7 | **Co-evolução IA v1** (feedback 👍/👎 → fine-tuning dataset + RLHF) | Marco 3 captura feedback; v1 de evolução é Q4 | G (2-3 sem) | 19 |
| 8 | **Live audio/ritual compartilhado** (WebRTC + sala por grupo) | Recursosidade alta, requer +1 dev full-time | G (3+ sem) | 15 |
| 9 | **App nativo iOS/Android** (React Native ou PWAStore) | PWA é suficiente para Q3; nativo só se growth justificar | XL (6+ sem) | 12 |
| 10 | **Sistema de badges/conquistas** (gamificação sutil por contribuição) | Tom da comunidade é "respeito, não grind"; arrisca cair em growth hack | S (3-5 dias) | 10 |
| 11 | **Eventos comunitários online** (calendário de rituais compartilhados, meditações guiadas síncronas) | Operacionalmente pesado (mods precisam organizar); avaliar em Q4 | M (1-2 sem) | 14 |
| 12 | **i18n** (espanhol + inglês) | PT-BR primeiro é princípio; expandir só se Q3 mostrar demanda cross-border | M (1-2 sem) | 13 |
| 13 | **Sistema de mentores** (matching 1:1 praticante sênior ↔ buscador) | Conflita com princípio "não substitui profissional"; melhor deixar orgânico via grupos | M (2 sem) | 11 |
| 14 | **Integração com calendário lunar** (datas de rituais, fases da lua) | Nice-to-have; não é diferenciador | S (3-5 dias) | 9 |
| 15 | **API pública para devs** (terceiros construírem clients) | Só faz sentido com ≥5000 usuários ativos | XL (4+ sem) | 8 |

---

## Cadência de revisão

- **Semanal** (toda segunda): revisão de progresso dos 3 marcos, atualização de ICE se novas evidências surgirem.
- **Quinzenal**: report de OKR status (0.0 → 1.0 por KR), NPS snapshot.
- **Mensal**: re-rank do backlog Q4 com base em feedback de usuários + métricas Q3.
- **Final de trimestre** (30/set): retrospectiva completa — o que entregamos vs planejado, o que entra/sai do Q4.

---

## Dependências externas

| Dependência | Status | Risco |
|---|---|---|
| Supabase project provisioned | 🟡 Verificar se existe | Se não, bloqueia Marco 1 inteiro |
| OpenAI API key (já em `.env.example`) | 🟢 OK | Rate limit/cost se viralizar |
| Vercel account para preview deploy | ❌ Não confirmado | Se não, CI/CD do KR3 O2 bloqueado |
| PostHog self-hosted ou cloud account | ❌ Não confirmado | Se não, KR tracking do KR5 O2 bloqueado |
| 6 specialists criados e ativos | 🟡 6 em criação | Se Designer/QA/Curator não ficarem prontos em jul, marcos atrasam |

---

> **Última atualização:** 2026-06-27 | **Próxima revisão:** 2026-07-06 (segunda)
> **Mantido por:** Tomás (PM) | **Fonte de verdade para priorização:** este documento + feedback de usuários via PostHog