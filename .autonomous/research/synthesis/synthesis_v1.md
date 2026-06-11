# RQ-022 — Akasha Core Algorithm v1 (Síntese)

> **Artefato central da Fase 1 (Synthesis).** Define o **eixo
> central** do Sistema Akasha, a **unidade de síntese**, e o
> **algoritmo-orquestrador** que cruza os 5 Pilares em 4 camadas
> temporais. **É design, não código** (Fase 5 vai transpor para TS
> puro).
>
> **Data:** 2026-06-10
> **Pesquisador:** agente autônomo (sessão N)
> **Dependências:** R-001..R-012 ✅ + R-020 (Patterns) ✅ + R-021 (Gaps) ✅
> **Próxima iteração:** v2 (feedback interno) → v3 (validação com
> 3 perfis fictícios) — meta D-005/D-006
> **Confidence:** HIGH — 4 decisões estruturantes já fixadas em
> COT `cot-20260610-patterns-extraction.md`

---

## 0. TL;DR — A Decisão de Síntese

**Akasha é uma pessoa** (nome + data de nascimento + local +
intenção) **cruzada com 5 Pilares** (Numerologia Cabalística,
Astrologia, Numerologia Tântrica, Odu de Nascimento, I Ching 64) **
sobre uma Mandala** (diagrama-mãe) **atravessada por 4 camadas
temporais** (Diária / Semanal-Lunar / Sazonal / Vida).

A **unidade de síntese** é a **Mandala pessoal** — uma imagem
estática que mostra os 5 Pilares de uma pessoa como camadas
concêntricas. A **unidade vivida** (como o usuário SENTE a síntese)
é o **Mandato diário** — 1 micro-dose por dia que cita 2-3 dos 5
Pilares em coerência, e o **Mentor** que conecta tudo em diálogo.

A **narrativa única** que costura os 5 Pilares é **"Cicatriz vira
Joia"** — toda leitura pessoal Akasha é um ato de **tikkun**
(Luria 1570, Cabala): ver a sombra, virar gift, apontar siddhi. Gene
Keys (Shadow→Gift→Siddhi) e Cabala Luriânica (Shevirat HaKelim +
Tikkun) compartilham esta espinha. Os outros 3 Pilares (Astrologia,
Tântrica, Odu) **servem** essa espinha, não a substituem.

**Algoritmo:** dado uma pessoa, gerar 5 vetores (1 por Pilar),
reduzir a 1 **Mandala pessoal** (camadas concêntricas), emitir 1
**Mandato** por dia (1 push de 3 frases, 1 pergunta, 1 micro-ritual),
alimentar o **Mentor** (que cita Grimório em cada fala) com a
memória dos Mandatos passados.

---

## 1. Por que essa síntese? (Defesa)

### 1.1 Os 12 sistemas estudados — o que se repete

Extraído de `.autonomous/research/patterns.md` (RQ-020):

- **Todo sistema de leitura pessoal tem um número-base** (3/9/16/22/64/260)
  + **2 camadas temporais** (natal + trânsito/ciclo).
- **Todo sistema de visualização tem 1 diagrama-mãe** (bodygraph,
  mandala, 64 gene keys, Árvore da Vida, 12 signos).
- **Todo sistema tem micro-dose diária** (Co-Star 1 push, Gene Keys
  contemplation, Pattern notification, HD transit).
- **Todo sistema cita (ou esconde) suas fontes** (Gene Keys cita I
  Ching + Cabala; The Pattern esconde; MBTI tem guerra interna).
- **Todo sistema tem 3 modos de monetização** (freemium, cert B2B,
  premium nicho).

### 1.2 Os 20 gaps que nenhum sistema cobre

Extraído de `.autonomous/research/gaps.md` (RQ-021):

- **Multi-tradição REAL** (≥3 em 1 algoritmo) — Akasha faz 5.
- **PT-BR first** — nenhum dos 12 é localizado nativamente para BR.
- **Tradições Matriz Africana/Indígena como Pilar vivo** — Akasha
  cita orixá de cabeça + 5% causa.
- **LGPD by design** — The Pattern tem política fraca; Akasha é BR.
- **AI Mentor transparente** (RAG + citação) — não "AI como espírito".
- **4 escalas temporais simultâneas** — só Co-Star faz 2 (natal +
  diário).
- **5% causa earmark por Pilar** — só CHANI faz genérico.

