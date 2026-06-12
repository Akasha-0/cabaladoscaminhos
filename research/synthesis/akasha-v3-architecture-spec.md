# Akasha v3 — Especificação de Arquitectura
**Data:** 2026-06-12
**Versão:** 0.1 (rascunho — aguardar resultados dos agentes de pesquisa)
**Autor:** Sistema Akasha / Equipa Cabala dos Caminhos

---

## 1. Diagnóstico — O que está errado no Akasha actual

### 1.1 O Problema da Superficialidade

O utilizadorreporta que o Akasha **não entrega compreensão profunda**. Exemplos concretos:

| O que o utilizador recebe HOJE | O que ele ESPERAVA |
|---|---|
| "Seu número é 11. Você é Iluminador." | "Você é um Iluminador — e isso significa que no trabalho você não deve buscar validation externa, mas actuar a partir de uma visão interior. Quando você actua desde o 11, as portas abrem sem que você force. Quando força, perde." |
| Lista de qualidades do Life Path | Uma narrativa que diz **porquê** você tem esses traços e **o que fazer** com eles hoje |
| 5 mapas separados a mostrar "a Cabala diz X, a Astrologia diz Y" | **UMA voz** que diz "Você é X **por causa de** todos estes factores: o seu Life Path 11, o seu Sol em Leão, o seu Corpo Tântrico 8..." |

### 1.2 Raiz do Problema

O `narrative-generator.ts` v3 tem **3 falhas arquitectónicas**:

**Falha 1 — `firstSentence()` destrói profundidade:**
```typescript
// Linha 66: firstSentence() trunca todo o conteúdo profundo
function firstSentence(text: string): string {
  return text.split('.')[0] + '.';
}
```
`firstSentence(sCabala.essencia)` converte uma descrição rica de 3 frases numa única frase genérica.

**Falha 2 — Fragmentação em vez de síntese:**
```typescript
// gerarPerfilGeral() — linhas 80-114
// Apenas 1 pilar é seleccionado por área
if (sCabala) { parts.push(`Você é ${sCabala.titulo}. ${sCabala.essencia}`); }
if (sAstro) { parts.push(`${solSigno} é como você se manifesta...`); }
```
Não há síntese — são 4 frases desconectadas sobre a mesma pessoa.

**Falha 3 — `buildSaude()` e similares usam apenas 2 fontes:**
```typescript
// buildSaude() — linhas 160-187
// Apenas sTantra.essencia + 1 frase de traducao
if (sTantra) {
  lines.push(`${sTantra.essencia} Seu corpo pede atenção...`);
}
const tradSaude = traducs.find((t) => t.pilar === 'tantrica' || t.pilar === 'cabala');
```
Mas existem **5 pilares** com conteúdo sobre saúde. Apenas 2 são usados.

### 1.3 O que FUNCIONA (conteúdo existente)

O conteúdo em `significados-curados.ts` e `traducao-areas.ts` é **profundo**:

```
// traducao-areas.ts — Cabala para 'sexualidade':
"Números Mestres (11, 22, 33) carregam energia sexual/espiritual amplificada.
O 11 é o Canal — sexualidade vista como portal, fusão de corpos e visões.
Você não quer só prazer: quer SIGNIFICADO.
Recuse sexo que esvazia; busque o que ilumina."

// traducao-areas.ts — Astrologia para 'proposito':
"O Nodo Norte (Júpiter evoluído) é a direção da alma.
A direção do Nodo Sul (que você já conhece) é onde você fica preso.
A vida pede: vá do Sul pro Norte, mesmo com medo."
```

**O conteúdo é excelente — o problema é a arquitectura de síntese.**

---

## 2. Visão — O que o Akasha deve ser

### 2.1 Analogia: Human Design como referência

O Human Design (Ra Uru Hu, 1987) fez algo revolucionário: **unificou 4 tradições** (I Ching, Cabala, Astrologia, Hindu chakras) num **sistema único com voz própria**.

O Akasha deve fazer o mesmo com **5 tradições**:

```
                    CABALA          → Fornece: Life Path, Número de Expressão
                   /    \                Virtudes, Números Mestre
                  /      \
ASTROLOGIA ───── AKASHA ←→ TANTRA
(Planetas/Casas)  \      /   (Corpos Sutis)
                   \    /
                    ODU
              (Ancestralidade)
                      \
                     I CHING
                (Mutação do caminho)
```

