/**
 * Element-Numerology Spiritual Correlation Module
 * Maps the five classical elements to their numerological correspondences,
 * spiritual meanings, and archetypal associations.
 * Part of the Cabala dos Caminhos spiritual framework.
 */

/**
 * Element types in the spiritual system
 */
export type ElementoTipo = 'fogo' | 'água' | 'terra' | 'ar' | 'éter';

/**
 * Represents the correlation between an element and its numerological properties
 */
export interface ElementNumerology {
  /** Element key */
  elemento: ElementoTipo;
  /** Element name in Portuguese */
  elemento_nome: string;
  /** Element name in English */
  elemento_english: string;
  /** Associated numerology numbers */
  numeros: number[];
  /** Primary spiritual meaning */
  significado_espiritual: string;
  /** Archetypal essence */
  arquetipo: string;
  /** Associated orixá */
  orixa: string;
  /** Associated sephirah */
  sephirah: string;
  /** Chakra correspondence */
  chakra: string;
  /** Primary planet */
  planeta: string;
  /** Associated color */
  cor: string;
  /** Cardinal direction */
  direcao: string;
  /** Element qualities */
  qualidades: {
    /** Element strengths */
    forca: string;
    /** Element challenges */
    desafio: string;
    /** Life lesson */
    licao: string;
    /** Spiritual affirmation */
    afirmacao: string;
  };
  /** Energy quality */
  energia: {
    tipo: 'Quente' | 'Frio' | 'Neutro';
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
  };
}

/**
 * Complete mapping of the 5 elements to their numerological correspondences.
 * Each element carries numerological signatures that represent different
 * aspects of spiritual transformation and cosmic law.
 */
export const ELEMENT_NUMEROLOGY_MAP: Record<ElementoTipo, ElementNumerology> = {
  fogo: {
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    numeros: [1, 3, 6, 12],
    significado_espiritual:
      'O Fogo representa a chama da vontade divina, a força de criação que transforma e purifica. Cada número associado ao fogo carrega um aspecto diferente: 1 para a liderança, 3 para a expressão criativa, 6 para o amor harmônico, e 12 para a justiça divina.',
    arquetipo: 'O Guerreiro da Luz / O Purificador',
    orixa: 'Xangô',
    sephirah: 'Geburah',
    chakra: '3º Plexo Solar (Manipura)',
    planeta: 'Marte',
    cor: 'Vermelho',
    direcao: 'Sul',
    qualidades: {
      forca: 'Determinação, coragem, paixão transformadora, capacidade de manifestar',
      desafio: 'Impaciência, agressividade, controle excessivo, fanatismo',
      licao: 'Canalizar a energia do fogo em propósito construtivo e amoroso',
      afirmacao: 'Eu transformo minha paixão em ação sagrada e serviço amoroso',
    },
    energia: {
      tipo: 'Quente',
      polaridade: 'Yang',
    },
  },
  água: {
    elemento: 'água',
    elemento_nome: 'Água',
    elemento_english: 'Water',
    numeros: [2, 5, 9],
    significado_espiritual:
      'A Água representa a sabedoria emocional, a fluidez do universo e a compaixão profunda. Cada número associado à água revela um aspecto: 2 para a receptividade, 5 para a transformação alquímica, e 9 para a iluminação universal.',
    arquetipo: 'O Guardião das Emoções / O Sábio Compassivo',
    orixa: 'Iemanjá',
    sephirah: 'Yesod',
    chakra: '2º Sacro (Svadhisthana)',
    planeta: 'Lua',
    cor: 'Azul',
    direcao: 'Oeste',
    qualidades: {
      forca: 'Intuição profunda, compaixão, adaptabilidade, sensibilidade',
      desafio: 'Dificuldade em estabelecer limites, volatilidade emocional',
      licao: 'Manter a clareza emocional sem perder a sensibilidade e conexão',
      afirmacao: 'Eu fluo com a vida mantendo minha essência e meus limites sagrados',
    },
    energia: {
      tipo: 'Frio',
      polaridade: 'Yin',
    },
  },
  terra: {
    elemento: 'terra',
    elemento_nome: 'Terra',
    elemento_english: 'Earth',
    numeros: [4, 10, 13],
    significado_espiritual:
      'A Terra representa a estabilidade material, a ancoragem espiritual e a manifestação prática. Cada número carrega: 4 para a construção de alicerces, 10 para a renovação e transformação, e 13 para a evolução através da morte e renascimento.',
    arquetipo: 'O Fundador / O Ancestral',
    orixa: 'Oxóssi',
    sephirah: 'Malkuth',
    chakra: '1º Básico (Muladhara)',
    planeta: 'Saturno',
    cor: 'Verde',
    direcao: 'Norte',
    qualidades: {
      forca: 'Paciência, confiabilidade, prática, ancoramento, perseverança',
      desafio: 'Rigidez, materialismo, resistência a mudanças, apego ao passado',
      licao: 'Equilibrar estabilidade com flexibilidade e abertura à transformação',
      afirmacao: 'Eu sou abundante, merecedor de prosperidade e segurança material e espiritual',
    },
    energia: {
      tipo: 'Quente',
      polaridade: 'Yang',
    },
  },
  ar: {
    elemento: 'ar',
    elemento_nome: 'Ar',
    elemento_english: 'Air',
    numeros: [7, 8],
    significado_espiritual:
      'O Ar representa o pensamento divino, a comunicação com o sagrado e a justiça kármica. Cada número revela: 7 para a sabedoria introspectiva e misticismo, 8 para o poder pessoal e a autoridade interior.',
    arquetipo: 'O Mensageiro / O Filósofo',
    orixa: 'Iansã',
    sephirah: 'Netzach',
    chakra: '5º Laríngeo (Vishuddha)',
    planeta: 'Mercúrio',
    cor: 'Amarelo',
    direcao: 'Leste',
    qualidades: {
      forca: 'Comunicação clara, objetividade, visão ampla, intelectualidade',
      desafio: 'Superficialidade, indecisão, excesso de análise, desancoramento',
      licao: 'Ancorar pensamentos em ação concreta e consistente com o propósito',
      afirmacao: 'Eu comunico minha verdade com clareza, amor e sabedoria divina',
    },
    energia: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
    },
  },
  éter: {
    elemento: 'éter',
    elemento_nome: 'Éter',
    elemento_english: 'Ether',
    numeros: [11],
    significado_espiritual:
      'O Éter representa a conexão direta com a Fonte criadora, o número mestre da iluminação espiritual. O 11 carrega a intuição desperta e o channeling da vontade divina, sendo o único número etéreo.',
    arquetipo: 'O Canalizador / O Desperto',
    orixa: 'Oxalá',
    sephirah: 'Kether',
    chakra: '7º Coronário (Sahasrara)',
    planeta: 'Sol',
    cor: 'Branco-dourado',
    direcao: 'Centro',
    qualidades: {
      forca: 'Sabedoria transcendental, espiritualidade profunda, intuição desperta',
      desafio: 'Desconexão da realidade terrena, idealismo excessivo, vulnerabilidade',
      licao: 'Manifestar a luz espiritual no mundo físico sem perder a transcendência',
      afirmacao: 'Eu sou um canal de luz e paz divina que ilumina o mundo ao meu redor',
    },
    energia: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ELEMENT_NUMEROLOGY_MAP);
