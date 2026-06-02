/**
 * Element-Frequency Correlation Module
 * Maps the five classical elements to Solfeggio frequencies with their healing properties
 * Part of the Cabala dos Caminhos spiritual framework
 */

/**
 * Element types in the spiritual system
 */
export type ElementoTipo = 'fogo' | 'água' | 'terra' | 'ar' | 'éter';

/**
 * Represents the correlation between an element and its Solfeggio frequency
 */
export interface ElementFrequency {
  /** Element key */
  elemento: ElementoTipo;
  /** Element name in Portuguese */
  elemento_nome: string;
  /** Element name in English */
  elemento_english: string;
  /** Associated Solfeggio frequency in Hz */
  frequencia: number;
  /** Chakra correspondence */
  chakra: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Primary healing properties */
  propriedades_healing: {
    /** Physical healing focus */
    fisico: string;
    /** Emotional healing focus */
    emocional: string;
    /** Mental/spiritual healing focus */
    mental_espiritual: string;
    /** Recommended practice type */
    pratica_recomendada: string;
  };
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
  /** Associated color */
  cor: string;
  /** Cardinal direction */
  direcao: string;
  /** Associated Orixá */
  orixa: string;
  /** Primary planet */
  planeta: string;
  /** Sacred affirmation/prayer */
  oracao_sagrada: string;
}

/**
 * Complete mapping of the 5 elements to their Solfeggio frequencies.
 * Each element carries a vibrational signature that resonates with its
 * corresponding frequency for healing and spiritual work.
 */
export const ELEMENT_FREQUENCY_MAP: Record<ElementoTipo, ElementFrequency> = {
  fogo: {
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    frequencia: 528,
    chakra: '3º Plexo Solar (Manipura)',
    chakra_numero: 3,
    propriedades_healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital',
      emocional: 'Transforma negatividade em compaixão e amor incondicional',
      mental_espiritual: 'Ativa criatividade, intuição e manifestação de objetivos',
      pratica_recomendada: 'Trabalho com intenção, meditação ativa, yoga do fogo',
    },
    qualidades: {
      forca: 'Determinação, coragem, paixão transformadora',
      desafio: 'Impaciência, agressividade, controle excessivo',
      licao: 'Canalizar a energia em propósito construtivo',
      afirmacao: 'Eu transformo minha paixão em ação sagrada e amoroso serviço',
    },
    cor: 'Vermelho',
    direcao: 'Sul',
    orixa: 'Xangô',
    planeta: 'Marte',
    oracao_sagrada: 'Xangô, concede-me a força da justiça e do equilíbrio',
  },
  água: {
    elemento: 'água',
    elemento_nome: 'Água',
    elemento_english: 'Water',
    frequencia: 417,
    chakra: '2º Sacro (Svadhisthana)',
    chakra_numero: 2,
    propriedades_healing: {
      fisico: 'Hidrata tecidos, melhora circulação e limpeza celular',
      emocional: 'Libera traumas emocionais e padrões do passado',
      mental_espiritual: 'Facilita adaptação, flexibilidade e renovação interior',
      pratica_recomendada: 'Trabalho emocional profundo, terapia vibracional com água',
    },
    qualidades: {
      forca: 'Intuição profunda, compaixão, adaptabilidade',
      desafio: 'Dificuldade em estabelecer limites, volatilidade emocional',
      licao: 'Manter a clareza emocional sem perder a sensibilidade',
      afirmacao: 'Eu fluo com a vida mantendo minha essência e meus limites',
    },
    cor: 'Azul',
    direcao: 'Oeste',
    orixa: 'Iemanjá',
    planeta: 'Lua',
    oracao_sagrada: 'Iemanjá, mãe das águas, purifica minha alma e concede-me paz',
  },
  terra: {
    elemento: 'terra',
    elemento_nome: 'Terra',
    elemento_english: 'Earth',
    frequencia: 396,
    chakra: '1º Básico (Muladhara)',
    chakra_numero: 1,
    propriedades_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais',
      emocional: 'Dissolve medos de sobrevivência e sensação de insegurança',
      mental_espiritual: 'Promove clareza mental, foco e determinação',
      pratica_recomendada: 'Meditação em grupo, trabalho ancestral, caminhada na natureza',
    },
    qualidades: {
      forca: 'Paciência, confiabilidade, prática, ancoramento',
      desafio: 'Rigidez, materialismo, resistência a mudanças',
      licao: 'Equilibrar estabilidade com flexibilidade e abertura',
      afirmacao: 'Eu sou abundante, merecedor de prosperidade e segurança',
    },
    cor: 'Verde',
    direcao: 'Norte',
    orixa: 'Oxóssi',
    planeta: 'Saturno',
    oracao_sagrada: 'Oxóssi, guia-me pela trilha da sabedoria e abundância',
  },
  ar: {
    elemento: 'ar',
    elemento_nome: 'Ar',
    elemento_english: 'Air',
    frequencia: 741,
    chakra: '5º Laríngeo (Vishuddha)',
    chakra_numero: 5,
    propriedades_healing: {
      fisico: 'Limpa garganta, ouvidos e vias respiratórias',
      emocional: 'Liberta medo de falar verdades e se expressar autenticamente',
      mental_espiritual: 'Desperta sabedoria interior e expressão criativa',
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e respiração',
    },
    qualidades: {
      forca: 'Comunicação clara, objetividade, visão ampla',
      desafio: 'Superficialidade, indecisão, excesso de análise',
      licao: 'Ancorar pensamentos em ação concreta e consistente',
      afirmacao: 'Eu comunico minha verdade com clareza, amor e sabedoria',
    },
    cor: 'Amarelo',
    direcao: 'Leste',
    orixa: 'Iansã',
    planeta: 'Mercúrio',
    oracao_sagrada: 'Iansã, dá-me coragem para transformação e expressão autêntica',
  },
  éter: {
    elemento: 'éter',
    elemento_nome: 'Éter',
    elemento_english: 'Ether',
    frequencia: 963,
    chakra: '7º Coronário (Sahasrara)',
    chakra_numero: 7,
    propriedades_healing: {
      fisico: 'Restaura padrão original do DNA e regeneração celular',
      emocional: 'Promove paz profunda e unidade com tudo existente',
      mental_espiritual: 'Conexão direta com a Fonte criadora e infinito',
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura',
    },
    qualidades: {
      forca: 'Sabedoria, espiritualidade, conexão divina',
      desafio: 'Desconexão da realidade, idealismo excessivo',
      licao: 'Manifestar a luz espiritual no mundo físico sem perder a transcendência',
      afirmacao: 'Eu sou um canal de luz e paz divina que ilumina o mundo',
    },
    cor: 'Branco-dourado',
    direcao: 'Centro',
    orixa: 'Oxalá',
    planeta: 'Sol',
    oracao_sagrada: 'Oxalá, Pai/Mãe de toda luz, guia minha alma para a paz eterna',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ELEMENT_FREQUENCY_MAP);