**O Akasha NÃO é Cabala, NÃO é Astrologia, NÃO é Tantra.**
**O Akasha é O AKASHA** — uma nova síntese que traduz todas estas tradições numa linguagem universal.

### 2.2 A Regra de Ouro

> **Cada narrativa do Akasha deve responder 3 perguntas:**
> 1. **Quem é você?** (identidade profunda, não estereótipo)
> 2. **Porquê isso importa?** (correlação entre os 5 pilares)
> 3. **O que fazer?** (acção concreta, prática, diária)

### 2.3 O Modelo de Frequência (Gene Keys inspired)

Inspirado nos Gene Keys (Richard Rudd, 2001), cada dimensão opera em 3 frequências:

| Frequência | Descrição | O que o utilizador vive |
|---|---|---|
| **Sombra** | padrão inconsciente de sofrimento | "Eu sempre escolho o trabalho errado" |
| **Dom** | génio e amor inato | "Eu sei criar com facilidade quando..." |
| **Realização** | transcendência do padrão | "A escolha que antes era difícil agora é óbvia" |

O Akasha identifica **em que frequência** o utilizador está **em cada área de vida** e diz **como subir**.

---

## 3. Arquitectura Akasha v3

### 3.1 O Sistema Akasha — 5 inputs, 1 output

```
┌─────────────────────────────────────────────────────┐
│                    PILARES INPUT                      │
├──────────┬──────────┬──────────┬─────────┬──────────┤
│  CABALA  │ ASTROLOGIA│ TANTRA  │   ODU   │ I CHING  │
│          │          │          │         │          │
│ Life Path│ Sol/Lua  │11 Corpos │ 16 Odu  │64 Hex.   │
│ Expr/Nome│ Casas/Plnt│Trigêmeos│ Ifá     │Wilhelm   │
│ Ano Pess.│ Trânsitos│Temperam.│Candomblé│Mutações  │
└──────────┴──────────┴──────────┴─────────┴──────────┘
           ↓            ↓           ↓
┌─────────────────────────────────────────────────────┐
│              MOTOR DE SÍNTESE AKASHA v3              │
│                                                      │
│  1. Agregar todos os 5 pilares por área de vida    │
│  2. Identificar tema dominante (síntese cruz.)      │
│  3. Gerar narrativa ÚNICA por dimensão               │
│  4. Derivar decisão diária (Akasha Authority)       │
│  5. Mapear frequência (sombra → dom → realiz.)       │
└─────────────────────────────────────────────────────┘
           ↓            ↓           ↓
┌─────────────────────────────────────────────────────┐
│              OUTPUT: SISTEMA ÚNICO AKASHA             │
│                                                      │
│  Perfil Akasha  │  6 Áreas de Vida  │  Decisão     │
│  (quem é você) │  (síntese profunda) │  do Dia      │
│                 │                     │              │
│  - Tipo        │  - Vitalidade       │  Strategia   │
│  - Perfil      │  - Conexões         │  Autoridade  │
│  - Sequência   │  - Carreira         │  Acção/Hoje  │
│  - Frequência  │  - Propósito        │  Evitar      │
│  - Decisão     │  - Desafios         │              │
└─────────────────────────────────────────────────────┘
```

### 3.2 Interface de Output — `AkashaProfile`

```typescript
interface AkashaProfile {
  /** Tipo Akasha — derivado da síntese dos 5 pilares */
  tipo: 'Iluminador' | 'Construtor' | 'Canal' | 'Guardião' | 'Catalisador';

  /** Perfil de 2 números (equivalente ao HD Profile 1/3, 2/4, etc.) */
  perfil: string;  // ex: "1/3 — Iniciador e Realizador"

  /** Sequência activa (equivalente às 3 sequências dos Gene Keys) */
  sequencia: 'vitalidade' | 'coração' | 'propósito';

  /** Nível de frequência global */
  frequencia: 'sombra' | 'dom' | 'realizacao';

  /** Score 0-100 para transformação */
  indiceTransformacao: number;

  /** Decisão Akasha — quando actuar / esperar / observar */
  decisao: AkashaDecision;

  /** Narrativa de perfil — texto unificado e profundo */
  narrativas: {
    /** Perfil completo — quem é esta pessoa */
    perfil: string;  // 8-12 frases
    /** A área de vida mais importante HOJE */
    areaFoco: AreaNarrative;
    /** Todas as 6 áreas */
    areas: Record<LifeArea, AreaNarrative>;
    /** Sexualidade deep dive */
    sexualidade: SexualidadeNarrativa;
  };
}
```