Object.values(ELEMENT_NUMEROLOGY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the element-numerology mapping for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns ElementNumerology mapping or undefined if not found
 */
export function getElementNumerology(elemento: string): ElementNumerology | undefined {
  const normalized = elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const mapping: Record<string, ElementoTipo> = {
    fogo: 'fogo',
    agua: 'água',
    ar: 'ar',
    terra: 'terra',
    eter: 'éter',
  };
  const key = mapping[normalized];
  return key ? ELEMENT_NUMEROLOGY_MAP[key] : undefined;
}

/**
 * Get all element-numerology mappings
 * @returns Array of all ElementNumerology mappings
 */
export function getAllElementNumerologies(): ElementNumerology[] {
  return Object.values(ELEMENT_NUMEROLOGY_MAP);
}

/**
 * Get the numerology numbers for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Array of numerology numbers or null if not found
 */
export function getNumerologyByElement(elemento: string): number[] | null {
  const mapping = getElementNumerology(elemento);
  return mapping?.numeros ?? null;
}

/**
 * Get the element for a given numerology number
 * @param numero - Numerology number (1-13)
 * @returns Element name or null if not found
 */
export function getNumerologyElement(numero: number): string | null {
  for (const mapping of Object.values(ELEMENT_NUMEROLOGY_MAP)) {
    if (mapping.numeros.includes(numero)) {
      return mapping.elemento_nome;
    }
  }
  return null;
}

/**
 * Get the archetype for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Archetype name or null if not found
 */
export function getArquetipoByElement(elemento: string): string | null {
  const mapping = getElementNumerology(elemento);
  return mapping?.arquetipo ?? null;
}

/**
 * Get the qualities for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Qualities object or null if not found
 */
export function getQualidadesByElement(elemento: string): ElementNumerology['qualidades'] | null {
  const mapping = getElementNumerology(elemento);
  return mapping?.qualidades ?? null;
}

/**
 * Get the spiritual meaning for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Spiritual meaning or null if not found
 */
export function getSignificadoByElement(elemento: string): string | null {
  const mapping = getElementNumerology(elemento);
  return mapping?.significado_espiritual ?? null;
}

/**
 * Get the energy type for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Energy type ('Quente', 'Frio', 'Neutro') or null if not found
 */
export function getEnergiaByElement(elemento: string): 'Quente' | 'Frio' | 'Neutro' | null {
  const mapping = getElementNumerology(elemento);
  return mapping?.energia.tipo ?? null;
}

/**
 * Get the polarity for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Polarity ('Yang', 'Yin', 'Equilibrado') or null if not found
 */
export function getPolaridadeByElement(elemento: string): 'Yang' | 'Yin' | 'Equilibrado' | null {
  const mapping = getElementNumerology(elemento);
  return mapping?.energia.polaridade ?? null;
}

/**
 * Get all registered element types
 * @returns Array of element type keys
 */
export function getAllElementTypes(): ElementoTipo[] {
  return ['fogo', 'água', 'terra', 'ar', 'éter'];
}

/**
 * Get all registered numerology numbers across all elements
 * @returns Array of all numerology numbers (unique, sorted)
 */
export function getAllNumerologyNumbers(): number[] {
  const numbers = new Set<number>();
  for (const mapping of Object.values(ELEMENT_NUMEROLOGY_MAP)) {
    for (const n of mapping.numeros) {
      numbers.add(n);
    }
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export default {
  getElementNumerology,
  getAllElementNumerologies,
  getNumerologyByElement,
  getNumerologyElement,
  getArquetipoByElement,
  getQualidadesByElement,
  getSignificadoByElement,
  getEnergiaByElement,
  getPolaridadeByElement,
  getAllElementTypes,
  getAllNumerologyNumbers,
  ELEMENT_NUMEROLOGY_MAP,
};