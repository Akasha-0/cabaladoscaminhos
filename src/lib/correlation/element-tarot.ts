/**
 * Element-Tarot Correlation Module
 * Maps spiritual elements to Tarot Major Arcana
 * Source: Cabala dos Caminhos spiritual framework - elemental archetypes
 */

/**
 * Represents the correlation between a spiritual element and its Tarot Major Arcana correspondence
 */
export interface ElementTarotMapping {
  /** Element name */
  elemento: string;
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** How the element connects to this arcano */
  conexao_elemental: string;
  /** Spiritual meaning and archetype interpretation */
  significado_espiritual: string;
  /** Ritual guidance and practical application */
  ritual: string;
}

// ─── Element-to-Tarot Major Arcana Mapping ────────────────────────────────────
// The 5 elements mapped to Major Arcana through elemental archetypes and spiritual
// thematic alignment with the Cabala dos Caminhos framework.

export const ELEMENT_TAROT_MAP: Record<string, ElementTarotMapping> = {
  Terra: {
    elemento: 'Terra',
    arcano: 'O Imperador',
    numero_carta: 4,
    conexao_elemental:
      'O elemento Terra representa solidez, estrutura, autoridade e ordem material. O Imperador incorpora a energia da terra firme - o pai patriarcal que estabelece leis, mantém disciplina e governa com pragmatismo.',
    significado_espiritual:
      'A materialização do poder divino no mundo físico. O Imperador representa a capacidade de criar estruturas duradouras, manifestar prosperidade e estabelecer autoridade sobre o próprio reino interior. Seu cetro de Marte simboliza o comando sobre os elementos terrestres.',
    ritual: 'Rituais de prosperidade, estabilidade financeira, fundação de novos projetos. Trabalhe com cristais terrestres como turmalina negra e quartzo fumê. Meditações de ancoramento e-visualizações de raízes conectando ao centro da Terra.',
  },
  Água: {
    elemento: 'Água',
    arcano: 'A Imperatriz',
    numero_carta: 3,
    conexao_elemental:
      'O elemento Água representa fluidez, emoção, fertilidade e conexão com o inconsciente. A Imperatriz é a grande mãe natureza - a água que nutre, sustenta a vida e conecta todos os seres em seu fluxo constante.',
    significado_espiritual:
      'A expressão do amor criativo e da abundância natural. A Imperatriz ensina que a verdadeira fertilidade vem da conexão com a natureza interior, que o fluxo suave supera a força bruta e que a nutrição vem do dar e receber em equilíbrio.',
    ritual: 'Rituais de amor, fertilidade, cura emocional e conexão com a natureza. Trabalhe com água de nascente, conchas e elementos aquáticos. Medite próximo a fontes, rios ou o mar. Invocar a energia receptiva da lua através de banhos ritualísticos.',
  },
  Fogo: {
    elemento: 'Fogo',
    arcano: 'A Torre',
    numero_carta: 16,
    conexao_elemental:
      'O elemento Fogo representa transformação, paixão, destruição criativa e iluminação. A Torre é o raio que desce do céu - a energia do fogo que incendeia as estruturas falsas para dar lugar à renovação e ao renascimento.',
    significado_espiritual:
      'A catarse necessária que rompe as ilusões do ego. O raio de luz que golpeia a falsa segurança revela a verdade interior. Este arcano ensina que a destruição das crenças limitantes é o caminho para a verdadeira libertação e crescimento espiritual.',
    ritual: 'Rituais de libertação de padrões limitantes, transformação profunda e renascimento. Trabalhe com fogo ritual (velas vermelhas e laranjas), fumo de incenso de sálvia e palo santo. Queime escritos com medos e crenças a serem transformadas.',
  },
  Ar: {
    elemento: 'Ar',
    arcano: 'O Hierofante',
    numero_carta: 5,
    conexao_elemental:
      'O elemento Ar representa comunicação, conhecimento,浮世 e conexões mentais. O Hierofante é o professor sagrado que traz a sabedoria divina através do ar - o mensageiro entre o céu e a terra, o guardião das tradições espirituais.',
    significado_espiritual:
      'O transmissão de ensinamentos sagrados e a busca pela verdade interior através do conhecimento. Este arcano ensina que a sabedoria verdadeira vem da tradição combinada com a experiência pessoal, e que ensinar é também aprender.',
    ritual: 'Rituais de aprendizado espiritual, iniciação, expansão da consciência. Trabalhe com incensos de sálvia branca e lavanda, sons de sinos e campainhas. Medite ao ar livre, deixe os ventos membawa suas preces. Estudos de tradições sagradas.',
  },
  'Éter': {
    elemento: 'Éter',
    arcano: 'O Louco',
    numero_carta: 0,
    conexao_elemental:
      'O elemento Éter (Quintessência) representa a energia divina primordial, a essência que permeia tudo. O Louco é o espírito livre que transcende os elementos - a energia pura do universo antes da divisão em matéria e forma.',
    significado_espiritual:
      'A liberdade infinita da consciência que reconhece sua natureza divina. O Louco representa o salto de fé, a disposição de confiar no universo sem garantias. É o princípio da criação antes da matéria, o potencial puro.',
    ritual: 'Rituais de novo começo, purificação da alma e expansão da consciência. Trabalhe com elementos que representem os 4 elementos juntos - terra, água, fogo e ar. Medite sobre o vazio fértil antes da criação. Práticas de respiração e expansão da energia vital.',
  },
};

