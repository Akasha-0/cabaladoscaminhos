# R-023 — Akasha Synthesis Framework

> **Data:** 2026-06-12
> **Versão:** 1.0
> **Dependências:** R-014 (HD Reverse-Engineering), R-015 (GK Reverse-Engineering), akasha-evolution-research.md
> **Timebox:** 90 min
> **Status:** ✅ PRONTO PARA IMPLEMENTAÇÃO

---

## 1. Propósito

Este documento define a **camada de síntese** do Akasha — o framework que transforma 5 mapas separados em 1 sistema unificado.

**Problema que resolve:**
- Usuário vê "Caminho de Vida: 11" sem entender o que isso significa na prática
- 5 mapas separados (Cabala, Astrologia, Tantra, Odu, I Ching) sem conexão entre si
- Nenhum framework de decisão ("o que eu faço com essa informação?")
- Sexualidade coberta com 1 frase por pilar, não com análise profunda

**O que este documento entrega:**
- Linguagem universal (9 Dimensões de Vida)
- Matriz de contribuição (qual pilar contribui para qual dimensão)
- Akasha Authority (framework de decisão)
- Fluxo de síntese (dados → narrativa → ação)

---

## 2. A Linguagem Universal — 9 Dimensões de Vida

Inspiração: Hierarquia de Maslow + 5 Pilares do Akasha.

Cada dimensão é uma **camada de necessidade humana** que todos os 5 pilares contribuem para traduzir.

```
┌─────────────────────────────────────────────────────────┐
│                    SUPERAÇÃO & DESAFIOS                │
│         (a ser, transcendência, transformação)          │
├─────────────────────────────────────────────────────────┤
│               ESPIRITUALIDADE & TRANSCENDÊNCIA          │
│            (propósito, missão, conexão cósmica)        │
├─────────────────────────────────────────────────────────┤
│                    PROPÓSITO & DESTINO                  │
│           (missão de vida, vocation, chiamado)          │
├─────────────────────────────────────────────────────────┤
│               CRIAÇÃO & EXPRESSÃO CRIATIVA              │
│               (arte, inovação, originality)            │
├─────────────────────────────────────────────────────────┤
│                  AMOR & RELACIONAMENTOS                │
│              (parceiros, família, comunidade)          │
├─────────────────────────────────────────────────────────┤
│                  SEXUALIDADE & DESEJO                  │
│           (intimidade, fantasia, conexão corporal)     │
├─────────────────────────────────────────────────────────┤
│                TRABALHO & PROSPERIDADE                 │
│            (carreira, dinheiro, recursos, valor)        │
├─────────────────────────────────────────────────────────┤
│                 SAÚDE & VITALIDADE                     │
│               (corpo, energia, longevidade)             │
└─────────────────────────────────────────────────────────┘
```

### 2.1 Definição de Cada Dimensão

| # | Dimensão | O que responde | Exemplos de pergunta |
|---|----------|----------------|---------------------|
| 1 | **Saúde & Vitalidade** | Como está meu corpo? Qual é minha energia hoje? | "Devo treinar ou descansar?" |
| 2 | **Trabalho & Prosperidade** | Qual carreira me realiza? Como melhorar dinheiro? | "Devo aceitar essa proposta?" |
| 3 | **Sexualidade & Desejo** | Como é minha sexualidade? O que me atrai? | "Por que repito padrões sexuais?" |
| 4 | **Amor & Relacionamentos** | Como me relaciono? Qual parceire é ideal? | "Devo ficar ou ir?" |
| 5 | **Criação & Expressão** | Como me expreso creativamente? | "Qual arte develop?" |
| 6 | **Propósito & Destino** | Para que vim? Qual minha missão? | "Devo mudar de caminho?" |
| 7 | **Família & Ancestralidade** | Qual é minha herança? O que carrego da família? | "Por que repito padrões familiares?" |
| 8 | **Espiritualidade & Transcendência** | Como me conecto com o divino? | "Qual prática espiritual para hoje?" |
| 9 | **Superação & Desafios** | Como transformo sombra em força? | "Qual é meu maior desafio agora?" |

