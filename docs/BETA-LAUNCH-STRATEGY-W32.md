# 🚀 Beta Launch Strategy v2 — Akasha Portal
### Wave 32 · Strategic Plan 8/8 · Métricas, milestones, contingencies

> **Versão:** 2.0 | **Data:** 2026-06-30
> **Owner:** PM (Tomás) + QA (Ravena) + Founder (Gabriel)
> **Status:** Rascunho estratégico para revisão do operador
> **Substitui/estende:** `BETA-LAUNCH-PLAYBOOK.md` v1.0 (2026-06-27) com timeline **comprimida 60d → 30d**, métricas ajustadas para a **versão intensive** da beta, e formalização dos mecanismos de **feedback + contingência + decisão**
> **Inputs consumidos:** `BETA-LAUNCH-PLAYBOOK.md` v1.0, `LAUNCH-COMMUNICATIONS-W23.md`, `STAKEHOLDER-COMMUNICATION-W23.md`, `MARKET-VALIDATION.md`, `COMMUNITY-ENGAGEMENT-W30.md`, `/validacao` (página atual)

---

## 📑 Sumário

1. [Mudanças em relação à v1](#1-mudanças-em-relação-à-v1)
2. [Vision & hipóteses a validar](#2-vision--hipóteses-a-validar)
3. [Estrutura da beta v2 (timeline 30d)](#3-estrutura-da-beta-v2-timeline-30d)
4. [Métricas de sucesso (KPIs)](#4-métricas-de-sucesso-kpis)
5. [Mecanismo de feedback collection](#5-mecanismo-de-feedback-collection)
6. [Risk matrix (8 riscos)](#6-risk-matrix-8-riscos)
7. [Contingency playbook (5 gatilhos)](#7-contingency-playbook-5-gatilhos)
8. [Milestones timeline (12 semanas)](#8-milestones-timeline-12-semanas)
9. [Resource allocation](#9-resource-allocation)
10. [Decisões necessárias antes do T-30](#10-decisões-necessárias-antes-do-t-30)
11. [Limitações & honestidade](#11-limitações--honestidade)
12. [Anexos e referências](#12-anexos-e-referências)

---

## 1. Mudanças em relação à v1

> Diff conceitual entre o playbook v1 (60 dias, 3 ondas 10/20/20, white-glove clássico) e este plano estratégico v2 (30 dias, intensive, com mecanismos formais de decisão).

| # | Mudança | v1 (60d) | v2 (30d) | Por quê |
|---|---|---|---|---|
| **M1** | **Timeline total** | 60 dias (T-30 → T+30) | **30 dias (T-14 → T+16)** intensive + 30 dias de follow-up | Velocidade de validação > cobertura temporal. Mercado tem janela de 12-24 meses. |
| **M2** | **Fases** | Pre-launch + 3 ondas + follow-up (5 fases) | **Sprint 14d pré-launch + 4 sprints semanais** | Menos rito, mais iteração semanal visível |
| **M3** | **Wave 1 tamanho** | 10 pessoas, 1 semana | **10 pessoas, 1 sprint (7 dias)** | Mantém — funciona como barreira de risco |
| **M4** | **Wave 2 tamanho** | 20 pessoas, 1 semana | **20 pessoas, 1 sprint (7 dias)** | Mantém — validação de mix |
| **M5** | **Wave 3 tamanho** | 20 pessoas, 1 semana | **20 pessoas, 1 sprint (7 dias)** | Mantém — abre pra comunidade |
| **M6** | **Frequência de feedback** | Friday survey semanal | **In-app survey Wave 1/3/7/14/30d + NPS Day 14** | Múltiplos pontos curtos > um survey longo semanal |
| **M7** | **1-on-1** | 20min × 50 users × 2 semanas | **20min × 30 users × 1 sprint (Wave 1) + assíncrono Wave 2/3** | White-glove concentrado na Onda 1, diluído depois |
| **M8** | **PM Burnout risk** | Mitigado por contratar curadores | **Resolvido por cap de Onda 1 intensive + assíncrono depois** | Decisão estratégica antes de contratar |
| **M9** | **Métricas de retenção** | Target D7 ≥ 70%, D30 ≥ 50% | **Mantém targets + adiciona 3 KPIs operacionais (Akasha usage, Oráculo usage, DAU/MAU)** | v1 só tinha retenção; v2 traz métricas que sustentam a **tese de co-evolução** |
| **M10** | **Critérios de decisão** | Go/no-go em T+30 | **5 gatilhos de contingência contínuos com decisão em ≤ 48h** | v1 esperava 30 dias pra decidir; v2 decide cedo pra não perder tempo |

> **Premissa do v2:** se a v1 não rompeu nenhuma das barreiras (tempo, métricas, decisão), a v2 introduz 3 mecanismos que faltavam — **cadência curta de feedback**, **decisão contínua por gatilhos**, e **recursos alocados por % do tempo do operador** (não por calendário).

---

## 2. Vision & hipóteses a validar

### 2.1 Vision resumida (do VISION-2027-W15)

> **Akasha é uma comunidade online pequena (50 pessoas na beta, ~1.000 no público) onde praticantes de diferentes tradições espirituais se encontram para praticar, estudar e fazer perguntas — sem hierarquia entre caminhos. Uma IA curadora traduz entre as tradições e a ciência moderna, sempre citando fontes, nunca prescrevendo.**

### 2.2 Hipóteses a validar (3 primárias, 2 secundárias)

> **Princípio:** toda métrica de §4 e toda contingência de §7 está ancorada nestas hipóteses.

| # | Hipótese | Métrica-âncora | Threshold de validação |
|---|---|---|---|
| **H1** | **Comunidade pequena + white-glove supera benchmarks de retenção** de apps de espiritualidade genéricos | Day 7 / Day 30 retention | D7 ≥ 60% / D30 ≥ 40% |
| **H2** | **Cross-tradition engagement acontece naturalmente** quando a IA sugere cross-references | % de ativos com ≥ 1 interação cross-tradition | ≥ 50% dos ativos |
| **H3** | **Akasha IA cita fontes em ≥ 80% das respostas não-conversacionais** e os usuários confiam mais nela do que em chatbots genéricos | Citation rate + Akasha usage | Citation ≥ 80% · Usage ≥ 5 conversas/user/mês |
| **H4 (secundária)** | O **modelo freemium** aguenta sem paywall duro no MVP (beta gratuita) | Free → paid conversion rate (pós-beta) | ≥ 5% em 90 dias pós-público |
| **H5 (secundária)** | O **modelo de moderação em 3 camadas** (IA + humanos + operador) evita crises de toxicidade sem microgerenciamento | Reports de toxicidade / user / semana | ≤ 0.1 reports/user/semana |

> **O que NÂO está nestas hipóteses:** receita (não estamos validando WTP na beta — só comunidade × IA). Aprendizado precede monetização.

---

## 3. Estrutura da beta v2 (timeline 30d)

> **Convenção:** todos os "dias" abaixo são relativos ao **T+0 = abertura oficial da Onda 3** (= dia da primeira wave de comunidade). Timeline intensiva: T-14 a T+16.

### 3.1 Diagrama visual da sequência

```
T-30 ── T-14 ────────────────────────────────────────── T+0 ──────── T+16
  │       │                                              │            │
  │   ┌───┴────┐                                    ┌───┴────┐   ┌──┴───┐
  │   │SPRINT 0│  (infra + convite + seed)          │SPRINT 3│   │SPRINT│
  │   │ 14d    │                                    │ Onda 3 │   │  4   │
  │   └────────┘                                    │  open  │   │ Wrap │
  │       │                                            │        │   └─────┘
  │       ▼                                            ▼        │
  │   ┌────────┐  ┌────────┐  ┌────────┐         ┌────────┐    │
  │   │SPRINT 1│→ │SPRINT 2│→ │SPRINT 3│ ──────→ │SPRINT 4│ ───┘
  │   │ Onda 1 │  │ Onda 2 │  │ Onda 3 │
  │   │ 10 + 1d│  │ 20 +1d │  │ 20 +1d │
  │   └────────┘  └────────┘  └────────┘         └────────┘
  │   Day 1-7    Day 8-14    Day 15-21         Day 22-30
  │   Pilot       Mix val.     Community val.    Consolidation
```

### 3.2 Fases em detalhe

#### Sprint 0 — Pre-launch intensive (T-30 a T-14, 14 dias)

| Atividade | Owner | Entrega | Conclusão bloqueia? |
|---|---|---|---|
| Atualizar `/validacao` com 4 seções (ondas, expectativas, fundador, motivos) | Designer + PM | Página no ar | NÃO — pode ir em paralelo |
| Compilar press kit PT-BR + EN em `/press/akasha-portal.zip` | PM | ZIP publicável | NÃO |
| Enviar **Email #1 warmup** pra waitlist | PM | Resend disparado | SIM — não dispara mais waves sem isso |
| Criar **30-50 posts de seed** (manifesto + técnico-soft + pergunta + correlação) | PM + 2 curadores | Posts publicados | SIM — sem seed, feed fica vazio |
| Instrumentar PostHog com eventos de ativação, engajamento, retenção | Coder | Eventos live em prod | SIM — sem isso, métricas não existem |
| Preparar 3 curadores convidados (termo, briefing, NDA) | PM + Founder | Time montado | NÃO |
| Testar **/beta landing page + signup form** (W24 commit `e1659055`) | QA | Smoke test PASS | SIM — sem isso, convites quebram |

**Gate de saída do Sprint 0:**
- ✅ Email warmup enviado (≥ 50% open rate aceitável)
- ✅ ≥ 30 posts de seed publicados
- ✅ PostHog com health-check verde (eventos de signup + ativação + sessão disparando)
- ✅ Press kit publicado
- ✅ Time de curadores confirmado

#### Sprint 1 — Wave 1 Onda-piloto (T-7 a T+0, 7 dias, 10 users)

> **Foco:** validação operacional. O white-glove funciona? A infra aguenta? Quais problemas invisíveis?

| Dia | Ação | Owner |
|---|---|---|
| T-7 | Email convite (escrito à mão) pros 10 selecionados | PM |
| T-7 a T-5 | 1-on-1 de 20min com cada um dos 10 (3-4 calls/dia) | PM |
| T-5 | Survey Wave 1 (NPS + expectativas) | in-app |
| T-3 | Primeiro office hours coletivo (1h) | PM |
| T+0 | **Decisão go/no-go para Onda 2** (vide §7) | PM + Founder |

#### Sprint 2 — Wave 2 Expansão (T+0 a T+7, 7 dias, 20 users)

> **Foco:** validação de mix. O produto funciona com perfis diversos? Feed aguenta 4 tradições competindo por voz?

| Dia | Ação | Owner |
|---|---|---|
| T+0 | Email convite pros 20 selecionados | PM |
| T+0 a T+4 | 1-on-1 de 15min (não 20) com cada um — assíncrono por escrito pra quem recusar síncrono | PM |
| T+3 | Survey Wave 3 (NPS baseline + 1 pergunta aberta) | in-app |
| T+5 | Office hours coletivo (1h) + convidado curador de Cabala | PM + Curador |
| T+7 | **Decisão go/no-go para Onda 3** | PM + Founder |

#### Sprint 3 — Wave 3 Abertura (T+7 a T+14, 7 dias, 20 users)

> **Foco:** validação social. Cross-tradition engagement acontece? Efeito-rede começa?

| Dia | Ação | Owner |
|---|---|---|
| T+7 | Email convite pros 20 selecionados | PM |
| T+7 a T+10 | 1-on-1 de 10min com quem pedir (opcional, assíncrono por escrito) | PM |
| T+10 | Survey Wave 7 (NPS + 1 pergunta aberta) + primeiro tema semanal | in-app |
| T+12 | Office hours coletivo (1h) + convidado curador de Ifá | PM + Curador |
| T+14 | **Decisão go/no-go para abertura pública (Sprint 4)** | PM + Founder |

#### Sprint 4 — Consolidação (T+14 a T+30, 14 dias)

> **Foco:** consolidar dados, fechar relatório, decidir trajetória.

| Dia | Ação | Owner |
|---|---|---|
| T+14 | **Survey crítica Day 14** (NPS final + churn reasons de quem saiu) | in-app |
| T+14 a T+20 | Iterações priorizadas pelo feedback (ver §7.4) | Coder |
| T+17 | Relatório parcial público aos 50 (transparência radical) | PM |
| T+20 | Últimas 1-on-1 com quem quiser conversar offline | PM |
| T+21 a T+25 | Limpeza de dados, instrumentação final, hangout gratuito | PM |
| T+25 | Office hours coletivo de fechamento + convidado curador multi-tradição | PM + 3 Curadores |
| T+30 | **Relatório final Beta v2 (Day 30)** + decisão pública (ver §7.5) | PM + Founder |

---

## 4. Métricas de sucesso (KPIs)

> **Princípio:** as métricas abaixo se dividem em **3 categorias** — (a) **retenção** (validação H1), (b) **engajamento** (validação H2+H3), (c) **saúde operacional** (risco). Cada categoria tem **targets aspiracionais** e **thresholds de contingência**.

### 4.1 Categoria A — Retenção & ativação (validam H1)

| # | KPI | Definição operacional | Target | Threshold contingência | Fonte |
|---|---|---|---|---|---|
| **A1** | **DAU/MAU** | Daily Active Users / Monthly Active Users entre os 50 | **≥ 40%** | < 25% por 7 dias consecutivos | PostHog |
| **A2** | **Day 1 retention** | Usuários que voltaram no dia seguinte ao signup | ≥ 90% | < 75% | PostHog |
| **A3** | **Day 7 retention** | Usuários ativos no Day 7 (≥ 1 sessão) | **≥ 60%** (target aspiracional: 70%) | < 40% dispara §7.1 | PostHog |
| **A4** | **Day 30 retention** | Usuários ativos no Day 30 (≥ 1 sessão últimos 7d) | **≥ 40%** (target aspiracional: 50%) | < 25% dispara §7.1 | PostHog |
| **A5** | **Churn semanal** | % de ativos que saem por semana | ≤ 5% | > 10% por 2 semanas | PostHog |
| **A6** | **Time-to-first-value** | Tempo entre signup e 1ª interação significativa (gerar mapa espiritual OU postar OU comentar) | ≤ 7 dias | > 14 dias em > 30% dos users | PostHog |

### 4.2 Categoria B — Engagement & co-evolução (validam H2 + H3)

| # | KPI | Definição operacional | Target | Threshold contingência | Fonte |
|---|---|---|---|---|---|
| **B1** | **Posts/Comments per active user per week** | Média semanal entre users ativos | **≥ 3** | < 1.5 por 2 semanas | PostHog |
| **B2** | **Cross-tradition engagement** | % de ativos que interagiram (like/comentário/reply) com ≥ 1 user de tradição diferente da própria | **≥ 50%** | < 30% dispara §7.2 | PostHog + log |
| **B3** | **Akasha IA usage** | Média de conversas/user/mês com a IA | **≥ 5** conversas/user/mês | < 2 por user em qualquer mês | PostHog |
| **B4** | **Oráculo usage** | % de users que geraram ≥ 1 mapa espiritual durante a beta | **≥ 100%** (todos devem gerar pelo menos 1) | < 80% dispara onboarding review | PostHog |
| **B5** | **Citation rate (Akasha IA)** | % de respostas não-conversacionais da IA que citam ≥ 1 fonte (paper, livro, mestre, tradição) | **≥ 80%** | < 60% dispara IA review | Log IA + manual audit |
| **B6** | **Cross-tradition posts** | % de posts que mencionam ≥ 2 tradições | ≥ 20% dos posts | < 10% | PostHog |

### 4.3 Categoria C — Saúde operacional

| # | KPI | Definição operacional | Target | Threshold contingência | Fonte |
|---|---|---|---|---|---|
| **C1** | **NPS** | Net Promoter Score do survey Wave final | **≥ 50** | < 30 dispara §7.3 | in-app survey |
| **C2** | **Crash-free rate** | % de sessões sem crash | **≥ 99.5%** | < 98% dispara §7.4 | Sentry |
| **C3** | **Performance (FCP)** | First Contentful Paint mediana | **< 2s** | > 3s em mobile (75th percentile) | PostHog + Lighthouse |
| **C4** | **Performance (LCP)** | Largest Contentful Paint mediana | **< 3s** | > 4s em mobile (75th percentile) | PostHog + Lighthouse |
| **C5** | **Feedback response time** | % de feedback respondido em < 24h úteis | **≥ 95%** | < 80% por 3 dias | Planilha PM |
| **C6** | **Toxicidade reportada** | Reports de comportamento tóxico / user / semana | ≤ 0.1 | > 0.3 por 3 dias dispara §7.5 | Log moderação |
| **C7** | **PM overload signal** | Horas trabalhadas PM / semana + auto-avaliação de burnout (escala 1-5) | ≤ 50h/sem + burnout ≤ 3 | > 60h ou burnout ≥ 4 | Planilha PM |

### 4.4 Targets consolidados vs benchmarks externos

> **Hipótese de outperform:** Akasha é comunidade white-glove fechada de espiritualidade — retenção esperada ACIMA da média cross-industry (5-7% no D30), porque (a) user escolheu entrar, (b) há white-glove direto com operador, (c) conteúdo é denso e único.

| Métrica | Target v2 | Cross-industry benchmark | Por que o target é mais alto |
|---|---|---|---|
| D7 retention | ≥ 60% | 11-13% (Phiture, Sendbird) | White-glove + 1-on-1 + comunidade pequena + tema existencial |
| D30 retention | ≥ 40% | 5-7% (Phiture, Amplitude) | Co-evolução ancora + densidade de conteúdo |
| DAU/MAU | ≥ 40% | ~20% (comunidade genérica, Zhihu) | Mobile-first + uso cotidiano + ritual de office hours |
| NPS | ≥ 50 | 30+ (SaaS bom), 50+ (excelente) | Expectativa alinhada (sem hype no pre-launch) |

> **Se targets forem atingidos**, validamos H1 e H3; o plano de abertura pública segue com confiança.
> **Se targets ficarem entre threshold de contingência e target** (ex: D7 = 45%), executamos playbook §7 antes de decidir.
> **Se thresholds forem violados consistentemente** (ex: D7 < 40%), pivotamos antes de gastar recursos em escala.

---

## 5. Mecanismo de feedback collection

> **Compromisso:** o feedback é o **combustível** da tese de co-evolução. Sem mecanismo robusto, a IA não evolui.

### 5.1 5 canais paralelos (in-app + fora)

| Canal | Cadência | Quem responde | O que coleta | Onde vai |
|---|---|---|---|---|
| **In-app NPS survey** | Day 1, 3, 7, 14, 30 (5 surveys) | Beta user | 1 pergunta fechada (NPS 0-10) + 1 aberta opcional | Planilha + dashboard |
| **In-app micro-survey temático** | Semanal (1 pergunta rotativa) | Beta user | Pergunta única variando: "que correlações foram úteis essa semana?" / "qual feature te frustra mais?" | Planilha |
| **`/feedback` page** | Aberto, sempre disponível | Beta user | Bug report, feature request, opinião livre | Linear / GitHub issues + resposta PM em < 24h |
| **1-on-1 conversacional** | Wave 1: 20min × 10 todos | PM | Contexto qualitativo (não cabe em survey) | `beta-users.md` |
| **1-on-1 escrito assíncrono** | Wave 2/3: 1 pergunta por user | PM | Resposta única por escrito (15min/pm/user) | `beta-users.md` |

### 5.2 NPS prompt — Day 14 (regra específica)

> **Por que Day 14?** É quando o user já viu produto o suficiente pra ter opinião fundamentada, mas ainda está engajado o suficiente pra responder.

**Trigger:** modal in-app ao abrir o feed pela primeira vez no Day 14.
**Tempo estimado de resposta:** 30 segundos.
**Texto:**

```
Ei [nome], você tá com a gente há 2 semanas.
De 0 a 10, quanto você recomendaria o Akasha pra alguém
que você acha que ia se beneficiar?

[0 1 2 3 4 5 6 7 8 9 10]

Depois (opcional): o que mais te marcou — pra melhor ou pra pior?

[textarea livre]
```

**Resposta do PM após NPS:**
- Score 0-6: PM manda DM empática em < 24h perguntando o que aconteceu, oferecendo 1-on-1.
- Score 7-8: thank-you note + pergunta opcional sobre o que faria chegar a 9-10.
- Score 9-10: thank-you + convite a ser champion (peer support, opcional).

### 5.3 Feature requests — fluxo `/feedback`

| Etapa | Responsável | SLA |
|---|---|---|
| User submete feature/bug no `/feedback` | Beta user | — |
| PM triagem inicial (categoria + prioridade) | PM | < 24h úteis |
| PM classifica: `now` / `next` / `later` / `won't do` | PM | < 48h úteis |
| Issues `now` viram tickets de Coder | Coder | sprint seguinte |
| User recebe update por DM | PM | após resolução |

> **Compromisso público:** toda feature request recebe uma resposta em < 48h úteis, mesmo que seja "não faz sentido pra esse produto". Transparência radical.

### 5.4 1-on-1 interviews profundas (10 users selecionados)

> **Quem entrevista:** 10 users distribuídos entre Onda 1 e Onda 2, garantindo representatividade dos 4 perfis (Buscador / Praticante / Curioso Acadêmico / Curador).

**Roteiro (45min):**

1. (5min) Abertura — "como você tá usando o Akasha no dia a dia?"
2. (10min) Mapa espiritual pessoal — "faz sentido pra você? o que te surpreendeu?"
3. (10min) Akasha IA — "qual foi a melhor resposta que ela te deu? qual foi a pior?"
4. (10min) Feed + comunidade — "com quem você se conectou? por quê?"
5. (10min) Wishlist — "se você pudesse mudar UMA coisa, qual seria?"

**Quem conduz:** PM, com 2 co-conduções pelo Founder para calibrar percepção.

### 5.5 Discord / comunidade auxiliar (opcional, decisão no Sprint 0)

> **Status:** NÃO decidido. Avaliar no Sprint 0 se vale a pena ter um Discord/Slack paralelo pra discussão off-app.
>
**Argumentos a favor:** discussão off-app cria intimidade, ativa sem depender do feed.
> **Argumentos contra:** fragmenta atenção, tira o sinal "feed vazio é problema" do product analytics.
>
> **Decisão pré-Sprint 0:** Founder decide até T-30. Se sim, integrar via cross-link no app, não como substituto.

---

## 6. Risk matrix (8 riscos)

> **Metodologia:** Probabilidade (Baixa/Média/Alta) × Impacto (Baixo/Médio/Alto/Muito Alto). Cada risco tem **trigger específico** + **dono** + **mitigação preparada**.

### 6.1 Matriz visual

```
              IMPACTO
              Baixo    Médio    Alto       Muito Alto
PROB  Baixa                    R8         R5 (Akasha IA)
       Média         R6        R7,R3      R2,R1
       Alta                              R4 (PM burnout)
```

### 6.2 Tabela detalhada

| # | Risco | Prob | Impact | Trigger de detecção | Dono | Mitigação preparada |
|---|---|---|---|---|---|---|
| **R1** | **Poucos users ativos** — entram mas usam pouco, feed fica vazio | Média | Muito Alto | DAU/MAU < 25% por 7 dias (A1) | PM | (a) Seed content 30-50 posts antes do T-0; (b) office hours diários criam ritual; (c) DM manual do PM pros quiet users na semana 1; (d) "weekly challenge" opcional (ex: "essa semana, posta uma pergunta pra uma tradição diferente da sua") |
| **R2** | **Comunidade tóxica** — brigas, fundamentalismo, proselitismo | Baixa | Muito Alto | Toxicidade reportada > 0.3/user/semana (C6) | Mod + PM | (a) Mod cultural-aware treinado (não PM); (b) regras explícitas no onboarding ("universalismo, não proselitismo"); (c) IA detecta palavras-gatilho e alerta mod; (d) **ban com aviso é ok na beta — sem segunda chance**, documentado em código de conduta |
| **R3** | **Dominância de uma tradição** — Candomblé (ou outra) domina e silencia vozes | Média | Alto | Cross-tradition engagement < 30% (B2) | PM + IA | (a) Quota de tradição no seed content; (b) destaque semanal pra tradições sub-representadas; (c) prompt da IA sugere "ler post de tradição X diferente da sua"; (d) "tradição do mês" spotlight |
| **R4** | **PM burnout** — 50 users × white-glove × office hours × feedback < 24h = exaustão | Alta | Muito Alto (sem plano B operacional) | PM > 60h/semana OU burnout auto-avaliação ≥ 4 (C7) | Founder | (a) Cap de white-glove intensive no Wave 1, assíncrono depois; (b) 3 curadores convidados **compartilham office hours** (não PM sozinho); (c) feedback assíncrono > síncrono sempre que possível; (d) **plano de backup**: se PM sair, 1 curador líder assume office hours temporariamente |
| **R5** | **Akasha IA dá resposta inadequada** — promete cura, prescreve, desrespeita tradição | Média | Muito Alto | Citation rate < 60% (B5) OU report de IA inadequada | PM + Coder | (a) Hard rules do VISION §9 aplicadas como system prompt; (b) persona explicitando limites no prompt; (c) **primeiras 100 respostas auditadas antes da liberação para Wave 1**; (d) log de toda interação IA → revisado semanalmente pelo PM; (e) report de inadequação → fix imediato + comunicação transparente |
| **R6** | **Performance lenta no mobile** — LCP alto, FCP alto, abandono na primeira sessão | Média | Médio | FCP > 3s no 75th percentile (C3) ou LCP > 4s (C4) | Coder + QA | (a) Lazy loading de imagens; (b) code splitting por rota; (c) Akasha IA resposta streaming (não bloqueia UI); (d) audit Lighthouse semanal; (e) **graceful degradation**: se IA falhar, mostrar cache de últimos 50 prompts como fallback |
| **R7** | **User em crise espiritual/mental aguda** durante a beta | Baixa | Muito Alto | Report de moderação OU mensagem direta do user | PM + Mod | (a) Disclaimer explícito no onboarding ("isto não substitui profissional de saúde"); (b) IA com protocolo de crise → encaminha CVV 188 (BR) + 988 (US); (c) PM treinado pra responder com empatia + encaminhar; (d) **runbook documentado em `/runbooks/crisis.md`** |
| **R8** | **Vazamento da beta** — alguém convida não-convidado ou printa conteúdo privado | Baixa | Médio | > 1 report de conteúdo beta fora do grupo | PM | (a) Termo de uso explícito (não-compartilhamento); (b) conteúdo público dentro da beta (evita problema); (c) ban imediato se vazar; (d) marca d'água em screenshots oficiais |

### 6.3 Riscos NÃO listados (conscientemente)

> O usuário pediu 8 riscos. Excluímos conscientemente:
>
- **Baixa aquisição** — irrelevante na fase de beta (a oferta é a 50 convites, não aquisição viral)
- **LGPD violation** — coberto em todo onboarding + runbook separado (já existe em W27)
- **Concorrência lançando feature similar** — fora do nosso controle
- **Aumento de custo OpenAI** — fallback MiniMax já documentado (já existe em W30)
- **Custo de infra** — beta pequena, Supabase free tier aguenta

> Se algum desses virar realidade, é um **risco residual** — voltamos à risk matrix no Sprint 4 antes da abertura pública.

---

## 7. Contingency playbook (5 gatilhos)

> **Princípio:** a v1 esperava até Day 30 pra decidir go/no-go. **A v2 decide continuamente.** Cada gatilho abaixo tem **trigger numérico**, **ação automática documentada**, e **decisão esperada em ≤ 48h**.

### 7.1 Gatilho 1 — Retenção cai abaixo do esperado

**Trigger:** `D7 retention < 40% ao final do Sprint 2` (T+7) **OU** `D30 < 25% ao final do Sprint 4` (T+30).

**Ação automática:**
1. PM dispara survey qualitativo (3 perguntas abertas) pra quem não voltou
2. Análise de cohorte: usuários D7 < 40% têm algo em comum? (tradição, perfil, horário?)
3. Coder produz 1 quick win em ≤ 5 dias úteis (feature simples que endereça causa raiz)
4. Comunicação transparente no canal `#beta-feedback`: "ouvimos vocês, aqui está o que vamos mudar"

**Decisão esperada em 48h:**
- Se quick win resolve: segue, monitora próxima semana
- Se não resolve: **pausa novas waves**, iterar mais 14 dias antes de abrir público

### 7.2 Gatilho 2 — Cross-tradition engagement não acontece

**Trigger:** `< 30% dos ativos interagiram com ≥ 1 user de outra tradição` ao final do Sprint 3 (T+14).

**Ação automática:**
1. PM dispara "weekly challenge cross-tradition" (post específico incentivando)
2. IA muda prompt pra sugerir proativamente cross-references
3. Curer destacado da semana post sobre tradição minoritária
4. Seeder de posts cross-tradição (1 do operador + 1 de curador convidado)

**Decisão esperada em 48h:** se após 7 dias do challenge, ainda < 30%, **redesign do feed** (ex: "exemplos pra você" inclui cross-tradição obrigatória) é priorizado sobre features novas.

### 7.3 Gatilho 3 — NPS cai abaixo de 30

**Trigger:** NPS < 30 no survey Day 14 **OU** NPS < 30 no survey Day 30.

**Ação automática:**
1. PM faz 1-on-1 com todos os detratores (0-6) em ≤ 5 dias úteis
2. Compila padrões: o que está gerando frustração?
3. **Suspensão de features novas** por 7 dias — foco em correções + melhorias das features existentes
4. Carta pública transparente: "estamos ouvindo, aqui está o que vai mudar"

**Decisão esperada em 48h:**
- Se feedback é concentrado em 1-2 features: itera e segue
- Se feedback é difuso ("produto confuso"): **pausa**, volta pra discovery com 5 users, redesenha antes de continuar

### 7.4 Gatilho 4 — Performance degrada significativamente

**Trigger:** `FCP > 3s no 75th percentile` **OU** `LCP > 4s no 75th percentile` **OU** `crash-free < 98%`.

**Ação automática:**
1. QA dispara runbook de incident (`/runbooks/incident.md`)
2. Coder prioriza quick wins de performance (lazy load, code split, optimize images) nas próximas 48h
3. PM suspende feature work de Coder por 3 dias (todos em perf)
4. Se IA é a causa: throttling + cache agressivo

**Decisão esperada em 48h:**
- Se perf volta ao target: segue
- Se não volta: **reduz feature scope** (corta feature X não-crítica pra liberar banda)

### 7.5 Gatilho 5 — Moderação entra em crise

**Trigger:** `toxicidade reportada > 0.3/user/semana` **OU** PM detecta padrão de conflito no feed/catrac.

**Ação automática:**
1. PM suspende novos comentários/posts por 24h (apenas leitura)
2. Mod entra em "raid mode": revisão humana de todo post antes de publicar
3. PM manda DM empática aos ofensores com prazo de 24h pra responder
4. Se não responder OU repetir: ban temporário (7 dias) OU permanente dependendo da gravidade

**Decisão esperada em 48h:**
- Se resolve: moderação volta ao normal + PM revisa regras + publica adendo
- Se não resolve: **beta fechada** enquanto redesenha moderação (volta ao Sprint 0 com ajustes)

### 7.6 Pre-mortem (opcional, antes do T-7)

> **Antes do T-7**, PM conduz sessão de 30min com Founder + 1 curador: "imagine que a beta fracassou em T+30. O que aconteceu?"
>
> **Objetivo:** antecipar sinais que já vimos em outras comunidades que fracassaram (Caldas Novas, gringo.ai).
> **Output:** 3 sinais-sentinela adicionais que NÃO estão na risk matrix principal, adicionados ao monitoramento semanal.

---

## 8. Milestones timeline (12 semanas)

> **Escopo macro:** vai além dos 30 dias da beta — cobre até Week 12 (decisão de abertura pública consolidada).

| Week | Período | Marco principal | Owner | Gate de saída |
|---|---|---|---|---|
| **Week 0** | T-14 a T-7 | **Sprint 0 pronto** — infra, convite, seed, PostHog, press kit | PM + Designer + Coder | §3.2 Gate de saída PASS |
| **Week 1** | T-7 a T+0 | **Wave 1 Onda-piloto ativa** — 10 users, 1-on-1, office hours, survey Day 1+3 | PM | D7 Wave 1 ≥ 70% AND trigger check |
| **Week 2** | T+0 a T+7 | **Wave 2 Expansão ativa** — 20 users, validação de mix, office hours com curador | PM + Curador | Survey Wave 3 OK AND trigger check |
| **Week 3** | T+7 a T+14 | **Wave 3 Abertura ativa** — 20 users, validação social, NPS Day 14 | PM + Curador | NPS ≥ 30 AND trigger check |
| **Week 4** | T+14 a T+21 | **Iterações por feedback** — quick wins, priorização, comunicação pública | PM + Coder | ≥ 3 quick wins shipped |
| **Week 5** | T+21 a T+28 | **Consolidação** — limpeza de dados, instrumentação final, hangout geral | PM | Relatório parcial pronto |
| **Week 6** | T+28 a T+30 | **Relatório Day 30 + decisão beta v2** | PM + Founder | Decisão go/pivot/iterate |
| **Week 7** | T+30 a T+37 | **Implementação pós-beta** — features priorizadas, bugs abertos, polish | Coder | Code freeze pra abrir público |
| **Week 8** | T+37 a T+44 | **Preparação pública** — landing `public` (sem `/validacao`), pricing tiers, FAQ público | Designer + PM + Coder | Landing + pricing + FAQ no ar |
| **Week 9** | T+44 a T+51 | **Abertura pública** — waitlist pública, primeiros 100 signups sem convite | PM + Coder | 100 signups em 7 dias |
| **Week 10** | T+51 a T+58 | **Primeiros 100 onboarded** — onboarding self-serve, primeiro NPS público | PM | D7 público ≥ 30% (bench social comum) |
| **Week 11** | T+58 a T+65 | **Press release + Founder story public** | PM + Founder | Cobertura ≥ 2 veículos BR |
| **Week 12** | T+65 a T+72 | **Decisão pública de scale** — pivotar freemium, dobrar marketing, contratar? | PM + Founder | OKR público da Fase 5 publicado |

> **Observação:** **Week 9-12 são pós-decisão Day 30.** Se Week 6 decidir "iterar mais 30 dias", Weeks 7-12 são empurrados e o roadmap público vira Week 9-16.

---

## 9. Resource allocation

> **Premissa:** operador (Gabriel) é full-time no projeto. **80% da energia do operador + time vai pra feature work + bug fixes**, com fatias dedicadas pra comunidade e analytics.

### 9.1 Distribuição de tempo (%)

| Categoria | % do tempo total (PM + Coder + Designer) | Justificativa |
|---|---|---|
| **Feature work + bug fixes** | **80%** | Beta = produto validação. Sem features estáveis, sem comunidade de qualidade |
| **Comunidade management** | **10%** | Office hours, moderação, 1-on-1, surveys, transparência |
| **Analytics + iteração** | **10%** | PostHog dashboards, weekly reports, decisão por gatilhos |

### 9.2 Distribuição por role

| Role | % em feature work | % em comunidade | % em analytics |
|---|---|---|---|
| **PM (Tomás)** | 60% (prioriza + acompanha) | 25% (office hours, 1-on-1, surveys) | 15% (relatórios, decisões) |
| **Coder** | 95% (feature + bug + perf) | 0% | 5% (instrumenta eventos) |
| **Designer (Lina)** | 80% (UI/UX + assets) | 10% (review visual do conteúdo seed) | 10% (audit a11y/visual) |
| **Curadores (3 convidados)** | 0% | 100% (office hours + review de IA + seed content) | 0% |
| **Founder (Gabriel)** | 30% (decisões macro + scripts TikTok) | 30% (1-on-1 estratégico + transparência pública) | 40% (decisão go/no-go + reporting) |

### 9.3 Budget implications

> **Honesto:** não há orçamento de marketing na beta (orgânico via email + social). Orçamento opcional: contratar 1 designer freelancer pra social assets (~R$ 2-5k no período).

> **Custos recorrentes durante a beta (30 dias):**
>
- Resend: free tier / Pro ~$20/mo
- PostHog: free tier (até 1M eventos)
- OpenAI API: ~$50-150/mo depending on Akasha IA usage
- Supabase: free tier / Pro ~$25/mo
- Vercel: free tier / Pro ~$20/mo
- Domain + email: ~$15/mo
- **Total estimado: $130-230/mo** (~$800-1400 nos 30 dias)

> **Não está incluso:** tempo do operador + time (custo de oportunidade, não现金).

---

## 10. Decisões necessárias antes do T-30

> **Lista de pendências que bloqueiam a execução do plano.** Sem essas decisões, Sprint 0 não começa.

| # | Decisão | Owner | Prazo | Bloqueia? |
|---|---|---|---|---|
| **D1** | **Confirmar modelo de white-glove** — manter todas as 50 vagas com 1-on-1, ou aceitar versão intensive (10 com 1-on-1 + 40 assíncrono)? | Founder | Esta semana | SIM — define fluxo de trabalho |
| **D2** | **Convocar 3 curadores convidados** (1 de Cabala, 1 de Ifá, 1 Tantra/Astrologia) — quem, com que termos, qual escopo? | Founder + PM | T-21 | SIM — sem curadores, office hours ficam no PM |
| **D3** | **Discord/Slack paralelo** — manter como opção ou cortar? Se cortar, garantir que `/feedback` + office hours absorvem | Founder | T-21 | NÃO — pode decidir depois |
| **D4** | **Pricing de Akasha IA em escala pública** — freemium com cap de msgs/dia, ou paywall duro desde o dia 1? | PM + Founder | T-7 (não bloqueia beta, mas precisa estar claro pro roadmap) | NÃO pra beta; SIM pra Week 8 |
| **D5** | **Termos de uso + política de privacidade** — LGPD compliance assinado pelo menos em template? (Auditoria W27 tem base) | Security (Caio) | T-14 | SIM — beta pública tem que estar coberta |
| **D6** | **Quem assume office hours se PM sair?** Plano de backup R4 | Founder | T-7 | SIM — risco de single point of failure |
| **D7** | **Investimento em ads?** v1 diz NÃO (orgânico). v2 mantém? | Founder | T-14 | NÃO — pode adiar |
| **D8** | **Critério final de "abertura pública"** — go/no-go Day 30 com quais thresholds? (proposta aqui: §2.2 H1+H3 E §4 thresholds §7) | Founder + PM | T-7 | SIM — sem critério claro, decisão vira opinião |

> **Owner da decisão:** **Founder (Gabriel)** na maioria. PM é co-decisor em D4 e D8. Founder tem veto em qualquer uma.

---

## 11. Limitações & honestidade

> **Seção obrigatória.** O usuário pediu honestidade sobre limitações. Listo abaixo.

### 11.1 O que ESTE documento NÃO resolve

- ❌ **Não é plano de marketing operacional** — copy de emails/posts já está em `LAUNCH-COMMUNICATIONS-W23.md` (não precisa duplicar)
- ❌ **Não é runbook de incidentes** — perf/crash/moderação têm gatilhos mas sem playbook técnico detalhado (referência: §6.2 R5/R6/R7 → `/runbooks/*.md`)
- ❌ **Não é plano de press release Week 11** — fora de escopo Wave 32
- ❌ **Não é design system audit** — designer (Lina) tem Wave separada pra isso
- ❌ **Não é pricing model completo** — D4 é decisão pendente

### 11.2 Dados que NÃO foram validados empiricamente

> **Cuidado com os targets de §4.** Eles são **aspiracionais** baseados em (a) benchmarks externos conhecidos (Phiture, Amplitude, Zhihu) e (b) premissa de outperform por white-glove + comunidade pequena. **Eles NÃO foram validados para esta base de 50 usuários específica.**

> **Risco real:** targets de retenção podem estar otimistas em 10-20%. Se D7 ficar em 40-50% (e não 60-70%), **ainda é vitória** dado benchmark de 11-13%, mas a v2 vai parecer "fracasso" se lido cegamente.

> **Recomendação ao operador:** ao final do Day 30, comparar com:
> - benchmark cross-industry (D7 ≥ 11% é vitória)
> - benchmark top 25% (D7 ≥ 7% é o limite inferior — Amplitude)
> - outperform esperado por white-glove (D7 ≥ 40% é "razoável")
> - target v2 (D7 ≥ 60% é "aspiracional")

> Se D7 ≥ 40%, **você está batendo mercado**. Não confunda "não bateu target" com "fracasso".

### 11.3 Riscos que este plano NÃO endereça

- **Risco zero de AI hallucination** — mitigado por R5 mas **não eliminável**. Cite sempre, mesmo com prompt duro.
- **Risco zero de comportamento tóxico** — mitigado por R2 mas **não eliminável**. Cultura forte é a única defesa real; código é secundário.
- **Risco de "tudo funcionar" e ainda assim o produto morrer** — existe. PMF real exige iteração longa. Esta beta valida **apenas** H1+H2+H3, não a tese completa.

### 11.4 Premissas que PODEM estar erradas

| Premissa | Se errada, o que acontece? | Como descobrir cedo |
|---|---|---|
| "White-glove intensive é melhor que self-serve" | Wave 1 com 1-on-1 sai igual Wave 3 sem — significa que white-glove não é o diferencial | Comparar Wave 1 vs Wave 3 retention D7 |
| "Comunidade pequena aguenta cold start com 30-50 posts de seed" | Feed fica vazio mesmo com seed — significa que volume não é só seed | DAU/MAU < 25% no Sprint 1 |
| "Akasha IA citando fontes é o diferencial vs Character.AI" | Users preferem IA conversacional sem citar | Survey pergunta direta sobre expectativa de citação |
| "Mobile-first é o uso primário" | Users abrem só no desktop | PostHog device split |
| "Curadores convidados não levam 1 mês pra calibrar" | Curadores discordam entre si sobre limites da IA | Mínimo 1 conflito sobre resposta da IA no Sprint 1 |

### 11.5 O que falta fazer (work items órfãos)

- [ ] **Atualizar `BETA-LAUNCH-PLAYBOOK.md` v1** com link pra este doc v2 (não substituir; trata-se como "delta")
- [ ] **Criar `/runbooks/incident.md`** com checklist R5/R6/R7 (bloqueante pra Sprint 0)
- [ ] **Criar `/runbooks/crisis.md`** com protocolo CVV 188 + 988 (bloqueante pra Sprint 0)
- [ ] **Criar `dashboards/beta-v2.md`** no Notion/PostHog com todos os KPIs §4 em um lugar
- [ ] **Definir `Linear` ou equivalente** pra triage do `/feedback` (se ainda não existe, avaliar)
- [ ] **Briefing dos 3 curadores** — escopo escrito + NDA (D2)
- [ ] **Press release Week 11 draft** (NÃO Wave 32, mas saber que existe)

---

## 12. Anexos e referências

### Documentos internos consumidos

| Doc | Função | Onde estava a info |
|---|---|---|
| `docs/BETA-LAUNCH-PLAYBOOK.md` v1.0 | Plano original 60d | §0-§8 inteiros (especialmente §2 seleção, §4 métricas, §6 riscos, §7 timeline) |
| `docs/LAUNCH-COMMUNICATIONS-W23.md` | Email warmup, social posts, press kit | §3 emails, §4 convite, §5 social, §6 press kit |
| `docs/STAKEHOLDER-COMMUNICATION-W23.md` | Comunicação com beta users | (não lido nesta revisão; cross-ref) |
| `docs/MARKET-VALIDATION.md` | Validação de mercado + benchmarks | §1.1 mercado global, §1.2 players, §2.2 PNPIC, §3 subreddits, §9 validação empírica |
| `docs/COMMUNITY-ENGAGEMENT-W30.md` | Estratégia de comunidade | (referenciado indiretamente pelos KPIs B1+B2+B6) |
| `src/app/validacao/page.tsx` | Waitlist atual | Confirmado que variante A ainda serve |

### Documentos relacionados (não duplicados aqui)

| Doc | Função |
|---|---|
| `BRAND-VOICE-W15.md` | Tom de voz oficial |
| `EMAIL-TEMPLATES-W20.md` | Templates transacionais |
| `CONVERSION-FUNNEL-W20.md` | Funil de aquisição |
| `VISION-2027-W15.md` | Visão macro |
| `PUBLIC-FAQ.md` | FAQ público (20 perguntas) |
| `00_README.md` | Índice geral da documentação |
| Wave 27 audit trail (W27-SECURITY-AUDIT.md) | LGPD compliance base |
| Wave 30 strategy docs | Akasha personality, marketplace payments |

### Benchmarks externos citados em §4

| Fonte | Métrica citada |
|---|---|
| [Phiture](https://phiture.com/mobilegrowthstack/managing-retention-rate-benchmarks-and-expectations/) | D1=25-26%, D7=11-13%, D30=5-7% cross-industry |
| [Amplitude](https://amplitude.com/blog/7-percent-retention-rule) | D7 ≥ 7% = top 25% (regra 7%) |
| [Sendbird](https://sendbird.com/blog/app-retention-broken-down-by-industry) | Apps de shopping: D7~10.7%, D30~5.6% |
| [Apple Developer](https://developer.apple.com/help/app-store-connect/reference/performance-metrics/) | Definição oficial de retention rate |
| [Zhihu — DAU/MAU](https://www.zhihu.com/question/20429832/answer/899169290) | Comunidade ~0.20, conteúdo ~0.35-0.40, social ~0.77 |

### Frameworks utilizados

- **AARRR (Pirate Metrics)** — Acquisition, Activation, Retention, Referral, Revenue. Categorização dos KPIs.
- **RICE Scoring** — para priorização de features no Sprint 4 (Reach × Impact × Confidence / Effort).
- **Cohort Analysis** — para §7.1 análise de retenção.
- **Pre-mortem** — para §7.6 antecipação de fracasso.
- **North Star Metric** — para definir o "1 número que importa" (proposta: DAU/MAU entre os 50).

### Wave 32 — Coordinator + Ravena (QA) review

> **Notas da Ravena (QA) sobre o plano:**

| Aspecto | Avaliação | Notas |
|---|---|---|
| **Clareza de thresholds** | 🟢 | Cada contingência tem número + ação + decisão esperada |
| **Testabilidade** | 🟢 | Todos KPIs têm fonte de dados e cadência clara |
| **Operacionalidade** | 🟡 | Falta referenciar runbooks específicos (R5/R6/R7) — §11.5 lista work item |
| **Cobertura de risco cultural** | 🟢 | R7 crise espiritual explicitamente listado, runbook referenciado |
| **Cobertura de risco LGPD** | 🟡 | Depende de W27 audit trail — não revalidado nesta wave |
| **Realismo de targets** | 🟡 | Aspiracional com benchmark claro; §11.2 alerta pra ótimismo |
| **SLA de feedback** | 🟢 | 24h explícito, mecanismo documentado em §5.3 |
| **Mecanismo de decisão** | 🟢 | 5 gatilhos + pre-mortem é overkill benéfico |
| **Resource allocation** | 🟢 | 80/10/10 + budget breakdown é defensável |
| **Lista de decisões pendentes** | 🟢 | 8 decisões com dono + prazo + blocker-status |

> **Verdict QA:** plano **operacional e defensável**, com gaps conscientes (runbooks + pricing + LGPD revalidação) explicitamente listados em §11.5 e §10. Não bloqueia execução — bloqueia **execução sem(owner clarificar D1/D2/D6 antes do T-14).

---

## Próximos passos (propostos por Wave 32)

1. **Owner (Gabriel) revisa §10 e responde D1-D8** até final do dia.
2. **PM (Tomás) cria `dashboards/beta-v2.md`** linkando os 18 KPIs §4.
3. **PM + Coder criam `/runbooks/incident.md` e `/runbooks/crisis.md`** (work item §11.5 — bloqueante Sprint 0).
4. **Designer (Lina) atualiza `/validacao`** com as 4 seções do Sprint 0.
5. **Founder convoca curadores** (D2) até T-21.
6. **PM agenda Email warmup #1 no Resend** pra T-30.
7. **Próxima wave (W33+):** features priorizadas pelo Day 30 feedback loop.

---

> **Última atualização:** 2026-06-30 · Wave 32 — STRATEGIC PLAN 8/8
> Mantido por Tomás (PM) + Ravena (QA) · Próxima revisão: após Day 30 da beta (~2026-07-30)
