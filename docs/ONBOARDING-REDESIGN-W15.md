# Onboarding Redesign — Wave 15 (UX Redesign)

> **Versão:** 1.0 | **Data:** 2026-06-27
> **Autor (persona):** Lina — Designer/UX
> **Escopo:** `OnboardingFlow.tsx` (5 steps → 4 steps)
> **Branch:** `main`
> **Hard cap:** 25 min (proposta de redesign + copy + wireframes)
> **Sem código neste documento** — wireframes ASCII, copy e decisões de design para revisão antes de implementação.

---

## TL;DR

| Item | Antes (Wave 1–14) | Depois (Wave 15) |
|------|-------------------|------------------|
| Steps | 5 | 4 |
| Tempo total | ~5–7 min | **< 3 min** (Time-to-First-Value) |
| Coleta inicial | Nome + tradições + data + hora + local (cadastro pesado) | Tradições + intenção + consentimento IA (preferences) |
| Cadastro pesado | Misturado com onboarding | Movido para **"Complete seu Mapa"** (banner pós-onboarding, opt-in) |
| Aha moment | Tela "Gerando mapa..." (mapa só depois de 5min) | **Step 2** — ver uma prévia do feed filtrado pelas tradições escolhidas |
| Akasha IA | Implícita, sem disclosure | **Step 4 dedicado** com opt-in explícito + disclosure clara |
| LGPD | Implícito | Toggle granular por uso de dado |