---

## 3. Matriz de Contribuição dos 5 Pilares

A matriz responde: **"Qual pilar fala sobre qual dimensão?"**

| Dimensão | Cabala | Astrologia | Tantra | Odu | I Ching |
|----------|:------:|:----------:|:------:|:---:|:-------:|
| **Saúde & Vitalidade** | 🔴 Alta | 🟡 Média | 🔴 Alta | 🟢 Baixa | 🟢 Baixa |
| **Trabalho & Prosperidade** | 🔴 Alta | 🟡 Média | 🟡 Média | 🟢 Baixa | 🟢 Baixa |
| **Sexualidade & Desejo** | 🟡 Média | 🟡 Média | 🔴 Alta | 🟡 Média | 🟡 Média |
| **Amor & Relacionamentos** | 🟡 Média | 🔴 Alta | 🟡 Média | 🟡 Média | 🟡 Média |
| **Criação & Expressão** | 🔴 Alta | 🟡 Média | 🟡 Média | 🟢 Baixa | 🟡 Média |
| **Propósito & Destino** | 🔴 Alta | 🔴 Alta | 🟡 Média | 🟡 Média | 🟡 Média |
| **Família & Ancestralidade** | 🟢 Baixa | 🟡 Média | 🟡 Média | 🔴 Alta | 🟡 Média |
| **Espiritualidade & Transcendência** | 🔴 Alta | 🔴 Alta | 🔴 Alta | 🔴 Alta | 🔴 Alta |
| **Superação & Desafios** | 🔴 Alta | 🟡 Média | 🟡 Média | 🔴 Alta | 🔴 Alta |

**Legenda:**
- 🔴 **Alta** — Pilar PRIMÁRIO para esta dimensão. Fornece interpretação profunda e prática.
- 🟡 **Média** — Pilar SECUNDÁRIO. Fornece contexto e nuance.
- 🟢 **Baixa** — Pilar TERCIÁRIO ou não aplicável. Pouca ou nenhuma contribuição direta.

### 3.1 Detalhamento por Dimensão

#### DIMENSÃO 1: Saúde & Vitalidade

**Pilar Primário: Cabala + Tantra**

- **Cabala:** Número associated ao corpo físico (número de expressão, número de missão). Números mestres = vitalidade amplificada.
- **Tantra:** 11 Corpos — Corpo 5 (Físico), Corpo 1 (Ethereal), Corpo 2 (Corpo Emocional). Tensão no Corpo 5 = problema físico. Corpo 1 em tensão = fadiga sem causa física.
- **Astrologia:** Sol (vitalidade), Marte (energia), Casa 6 (rotinas de saúde). Aspectos entre Sol-Marte indicam tipo de energia física.
- **Odu:** Odu que governa saúde do born (ex: Ogbe = corpo forte mas precisa de ritmo)
- **I Ching:** Hexagramas de equilíbrio (Hex 51 = thunder, energy; Hex 62 = small excess)

**Síntese:** A saúde é determinada PRIMARIAMENTE pelo corpo tântrico em tensão (Corpo 5 = físico) e pela missão cabalística. Secundado por Marte e Casa 6.

#### DIMENSÃO 2: Trabalho & Prosperidade

**Pilar Primário: Cabala**

- **Cabala:** Número de expressão (COMO você se expressa no mundo = sua vocation). Número de missão (PARA QUE você veio = seu destino profissional).
- **Astrologia:** Casa 2 (dinheiro), Casa 10 (carreira), Venus (valores, prazer), Júpiter (expansão, abundância).
- **Tantra:** Muladhara (raiz, sobrevivência, dinheiro), Manipura (poder pessoal, autoconfiança, carreira).
- **Odu:** Odu que governa prosperidade (ex: Waste = obstacles to wealth that must be transformed)
- **I Ching:** Hex 48 (the well), Hex 5 (waiting), Hex 14 (great possessing)