Object.values(ELEMENT_FREQUENCY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the element-frequency mapping for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns ElementFrequency mapping or undefined if not found
 */
export function getElementFrequency(elemento: string): ElementFrequency | undefined {
  const normalized = elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const mapping: Record<string, ElementoTipo> = {
    'fogo': 'fogo',
    'agua': 'água',
    'ar': 'ar',
    'terra': 'terra',
    'eter': 'éter',
  };
  const key = mapping[normalized];
  return key ? ELEMENT_FREQUENCY_MAP[key] : undefined;
}

/**
 * Get reverse mapping: frequency to element
 * @returns Record mapping each frequency (Hz) to its element
 */
export function getFrequencyElement(): Record<number, ElementoTipo> {
  return {
    396: 'terra',
    417: 'água',
    528: 'fogo',
    741: 'ar',
    963: 'éter',
  };
}

/**
 * Get all element-frequency mappings
 * @returns Array of all ElementFrequency mappings
 */
export function getAllElementFrequencies(): ElementFrequency[] {
  return Object.values(ELEMENT_FREQUENCY_MAP);
}

/**
 * Get the frequency for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyByElement(elemento: string): number | null {
  const mapping = getElementFrequency(elemento);
  return mapping?.frequencia ?? null;
}

/**
 * Get the element for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Element name or null if not found
 */
export function getElementByFrequency(frequencia: number): string | null {
  const reverseMap = getFrequencyElement();
  return reverseMap[frequencia] ?? null;
}

/**
 * Get the chakra for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Chakra name or null if not found
 */
export function getChakraByElement(elemento: string): string | null {
  const mapping = getElementFrequency(elemento);
  return mapping?.chakra ?? null;
}

/**
 * Get the healing properties for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Healing properties object or null if not found
 */
export function getHealingByElement(elemento: string): ElementFrequency['propriedades_healing'] | null {
  const mapping = getElementFrequency(elemento);
  return mapping?.propriedades_healing ?? null;
}

/**
 * Get the qualities (força, desafio, licao, afirmacao) for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Qualities object or null if not found
 */
export function getQualidadesByElement(elemento: string): ElementFrequency['qualidades'] | null {
  const mapping = getElementFrequency(elemento);
  return mapping?.qualidades ?? null;
}

/**
 * Get the associated Orixá for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Orixá name or null if not found
 */
export function getOrixaByElement(elemento: string): string | null {
  const mapping = getElementFrequency(elemento);
  return mapping?.orixa ?? null;
}

/**
 * Get the associated planet for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Planet name or null if not found
 */
export function getPlanetaByElement(elemento: string): string | null {
  const mapping = getElementFrequency(elemento);
  return mapping?.planeta ?? null;
}

/**
 * Get the associated color for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Color string or null if not found
 */
export function getColorByElement(elemento: string): string | null {
  const mapping = getElementFrequency(elemento);
  return mapping?.cor ?? null;
}

/**
 * Get the cardinal direction for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Direction string or null if not found
 */
export function getDirectionByElement(elemento: string): string | null {
  const mapping = getElementFrequency(elemento);
  return mapping?.direcao ?? null;
}

/**
 * Get all registered element types
 * @returns Array of element type keys
 */
export function getAllElementTypes(): ElementoTipo[] {
  return ['fogo', 'água', 'terra', 'ar', 'éter'];
}

/**
 * Get all registered frequencies
 * @returns Array of frequencies in Hz
 */
export function getAllFrequencies(): number[] {
  return [396, 417, 528, 741, 963];
}

// fallow-ignore-next-line unused-export
export default {
  getElementFrequency,
  getFrequencyElement,
  getAllElementFrequencies,
  getFrequencyByElement,
  getElementByFrequency,
  getChakraByElement,
  getHealingByElement,
  getQualidadesByElement,
  getOrixaByElement,
  getPlanetaByElement,
  getColorByElement,
  getDirectionByElement,
  getAllElementTypes,
  getAllFrequencies,
  ELEMENT_FREQUENCY_MAP,
};