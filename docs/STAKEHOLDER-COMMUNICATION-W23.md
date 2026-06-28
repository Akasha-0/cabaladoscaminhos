# 🤝 Plano de Comunicação com Stakeholders — Akasha Portal
### Wave 23 · Trilha 5/5 (PM + Communication Strategist)

> **Versão:** 1.0 | **Data:** 2026-06-28
> **Owner:** PM (Tomás) — co-autoria implícita com Lina (Brand Voice) e Security (crisis plan)
> **Status:** Documento operacional · Pronto para execução no Wave 24+
> **Audiência:** Owner, time de agents, futuros beta users, parceiros, mídia
> **Linha-base:** `VISION-2027-W15.md` §1.3 (princípios), `BRAND-VOICE-W15.md`, `BETA-LAUNCH-PLAYBOOK.md`, commit `67676d6f` (LGPD Wave 11), commit `946b9011` (Wave 10 pivot)

---

## 📑 Sumário

0. [Por que este documento existe](#0-por-que-este-documento-existe)
1. [Mapa de stakeholders](#1-mapa-de-stakeholders)
2. [Mensagens-chave (5)](#2-mensagens-chave-5)
3. [Cadência de comunicação](#3-cadência-de-comunicação)
4. [Templates reutilizáveis](#4-templates-reutilizáveis)
5. [Plano de crise](#5-plano-de-crise)
6. [Métricas de saúde da comunicação](#6-métricas-de-saúde-da-comunicação)
7. [Glossário & princípios de redação](#7-glossário--princípios-de-redação)
8. [Roadmap de execução](#8-roadmap-de-execução)

---

## 0. Por que este documento existe

**Problema:** Wave 11–21 produziu muito (segurança, IA, PWA, acessibilidade, beta) — mas **pouco foi comunicado fora do time**. Resultado:

- 50 candidatos em waitlist sem update há 30+ dias
- Parceiros espirituais (curadores de tradição) não sabem o status
- Comunidade tech/designer não enxerga o progresso
- Em crise, não há protocolo de resposta

**Princípio-guia (do VISION §1.3):** cada mensagem externa precisa respeitar **5 valores simultâneos** — acolhedor + curioso + respeitoso + claro + não-dogmático. Nunca comunicar como SaaS de growth-hacking.

**Definição de sucesso:** daqui 90 dias, cada stakeholder sabe (1) o que é o Akasha Portal, (2) o que mudou desde o último contato, (3) por que isso importa pra ele/ela — em menos de 2 minutos de leitura.

---

## 1. Mapa de stakeholders

### 1.1 Os 7 stakeholders primários

| # | Stakeholder | Quem são | Tamanho atual | Canal preferido | Frequência |
|---|---|---|---|---|---|
| 1 | **Candidatos em waitlist** | Interessados no pré-lançamento que se inscreveram via `/validacao` | ~50 pessoas | Email pessoal (1:1) | Quinzenal (T-30, T-21, T-7, T+0) |
| 2 | **Beta users** | 50 primeiros selecionados por diversidade de tradição | 50 (meta W16) | Email + WhatsApp community + in-app | Semanal (digest) + imediato (incidentes) |
| 3 | **Comunidade espiritual (curadores)** | Sacerdotes, médiuns, rabinos, pajés, mestres — fontes vivas das tradições | ~15 contatos diretos (rede do operador) | Email + 1-on-1 presencial/online | Mensal + sob demanda |
| 4 | **Time interno (agents)** | Owner + Designer + Coder + Curator + QA + Security + Performance + General + PM | 9 papéis (1 owner + 8 agents) | Notion/Slack interno + deliverable docs | Daily standup + weekly retro |
| 5 | **Público tech** | Devs, designers, founders, IA-curious | ~500 seguidores Instagram + LinkedIn do owner + newsletter tech BR | Blog + newsletter + Twitter/X + LinkedIn | Mensal (post longo) + semanal (micro-thread) |
| 6 | **Mídia especializada** | Jornalistas de espiritualidade, tech, intersection (ex: MIT Tech Review BR, Portal Yoga, Medium BR) | ~10 contatos mapeados | Press kit (`/press/akasha-portal.zip`) + email + entrevistas | Trimestral + release-driven |
| 7 | **Investidores / parceiros institucionais** | Family offices, fundos de impacto, universidades, ONGs de saúde mental | 0 formal hoje · 5-10 prospectados | Deck + 1-on-1 + relatório trimestral | Trimestral |

### 1.2 O que cada stakeholder precisa saber

#### 1) Candidatos em waitlist
- **O quê:** status do beta, quando serão convidados, como se preparar
- **Quando:** T-30 (verdade), T-21 (detalhes), T-7 (aviso final), T+0 (convite)
- **Como:** email 1:1 (não template genérico — coerente com white-glove do Beta Playbook §1.1)
- **Tom:** honesto, transparente, sem hype

#### 2) Beta users
- **O quê:** o que mudou no produto, o que vem na próxima sprint, bugs conhecidos, decisões de roadmap que afetam eles
- **Quando:** digest semanal (sexta 17h), incidente imediato, milestone mensal
- **Como:** email digest + post in-app no `/comunidade` + WhatsApp community (read-only do operador)
- **Tom:** transparente ("não fizemos isso porque…"), convidativo ("como você testaria?")

#### 3) Comunidade espiritual (curadores)
- **O quê:** como suas tradições estão representadas, decisões editoriais, respeito às fontes
- **Quando:** mensal (resumo do que foi curado) + sob demanda (quando nova tradição entra)
- **Como:** email pessoal + 1-on-1 online (30min) trimestral
- **Tom:** reverente, humilde, transparente sobre limitações

#### 4) Time interno (agents)
- **O quê:** blockers, decisões abertas, próximas waves, health-check
- **Quando:** daily standup (10min, escrito em `.mavis/standup/YYYY-MM-DD.md`) + weekly retro (sexta)
- **Como:** Notion/Slack + deliverable docs versionadas
- **Tom:** direto, objetivo, sem ceremony

#### 5) Público tech
- **O quê:** bastidores técnicos, decisões de arquitetura, dilemas éticos do produto
- **Quando:** mensal (post longo no blog) + semanal (micro-thread Twitter/LinkedIn)
- **Como:** blog próprio + cross-post em dev.to, Hashnode, LinkedIn
- **Tom:** curioso, humilde, sem inflar ("achamos que…", "ainda não sabemos…")

#### 6) Mídia especializada
- **O quê:** milestones (beta launch, 1º aniversário, parceria com tradição X), visão estratégica
- **Quando:** trimestral (release de press) + ad-hoc (oportunidade de matéria)
- **Como:** press kit + pitch email + disponibilidade para entrevista em <48h
- **Tom:** respeitoso, acessível, sem jargão técnico desnecessário

#### 7) Investidores / parceiros
- **O quê:** tração, métricas de uso, decisões de governança, ask (se houver)
- **Quando:** trimestral (relatório) + anual (deck atualizado)
- **Como:** PDF + call 1h + Q&A por email
- **Tom:** profissional, objetivo, com números honestos (inclusive os negativos)

### 1.3 Stakeholders secundários (a mapear no Wave 24)

| Stakeholder | Por que importa | Próximo passo |
|---|---|---|
| **Profissionais de saúde mental** | VISION §1.3: "não substitui profissional". Parcerias com psicólogos integrativos ampliam base | Mapear 5 contatos via rede do operador |
| **Comunidade acadêmica** | Papers de espiritualidade + IA precisam de revisão por pares | Convidar 2 pesquisadores como advisors |
| **Comunidade open source** | Stack é Next.js + Prisma — contribuição externa possível | Criar `CONTRIBUTING.md` no Wave 25 |
| **Famílias dos beta users** | White-glove = alguns vão contar pra família | FAQ pública "É seguro pro meu filho/parente?" |
| **Moderadores futuros** | Quando comunidade passar de 100, precisa de moderação humana distribuída | Selecionar 3 moderadores entre os 50 beta users |

---

## 2. Mensagens-chave (5)

> Cada mensagem é um **núcleo narrativo** que reaparece em todos os canais, com adaptação de tom.

### Mensagem 1 — "Comunidade, não cockpit"
> **Contexto:** Wave 10 pivotou de "ferramenta 1-para-1 do operador" para "comunidade + IA tradutora". Quem está na waitlist desde Q1 não entende por que mudou.

**Frase canônica:**
> *"Akasha Portal não é um cockpit oracular onde você consome leituras — é uma comunidade onde praticantes de qualquer tradição se encontram com curiosidade, respeito e clareza. A IA é tradutora entre mundos, não prescritora de caminhos."*

**Quando usar:** qualquer apresentação inicial (landing, email de boas-vindas, entrevista, primeira página de qualquer doc público).

**Onde aparece:**
- Email #1 waitlist (T-30)
- `/sobre` no app
- Manifesto no blog
- Press kit `README.md`

---

### Mensagem 2 — "Akasha IA nunca prescreve"
> **Contexto:** Diferencial ético vs Character.AI, Replika, chatbots genéricos de "orientação espiritual". As 8 regras éticas (VISION §9 + AI-PROMPT-base.md) blindam isso.

**Frase canônica:**
> *"Akasha IA recomenda, pergunta, contextualiza — mas nunca prescreve. Sempre lembra que é uma ferramenta de exploração, não uma autoridade. Se algo soa como prescrição, é falha — reporte."*

**Quando usar:** toda comunicação que toque o uso da IA (release notes de features de IA, onboarding, resposta a crítica de "IA que se passa por guru").

**Onde aparece:**
- Onboarding in-app (modal obrigatório na primeira conversa com Akasha)
- Footer do chat IA ("Lembrete: esta conversa é exploratória. Nada aqui substitui orientação de um profissional de saúde ou líder espiritual da tua tradição.")
- AI-PROMPT-base.md (header)
- Crisis plan §5.4 (resposta a "IA deu conselho perigoso")

---

### Mensagem 3 — "Universalista, não proselitista"
> **Contexto:** 12+ tradições representadas (Candomblé, Umbanda, Ifá, Cabala, Astrologia, Tantra, Budismo, Islam, Cristianismo, Espiritismo, Hinduísmo, Xamanismo). Crítica esperada: "mas então você está diluindo tudo".

**Frase canônica:**
> *"Akasha Portal não diz que 'todos os caminhos levam ao topo da mesma montanha'. Diz que cada caminho tem sua própria montanha, sua própria bússola, seus próprios guias — e que conversar entre eles sem hierarquia é parte do trabalho."*

**Quando usar:** email de boas-vindas, entrevistas, resposta a crítica de "relativismo", defesa editorial.

**Onde aparece:**
- VISION §1 (universalismo)
- BRAND-VOICE-W15.md §3 (Akasha NÃO é pregador)
- Mensagem de moderação quando alguém tentar proselitismo na comunidade

---

### Mensagem 4 — "LGPD completo desde o dia 1"
> **Contexto:** Commit `67676d6f` (Wave 11) fechou o ciclo LGPD completo — privacy by design, audit log, rate limit por user, direito ao esquecimento implementado. Diferencial competitivo real (maioria dos concorrentes espiritualidade tech ignora LGPD).

**Frase canônica:**
> *"Seus dados são seus. A gente não vende, não compartilha, não minera pra ads. Você pode pedir exportação completa ou exclusão total a qualquer momento — e a gente cumpre em até 15 dias."*

**Quando usar:** confiança em público tech, resposta a jornalista, FAQ.

**Onde aparece:**
- `/privacidade` (página dedicada)
- Footer do site
- Press kit (seção "privacy by design")
- Email de boas-vindas (bloco curto "Seus dados")

---

### Mensagem 5 — "Beta privado com 50 vagas"
> **Contexto:** Wave 16 (BETA-LAUNCH-PLAYBOOK.md). Escassez é **operacional** (50 cabe no white-glove), não performática. Crítica esperada: "por que não abre pra todo mundo?".

**Frase canônica:**
> *"A beta é com 50 pessoas porque é o que cabe num cuidado real. A gente prefere 50 experiências profundas a 5.000 rasas. Depois da beta (T+90), abrimos em ondas — sempre com curadoria."*

**Quando usar:** email de waitlist, defesa em entrevistas, conversa com investidores.

**Onde aparece:**
- Email #1, #2, #3 waitlist
- Landing `/beta`
- Post de lançamento

---

## 3. Cadência de comunicação

### 3.1 Visão geral

```
┌──────────────┬──────────────┬─────────────┬──────────────┬──────────────┐
│   DIÁRIO     │   SEMANAL    │  QUINZENAL  │    MENSAL    │  TRIMESTRAL  │
├──────────────┼──────────────┼─────────────┼──────────────┼──────────────┤
│ Time interno │ Time interno │ Waitlist    │ Beta users   │ Mídia        │
│ standup 10m  │ retro 30m    │ (3 emails)  │ digest       │ especializada│
│              │              │             │              │              │
│              │              │ Beta users  │ Tech blog    │ Investidores │
│              │              │ (digest)    │ post longo   │ relatório    │
│              │              │             │              │              │
│              │              │ Tech micro- │ Curadores    │ Press kit    │
│              │              │ thread      │ espiritual   │ release      │
└──────────────┴──────────────┴─────────────┴──────────────┴──────────────┘
```

### 3.2 Detalhamento por canal

#### Daily standup interno (time)
- **Quando:** toda manhã, 9h30 BRT
- **Quem:** owner + agents ativos no dia
- **Onde:** thread Slack/Notion + `docs/.standup/YYYY-MM-DD.md`
- **Formato:** 3 bullets por pessoa
  - O que entreguei ontem
  - O que vou entregar hoje
  - Blockers
- **Duração:** escrito, assíncrono — **não tem call**. (Convenção herdada dos waves 1-22.)

#### Weekly retro interna
- **Quando:** sexta, 16h BRT
- **Quem:** owner + todos os agents que rodaram na semana
- **Onde:** `.mavis/retros/YYYY-WNN.md` + thread Slack
- **Formato:**
  - 3 wins da semana
  - 3 blockers não resolvidos
  - 1 decisão aberta que precisa do owner
  - Métricas de saúde (WAC, retention, bugs críticos)

#### Email quinzenal waitlist
- **Quando:** terça-feira quinzenal, 10h BRT
- **Quem:** owner (escrita 1:1, não template — coerente com Beta Playbook §1.1)
- **Formato:** 300-500 palavras, 1 CTA
- **Assuntos candidatos:**
  - "Por que só 50 pessoas vão entrar primeiro" (T-30)
  - "Como vai funcionar a beta — em detalhes" (T-21)
  - "5 dias pra abrir a primeira onda" (T-7)
  - "A primeira onda abriu — e o que aprendemos nos primeiros 7 dias" (T+7)

#### Digest semanal beta users
- **Quando:** sexta, 17h BRT
- **Quem:** PM (Tomás)
- **Formato:**
  - 1 parágrafo: o que mudou no produto
  - 1 parágrafo: o que vem na próxima sprint
  - 1 parágrafo: bug conhecido + workaround
  - 1 pergunta: "como você testaria X?"
- **Onde:** email + post fixado em `/comunidade`

#### Post mensal no blog (público tech)
- **Quando:** primeiro sábado do mês, 9h
- **Quem:** owner (ghostwriter se necessário) + Coder co-autoria técnica
- **Formato:** 1500-2500 palavras, técnico-fundamentado
- **Tópicos candidatos:**
  - "Por que a Akasha IA cita papers de neurociência ao lado de Odus de Ifá" (Mês 1)
  - "Como implementamos LGPD completo em 4 sprints" (Mês 2)
  - "Os 8 dilemas éticos que toda IA espiritual precisa responder" (Mês 3)
- **Cross-post:** dev.to, Hashnode, LinkedIn long-form

#### Micro-thread semanal (público tech)
- **Quando:** quarta-feira, 14h
- **Formato:** 5-8 tweets/posts LinkedIn
- **Tom:** provocação conceitual, sem venda (espelha Beta Playbook §1.2)

#### Resumo mensal curadores espirituais
- **Quando:** último dia do mês
- **Quem:** Curator (Iyá) + owner
- **Formato:** email curto + opcional 1-on-1 de 30min
- **Conteúdo:** quais tradições foram curadas, decisões editoriais, agradecimentos

#### Trimestral: mídia especializada
- **Quando:** início de cada trimestre (jul, out, jan, abr)
- **Quem:** PM + owner
- **Formato:** press release curto (1 página) + atualização do press kit + oferta de entrevista
- **Distribuição:** email direto para ~10 jornalistas mapeados

#### Trimestral: investidores / parceiros
- **Quando:** 2 semanas após fechamento do trimestre
- **Quem:** owner
- **Formato:** PDF de 5-8 páginas
- **Conteúdo:**
  - Métricas do trimestre (WAC, retention, NPS, beta health)
  - O que foi entregue vs roadmap
  - Marcos próximos
  - Ask (se houver) — sempre opcional

### 3.3 Regra de ouro: nunca comunicar sem motivo

> **Não há comunicação só "pra dizer que existe".** Cada email, post, thread ou call tem que ter um **motivo concreto**: lançamento, bug que afetou usuário, milestone, decisão importante.

Se não tem motivo → não comunica. Silêncio > barulho.

---

## 4. Templates reutilizáveis

> 4 templates cobrem 90% dos cenários. Cada um tem estrutura fixa + slots variáveis. Tom sempre alinhado com `BRAND-VOICE-W15.md`.

### 4.1 Release notes (pós-deploy em produção)

**Já existe template em `BETA-LAUNCH-PLAYBOOK.md` §3. Estrutura replicável:**

```markdown
# Release [data] — [nome curto]

## 🎯 O que mudou (para você)
- **[Feature 1]** — 1 frase explicando o benefício concreto
- **[Feature 2]** — ...
- **[Melhoria invisível]** — segurança, perf, infra (1 linha cada)

## 🐛 O que consertamos
- [Bug 1] — descrição curta + quem foi afetado
- [Bug 2] — ...

## ⚠️ O que você precisa fazer (se aplicável)
- Ação manual (re-login, reclear cache)
- Mudança de comportamento esperada

## 🔮 O que vem na próxima sprint
- Preview de 1-2 features em desenvolvimento

## 🙏 Crédito
- Beta users que reportaram (opt-in)
- Papers / fontes que fundamentaram mudanças
```

**Tom:** transparente, específico, sem inflar impacto. Se é bugfix, diz "bugfix". Se é feature pequena, diz "pequena mas útil".

---

### 4.2 Incident communication (resposta a problema)

**Estrutura de 4 fases, em ≤ 24h + 72h:**

#### Fase 1 — Acknowledgment (em ≤ 24h do incidente)
```markdown
**Assunto:** [⚠️ Status] Investigando [problema resumido]

Pessoas da comunidade,

Estamos investigando [problema]. Identificamos que [fato confirmado].
[Número aproximado de pessoas afetadas, se soubermos].

Não vimos evidência de [risco maior: vazamento de dados, dano irreparável].
Atualização completa em [horário]. Se você foi afetado, [ação imediata].

— [Nome], [papel]
```

#### Fase 2 — Diagnóstico (em 24-72h)
```markdown
**Assunto:** [Status] O que aconteceu com [problema]

Resumo executivo:
- **O que:** [descrição técnica clara]
- **Quando:** [período exato, fuso horário]
- **Quem foi afetado:** [nº e perfil]
- **Causa raiz:** [explicação sem jargão]
- **O que já fizemos:** [ação concreta]
- **O que ainda vamos fazer:** [próximos passos com prazo]
- **Como você pode verificar se foi afetado:** [link ou instrução]

Pedimos desculpas. Estamos aprendendo com isso.
```

#### Fase 3 — Resolução (em ≤ 7 dias)
```markdown
**Assunto:** [✅ Resolvido] [Problema] — lições aprendidas

- **Status atual:** resolvido em [data/hora]
- **Postmortem completo:** [link para doc interno]
- **Mudanças implementadas:**
  1. [prevenção 1]
  2. [prevenção 2]
  3. [monitoramento novo]
- **Compromisso público:** [o que NÃO vai acontecer de novo]

Agradecemos a [quem reportou / ajudou].
```

#### Fase 4 — Postmortem público (em ≤ 30 dias)
Doc interno + opcional post público "Como evitamos que [problema] aconteça de novo".

**Tom:** accountable, sem defensividade, sem minimizar.

---

### 4.3 Feature launch announcement

```markdown
# ✨ [Nome da feature] está no ar

## O que é
[1-2 frases em linguagem humana, sem jargão técnico]

## Por que construímos
[Contexto do problema / demanda da comunidade / tese de UX]

## Como usar
[Passo-a-passo numerado ou 1 print/gif]

## O que **NÃO** é
[Limites explícitos — sempre incluir pra evitar expectativas erradas]

## Fundamentação
[1-2 papers, fontes de tradição, decisões de design linkadas]

## Feedback
[Como reportar — email, in-app, formulário]
```

**Tom:** curioso, humilde ("testamos, mas pode ter falhas"), convidativo ("conta como foi").

---

### 4.4 Community milestone celebration

```markdown
# 🎉 [Março] — [descrição do milestone]

## O número
[Nº específico, sem inflar]

## As pessoas por trás
[Créditos: beta users, curadores, contributors, advisors]

## O que aprendemos
[2-3 insights do processo]

## O que vem a seguir
[1-2 parágrafos do roadmap próximo]

## Agradecimento
[Pessoas nomeadas, com opt-in]
```

**Tom:** generoso, sem auto-celebração excessiva, com crédito explícito.

---

## 5. Plano de crise

### 5.1 Os 4 tipos de crise previstos

| Tipo | Probabilidade | Severidade | Exemplo concreto |
|---|---|---|---|
| **A) Security breach** (vazamento de dados) | Média | Alta | Banco de dados exposto, key commitida, ataque à API |
| **B) Conteúdo tóxico na comunidade** | Média | Média | Assédio entre membros, discurso de ódio, proselitismo agressivo |
| **C) IA causando dano** | Baixa-Média | **Crítica** | Akasha IA dá conselho médico perigoso, recomendação espiritual ofensiva, alucinação prejudicial |
| **D) Press / lawsuit / regulatório** | Baixa | Alta | Matéria negativa viral, processo judicial, notificação da ANPD |

### 5.2 Tempos de resposta (SLA)

| Fase | Tipo A (security) | Tipo B (tóxico) | Tipo C (IA dano) | Tipo D (press) |
|---|---|---|---|---|
| **Acknowledgment interno** | ≤ 1h | ≤ 4h | ≤ 1h | ≤ 2h |
| **Acknowledgment público** | ≤ 24h | ≤ 24h | ≤ 24h | ≤ 24h |
| **Plano de ação público** | ≤ 72h | ≤ 72h | ≤ 72h | ≤ 72h |
| **Resolução total** | ≤ 7 dias | ≤ 7 dias | ≤ 7 dias | ≤ 30 dias |
| **Postmortem público** | ≤ 30 dias | ≤ 30 dias | ≤ 30 dias | ≤ 30 dias |

### 5.3 Channels por tipo

| Tipo | Email | Status page | In-app | WhatsApp | Mídia direta | Press release |
|---|---|---|---|---|---|---|
| A | ✅ Todos | ✅ | ✅ | ✅ | — | ⚠️ Se confirmado |
| B | ⚠️ Afetados | — | ✅ Comunidade | ✅ | — | — |
| C | ✅ Todos | ✅ | ✅ | ✅ | — | ⚠️ Se escalou |
| D | ✅ Todos | ✅ | ✅ | ✅ | ✅ Jornalistas | ✅ |

### 5.4 Tom em crise

**Os 4 princípios inegociáveis:**

1. **Transparência primeiro** — admitir o que aconteceu sem minimizar ("houve um bug que expôs X" em vez de "tivemos um pequeno incidente")
2. **Accountability explícita** — "a gente errou" em vez de "o sistema falhou" (sistema não erra sozinho; pessoas que construíram sim)
3. **Action-oriented** — sempre acompanhado de "estamos fazendo X, Y, Z com prazo"
4. **Humano, não corporativo** — voz de pessoa real (owner assina), não "a equipe"

**Frases a evitar:**
- ❌ "Sentimos muito por qualquer inconveniente que isso possa ter causado" (genérico, defensivo)
- ❌ "Infelizmente, fatores fora do nosso controle…" (externalizar)
- ❌ "Estamos confiantes de que…" (minimizar)

**Frases a preferir:**
- ✅ "A gente errou. Estamos consertando. Timeline abaixo."
- ✅ "Ainda não temos todos os dados, mas o que sabemos até agora é…"
- ✅ "Ação concreta: estamos fazendo X até [data]. Depois disso, vamos reportar."

### 5.5 Escalation tree

```
Incidente detectado
    ↓
Owner (decide se é crise real em ≤ 30min)
    ↓
   Sim                                  Não
    ↓                                    ↓
Notifica PM + Security              Tratar como bug normal
    ↓
Define tipo (A/B/C/D)
    ↓
Aciona canal correspondente
    ↓
Acknowledgment em ≤ 24h
    ↓
Plano em ≤ 72h
    ↓
Resolução em ≤ 7 dias (A/B/C) ou ≤ 30 dias (D)
    ↓
Postmortem público em ≤ 30 dias
```

### 5.6 Casos especiais

**Akasha IA em alucinação perigosa (Tipo C):**
1. Desliga feature imediatamente
2. Notifica usuários afetados em ≤ 1h
3. Postmortem + novo guardrail antes de religar
4. Atualiza `AI-PROMPT-base.md` com a regra nova
5. Crédito público ao beta user que reportou (se opt-in)

**Vazamento de dados confirmado (Tipo A):**
1. Aciona protocolo LGPD interno
2. Notifica ANPD em ≤ 72h (obrigação legal)
3. Notifica titulares em ≤ 72h
4. Oferece monitoramento de crédito (se aplicável)
5. Assume custo de qualquer serviço de proteção aos afetados

---

## 6. Métricas de saúde da comunicação

### 6.1 KPIs por stakeholder

| Stakeholder | KPI | Meta | Como medir |
|---|---|---|---|
| Waitlist | Open rate do email | ≥ 60% | Mailgun / Resend |
| Waitlist | Conversion pra beta | ≥ 70% aceitam convite | Tracking manual |
| Beta users | Atividade semanal (WAC/WAU) | ≥ 80% dos 50 | In-app analytics |
| Beta users | NPS ou proxy ("recomendaria?") | ≥ 50 | Survey quinzenal |
| Curadores | Resposta ao resumo mensal | ≥ 50% respondem | Email tracking |
| Time interno | Standup completion | 100% dos dias úteis | `.mavis/standup/` |
| Tech blog | Reads / share | ≥ 500 reads por post | Analytics blog |
| Tech micro-thread | Impressions / engagement | Crescimento 10% mês | Native analytics |
| Mídia | Resposta ao press release | ≥ 30% respondem | Email tracking |
| Investidores | Aberturas do relatório | ≥ 80% abrem | PDF tracking |

### 6.2 Health check mensal (1 página)

Todo início de mês, owner publica `docs/COMMUNICATION-HEALTH-YYYY-MM.md` com:

- Tabela de KPIs vs meta
- 1 win + 1 perda do mês anterior
- 1 ajuste na cadência ou tom
- 3 experimentos pra testar no próximo mês

---

## 7. Glossário & princípios de redação

### 7.1 Termos canônicos (usar sempre)

| Em vez de | Preferir | Por quê |
|---|---|---|
| "Usuário" | **"Pessoa da comunidade"** ou **"beta user"** (em contexto específico) | Não reduz a consumidor |
| "AI oracle" / "IA que orienta" | **"Akasha IA — tradutora entre mundos"** | Preserva mensagem 2 (não prescreve) |
| "Spiritual chatbot" | **"companion de exploração"** ou **"IA tradutora"** | Evita categoria genérica |
| "Growth hack" | **"crescimento orgânico + curadoria"** | Coerente com escassez honesta |
| "Launch" | **"abertura"** ou **"beta começa"** | Menos performático |
| "Engagement" | **"participação"** ou **"presença"** | Menos corporativo |
| "Target audience" | **"pessoas com quem queremos caminhar"** | Não objetifica |

### 7.2 Princípios de redação (do Brand Voice §2)

1. **Ler em voz alta** — se soa palestra de retiro, reescrever
2. **Testar o "você pertence aqui"** — toda comunicação deve abrir espaço, não fechar
3. **Sem hype** — "estamos animados" ≤ 1x por mês; "isso pode mudar tudo" → nunca
4. **Citar fontes** — papers, tradições, advisors; humildade epistêmica
5. **Reconhecer limites** — "ainda não sabemos", "estamos aprendendo" > fingir domínio
6. **Crédito a quem contribuiu** — beta users, curadores, advisors sempre nomeados (opt-in)
7. **PT-BR primeiro** — todas as comunicações oficiais nascem em PT-BR; EN é tradução (não o contrário)
8. **Mobile-first** — emails ≤ 500 palavras; posts ≤ 280 chars quando thread; parágrafos curtos

### 7.3 Checklist antes de enviar qualquer comunicação externa

- [ ] Li em voz alta e soa como conversa de café (não palestra)?
- [ ] Tem motivo concreto pra ser enviada agora (não é "pra dizer que existimos")?
- [ ] Respeita as 5 mensagens-chave (não contradiz nenhuma)?
- [ ] Nomeia pessoas que contribuíram (com opt-in)?
- [ ] Reconhece limites se houver?
- [ ] Está em PT-BR com qualidade (não tradução)?
- [ ] Tem 1 CTA claro (ou explicitamente nenhum, se for informacional)?
- [ ] Não menciona prazo sem ter承诺 real de cumprir?
- [ ] Foi revisado por outra pessoa (owner + 1 agent)?

---

## 8. Roadmap de execução

### Wave 23 (agora) ✅
- Este documento (`docs/STAKEHOLDER-COMMUNICATION-W23.md`)
- Commit `docs(comm): stakeholder communication plan W23`
- 5 mensagens-chave definidas
- Cadência + templates + crisis plan

### Wave 24 (próxima)
- **Tarefa:** operacionalizar cadência
  - Criar `docs/.standup/` (template)
  - Criar `docs/.retros/` (template)
  - Criar `docs/email-templates/` com 4 templates preenchidos (waitlist, beta digest, release notes, incident)
  - Definir ferramentas: Resend (email), Notion (interno), status page (Beterstack ou similar)
  - 1 release notes real publicada após próximo deploy
- **Quem:** PM (Tomás) + Coder (infra email) + Designer (templates visuais)

### Wave 25
- **Tarefa:** primeiro relatório trimestral (jul/2026)
- Quem: owner
- Entregável: `docs/INVESTOR-REPORT-Q3-2026.md`

### Wave 26+
- Manutenção contínua conforme cadência
- Ajustes baseados em health check mensal
- Expansão para stakeholders secundários (§1.3)

---

## 9. Apêndices

### A. Referências cruzadas

| Documento | Como se relaciona |
|---|---|
| `VISION-2027-W15.md` §1.3 | Fonte dos princípios inegociáveis (mensagens 2 e 3) |
| `BRAND-VOICE-W15.md` | Tom e personalidade (base do §7 deste doc) |
| `BETA-LAUNCH-PLAYBOOK.md` §1.1 | Cadência waitlist (3 emails) |
| `BETA-LAUNCH-PLAYBOOK.md` §3 | Release notes template (base do §4.1) |
| `AI-PROMPT-base.md` | Mensagem 2 (IA nunca prescreve) — implementação |
| Commit `67676d6f` (Wave 11) | Mensagem 4 (LGPD completo) |
| Commit `946b9011` (Wave 10) | Mensagem 1 (pivot para comunidade) |
| `SECURITY-W11.md` (a criar) | Crisis plan Tipo A |
| `MODERATION-W16.md` (a criar) | Crisis plan Tipo B |

### B. Change log

| Data | Versão | Mudança | Autor |
|---|---|---|---|
| 2026-06-28 | 1.0 | Criação inicial — Wave 23 Trilha 5/5 | PM (Tomás) |

---

> **Fim do documento.**
> Próxima leitura recomendada: `BRAND-VOICE-W15.md` (se for redigir comunicação) ou `SECURITY-W11.md` (se for responder a crise Tipo A).