**Síntese:** Sua carreira é primariamente definida pelo número de expressão cabalístico. Sua prosperidade depende do alinhamento entre seu Muladhara (Tantra), Venus (Astrologia) e Odu de nascimento.

#### DIMENSÃO 3: Sexualidade & Desejo

**Pilar Primário: Tantra + Astrologia**

- **Tantra:** CORPOS 2, 3, 6 — Corpo 2 (desejo root), Corpo 3 (mente positiva = sexualidade saudável), Corpo 6 (sexualidade relacionamental). Os 11 Corpos são a estrutura mais profunda para sexualidade.
- **Astrologia:** Venus (o que te atrai), Marte (como você Deseja ativamente), Lilith (sexualidade reprimida/oculta), Casa 8 (transformação sexual,shared resources).
- **Cabala:** Números mestres (11, 22, 33) = energia sexual amplificada/espiritualizada. Hod (glória) + Yesod (fundação) = sexualidade.
- **Odu:** Padrões de sexualidade por Odu (ex: Ejioko = sexualidade como transformação, Irosun = sexualidade como comunicação).
- **I Ching:** Hex 31 (request/courtship), Hex 54 (marrying maiden), Hex 52 (keeping still)

**Síntese:** Sexualidade é a dimensão mais complexa — requer os 5 pilares para síntese completa. O Corpo 2 (Tantra) é a raiz; Venus+Marte (Astrologia) é a linguagem; Odu é o padrão ancestral; I Ching é o timing; Cabala é a espiritualização.

#### DIMENSÃO 4: Amor & Relacionamentos

**Pilar Primário: Astrologia**

- **Astrologia:** Casa 5 (amor criativo, romance), Casa 7 (parceiros, casamento), Lua (necessidades emocionais), Venus (afeto, valores), Júpiter (expansão no relacionamento).
- **Cabala:** Número de expressão + Número de impressão (como você quer ser amado).
- **Tantra:** Anahata (4º chakra = coração) + Corpo 6 (relacionamento) + Corpo 3 (mente positiva na relação).
- **Odu:** Padrões de relacionamento por Odu (ex: Ogbe com Oyeku = grandes amores que transformam).
- **I Ching:** Hex 44 (coming to meet), Hex 45 (gathering), Hex 63 (after completion)

**Síntese:** Astrologia lidera (Casa 5, 7, Venus), complementada pelos Corpos 6+3 (Tantra). Odu adiciona o padrão ancestral específico. Cabala diz COMO você se expressa no relacionamento.

#### DIMENSÃO 5: Criação & Expressão

**Pilar Primário: Cabala + Astrologia**

- **Cabala:** Número de expressão = sua forma de criar e se expressar. Hod (glória) = criatividade. Netzach (vitória) = imaginação.
- **Astrologia:** Sol (individualidade criativa), Casa 5 (criação, filhos, prazer), Mercúrio (comunicação), Plutão (transformação criativa).
- **Tantra:** Corpo 5 (físico = expressão artística pelo corpo), Corpo 7 (comunicação, voz).
- **Odu:** Padrão de criação (ex: Owonrin = criação através da arte, Odí = criação através do conflito).
- **I Ching:** Hex 17 (following), Hex 35 (progress), Hex 49 (revolution)

**Síntese:** A criação é primariamente expressão do número cabalístico,modulada pelo Sol e Casa 5 astrológicos. O corpo físico (Corpo 5) é o instrumento.

#### DIMENSÃO 6: Propósito & Destino

**Pilar Primário: Cabala + Astrologia**

- **Cabala:** Caminho de vida (missão de vida), Número de missão, Árvore das 10 sefirot (Keter = propósito superior, Malkuth = manifestação).
- **Astrologia:** Sol (alma, propósito), Júpiter (expansão, significado), Casa 10 (missão pública), Nódulos Lunares (karma, direção).
- **Tantra:** Sahasrara (7º chakra = propósito), Corpo 7 (corpo de finalidade).
- **Odu:** Odu de nascimento = mandato de vida (ex: Ogbe = liderança, Irosun = comunicação).
- **I Ching:** Hex 55 (abundance), Hex 37 (family/multiplying), Hex 57 (gentle penetration)

