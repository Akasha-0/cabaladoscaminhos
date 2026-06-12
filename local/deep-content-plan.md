# Plano de Arquitetura de Conteúdo Profundo — Akasha
**Data:** 2026-06-12
**Arquitecto:** DeepContentArchitect
**Versão:** 1.0
**Status:** PLANO — implementação não iniciada

---

## Sumário Executivo

O sistema Akasha entrega hoje conteúdo raso: uma `essencia` de ≤22 palavras por símbolo, interpolada com frases curtas de `traducao-areas.ts` (1-2 frases por pilar por área). O resultado é um produto comparável a uma app de numerologia gratuita, não a um sistema oracular de profundidade Mirofox/AstroLink. O gap não é de dados — são 5 pilares com 1.841 entradas curadas — mas de **arquitectura de conteúdo narrativo**: o sistema sabe o que o símbolo significa, mas não sabe gerar o que o símbolo **significa para a vida da pessoa em cada área específica**.

Este plano define a arquitectura, as mudanças de código, os tipos de conteúdo novos, a ordem de prioridade, exemplos concretos de melhoria, e a estratégia de criação de conteúdo.

---

## 1. Arquitectura de Conteúdo — O Que Torna o Conteúdo "Profundo"

### 1.1 A Escada de Profundidade

O conteúdo espiritual em apps de topo (Mirofox 4.8★, AstroLink 4.5★) opera numa escada de 5 níveis:

| Nível | Descrição | Akasha Hoje | Akasha Meta |
|-------|-----------|-------------|-------------|
| **L1 — Etiqueta** | Um nome ou número | ✅ Life Path 11 | Igual |
| **L2 — Essência** | 1-2 frases do que o símbolo significa | ✅ `essencia` ≤22 palavras | Igual |
| **L3 — Explicação** | 3-5 frases que expandem a essência, com "porquê" | ❌ Ausente | ✅ 5-8 frases |
| **L4 — Aplicação** | O que isso significa para cada área da vida (saúde, amor, trabalho…) | ❌ Raso (`traducao-areas` 1-2 frases) | ✅ 8-12 frases por área |
| **L5 — Síntese Cruzada** | Como os 5 pilares convergem ou divergem nesse domínio | ❌ Ausente | ✅ 5 pilares + conflito + síntese |

A diferença entre L2 e L4 não é volume — é **substituição de generalidade por especificidade contextual**. "Intuição aguda, visão, inspiração" (L2) é uma frase bonita. "Você percebe coisas que outros não veem — no trabalho, isso significa que você tende a antecipar problemas que a equipa ainda não identificou; no amor, pode significar que você sente quando o outro está a mentir antes de qualquer prova; na saúde, escute mais o corpo do que a mente porque seu corpo 8 (Prana) às vezes sabe antes do corpo 5 (Físico)" (L4) é um texto que muda comportamento.

### 1.2 A Estrutura de um Bloco de Conteúdo Profundo por Área

Cada dimensão (saúde, trabalho, amor, etc.) deve conter, no mínimo:

```
[TÍTULO — quem é você nesta área]
  "Você é [título do símbolo] — e isso em [área] significa que..."

[PARÁGRAFO 1 — Explicação Central]
  5-8 frases: o que este símbolo PEDE nesta área específica.
  Inclui: causa (porquê), efeito (o que acontece), frequência (quando усиливается).

[PARÁGRAFO 2 — Pilares em Convergência]
  3-5 frases: como Cabala + Astrologia + Tantra apontam na mesma direção.
  Correlação concreta, não genérica ("os 3 mapas apontam para o mesmo").

[PARÁGRAFO 3 — Tensões e Divergências]
  3-5 frases: onde os pilares PEDEM coisas diferentes.
  Ex.: "A Cabala pede contenção; a Astrologia pede expansão — e seu Corpo Tântrico 8 indica que seu corpo JÁ sabe a resposta."

[PARÁGRAFO 4 — Padrão Intensificado]
  2-3 frases: quando 2+ pilares coincidem no mesmo sinal (ex.: Sol + Lilith em Escorpião).
  Isto NÃO é genérico — é o padrão real do mapa da pessoa.

[PARÁGRAFO 5 — O Que Evitar]
  2-3 frases: a sombra específica nesta área. Não a sombra genérica do número.

[PARÁGRAFO 6 — Prática Concreta]
  1-2 frases: uma acção específica, com timing, que a pessoa pode fazer HOJE.
  Inclui o "quando" e o "como" — não só "o que".

[PARÁGRAFO 7 — Akasha Authority]
  1-2 frases: decisão simples (agir / esperar / observar / render-se).
  Baseada nos dados reais do mapa.

[PARÁGRAFO 8 — Frase de Fechamento]
  1 frase de impacto que fica com a pessoa.
  "O que você não nomeia, governa você."
```

**Total mínimo por dimensão: 25-35 frases, 150-250 palavras PT-BR.**

Hoje: 5-15 frases, 40-80 palavras.

### 1.3 O Que Diferencia Akasha de Mirofox/AstroLink

Mirofox é profundo NUM sistema (numerologia). AstroLink é profundo NUM sistema (astrologia). Akasha é o único sistema que pode dizer:

> "Seu Life Path 11 (Cabala) + Sol em Peixes (Astrologia) + Corpo 7 (Tantra) + Odu Ogbe (Ifá) + Hexagrama 26 (I Ching) CONVERGEM para o mesmo padrão: você é um canal. Mas observe: enquanto a Cabala e o I Ching apontam para contenção (o canal precisa de terra), a Astrologia pede expansão (Neptuno em tríplice com o Sol). Seu Corpo 7 resolve isso — seu corpo astral JÁ sabe que você precisa de estrutura física para não se dissolver. A prática: ancore antes de abrir."

**Isto é impossível no Mirofox (sem astrologia, sem Odu, sem I Ching) e impossível no AstroLink (sem Cabala numerológica, sem Tantra, sem Odu).**

---

## 2. Mudanças de Código

### 2.1 Ficheiros Envolvidos

| Ficheiro | Mudança | Tipo |
|----------|---------|------|
| `significados-curados.ts` | Adicionar campo `aplicacaoPorArea` a cada entrada | ALTERAÇÃO |
| `traducao-areas.ts` | Expandir cada `frase` de 1-2 para 8-12 frases; adicionar `tensao`, `convergencia` | ALTERAÇÃO |
| `narrative-generator.ts` | Reescrever todas as funções `buildX()`; adicionar `buildSaudePROFUNDO()` etc. | REESCRITA |
| `synthesizer.ts` | Nenhuma — a interface `DimensaoSintese.synthes` já suporta texto longo | NENHUMA |

### 2.2 Alteração em `significados-curados.ts`

**Problema actual:** A interface `SignificadoCurado` tem 5 campos (`essencia`, `missao`, `sombra`, `pratica`, `conexao`) que são genéricos — válidos para qualquer área. A entrada Life Path 11 diz "Canal entre planos. Intuição aguda, visão, inspiração." — isto é verdade, mas não diz nada sobre saúde, trabalho ou amor especificamente.

**Solução:** Adicionar um campo `aplicacaoPorArea` opcional (Partial<Record<Area, string>>) a cada entrada:

```typescript
// NOVO CAMPO a adicionar a SignificadoCurado
export interface SignificadoCurado {
  // ... campos existentes ...
  /** Aplicação específica por área de vida (opcional — fallback para genérico) */
  aplicacaoPorArea?: Partial<Record<Area, string>>;
}
```

**Exemplo de preenchimento para Life Path 11:**

```typescript
{
  id: 11,
  pilar: 'cabala',
  titulo: 'Iluminador · Mestre',
  essencia: 'Canal entre planos. Intuição aguda, visão, inspiração. Você sente antes de saber.',
  missao: 'Confie na primeira impressão. Mestreie-a em algo concreto. Visão sem ação esvai.',
  sombra: 'Nervosismo, autoquestionamento, mediunidade sem proteção.',
  pratica: 'Anote 1 insight ao acordar, antes do celular. Releia-o no fim do dia.',
  conexao: 'Iluminador (P1·11) com Mente Divina (P3·11) — visão + transcendência.',
  fonte: 'Mispar Hechrachi; numerologia mestre (cap. Pinnock 2010)',
  // NOVOS CAMPOS:
  aplicacaoPorArea: {
    saude: 'Seu corpo físico tende a ignorar sinais antes da mente. Você sente a doença 3 dias antes de manifestá-la — mas ignora porque confia mais na intuição do que no corpo. Prática: antes de qualquer decisão de saúde hoje, pergunte ao corpo 5 (Físico) antes de perguntar à mente. A resposta do corpo é mais fiável neste momento.',
    trabalho: 'Você vê tendências antes de elas aparecerem — no mercado, na equipa, no cliente. Isso é um superpoder mas também uma armadilha: antecipar demais paralisa. A solução: ancore a visão num plano concreto. Uma visão sem terra é alucinação. Prática: escreva 1 acção concreta que decorre da sua intuição HOJE.',
    amor: 'Você sente quando algo não está bem no relacionamento antes de ter provas. Mas a tendência é duvidar da sua percepção e esperar confirmação externa. Não espere. O que você sente é dado. Prática: se algo incomodou esta semana, nomeie — não como acusação, mas como "eu senti isto".',
    // ... resto das áreas ...
  }
}
```

**Impacto:** ~200 novas strings de conteúdo (40 áreas × 5 profundidade). Trabalho de curadoria, não de engenharia.

### 2.3 Alteração em `traducao-areas.ts`

**Problema actual:** Cada entrada de `TraducaoArea` tem uma `frase` de 1-2 frases. Para 40 entradas (5 pilares × 8 áreas), o conteúdo total é ~80-160 frases curtas. Mirofox escreve 5-10 frases POR número POR área — ~500-1.000 frases para os mesmos 9 números × 9 áreas.

**Solução:** Decompor cada `TraducaoArea` em 3 sub-campos:

```typescript
// NOVO TIPO
export interface TraducaoAreaDetalhada {
  pilar: Pilar;
  area: Area;
  /** Frase padrão (mantida para backward-compat) */
  frase: string;
  /** PARÁGRAFO 1: Explicação central (5-8 frases) */
  explicacao: string;
  /** PARÁGRAFO 3: Tensão entre pilares nesta área (3-5 frases) */
  tensao: string;
  /** PARÁGRAFO 2: Convergência (3-5 frases) */
  convergencia: string;
  /** PARÁGRAFO 5: O que evitar nesta área (2-3 frases) */
  evitar: string;
  /** PARÁGRAFO 6: Prática concreta (1-2 frases, com timing) */
  pratica: string;
  fonte: string;
  requer_terreiro?: boolean;
}
```

