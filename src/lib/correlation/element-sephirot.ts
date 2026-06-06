/**
 * Element-Sephirot Correlation Module
 * Maps the five classical elements to the Sephiroth (Divine Attributes)
 * Part of the Cabala dos Caminhos spiritual framework
 */

/**
 * Element types in the spiritual system
 */
export type ElementoTipo = 'fogo' | 'água' | 'terra' | 'ar' | 'éter';

/**
 * Represents the correlation between an element and its Sephiroth
 */
export interface ElementSephirot {
  /** Element key */
  elemento: ElementoTipo;
  /** Element name in Portuguese */
  elemento_nome: string;
  /** Element name in English */
  elemento_english: string;
  /** Primary associated Sephirah */
  sephirah: string;
  /** Sephirah in Hebrew */
  sephirah_hebrew: string;
  /** Secondary associated Sephiroth */
  sephiroth_secundarias: string[];
  /** Chakra correspondence */
  chakra: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Path number on the Tree of Life */
  caminho: number;
  /** Spiritual meaning of the element-Sephirot relationship */
  significado_espiritual: {
    /** Core spiritual meaning */
    core: string;
    /** Divine quality activation */
    qualidade_divina: string;
    /** Lesson for spiritual development */
    licao: string;
    /** Affirmation for meditation */
    afirmacao: string;
  };
  /** Element qualities */
  qualidades: {
    /** Element strengths */
    forca: string;
    /** Element challenges */
    desafio: string;
    /** Life lesson */
    licao_vida: string;
    /** Spiritual affirmation */
    afirmacao_espiritual: string;
  };
  /** Associated color */
  cor: string;
  /** Cardinal direction */
  direcao: string;
  /** Associated Orixá */
  orixa: string;
  /** Divine name attribute */
  nome_divino: string;
  /** Sacred affirmation/prayer */
  oracao_sagrada: string;
}

/**
 * Complete mapping of the 5 elements to their Sephiroth correspondences.
 * Each element carries a vibrational signature that resonates with its
 * corresponding Sephirah for spiritual illumination and growth.
 */
