/**
 * Numerology-Element Spiritual Correlation Module
 *
 * Maps numerology numbers (1-13) to their elemental correspondences.
 * Each number carries specific vibrational signatures aligned with
 * elements in the Cabala dos Caminhos spiritual system.
 */

/**
 * Element types in the spiritual system
 */
export type ElementoTipo = 'fogo' | 'água' | 'terra' | 'ar' | 'éter';

/**
 * Represents the correlation between a numerology number and its elemental properties
 */
export interface NumerologyElement {
  /** Numerology number */
  numero: number;
  /** Element key */
  elemento: ElementoTipo;
  /** Element name in Portuguese */
  elemento_nome: string;
  /** Element name in English */
  elemento_english: string;
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
 * Complete mapping of numerology numbers 1-13 to their elemental correspondences.
 * Each number carries a specific Vibration aligned with elemental forces
 * that represent different aspects of spiritual transformation and cosmic law.
 */
export const NUMEROLOGY_ELEMENT_MAP: Record<number, NumerologyElement> = {
  1: {
    numero: 1,
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    significado_espiritual:
      'O número 1 é a chama da vontade divina, a centelha criadora que inicia toda manifestação. Representa a liderança, a coragem e o poder de transformar sonhos em realidade através da intenção pura.',
    arquetipo: 'O Guerreiro da Luz / O Criador',
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
  2: {
    numero: 2,
    elemento: 'água',
    elemento_nome: 'Água',
    elemento_english: 'Water',
    significado_espiritual:
      'O número 2 é a sabedoria emocional, a fluidez do universo e a compaixão profunda. Representa a receptividade, a intuição e a capacidade de acolher as águas da sabedoria divina.',
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
      affirmacao: 'Eu fluo com a vida mantendo minha essência e meus limites sagrados',
    },
    energia: {
      tipo: 'Frio',
      polaridade: 'Yin',
    },
  },
  3: {
    numero: 3,
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    significado_espiritual:
      'O número 3 é a expressão criativa sagrada, a trindade divina em ação. Representa a comunicação, a alegria e a capacidade de transformar a energia em criação artística e espiritual.',
    arquetipo: 'O Guerreiro da Luz / O Artista Sagrado',
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
  4: {
    numero: 4,
    elemento: 'terra',
    elemento_nome: 'Terra',
    elemento_english: 'Earth',
    significado_espiritual:
      'O número 4 é a estabilidade material, a ancoragem espiritual e a manifestação prática. Representa a construção de alicerces sólidos, o trabalho árduo sagrado e a perseverança divina.',
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
  5: {
    numero: 5,
    elemento: 'água',
    },
    energia: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
    },
  },
  8: {
    elemento_english: 'Water',
    significado_espiritual:
      'O número 5 é a transformação alquímica, a liberdade sagrada e a mudança certa. Representa a adaptação, a curiosidade espiritual e a capacidade de fluir através das transformações da vida.',
    arquetipo: 'O Guardião das Emoções / O alquimista',
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
  6: {
    numero: 6,
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    significado_espiritual:
      'O número 6 é o amor harmônico, a responsabilidade sagrada e a paz divina. Representa a capacidade de irradiar luz e calor amoroso, criando harmonia nos relacionamentos e no lar espiritual.',
    arquetipo: 'O Guerreiro da Luz / O Guardião do Lar',
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
  7: {
    numero: 7,
    elemento: 'ar',
    elemento_nome: 'Ar',
    elemento_english: 'Air',
    significado_espiritual:
      'O número 7 é a sabedoria introspectiva, o misticismo profundo e a contemplação sagrada. Representa a busca interior, a análise espiritual e a conexão com os mistérios do universo.',
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
      tipo: 'Neut ro',
      polaridade: 'Equilibrado',
    },
  },
  8: {
    numero: 8,
    elemento: 'ar',
    elemento_nome: 'Ar',
    elemento_english: 'Air',
    significado_espiritual:
      'O número 8 é o poder pessoal, a autoridade interior e a justiça kármica. Representa a capacidade de manifestar abundância, a sabedoria prática e o equilíbrio entre o céu e a terra.',
    arquetipo: 'O Mensageiro / O Justiceiro',
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
  9: {
    numero: 9,
    elemento: 'água',
    elemento_nome: 'Água',
    elemento_english: 'Water',
    significado_espiritual:
      'O número 9 é a iluminação universal, a compaixão infinita e o encerramento sagrado. Representa a sabedoria conquistada, a generosity روحانية and the ability to transcender boundaries.',
    arquetipo: 'O Guardião das Emoções / O Iluminado',
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
  10: {
    numero: 10,
    elemento: 'terra',
    elemento_nome: 'Terra',
    elemento_english: 'Earth',
    significado_espiritual:
      'O número 10 é a renovação e transformação, o recomeço sagrado e a nova era. Representa a sabedoria divina recebida, a capacidade de renascimento e a manifestação de novos ciclos.',
    arquetipo: 'O Fundador / O Renascido',
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
  11: {
    numero: 11,
    elemento: 'éter',
    elemento_nome: 'Éter',
    elemento_english: 'Ether',
    significado_espiritual:
      'O número 11 é a conexão direta com a Fonte criadora, o número mestre da iluminação espiritual. Carrega a intuição desperta e o channeling da vontade divina para transformação coletiva.',
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
  12: {
    numero: 12,
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    significado_espiritual:
      'O número 12 é a justiça divina, o sacrifício sagrado e a ordem cósmica. Representa a aplicação da lei espiritual, a equilíbrio entre retribuição e misericórdia e a transformação pela prova.',
    arquetipo: 'O Guerreiro da Luz / O Executor da Lei',
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
  13: {
    numero: 13,
    elemento: 'terra',
    elemento_nome: 'Terra',
    elemento_english: 'Earth',
    significado_espiritual:
      'O número 13 é a evolução através da morte e renascimento, a transformação radical e a nova vida. Representa a coragem de atravessar o umbral, deixando o velho para nascer de novo.',
    arquetipo: 'O Fundador / O Renascido das Cinzas',
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
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(NUMEROLOGY_ELEMENT_MAP);
Object.values(NUMEROLOGY_ELEMENT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the numerology-element mapping for a given number
 * @param numero - Numerology number (1-13)
 * @returns NumerologyElement mapping or undefined if not found
 */
export function getNumerologyElement(numero: number): NumerologyElement | undefined {
  return NUMEROLOGY_ELEMENT_MAP[numero];
}

/**
 * Get all numerology-element mappings
 * @returns Array of all NumerologyElement mappings
 */
export function getAllNumerologyElements(): NumerologyElement[] {
  return Object.values(NUMEROLOGY_ELEMENT_MAP);
}

/**
 * Get the element for a given numerology number
 * @param numero - Numerology number (1-13)
 * @returns Element name or null if not found
 */
export function getElementNumerology(numero: number): string | null {
  const mapping = NUMEROLOGY_ELEMENT_MAP[numero];
  return mapping?.elemento_nome ?? null;
}

/**
 * Get the archetype for a given numerology number
 * @param numero - Numerology number (1-13)
 * @returns Archetype name or null if not found
 */
export function getNumerologyArquetipo(numero: number): string | null {
  const mapping = NUMEROLOGY_ELEMENT_MAP[numero];
  return mapping?.arquetipo ?? null;
}

/**
 * Get the spiritual meaning for a given numerology number
 * @param numero - Numerology number (1-13)
 * @returns Spiritual meaning or null if not found
 */
export function getNumerologySignificado(numero: number): string | null {
  const mapping = NUMEROLOGY_ELEMENT_MAP[numero];
  return mapping?.significado_espiritual ?? null;
}

/**
 * Get the qualities for a given numerology number
 * @param numero - Numerology number (1-13)
 * @returns Qualities object or null if not found
 */
export function getNumerologyQualidades(numero: number): NumerologyElement['qualidades'] | null {
  const mapping = NUMEROLOGY_ELEMENT_MAP[numero];
  return mapping?.qualidades ?? null;
}

/**
 * Get the energy type for a given numerology number
 * @param numero - Numerology number (1-13)
 * @returns Energy type ('Quente', 'Frio', 'Neutro') or null if not found
 */
export function getNumerologyEnergia(numero: number): 'Quente' | 'Frio' | 'Neutro' | null {
  const mapping = NUMEROLOGY_ELEMENT_MAP[numero];
  return mapping?.energia.tipo ?? null;
}

/**
 * Get the polarity for a given numerology number
 * @param numero - Numerology number (1-13)
 * @returns Polarity ('Yang', 'Yin', 'Equilibrado') or null if not found
 */
export function getNumerologyPolaridade(numero: number): 'Yang' | 'Yin' | 'Equilibrado' | null {
  const mapping = NUMEROLOGY_ELEMENT_MAP[numero];
  return mapping?.energia.polaridade ?? null;
}

/**
 * Get all registered numerology numbers
 * @returns Array of all numerology numbers (1-13)
 */
export function getAllNumerologyNumbers(): number[] {
  return Array.from({ length: 13 }, (_, i) => i + 1);
}

/**
 * Get all element types from numerology mappings
 * @returns Array of unique element types
 */
export function getAllElementsFromNumerology(): ElementoTipo[] {
  const elements = new Set<ElementoTipo>();
  for (const mapping of Object.values(NUMEROLOGY_ELEMENT_MAP)) {
    elements.add(mapping.elemento);
  }
  return Array.from(elements);
}

export default {
  getNumerologyElement,
  getAllNumerologyElements,
  getElementNumerology,
  getNumerologyArquetipo,
  getNumerologySignificado,
  getNumerologyQualidades,
  getNumerologyEnergia,
  getNumerologyPolaridade,
  getAllNumerologyNumbers,
  getAllElementsFromNumerology,
  NUMEROLOGY_ELEMENT_MAP,
};