**Exemplo para Cabala × Saúde:**

```typescript
// ANTES (1-2 frases):
{ pilar: 'cabala', area: 'saude',
  frase: 'O seu número aponta onde sua energia VAI naturalmente. Respeite-o: se o seu número pede introspecção, parar 1 hora sozinho é saúde, não fuga. Corpo sadio = corpo coerente com a missão.',
  fonte: 'Mispar Hechrachi' }

// DEPOIS (8-12 frases):
{ pilar: 'cabala', area: 'saude',
  frase: '...', // mantida para backward-compat
  explicacao: 'Cada número de Cabala carrega uma qualidade energética que indica onde a sua energia flui naturalmente — e onde ela resiste. O 1 vai para a ação pioneira; o 2 para a cooperação e o vínculo; o 3 para a expressão criativa; o 4 para a estruturação paciente; o 5 para a mudança e a liberdade; o 6 para o cuidado e a proteção; o 7 para a investigação interior; o 8 para a manifestação material; o 9 para a compaixão universal. Quando você força saúde no padrão do número errado, o corpo protesta. Quando você alinha com o padrão certo, há silêncio no corpo — mesmo em esforço.',
  convergencia: 'A Cabala aponta para a coerência entre energia e missão. Quando o seu Life Path pede movimento (1, 5, 8), ficar parado é cansaço. Quando pede contenção (4, 7), forçaroutput é exaustão. O corpo sabe — a Cabala só traduz.',
  tensao: 'A tensão aparece quando o número pede algo que a vida actual não permite. Life Path 7 (Buscador interior) numa vida que exige socialização constante gera fadiga crónica. Não é毛病 — é sinal. A solução não é mudar o número; é criar niches de introvertimento mesmo dentro de rotinas extrovertidas.',
  evitar: 'Ignorar o padrão do seu número e tentar ser o que não é. Forçar um corpo 5 (Liberdade) para uma rotina de empresa rígida sem compensate com movimento e variedade. Negligenciar o silêncio que o 7 precisa sob pretexto de "produtividade".',
  pratica: 'Hoje, observe: onde estou a forçar energia no padrão errado? Identifique 1 momento nas últimas 24h onde o corpo pediu algo diferente do que você fez. Nomeie o que pediu. Amanhã, dê 10 minutos a esse pedido.',
  fonte: 'Mispar Hechrachi; Sefer Yetzirah cap. 4' }
```

### 2.4 Reescrita de `narrative-generator.ts`

**Problema actual:** Cada função `buildX()` (buildSaude, buildTrabalho, etc.) faz concatenação de strings curtas — não geração de páragrafos estruturados. O padrão é:

```typescript
function buildSaude(...): string {
  const lines: string[] = [];
  lines.push('**Você é — Saúde**\n');
  if (sTantra) {
    lines.push(`${sTantra.essencia} Seu corpo pede atenção: ${sTantra.pratica ?? sTantra.missao}`);
  }
  const tradSaude = traducs.find((t) => t.pilar === 'tantrica' || t.pilar === 'cabala');
  if (tradSaude) {
    lines.push(`\n**Na prática**\n${tradSaude.frase}`);
  }
  return lines.join('\n').trim();
}
```

**Resultado实际:** 3-5 fragmentos curtos, sem fluxo narrativo, sem tensão, sem convergência.

**Solução:** Reescrever cada `buildX()` como uma função de **montagem de páragrafos** que consome os novos campos de `TraducaoAreaDetalhada` e `SignificadoCurado.aplicacaoPorArea`. Estrutura:

