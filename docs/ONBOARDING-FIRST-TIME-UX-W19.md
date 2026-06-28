# Onboarding First-Time UX — Auditoria Wave 19

> **Versão:** 1.0 | **Data:** 2026-06-27
> **Autor (persona):** Lina — Designer/UX
> **Escopo:** Auditoria end-to-end da jornada do first-time user — da chegada até o "aha moment"
> **Branch:** `main`
> **Hard cap:** 25 min
> **Sem código neste documento** — apenas auditoria + recomendações
> **Status:** 🔴 **CRÍTICO — redesign Wave 15 NÃO foi implementado em código**

---

## TL;DR

| Item | Estado atual (Wave 19) | Alvo (Wave 15 doc) |
|------|------------------------|--------------------|
| Steps do onboarding | **5** (cadastro pesado) | 4 (preferências) |
| Banner pós-onboarding | ❌ **Não existe** | "Complete seu Mapa" (7 dias) |
| Time-to-value | **~5–7min** sem ver valor | < 3min |
| Aha moment | ❌ **Nenhum preview** durante o fluxo | Step 2 (preview do feed filtrado) |
| LGPD | ⚠️ acceptTerms único | Toggles granulares |
| Email verify UX | ⚠️ **Não visível** no fluxo client | Required step |
| Welcome banner em `/feed` | ❌ **`?welcome=1` é ignorado** no código | Banner pós-onboarding |
| `/validacao` waitlist | ✅ Funcional | — |
| Analytics (Wave 18) | ✅ Catálogo pronto, ⚠️ **tracking não wireado** no OnboardingFlow | Disparar em cada step |

**Veredito:** A doc do Wave 15 (`docs/ONBOARDING-REDESIGN-W15.md`) está sólida e aprovada conceitualmente. **MAS NENHUMA das mudanças de UX chegou em código.** Estamos servindo a UX antiga (5 steps, sem preview, sem banner pós-onboarding, sem welcome banner no feed) enquanto o roadmap promete o novo.

---

## 1. Mapa do fluxo atual (as-is)

### 1.1 Rotas e componentes reais (verificados via Read tool)

```
Rota                  │ Componente                            │ Status
─────────────────────┼────────────────────────────────────────┼──────────────
/                     │ src/app/page.tsx                      │ ✅ Hero + 3 seções
/validacao            │ src/app/validacao/page.tsx            │ ✅ Waitlist form
/signup               │ src/app/(auth)/signup/page.tsx        │ ✅ Suspense + RegisterForm
                       │ src/components/auth/RegisterForm.tsx │ ✅ 5 campos
/login                │ src/app/(auth)/login/page.tsx         │ ✅ Suspense + LoginForm
                       │ src/components/auth/LoginForm.tsx    │ ✅ 2 campos + Google
/onboarding           │ src/app/onboarding/page.tsx           │ ✅ OnboardingFlow
                       │ src/components/onboarding/OnboardingFlow.tsx │ ⚠️ 5 STEPS (não 4)
/feed                 │ src/app/feed/page.tsx                │ ✅ 5 estados (loading/empty/error)
/feed?welcome=1       │ (nenhum banner pós-onboarding)        │ ❌ **query ignorada**
/library              │ (não auditado)                         │ —
/notifications        │ (não auditado)                         │ —
```

### 1.2 Jornada real — click-by-click

```
T0  / (Home)
    ↓ [click "Entrar na lista de espera"]
T1  /validacao (beta privado)
    ↓ [preencher email + submit]
T2  Mensagem "Obrigado! Em breve você receberá o convite."
    ↓ [recebe email — fluxo fora do escopo client]
T3  (DEPOIS) recebe email → clica link → /signup
    ↓ [preencher nome + email + senha + confirmar + aceitar termos]
T4  /onboarding?welcome (Step 1: Nome completo — "Como aparece no documento")
    ↓ [preencher + Continuar]
T5  (Step 2: Tradições — multi-select 1–6)
    ↓ [preencher + Continuar]
T6  (Step 3: Data de nascimento)
    ↓ [preencher + Continuar]
T7  (Step 4: Hora de nascimento — opcional)
    ↓ [preencher + Continuar]
T8  (Step 5: Local de nascimento — cidade + país)
    ↓ [preencher + "Gerar Meu Mapa"]
T9  /feed?welcome=1 (sem banner, sem filtro personalizado aplicado, mock data)
    ↓ [vê 3 posts mock genéricos]
```