### 3.3 Interface por Área — `AreaNarrative`

```typescript
interface AreaNarrative {
  area: LifeArea;

  /** Título da área */
  titulo: string;

  /** A frequência dominante nesta área (sombra/dom/realizacao) */
  frequencia: Frequencia;

  /** Quem é você NESTA área (identidade específica, não genérica) */
  quemVoceE: string;  // 3-5 frases

  /** Porque isto importa — correlação entre pilares */
  porqueImporta: string;  // 4-6 frases

  /** O padrão de sombra — o que vive quando não sabe */
  padraoSombra: {
    descricao: string;        // 2-3 frases
    sinais: string[];         // 3-5 sinais concretos
    fraseChave: string;       // 1 frase de alerta
  };

  /** O dom — o que pode se tornar */
  padraoDom: {
    descricao: string;
    forcas: string[];
    fraseChave: string;
  };

  /** Contribuição de cada pilar para esta área (para transparência) */
  contribPilar: {
    cabala: string;     // 1 frase: o que Cabala diz sobre esta área
    astrologia: string;
    tantra: string;
    odu: string;
    iching: string;
  };

  /** Acção concreta para HOJE */
  acaoHoje: string;  // 1-2 frases + instrução

  /** O que evitar hoje */
  evitarHoje: string;

  /** Ritual sugerido (3-10 min) */
  ritual: {
    titulo: string;
    instrucao: string;
    duracao: string;
  };

  /** Uma pergunta de transformação */
  perguntaAutoconhecimento: string;
}
```

### 3.4 Akasha Authority — O Sistema de Decisão

Inspirado no Strategy + Authority do Human Design:

```typescript
interface AkashaDecision {
  /** Estratégia: como tomar decisões */
  estrategia: 'act' | 'wait' | 'observe' | 'surrender';

  /** Autoridade: o que consultar antes de decidir */
  autoridade: 'emocional' | 'sagrada' | 'esplénica' | 'mental';

  /** Explicação da estratégia para HOJE */
  explicacao: string;  // 3-5 frases: porquê esperar/agir HOJE

  /** Regra prática: "se sentir X, então faça Y" */
  regra: {
    condicao: string;   // ex: "se sentir ansiedade sobre a decisão"
    accao: string;      // ex: "espere 24h antes de actuar"
  };

  /** Decisão específica para HOJE nesta área de foco */
  decisaoHoje: {
    area: LifeArea;
    acao: string;       // ex: "não inicie conversa importante hoje"
    motivo: string;      // 1 frase: porque não deve agir
  };

  /** Timing: quando é o melhor momento para decidir */
  timing: {
    melhor: string;   // ex: "quando sentir paz ao pensar nela"
    pior: string;     // ex: "quando sentir ansiedade no estômago"
  };
}
```

### 3.5 Interface de Sexualidade — `SexualidadeNarrativa`

```typescript
interface SexualidadeNarrativa {
  /** Arquetipo sexual */
  arquetipo: {
    nome: string;        // ex: "O Iluminador Sensual"
    descricao: string;  // 4-6 frases: como é na intimidade
    forca: string;      // o que带来 ao parceiro
    armadilha: string;  // o que pode sabotar
  };

  /** Os 4 marcadores integrados */
  marcadores: {
    corpoTantra: string;  // ex: "Corpo 8 (Prana) — energia sexual como prana"
    sol: string;          // ex: "Sol em Leão — precisa de admiração e generosidade"
    lilith: string;       // ex: "Lilith em Escorpião — intensidade que não se controla"
    casa8: string;        // ex: "Casa 8 em Virgem — desejo de PURIFICAÇÃO através do sexo"
  };

  /** Padrão de relacionamento sexual */
  padraoRelacional: {
    busca: string;     // o que inconscientemente busca
    medo: string;      // o que teme
    padraoRepetido: string;  // como o padrão se repete
  };

  /** Fantasias e desejos */
  vidaIntima: {
    oQueExcita: string[];
    oQueRepele: string[];
    DesejoOculto: {
      desejo: string;
      medo: string;
      cura: string;
    };
  };

  /** Transformação */
  caminhoTransformacao: {
    faseActual: string;   // sombra → dom → realizacao
    proximoPasso: string;
    sinalDeProgresso: string;
  };

  /** Acção prática */
  pratica: {
    titulo: string;
    instrucao: string;
  };
}
```

