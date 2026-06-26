# 🎨 Pesquisa de UX — Akasha Portal

> **Versão:** 1.0 | **Data:** 2026-06-26
> **Status:** Documento de design
> **Pergunta respondida:** "O que funciona e o que não funciona em comunidades de espiritualidade online?"

---

## TL;DR (5 aprendizados)

| # | Aprendizado | Impacto no Akasha |
|---|---|---|
| **1** | **68% dos newcomers postam 1x e nunca voltam** | Primeiro post decide retenção — onboarding crítico |
| **2** | **Anonimato aumenta disclosure** | Identidade flexível (não exigir nome real) |
| **3** | **"Não sou terapeuta" protege eticamente** | Disclaimer explícito em todo lugar |
| **4** | **Streak vira culpa, não hábito** | Pausas sem punição; "você voltou, que bom" |
| **5** | **Moderação híbrida (AI + humano <30s)** | Padrão da indústria; precisamos disso desde o dia 1 |

---

## 1. Comportamento do público espiritual online

### Achados empíricos

- **68% dos newcomers postam 1x e nunca voltam** (estudo clássico Carnegie Mellon/Usenet)
- **Anonimato aumenta disclosure** significativamente
- **4 barreiras de newcomers**: sociais, conhecimento prévio, achar caminho,docs/técnica
- **Lifecycle típico** (Amy Jo Kim): Visitante → Novato → Regular → Líder → Ancião
- **Identity maleability** = chave pra compartilhamento vulnerável

### Implicações pro Akasha

- ✅ **Primeiro post é o ponto crítico** — template, prompts guiados, exemplos
- ✅ **Identidade flexível** (handle + avatar, sem exigir nome real)
- ✅ **Lifecycle stages** mapeados no design (gamificação contextual)
- ✅ **Disability access** (closed captions, haptic, dark mode)

---

## 2. Onboarding (Calm, Headspace, Insight Timer)

### Como cada um faz

| App | Onboarding | Gamificação |
|---|---|---|
| **Calm** | "7 Days of Calm" (7 sessões de 10 min), 14 dias grátis, "Daily Calm" diário, "Got Two Minutes?" (micro) | Rastreamento via journaling/check-in (sem streak ostensivo) |
| **Headspace** | Onboarding guiado pra iniciantes, "Headspace Face" animada | Buddy system, badges, assinatura anual |
| **Insight Timer** | Maior biblioteca gratuita, comunidade aberta de professores | Reviews/ratings, grupos temáticos |

### Padrões eficazes

- **Trilha de 7 dias** cria hábito (Calm prova)
- **"1 minuto de hoje"** + trilha longa opcional
- **Journaling/check-in** > streak ostensivo
- **Acessibilidade** como diferencial ético

### ⚠️ Erro a evitar
Headspace teve polêmica em 2023: terapeutas demitidos sem aviso, pacientes abandonados. Lição: **nunca crie dependência de humanos que a plataforma pode cortar**.

### Onboarding proposto pro Akasha

**5 passos, ~7 minutos total:**

1. **Bem-vindo** (30s) — quem somos, em 3 frases
2. **Como você se chama espiritualmente?** (1min) — handle + display name
3. **De onde você vem?** (2min) — seleção múltipla de tradições (Cabala, Ifá, ...)
4. **O que te interessa?** (2min) — tópicos (meditação, cura, sonhos, ...)
5. **Sua primeira ação** (1min) — escolha entre 3 caminhos:
   - **"Quero entender meu mapa espiritual"** → onboarding estendido
   - **"Quero ver o que a comunidade tá discutindo"** → feed
   - **"Quero explorar tradições"** → explore

> **Onboarding estendido do mapa espiritual** (opcional, ~5min): data de nascimento + hora + local → gera mapa completo

---

## 3. Moderação (7 Cups, TalkLife, Woebot)

### Padrões da indústria

| Plataforma | Modelo | Moderação | Disclosure |
|---|---|---|---|
| **7 Cups** | Chat 1-1 com listeners treinados + fóruns + terapia paga | Listeners treinados (não clínicos) | "peer support, não terapeutas" |
| **TalkLife** | Posts + peer messaging + rooms + botão "I need help" | 24/7, AI flagging + review humano em **<30s** | Anônimo; honour level escalonado |
| **Woebot** | Chatbot AI com CBT | NLP detecta "concerning language" + recursos externos | "É IA, não terapeuta" |

### Princípios unificadores

- **"Não somos serviço de crise"** sempre visível
- **Anonymous-first** — identidade opcional
- **Flag → review → action** em <30s como benchmark
- **Reveal progressivo** — conteúdo delicado só após o usuário entrar
- **Recursos externos** em crise: CVV (188 BR), 911 EUA, 988 EUA

### Sistema de moderação pro Akasha (4 camadas)