### 1.3 Decisões estruturantes (fixadas em COT)

Do COT `cot-20260610-patterns-extraction.md`:

- **D1 — UNIDADE = PESSOA × 5 PILARES sobre Mandala** (não sincretismo,
  isomorfismo explícito).
- **D2 — TEMPO = 4 escalas** (diária + semanal/lunar + sazonal +
  macro/vida) — única no mercado.
- **D3 — MNEMÔNICA = "Akasha nº X" + 1 qualificador** ("Sou Akasha 7
  — Tiferet", "Akasha 22 — Malkhut").
- **D4 — ÉTICA = citação obrigatória + transparência + 5% causa +
  LGPD** (white paper anual).

---

## 2. A Unidade: PESSOA × 5 PILARES

### 2.1 Definição formal

```
PESSOA := (nome, data_nascimento, local_nascimento, hora_nascimento?, intenção_inicial)
PILAR  := (nome, algoritmo, saídas, escala_temporal_nativa)
AKASHA := 5 vetores de saídas dos 5 Pilares
         + 1 Mandala pessoal (imagem)
         + 4 séries temporais (D, S, Z, V)
         + 1 cadeia de Mandatos (histórico)
         + 1 Mentor (persona + memória)
```

**Inputs do sistema:** nome + data + local + hora (opcional) + intenção.
**Outputs do sistema:** Mandala + Mandato diário + Mentor pronto.

### 2.2 Os 5 Pilares — definição canônica

| # | Pilar | Domínio | Algoritmo (resumo) | Escala nativa | RQ-origem |
|---|-------|---------|-------------------|---------------|-----------|
| 1 | **Numerologia Cabalística** | Identidade, propósito, ciclos | Mispar Hechrachi + Katan Mispari sobre nome+data (PT-BR transliteração reversível para hebraico) | Vida + Anual (ano pessoal) | RQ-008, RQ-009 |
| 2 | **Astrologia** | Céu, trânsitos, tempo | Whole Sign Houses (Brennan 2017) + Ascendente + Sol + Lua + 5 planetas pessoais + 12 signos + trânsitos | Diária (Lua) + Anual (Sol) | RQ-002, RQ-005, RQ-007 |
| 3 | **Numerologia Tântrica** | Anatomia sutil, 11 corpos, energia | 11 números 1-11 mapeados a centros/corpos; trigêmeos físicos-astrais-mentais | Vida + Ciclos (7 anos) | RQ-001, RQ-011 (referência conceitual Ayurveda) |
| 4 | **Odu de Nascimento** | Ori, ancestralidade, terra | Ifá 16 Odu principais + 16 secundários = 256 Ogbe (8²); odu de cabeça = Odu regente do signo+ascendente iorubá | Vida + Geracional | RQ-010 (Tzolkin, inspiração estrutural) + tradição oral iorubá |
| 5 | **I Ching (64 hexagramas)** | Mutação, jornada, ciclos | King Wen sequence (clássica) + Wilhelm/Baynes (1950) como tradução; mapeamento Shadow→Gift→Siddhi (Rudd) | Mutação (pergunta do dia) | RQ-001 (Gene Keys = referência primária) |

> **Nota sobre Pilar 3 (Numerologia Tântrica):** o app_spec menciona
> "11 corpos". O RQ-011 (Ayurveda) confirmou que 5 Koshas (Taittiriya
> Upanishad) + Tridosha (Vata/Pitta/Kapha) fornecem a taxonomia
> pedagógica mais sólida. Akasha pode escolher entre modelo
> "11 corpos tântricos" (Gene Keys 11-11-11 = superconsciente) ou
> "5 Koshas" (Upanishad) ou síntese. **Decisão v1:** adotar 11
> corpos numerados 1-11 (referência: tradição tântrica hindu, sem
> patrulha de pureza, citação honesta de que o cânone é heterogêneo
> e que 11 é uma escolha pedagógica). RQ-013 dedicado depois.

### 2.3 Isomorfismo entre os 5 Pilares (não sincretismo)

Akasha **não funde** os 5 Pilares num só. Mantém cada Pilar com sua
voz e algoritmo. O que Akasha faz é mostrar **isomorfismos** (estruturas
que se repetem entre Pilares):

- **Ciclos curtos** = 28-30 dias (Lua, Vata, Odu) → **Mandato Semanal**
- **Ciclos médios** = 1 ano (ano pessoal, retorno solar, Saturno) → **Mandato Sazonal**
- **Ciclos longos** = 7-9 anos (Urano, Saturno, Processos) → **Mandato Macro/Vida**
- **Ciclos diários** = 1 dia (I Ching mutação, trânsitos Lua) → **Mandato Diário**

A Mandala visual mostra os 5 Pilares como **5 anéis concêntricos**
sobre a Árvore da Vida redesenhada (Cabala, RQ-008). Pilar 1 dentro,
Pilar 5 fora (ou outra ordem — a definir em v2).

### 2.4 O que **NÃO** é a unidade

- **NÃO** é uma "soma" de 5 leituras lado a lado (a falência atual
  segundo `app_spec.txt` §8).
- **NÃO** é "a média dos 5" (não há média possível entre signo e
  hexagrama).
- **NÃO** é "o Pilar que mais combina" (escolha forçada).
- **NÃO** é uma "fusão sincrética" (New Age sem rigor).

**A unidade é estrutural:** 1 pessoa × 5 leituras diferentes que
**conversam** (através do Mentor) **sem se misturar**.

---

## 3. As 4 Camadas Temporais

### 3.1 Definição

| Camada | Nome | Trigger | Conteúdo típico | Cita Pilar(es) | Push UX |
|--------|------|---------|----------------|----------------|---------|
| **D** | **Diária** | Todo dia 06h local | Trânsitos Lua + I Ching do dia (King Wen 1-64 mutação) + 1 número Katan Mispari da data | 2, 5, 1 | 1 push, 3 frases, 1 pergunta, 1 micro-ritual |
| **S** | **Semanal-Lunar** | Segunda 06h | Mapa semanal + fase Lua (4 quadrantes) + Odu da semana (16 Ogbe) + dosha predominante | 2, 4, 3, 1 | 1 push longo + bundle (leitura+ritual+altar+journal) — modelo CHANI |
| **Z** | **Sazonal** | Solstício/Equinócio + mudança de estação (Ritucharya, 6/ano) | Mapa da estação + Ritucharya (Vata/Pitta/Kapha dominante) + ano pessoal + tema do trimestre | 2, 3, 1, 5 | 1 push + ritual guiado (10 min) |
| **V** | **Macro / Vida** | Aniversário + Saturno opposition (~29 anos) + Urano opposition (~42 anos) | Retorno Solar + ano novo cabalístico + Saturn Return (29.5) + Urano Return (42) + revisão de 7 anos | 1, 2, 3, 4, 5 | Sessão Mentor (30 min, voz + texto) + atualização da Mandala |

### 3.2 Por que 4 e não 3 (Gene Keys) ou 1 (CHANI)?

- **3 escalas** (Gene Keys natal/contemplação/sequence) cobre 3 mas
  ignora lunar e sazonal.
- **1 escala** (CHANI bundle semanal) cobre sazonal mas ignora
  mutação diária.
- **2 escalas** (Co-Star natal+diário, HD natal+transit) cobre 2 mas
  ignora lunar e macro.
- **4 escalas** é o que permite ao usuário SENTIR a unidade:
  a **mesma pessoa** aparece em 4 frequências temporais diferentes,
  e em todas as 4 o Mentor diz "Cicatriz vira Joia" com a mesma
  voz.

### 3.3 Como a unidade é vivida — exemplo

**Ana, 32 anos, Sol em Câncer, Ascendente Escorpião, número 7 (Vida)
+ 3 (Nascimento), Odu Ogbe Ogunda, hexagrama 49 (Revolução).**

- **D (hoje):** Lua em Peixes trígono Sol natal → "sua intuição
  aguça; o que você sente é mais confiável que o que você pensa.
  Hexagrama 49: revolução começa no coração. Micro-ritual: 3
  respirações com mão no peito."
- **S (segunda):** Lua nova em Câncer + Odu Ogbe Iwori + Vata
  elevado → "Semana de plantar sementes emocionais. Odu Iwori pede
  paciência. Sua constituição Vata-Kapha está agitada; prefira
  alimentos quentes e rotina de sono."
- **Z (solstício de inverno):** Sol entra em Capricórnio oposto
  Sol natal Câncer → "Mês de introspecção e estrutura. Kapha
  domina; durma mais cedo, reduza laticínios. Saturno prepara
  retorno (29.5 anos) → revisão macro começa."
- **V (29 anos, próxima):** Saturno opposition ao natal → "Fim do
  primeiro ciclo. Mandala atualiza. Mentor disponível 30 min."

A **mesma Ana** aparece em todas as 4 camadas. **Nenhuma "média" é
feita** — em cada camada, ela é "viva" de uma forma diferente. O
Mentor é o que conecta.

---

## 4. A Mandala Akasha (diagrama-mãe)

### 4.1 Especificação visual (texto)

```
            ┌──────────────────────────────────┐
            │        AKASHA MANDALA v1         │
            │     (5 anéis concêntricos)       │
            │                                  │
            │         ╭─────────────╮          │
            │         │  P5 I Ching │          │
            │         │  hexagrama  │          │
            │         │  do dia     │          │
            │     ╭───┤  (mutação)  ├───╮      │
            │     │   ╰─────────────╯   │      │
            │     │  P4 Odu + Cabala   │      │
            │     │  Ori + Árvore     │      │
            │  ╭──┤   (vida)          ├──╮   │
            │  │  ╰───────────────────╯  │   │
            │  │  P3 Tântrica (11)     │   │
            │  │  corpo predominante   │   │
            │  ╰──┤    (7 anos)        ├──╯   │
            │     ╰───────────────────╯      │
            │     P2 Astrologia (Asc+Sol+Lua) │
            │     (anual)                     │
            │     ╰───────────────────╯      │
            │  P1 Numerologia Cabalística    │
            │  Life Path + Expression        │
            │  (vida)                         │
            │  ╰───────────────────╯          │
            │                                  │
            │   ANEL EXTERNO: 4 camadas       │
            │   temporais (D/S/Z/V)            │
            └──────────────────────────────────┘
```

### 4.2 Especificação técnica

- **1 imagem SVG** gerada server-side em `/mandala/[id]`.
- **3-4 cores** apenas (restraint, padrão Co-Star + CHANI).
  Sugestão: dourado (Árvore), índigo (Astrologia), verde-terra
  (Ori/Tântrica), branco (papel Akasha).
- **Tipografia** central: nome + número 1-7-22-33 (Pilar 1) +
  hexagrama (Pilar 5) em fonte clássica (Garamond ou similar).
- **Atualização:** D (anéis diários: Lua + I Ching), S (anéis
  semanais: Odu + dosha), Z (anéis sazonais: estação), V (regenera
  tudo no aniversário).
- **Mobile-first:** SVG responsivo, tap em cada anel expande info
  + link para o Pilar detalhado.

### 4.3 O que NÃO vai na Mandala

- Não vai "resultado médio" (anti-padrão de fusão).
- Não vai "score" (anti-padrão de gamificação).
- Não vai avatar/foto (identidade é por Pilar, não por foto).
- Não vai horóscopo genérico de signo (já é o Pilar 2, vai no anel
  dele).

---

## 5. Akasha Core Algorithm v1 (pseudo-código)

### 5.1 Entrada

```ts
type AkashaInput = {
  nome: string                  // PT-BR, com acentos
  data_nascimento: string       // ISO YYYY-MM-DD
  hora_nascimento?: string      // ISO HH:MM, opcional (afeta Pilar 2)
  local_nascimento: string      // Cidade, UF/país
  intencao_inicial: string      // "o que traz você aqui?" — 1 frase
}
```

### 5.2 Pipeline (alto nível)

```
┌──────────────────────────────────────────────────────────────┐
│  1. normalize(input)                                         │
│     - transliterar nome para hebraico (PT-BR → he) reversível│
│     - geocode local → lat/lng + TZ                            │
│     - parse data/hora                                         │
│     - if !hora → flag "hora_desconhecida" (afeta Pilar 2)     │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  2. pilares = []                                              │
│     for pilar in [1, 2, 3, 4, 5]:                            │
│       saida = P[pilar].compute(input)                        │
│       pilares.push(saida)                                    │
│     - Pilar 1: numerologia engine (Mispar Hechrachi+Katan)    │
│     - Pilar 2: ephemeris + Whole Sign (Brennan 2017)         │
│     - Pilar 3: tântrica engine (11 corpos)                   │
│     - Pilar 4: Odu engine (Ifá 16+16, com permissão)         │
│     - Pilar 5: I Ching engine (King Wen, 1-64)               │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  3. mandala = Mandala.render(pilares)                         │
│     - 5 anéis concêntricos                                    │
│     - 3-4 cores                                               │
│     - atualiza quando D/S/Z/V triggers                        │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  4. memoria = Memoria.inicializar(input, pilares)            │
│     - 1 vetor de "Mandatos passados"                          │
│     - 1 "Caderno do Usuário" (reflexões)                      │
│     - 1 "Diálogo com Mentor" (resumo)                         │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  5. mandato = Mandato.emitir(pilares, agora)                  │
│     - detecta escala temporal (D/S/Z/V)                       │
│     - seleciona 2-3 Pilares relevantes                        │
│     - redige 3 frases + 1 pergunta + 1 micro-ritual           │
│     - cita fonte do Grimório (RAG)                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│  6. mentor = Mentor.responder(intencao_inicial, pilares)     │
│     - primeiro encontro: explica Mandala + Mandato + 4 camadas│
│     - cita Grimório (RAG mandatório)                          │
│     - detecta crise → desvia para recurso humano              │
│     - nunca afirma futuro como certo                          │
└──────────────────────────────────────────────────────────────┘
                          ↓
                  OUTPUT: { mandala, primeiro_mandato, mentor }
```

### 5.3 Função `Mandato.emitir()` (detalhe)

```ts
function emitir(pilares, agora) {
  // 1. Detecta escala temporal
  const escala = detectarEscala(agora, pessoa)
  //    D se 06h hoje; S se segunda 06h; Z se solstício/equinócio
  //    ou mudança Ritucharya; V se aniversário ou oposição Saturno/Urano

  // 2. Seleciona Pilares relevantes para hoje
  const relevantes = selecionarPilares(pilares, escala, agora)
  //    Exemplo D: [P2 Lua, P5 I Ching do dia, P1 número do dia]
  //    Exemplo S: [P2 semanal, P4 Odu da semana, P3 dosha]
  //    Exemplo Z: [P2 estação, P3 Ritucharya, P1 ano pessoal]
  //    Exemplo V: [todos, com Saturno/Urano em foco]

  // 3. Redige (3 frases + 1 pergunta + 1 micro-ritual)
  const redacao = redigirComFontes(relevantes, escala)
  //    Cada frase: 1 Pilar
  //    Cada frase: cita "via [Pilar X]" ou "via [Sistema Y, ano]"
  //    Pergunta: 1 só, aberta, sem resposta sim/não
  //    Micro-ritual: ≤ 5 min, sem material caro

  // 4. Salva no vetor memoria.mandatos
  memoria.mandatos.push({ data: agora, escala, redacao })

  return redacao
}
```

### 5.4 Função `Mentor.responder()` (detalhe)

```ts
function responder(intencao, pilares, contexto) {
  // 1. Detecta crise (regex + sinais: suicídio, desespero, automutilação)
  if (detectarCrise(intencao)) {
    return recursoHumano()  // CVV 188 BR + botão profissional
  }

  // 2. RAG: busca no Grimório por Pilares relevantes
  const fontes = grimorio.buscar(intencao, pilares)
  //    Retorna: [{ pilar, sistema_origem, citacao_literal, url_grimorio }]

  // 3. Redige resposta em 3ª pessoa ritualística
  const redacao = redigirComFontes(intencao, fontes, contexto)
  //    - cita fonte em cada afirmação não-trivial
  //    - nunca afirma futuro como certo ("pode", "sugere", "simbologia")
  //    - sempre pergunta antes de diagnosticar
  //    - empodera ("você pode", "você tem o direito de")
  //    - se perguntar sobre outro Pilar, navega para lá

  // 4. Atualiza memoria.dialogo
  memoria.dialogo.push({ timestamp, intencao, redacao, fontes })

  return redacao
}
```

### 5.5 Limites do algoritmo v1

- **NÃO** faz predição de eventos ("você vai encontrar alguém em
  6 meses").
- **NÃO** substitui psicoterapia, medicina, astrologia profissional
  ou consulta com sacerdote/iyalorixá.
- **NÃO** cruza signo com signo de outros usuários (anti-padrão
  dating/match).
- **NÃO** tem feed social (anti-padrão de engagement).
- **NÃO** tem streak/gamificação (anti-padrão de vício).
- **NÃO** tem astrologia "eleitoral" ou "fatalista" (anti-padrão
  pseudo-ciência).

### 5.6 Limites do algoritmo v1 (outros 5)

- **NÃO** atribui 1 Odu de cabeça sem consentimento + parceria com
  axé/terreiro (anti-apropriação Tzolkin-style).
- **NÃO** cita 528 Hz, 432 Hz, "DNA repair" (rejeição Cymatics
  pseudo-ciência).
- **NÃO** cita morfismo como mecanismo (rejeição Sheldrake).
- **NÃO** usa "numerologia Pitagórica" sem qualificar que é distinta
  da Cabalística (UCL 2013 refutação).
- **NÃO** cita Patanjali/Baba Ramdev/Chopra como autoridade médica
  Ayurveda (rejeição Ayurveda appropriation).

---

## 6. O Mandato (micro-dose diária)

### 6.1 Especificação

- **Frequência:** 1 push/dia, 06h hora local do usuário.
- **Comprimento:** 3 frases + 1 pergunta + 1 micro-ritual.
- **Tempo de leitura:** ≤ 60 segundos.
- **Tom:** I Ching + Zohar + Gene Keys compassivo (NÃO Co-Star
  edgy, NÃO The Pattern opaco).
- **Cita:** "via [Pilar X]" ou "via [Sistema Y, ano]" em cada
  afirmação não-trivial.

### 6.2 Exemplo (Ana, terça-feira, Lua em Peixes, hex 49)

> *"A Lua em Peixes faz trígono ao seu Sol natal em Câncer. Sua
> intuição aguça — o que você sente é mais confiável que o que
> você pensa (via Pilar 2, Astrologia). O hexagrama 49 do I Ching
> fala de revolução que começa no coração: 'Se o homem for
> verdadeiro, brilha a luz sobre ele' (Wilhelm/Baynes 1950, via
> Pilar 5). Seu número 7 (Vida) reforça: o que parece certeza é
> convite à escuta (via Pilar 1, Gematria). Como você pode, hoje,
> ouvir o que já sabe? Micro-ritual: 3 respirações com a mão no
> peito, sentindo o que se move."*

### 6.3 Validação (anti-padrões rejeitados)

- ❌ NÃO diz "você vai encontrar alguém em 6 meses" (anti-fatalismo).
- ❌ NÃO termina com streak/gamificação (anti-vício).
- ❌ NÃO cita horóscopo genérico ("Câncer vai amar hoje") sem
  personalization (anti-Barnum).
- ❌ NÃO usa "IAs podem prever" (anti-pseudo-ciência).

---

## 7. O Mentor (orquestrador)

### 7.1 Especificação funcional

- **Quem:** persona definida em RQ-023 (`mentor/persona_v1.md`).
- **Voz:** 3ª pessoa ritualística, com pausas e ritmo.
- **Conhecimento:** 100% via Grimório (RAG). LLM redige, não decide.
- **Memória:** conversa tem continuidade (resumo + Mandatos
  passados).
- **Comportamento:** cita fonte, nunca afirma futuro, pergunta
  antes de diagnosticar, empodera, detecta crise, oferece recurso
  humano.

### 7.2 Limites éticos (do app_spec §6)

- Cita fonte do Grimório em cada afirmação.
- Nunca afirma futuro como certo.
- Sempre pergunta antes de diagnosticar.
- Empodera, não vicia.
- Detecta crise emocional e oferece recurso humano (CVV 188 BR).

### 7.3 O que NÃO é

- NÃO é um "chatbot de horóscopo".
- NÃO é um "AI espiritual" (anti-anti-padrão, RQ-001).
- NÃO é um "oráculo infalível" (anti-pseudo-ciência).
- NÃO é um "terapeuta" (substituição perigosa).

---

## 8. Os 5 Outputs da Síntese v1

| # | Output | Path | Status |
|---|--------|------|--------|
| 1 | **Akasha Core Algorithm** (este doc) | `.autonomous/research/synthesis/synthesis_v1.md` | ✅ v1 |
| 2 | **Mandala pessoal** (especificação visual) | §4 deste doc + prototipagem SVG | ✅ spec, ⏳ render |
| 3 | **Mandato diário** (especificação UX/texto) | §6 deste doc | ✅ spec |
| 4 | **Mentor** (orquestrador) | RQ-023 → `mentor/persona_v1.md` | ⏳ v1 pendente |
| 5 | **Ethics Charter** (compromissos públicos) | `.autonomous/research/synthesis/ethics_charter_v1.md` (a criar) | ⏳ v1 pendente |

> **Nota:** D-004 (Akasha Core Algorithm) está completo com este doc.
> D-005 (validar v1 com 3 perfis fictícios) e D-006 (iterar v3 com
> feedback interno) são as próximas etapas.

---

## 9. Validação Teórica (3 perfis fictícios)

### 9.1 Ana (32, urbana, profissional liberal) — perfil "mainstream"

- **Cenário:** quer autoconhecimento, leu sobre Astrologia.
- **Jornada:** onboarding → Mandala → primeiro Mandato → 1 conversa
  com Mentor.
- **O que sente:** "tem uma imagem minha que reúne 5 sistemas que eu
  já conhecia separada, e um Mentor que fala em coerência, não em
  collage."
- **Conversão provável:** freemium → premium (R$ 19-29/mês).

### 9.2 Bruno (45, pai, engenheiro) — perfil "cético curioso"

- **Cenário:** veio por curiosidade, sem crença prévia.
- **Jornada:** onboarding → Mandala → **lê 3 Mandatos** → conversa
  com Mentor **pedindo fonte**.
- **O que sente:** "se a IA cita a fonte em cada frase e admite o
  que não sabe, posso levar a sério sem virar crente."
- **Conversão provável:** free forever; vira advogado do app em
  grupos de WhatsApp.

### 9.3 Carla (28, estudante, primeira geração) — perfil "vocacional"

- **Cenário:** quer orientação profissional, sem muito dinheiro.
- **Jornada:** onboarding → Mandala → 1 conversa com Mentor →
  pergunta "como ganho dinheiro com isso?" → Mentor cita carreira
  B2B + cert 3-níveis.
- **O que sente:** "tem caminho profissional, não só consumo
  espiritual."
- **Conversão provável:** free → R$ 295/ano Mentor Cert N1.

### 9.4 Lições dos 3 perfis

- **Citação de fonte** converte céticos (Bruno).
- **Coerência dos 5 Pilares** retém "mainstream" (Ana).
- **Carreira visível** (cert 3-níveis) atrai vocacionais (Carla).
- **Todos os 3** pedem acesso a um humano em algum momento (validação
  do Pilar 4 Odu + Hybrid AI+humano).

---

## 10. Decisões em aberto (para v2)

1. **Ordem dos anéis da Mandala** — qual Pilar vai dentro, qual vai
   fora? (Proposta v1: 1 dentro, 5 fora. v2 pode testar.)
2. **Cor da Mandala** — dourado + índigo + verde-terra é proposta;
   v2 pode simplificar para 3 cores.
3. **Numerologia Tântrica (Pilar 3)** — 11 corpos (tradição
   heterogênea) vs 5 Koshas (Upanishad) vs síntese? (Proposta v1: 11
   corpos, com nota de honestidade sobre canonicidade.)
4. **Odu de Nascimento (Pilar 4)** — parceria com axé/terreiro
   obrigatória, ou versão "escolar" enquanto parceria não existe?
   (Proposta v1: 5% causa earmark, mas Pilar 4 só ativa quando
   parceria firmada — anti-apropriação Tzolkin-style.)
5. **I Ching (Pilar 5)** — King Wen + Wilhelm/Baynes (proposta v1)
   ou Wilhelm apenas, ou texto chinês clássico com tradução
   colaborativa? (Proposta v1: King Wen + Wilhelm/Baynes como
   tradução "popular", nota de que existe crítica textual.)
6. **Push time** — 06h local fixo ou adaptativo (jornada do usuário)?
   (Proposta v1: 06h fixo, v2 pode adaptar com opt-in.)
7. **Idiomas** — PT-BR only v1, EN v2, ES v3? (Proposta v1: PT-BR
   only, v2 adiciona EN se houver tração.)

---

## 11. Conexão com o restante do Plano

| Fase | Tarefa | Dependência de v1 |
|------|--------|-------------------|
| 1 | RQ-022 ✅ Synthesis v1 (este doc) | — |
| 1 | RQ-022b ⏳ Synthesis v2 (após feedback) | v1 |
| 1 | RQ-022c ⏳ Ethics Charter v1 (saída #5) | v1 |
| 1 | D-005 ⏳ Validar v1 com 3 perfis reais | v1 |
| 2 | RQ-023 ⏳ Mentor persona v1 | v1 §7 |
| 2 | RQ-026 ⏳ System prompt do Mentor | RQ-023 |
| 3 | RQ-024 ⏳ UX architecture v1 | v1 §4, §6 |
| 3 | D-020..D-025 | RQ-024 |
| 4 | RQ-025 ⏳ Tech stack v1 | v1 §5 (escolhas de engine) |
| 4 | D-030..D-036 | RQ-025 |
| 5 | D-040..D-044 | v1 §5 → TS puro |
| 6 | F-NNN implementação | Fase 5 |

---

## 12. Bibliografia consolidada (12 RQs + síntese)

### 12.1 Os 12 sistemas estudados (Fase 0)

- RQ-001 — Gene Keys (Richard Rudd)
- RQ-002 — Human Design (Ra Uru Hu)
- RQ-003 — MBTI / Jung
- RQ-004 — Enneagrama (Ichazo/Naranjo/R-H)
- RQ-005 — Co-Star (Banu Guler)
- RQ-006 — The Pattern (Lisa Donovan)
- RQ-007 — CHANI App (Chani Nicholas)
- RQ-008 — Cabala Clássica / Árvore da Vida
- RQ-009 — Numerologia Cabalística Ocidental
- RQ-010 — Tzolkin / Mayan Calendar
- RQ-011 — Ayurveda
- RQ-012 — Sheldrake + Cymatics

### 12.2 Síntese Fase 1 (dependências)

- RQ-020 — Patterns (20 convergentes)
- RQ-021 — Gaps (20 oportunidades únicas)

### 12.3 Fontes externas (chave)

- **Pittenger 2005** — crítica MBTI (psicologia acadêmica)
- **Florença 2020** — decisão judicial HD (precedente de copyright)
- **Scholem 1941** — Cabala (historiografia acadêmica)
- **Luria 1570** — Tikkun (fonte primária Cabala)
- **Brennan 2017** — Whole Sign revival (astrologia helenística)
- **Wilhelm/Baynes 1950** — I Ching (tradução canônica)
- **Rudd 2009** — Gene Keys (fonte primária)
- **Ra Uru Hu 1992** — Human Design (fonte primária)
- **Manohar 2018 IJME** — crítica Ayurveda (epistemologia)
- **BPI 2026 (Tiwari et al.)** — validação Prakriti (psicometria)
- **APA 2025 Health Advisory** — AI mental health
- **UCL 2013 / Huffman** — crítica numerologia Pitagórica
- **Maddox Nature 1981** — crítica Sheldrake (peer review)
- **Wiseman-Smith-Milton 1998 PubMed 9734300** — Sheldrake re-test
- **Schmidt-Böbel meta 2004 BJP** — meta-análise DMILS d=0.13
- **Chladni 1787 / Faraday 1831 / Jenny 1967** — Cymatics núcleo

(Detalhes completos em cada RQ-NN e em `patterns.md` §13.)

---

## 13. Confiança e honestidade epistêmica

**Confidence:** MED-HIGH no eixo central (PESSOA × 5 PILARES +
4 CAMADAS + MANDALA + MENTOR). A v1 é **um esqueleto defensável**
que precisa de:

- **3 perfis reais** (não fictícios) para validar (D-005, próxima
  etapa).
- **Renderização real da Mandala** (SVG) para validar visualmente
  (RQ-024).
- **Persona do Mentor** com system prompt real (RQ-023).
- **Ethics Charter** com 5% causa + LGPD explicitados (RQ-022b).

**Não-confiança:** o número-base de cada Pilar é hipotético até ser
implementado e testado com casos reais. Em particular, Pilar 3
(Numerologia Tântrica) tem canonicidade heterogênea — v2 deve
revisar.

**Próximo passo (v2):**

1. Implementar `Mandala.render()` em SVG (prototipagem rápida).
2. Escrever 30 Mandatos fictícios (10 por escala D/S/Z) e revisar
   tom.
3. Desenhar `mentor/persona_v1.md` (RQ-023).
4. Escrever `synthesis/ethics_charter_v1.md` (5% causa por Pilar +
   LGPD + crise).
5. Validar com 3 perfis fictícios + 1 perfil real (D-005).

---

**Fim do `synthesis_v1.md`. v2 = após feedback interno + RQ-023
Mentor persona v1 + Ethics Charter v1.**
