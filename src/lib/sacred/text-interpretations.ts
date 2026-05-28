/**
 * Text Interpretations - Sacred meaning of textual patterns and sequences
 */

/**
 * Represents a text interpretation with its key meaning and description
 */
export interface Interpretation {
  key: string;
  meaning: string;
  description: string;
  culturalContext?: string;
}

/**
 * Core text interpretation mappings
 */
const TEXT_INTERPRETATIONS: Record<string, Interpretation> = {
  "1": {
    key: "unity",
    meaning: "O Uno - Primordial Unity",
    description: "The number one represents the first cause, the undivided source from which all things emanate. In Kabbalah, it corresponds to Keter (Coroa), a Coroa Divina que excede toda definição.",
    culturalContext: "Hermetic: O Todo é Um. Cabala: Keter - a vontade divina inicial.",
  },
  "2": {
    key: "duality",
    meaning: "Dualidade - A Separação Primordial",
    description: "Dois representa a primeira divisão, o ponto onde a unidade se torna plural. É o primeiro número par, introduzindo a ideia de complementaridade: luz e escuridão, masculino e feminino, espirito e matéria.",
    culturalContext: "Hermetic: Polaridade. Cabala: Chokhmah - sabedoria primitiva, o primeiro pensamento divino.",
  },
  "3": {
    key: "trinity",
    meaning: "Trindade - A Sagrada Triplicidade",
    description: "Três é o número da síntese e daotal Completion. Une opostos em um padrão superior. Na cabala, são as Três Colunas (Misericórdia, Severidade, Clemência) que sustentam a Árvore da Vida.",
    culturalContext: "Trindade cristã, Triplicidade hermética, as três velas do ritual.",
  },
  "4": {
    key: "foundation",
    meaning: "Os Quatro - Fundamento do Mundo Material",
    description: "Quatro representa a solidez, os quatro elementos, as quatro direções cardeais. É o número da estabilidade terrena e da manifestação completa no plano físico.",
    culturalContext: "Elementos (Fogo, Água, Ar, Terra), estações, direções cardeais.",
  },
  "5": {
    key: "vitality",
    meaning: "Os Cinco - Energia Vital e Movimento",
    description: "Cinco é dinâmico, representando o ser humano (4 membros mais cabeça), os sentidos físicos, e a energia que anima a matéria. É o número do conflito e da transformação.",
    culturalContext: "Pentagrama humano, sentidos, dedos da mão.",
  },
  "6": {
    key: "harmony",
    meaning: "Os Seis - Harmonia e Equilíbrio",
    description: "Seis representa a equilíbrio perfeito (2x3), a semana da criação, e o ponto de inflexão antes do descanso. É o número da cooperação entre opostos reconciliados.",
    culturalContext: "Seis dias da criação, Star of David, hexagrama.",
  },
  "7": {
    key: "perfection",
    meaning: "Os Sete - Perfeição Espiritual",
    description: "Sete é o número mais sagrado nos sistemas ocidentais, representando aotal Completion espiritual. Combina o ternário divino com o quaternário material.",
    culturalContext: "Sete dias da semana, sete chakras, sete notas musicais, sete planetas clássico.",
  },
  "8": {
    key: "infinity",
    meaning: "Os Oito - Infinito e Regeneração",
    description: "Oito representa o infinito (deitado), a regeneração após aotal Completion (sendo 7+1), e o poder divino em ação. É o número da justiça e da lei cósmica.",
    culturalContext: "Ogdoade egípcia, oito immortais taoístas, octagrama.",
  },
  "9": {
    key: "wisdom",
    meaning: "Os Nove - Sabedoria e Compaixão",
    description: "Nove é o último número single-digit, representando a sabedoria alcançada, a compaixão universal, e aotal Completion de um ciclo antes do retorno à unidade (10).",
    culturalContext: "Nove meses de gestação, cornos de Oxum, musas gregas.",
  },
  "0": {
    key: "wholeness",
    meaning: "Zero - O Vácuo Criativo",
    description: "Zero representa o nada fecundo, o potencial puro antes da manifestação. É o ponto onde todos os caminhos se encontram, aona sagrada que contém toda possibilidade.",
    culturalContext: "Shunyata budista, o Ain Soph cabalístico.",
  },
  repeat: {
    key: "repetition",
    meaning: "Padrões Repetidos - Ênfase Cósmica",
    description: "Dígitos repetidos indicam intensificação da energia. Quanto mais repetições, maior a urgência ou o peso espiritual da mensagem. 111, 222, 333 marcam portais numéricos.",
    culturalContext: "Sincronicidade junguiana, anjo números.",
  },
  mirror: {
    key: "mirroring",
    meaning: "Padrões Espelhados - Reflexão e Consciência",
    description: "Sequências espelhadas como 121, 131, 141 indicam que há um reflexo sendo apresentado - seja do passado no presente, ou do interno no externo.",
    culturalContext: "Espelho mágico, o axé duplo, espelhos em rituais.",
  },
  sequence: {
    key: "ascending",
    meaning: "Sequência Ascendente - Evolução e Progresso",
    description: "Números em ordem ascendente sugerem crescimento, evolução espiritual, e o caminho de retorno à fonte. É um convite para avançar.",
    culturalContext: "Escada de Jacó, progressão iniciática.",
  },
  descending: {
    key: "descending",
    meaning: "Sequência Descendente - Involução e Descida",
    description: "Números em ordem descendente indicam descida da consciência para a matéria,encarnação, ou a necessidade degrounding e conexão com o mundo físico.",
    culturalContext: "Queda das esferas,encarnação, ancoragem na matéria.",
  },
  triple: {
    key: "triple_pattern",
    meaning: "Padrão Triplo - Poder Manifestado",
    description: "Padrões triplos como 111, 222, AAA强化am enormemente o significado do dígito. É aotal Completion da energia, pronta para manifestação completa.",
    culturalContext: "Tríplice ameaça, trisagion, tripla chama branca.",
  },
};