```typescript
function buildSaudePROFUNDO(
  pilares: PilaresDados,
  traducs: TraducaoAreaDetalhada[],
  sCabala?: SignificadoCurado,
  sTantra?: SignificadoCurado,
  sAstro?: SignificadoCurado,
  sOdu?: SignificadoCurado,
  sIChing?: SignificadoCurado
): string {
  const paragraphs: string[] = [];

  // PARÁGRAFO 1 — Título + Explicação Central
  paragraphs.push(`**Saúde & Vitalidade — O que seu mapa diz**`);
  if (sTantra?.aplicacaoPorArea?.saude) {
    paragraphs.push(sTantra.aplicacaoPorArea.saude);
  } else if (sCabala?.aplicacaoPorArea?.saude) {
    paragraphs.push(sCabala.aplicacaoPorArea.saude);
  }

  // PARÁGRAFO 2 — Pilares em Convergência
  const convergencias = traducs
    .filter((t) => t.convergencia)
    .map((t) => t.convergencia);
  if (convergencias.length > 0) {
    paragraphs.push(`**Quando os 5 mapas apontam juntos**`);
    paragraphs.push(convergencias.join(' '));
  }

  // PARÁGRAFO 3 — Tensões
  const tenses = traducs.filter((t) => t.tensao);
  if (tenses.length > 0) {
    paragraphs.push(`**Onde os mapas pedem coisas diferentes**`);
    // Detectar conflito específico
    const conflictiva = tenses.find((t) => t.pilar === 'cabala');
    const expansiva = tenses.find((t) => t.pilar === 'astrologia');
    if (conflictiva && expansiva) {
      paragraphs.push(
        `A Cabala pede contenção e estrutura; a Astrologia pede expansão e fluido. ` +
        `Seu corpo — o ${pilares.tantrica?.corpo_predominante} — é o mediador. ` +
        `Quando o corpo 4 (Mente Negativa) está em tensão, você oscila entre os dois. ` +
        `Quando o corpo 8 (Prana) está activo, você integra os dois.`
      );
    } else {
      paragraphs.push(tenses.map((t) => t.tensao).join(' '));
    }
  }

  // PARÁGRAFO 4 — Padrão Intensificado (quando 2+ pilares coincidem)
  // ... (lógica existente de sexualidade expandida para todas as áreas)

  // PARÁGRAFO 5 — O Que Evitar
  const evitar = traducs.find((t) => t.evitar);
  if (evitar) {
    paragraphs.push(`**O que seu corpo não precisa agora**`);
    paragraphs.push(evitar.evitar);
  }

  // PARÁGRAFO 6 — Prática Concreta
  const pratica = traducs.find((t) => t.pratica);
  if (pratica) {
    paragraphs.push(`**O que fazer HOJE**`);
    paragraphs.push(pratica.pratica);
  }

  // PARÁGRAFO 7 — Akasha Authority
  paragraphs.push(`**Akasha Authority**`);
  paragraphs.push(
    getAkashaAuthorityDecision(pilares, 'saude') // função nova
  );

  // PARÁGRAFO 8 — Frase de Fechamento
  paragraphs.push(`*"O corpo não mente — mas precisa que você pare para ouvir."*`);

  return paragraphs.filter(Boolean).join('\n\n');
}
```

**Funções novas necessárias:**

| Função | Descrição |
|--------|----------|
| `getAkashaAuthorityDecision(pilares, dimId)` | Deriva a decisão (paz/ansiedade) de forma genérica para todas as áreas, não só as 4 actuais |
| `detectPilarConvergencia(traducs)` | Detecta quando 2+ pilares apontam na mesma direção → activa "Padrão Intensificado" |
| `detectPilarTensao(traducs)` | Detecta quando pilares pedem coisas opostas → gera o párrafo de tensão |
| `buildPilarParagraph(pilar, area, significado)` | Monta páragrafo de um pilar específico para uma área |

### 2.5 Mudanças de Interface — Nenhuma Necessária

A interface `DimensaoSintese` em `synthesizer.ts` já tem:

```typescript
export interface DimensaoSintese {
  readonly synthes: string;  // ✅ suporta texto longo
  readonly contribuicoes: readonly DimensaoContribuicao[];
  readonly praktika: string;
  readonly alerta: string;
  readonly autoridadeAkasha: { ... }
}
```

O campo `synthes` é `string` — não há limite. Não é necessária alteração de tipo.

### 2.6 Resumo de Mudanças de Código

| Ficheiro | Linhas Alteradas | Tipo de Alteração |
|----------|-----------------|-------------------|
| `significados-curados.ts` | Interface `SignificadoCurado` + ~200 entradas com `aplicacaoPorArea` | Adição de campo + curadoria |
| `traducao-areas.ts` | `TraducaoAreaDetalhada` + 40 entradas expandidas | Novo tipo + curadoria |
| `narrative-generator.ts` | Funções `buildX()` reescritas + 3 helpers novos | Reescrita de lógica |
| `synthesizer.ts` | Nenhuma | — |

---

## 3. Tipos de Conteúdo Novos — A Vantagem Akasha

### 3.1 Síntese Cruzada de 5 Pilares (Impossível em Competidores)

**3.1.1 O Texto de Convergência Total**

Quando todos os 5 pilares apontam na mesma direção, o conteúdo deve declarar isso explicitamente e explicar PORQUE é raro e poderoso:

> "Você é raro. Seu Life Path 11 (Cabala) + Sol em Aquário (Astrologia) + Corpo 7 (Tantra) + Odu [X] (Ifá) + Hexagrama 55 (I Ching) — todos apontam para o mesmo padrão: você é um canal de transformação para outros, não para si mesmo. Isto não é coincidência. É a sua assinatura evolutiva. A implicação prática: você precisa de estrutura própria (corpo 4, Casa 4) porque o canal drena. Sem âncora, você oferece demais e recebe de menos."

**3.1.2 O Texto de Tensão Resolvida**

Quando os pilares pedem coisas opostas, o conteúdo deve:

1. Nomear a tensão explicitamente (sem vago "existem desafios")
2. Identificar qual pilar "ganha" em qual contexto
3. Dar a prática que integra, não que escolhe um lado

> "A tensão central do seu mapa: a Cabala (Life Path 8) pede manifestação material e poder no mundo. O I Ching (Hexagrama 2) pede receptividade e deixar vir. Seu Corpo 7 (Astral) tende para a fuga emocional. A solução não é escolher um — é alternar com consciência. Quando Júpiter transitar seu Sol, aja desde a Cabala. Quando a Lua estiver em fase de Escuridão, receba desde o I Ching. Seu Corpo 7 é o indicador: quando sentir vontade de fugir, é sinal de que está a forçar o lado errado."

### 3.2 Padrão Intensificado Genérico

A lógica de "Sol + Lilith no mesmo signo = intensidade dobrada" existe hoje só para sexualidade. Deve ser expandida para TODAS as áreas:

| Combinação | Área | Padrão |
|-----------|------|--------|
| Life Path + Sol no mesmo elemento | Saúde | Tendência a disfunções desse elemento se não honrado |
| Corpo Predominante + Lua no mesmo signo | Amor | Fusão emocional intensificada (positiva ou destrutiva) |
| Life Path 11 + Hexagrama 26 | Propósito | Canal + Teaching — missão de abrir canais em outros |
| Odu + Casa 8 astrológica | Sexualidade | Já existe — manter e expandir |
| Trigêmeo + Ascendente | Trabalho | Como a pessoa se apresenta vs. como executa |

### 3.3 O Texto de Ancestralidade (Odu)

**Odu é o diferenciador absoluto de Akasha.** Nenhum concorrente tem ancestralidade iorubá. O conteúdo deve:

1. **Nunca inventar** — Odu `requer_terreiro: true` é um signal para o usuário, não uma limitação
2. **Dar o que é possível** — qualidade emocional da energia do Odu, sem specifics de ritual
3. **Redirecionar para a tradição** com respeito e clareza

> "Seu Odu carrega uma qualidade ancestral que precede todas as outras — vem da terra dos seus antepassados. Esta qualidade não é 'boa' nem 'má' — é a sua herança. O que você pode fazer HOJE, sem ir ao terreiro: observe que padrões emocionais se repetem na sua família. Se o seu Odu é [Ogbe], a qualidade é Luz-e-Abertura — você tende a abrir caminhos para outros mas pode neglectar o seu próprio. Nomeie isso. Depois, pergunte: 'Eu abri caminho para mim hoje?'"

### 3.4 O Texto de I Ching (Mutação do Caminho)

Hexagramas são subestimados no sistema actual. Cada hexagrama tem 6 linhas, cada linha comTiming. O conteúdo deve usar o hexagrama como **ferramenta de decisão**:

> "Seu Hexagrama 26 (A Grande Força) no nascimento diz: você tem a capacidade de conter energia massiva antes de libertá-la. No dia de hoje, isso significa: você está tempted a agir com força onde a situação pede paciência. A linha 3 diz: 'O homem selvagem若是 força sem contenção, atrai o infortúnio.'翻译: se você usar a sua força natural sem o filtro do corpo 4 (Mente Negativa), vai criar inimigos desnecessários. A prática: antes de qualquer acto de força hoje (email firme, decisão dura, conversa difícil), respire 3 vezes e pergunte: 'Isto vem da minha força real ou da minha ansiedade?'"

---

## 4. Ordem de Prioridade

### 4.1 Matriz de Impacto × Esforço

| Dimensão | Impacto (1-5) | Esforço (1-5) | Prioridade |
|----------|--------------|--------------|-----------|
| Saúde | 5 | 3 | **1º — PRIORIDADE ALTA** |
| Propósito | 5 | 3 | **2º — PRIORIDADE ALTA** |
| Amor | 5 | 4 | **3º — PRIORIDADE ALTA** |
| Sexualidade | 4 | 2 | **4º — JÁ EXISTE (melhorar)** |
| Espiritualidade | 4 | 3 | **5º — PRIORIDADE MÉDIA** |
| Trabalho | 4 | 3 | **6º — PRIORIDADE MÉDIA** |
| Criação | 3 | 3 | **7º — PRIORIDADE MÉDIA** |
| Superação | 3 | 4 | **8º — PRIORIDADE BAIXA** |
| Família | 3 | 4 | **9º — PRIORIDADE BAIXA** |

### 4.2 Justificação da Prioridade

**1º Saúde:** É a dimensão mais visível no "Meu Dia" (primeira do accordion) e a mais fácil de demonstrar valor imediato. O usuário abre o app → primeira impressão = saúde. Se o texto é raso, o app parece raso. Se o texto é profundo, o app parece profundo. ROI mais alto por linha de conteúdo.

**2º Propósito:** É a dimensão que mais diferencia Akasha de Mirofox/AstroLink. Ambos têm numerologia e astrologia separados. Propósito é onde a síntese de 5 pilares é mais poderosa — e onde o usuário mais precisa de ajuda para agir.

**3º Amor:** Alto impacto emocional + alto volume de búsqueda (apps deCompatibility, relacionamentos). Conteúdo de amor profundo é o que retém usuários.

**4º Sexualidade:** Já tem a melhor estrutura (`gerarNarrativaSexualidade`) — é o modelo a seguir para as outras áreas. O trabalho aqui é adaptar o padrão existente, não criar do zero.

**5º-9º:** Trabalho, Espiritualidade, Criação, Superação, Família — podem ser iterados em sequência após as primeiras 4.

### 4.3 Faseamento da Implementação

```
FASE 1 (Semanas 1-2): Arquitectura
  - Definir e validar novo tipo TraducaoAreaDetalhada
  - Criar 3 helpers em narrative-generator.ts
  - Validar com um piloto: buildSaudePROFUNDO()

FASE 2 (Semanas 3-4): Saúde + Propósito
  - Expandir traducao-areas.ts para saude + proposito (10 pilares × 2 áreas = 20 entradas)
  - Adicionar aplicacaoPorArea para Life Paths 1-9, 11, 22, 33 (saúde + propósito)
  - Reescrever buildSaude() + buildProposito()
  - Testar com dados reais

FASE 3 (Semanas 5-6): Amor + Sexualidade
  - Expandir traducao-areas.ts para amor + sexualidade
  - Adaptar gerarNarrativaSexualidade() para novo formato
  - Reescrever buildAmor()

FASE 4 (Semanas 7-8): Trabalho + Espiritualidade + Criação
  - Completar剩下的 dimensões

FASE 5 (Semanas 9-10): Superação + Família + Polish
  - Conteúdo final
  - Backward-compat verificar
  - Performance (texto longo sem degradação de render)
```

