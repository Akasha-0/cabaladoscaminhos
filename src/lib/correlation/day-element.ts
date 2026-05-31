/**
 * Day-Element Correlation Module
 * Maps days of the week to elements and spiritual significance
 * Based on classical mystical traditions and elemental correspondences
 */

/** Supported elements */
export type Element = 'fogo' | 'água' | 'ar' | 'terra';

/** Day of the week in Portuguese */
export type DayOfWeek = string;

/** Elemental quality for each day */
export type ElementQuality = 'cardinal' | 'fixed' | 'mutable';

export interface DayElement {
  /** Day name in Portuguese */
  dia: DayOfWeek;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Associated element */
  elemento: Element;
  /** Elemental quality */
  qualidade: ElementQuality;
  /** Spiritual meaning of the day's element */
  significado_espiritual: string;
  /** Keywords for the day's element energy */
  palavras_chave: string[];
  /** Elemental associations */
  associacoes: {
    /** Symbolic color */
    cor: string;
    /** Primary direction */
    direcao: string;
    /** Associated planet */
    planeta: string;
    /** Associated Orixá */
    orixa: string;
    /** Time of day energy peak */
    momento: string;
  };
  /** Recommended elemental practices */
  praticas_elementais: string[];
}

/** Day-to-Element mapping based on classical mystical traditions */
export const DAY_ELEMENT_MAP: Record<DayOfWeek, DayElement> = {
  'Domingo': {
    dia: 'Domingo',
    indice: 0,
    elemento: 'fogo',
    qualidade: 'fixed',
    significado_espiritual: 'Domingo, ruled by the Sun, carries the pure transformative energy of Fire. This is the day of illumination, purpose, and creative expression. Fire energy brings clarity to one\'s spiritual path, ignites passion for life\'s purpose, and empowers the will to manifest intentions. It is ideal for solar meditations, fire rituals, and any work that requires radiant creative force.',
    palavras_chave: ['transformação', 'luz', 'propósito', 'clareza', 'vitalidade', 'criatividade', 'espírito'],
    associacoes: {
      cor: 'Dourado',
      direcao: 'Leste',
      planeta: 'Sol',
      orixa: 'Oxum',
      momento: 'Meio-dia',
    },
    praticas_elementais: [
      'Meditação solar com visualização de luz dourada',
      'Rituais de开机 de propósito e intenção',
      'Exposição consciente ao sol com gratidão',
      'Práticas de criatividade e autoexpressão',
      'Rituais de consagração de objetivos',
    ],
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    indice: 1,
    elemento: 'água',
    qualidade: 'cardinal',
    significado_espiritual: 'Segunda-feira, ruled by the Moon, carries the deep emotional and intuitive energy of Water. This is the day for emotional healing, purification, and connecting with the subconscious. Water energy flows through feelings, dreams, and inner wisdom. It is ideal for lunar meditations, water rituals, and emotional cleansing work.',
    palavras_chave: ['emoção', 'intuição', 'purificação', 'fluidez', 'receptividade', 'sabedoria interior', 'cura'],
    associacoes: {
      cor: 'Prata',
      direcao: 'Oeste',
      planeta: 'Lua',
      orixa: 'Iemanjá',
      momento: 'Noite',
    },
    praticas_elementais: [
      'Banhos de limpeza energética com ervas',
      'Meditação lunar de cura emocional',
      'Trabalho com água lunarizada',
      'Escrita terapêutica e auto-reflexão',
      'Práticas de perdão e soltura',
    ],
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    indice: 2,
    elemento: 'fogo',
    qualidade: 'cardinal',
    significado_espiritual: 'Terça-feira, ruled by Mars, carries the assertive and courageous energy of Fire. This is the day for action, determination, and overcoming obstacles. The aggressive aspect of fire brings strength to confront challenges and defend what matters. It is ideal for fire rituals of protection, courage practices, and martial energy work.',
    palavras_chave: ['ação', 'coragem', 'determinação', 'força', 'proteção', 'assertividade', 'conquista'],
    associacoes: {
      cor: 'Vermelho',
      direcao: 'Sul',
      planeta: 'Marte',
      orixa: 'Ogum',
      momento: 'Nascer do sol',
    },
    praticas_elementais: [
      'Rituais de proteção e defesa',
      'Práticas de coragem e força interior',
      'Meditação matinal de energia ativa',
      'Exercícios físicos com intenção espiritual',
      'Trabalho com ferramentas ritualísticas',
    ],
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    indice: 3,
    elemento: 'terra',
    qualidade: 'mutable',
    significado_espiritual: 'Quarta-feira, ruled by Mercury, carries the grounded and communicative energy of Earth through Air. This is the day for learning, communication, and mental clarity. Earth element grounds Mercury\'s swift mental energy, providing stability to thoughts and words. It is ideal for study, writing, teaching, and any intellectual work with practical application.',
    palavras_chave: ['comunicação', 'aprendizado', 'inteligência', 'versatilidade', 'curiosidade', 'sabedoria prática', 'adaptabilidade'],
    associacoes: {
      cor: 'Amarelo',
      direcao: 'Norte',
      planeta: 'Mercúrio',
      orixa: 'Oxalá',
      momento: 'Manhã',
    },
    praticas_elementais: [
      'Estudos e práticas de aprendizado',
      'Escrita criativa e comunicação',
      'Meditação de clareza mental',
      'Trabalho com palavras e símbolos',
      'Rituais de sabedoria e renovação mental',
    ],
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    indice: 4,
    elemento: 'fogo',
    qualidade: 'mutable',
    significado_espiritual: 'Quinta-feira, ruled by Jupiter, carries the expansive and wise energy of Fire. This is the day for growth, abundance, and spiritual expansion. Jupiter\'s fire is philosophical rather than aggressive — it illuminates the path to wisdom and abundance. It is ideal for rituals of prosperity, meditation on purpose, and work that expands consciousness.',
    palavras_chave: ['expansão', 'abundância', 'sabedoria', 'otimismo', 'generosidade', ' propósito elevado', 'crescimento'],
    associacoes: {
      cor: 'Azul',
      direcao: 'Leste',
      planeta: 'Júpiter',
      orixa: 'Oxumaré',
      momento: 'Entardecer',
    },
    praticas_elementais: [
      'Rituais de prosperidade e abundância',
      'Meditação de expansão da consciência',
      'Práticas de gratidão e generosidade',
      'Estudos filosóficos e espirituais',
      'Trabalho com intención de crescimento',
    ],
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    indice: 5,
    elemento: 'água',
    qualidade: 'cardinal',
    significado_espiritual: 'Sexta-feira, ruled by Venus, carries the loving and harmonious energy of Water. This is the day for love, beauty, relationships, and emotional balance. Venusian water nurtures connections and aesthetic appreciation. It is ideal for love rituals, partnership work, beauty practices, and anything that enhances harmony in relationships.',
    palavras_chave: ['amor', 'harmonia', 'beleza', 'conexão', 'prazer', 'arte', 'relacionamento'],
    associacoes: {
      cor: 'Verde',
      direcao: 'Oeste',
      planeta: 'Vênus',
      orixa: 'Oxum',
      momento: 'Tarde',
    },
    praticas_elementais: [
      'Rituais de amor e harmonia em relacionamentos',
      'Práticas de autoamor e aceitação',
      'Trabalho com água perfumada para amor',
      'Arte e expressões estéticas sagradas',
      'Meditações de conexão e unidade',
    ],
  },
  'Sábado': {
    dia: 'Sábado',
    indice: 6,
    elemento: 'terra',
    qualidade: 'cardinal',
    significado_espiritual: 'Sábado, ruled by Saturn, carries the grounded and disciplined energy of Earth. This is the day for structure, boundaries, karmic work, and practical manifestations. Earth energy under Saturn provides the foundation for long-term goals and spiritual discipline. It is ideal for banishment rituals, boundary work, materialization practices, and any work requiring patience and endurance.',
    palavras_chave: ['estrutura', 'disciplina', 'limites', 'karma', 'paciência', 'manifestação', 'ancoragem'],
    associacoes: {
      cor: 'Preto',
      direcao: 'Norte',
      planeta: 'Saturno',
      orixa: 'Nanã',
      momento: 'Meia-noite',
    },
    praticas_elementais: [
      'Rituais de proteção e banimento',
      'Práticas de definição de limites',
      'Trabalho com terra e ancestrais',
      'Meditações de disciplina e paciência',
      'Rituais de materialização e concretização',
    ],
  },
};