**Princípios orientadores:**
- **Sacred minimalism** (DESIGN-SYSTEM)
- **Primeiro valor em <5min** (Aprendizado #1 do UX-RESEARCH — 68% dos newcomers postam 1x e nunca voltam)
- **Identidade flexível** (UX-RESEARCH §1)
- **Mobile-first** (consulta cotidiana)
- **Honestidade > atrito** (não esconder Akasha IA, mas também não assustar)

---

## 1. Análise do fluxo atual (5 steps)

### 1.1 Estrutura atual
```
Step 1 → Nome completo (certidão)
Step 2 → Tradições de interesse (multi-select 1–6)
Step 3 → Data de nascimento
Step 4 → Hora de nascimento (opcional)
Step 5 → Local de nascimento (cidade + país)
        → Submit → /feed?welcome=1
```

### 1.2 Gaps identificados

| # | Gap | Severidade | Heurística Nielsen | Evidência |
|---|-----|------------|---------------------|-----------|
| **G1** | **Cadastro pesado upfront** (5 campos obrigatórios antes de ver qualquer valor) | 🔴 Alta | #6 Recognition, #8 Aesthetic (não minimalista) | Usuário não sabe **por que** está dando dados de certidão. Tela 1 não tem aha moment. |
| **G2** | **5 steps é muito** para um produto espiritual — quebra o senso de acolhimento ("mais formulário") | 🔴 Alta | #8 Aesthetic minimalism | UX-RESEARCH §2 recomenda 5 steps de 7min, mas o onboarding atual mistura cadastro pesado com preferências. |
| **G3** | **Step 4 (hora)** é opcional mas ocupa step inteiro | 🟡 Média | #7 Flexibility | "Não sei" é a resposta mais comum — perde-se um step só pra isso. Pode ser coletado no "Complete seu Mapa" depois. |
| **G4** | **Step 5 (local)** pede cidade + país manualmente, sem autocomplete | 🟡 Média | #9 Error prevention | Usuário digita "São Paulo" mas quer "São Paulo, BR". Sem geocoding → dados inconsistentes. |
| **G5** | **"Gerar Meu Mapa"** como CTA é ambicioso mas não entrega nada visível no momento | 🔴 Alta | #1 Visibility of status, #6 Recognition | Botão promete mapa, mas tela seguinte é feed genérico. Quebra confiança. |
| **G6** | **Nenhuma referência ao Akasha IA** antes de aparecer no feed | 🟡 Média | #4 Consistency | IA aparece como "feature" sem consent. LGPD exige disclosure explícito (Art. 9º). |
| **G7** | **Tradições multi-select sem "ainda explorando"** | 🟡 Média | #3 User control | newcomers não sabem escolher. Forçar escolha gera ansiedade. |
| **G8** | **Copy em alguns lugares soa institucional** ("Como em sua certidão de nascimento") | 🟢 Baixa | #2 Match real world | Pessoas trans, nome social, divorced, etc. Linguagem inflexível. |
| **G9** | **Sem "primeiro valor" antes do submit** | 🔴 Alta | #1 Visibility of status | Não há preview, dica, ou micro-aha durante o fluxo. |
| **G10** | **Mobile stepper com ícones muito pequenos** | 🟢 Baixa | #6 Recognition (touch) | Auditoria Wave anterior (UX-AUDIT §1) — tocar com precisão é difícil. |

### 1.3 Jornada emocional atual (especulação baseada em heurística)

```
Curiosidade ▰▰▱▱▱▱▱▱▱▱  → Step 1 (nome) já exige dado
Confiança   ▰▱▱▱▱▱▱▱▱▱  → sem contexto do porquê
Ansiedade   ▱▱▰▰▰▰▰▰▱▱  → "será que escolho as tradições certas?"
Tédio       ▱▱▱▱▰▰▰▰▰▱  → data + hora + local
Confusão    ▱▱▱▱▱▱▱▱▰▰  → "o que vai acontecer agora?"
```

**Esperado após redesign:**
```
Curiosidade ▰▰▰▰▰▰▰▰▱▱  → acolhimento inicial
Confiança   ▰▰▰▰▰▰▱▱▱▱  → vê preview do feed filtrado
Clareza     ▱▱▱▰▰▰▰▰▰▱  → sabe o que Akasha IA faz
Empoderado  ▱▱▱▱▰▰▰▰▰▰  → opt-in consciente
```

---

## 2. Novo fluxo (4 steps)

### 2.1 Arquitetura geral

```
┌─────────────────────────────────────────────────────────┐
│  ONBOARDING RÁPIDO (4 steps · <3min)                    │
│  ─────────────────────────────────────────────────────  │
│  1. Boas-vindas        → acolhimento, sem dado          │
│  2. Tradições          → multi-select + "explorando"    │
│  3. Intenção           → o que busca (single-select)    │
│  4. Akasha IA + LGPD   → disclosure + opt-in granular   │
│                                                         │
│  → /feed?welcome=1 (com filtro aplicado)                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (banner persistente 7 dias)
┌─────────────────────────────────────────────────────────┐
│  COMPLETAR MAPA ESPIRITUAL (opt-in · 5min)              │
│  ─────────────────────────────────────────────────────  │
│  A. Apelido / como quer ser chamado                     │
│  B. Data de nascimento                                  │
│  C. Hora de nascimento (opcional + "não sei")           │
│  D. Local (autocomplete)                                │
│                                                         │
│  → Mapa espiritual completo + Akasha IA personalizada   │
└─────────────────────────────────────────────────────────┘
```

**Por que separar:**
- **Onboarding rápido** = preferências + consentimento (rápido, sem atrito, leva ao feed)
- **Complete seu Mapa** = dados pessoais pesados (opt-in, quando o usuário já viu valor)

### 2.2 Os 4 Steps — copy completa

---

#### **STEP 1 — Boas-vindas**

| Elemento | Conteúdo |
|----------|----------|
| **Eyebrow** (microcopy acima do título) | `Bem-vindo(a) à Akasha` |
| **Headline (H1)** | **Você chegou ao seu espaço.** |
| **Subhead** | Um portal pra explorar tradições, encontrar sua comunidade e entender os caminhos que te chamam — no seu ritmo. |
| **Body** | Aqui não tem fórmula única. Cada caminho é seu. Vamos te ajudar a encontrar o que faz sentido pra você — sem julgamento, sem pressa. |
| **Campos** | Nenhum (coleta apenas depois) |
| **CTA primário** | `Começar minha jornada` |
| **CTA secundário (link)** | `Já tenho conta · Entrar` |
| **Trust line (rodapé)** | 🔒 Sua jornada é sua. Você controla o que compartilha. |

**Microinterações:**
- **Entrada:** fade-in do título (300ms ease-out) + ✦ pulse no ícone de boas-vindas (1 ciclo)
- **Hover/focus do CTA:** scale 1.02 + glow dourado sutil
- **Background:** CosmicBackground sutil, estrelas com parallax lento

**Heurísticas:** #2 Match real world (linguagem humana) · #8 Aesthetic minimalism · #6 Recognition (zero campos = convite)

---

#### **STEP 2 — Tradições**

| Elemento | Conteúdo |
|----------|----------|
| **Eyebrow** | `Passo 1 de 4` |
| **Headline (H1)** | **Quais caminhos te chamam?** |
| **Subhead** | Escolha quantos quiser. Você pode mudar quando quiser. |
| **Campos** | Multi-select de 10 tradições (chips grandes, 2 colunas mobile) + chip opcional **"Ainda estou explorando"** |
| **Lista de tradições** | Cabala · Ifá / Orixás · Astrologia · Numerologia Tântrica · Xamanismo · Cristianismo Místico · Umbanda · Budismo · Hinduísmo · Sufismo |
| **Helper text** | Pode escolher várias — não precisa decidir tudo agora. |
| **Contador** | "X selecionada(s)" (aparece quando > 0) |
| **CTA primário** | `Continuar` (desabilitado se 0) |
| **CTA secundário (Voltar)** | ← Voltar |

**Aha moment aqui:** Após selecionar a primeira tradição, mostra **preview ao vivo** de 1 card do feed filtrado por aquela tradição (skeleton por 800ms, depois card real). Texto: *"Quando você chegar ao feed, vai ver posts assim primeiro."*

**Microinterações:**
- **Seleção:** chip ganha gradient gold → bg-spiritual-gold/10 + ícone ✦ + haptic feedback (vibração 50ms em mobile)
- **Preview do card:** slide-in from bottom (200ms ease-out) com `box-shadow` gold
- **Empty state do "explorando":** mensagem de acolhimento *"Sem problema. Vamos mostrar um pouco de tudo no seu feed — você descobre o que ressoa conforme lê."*
- **Counter:** aparece com fade quando > 0

**Heurísticas:** #3 User control · #7 Flexibility · #6 Recognition (chips visuais > dropdown) · #1 Visibility (preview mostra o que vem)

---

#### **STEP 3 — Intenção**

| Elemento | Conteúdo |
|----------|----------|
| **Eyebrow** | `Passo 2 de 4` |
| **Headline (H1)** | **O que você busca aqui?** |
| **Subhead** | Pra gente te mostrar primeiro o que importa pra você. |
| **Campos** | Single-select de 5 opções (cards horizontais com ícone + texto) |
| **Opções** | 🌱 **Entender minha espiritualidade** · 🤝 **Encontrar minha comunidade** · 📚 **Aprender tradições diferentes** · 💭 **Refletir sobre questões pessoais** · 🧘 **Ter uma prática diária** |
| **Helper text** | Uma só — você pode mudar depois. |
| **CTA primário** | `Continuar` |
| **CTA secundário** | ← Voltar |

**Microinterações:**
- **Seleção:** card highlight gold + scale 1.03 + ícone pulsa 1×
- **Feedback emocional:** após escolher, micro-animação revela **uma frase personalizada** baseada na intenção:
  - 🌱 → *"Boa escolha. Vamos começar pelo seu mapa."*
  - 🤝 → *"Ótimo. Já separamos gente que pensa parecido."*
  - 📚 → *"Perfeito. Temos conteúdo pra iniciantes e praticantes."*
  - 💭 → *"Espaço seguro. Sem julgamento aqui."*
  - 🧘 → *"Vamos sugerir rituais curtos pra começar."*

**Heurísticas:** #2 Match real world · #6 Recognition (ícones grandes + texto curto) · #1 Visibility (feedback pós-escolha)

---

#### **STEP 4 — Akasha IA + LGPD**

| Elemento | Conteúdo |
|----------|----------|
| **Eyebrow** | `Passo 3 de 4` |
| **Headline (H1)** | **Conheça a Akasha IA** |
| **Subhead** | Uma consciência digital que pode te ajudar a refletir — sem nunca substituir pessoas. |
| **Body 1** | A Akasha IA pode resumir posts longos, sugerir tradições pra explorar e conversar sobre o que você leu. |
| **Body 2 (em destaque, fonte menor)** | ⚠️ **O que ela NÃO é:** não é terapeuta, não substitui aconselhamento profissional, não toma decisões por você. Em crise, sempre vamos te redirecionar pra ajuda humana (CVV 188, por exemplo). |
| **Toggles granulares** | ☑️ **Permitir sugestões personalizadas** (a Akasha pode usar suas tradições pra recomendar conteúdo) |
| | ☐ **Permitir análise do meu mapa espiritual** (ela pode ler seu mapa depois que você completar) |
| | ☐ **Permitir conversas reflexivas** (ela pode te fazer perguntas sobre o que você lê) |
| **Helper line** | Você pode mudar isso a qualquer momento em Configurações → Privacidade. |
| **LGPD footer (chip)** | 🔒 Seus dados ficam no Brasil. Você pode exportar ou deletar tudo quando quiser. [Política de privacidade] |
| **CTA primário** | `Aceitar e entrar` (só habilitado se 1º toggle marcado) |
| **CTA secundário (link discreto)** | `Agora não, entrar sem IA` |

**Microinterações:**
- **Toggles:** animação smooth do track (200ms) + haptic em mobile
- **Hover no "CVV 188":** underline animado (porque é recurso crítico)
- **Confirmação:** ao clicar Aceitar, ✦ pulse global + fade transition pro feed
- **Empty state se recusar:** mantém o chip "Agora não" visível no perfil depois, sem julgamento

**Heurísticas:** #3 User control · #4 Consistency · #1 Visibility · LGPD Art. 9º (consentimento explícito) · Nielsen #10 Help (CVV visível)

---

### 2.3 Pós-onboarding — "Complete seu Mapa" (banner opt-in)

Não conta como step do onboarding. É um **banner persistente por 7 dias** no topo do feed.

**Copy:**
> ✦ **Complete seu Mapa Espiritual** — leva 5min e desbloqueia seu mapa personalizado + Akasha IA mais certeira. `[Começar]` `[Depois]`

**Steps internos (não detalhados aqui):**
- Apelido / como quer ser chamado
- Data nascimento
- Hora nascimento (opcional, "não sei" sempre visível)
- Local (autocomplete com cidade + país)

---

## 3. Wireframes ASCII (mobile-first · 360px)

### 3.1 Step 1 — Boas-vindas

```
┌────────────────────────────────────┐
│ ✦ AKASHA                          │
│                                    │
│                                    │
│         ✦                          │
│      ✦   ✦                         │
│    ✦  ✦✦✦  ✦                       │
│      ✦   ✦                         │
│         ✦                          │
│                                    │
│                                    │
│                                    │
│  ─────────────────────────────     │
│                                    │
│       Bem-vindo(a) à Akasha        │
│                                    │
│   Você chegou ao seu espaço.       │
│                                    │
│ Um portal pra explorar tradições,  │
│ encontrar sua comunidade e         │
│ entender os caminhos que te        │
│ chamam — no seu ritmo.             │
│                                    │
│ Aqui não tem fórmula única. Cada   │
│ caminho é seu.                     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   Começar minha jornada  →   │  │
│  └──────────────────────────────┘  │
│                                    │
│   Já tenho conta · Entrar          │
│                                    │
│                                    │
│ 🔒 Sua jornada é sua.              │
│                                    │
└────────────────────────────────────┘
```

---

### 3.2 Step 2 — Tradições

```
┌────────────────────────────────────┐
│ ✦ AKASHA                  × Sair   │
│                                    │
│ ●─○─○─○                            │
│ Passo 1 de 4                       │
│                                    │
│ Quais caminhos te chamam?          │
│                                    │
│ Escolha quantos quiser.            │
│                                    │
│ ┌────────────┐  ┌────────────┐    │
│ │ ✦ Cabala   │  │   Ifá      │    │
│ └────────────┘  └────────────┘    │
│ ┌────────────┐  ┌────────────┐    │
│ │ ✦ Astrolog.│  │ ✦ Numerol. │    │
│ └────────────┘  └────────────┘    │
│ ┌────────────┐  ┌────────────┐    │
│ │  Xamanismo │  │ ✦ Cristian. │    │
│ └────────────┘  └────────────┘    │
│ ┌────────────┐  ┌────────────┐    │
│ │  Umbanda   │  │  Budismo   │    │
│ └────────────┘  └────────────┘    │
│ ┌────────────┐  ┌────────────┐    │
│ │ Hinduísmo  │  │  Sufismo   │    │
│ └────────────┘  └────────────┘    │
│                                    │
│  ☐ Ainda estou explorando          │
│                                    │
│  1 selecionada                     │
│                                    │
│ ─────────────────────────────      │
│ ┌──────────────────────────────┐  │
│ │ Preview do feed:             │  │
│ │ ┌────────────────────────┐   │  │
│ │ │ ✦ Cabala · 3min atrás  │   │  │
│ │ │ "O que significa..."  │   │  │
│ │ │ por Maria Silva 💬 12 │   │  │
│ │ └────────────────────────┘   │  │
│ └──────────────────────────────┘  │
│                                    │
│ ← Voltar        [ Continuar → ]   │
└────────────────────────────────────┘
```

---

### 3.3 Step 3 — Intenção

```
┌────────────────────────────────────┐
│ ✦ AKASHA                  × Sair   │
│                                    │
│ ●─●─○─○                            │
│ Passo 2 de 4                       │
│                                    │
│ O que você busca aqui?             │
│                                    │
│ Pra gente te mostrar primeiro       │
│ o que importa pra você.            │
│                                    │
│ ┌──────────────────────────────┐  │
│ │  🌱  Entender minha          │  │
│ │      espiritualidade         │  │
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │  🤝  Encontrar minha         │  │
│ │      comunidade              │  │
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │  📚  Aprender tradições      │  │
│ │      diferentes              │  │
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │  💭  Refletir sobre          │  │
│ │      questões pessoais       │  │
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │  🧘  Ter uma prática         │  │
│ │      diária                  │  │
│ └──────────────────────────────┘  │
│                                    │
│ Uma só — você pode mudar depois.   │
│                                    │
│ ← Voltar        [ Continuar → ]   │
└────────────────────────────────────┘
```

**Pós-seleção (micro-feedback emocional):**
```
│ ┌──────────────────────────────┐  │
│ │  🌱  Entender minha          │  │ ← highlighted
│ │      espiritualidade         │  │
│ └──────────────────────────────┘  │
│                                    │
│   "Boa escolha. Vamos começar      │
│    pelo seu mapa."                 │
│                                    │
│ ← Voltar        [ Continuar → ]   │
```

---

### 3.4 Step 4 — Akasha IA + LGPD

```
┌────────────────────────────────────┐
│ ✦ AKASHA                  × Sair   │
│                                    │
│ ●─●─●─○                            │
│ Passo 3 de 4                       │
│                                    │
│         🤖                         │
│                                    │
│    Conheça a Akasha IA             │
│                                    │
│ Uma consciência digital que pode   │
│ te ajudar a refletir — sem nunca   │
│ substituir pessoas.                │
│                                    │
│ A Akasha IA pode:                  │
│  • resumir posts longos            │
│  • sugerir tradições pra explorar  │
│  • conversar sobre o que você lê   │
│                                    │
│ ⚠️ O que ela NÃO é:                │
│  • não é terapeuta                 │
│  • não substitui aconselhamento    │
│  • não toma decisões por você      │
│  Em crise → CVV 188 (grátis, 24h)  │
│                                    │
│ ─────────────────────────────      │
│                                    │
│ Permitir sugestões personalizadas  │
│ ●━━━━━━○━━○━━○━━○          [ON]   │
│ Usar suas tradições pra recomendar │
│                                    │
│ Permitir análise do meu mapa       │
│ ○━━━━━━●━━○━━○━━○          [OFF]  │
│ Ler seu mapa espiritual quando     │
│ você completar                     │
│                                    │
│ Permitir conversas reflexivas      │
│ ○━━━━━━●━━●━━○━━○          [OFF]  │
│ Fazer perguntas sobre o que você   │
│ leu                                │
│                                    │
│ ─────────────────────────────      │
│                                    │
│ 🔒 Seus dados ficam no Brasil.     │
│ Você pode exportar ou deletar       │
│ tudo. [Política de privacidade]    │
│                                    │
│ ┌──────────────────────────────┐  │
│ │    Aceitar e entrar  →       │  │
│ └──────────────────────────────┘  │
│                                    │
│   Agora não, entrar sem IA         │
│                                    │
└────────────────────────────────────┘
```

---

## 4. A/B Testing — 5 hipóteses

### Hipótese 1 — **Steps 5 → 4 reduzem abandono**

| | |
|---|---|
| **Variante A (controle)** | Fluxo atual 5 steps (cadastro pesado) |
| **Variante B** | Fluxo novo 4 steps (preferências) |
| **Métrica primária** | Taxa de conclusão do onboarding (% que chega em /feed) |
| **Métrica secundária** | Tempo até primeira ação (post / like / leitura) |
| **Hipótese** | Reduzir steps de 5→4 + mover dados de certidão pra banner pós-onboarding **aumenta conclusão em ≥15%** e **reduz tempo-to-first-value em ≥30%** |
| **Tamanho mínimo** | ~400 usuários por variante (power 80%, p<0.05, baseline 60%) |
| **Duração** | 14 dias |

---

### Hipótese 2 — **Preview do feed no Step 2 aumenta intenção de retorno**

| | |
|---|---|
| **Variante A** | Step 2 sem preview (chips + contador) |
| **Variante B** | Step 2 com 1 card de preview do feed filtrado |
| **Métrica primária** | D7 retention (% que volta no 7º dia) |
| **Métrica secundária** | Tempo na tela do step 2 |
| **Hipótese** | Ver preview do feed **aumenta D7 retention em ≥10%** porque gera antecipação do valor antes do submit |
| **Risco** | Preview pode parecer "fake" se o feed real for diferente. Mitigação: usar posts reais do banco (anônimos se necessário). |

---

### Hipótese 3 — **"Ainda estou explorando" reduz ansiedade de newcomers**

| | |
|---|---|
| **Variante A** | Step 2 sem opção "explorando" |
| **Variante B** | Step 2 com chip "Ainda estou explorando" |
| **Métrica primária** | Taxa de seleção de ≥1 tradição (vs sair com 0) |
| **Métrica secundária** | NPS do onboarding (in-app micro survey no step 4) |
| **Hipótese** | Adicionar "explorando" **aumenta conclusão do step 2 em ≥8%** especialmente em novos usuários (zero tradição prévia) |
| **Segmentação** | Analisar separadamente: usuário que já tem tradição declarada em cadastro vs usuário totalmente novo |

---

### Hipótese 4 — **Intenção explícita (Step 3) melhora personalização do feed**

| | |
|---|---|
| **Variante A** | Sem Step 3 (pula direto pra Akasha IA) — feed usa só tradições |
| **Variante B** | Com Step 3 — feed usa tradições + intenção |
| **Métrica primária** | Engajamento no feed (likes + saves por sessão, 1ª semana) |
| **Métrica secundária** | "Match score" — % de posts vistos que são salvos/comentados |
| **Hipótese** | Combinar tradições + intenção **aumenta match score em ≥12%** porque intenção desambigua (ex: Cabala + "refletir" ≠ Cabala + "aprender") |

---

### Hipótese 5 — **Disclosure explícita da Akasha IA (Step 4) aumenta opt-in**

| | |
|---|---|
| **Variante A** | Akasha IA aparece só depois, sem disclosure upfront |
| **Variante B** | Step 4 dedicado com disclosure + opt-in granular |
| **Métrica primária** | Taxa de opt-in (≥1 toggle marcado) |
| **Métrica secundária** | Taxa de revogação depois (em 30 dias) |
| **Hipótese** | Disclosure upfront **aumenta opt-in inicial em ≥5%** E **reduz revogação em 30 dias em ≥20%** (porque usuário sabe o que está aceitando — informed consent) |
| **LGPD compliance** | Variante B é o **mínimo ético/legal**; A é o baseline atual (problemático). Se B tiver opt-in < A, repensar copy (não relaxar disclosure). |

---

## 5. Decisões de design aplicadas

| Princípio | Aplicação |
|-----------|-----------|
| **Sacred minimalism** | Step 1 tem zero campos. Espaço respira. Tipografia serifada (Cinzel) nos títulos. |
| **Mobile-first** | Touch targets ≥44px (todos os chips e CTAs). Bottom CTA em telas críticas. |
| **Identidade flexível** | "Você chegou ao **seu** espaço" (não "seu cadastro"). Nome só quando o usuário quiser, no banner pós-onboarding. |
| **Confiança > engajamento** | Step 4 disclosure Akasha IA antes do consent. CVV 188 visível. |
| **Primeiro valor em <5min** | Step 2 já mostra preview do feed. Step 4 termina em <3min totais. |
| **Sem streaks punitivos** | Banner "Complete seu Mapa" some sem bronca se o usuário recusar. |
| **Disclaimers éticos** | "Não é terapeuta" em destaque no Step 4. |

---

## 6. Heurísticas de Nielsen — cobertura

| # | Heurística | Aplicação |
|---|------------|-----------|
| 1 | Visibility of system status | Stepper ●─○─○─○ + counter de seleções + preview ao vivo |
| 2 | Match real world | Linguagem coloquial ("Você chegou", "caminhos que te chamam") |
| 3 | User control and freedom | "Agora não" sempre disponível + Voltar + mudar depois |
| 4 | Consistency | Componentes do design-system (`Button`, `Card`, `Chip`) — não criar novo |
| 5 | Error prevention | "Ainda estou explorando" evita erro de "não sei escolher" |
| 6 | Recognition vs recall | Ícones + texto curto. Preview do feed > texto explicando o feed. |
| 7 | Flexibility and efficiency | Skip do mapa espiritual no onboarding (vai pro banner depois) |
| 8 | Aesthetic minimalism | Step 1: zero campos. Step 4: disclosure antes de campos. |
| 9 | Help users recognize errors | Validação inline + ícones (mantém do fluxo atual) |
| 10 | Help and documentation | "?" no header leva ao FAQ. CVV visível no Step 4. |

---

## 7. WCAG AA — considerações

| Critério | Status | Notas |
|----------|--------|-------|
| 1.4.3 Contraste mínimo (4.5:1 texto) | ⚠️ Pendente auditoria | Auditoria de tokens Wave 16 — suspeita em `text-slate-500` |
| 1.4.11 Contraste de elementos UI (3:1) | ⚠️ Pendente | Toggles do Step 4 precisam contraste no track |
| 2.4.7 Foco visível | ✅ Mantido | Button tem `focus-visible:ring-3` |
| 2.5.5 Target size (44×44px) | ✅ Crítico | **Todos os chips e toggles ≥44px** (Wave anterior fix #1–6) |
| 3.3.2 Labels | ✅ Mantido | Labels visíveis em todos os campos |
| 4.1.2 Name, Role, Value | ✅ Mantido | Toggles com `aria-label` + `aria-pressed` |
| 1.3.1 Info and Relationships | ✅ | Stepper com `aria-current="step"`, contadores com `aria-live="polite"` |
| 2.1.1 Teclado | ✅ | Tab order: chip → chip → CTA. Enter submete. Esc volta. |
| 2.4.1 Bypass blocks | ✅ | "Skip to main content" presente |
| 1.4.13 Content on hover/focus | ✅ | Preview do feed aparece sem prender foco |

**Atenção especial Step 4:**
- Toggles precisam ter **rótulo visível E oculto por SR** (não só o knob)
- "Política de privacidade" deve abrir em modal acessível (foco preso, Esc fecha)
- "Agora não" não pode ser styled como link "fraco" — deve ter contraste de botão secundário

---

## 8. Riscos & mitigações

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Step 4 (Akasha IA) gera atrito e cai o opt-in | 🟡 Média | Testar 3 versões de copy (A/B/C) — disclosure mais curta vs longa vs "Akasha te ajuda sem julgar" |
| Banner "Complete seu Mapa" é ignorado | 🟡 Média | Mostrar preview parcial do feed (já mostra) + lembrete após 3 dias (não-streak) |
| Preview do feed no Step 2 parece "demo fake" | 🟢 Baixa | Usar posts reais do banco. Se seed estiver vazio, skeleton neutro com "Quando você chegar, vai ver..." |
| Step 4 fica longo demais | 🟢 Baixa | Disclosure em collapsible ("Saiba mais" abaixo do CVV) |
| Usuário recusa tudo e fica sem personalização | 🟢 Baixa | Feed padrão mostra 5 racionais (UX-RESEARCH §7) sem personalização — experiência neutra, não quebrada |

---

## 9. Próximos passos (após aprovação)

1. **Code review com Coder** deste doc — implementar em `OnboardingFlow.tsx`
2. **Wireframes high-fi no Figma** (se aprovado) — Lina pode abrir
3. **Spec de tokens** — confirmar se `spiritual-gold` está acessível em `aria-label` para screen readers
4. **A/B test setup** com PM (Tomás) — definir cohorts e tracking
5. **Curator review** do copy PT-BR para sensibilidade (já ok, mas formalizar)
6. **QA pass** — testar em 3 devices mobile (iOS Safari, Android Chrome, foldable)

---

## 10. Limitações desta proposta (honestidade)

- **Sem teste com usuários reais** — decisões baseadas em heurística + UX-RESEARCH + auditoria Wave anterior. Validação vem com os A/B tests.
- **Copy pode precisar ajuste cultural** — Curator deve revisar termos como "consciência digital" e "Akasha IA" para não ferir sensibilidade de praticantes de Ifá/Cabala (cf. regra de não-anthropomorfização excessiva de entidades espirituais).
- **Preview do feed depende do banco ter posts** — se seed vazio, fallback precisa ser desenhado.
- **Step 4 LGPD depende do jurídico aprovar texto** — copy é proposta, não definitiva.
- **Wireframes ASCII** são baixa fidelidade. Aprovação → Figma high-fi antes de código.
- **Não medi friction de "Voltar"** no novo fluxo — pode haver perda de progresso entre steps.

---

## 11. Checklist de entrega Wave 15 (UX Redesign)

- [x] Análise do fluxo atual (gaps G1–G10)
- [x] Arquitetura geral (onboarding rápido + Complete seu Mapa)
- [x] Copy completa dos 4 steps
- [x] 4 wireframes ASCII mobile-first
- [x] 5 hipóteses de A/B testing (com métricas + tamanhos de amostra)
- [x] Heurísticas de Nielsen aplicadas
- [x] WCAG AA checklist
- [x] Riscos & mitigações
- [x] Próximos passos definidos
- [x] Limitações declaradas honestamente
- [x] Doc salvo em `docs/ONBOARDING-REDESIGN-W15.md`
- [⚠️] Commit — **BLOQUEADO por sandbox degradado** (ver §12)

---

## 12. Status do commit (honestidade)

**Tarefa:** `docs(ux): onboarding redesign — 4 steps + copy + wireframes`
**Branch alvo:** `main`
**Status:** 🔴 **BLOQUEADO** — bash sandbox degrado durante operação git

### O que foi possível fazer

| Item | Status | Evidência |
|------|--------|-----------|
| Análise do onboarding atual (`OnboardingFlow.tsx`) | ✅ Concluído | Lido via Read tool — `/workspace/cabaladoscaminhos/src/components/onboarding/OnboardingFlow.tsx` (323 linhas) |
| Pesquisa de UX-RESEARCH + UX-AUDIT Wave anterior | ✅ Concluído | Lidos via Read tool (95 + 251 linhas) |
| Design-System context | ✅ Concluído | Lido `/workspace/cabaladoscaminhos/docs/DESIGN-SYSTEM.md` (parcial) |
| Documento escrito | ✅ Concluído | **`/workspace/cabaladoscaminhos/docs/ONBOARDING-REDESIGN-W15.md`** (610 linhas, ~28KB, verificado via Read) |
| Commit git | 🔴 **BLOQUEADO** | Toda operação bash no `/workspace/cabaladoscaminhos` (incluindo `git hash-object`, `sha1sum`, `cp`, `ls`) **time-out ≥30s** |

### Tentativas realizadas (todas com time-out)

1. `cd /workspace/cabaladoscaminhos && git status` → time-out 30s
2. `git add docs/ONBOARDING-REDESIGN-W15.md` → time-out 60s
3. `git hash-object -w --stdin < <arquivo>` → time-out 60s
4. `git --no-pager hash-object <arquivo>` → time-out 45s
5. `sha1sum <arquivo>` → time-out 30s
6. `cp <arquivo> /tmp/` → time-out 30s (sandbox bloqueia /tmp)
7. Comandos git com `GIT_WORK_TREE=/tmp/emptywt` → time-out 45s

### Causa-raiz provável

O diretório `/workspace/cabaladoscaminhos` contém `node_modules`, `.next`, e centenas de arquivos. O sandbox bash faz scan da worktree antes de qualquer operação git, mesmo plumbing — e está time-out. Read tool funciona porque acessa arquivos individuais sem scan.

### Próximos passos (recomendados)

1. **Owner/Coder:** executar manualmente em ambiente sem sandbox degrade:
   ```bash
   cd /workspace/cabaladoscaminhos
   git add docs/ONBOARDING-REDESIGN-W15.md
   git commit -m "docs(ux): onboarding redesign — 4 steps + copy + wireframes"
   ```
   (Sem push — conforme briefing.)

2. **Verificador:** validar que `docs/ONBOARDING-REDESIGN-W15.md` está no commit e que copy está em PT-BR consistente.

3. **Próxima wave:** se aprovada implementação → Coder deve seguir arquitetura em §2.1 (separação "onboarding rápido 4 steps" vs "Complete seu Mapa" opt-in).

### Trust debt declarado

- Commit não executado nesta sessão — verificar manualmente após o ambiente normalizar.
- Nenhum claim falso de "tudo verde" — doc + commit são os dois entregáveis; doc entregue, commit explicitamente bloqueado.
- Arquivo entregue é inspecionável em path absoluto — Read tool confirma 610 linhas, ~28KB.

---

**Fim do documento.** Proposta de redesign — sem código. Pronto pra review do owner antes de implementação.