---

## 5. Exemplos BEFORE/AFTER — Saúde

### 5.1 BEFORE (Actual — buildSaude)

```typescript
function buildSaude(
  pilares: PilaresDados,
  traducs: { pilar: string; frase: string }[],
  sCabala?: ReturnType<typeof spilar>,
  sTantra?: ReturnType<typeof spilar>
): string {
  const corpo = pilares.tantrica?.corpo_predominante;
  const lines: string[] = [];
  lines.push('**Você é — Saúde**\n');

  if (sTantra) {
    lines.push(`${sTantra.essencia} Seu corpo pede atenção: ${sTantra.pratica ?? sTantra.missao}`);
  } else if (sCabala) {
    lines.push(sCabala.essencia);
  }

  const tradSaude = traducs.find((t) => t.pilar === 'tantrica' || t.pilar === 'cabala');
  if (tradSaude) {
    lines.push(`\n**Na prática**\n${tradSaude.frase}`);
  }

  const tCorpo = traducaoPara('tantrica', 'saude');
  if (tCorpo) {
    lines.push(`\n**Sinal de alerta**\n${tCorpo.frase}`);
  }

  return lines.join('\n').trim();
}
```

**Output实际 para Life Path 11 + Corpo 7:**

> **Você é — Saúde**
>
> Discernimento. Capacidade de dizer não, filtrar, proteger. Seu corpo pede atenção: Quando o "não" surgir, antes de justificar, apenas diga: "Não, hoje não."
>
> **Na prática**
> O seu número aponta onde sua energia VAI naturalmente. Respeite-o: se o seu número pede introspecção, parar 1 hora sozinho é saúde, não fuga. Corpo sadio = corpo coerente com a missão.
>
> **Sinal de alerta**
> O corpo 5 (físico) é o templo, mas o 8 (prana) é a energia que o anima. Saúde = respirar fundo 3x hoje. O corpo sutil, quando bem alimentado, sustenta o físico.

**Análise:** 4 fragmentos desconectados. Não há fluxo narrativo. A tensão entre o "não" do Corpo 7 e a "respiração" do corpo 5 não é explorada. O usuário recebe 4 pedaços de sabedoria e não sabe o que fazer com eles em conjunto.

### 5.2 AFTER (Meta — buildSaudePROFUNDO)

**Input:** Life Path 11 + Sol em Escorpião + Corpo 7 (Mente Negativa) + Odu Ogbe + Hexagrama 51

**OutputMeta:**

> **Saúde & Vitalidade — O que seu mapa diz**
>
> Você é o Iluminador — e isso em saúde significa que seu corpo funciona como um sensor de precisão. O Corpo 7 (Mente Negativa) é a sua capacidade de filtrar — de distinguir o que é real do que é projecção. Em saúde, isso significa: você sente a doença antes de ela chegar, mas a tendência é racionalizar o sintoma como "não é nada". Não ignore. Seu corpo 7 é mais fiável do que o seu diagnóstico mental quando se trata de sinais físicos.
>
> **Quando os 5 mapas apontam juntos**
>
> Life Path 11 (Canal entre planos) + Corpo 7 (Discernimento) + Odu Ogbe (Luz que abre) apontam para o mesmo padrão: você é um canal que capta energia antes de processá-la. Isso é um superpoder em saúde — você antecipa. Mas também é um risco: se você não过滤器 o que entra, absorve tudo. A implicação: sua saúde depende de ter uma frontera clara entre o que é seu e o que é dos outros.
>
> **Onde os mapas pedem coisas diferentes**
>
> A Cabala (Life Path 11) pede que você use a visão para actuar — sem acção, a visão do 11 vira ansiedade. A Astrologia (Sol em Escorpião) pede profundidade emocional — o Escorpião não quer superfície, quer o fundo. O Corpo 7 (Mente Negativa) pede contenção — o "não" antes do "sim". Estas três direções podem parecer contraditórias: visar alto, ir ao fundo, e contener ao mesmo tempo. A solução: elas actuam em tempos diferentes. Quando o corpo está descansado, use a visão (11). Quando há intimidade emocional, vá ao fundo (Escorpião). Quando há tensão ou exaustão, содержать (Corpo 7). Não no mesmo momento.
>
> **O que seu corpo não precisa agora**
>
> Não precisa que você racionalize o que sente. O Corpo 7 gosta de explicações — mas em saúde, o que você sente é o dado, não a explicação. Não precisa que você force output quando o corpo pede pausa. Life Path 11 em tensão com o Corpo 7 gera a ilusão de que "eu deveria estar a fazer mais" — mas a sua saúde exige o contrário: menos, mais profundo.
>
> **O que fazer HOJE**
>
> Três perguntas de saúde para o Iluminador: (1) Como está meu corpo 5 (físico) — cansaço real ou cansaço mental? (2) Onde está a minha fronteira — o que é meu e o que absorvi de outros? (3) Se eu confiasse na minha Mente Negativa (Corpo 7) para filtrar, o que eu diria "não" hoje? Responda por escrito. Depois, respire 3 vezes e faça 1 coisa que saia do "deveria" e entre no "preciso".
>
> **Akasha Authority**
>
> Hoje: AGIR com consciência. Não espere o momento perfeito — o Life Path 11 aprende com a acção, não com a观望. Mas ACTE desde a presença, não desde a ansiedade. Se ao respirar você sentir tensão no corpo 5, PARE. Se ao respirar sentir expansão, VÁ.
>
> *"O corpo não mente — mas precisa que você pare para ouvir."*