**Síntese:** Propósito é a dimensão mais alta — requer síntese dos 3 pilares mais elevados: Cabala (Keter/Malkuth), Astrologia (Sol/Júpiter/Casa 10), Odu (mandato). Tantra (Sahasrara) fornece o canal de entrega.

#### DIMENSÃO 7: Família & Ancestralidade

**Pilar Primário: Odu**

- **Odu:** Odu é IORUBÁ — ancestralidade é o núcleo. Odu de nascimento carrega o padrão familiar. Odu de Ifá é literalmente divinação ancestral.
- **Astrologia:** Casa 4 (família, lar, pai/mãe), Nódulos Lunares (karma familiar), Saturno (pai), Lua (mãe).
- **Tantra:** Corpo 8 (ancestral, ligação com mortos), Corpo 4 (mente negativa herdada da família).
- **Cabala:** Yesod (fundação = ancestralidade), Tribes of Israel (padrão familiar específico).
- **I Ching:** Hex 52 (keeping still/ancestors), Hex 2 (receptive/ancestors)

**Síntese:** Odu é in substitution — é o único Pilar com ancestralidade iorubá native. Astrologia (Casa 4) complementa com dinâmicas familiares. Corpo 8 (Tantra) conecta comancestrais.

#### DIMENSÃO 8: Espiritualidade & Transcendência

**Pilar Primário: Todos os 5 (alta)**

- **Cabala:** Árvore das 10 sefirot — caminho entre os mundos, Da'at (conhecimento), Keter (coroa/trância).
- **Astrologia:** Casa 9 (expansão, духовность), Neptuno (iluminação, transcendência), Sagitário ( Buscas espirituais).
- **Tantra:** Sahasrara (7º chakra = espiritualidade pura), Corpo 1 (corpo etéreo = acesso ao divino).
- **Odu:** Odu é espiritualidade IORUBA — cada Odu tem ritual, cant, oferenda. Odu de Ifá é meio de comunicação com Orumila (Orunmila).
- **I Ching:** Hex 1 (creative), Hex 2 (receptive), Hex 11 (peace), Hex 20 (contemplation)

**Síntese:** Espiritualidade é a única dimensão onde TODOS os pilares contribuem igualmente. Cada tradição tem sua via de acesso ao divino: Cabala (sefirot), Astrologia (Neptuno/9ª casa), Tantra (Sahasrara), Odu (Ifá), I Ching (TaO).

#### DIMENSÃO 9: Superação & Desafios

**Pilar Primário: Cabala + Odu**

- **Cabala:** Shin (dente = fogo da transformação), Ayin (olho = confrontação com a sombra), Tau (cruz = sacrifício). Números de sombra (número de lição de vida).
- **Odu:** Odu é LITERALMENTE sobre obstáculos e como superá-los. O sistema de Odu nasceu para isso.
- **Astrologia:** Saturno (restrição, karma, disciplina), Plutão (transformação, morte/renascimento), Casa 8 (recursos compartilhados, sexualidade profunda).
- **Tantra:** Corpo 4 (mente negativa = principal desafio), Corpo 2 (corpo emocional = zona de sombra).
- **I Ching:** Hex 4 (youthful folly), Hex 18 (work on what has been spoiled), Hex 29 (danger), Hex 39 (obstruction)

**Síntese:** Odu lidera — seu Odu de nascimento define seu principal desafio de vida. Cabala (sombra) fornece a linguagem da transformação. Astrologia (Saturno/Plutão) indica timing.

---

## 4. Akasha Authority — O Framework de Decisão

Inspiração: HD Strategy + Authority (HD) + Contemplation Program (GK).

