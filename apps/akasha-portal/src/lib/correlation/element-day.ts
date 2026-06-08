/**
 * Element-Day Spiritual Correlation
 * Maps the five classical elements to days of week
 * with chakra connections and spiritual meanings
 */

export type Elemento = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface ElementDayMapping {
  /** Element name (lowercase) */
  elemento: Elemento;
  /** Element name (Portuguese with proper capitals) */
  elemento_nome: string;
  /** Associated day */
  dia: string;
  /** Day index (0-6, Sunday = 0) */
  indice: number;
  /** Chakra connection */
  chakra: string;
  /** Chakra description */
  chakra_descricao: string;
  /** Spiritual meaning */
  significado_espiritual: string;
  /** Planet correspondence */
  planeta: string;
  /** Orixá correspondence */
  orixa: string;
  /** Elemental quality */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Properties object */
  propriedades: {
    afirmacao: string;
    palavras_chave: string[];
    desafios: string[];
  };
  /** Spiritual practices */
  praticas: string[];
  /** Ritual offerings */
  oferendas: string[];
  /** Colors */
  cores: string[];
}

// ─── Element-to-Day Mapping ──────────────────────────────────────────────────

const ELEMENT_DAY_MAPPINGS: Record<Elemento, ElementDayMapping> = {
  fogo: {
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    dia: 'Domingo',
    indice: 0,
    chakra: '3º - Plexo Solar',
    chakra_descricao: 'Manipura - Centro do poder pessoal e vontade',
    significado_espiritual: 'O Fogo representa a transformação, a purificação e a energia vital. É o princípio ativo yang, associated with volunt, determinação e o brilho interior. O Domingo potencializa sua energia de ação e criação, sendo dia do Sol, источник силы и света.',
    planeta: 'Sol',
    orixa: 'Xangô',
    qualidade: 'cardinal',
    propriedades: {
      afirmacao: 'Eu irradio confiança e transformo minha realidade com purpose',
      palavras_chave: ['transformação', 'energia', 'vontade', 'ação', 'coragem'],
      desafios: ['impaciência', 'agressividade', 'orgulho excessivo'],
    },
    praticas: [
      'Exposição solar consciente (tomar sol com intenção sagrada)',
      'Meditação com vela vermelha acesa',
      'Queima de incenso de sândalo ou cravo',
      'Movimentos físicos energizantes',
      'Afirmações diante do espelho',
    ],
    oferendas: [
      'Amalá para Xangô',
      'Pimenta vermelha',
      'Velas vermelhas e amarelas',
      'Fumo de charuto',
    ],
    cores: ['Vermelho', 'Amarelo', 'Laranja', 'Dourado'],
  },
  água: {
    elemento: 'água',
    elemento_nome: 'Água',
    dia: 'Segunda-feira',
    indice: 1,
    chakra: '6º - Frontal',
    chakra_descricao: 'Ajna - Centro da intuição e sabedoria interior',
    significado_espiritual: 'A Água é o princípio yin da emoção, sensibilidade e intuição. Representa o fluxo da vida, a adaptação e as águas profundas do inconsciente. A Segunda-feira édia da Lua, quando as práticas de purificação e conexão com o sagrado são mais poderosas.',
    planeta: 'Lua',
    orixa: 'Iemanjá',
    qualidade: 'fixed',
    propriedades: {
      afirmacao: 'Eu fluo com a vida e permito que minha intuição me guie',
      palavras_chave: ['emoção', 'intuição', 'fluidez', 'sensibilidade', 'nutrição'],
      desafios: ['excesso de sensibilidade', 'dependência emocional', 'estagnação'],
    },
    praticas: [
      'Rituais de água na beira do mar',
      'Meditação próxima a fontes ou ríos',
      'Banhos de purificação com ervas',
      'Contemplação lunar',
      'Escrita artística e poesia',
    ],
    oferendas: [
      'Canjica para Iemanjá',
      'Flores brancas',
      'Colônia y/alcáçuz',
      'Água de coco',
      'Perfumes feminine',
    ],
    cores: ['Azul', 'Branco', 'Prata', 'Transparente'],
  },
  ar: {
    elemento: 'ar',
    elemento_nome: 'Ar',
    dia: 'Quarta-feira',
    indice: 3,
    chakra: '4º - Cardíaco',
    chakra_descricao: 'Anahara - Centro do amor incondicional e comunicação',
    significado_espiritual: 'O Ar é o princípio da mente, comunicação e flexibilidade. Representa o pensamento, a transformação das ideias em realidade e a respiração sagrada. A Quarta-feira édia de Mercúrio, ideal para práticas mentais, estudos e comunicações espirituais.',
    planeta: 'Mercúrio',
    orixa: 'Iansã',
    qualidade: 'mutable',
    propriedades: {
      afirmacao: 'Eu respiro a verdade e comunico minha essência com clareza',
      palavras_chave: ['comunicação', 'mente', 'flexibilidade', 'adaptação', 'ligação'],
      desafios: ['dispersão mental', 'superficialidade', 'inconsistência'],
    },
    praticas: [
      'Exercícios de respiração sagrada (pranayama)',
      'Meditação de开门 respiração',
      'Leitura sagrada e contemplação',
      'Escrita meditativa e journaling',
      'Práticas de fala consciente',
    ],
    oferendas: [
      'Arroz doce para Oxumaré',
      'Liga de arame de cobre',
      'Folhas verdes',
      'Mel',
    ],
    cores: ['Amarelo', 'Verde', 'Azul claro', 'Arco-íris'],
  },
  terra: {
    elemento: 'terra',
    elemento_nome: 'Terra',
    dia: 'Sexta-feira',
    indice: 5,
    chakra: '1º - Básitário',
    chakra_descricao: 'Muladhara - Centro da fundamentação e conexão com a Terra',
    significado_espiritual: 'A Terra é o princípio da estruturação, fundamentação e transformação. Representa a ancestors, tradição e saúde física. A Sexta-feira édia de Vênus, ketika energi bumi bertemu cinta dan keindahan, ideal para rituals de conexão com a natureza e práticas de gratefulness.',
    planeta: 'Vênus',
    orixa: 'Oxum',
    qualidade: 'fixed',
    propriedades: {
      afirmacao: 'Eu me fundamento na terra sagrada e prospero em abundância',
      palavras_chave: ['estabilidade', 'prosperidade', 'ancestralidade', 'saúde', 'segurança'],
      desafios: ['rigidez', 'materialismo excessivo', 'resistência a mudanças'],
    },
    praticas: [
      'Rituais de terra na beira do mar',
      'Contato nu com a terra',
      'Plantio e jardinagem sagrada',
      'Trabalho ancestral e oferendas',
      'Gratidão pela abundancia',
    ],
    oferendas: [
      'Mel para Oxum',
      'Ouro',
      'Água doce e mel',
      'Flores douratas',
      'Alimentos amarelo-dourados',
    ],
    cores: ['Marrom', 'Verde escuro', 'Dourado', 'Laranja terra'],
  },
  éter: {
    elemento: 'éter',
    elemento_nome: 'Éter',
    dia: 'Sexta-feira',
    indice: 5,
    chakra: '7º - Coronário',
    chakra_descricao: 'Sahasrara - Centro da consciência cósmica e transcendência',
    significado_espiritual: 'O Éter é o princípio da transcendência espiritual, o quinto elemento que representa o divino, a paz e a consciência cósmica. É o elemento mais sutil, que conecta todos os outros. A Sexta-feira também édia sagrado para práticas de elevação espiritual e paz interior, potenciando a conexão com Oxalá e o divino.',
    planeta: 'Sol',
    orixa: 'Oxalá',
    qualidade: 'cardinal',
    propriedades: {
      afirmacao: 'Eu me abro para a sabedoria divina e descanso na paz do éter',
      palavras_chave: ['transcendência', 'paz', 'sabedoria', 'divino', 'pureza'],
      desafios: ['dissociação', 'excesso de idealismo', 'dificuldade de ação'],
    },
    praticas: [
      'Meditação transcendental profunda',
      'Orações para Oxalá',
      'Queima de incenso puro (benjoim, sálvia)',
      'Silêncio sagrado e retreating',
      'Conexão com a luz branca divine',
    ],
    oferendas: [
      'Leite para Oxalá',
      'Alimentos brancos',
      'Fumo de cachimbo',
      'Flores brancas',
      'Paz e silêncio',
    ],
    cores: ['Branco', 'Dourado', 'Violeta', 'Transparente'],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ELEMENT_DAY_MAPPINGS);
Object.values(ELEMENT_DAY_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Normalizes element name to lowercase
 * Handles case insensitivity and accents
 */
function normalizeElemento(elemento: string): Elemento | null {
  if (!elemento) return null;
  
  const normalized = elemento
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  const validElements: Elemento[] = ['fogo', 'água', 'ar', 'terra', 'éter'];
  
  for (const el of validElements) {
    const elNormalized = el.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (elNormalized === normalized) {
      return el;
    }
  }
  return null;
}

/**
 * Returns the element-day mapping for a given element name.
 * @param elemento - Element name (e.g., 'fogo', 'água', 'ar', 'terra', 'eter')
 * @returns The correlation mapping or undefined if not found
 */
export function getElementDay(elemento: string): ElementDayMapping | undefined {
  const normalized = normalizeElemento(elemento);
  if (!normalized) return undefined;
  return ELEMENT_DAY_MAPPINGS[normalized];
}

/**
 * Returns a mapping of days to elements.
 * @returns Record mapping day names to element names
 */
export function getDayElement(): Record<string, Elemento> {
  const result: Record<string, Elemento> = {};
  
  for (const [elemento, mapping] of Object.entries(ELEMENT_DAY_MAPPINGS)) {
    if (!result[mapping.dia]) {
      result[mapping.dia] = elemento as Elemento;
    }
  }
  
  return result;
}

/**
 * Returns all element-day mappings.
 * @returns Array of all correlation mappings
 */
export function getAllElementDays(): ElementDayMapping[] {
  return Object.values(ELEMENT_DAY_MAPPINGS);
}

/**
 * Returns chakra information for a given element.
 * @param elemento - Element name
 * @returns Chakra info or undefined if element not found
 */
export function getElementChakra(elemento: string): { chakra: string; chakra_descricao: string } | undefined {
  const mapping = getElementDay(elemento);
  if (!mapping) return undefined;
  
  return {
    chakra: mapping.chakra,
    chakra_descricao: mapping.chakra_descricao,
  };
}

/**
 * Returns spiritual practices for a given element.
 * @param elemento - Element name
 * @returns Array of practices or undefined if element not found
 */
export function getElementPractices(elemento: string): string[] | undefined {
  const mapping = getElementDay(elemento);
  if (!mapping) return undefined;
  
  return mapping.praticas;
}

/**
 * Returns the affirmation for a given element.
 * @param elemento - Element name
 * @returns Affirmation string or undefined if element not found
 */
export function getElementAffirmation(elemento: string): string | undefined {
  const mapping = getElementDay(elemento);
  if (!mapping) return undefined;
  
  return mapping.propriedades.afirmacao;
}