**Análise:** ~280 palavras vs. ~80 palavras actuais. 8 páragrafos vs. 4 fragmentos. Cada párrafo tem causa, efeito, e acção. O usuário sai com um plano, não com fragmentos.

---

## 6. Estratégia de Criação de Conteúdo

### 6.1 Template de Curadoria por Entrada

Para cada entrada de `significados-curados.ts` que recebe `aplicacaoPorArea`, seguir o template:

```
📋 TEMPLATE — aplicacaoPorArea para [Símbolo] em [Área]

CABEÇALHO: [Símbolo] ([Título]) + [Área]

PARÁGRAFO 1 — O Que Isto Significa Em [Área] (5-8 frases)
  - O que este símbolo PEDE nesta área?
  - Qual é a QUALIDADE específica (não genérica)?
  - Quando isso se manifesta (timing, gatilho)?
  - O que acontece quando é honrado?
  - O que acontece quando é ignorado?

PARÁGRAFO 2 — Com Este Símbolo, Como é o [Área] no Dia-a-Dia (3-5 frases)
  - Descrição concreta de um dia típico com esta energia
  - Exemplo de situação real
  - Como isso aparece no relacionamento / trabalho / corpo

PARÁGRAFO 3 — A Armadilha Específica Desta Área (2-3 frases)
  - A versão distorcida deste símbolo nesta área
  - O erro mais comum
  - O custo de não nomear

PARÁGRAFO 4 — Prática de 1 Linha (1 frase)
  - Acção concreta, com timing
  - "Quando [gatilho], faça [acção]"
```

### 6.2 Cross-Pillar Synthesis Patterns

Existem padrões recorrentes de como os 5 pilares se relacionam. Catalogá-los permite gerar conteúdo de tensão/convergência mecanicamente:

**PADRÃO A — Convergência Total (5/5 pilares alinhados)**
Quando todos os pilares apontam para o mesmo: o conteúdo declara a raridade, explica o padrão, e dá prática de contenção/âncora.

**PADRÃO B — Cabala + I Ching vs. Astrologia + Tantra (Estrutura vs. Fluxo)**
Tensão clássica: números pedem estrutura, água/fogo pedem fluxo. O Corpo Predominante é o mediador.

**PADRÃO C — Odu + Astrologia (Ancestral + Celeste)**
Quando Odu e signo astrológico coincidem no mesmo elemento: intensidade emocional amplificada.

**PADRÃO D — Life Path + Hexagrama (Missäo + Mutação)**
Quando Life Path e Hexagrama têm a mesma qualidade (ambos Yang ou ambos Yin): coerência entre o que veio fazer e o que está a mutar agora.

**PADRÃO E — Trigêmeo + Ascendente (Como se Apresenta vs. Como Executa)**
Trigêmeo físico + Ascendente em signo de água = corpo quer ação, emoção quer profundidade — tensão no trabalho.

### 6.3 Validação de Conteúdo

Cada párrafo deve passar nos seguintes checks antes de ser committed:

| Check | Pergunta | Passa se |
|-------|----------|----------|
| **Especificidade** | Isto descreve uma situação concreta ou é genérico? | Menciona o símbolo específico, não "você" genérico |
| **Acção** | O usuário sabe o que fazer depois de ler? | Tem uma prática com timing |
| **Tensão** | Se há tensão entre pilares, está nomeada? | Não há tensão oculta |
| **Fonte** | A afirmação é atribuível a uma fonte? | Tem citação no campo `fonte` |
| **Voz** | Está em 2ª pessoa PT-BR, sem jargão? | Sem "Sefirot", "Odu", "Hexagrama" sem tradução |
| **Comprimento** | 5-12 frases por párrafo? | Não <3 frases, não >15 frases |

### 6.4 Estratégia de Volume

Para escrever 100+ páragrafos de conteúdo profundo eficientemente:

1. **Template primeiro, curadoria segundo:** O template garante consistência; a curadoria garante qualidade. Não escrever free-form.

2. **Piloto por dimensão:** Escrever a dimensão "saúde" completa para Life Paths 1-9, 11, 22, 33 ANTES de escalar. Isso define o padrão de qualidade.

3. **Cross-pilar automation:** A lógica de tensão/convergência em `narrative-generator.ts` pode detectar padrões automaticamente — não é necessário escrever cada párrafo de tensão manualmente. O curador escreve osBuilding Blocks (cada pilar × área); o gerador assembla.

4. **Odu com cautela:** Odu `requer_terreiro: true` entries devem ser revisados por alguém com conhecimento da tradição antes de publicação. Não é conteúdo para escrever sem validação.