### 4.1 O Problema

O usuário tem informação mas não sabe O QUE FAZER com ela. Quando tomar decisões importantes, não há régua.

### 4.2 A Solução: Akasha Authority

> **"Antes de qualquer decisão importante, pergunte: isso vem da minha paz interior ou da minha ansiedade? Se vem da ansiedade (Corpo 4), espere. Se vem da paz (Corpo 3), aja."**

Este é o **Akasha Authority** — a regra de decisão que conecta o mapa pessoal a ações concretas.

### 4.3 Fundamento nos 5 Pilares

**Corpo 3 (Tantra) = Mente Positiva = Paz Interior:**
- Estado de clareza, certeza, decisão que "casa" no corpo
- Sensação: "Isso é certo" — não no脑子 (mente), mas no corpo (plexo solar, coração)
- Tradução Cabala: Din (juízo) + Chesed (misericórdia) equilibrados
- Tradução Astrologia: Lua em aspecto harmonioso com Sol
- Tradução Odu: Odu em estado de graça (bênção)

**Corpo 4 (Tantra) = Mente Negativa = Ansiedade:**
- Estado de dúvida, medo, decisão baseada em preocupação
- Sensação: "E se der errado?" — no estómago, na cabeça
- Tradução Cabala: Hod (glória) em excesso =omania, obsessão
- Tradução Astrologia: Marte em tensão com Saturno ou Plutão
- Tradução Odu: Odu em estado de tensão (Ori)

### 4.4 Árvore de Decisão

```
┌──────────────────────────────────────────┐
│  DECISÃO IMPORTANTE                      │
│  (mudança de emprego, decisão relacional,│
│   compra grande, mudança de cidade)       │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  PERGUNTE-SE:                           │
│  "Isso vem da paz ou da ansiedade?"      │
│                                          │
│  [Sinais de Paz (Corpo 3):]             │
│  ✓ Clareza mental                       │
│  ✓ Energia no corpo (não exaustão)       │
│  ✓ Sono tranquilo na noite anterior      │
│  ✓ Decisão "casa" no peito              │
│                                          │
│  [Sinais de Ansiedade (Corpo 4):]       │
│  ✗ Pensamento acelerado                 │
│  ✗ Padrão de "e se..."                  │
│  ✗ Insônia ou sono inquieto             │
│  ✗ Decisão "gira" na cabeça             │
└──────────────┬───────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────────────┐
│ PAZ (Corpo 3)│  │ ANSIEDADE (Corpo 4)│
│              │  │                     │
│     AJA      │  │     ESPERE          │
│              │  │                     │
│Execute a      │  │Aguarde até que a    │
│decisão com   │  │ansiedade se         │
│confiança     │  │transforme em paz    │
│              │  │ou até 参考 timing   │
│              │  │(Saturno/Marte/      │
│              │  │Odu) indicar        │
└─────────────┘  └─────────────────────┘
```

### 4.5 Aplicação Prática no App

**No "Meu Dia" (F-224):**
- Mostrar: "Seu Corpo em Tensão HOJE é o Corpo 4 (Mente Negativa)"
- Mostrar: "AKASHA AUTHORITY: Evite decisões importantes hoje. Se precisar decidir, pergunte: isso vem da paz ou da ansiedade?"
- Mostrar: "Timing favoravel: após 14h quando Marte sai de Escorpião"

**No "Caixa" (F-223):**
- Cada dimensão tem seção "Quando DECIDIR" com a regra: Paz = Aja, Ansiedade = Espere

### 4.6 Timing — Quando APLICAR a Decisão

Akasha Authority não é só "espere ou aja" — é também "QUANDO":

| Situação | Timing | Fonte |
|----------|--------|-------|
| Decisão imediata | Aguarde até momento de paz | Akasha Authority |
| Decisão de carreira | Timing de Saturno | Astrologia (Saturno retorno) |
| Decisão relacional | Lua crescente | Astrologia (Casa 5) |
| Decisão financeira | Período de Odu favorável | Odu (Ifá timing) |
| Iniciar novo projeto | Hexagrama de início favorável | I Ching (Hex 1, 17, 26) |