---

## 4. O Motor de Síntese — Arquitectura Técnica

### 4.1 Problema: Síntese Actual é Concatenação

```
// ANTES (v2) — concatenação de fragmentos:
function buildSaude(pilares, traducs, sCabala, sTantra) {
  lines.push('**Você é — Saúde**\n');
  if (sTantra) {
    lines.push(`${sTantra.essencia} Seu corpo pede atenção...`);
  }
  const tradSaude = traducs.find(...);
  if (tradSaude) {
    lines.push(`\n**Na prática**\n${tradSaude.frase}`);
  }
  return lines.join('\n');  // ❌ Lista, não narrativa
}

// DEPOIS (v3) — síntese profunda:
function buildSaude(pilares): string {
  // 1. Agregar TODOS os pilares relevantes para saúde
  const cabalaSaude = traducaoPara('cabala', 'saude');
  const astroSaude = traducaoPara('astrologia', 'saude');
  const tantraSaude = traducaoPara('tantrica', 'saude');
  const oduSaude = traducaoPara('odu', 'saude');
  const ichingSaude = traducaoPara('iching', 'saude');

  // 2. Identificar o tema que emerge da síntese
  const tema = synthesizeTheme([cabalaSaude, astroSaude, tantraSaude, oduSaude, ichingSaude]);

  // 3. Gerar narrativa fluída (sem firstSentence!)
  return generateFlowingNarrative({
    identity: sCabala?.essencia,  // não truncar!
    theme: tema,
    practice: bestPractice([sCabala?.pratica, tantraSaude?.frase, ...]),
    warning: sombraPattern([sCabala?.sombra, astroSombra, ...]),
    contribution: { cabala: cabalaSaude?.frase, astro: astroSaude?.frase, ... }
  });
}
```

### 4.2 Arquitectura do Motor de Síntese

```
┌─────────────────────────────────────────────────────────────┐
│                    synthesizeAkasha(pilares)                  │
│                                                             │
│  1. deriveAkashaType(pilares)                              │
│     → tipo + perfil (ex: "Iluminador 1/3")                │
│     → sequencia (vitalidade/coracao/proposito)             │
│     → frequencia (sombra/dom/realizacao)                   │
│                                                             │
│  2. deriveDailyDecision(pilares, date)                     │
│     → estrategia + autoridade + timing                    │
│     → accaoHoje + evitar                                  │
│                                                             │
│  3. Para cada LifeArea:                                    │
│     deriveAreaNarrative(area, pilares)                      │
│       → agregar 5 pilares                                 │
│       → identificar tema + frequência                       │
│       → gerar: quemVoceE + porqueImporta                   │
│       → gerar: padraoSombra + padraoDom                    │
│       → gerar: acaoHoje + evitar + ritual                  │
│                                                             │
│  4. deriveSexualidadeNarrative(pilares)                    │
│     → 4 marcadores integrados                              │
│     → arquetipo + padrão relacional                         │
│     → caminho transformação                                │
│                                                             │
│  5. generateAkashaNarrative(profile, areas, decision)    │
│     → narrativa de perfil fluída                           │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Regras da Narrativa Akasha

1. **Primeira pessoa:** "Você é..." (não "O Cabala diz..." / "A Astrologia diz...")
2. **NÃO usar `firstSentence()`** — usar o conteúdo COMPLETO
3. **Terminar sempre com acção** — prática ou pergunta
4. **Não citar tradições** — o Akasha é uma voz, não um catálogo
5. **Cada pilar contribui** — mostrar que a síntese vem de múltiplas fontes
6. **Frequência visível** — dizer se está em sombra/dom/realização

---

## 5. Conteúdo Existente — O que usar

### 5.1 Significados Curados (`significados-curados.ts`)

| Campo | Uso em v3 |Nota|
|---|---|---|
| `essencia` | `quemVoceE` na área relevante | Manter completo, não truncar |
| `missao` | Parte de `porqueImporta` | Manter |
| `sombra` | `padraoSombra.descricao` | Manter |
| `pratica` | `acaoHoje` | Manter |
| `conexao` | Referência cruzada (mostrar correlações) | Manter |

### 5.2 Tradução por Área (`traducao-areas.ts`)

| Campo | Uso em v3 | Nota |
|---|---|---|
| `frase` | `contribPilar.{pilar}` (1 frase por pilar) | MANTER COMPLETO |
| `fonte` | Para curadores (não exposto ao utilizador) | Manter |

**CONTEÚDO JÁ EXISTENTE — PRECISA SER USADO NA ÍNTEGRA, NÃO TRUNCADO.**

### 5.3 O que PRECISA SER CRIADO

1. **Texto de correlação entre pilares** — o que não existe em lado nenhum
   - "Quando o seu Life Path 11 (Cabala) se encontra com o seu Sol em Leão (Astrologia)..."
   - Este é o valor único do Akasha

2. **Textos de frequência** — sombra → dom → realizacao por área
   - Como o padrão de sombra se manifesta nesta pessoa específica
   - Como a transformação acontece na prática

3. **Akasha Authority detalhado** — derivation algorithm para estratégia + autoridade
   - Baseado nos 5 pilares (não apenas na primeira dimensão)

---

## 6. Página "Meu Dia" — UX Mobile-First v3

### 6.1 Hierarquia de Conteúdo (do mais importante ao menos)

```
1. DECISÃO AKASHA (hero — topo)
   "Aja / Espere / Observe / Entregue"
   Regra prática: "Se sentir X, então faça Y"
   Timing: "O melhor momento é quando..."