### 1.3 Campos obrigatórios vs opcionais

| Tela | Campo | Obrigatório? | Validação |
|------|-------|--------------|-----------|
| `/validacao` | email | ✅ | email válido |
| `/signup` | fullName | ✅ | min 2 chars |
| `/signup` | email | ✅ | email válido |
| `/signup` | password | ✅ | min 8 chars |
| `/signup` | confirmPassword | ✅ | match |
| `/signup` | acceptTerms | ✅ | literal true |
| `/onboarding` Step 1 | fullName | ✅ | min 2 (REPETIDO do signup) |
| `/onboarding` Step 2 | traditions | ✅ | 1–6 selecionadas |
| `/onboarding` Step 3 | birthDate | ✅ | YYYY-MM-DD |
| `/onboarding` Step 4 | birthTime | ⚠️ opcional | HH:MM ou vazio |
| `/onboarding` Step 5 | birthPlace + birthCountry | ✅ | min 2 chars |

**Total de campos obrigatórios:** **12** (1 email + 5 signup + 4 onboarding obrigatórios + 2 local)
**Total de campos opcionais:** **1** (hora)

---

## 2. Time-to-Value — medição estimada

### 2.1 Linha do tempo realista

```
T0 ──── T+10s ──── T+30s ──── T+60s ──── T+180s ──── T+300s ──── T+420s
│         │          │          │           │            │            │
│  Vê home  Vê /valid Form   Submete     Email chega  Clica signup  Submit signup
│         ↓                                              ↓
│         waitlist OK                                     /onboarding
│                                                        ↓ (5 steps × ~45s = ~225s)
│                                                        T+645s
│                                                        ↓
│                                                        /feed (SEM personalização)
│                                                        ↓
│                                                        VÊ VALOR?
│                                                        ↓
│                                                        NÃO (mock genérico)
```

| Métrica | Valor |
|---------|-------|
| Steps totais até `/feed` | **8** (1 home + 1 validacao + 1 signup + 5 onboarding) |
| Tempo total estimado (mobile, conexao boa) | **~10–11min** |
| Tempo até "ver primeiro post relevante" | **NUNCA** (feed mock sem filtro) |
| Steps obrigatórios | **8** |
| Steps opcionais | **1** (Step 4 hora) |

### 2.2 Aha moment — onde acontece hoje?

| Momento | Há aha? | Por quê? |
|---------|---------|----------|
| T0–T2 (Home → waitlist) | ❌ | CTA é pra waitlist, não pra entrar |
| T3 (Email chega) | ❌ | Confirmação burocrática, não celebração |
| T4 (`/signup`) | ❌ | 5 campos, sem promessa de valor próximo |
| T5 (`/onboarding` Step 1) | ❌ | Já tem nome do signup, duplicado |
| T6 (Step 2 Tradições) | ⚠️ Fraco | Chips visuais bonitos, mas sem feedback de "isso vai te dar X" |
| T7–T9 (Step 3–5) | ❌ | Cadastro pesado, tédio crescente |
| T10 (`/feed?welcome=1`) | ❌ | **Banner pós-onboarding NÃO existe**; feed mock sem filtro |