---

## 5. Fluxo de Síntese — Como Dados se Tornam Narrativa

### 5.1 Pipeline de Dados → Ação

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE SÍNTESE AKASHA                     │
└─────────────────────────────────────────────────────────────────────┘

PILARES (dados brutos)
├── Cabala: Caminho 11, Expressão 5, Impressão 8, Missão 3...
├── Astrologia: Sol Escorpião 15°, Lua Gêmeos 3°, Marte Áries 22°...
├── Tantra: Corpo 3 ativo, Corpo 4 em tensão, Corpo 6 ativo...
├── Odu: Ogbe (liderança), Oyeku (comunicação)...
└── I Ching: Hexagrama 26 (Great Force), Hexagrama 3 (Difficulty)...

                          ↓
              AGREGADOR DE MAPA (hologram-aggregator.ts existente)
                          ↓
              MAPA PESSOAL SINTÉTICO
              {
                caminhoVida: 11,
                corpoEmTensao: "Corpo 4",
                oduNascimento: "Ogbe",
                solEscorpiao: true,
                hexagrama: 26
              }

                          ↓
              SÍNTESE POR DIMENSÃO (nova camada)
┌─────────────────────────────────────────────────────────────┐
│ DIMENSÃO: Sexualidade & Desejo                              │
│                                                             │
│ PILAR 1 (Cabala): Número de expressão 5 = comunicação...   │
│ PILAR 2 (Astrologia): Venus em Áries + Marte em Leão...     │
│ PILAR 3 (Tantra): Corpo 2 (desejo) ativo, Corpo 6...       │
│ PILAR 4 (Odu): Ogbe + Oyeku = atração por transformação  │
│ PILAR 5 (I Ching): Hex 31 + Hex 54 = padrão de relação   │
│                                                             │
│ → SÍNTESE: "Você sente desejo intenso quando..."           │
└─────────────────────────────────────────────────────────────┘

                          ↓
              NARRATIVE GENERATOR (F-226 — RAG + significados-curados.ts)
                          ↓
              NARRATIVA DE VIDA (parágrafo narrativo)
┌─────────────────────────────────────────────────────────────┐
│ "Você é um Canal — Caminho 11                              │
│                                                             │
│ Seu número 11 significa que você não veio para construir  │
│ (22) nem para ensinar (33). Você veio para SER o fio que  │
│ conecta o visível ao invisível.                            │
│                                                             │
│ Na sexualidade, isso se manifesta como: você sente antes  │
│ de pensar. Seu corpo capta a energia do ambiente antes     │
│ de sua mente processar. Você é atraído por profundidade   │
│ emocional (Escorpião no Sol) e expressa desejo de forma  │
│ intensa mas sutil (Corpo 2 + Venus em Áries).             │
│                                                             │
│ Seu desafio: a tentação de viver no plano das ideias      │
│ (imaginando sexualidade perfeita) sem concretizar no      │
│ corpo. Seu chamado: transformar desejo em arte."          │
└─────────────────────────────────────────────────────────────┘

                          ↓
              AKASHA AUTHORITY (regra de decisão)
                          ↓
              AÇÃO RECOMENDADA
┌─────────────────────────────────────────────────────────────┐
│ RECOMENDAÇÃO PARA HOJE:                                     │
│                                                             │
│ ⚠️  Seu Corpo 4 (Mente Negativa) está em tensão.          │
│     AKASHA AUTHORITY: Evite decisões sobre parcerias.       │
│     Se sentir impulso de iniciar algo,pergunte:            │
│     "Isso vem da paz ou da ansiedade?"                    │
│                                                             │
│ ✅ PRÁTICA: 3 respirações profundas antes de qualquer     │
│    decisão importante.                                      │
│                                                             │
│ ⏰ TIMING: Após 14h — Marte sai de Escorpião.            │
│    Momento favorável para conversas sobre relacionamentos.  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Estrutura da Síntese por Dimensão