/**
 * Get element correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Domingo', 'Segunda-feira')
 * @returns DayElement mapping or undefined if day not found
 */
export function getDayElement(dia: DayOfWeek): DayElement | undefined {
  return DAY_ELEMENT_MAP[dia];
}

/**
 * Get element for a specific day
 * @param dia - Day name in Portuguese
 * @returns Element or undefined if day not found
 */
export function getElementDay(dia: DayOfWeek): Element | undefined {
  return DAY_ELEMENT_MAP[dia]?.elemento;
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_ELEMENT_MAP);
}

/**
 * Get days associated with a specific element
 * @param elemento - Element name ('fogo' | 'água' | 'ar' | 'terra')
 * @returns Array of day names
 */
export function getDaysByElement(elemento: Element): string[] {
  return Object.entries(DAY_ELEMENT_MAP)
    .filter(([, dayElement]) => dayElement.elemento === elemento)
    .map(([dia]) => dia);
}

/**
 * Get all day-element correlations
 * @returns Array of all DayElement mappings
 */
export function getAllDayElements(): DayElement[] {
  return Object.values(DAY_ELEMENT_MAP);
}

/**
 * Get spiritual meaning for a specific day
 * @param dia - Day name in Portuguese
 * @returns Spiritual meaning or undefined if day not found
 */
