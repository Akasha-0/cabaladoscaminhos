/**
 * Element-Day Correlation Module
 * Maps spiritual elements to days of the week with their spiritual meanings and practices
 * Complement to day-element.ts - reverse mapping focusing on elemental day energies
 */

export type Elemento = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface ElementDayMapping {
  /** Element name */
  elemento: Elemento;
  /** Element name in Portuguese */
  elemento_nome: string;
  /** Associated day of the week */
  dia: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Chakra connection for this element-day */
  chakra: string;
  /** Chakra description */
  chakra_descricao: string;
  /** Spiritual meaning and focus */
  significado_espiritual: string;
  /** Primary quality of the element on this day */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Elemental properties */
  propriedades: {
    /** Core spiritual force */
    forca: string;
    /** Keywords for meditation */
    palavras_chave: string[];
    /** Challenges to transcend */
    desafios: string[];
    /** Affirmation for the day */
    afirmacao: string;
  };
  /** Spiritual practices recommended */
  praticas: string[];
  /** Sacred color */
  cor: string;
  /** Associated planet */
  planeta: string;
  /** Associated Orixá */
  orixa: string;
  /** Time of day with most energy */
  momento_dia: string;
}

// Element to Day mapping - each element resonates with specific days
const ELEMENT_DAY_MAP: Record<Elemento, ElementDayMapping> = {
  fogo: {
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    dia: 'Domingo',
    indice: 0,
    chakra: '3º - Plexo Solar',
    chakra_descricao: 'Manipura - Centro de poder pessoal, vontade e transformação',
    significado_espiritual: 'Dia de recarregar a energia vital, brilho próprio e propósito de vida. O fogo conecta-se à liderança iluminada e à capacidade de irradiar luz interior.',
    qualidade: 'fixed',
    propriedades: {
      forca: 'Vitalidade, brilho pessoal, propósito de vida, energia radiante, liderança iluminada',
      palavras_chave: ['recarregar', 'brilho', 'propósito', 'irradiar', 'liderança', 'alegria', 'transformar'],
      desafios: ['egocentrismo', 'sobredose de ego', 'impaciência', 'exaustão'],
      afirmacao: 'Eu irradio minha luz interior e lidero com o coração generoso.',
    },
    praticas: [
      'Exposição solar consciente (tomar sol com intenção sagrada)',
      'Meditação com visualização dourada no plexo solar',
      'Rituais de consagração de amuletos e talismãs',
      'Práticas de liderança e comando sagrado',
      'Gratidão pelo propósito de vida',
      'Yoga fire para ativar manipura',
    ],
    cor: 'Dourado / Amarelo / Laranja',
    planeta: 'Sol',
    orixa: 'Xangô',
    momento_dia: 'Meio-dia',
  },
  água: {
    elemento: 'água',
    elemento_nome: 'Água',
    dia: 'Segunda-feira',
    indice: 1,
    chakra: '6º - Terceiro Olho / 4º - Cardíaco',
    chakra_descricao: 'Ajna e Anahata - Intuição profunda e amor incondicional',
    significado_espiritual: 'Dia de introspecção, sensibilidade emocional e conexão com o inconsciente. A água ensina a fluir sem resistência e a nutrir-se com compaixão.',
    qualidade: 'cardinal',
    propriedades: {
      forca: 'Intuição profunda, sensibilidade emocional, acolhimento, conexão com o inconsciente, nutricalidade',
      palavras_chave: ['acolher', 'intuir', 'fluir', 'nutrir', 'sentir', 'receber', 'purificar'],
      desafios: ['vulnerabilidade excessiva', 'melancolia', 'dificuldade de limites', 'supersensibilidade'],
      afirmacao: 'Eu fluo como a água e acolhho minhas emoções com compaixão.',
    },
    praticas: [
      'Banhos de limpeza energética com ervas receptivas',
      'Meditação lunar (especialmente no luar)',
      'Diário de emoções e sonhos',
      'Práticas de autoacolhimento e autocuidado',
      'Conexão com ancestrais e memórias do sangue',
      'Caminhada à beira d\'água',
    ],
    cor: 'Prata / Branco / Azul claro',
    planeta: 'Lua',
    orixa: 'Iemanjá',
    momento_dia: 'Noite',
  },
  ar: {
    elemento: 'ar',
    elemento_nome: 'Ar',
    dia: 'Quarta-feira',
    indice: 3,
    chakra: '5º - Laríngeo',
    chakra_descricao: 'Vishuddha - Centro de comunicação, expressão e verdade',
    significado_espiritual: 'Dia da mente ágil, comunicação clara e versatilidade intelectual. O ar traz clareza mental, adaptabilidade e a capacidade de ver múltiplas perspectivas.',
    qualidade: 'mutable',
    propriedades: {
      forca: 'Versatilidade mental, comunicação clara, agilidade intelectual, adaptabilidade, múltiplas perspectivas',
      palavras_chave: ['comunicar', 'adaptar', 'estudar', 'negociar', 'analisar', 'trocar', 'expressar'],
      desafios: ['superficialidade', 'ansiedade mental', 'inconstância', 'excesso de informação'],
      afirmacao: 'Eu comunico com clareza e meu pensamento flui como o vento.',
    },
    praticas: [
      'Defumações com alecrim e estoraque para clareza mental',
      'Práticas de comunicação assertiva',
      'Estudos e meditações sobre a verdade',
      'Rituais de agilidade nos negócios',
      'Exercícios de respiração pranayama',
      'Leitura e escrita sagrada',
    ],
    cor: 'Amarelo / Cinzento / Branco',
    planeta: 'Mercúrio',
    orixa: 'Iansã',
    momento_dia: 'Manhã',
  },
  terra: {
    elemento: 'terra',
    elemento_nome: 'Terra',
    dia: 'Sexta-feira',
    indice: 5,
    chakra: '1º - Raiz / 2º - Sacral',
    chakra_descricao: 'Muladhara e Svadhisthana - Ancoramento e criatividade',
    significado_espiritual: 'Dia de ancoramento, prosperidade e conexão com a natureza. A terra traz estabilidade, abundância material e espiritual, e conexão com os ciclos da vida.',
    qualidade: 'fixed',
    propriedades: {
      forca: 'Ancoramento, prosperidade, estabilidade, conexão com a natureza, força física, gratidão',
      palavras_chave: ['ancorar', 'abundar', 'gratidão', 'cultivar', 'estabilizar', 'criar', 'manifestar'],
      desafios: ['materialismo excessivo', 'rigidez', 'teimosia', 'dificuldade de adaptação'],
      afirmacao: 'Eu sou ancorado na terra e minha vida floresce com abundância.',
    },
    praticas: [
      'Caminhadas na natureza e contato com a terra',
      'Rituais de prosperidade e fartura',
      'Plantio de mudas e cuidado com plantas',
      'Gratidão pela abundância recebida',
      'Meditação de ancoramento com visualização de raízes',
      'Trabalho manual creativo',
    ],
    cor: 'Verde / Marrom / Terra',
    planeta: 'Vênus',
    orixa: 'Oxum',
    momento_dia: 'Entardecer',
  },
  éter: {
    elemento: 'éter',
    elemento_nome: 'Éter',
    dia: 'Sexta-feira',
    indice: 5,
    chakra: '7º - Coronário',
    chakra_descricao: 'Sahasrara - Conexão divina e transcendência',
    significado_espiritual: 'Dia de transcendência espiritual, paz interior e conexão com o divino. O éter representa a expansão da consciência além dos limites materiais.',
    qualidade: 'cardinal',
    propriedades: {
      forca: 'Transcendência espiritual, paz interior, sabedoria divina, criação, pureza de intenção',
      palavras_chave: ['transcender', 'expandir', 'iluminar', 'inspirar', 'sagrar', 'purificar', 'conectar'],
      desafios: ['escapismo', 'desconexão do mundo material', 'idealismo excessivo'],
      afirmacao: 'Eu abro meu coronário à luz divina e permito que a sabedoria me guie.',
    },
    praticas: [
      'Meditação profunda de expansão da consciência',
      'Rezas e orações de consagração',
      'Uso do tapete sagrado em reflexões',
      'Cerimônias de purificação e consagração',
      'Práticas de oração e devoção',
      'Leitura de textos sagrados',
    ],
    cor: 'Branco / Roxo / Dourado',
    planeta: 'Sol',
    orixa: 'Oxalá',
    momento_dia: 'Aurora e anoitecer',
  },
};