2. PERFIL DE HOJE (resumo profundo)
   "Você é [Tipo Akasha] — [Perfil]"
   Narrativa de 4-5 frases que resume quem é hoje

3. ÁREA DE FOCO
   A área mais importante para HOJE (não todas)
   → Narrativa completa (quemVoceE + porqueImporta + acaoHoje)

4. RASGUNHO DAS OUTRAS ÁREAS
   Grid 3x2 — acesso rápido
   toque → expande para narrativa completa

5. SEXUALIDADE (separador ou link)
   "Sexualidade & Desejo →"
   Página dedicada com narrativa deep dive
```

### 6.2 Exemplo de Narrativa de Área (Saúde v3)

```
VOCÊ É — SAÚDE
[Corpo Físico + Life Path integrados]

Seu Corpo 8 de Prana é a mola-mestra da sua vitalidade — a energia
sexual, o fogo interior, o que te faz acordar com propósito. Mas você
vive mais no Corpo 3 (Mente Positiva) do que no 8, o que significa que
sua energia está mais na cabeça do que no corpo.

Quando seu Life Path 11 (o Canal) se encontra com um Corpo 8
dominante, o padrão que se repete é: você SENTE que precisa de
descanso, mas a mente convence você de que "mais um dia não faz mal".
O corpo é wiser do que a mente nisso — e seu corpo 8 é quem avisa
primeiro.

SINAIS DE QUE ESTÁ FORA DO ALINHAMENTO:
• Fadiga que não passa mesmo a dormir bem
• Desinteresse sexual que não é cansaço — é tédio existencial
• Dores de cabeça que nascem na nuca (tensão acumulada)

O QUE FAZER HOJE:
Pare 5 minutos antes do almoço. Feche os olhos. Sinta onde está
a tensão no corpo. Nomeie-a. Depois respire 3 vezes profundo —
não para "resolver", só para SENTIR. O corpo 8 não precisa de
solução. Precisa de presença.

EVITAR:
Não tome decisões sobre o corpo (dieta, exercício intenso) quando
estiver em ciclo lunar minguante — seu corpo está em modo de
conservação, não de acção.
```

### 6.3 Exemplo de Perfil Akasha

```
TIPO: Iluminador
PERFIL: 1/3 — O Iniciador que Realiza pelo Exemplo

Você é um ser raro. Nascido sob a vibração do 11 — o Canal —
seu Life Path não é sobre construir para você: é sobre construir
PARA QUE OS OUTROS vejam que é possível. Seu Sol em Leão reforça
isso: você precisa ser visto — não por vaidade, mas porque a sua
visão só se torna real quando é testemunhada.

Sua missão hoje não é começar nada novo. É TERMINAR o que você
abandonou no meio. O 11 sem disciplina vira fantasma — ideias
geniais que nunca saem do papel. Seu Corpo 5 (Radiante) quer
mostrar, mas precisa do Corpo 6 (Arco) para sustentar.

SEQUÊNCIA ACTIVA: Vitalidade
Você está num ciclo onde a saúde = a missão. Se você não tem
energia, você não tem visão. Cuide do corpo 8 primeiro.

FRÊQUENCIA ACTUAL: Sombra → Dom (em transição)
Você ainda vive no padrão de "não sou suficiente sem o que faço".
A transição acontece quando você acts FROM o que é, não do que
você alcançou.