export function getDaySpiritualMeaning(dia: DayOfWeek): string | undefined {
  return DAY_ELEMENT_MAP[dia]?.significado_espiritual;
}

/**
 * Get keywords for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of keywords or undefined if day not found
 */
export function getDayKeywords(dia: DayOfWeek): string[] | undefined {
  return DAY_ELEMENT_MAP[dia]?.palavras_chave;
}

/**
 * Get elemental associations for a specific day
 * @param dia - Day name in Portuguese
 * @returns Elemental associations or undefined if day not found
 */
export function getDayAssociations(dia: DayOfWeek): DayElement['associacoes'] | undefined {
  return DAY_ELEMENT_MAP[dia]?.associacoes;
}

/**
 * Get elemental practices for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of practices or undefined if day not found
 */
export function getDayPractices(dia: DayOfWeek): string[] | undefined {
  return DAY_ELEMENT_MAP[dia]?.praticas_elementais;
}

/**
 * Get all unique elements
 * @returns Array of unique elements
 */
export function getAllElements(): Element[] {
  return ['fogo', 'água', 'ar', 'terra'];
}

/**
 * Get day by element
 * @param elemento - Element name
 * @returns First day with matching element or undefined
 */
export function getDayByElement(elemento: Element): string | undefined {
  const days = getDaysByElement(elemento);
  return days[0];
}

/**
 * Get day index
 * @param dia - Day name in Portuguese
 * @returns Day index (0-6) or undefined if day not found
 */
export function getDayIndex(dia: DayOfWeek): number | undefined {
  return DAY_ELEMENT_MAP[dia]?.indice;
}

export default {
  getDayElement,
  getElementDay,
  getAllDayElements,
  getAllDays,
  getDaysByElement,
  getDaySpiritualMeaning,
  getDayKeywords,
  getDayAssociations,
  getDayPractices,
  getAllElements,
  getDayByElement,
  getDayIndex,
  DAY_ELEMENT_MAP,
};