5. **I Ching com timing:** Cada hexagrama tem 6 linhas comTiming diferente. O conteúdo de I Ching deve usar a linha relevante para HOJE (hexagrama do dia + linha do momento), não só o hexagrama natal.

---

## 7. Plano de Implementação Detalhado

### 7.1 Semanas 1-2: Arquitectura

**Tarefa 1:** Definir `TraducaoAreaDetalhada` em `traducao-areas.ts`
- Adicionar campos `explicacao`, `tensao`, `convergencia`, `evitar`, `pratica`
- Manter `frase` para backward-compat
- Criar função auxiliar `traducaoDetalhadaPara(pilar, area)` que retorna o tipo completo

**Tarefa 2:** Criar helpers em `narrative-generator.ts`
- `detectPilarConvergencia(traducs: TraducaoAreaDetalhada[]): TraducaoAreaDetalhada[]`
- `detectPilarTensao(traducs: TraducaoAreaDetalhada[]): TraducaoAreaDetalhada[]`
- `buildPilarParagraph(pilar, area, significado, traducao): string`

**Tarefa 3:** Piloto — reescrever `buildSaude()` como `buildSaudePROFUNDO()`
- Testar com Life Paths 1, 5, 11 (3 casos extremos)
- Validar output manualmente
- Sem alterações de interface — tudo interno

### 7.2 Semanas 3-4: Saúde + Propósito

**Tarefa 4:** Expandir `traducao-areas.ts` para `saude` e `proposito`
- 5 pilares × 2 áreas = 10 entradas × 5 sub-campos = 50 novos páragrafos curados
- Odu entries com `requer_terreiro: true` e mensagem de redireccionamento

**Tarefa 5:** Adicionar `aplicacaoPorArea` para Life Paths 1-9, 11, 22, 33
- Foco em `saude` e `proposito` primeiro
- ~22 símbolos × 2 áreas = 44 novos páragrafos

**Tarefa 6:** Reescrever `buildProposito()` como `buildPropositoPROFUNDO()`

### 7.3 Semanas 5-6: Amor + Sexualidade

**Tarefa 7:** Expandir `traducao-areas.ts` para `amor` e `sexualidade`
- Sexualidade já tem estrutura — adaptar ao novo formato
- 10 entradas × 5 sub-campos = 50 novos páragrafos

**Tarefa 8:** Reescrever `buildAmor()` como `buildAmorPROFUNDO()`

### 7.4 Semanas 7-8: Trabalho + Espiritualidade + Criação

**Tarefa 9:** Completar dimensões restantes
- 3 dimensões × 5 pilares × 5 sub-campos = 75 páragrafos curados

### 7.5 Semanas 9-10: Superação + Família + Polish

**Tarefa 10:** Conteúdo final + validação
- Backward-compat verificar (todas as dimensões funcionam sem novos dados)
- Performance check (texto longo sem lag no accordion)
- Revisão editorial final

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Conteúdo Odu incorrecto/irreverente | Alta | Crítico | `requer_terreiro: true` + revisão por especialista antes de publish |
| Texto longo causa performance lag | Média | Médio | Lazy render do accordion (conteúdo carrega ao expandir, não no mount) |
| Curadoria de 100+ páragrafos é lenta | Alta | Médio | Template + cross-pilar automation reduz tempo por párrafo |
| Breaking change em `significados-curados.ts` | Baixa | Alto | Novo campo opcional — interface estendida, não alterada |
| I Ching linhas com timing complexo | Média | Médio | Usar só hexagrama + linha do dia (dados já disponíveis no mapa) |

---

## 9. Métricas de Sucesso

Após implementação, o conteúdo Akasha deve ser avaliado contra:

| Métrica | Estado Actual | Meta |
|---------|--------------|------|
| Palavras por dimensão (média) | ~60-80 | ~200-280 |
| Páragrafos por dimensão | ~3-5 | ~8-10 |
| Pilares referenciados por dimensão | 1-2 | 3-5 |
| Tensões nomeadas por dimensão | 0 | 1-2 |
| Práticas com timing por dimensão | 0-1 | 2-3 |
| % dimensões com conteúdo profundo | ~11% (sexualidade) | 100% |

---

## 10. Ficheiros Críticos para o Implementador

Antes de começar, o implementador DEVE ler na totalidade:

1. `apps/akasha-portal/src/lib/grimoire/synthesis/narrative-generator.ts:425-536` — a função `gerarNarrativaSexualidade` é o modelo de referência para o novo formato
2. `apps/akasha-portal/src/lib/grimoire/traducao-areas.ts:49-202` — a matriz completa de 40 entradas; o implementador precisa entender a estrutura antes de expandir
3. `apps/akasha-portal/src/lib/grimoire/significados-curados.ts:1-103` — estrutura da interface `SignificadoCurado`; o novo campo `aplicacaoPorArea` deve ser additive e optional
4. `apps/akasha-portal/src/lib/grimoire/synthesis/synthesizer.ts:220-336` — como `sintetizarMapa()` consome o narrative generator; o output de `buildX()` alimenta `DimensaoSintese.synthes`
5. `research/synthesis/play-store-competitive-analysis.md` — contexto de mercado; Mirofox escreve 5-10 frases por número por área

---

*Plano criado por DeepContentArchitect — aguardando aprovação para iniciar Fase 1.*