/**
 * Get interpretation for a specific input (number, pattern, or sequence type)
 * @param input - The text/number/pattern to interpret
 * @returns Interpretation object or null if no match found
 */
export function getInterpretation(input: string | number): Interpretation | null {
  const key = String(input).toLowerCase().trim();

  // Direct match for single digits
  if (/^[0-9]$/.test(key)) {
    return TEXT_INTERPRETATIONS[key] || null;
  }

  // Pattern detection for repeated digits (e.g., 111, 2222)
  if (/^([0-9])\1+$/.test(key)) {
    return {
      ...TEXT_INTERPRETATIONS.repeat,
      meaning: `${key} — Intensificação de ${input}`,
      description: `A repetição tripla ou mais do dígito ${input} representa uma intensificação extrema. Este é um portal numérico poderoso que exige atenção imediata e ação alinhada com a energia do ${input}.`,
    };
  }

  // Pattern detection for mirrored sequences (e.g., 121, 1331)
  if (/^([0-9])([0-9])\1$/.test(key) || /^([0-9])([0-9])([0-9])\2\1$/.test(key)) {
    return {
      ...TEXT_INTERPRETATIONS.mirror,
      meaning: `${key} — Reflexo Consciente`,
      description: `O padrão espelhado em ${input} indica que uma verdade está sendo refletida de volta. Algo do passado encontra seu eco no presente, ou o mundo interno se projeta no externo. Observe o que está sendo revelado.`,
    };
  }

  // Ascending sequences (e.g., 123, 1234)
  if (/^([0-9])\1*(?:\1(?!\1))*([0-9])(?:\2(?!\2))*([0-9])\3*$/.test(key) && key.length >= 3) {
    const digits = key.split("").map(Number);
    let isAscending = true;
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== digits[i - 1] + 1 && digits[i] !== (digits[i - 1] % 9) + 1) {
        isAscending = false;
        break;
      }
    }
    if (isAscending) {
      return {
        ...TEXT_INTERPRETATIONS.sequence,
        meaning: `${key} — Ascensão`,
        description: `A sequência ascendente ${input} indica um caminho de crescimento e elevação espiritual. É um convite para avançar para o próximo nível de consciência.`,
      };
    }
  }

  // Descending sequences (e.g., 321, 4321)
  if (/^[0-9]+$/.test(key) && key.length >= 3) {
    const digits = key.split("").map(Number);
    let isDescending = true;
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== digits[i - 1] - 1 && digits[i] !== ((digits[i - 1] + 8) % 10)) {
        isDescending = false;
        break;
      }
    }
    if (isDescending) {
      return {
        ...TEXT_INTERPRETATIONS.descending,
        meaning: `${key} — Descida`,
        description: `A sequência descendente ${input} indica uma descida da consciência para a matéria. É um chamado para se ancorar, se encarnar mais completamente, e encontrar propósito no mundo físico.`,
      };
    }
  }

  // Fallback: return digit interpretation if it's a multi-digit number (sum-based)
  if (/^[0-9]+$/.test(key) && key.length > 1) {
    const sum = key.split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    const rootDigit = sum > 9 ? String(sum).split("").reduce((a, d) => a + parseInt(d, 10), 0) : sum;

    return {
      key: "multi_digit",
      meaning: `${input} — Raiz Numérica ${rootDigit}`,
      description: `O número ${input} carrega a energia da raiz ${rootDigit}. A soma de seus dígitos (${sum}) aponta para uma expressão concentrada do dígito ${rootDigit}, intensificada pela complexidade adicional. Interprete ${input} como uma manifestação mais profunda da energia de ${rootDigit}.`,
      culturalContext: TEXT_INTERPRETATIONS[String(rootDigit)]?.culturalContext,
    };
  }

  // Check for keyword patterns
  if (TEXT_INTERPRETATIONS[key]) {
    return TEXT_INTERPRETATIONS[key];
  }

  return null;
}

/**
 * Get all available interpretation keys
 */
export function getInterpretationKeys(): string[] {
  return Object.keys(TEXT_INTERPRETATIONS);
}

/**
 * Check if an input has a specific interpretation type
 */
export function hasInterpretation(input: string | number): boolean {
  return getInterpretation(input) !== null;
}