AKASHA AUTHORITY HOJE:
Estratégia: AGIR
Autoridade: Sagrada (quando sente no corpo, não na mente)
Melhor timing: amanhã de manhã, antes de falar com alguém
```

---

## 7. Plano de Implementação

### Fase 1: Fundamento (F-230 a F-233)

**F-230 — Tipos Akasha**
- Derivar 5 tipos Akasha a partir dos 5 pilares
- Mapeamento: combinação de Life Path + Sol + Corpo dominante + Odu
- Output: `AkashaType` + `AkashaProfile`

**F-231 — Akasha Authority v2**
- Algoritmo de decisão: strategy + authority por tipo
- Derivar de: Life Path (ação/início) + Lua (emoção) + Corpo (presença)
- Output: `AkashaDecision` por dia

**F-232 — Síntese Profunda por Área**
- Reescrever `gerarNarrativaDimensao` para agregar todos os 5 pilares
- Remover `firstSentence()` — usar conteúdo completo
- Output: `AreaNarrative` completo

**F-233 — Narrativa de Perfil Unificada**
- Reescrever `gerarPerfilGeral` como síntese fluída
- Integrar todos os pilares num perfil de 8-12 frases
- Output: `perfilNarrativa` profundo

### Fase 2: Sexualidade Deep Dive (F-234)

**F-234 — Sexualidade como Sistema Próprio**
- Integrar os 4 marcadores (Tantra Body + Sol + Lilith + Casa 8)
- Gerar arquétipo sexual + padrão relacional
- Gerar caminho de transformação
- Output: `SexualidadeNarrativa`

### Fase 3: Mobile UX (F-235 a F-237)

**F-235 — "Meu Dia" v2**
- Decisão Akasha hero card
- Área de foco com narrativa completa
- Grid das outras áreas
- Bottom nav

**F-236 — Expansão de Área**
- Página dedicada por área de vida
- Narrativa completa + prática + ritual
- Histórico de práticas

**F-237 — PWA e Notifications**
- Service Worker para offline
- Push notifications para decisão diária
- Widget de decisão para a home do telemóvel

### Fase 4: Validação e Conteúdo (F-238 a F-240)

**F-238 — Testes de qualidade narrativa**
- Verificar que cada narrativa responde: quem + porquê + o que fazer
- Verificar que nenhum conteúdo está truncado
- Verificar voz unificada (sem "Cabala diz...")

**F-239 — Correlações Cruzadas**
- Criar textos de correlação: Life Path + Sol, Sol + Casa 8, etc.
- Criar textos de transformação: sombra → dom por área

**F-240 — Cobertura de Conteúdo**
- Auditar `significados-curados.ts` para cobertura completa
- Auditar `traducao-areas.ts` para profundidade
- Criar conteúdo faltante

---

## 8. Métricas de Sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Profundidade narrativa | % de narrativas com >200 palavras | ≥ 80% |
| Acção incluída | % de narrativas com prática concreto | 100% |
| Voz unificada | % de narrativas SEM "Cabala diz..." / "Astrologia diz..." | 100% |
| Cobertura pilares | % de áreas com contribuições de ≥3 pilares | ≥ 80% |
| Decisão clara | % de dias com estratégia + timing definidos | 100% |
| Satisfação (Play Store) | Rating após lançamento | ≥ 4.5★ |

---

## 10. Research Results Incorporated

**Play Store (14 apps):** Nenhum app unifica múltiplas tradições — Akasha é único. Utilizadores querem generous free tier, daily engagement, clean UX, NO paywall creep.

**Human Design:** Tipo(5) = Life Path + Corpo dominante. Estratégia = Life Path + Lua. Autoridade = Casa 8 + Corpo presente.

**Gene Keys Frequency:** Sombra (sofrimento) → Dom (talento) → Realização.

## 11. Implementation Tasks

**T-1:** `gerarNarrativaSexualidade` — remover firstSentence(), usar essencias completas, correlação entre marcadores, derivar frequência.

**T-2:** `gerarPerfilGeral` — remover firstSentence(), perfil 8-12 frases.

**T-3:** `buildSaude` e similares — usar todos os 5 pilares.

**T-4:** `AkashaAuthority` — estratégia + autoridade + timing.

**T-5:** Página "Meu Dia" com hero card Akasha Authority.

**T-6:** Verificação typecheck + narrativa.