Cada dimensão no "Caixa" segue este formato:

```typescript
interface DimensaoSintese {
  dimensoes: string;                    // "Sexualidade & Desejo"
  
  contribuicoes: {
    pilar: 'cabala' | 'astrologia' | 'tantra' | 'odu' | 'iching';
    contribuicao: string;               // "Venus em Áries + Marte em Leão"
    interpretacao: string;              // "Atraído por intensidade mas expressa com dramatismo"
    nivel: 'primario' | 'secundario' | 'terciario';
  }[];
  
  synthes: string;                       // "Você sente desejo intenso quando..."
  
  praktika: string;                     // "Prática recomendada para esta dimensão"
  
  alerta: string;                        // "O que evitar nesta dimensão"
  
  autoridadeAkasha: {
    tipo: 'paz' | 'ansiedade';
    aplicavel: boolean;
    timing?: string;                     // "Após 14h quando Marte sai de Escorpião"
  };
}
```

---

## 6. Estrutura de Arquivos para Implementação

Base: `apps/akasha-portal/src/`

```
lib/
├── grimoire/
│   ├── significados-curados.ts        # (EXISTE — 1,841 linhas)
│   ├── traducao-areas.ts              # (EXISTE — 9 áreas × 5 pilares)
│   ├── sexualidade-curados.ts         # [NOVO F-225]
│   ├── narrativa-generator.ts          # [NOVO F-226]
│   ├── akasha-authority.ts            # [NOVO F-227]
│   ├── synthesis/
│   │   ├── dimensoes.ts               # [NOVO] — 9 dimensões com definição
│   │   ├── matriz-contribuicao.ts     # [NOVO] — matriz pillar × dimensão
│   │   └── synthesizer.ts             # [NOVO] — motor de síntese
│   └── hologram-aggregator.ts         # (EXISTE)
│
components/akasha/
├── CaixaUnificada/
│   ├── DimensaoCard.tsx               # [NOVO F-223]
│   ├── SinteseNarrativa.tsx           # [NOVO F-223]
│   └── index.tsx                      # [NOVO F-223]
├── SexualidadePanel/
│   ├── SexualidadeSintese.tsx         # [NOVO F-225]
│   └── index.tsx                      # [NOVO F-225]
└── AkashaAuthority/
    └── AuthorityPrompt.tsx             # [NOVO F-227]
```

---

## 7. Referências

| Fonte | Arquivo | Relevância |
|-------|---------|-----------|
| HD Reverse-Engineering | `research/synthesis/hd-reverse-engineering.md` | Modelou como HD unificou 3 sistemas. Akasha segue padrão similar. |
| GK Reverse-Engineering | `research/synthesis/gk-reverse-engineering.md` | Framework Shadow→Gift→Siddhi; tom contemplativo |
| Evolution Research | `research/synthesis/akasha-evolution-research.md` | Problema completo + análise de concorrentes |
| Conteúdo Curado | `lib/grimoire/significados-curados.ts` | Fonte primária de conteúdo (1,841 linhas) |
| Tradução por Área | `lib/grimoire/traducao-areas.ts` | 9 áreas × 5 pilares — base da síntese |
| Hologram Aggregator | `lib/domain/mapa/hologram-aggregator.ts` | Framework de agregação existente |

---

## 8. Próximos Passos

1. **F-223 (Caixa)** — Implementar página única com 9 dimensões usando este framework
2. **F-224 (Meu Dia)** — Homepage mobile que usa Akasha Authority + timing
3. **F-225 (Sexualidade)** — Expandir conteúdo usando matriz de contribuição (Tantra + Astrologia como primários)
4. **F-226 (Narrativa)** — Conectar dados → parágrafo narrativo usando significados-curados.ts
5. **F-227 (Authority)** — Implementar Akasha Authority como componente reutilizável