**Diagnóstico:** o usuário **nunca tem um "aha moment"** no fluxo atual. O botão "Gerar Meu Mapa" promete um mapa, mas a tela seguinte é o feed genérico. Quebra de promessa (Nielsen #1 + #6).

---

## 3. Friction Points — onde o usuário desiste?

### 3.1 Drop-off map (especulação baseada em heurística)

```
100% ──┐ Home (vê valor rápido)
       │
 85% ──┤ /validacao (95% completam form simples)
       │
 70% ──┤ Email confirmado — espera 1-7 dias
       │
 55% ──┤ /signup (15% drop por fricção de senha + termos)
       │
 40% ──┤ /onboarding Step 1 — REPETIÇÃO de nome (fricção)
       │
 32% ──┤ Step 2 — "qual tradição escolher?" ansiedade
       │
 28% ──┤ Step 3 — Data de nascimento OK
       │
 26% ──┤ Step 4 — Hora (opcional, OK)
       │
 22% ──┤ Step 5 — Local manual (sem autocomplete, fricção)
       │
 18% ──┤ /feed SEM personalização → "isso não é pra mim"
       │
  8% ──┘ D7 retention (68% postam 1x e nunca voltam, per UX-RESEARCH §1)
```

### 3.2 Top 10 Friction Points

| # | Friction | Severidade | Nielsen | Evidência |
|---|----------|------------|---------|-----------|
| **F1** | **Step 1 do onboarding repete `fullName`** já coletado no signup | 🔴 Alta | #4 Consistency | `RegisterForm.tsx:62` + `OnboardingFlow.tsx:111` |
| **F2** | **Cadastro pesado (nome+data+hora+local)** antes de ver qualquer valor | 🔴 Alta | #6, #8 Aesthetic | OnboardingFlow tem 4 campos de certidão antes de ir ao feed |
| **F3** | **Sem preview do feed** durante onboarding | 🔴 Alta | #1 Visibility | Step 2 mostra chips mas não preview ao vivo |
| **F4** | **Sem opção "Ainda estou explorando"** em tradições | 🔴 Alta | #3 User control, #7 Flexibility | Step 2 só aceita 1–6 tradições, zero = bloqueado |
| **F5** | **Local manual sem autocomplete** (Step 5) | 🟡 Média | #9 Error prevention | "São Paulo" vs "São Paulo, BR" — dado inconsistente |
| **F6** | **"Gerar Meu Mapa" como CTA** promete mapa mas feed seguinte é genérico | 🔴 Alta | #1, #6 Recognition | Quebra de expectativa confirmada |
| **F7** | **`/feed?welcome=1` não mostra banner pós-onboarding** | 🔴 Alta | #1 Visibility | Query ignorada no `FeedPage` |
| **F8** | **LGPD via único checkbox** (não granular) | 🟡 Média | LGPD Art. 9º | `RegisterForm.tsx:251` — só "Li e aceito os termos" |
| **F9** | **Email verify UX não visível** no fluxo client | 🟡 Média | #1 Visibility | Fluxo Supabase existe mas sem tela client? |
| **F10** | **Sem exit/save progress** se usuário fecha no meio do onboarding | 🟡 Média | #3 User control | Volta do Step 4 pro Step 1, perde tudo |

### 3.3 LGPD — assustador ou natural?

**Estado atual:** `acceptTerms` único no `/signup`, link pra `/manifesto` e `/privacy`. Copy: *"Li e aceito os Termos de Uso e a Política de Privacidade"*. Sem disclosure de Akasha IA no signup.

**Diagnóstico:**
- 🟡 **Genérico, mas não assustador.** Usuário provavelmente aceita sem ler (padrão da indústria).
- 🔴 **NÃO cumpre LGPD Art. 9º** para consentimento granular (IA Akasha não é disclosed antes de ser usada).
- 🟢 **Não é um blocker** — copy pode ser melhorada, mas não gera drop significativo.

**Recomendação:** Mover disclosure da Akasha IA pra DENTRO do onboarding (Step 4 do redesign W15) com toggles granulares por uso de dado. **Crítico para evitar notificação ANPD.**

---

## 4. 3 Personas testando

### Persona 1 — Ana (35, mãe, busca autoconhecimento)

| Atributo | Detalhe |
|----------|---------|
| Background | Profissional liberal, 2 filhos, primeira crise espiritual aos 33 |
| Tradição | Nenhuma declarada,好奇心 por Cabala |
| Tech literacy | Média (celular Android, WhatsApp expert) |
| Tempo disponível | Noturno (crianças dormindo), 15min/dia |
| Medo principal | "App de previsão genérico, sem profundidade" |

**Teste:**

| Etapa | Resultado | Tempo | Nota emocional |
|-------|-----------|-------|----------------|
| Vê `/` | ✅ Sim | 5s | "Hmm, bonito, parece sério" |
| Clica "Entrar na lista de espera" | ✅ Sim | 3s | "Beta privado, 50 vagas — quero!" |
| `/validacao` → preenche email | ✅ Sim | 25s | "Simples, ok" |
| Aguarda email | ❌ **Desiste se > 48h** | — | "Já perdi o interesse" |
| Recebe email → `/signup` | ✅ Sim | 15s | "Bora" |
| Preenche signup (5 campos) | ⚠️ **Dúvida na senha** | 90s | "Confirmar senha é chato, mas ok" |
| Aceita termos sem ler | ✅ Sim | 2s | "Sempre clico aqui" |
| `/onboarding` Step 1 (nome — REPETIDO) | ❌ **Primeira fricção** | 8s | "Pera, já não preenchi isso?" |
| Step 2 (tradições) | ⚠️ **Ansiedade** | 45s | "Cabala me interessa, mas e Ifá? Não sei. Tantra? Vou colocar só Cabala." |
| Step 3 (data) | ✅ Sim | 15s | "ok" |
| Step 4 (hora) | ⚠️ **Não lembra** | 30s | "Vou chutar 12:00" |
| Step 5 (local) | ✅ Sim | 25s | "São Paulo, Brasil" |
| Submit → "Gerando mapa..." | ⚠️ **Esperança** | 3s | "Vai me dar insights!" |
| `/feed` aparece com 3 posts mock | ❌ **Decepção** | — | "Que mapa é esse? É só um feed normal. Saí." |

**Veredito Ana:** ❌ **Não vê valor.** Abandona em D3, não volta. Persona **CRÍTICA** — é o maior segmento (mulheres 30–45 buscando autoconhecimento).

---

### Persona 2 — Lúcia (50, mãe-de-santo, busca Cabala)

| Atributo | Detalhe |
|----------|---------|
| Background | Praticante de Candomblé há 20 anos, leitora de Eli Wiesel |
| Tradição | Candomblé + Ifá (quer entender Cabala) |
| Tech literacy | Média-alta (celular + tablet) |
| Tempo disponível | Manhã (após obrigações), 30min/dia |
| Medo principal | "App que mistura tudo e perde respeito pelas tradições" |

**Teste:**

| Etapa | Resultado | Tempo | Nota emocional |
|-------|-----------|-------|----------------|
| Vê `/` | ✅ Sim | 8s | "8 tradições representadas — bom sinal" |
| Lê "Sem fins lucrativos" | ✅ Sim | 3s | "Importante" |
| Clica waitlist | ✅ Sim | 5s | — |
| `/validacao` → preenche email | ✅ Sim | 30s | "Confio por causa do manifesto" |
| Recebe email → `/signup` | ✅ Sim | 20s | — |
| Preenche signup | ✅ Sim | 120s | "Tudo ok, sou detalhista com senha" |
| `/onboarding` Step 1 | ⚠️ **Pequena fricção** | 10s | "Por que pede nome de novo?" |
| Step 2 — escolhe Cabala + Ifá | ✅ Sim | 60s | "Aqui senti representadas" |
| Step 3 (data) | ✅ Sim | 20s | — |
| Step 4 (hora) | ✅ Sim, lembra | 25s | "14h30" |
| Step 5 (local) — Salvador, Brasil | ✅ Sim | 35s | "Sem autocomplete, mas ok" |
| Submit → `/feed` | ❌ **Decepção** | — | "Não vejo nada de Cabala nem Ifá no feed. Cadê a personalização?" |

**Veredito Lúcia:** ⚠️ **Vê valor parcial.** Onboarding OK, feed genérico. Persona **IMPORTANTE** — é a voz de credibilidade (se ela sair, signal ruim pra outras praticantes).

---

### Persona 3 — Carlos (28, dev, ateu curioso)

| Atributo | Detalhe |
|----------|---------|
| Background | Engenheiro de software, neurocientista amador |
| Tradição | Nenhuma, "espiritualidade é placebo" |
| Tech literacy | Alta (early adopter, conhece os truques) |
| Tempo disponível | Madrugada (insônia), 10min |
| Medo principal | "Vão tentar me converter" |

**Teste:**

| Etapa | Resultado | Tempo | Nota emocional |
|-------|-----------|-------|----------------|
| Vê `/` | ⚠️ Cético | 5s | "Bonito, mas 'consciência coletiva'? Hmm" |
| Lê "8 tradições representadas" | ✅ Sim | 2s | "Universalista, ok" |
| Clica waitlist | ✅ Sim | 5s | "Quero ver como é por dentro" |
| `/validacao` → preenche email | ✅ Sim | 15s | — |
| Recebe email → `/signup` | ✅ Sim | 8s | "Veloz" |
| Preenche signup (5 campos) | ✅ Sim | 60s | "Veloz, conheço o padrão" |
| Aceita termos | ✅ Sim | 1s | "Não li" |
| `/onboarding` Step 1 | ❌ **Fricção** | 5s | "De novo o nome? Code smell" |
| Step 2 — **trava** | ❌ **Não se identifica** | 90s+ | "Nenhuma tradição combina comigo. Saí daqui pra explorar, mas o app exige que eu escolha. Saí." |

**Veredito Carlos:** ❌ **Não completa onboarding.** É o **EIXO do funil** — newcomers sem tradição prévia. **PERDEMOS AQUELE QUE MAIS PRECISAMOS.**

**Insights Carlos:**
- Persona racional — valoriza evidência, copy técnica
- Se Step 2 tivesse "Ainda estou explorando", continuaria
- Step 4 do redesign (Akasha IA disclosure) seria bem-vindo — ele respeita transparência

---

## 5. Onboarding Analytics — estado + o que falta

### 5.1 O que já existe (Wave 18)

Catálogo pronto em `src/lib/analytics/events-catalog.ts`:

| Categoria | Eventos prontos |
|-----------|-----------------|
| AUTH (7) | SIGNUP, LOGIN, LOGOUT, PASSWORD_RESET_*, OAUTH_* |
| ONBOARDING (6) | STEP_VIEW, STEP_COMPLETE, TRADITION_SELECTED, SKIPPED, COMPLETED, ABANDONED |
| FEED (8) | VIEW, POST_CREATE/VIEW/LIKE/UNLIKE/SHARE, COMMENT_CREATE/LIKE |
| LIBRARY (4) | ARTICLE_VIEW, ARTICLE_SAVE, BOOKMARK_ADD/REMOVE |
| AKASHIC (4) | CHAT_START, MESSAGE_SENT, etc |

### 5.2 O que NÃO está wireado (gaps)

| Evento | Componente esperado | Status | Wave alvo |
|--------|---------------------|--------|-----------|
| `onboarding_step_viewed` | `OnboardingFlow.tsx` stepper | ❌ **Não disparado** | W19 implementation |
| `onboarding_step_completed` | `OnboardingFlow.tsx` goNext | ❌ **Não disparado** | W19 implementation |
| `onboarding_tradition_selected` | `OnboardingFlow.tsx` toggleTradition | ❌ **Não disparado** | W19 implementation |
| `onboarding_abandoned` | `OnboardingFlow.tsx` useEffect cleanup | ❌ **Não disparado** | W19 implementation |
| `onboarding_completed` | `OnboardingFlow.tsx` handleSubmit success | ❌ **Não disparado** | W19 implementation |
| `feed_viewed` | `feed/page.tsx` mount | ❌ **Não disparado** | W19 implementation |
| `welcome_banner_dismissed` | (banner pós-onboarding) | ❌ **Componente não existe** | W20 |
| `welcome_banner_cta_clicked` | (banner pós-onboarding) | ❌ **Componente não existe** | W20 |

### 5.3 Métricas a trackear (Wave 19 funil)

| Métrica | Fórmula | Wave | KPI target |
|---------|---------|------|------------|
| **Signup conversion rate** | `user_signed_up / waitlist_email` | W19 | ≥40% |
| **Onboarding start rate** | `onboarding_step_viewed{step:1} / user_signed_up` | W19 | ≥90% |
| **Onboarding completion rate** | `onboarding_completed / onboarding_step_viewed{step:1}` | W19 | ≥65% (W15 target: 75%) |
| **Time-to-complete onboarding** | `onboarding_completed.totalDurationMs` | W19 | < 180000ms (3min) |
| **Drop-off by step** | `1 - (step_completed{i+1} / step_completed{i})` | W19 | Step 2 ≤ 15% drop |
| **Traditions per user** | AVG(`onboarding_tradition_selected.traditions.length`) | W19 | 2.5–3.5 |
| **"Ainda estou explorando" pick rate** | `count("explorando") / count(step2_starts)` | W19 (W20) | TBD após redesign |
| **First feed view time** | `first(feed_viewed.ts) - onboarding_completed.ts` | W19 | < 30s |
| **First meaningful action** | `first(post_liked|post_created|comment_created) - feed_viewed.ts` | W19 | < 5min |
| **D1 / D7 retention** | `user_returned / user_signed_up` | W19+ | D1 ≥ 35%, D7 ≥ 15% |

---

## 6. Top 10 Issues + Recomendações Priorizadas

### Matriz ICE (Impact × Confidence × Ease)

| Rank | Issue | I | C | E | Prioridade | Wave |
|------|-------|---|---|---|-----------|------|
| **#1** | **F6 — Welcome banner em `/feed?welcome=1` ausente** | 9 | 10 | 7 | 🔴 P0 | **W19** |
| **#2** | **F1 — Duplicação de `fullName` (signup → onboarding Step 1)** | 8 | 10 | 9 | 🔴 P0 | **W19** |
| **#3** | **W15 redesign NÃO implementado em código** (5→4 steps, banner pós-onboarding) | 10 | 8 | 4 | 🔴 P0 | **W20** (precisa Coder) |
| **#4** | **Analytics não wireado** no OnboardingFlow | 7 | 10 | 9 | 🟠 P1 | **W19** |
| **#5** | **F3 — Sem preview do feed** durante onboarding | 8 | 8 | 6 | 🟠 P1 | **W20** (depende #3) |
| **#6** | **F4 — Sem "Ainda estou explorando"** | 7 | 9 | 8 | 🟠 P1 | **W20** (depende #3) |
| **#7** | **F8 — LGPD granular** (toggles por uso) | 9 | 7 | 5 | 🟠 P1 | **W21** |
| **#8** | **F9 — Email verify UX** (tela client?) | 6 | 6 | 7 | 🟡 P2 | **W21** |
| **#9** | **F5 — Autocomplete de local** | 5 | 8 | 5 | 🟡 P2 | **W22** |
| **#10** | **F10 — Save progress** se sai no meio | 6 | 6 | 4 | 🟡 P2 | **W22** |

### Recomendações detalhadas

#### **#1 — Welcome banner em `/feed?welcome=1`** (Wave 19)

**Problema:** `/feed` lê `?welcome=1` na URL mas não renderiza nada. Primeiro post-onboarding é silencioso.

**Solução rápida:**
- Criar `<WelcomeBanner />` (client component) que lê `useSearchParams().get('welcome')`
- Renderiza entre `<header>` e `<main>` com gradiente gold/violet (coerente com onboarding)
- Mostra: nome do usuário, "tradições que você escolheu", CTA "Ver primeiro post" que scrolla para o primeiro card
- Persiste `welcome_seen_at` em localStorage para não reaparecer

**Heurística Nielsen:** #1 Visibility of system status · #2 Match real world (nome do usuário!) · #8 Aesthetic

**Wireframe (mobile 360px):**
```
┌─────────────────────────────────────┐
│  ✦  Bem-vindo(a), Ana              │
│                                     │
│  Você escolheu Cabala como          │
│  caminho. Aqui estão 3 reflexões    │
│  pra começar:                       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🌙 Cabala · há 2h           │    │
│  │ "Cada sephirah é um espelho │    │
│  │  da jornada interior..."    │    │
│  └─────────────────────────────┘    │
│                                     │
│  [ Ver feed completo ]              │
│  [ Pular ]                          │
└─────────────────────────────────────┘
```

#### **#2 — Remover duplicação de `fullName`** (Wave 19)

**Problema:** `RegisterForm.tsx:62` coleta `fullName`, depois `OnboardingFlow.tsx:111` coleta DE NOVO.

**Solução rápida:**
- `OnboardingFlow` Step 1 (que vira "Boas-vindas" no redesign W15): mostrar "Oi, {user.fullName}!" — não pedir novamente
- OU pular Step 1 inteiro se já tem fullName (consumir de `useAuth().user`)

**Heurística:** #4 Consistency · #3 User control (não pedir o que já tem)

#### **#3 — Implementar redesign Wave 15 em código** (Wave 20)

**Escopo:** seguir doc `docs/ONBOARDING-REDESIGN-W15.md` §2.1 (4 steps + banner pós-onboarding).

**Estimativa:** Coder precisa de ~3 dias (1 dia OnboardingFlow, 1 dia banner, 0.5 dia analytics, 0.5 dia QA).

**Bloqueador:** sem aprovação do owner + decisão de budget Wave 20.

#### **#4 — Wirear analytics** (Wave 19)

**Problema:** catálogo existe mas `trackEvent()` não é chamado em `OnboardingFlow.tsx`.

**Solução rápida:**
- Adicionar `trackEvent(EVENT_CATALOG_ONBOARDING.STEP_VIEW, {...})` em cada `setCurrentStep`
- Adicionar `STEP_COMPLETE` em `goNext()` com `durationMs`
- Adicionar `TRADITION_SELECTED` em `toggleTradition()`
- Adicionar `ABANDONED` em `useEffect` cleanup
- Adicionar `COMPLETED` em `handleSubmit()` sucesso
- Wirear `FEED_VIEW` em `feed/page.tsx` mount

**Heurística:** #1 Visibility (analytics) · meta: medir para melhorar

---

## 7. WCAG AA — auditoria rápida do fluxo

| Critério | Status | Notas |
|----------|--------|-------|
| 1.4.3 Contraste texto (4.5:1) | ⚠️ Pendente | `text-slate-500` em inputs preocupa |
| 1.4.11 Contraste UI (3:1) | ✅ | Buttons com gradient gold OK |
| 2.4.7 Foco visível | ✅ | `focus-visible:ring-3` em Button |
| 2.5.5 Target size (44×44px) | ⚠️ Stepper icons pequenos | Stepper dots 40px < 44px (W15 doc flag #G10) |
| 3.3.2 Labels | ✅ | Todos os campos com Label |
| 4.1.2 Name, Role, Value | ✅ | `aria-current="step"` no stepper |
| 2.1.1 Teclado | ✅ | Tab order funcional |
| 2.4.1 Bypass blocks | ✅ | "Skip to main" presente |
| **1.3.1 Info and Relationships** | ⚠️ **Stepper não tem `aria-label="progress"`** em todos os points | Auditar |
| **3.3.1 Error Identification** | ✅ | Field-level errors visíveis |

**Bloqueadores WCAG:** nenhum. **Pendências:** #1.4.3 (auditoria Wave 16) + #2.5.5 (stepper).

---

## 8. Limitações desta auditoria (honestidade)

- **Sem teste com usuários reais** — conclusões são baseadas em heurística + personas construídas a partir de UX-RESEARCH. Validação real vem com analytics wireados (#4) + entrevistas D7.
- **Biblioteca, notificações, eventos** não auditadas — fluxo focado em first-time user. Auditá-los em Wave 20+.
- **Fluxo pós-email** (T3 — receber convite) é hipotético — não confirmei se Supabase manda email de boas-vindas. Auditoria de W11 (monitoring) cobre PostHog mas não auth emails.
- **Mobile real** não testado (sem emulador no sandbox). Heurística aplicada, mas touch targets precisam de teste em device real.
- **Wireframes são ASCII** — high-fi no Figma depende de aprovação do owner (W15 doc propôs, owner não respondeu).
- **Recomendações #1, #2, #4 podem ser implementadas Wave 19** com baixo esforço, mas #3 (redesign) e #5+ dependem de Coder + decisão de budget.

---

## 9. Próximos passos (recomendados)

1. **Wave 19 implementation (curto prazo, 2 dias):**
   - Coder implementa #1 (welcome banner), #2 (remove duplicação nome), #4 (analytics wireado)
   - Designer (Lina) revisa copy + a11y do banner
   - QA testa em 2 devices mobile

2. **Wave 20 (curto-médio prazo, 1 semana):**
   - Coder implementa #3 (redesign W15: 4 steps + banner pós-onboarding + preview feed + "ainda estou explorando")
   - PM (Tomás) define cohorts A/B test (5 hipóteses W15 §4)
   - Curator revisa copy PT-BR (especialmente Step 4 Akasha IA)

3. **Wave 21+ (médio prazo):**
   - #7 LGPD granular
   - #8 Email verify UX
   - Auditoria Wave completa com dados reais de analytics

4. **Owner decide:**
   - Aprovar implementação W19 (banner + dedup + analytics)?
   - Budget Wave 20 para redesign completo?
   - Validação externa (5 usuários reais testando fluxo)?

---

## 10. Checklist de entrega Wave 19 (UX First-Time Audit)

- [x] Mapa completo do fluxo first-time (T0 → T9)
- [x] Time-to-value estimado (~10–11min, sem ver valor)
- [x] Friction points rankeados (10 itens)
- [x] 3 personas testando (Ana, Lúcia, Carlos)
- [x] LGPD diagnóstico
- [x] Top 10 issues priorizados (ICE)
- [x] Métricas de analytics (10 KPIs)
- [x] WCAG AA auditoria rápida
- [x] Limitações declaradas
- [x] Próximos passos definidos
- [x] Doc salvo em `docs/ONBOARDING-FIRST-TIME-UX-W19.md`
- [⚠️] Commit — **a tentar; BLOCKED se sandbox degradar**

---

## 11. Status do commit (honestidade)

**Tarefa:** `docs(ux): onboarding first-time audit — 3 personas wave 19`
**Branch alvo:** `main`
**Status:** ⚠️ **Tentativa em curso** — bash sandbox degrado durante Wave 15/17/18/19 (padrão persistente). Se `git add` time-out, doc fica uncommitted e owner commita localmente.

### Workaround esperado (caso BLOCKED)

```bash
cd /workspace/cabaladoscaminhos
git add docs/ONBOARDING-FIRST-TIME-UX-W19.md
git commit -m "docs(ux): onboarding first-time audit — 3 personas wave 19

- Mapeamento completo T0→T9 do fluxo first-time
- Time-to-value: ~10-11min sem ver valor (deveria ser <3min)
- 10 friction points rankeados (ICE)
- 3 personas: Ana (mãe), Lúcia (Candomblé), Carlos (ateu curioso)
- Diagnóstico: W15 redesign NÃO implementado em código
- Recomendações Wave 19/20/21+ priorizadas
- Métricas analytics (10 KPIs pra wirear)"
```

(Sem push — conforme briefing.)

---

**Fim do documento.** Auditoria completa. Pronto pra review do owner antes de implementação Wave 19.