export const ELEMENT_SEPHIROT_MAP: Record<ElementoTipo, ElementSephirot> = {
  fogo: {
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    sephirah: 'Gevurah',
    sephirah_hebrew: 'גבורה',
    sephiroth_secundarias: ['Netzach', 'Hod'],
    chakra: '3º Plexo Solar (Manipura)',
    chakra_numero: 3,
    caminho: 5,
    significado_espiritual: {
      core: 'Energia transformadora que purifica e transforma',
      qualidade_divina: 'Força, Julgamento e Disciplina Sagrada',
      licao: 'Canalizar a energia do fogo em ação justa e compassiva',
      afirmacao: 'Eu canalizo a força sagrada de Gevurah para a transformação справедлива',
    },
    qualidades: {
      forca: 'Determinação, coragem, paixão transformadora',
      desafio: 'Impaciência, agressividade, controle excessivo',
      licao_vida: 'Aprender a usar a força com sabedoria e compaixão',
      afirmacao_espiritual: 'Eu transformo minha paixão em ação sagrada e amoroso serviço',
    },
    cor: 'Vermelho',
    direcao: 'Sul',
    orixa: 'Xangô',
    nome_divino: 'Elohim',
    oracao_sagrada: 'Gevurah, concede-me a força da justiça e o discernimento para usar o poder com sabedoria',
  },
  água: {
    elemento: 'água',
    elemento_nome: 'Água',
    elemento_english: 'Water',
    sephirah: 'Binah',
    sephirah_hebrew: 'בינה',
    sephiroth_secundarias: ['Yesod', 'Chokhmah'],
    chakra: '2º Sacro (Svadhisthana)',
    chakra_numero: 2,
    caminho: 3,
    significado_espiritual: {
      core: 'Fluxo receptivo que dá forma e estrutura',
      qualidade_divina: 'Compreensão, Forma e Limitação Sagrada',
      licao: 'Aceitar a receptividade como força, não como fraqueza',
      afirmacao: 'Eu fluo com a sabedoria das águas superiores de Binah com clareza e propósito',
    },
    qualidades: {
      forca: 'Intuição profunda, compaixão, adaptabilidade',
      desafio: 'Dificuldade em estabelecer limites, volatilidade emocional',
      licao_vida: 'Manter a fluidez emocional sem perder a própria essência',
      afirmacao_espiritual: 'Eu fluo com a vida mantendo minha essência e meus limites',
    },
    cor: 'Azul',
    direcao: 'Oeste',
    orixa: 'Iemanjá',
    nome_divino: 'YHWH',
    oracao_sagrada: 'Binah, mãe da compreensão, purifica minha alma e concede-me a sabedoria da forma',
  },
  terra: {
    elemento: 'terra',
    elemento_nome: 'Terra',
    elemento_english: 'Earth',
    sephirah: 'Malkhut',
    sephirah_hebrew: 'מלכות',
    sephiroth_secundarias: ['Yesod', ' Netzach'],
    chakra: '1º Básico (Muladhara)',
    chakra_numero: 1,
    caminho: 10 /** Malkhut is the 10th Sephirah */,
    significado_espiritual: {
      core: 'Manifestação física do divino no mundo material',
      qualidade_divina: 'Reino, Presença e Manifestação Divina',
      licao: 'Reconhecer o sagrado no ordinário e no cotidiano',
      afirmacao: 'Eu sou o reinoonde o divino se manifesta, conduzindo a luz ao mundo',
    },
    qualidades: {
      forca: 'Paciência, confiabilidade, prática, ancoramento',
      desafio: 'Rigidez, materialismo, resistência a mudanças',
      licao_vida: 'Equilibrar estabilidade com flexibilidade e abertura espiritual',
      afirmacao_espiritual: 'Eu sou abundante, merecedor de prosperidade e segurança',
    },
    cor: 'Verde',
    direcao: 'Norte',
    orixa: 'Oxóssi',
    nome_divino: 'Adonai HaAretz',
    oracao_sagrada: 'Malkhut, rainha do reino, guia-me naarte de manifestar a luz no mundo',
  },
  ar: {
    elemento: 'ar',
    elemento_nome: 'Ar',
    elemento_english: 'Air',
    sephirah: 'Tiferet',
    sephirah_hebrew: 'תפארת',
    sephiroth_secundarias: ['Chesed', 'Gevurah'],
    chakra: '4º Cardíaco (Anahata)',
    chakra_numero: 4,
    caminho: 6,
    significado_espiritual: {
      core: 'Espaço de liberdade onde a alma respira e se expande',
      qualidade_divina: 'Beleza, Harmonia e Equilíbrio Mediano',
      licao: 'Encontrar o ponto de equilíbrio entre opostos',
      afirmacao: 'Eu respiro a liberdade do ar sagrado de Tiferet, encontrando harmonia em meu coração',
    },
    qualidades: {
      forca: 'Comunicação clara, objetividade, visão ampla',
      desafio: 'Superficialidade, indecisão, excesso de análise',
      licao_vida: 'Ancorar pensamentos em ação concreta e consistente',
      afirmacao_espiritual: 'Eu comunico minha verdade com clareza, amor e sabedoria',
    },
    cor: 'Amarelo',
    direcao: 'Leste',
    orixa: 'Iansã',
    nome_divino: 'Adonai',
    oracao_sagrada: 'Tiferet, belo equilibrio, une meus opostos e conduce-me à harmonia do coração',
  },
  éter: {
    elemento: 'éter',
    elemento_nome: 'Éter',
    elemento_english: 'Ether',
    sephirah: 'Keter',
    sephirah_hebrew: 'כתר',
    sephiroth_secundarias: ['Daat', 'Chokhmah'],
    chakra: '7º Coronário (Sahasrara)',
    chakra_numero: 7,
    caminho: 1 /** Keter is the 1st Sephirah */,
    significado_espiritual: {
      core: 'Vazio sagrado de onde tudo emerge e para onde tudo retorna',
      qualidade_divina: 'Vontade Divina, Coroa e Origem de Tudo',
      licao: 'Aceitar o mistério do vazio como fonte de toda possibilidade',
      afirmacao: 'Eu sou a coroa sagrada de Keter, canal敞开ando a vontade divina para o mundo',
    },
    qualidades: {
      forca: 'Sabedoria, espiritualidade, conexão divina',
      desafio: 'Desconexão da realidade, idealismo excessivo',
      licao_vida: 'Manifestar a luz espiritual no mundo físico sem perder a transcendência',
      afirmacao_espiritual: 'Eu sou um canal de luz e paz divina que ilumina o mundo',
    },
    cor: 'Branco-dourado',
    direcao: 'Centro',
    orixa: 'Oxalá',
    nome_divino: 'Ein Sof',
    oracao_sagrada: 'Keter, coroa divina, abre minha mente para a luz do Infinito e a vontade sagrada',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ELEMENT_SEPHIROT_MAP);
Object.values(ELEMENT_SEPHIROT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the element-Sephirot mapping for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns ElementSephirot mapping or undefined if not found
 */
export function getElementSephirot(elemento: string): ElementSephirot | undefined {
  const normalized = elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const mapping: Record<string, ElementoTipo> = {
    'fogo': 'fogo',
    'agua': 'água',
    'ar': 'ar',
    'terra': 'terra',
    'eter': 'éter',
  };
  const key = mapping[normalized];
  return key ? ELEMENT_SEPHIROT_MAP[key] : undefined;
}

/**
 * Get reverse mapping: Sephirah to element
 * @returns Record mapping each Sephirah name to its element
 */
export function getSephirotElement(): Record<string, ElementoTipo> {
  return {
    'Keter': 'éter',
    'Chokhmah': 'éter',
    'Binah': 'água',
    'Chesed': 'ar',
    'Gevurah': 'fogo',
    'Tiferet': 'ar',
    'Netzach': 'fogo',
    'Hod': 'éter',
    'Yesod': 'terra',
    'Malkhut': 'terra',
  };
}

/**
 * Get all element-Sephirot mappings
 * @returns Array of all ElementSephirot mappings
 */
export function getAllElementSephiroths(): ElementSephirot[] {
  return Object.values(ELEMENT_SEPHIROT_MAP);
}

/**
 * Get the Sephirah for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Sephirah name or null if not found
 */
export function getSephirahByElement(elemento: string): string | null {
  const mapping = getElementSephirot(elemento);
  return mapping?.sephirah ?? null;
}

/**
 * Get element by Sephirah name
 * @param sephirah - Sephirah name (e.g., 'Gevurah', 'Binah')
 * @returns Element name or null if not found
 */
export function getElementBySephirah(sephirah: string): string | null {
  const reverseMap = getSephirotElement();
  return reverseMap[sephirah] ?? null;
}

/**
 * Get the Chakra for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Chakra name or null if not found
 */
export function getChakraByElement(elemento: string): string | null {
  const mapping = getElementSephirot(elemento);
  return mapping?.chakra ?? null;
}

/**
 * Get the spiritual meaning for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Spiritual meaning object or null if not found
 */
export function getSignificadoByElement(elemento: string): ElementSephirot['significado_espiritual'] | null {
  const mapping = getElementSephirot(elemento);
  return mapping?.significado_espiritual ?? null;
}

/**
 * Get the qualities for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Qualities object or null if not found
 */
export function getQualidadesByElement(elemento: string): ElementSephirot['qualidades'] | null {
  const mapping = getElementSephirot(elemento);
  return mapping?.qualidades ?? null;
}

/**
 * Get the Orixá for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Orixá name or null if not found
 */
export function getOrixaByElement(elemento: string): string | null {
  const mapping = getElementSephirot(elemento);
  return mapping?.orixa ?? null;
}

/**
 * Get the color for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Color string or null if not found
 */
export function getColorByElement(elemento: string): string | null {
  const mapping = getElementSephirot(elemento);
  return mapping?.cor ?? null;
}

/**
 * Get the cardinal direction for a given element
 * @param elemento - Element type (fogo, água, terra, ar, éter)
 * @returns Direction string or null if not found
 */
export function getDirectionByElement(elemento: string): string | null {
  const mapping = getElementSephirot(elemento);
  return mapping?.direcao ?? null;
}

/**
 * Get all registered element types
 * @returns Array of element type keys
 */
export function getAllElementTypes(): ElementoTipo[] {
  return ['fogo', 'água', 'terra', 'ar', 'éter'];
}