/**
 * All 5 elements in traditional order
 */
const ELEMENTOS = ['Terra', 'Água', 'Fogo', 'Ar', 'Éter'] as const;

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ELEMENT_TAROT_MAP);
Object.values(ELEMENT_TAROT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the element-Tarot correlation mapping for a given element
 * @param elemento - Element name (Terra, Água, Fogo, Ar, Éter)
 * @returns ElementTarotMapping or null if not found
 */
export function getElementTarot(elemento: string): ElementTarotMapping | null {
  return ELEMENT_TAROT_MAP[elemento] ?? null;
}

/**
 * Get the element corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Imperatriz')
 * @returns The element name or null if not found
 */
export function getTarotElement(arcano: string): string | null {
  for (const mapping of Object.values(ELEMENT_TAROT_MAP)) {
    if (mapping.arcano === arcano) {
      return mapping.elemento;
    }
  }
  return null;
}

/**
 * Get the element by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The element name or null if not found
 */
export function getElementByNumber(numero: number): string | null {
  for (const mapping of Object.values(ELEMENT_TAROT_MAP)) {
    if (mapping.numero_carta === numero) {
      return mapping.elemento;
    }
  }
  return null;
}

/**
 * Get the arcano name by element
 * @param elemento - Element name
 * @returns The arcano name or null if not found
 */
export function getArcanoByElement(elemento: string): string | null {
  return ELEMENT_TAROT_MAP[elemento]?.arcano ?? null;
}

/**
 * Get all available element-Tarot mappings
 * @returns Array of all correlation mappings
 */
export function getAllElementTarots(): ElementTarotMapping[] {
  return Object.values(ELEMENT_TAROT_MAP);
}

/**
 * Get all elements
 * @returns Array of element names
 */
export function getAllElements(): string[] {
  return [...ELEMENTOS];
}

/**
 * Check if an element exists in the mapping
 * @param elemento - Element name to check
 * @returns True if element exists in mapping
 */
export function hasElementTarot(elemento: string): boolean {
  return elemento in ELEMENT_TAROT_MAP;
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.values(ELEMENT_TAROT_MAP).map((m) => m.arcano);
}

/**
 * Get the card number associated with an element
 * @param elemento - Element name
 * @returns Card number (0-21) or null if not found
 */
export function getCardNumberByElement(elemento: string): number | null {
  return ELEMENT_TAROT_MAP[elemento]?.numero_carta ?? null;
}

/**
 * Get the elemental connection description
 * @param elemento - Element name
 * @returns Connection description or null if not found
 */
export function getConexaoElemental(elemento: string): string | null {
  return ELEMENT_TAROT_MAP[elemento]?.conexao_elemental ?? null;
}