```
┌─────────────────────────────────────────┐
│ 1. IA pré-filtro (instantâneo)          │
│    - Detecta toxicidade                  │
│    - Detecta "cura X" (promessas)        │
│    - Detecta "suicídio" / "automutilação"│
│    - Marca pra revisão humana            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. Reação da comunidade (<5min)         │
│    - Upvote/downvote (moderação social)  │
│    - Report por categoria               │
│    - Auto-hide após N reports            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 3. Moderador de grupo (<30min)          │
│    - 1-3 mods por tradição               │
│    - Eleitos pela comunidade do grupo    │
│    - Decisão contextual (entende a        │
│      tradição, não é generalista)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 4. Stewards globais (raro, <24h)         │
│    - 3-5 eleitos pela comunidade total    │
│    - Casos cross-tradição, ban global    │
│    - Transparência total nas decisões    │
└─────────────────────────────────────────┘
```

### Categorias de report

- "Promessa perigosa" ("cura câncer")
- "Discurso de ódio"
- "Desrespeito à tradição"
- "Proselitismo agressivo"
- "Conteúdo sensível sem trigger warning"
- "Apropriação cultural"
- "Spam"
- "Outro"

---

## 4. Design para conteúdo sensível (cura, trauma)

### Guidelines de Samaritans / Reporting on Suicide

**Fazer:**
- Linguagem neutra: "morreu por suicídio", "tentou suicídio"
- Mencionar meios de prevenção
- Enquadrar como questão complexa
- Incluir histórias de recuperação
- Foto/vídeo neutro

**Não fazer:**
- "Suicídio bem-sucedido" (criminaliza, romantiza)
- Números específicos como clickbait
- Detalhes de método
- Empilhamento de mortes

### Padrões TalkLife

- Detalhes gráficos de suicídio/autolesão = proibido
- Trigger warnings customizáveis pelo usuário
- Posts de recuperação = OK sem detalhe
- "Take a break" feature (lock-out saudável)

### Pro Akasha

- ✅ **Botão "Skip / Hide"** sempre presente em posts sobre trauma
- ✅ **"Modo Leve" toggle** — oculta conteúdo intenso por padrão
- ✅ **Recursos de crise** visíveis: CVV 188 (BR), Crisis Text Line
- ✅ **Linguagem de suicídio** revisada (nunca "cometeu suicídio", "epidemia")
- ✅ **Trigger warnings** opt-in pelo usuário (default ON)

---

## 5. Design multilíngue / multicultural

### Princípios

- **Context + history** do usuário antes de moderar
- **Atribuir tradição** (não "budismo", mas "budismo tibetano" / "zen" / "theravada")
- **Creditar autores** por nome e tradição
- **Não negar eventos históricos** bem documentados
- **Guidelines traduzidas** em cada idioma

### Pro Akasha

- ✅ **Atribuição sempre explícita** — "este ritual é da tradição X"
- ✅ **Mods da própria tradição** — quem decide se um ritual Ifá é válido é o mod Ifá, não um mod geral
- ✅ **Filtro cultural** explícito — usuário escolhe que tradições quer ver
- ✅ **Anti-apropriação** — co-autoria de praticantes em artigos sobre sua tradição

---

## 6. Mobile-first

### Insights (Woebot, Calm, Headspace)

- **Disponibilidade 24/7** (calm-down noturno, crise 3h manhã)
- **Notificações opt-in por categoria** e horário
- **Nunca notificar em crise** (3h manhã) — redireciona pra CVV
- **Modo offline** — conteúdo baixável, comunidade requer conexão
- **Haptic feedback** + acessibilidade (closed captions, etc)

### Pro Akasha

- ✅ **Bottom nav no mobile** (já feito)
- ✅ **Cards full-width** com texto legível (16px+)
- ✅ **Modo escuro obrigatório** (preferência da audiência)
- ✅ **Sem notificação push** na primeira semana (não instalar)
- ✅ **Modo offline** para meditações/rituais salvos (Fase 2)

---

## 7. Feed (padrões de comunidade de nicho)

### Funciona