/**
 * Get element-day correlation mapping
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns ElementDayMapping or undefined if not found
 */
export function getElementDay(elemento: string): ElementDayMapping | undefined {
  const normalized = elemento.toLowerCase() as Elemento;
  return ELEMENT_DAY_MAP[normalized];
}

/**
 * Get reverse mapping: day to element
 * @returns Record mapping each day to its element
 */
export function getDayElement(): Record<string, Elemento> {
  const result: Record<string, Elemento> = {};
  for (const mapping of Object.values(ELEMENT_DAY_MAP)) {
    if (!(mapping.dia in result)) {
      result[mapping.dia] = mapping.elemento;
    }
  }
  return result;
}

/**
 * Get all element-day mappings
 * @returns Array of all ElementDayMapping objects
 */
export function getAllElementDays(): ElementDayMapping[] {
  return Object.values(ELEMENT_DAY_MAP);
}

/**
 * Get chakra connection for an element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Chakra information or undefined
 */
export function getElementChakra(elemento: string): { chakra: string; descricao: string } | undefined {
  const mapping = getElementDay(elemento);
  if (!mapping) return undefined;
  return {
    chakra: mapping.chakra,
    descricao: mapping.chakra_descricao,
  };
}

/**
 * Get spiritual practices for an element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Array of practices or undefined
 */
export function getElementPractices(elemento: string): string[] | undefined {
  return getElementDay(elemento)?.praticas;
}

/**
 * Get spiritual affirmation for an element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Affirmation or undefined
 */
export function getElementAffirmation(elemento: string): string | undefined {
  return getElementDay(elemento)?.propriedades.afirmacao;
}

export default {
  getElementDay,
  getDayElement,
  getAllElementDays,
  getElementChakra,
  getElementPractices,
  getElementAffirmation,
};