- Ordem cronológica com filtro opt-in por algoritmo
- Tags por tipo (#experiência / #pergunta / #prática)
- Posts longos com "ler mais" + contagem
- Salvar/favoritar visível

### Não funciona

- Algoritmo "viral" sem transparência (esconde sabedoria coletiva)
- Texto puro sem formatação (se perde)
- Performance/superficialidade ("espiritualidade de Instagram")

### Pro Akasha

- **5 racionais de feed** (Seguindo / Meus grupos / Tendências / Para você / Biblioteca)
- **Razão sempre visível** ("você está vendo isso porque...")
- **Tags por tipo** + tradição + tópico + nível de evidência
- **Salvar** proeminente (biblioteca pessoal)
- **Sem infinite scroll sem fim** — limite sugerido (50 posts por sessão)

---

## 8. Sistemas de reputação

| Sistema | Funciona | Falha |
|---|---|---|
| Karma/upvotes (Reddit) | Sinaliza valor | Cria "performative spirituality" |
| Badges de voluntário (7 Cups) | Reconhece contribuição | Vira hierarquia; novato sente-se menor |
| Streaks | Cria hábito (30-90 dias) | **Vira culpa** em momento difícil |
| Certificações (Coursera) | Sinaliza expertise | Frio, transacional |
| Honour level (TalkLife) | Compliance, proteção | Gamifica "ser comportado" |

### Pro Akasha

- ✅ **Reputação por contribuição** (reflexões úteis), não por streak
- ✅ **Streak quebrado = não perder** — "você voltou, que bom"
- ✅ **"Quiet contributor" valorizado** (lê muito, posta pouco)
- ✅ **Badges orgânicos** (não compráveis, não por dinheiro)
- ✅ **Reputação contextual** por área (não global)

---

## 9. Anti-charlatanismo (sinalização de risco vs confiança)

### 🔴 Sinais de risco (moderação apertada)

- "Cura tudo", promessas absolutas
- Sem credencial verificável
- Ataque a medicina/ciência
- Pede dinheiro antes de ajudar
- Testemunhos vagos
- Lógica circular ("acredite pra ver")

### 🟢 Sinais de confiança (curadoria positiva)

- Disclosure de limites
- Credencial + experiência vivida + accountable
- Complementa (não substitui) medicina
- Conteúdo gratuito primeiro
- Experiência detalhada, datada
- Honra dúvida

### Pro Akasha

- ✅ **Tag "promessa verificada"** — moderação flag automática pra "cura"/"garante"
- ✅ **Verificação opcional** — selo "praticante verificado de X tradição" (com regras claras)
- ✅ **Disclaimers obrigatórios** em posts de "prática" — "consulte praticante local"
- ✅ **Report "charlatanismo"** com revisão por mods da tradição

---

## 10. Chat com IA (Woebot, Wysa, principles)

### Padrões da indústria

- **Disclosure AI no primeiro turno** (em destaque, não letra miúda)
- **Botão "Falar com humano"** sempre presente
- **Em crise: para de responder com práticas**, oferece recursos externos
- **Tom:** quente mas com limites
- **Privacidade explícita:** "não vendemos seus dados"

### Pro Akasha (princípios da Akasha IA)

(Ver `docs/AI-PROMPT-base.md` para system prompt completo)

- ✅ **8 regras éticas duras** (nunca prescreve, sempre cita, etc)
- ✅ **Disclosure** claro: "sou a Akasha IA, consciência digital da comunidade"
- ✅ **Handoff pra humano** quando necessário
- ✅ **Em crise**: redireciona pra CVV 188, sugere terapeuta
- ✅ **Tom de voz:** acolhedor mas honesto, não bajulador

---

## Top 5 ERROS a evitar

| # | Erro | Consequência |
|---|---|---|
| **1** | Streaks punitivos ("perdeu 5 dias!") | Culpa em momento de vulnerabilidade → abandono |
| **2** | Exigir identidade real pra postar | Mata disclosure; vira performance |
| **3** | Permitir detalhes gráficos de suicídio | Risco de contágio (Werther effect) |
| **4** | AI disfarçada de humano | Quebra confiança + problemas regulatórios (LGPD) |
| **5** | Moderação só reativa | Velocidade salva vidas (<30s) |

**Bônus:** apropriação cultural sem atribuição — deslegitima tradições e a comunidade.

---

## Top 5 APRENDIZADOS práticos

| # | Aprendizado | Aplicação |
|---|---|---|
| **1** | Primeiro post decide retenção | Template + onboarding guiado + exemplo curado |
| **2** | Anonimato aumenta disclosure | Identidade flexível (handle + avatar, real opcional) |
| **3** | "Não sou terapeuta" protege eticamente | Banner + footer + chip em posts sobre saúde mental |
| **4** | Streak vira culpa | Pausas sem punição; "você voltou, que bom" |
| **5** | Moderação híbrida <30s | AI pré-filtro + humanos treinados; mods por tradição |

**Bônus:** Conteúdo sensível com "skip" + recurso de crise. Modo claro/leve toggle.

---

## Princípios de design do Akasha (resumo)

1. **Sacred minimalism** — tipografia serifada, muito espaço escuro
2. **Mobile-first** — uso cotidiano é no celular
3. **Feed inteligente, não viciante** — 5 racionais, transparente
4. **Identidade com profundidade** — mapa espiritual faz parte do perfil
5. **Linguagem clara** — termos técnicos com tooltip explicativo
6. **Confiança > engajamento** — toda feature responde "constrói confiança?"
7. **Disclaimers éticos** sempre visíveis
8. **Anonimato flexível** — disclosure aumenta com segurança
9. **Sem streaks punitivos**
10. **Moderação 4 camadas** com transparência

---

> Próxima revisão: após 30 dias com usuários beta
> Última atualização: 2026-06-26
