/**
 * Orixá-Numerology Correlation Module
 * Maps Orixás to sacred numbers and their numerological meanings
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

export interface OrixaNumerology {
  /** Name of the Orixá */
  orixa: string;
  /** Sacred number of the Orixá (1-13) */
  numero_sagrado: number;
  /** Numerological meaning of the number */
  significado_numerologico: string;
  /** Elemental connection */
  elemento: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  /** Associated Odú */
  odu_associado: string;
  /** Associated Sephirah (Kabbalah) */
  sephirah: string;
  /** Planetary ruler */
  planeta_regente: string;
  /** Core numerological energy */
  energia_numerica: string;
}

/**
 * Oxalá - Sacred Number 8 (EjiOníle)
 * The Creator - Purity, peace, spiritual alignment
 */
const OXALA: OrixaNumerology = {
  orixa: 'Oxalá',
  numero_sagrado: 8,
  significado_numerologico: 'O Criador, O Paz - A cabeça (Ori) no topo do mundo, a liderança espiritual e a paz absoluta',
  elemento: 'éter',
  odu_associado: 'EjiOníle / Ofun',
  sephirah: 'Hod / Malkuth',
  planeta_regente: 'Sol',
  energia_numerica: 'Autoridade interior, silêncio sagrado, criação da realidade, equilíbrio entre céu e terra',
};

/**
 * Iemanjá - Sacred Number 4
 * The Mother - Stability, generation, emotional depth
 */
const IEMANJA: OrixaNumerology = {
  orixa: 'Iemanjá',
  numero_sagrado: 4,
  significado_numerologico: 'A Mãe, A Estrutura - A estabilidade emocional, a geração e a proteção das raízes',
  elemento: 'água',
  odu_associado: 'Irosun',
  sephirah: 'Chesed',
  planeta_regente: 'Lua',
  energia_numerica: 'Nutrição emocional, proteção maternal, equilíbrio das águas interiores, fertilidade',
};

/**
 * Oxum - Sacred Number 5
 * The Beloved - Attraction, gold, sensuality
 */
const OXUM: OrixaNumerology = {
  orixa: 'Oxum',
  numero_sagrado: 5,
  significado_numerologico: 'A Amada, O Ouro - A doçura, a feitiçaria natural e o magnetismo pessoal',
  elemento: 'água',
  odu_associado: 'Oxé',
  sephirah: 'Geburah',
  planeta_regente: 'Vênus',
  energia_numerica: 'Charme, diplomacia, autoconfiança, atratividade, riqueza emocional e material',
};

/**
 * Ogum - Sacred Number 3
 * The Warrior - Courage, law, creation
 */
const OGUM: OrixaNumerology = {
  orixa: 'Ogum',
  numero_sagrado: 3,
  significado_numerologico: 'O Guerreiro, O Criador de Ferramentas - A força física, a criação e a lei',
  elemento: 'terra',
  odu_associado: 'Etaogundá',
  sephirah: 'Binah',
  planeta_regente: 'Marte',
  energia_numerica: 'Coragem, determinação, abertura de caminhos, execução de propósitos, força de vontade',
};

/**
 * Oxóssi - Sacred Number 4
 * The Hunter - Abundance, knowledge, direction
 */
const OXOSSI: OrixaNumerology = {
  orixa: 'Oxóssi',
  numero_sagrado: 4,
  significado_numerologico: 'O Caçador, O Abundante - A fartura, o conhecimento profundo e o direcionamento da mente',
  elemento: 'terra',
  odu_associado: 'Irosun / Obará',
  sephirah: 'Chesed',
  planeta_regente: 'Júpiter',
  energia_numerica: 'Expansão, sabedoria natural, busca do conhecimento, cura pelas matas, prosperidade',
};

/**
 * Xangô - Sacred Number 6
 * The King - Justice, power, authority
 */
const XANGO: OrixaNumerology = {
  orixa: 'Xangô',
  numero_sagrado: 6,
  significado_numerologico: 'O Rei, O Justo - A riqueza, a sabedoria, a surpresa e o equilíbrio entre ação e justiça',
  elemento: 'fogo',
  odu_associado: 'Obará / Ejilsebora',
  sephirah: 'Tiphereth / Geburah',
  planeta_regente: 'Sol',
  energia_numerica: 'Justiça divina, realeza interior, poder pessoal, equilíbrio entre razão e emoção',
};

/**
 * Iansã - Sacred Number 7
 * The Tempest - Transformation, movement, hidden wisdom
 */
const IANSA: OrixaNumerology = {
  orixa: 'Iansã',
  numero_sagrado: 7,
  significado_numerologico: 'A Tempestade, A Transmutadora - Os ventos, as transformações rápidas e a sabedoria oculta',
  elemento: 'fogo',
  odu_associado: 'Odi / Ossá',
  sephirah: 'Netzach',
  planeta_regente: 'Urano',
  energia_numerica: 'Movimento rápido, renovação, coragem de atravessar tempestades, comando dos ventos',
};

/**
 * Omolu - Sacred Number 1
 * The Healer - Beginning, transformation, crossroads
 */
const OMOLU: OrixaNumerology = {
  orixa: 'Omolu',
  numero_sagrado: 1,
  significado_numerologico: 'O Curador, O Transmutador - O caminho difícil de grande aprendizado, o recomeço',
  elemento: 'terra',
  odu_associado: 'Okaran / Odi',
  sephirah: 'Kether / Malkuth',
  planeta_regente: 'Saturno',
  energia_numerica: 'Abertura de caminhos, destino, ancestralidade, transmutação do poder da matéria',
};

/**
 * Nanã - Sacred Number 13
 * The Elder - Wisdom, patience, primordial essence
 */
const NANA: OrixaNumerology = {
  orixa: 'Nanã',
  numero_sagrado: 13,
  significado_numerologico: 'A Anciã, A Decantadora - O lodo primitivo, a sabedoria dos mais velhos e a paciência',
  elemento: 'água',
  odu_associado: 'Olobón',
  sephirah: 'Malkuth',
  planeta_regente: 'Saturno',
  energia_numerica: 'Sabedoria ancestral, decantação espiritual, respeito ao tempo, paciência sagrada',
};

/**
 * Exu - Sacred Number 1
 * The Messenger - Communication, dynamism, initiation
 */
const EXU: OrixaNumerology = {
export function getOrixaNumerology(orixa: string): OrixaNumerology | undefined {
  if (!orixa) return undefined;
  const normalized = orixa
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  // Direct match first
  const direct = ORIXA_NUMEROLOGIA_MAP[orixa];
  if (direct) return direct;
  // Case-insensitive search with accent normalization
  const entry = Object.entries(ORIXA_NUMEROLOGIA_MAP).find(
    ([key]) => {
      const keyNormalized = key
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return keyNormalized === normalized;
    }
  );
  return entry ? entry[1] : undefined;
}
  odu_associado: 'Iká',
  sephirah: 'Chokmah',
  planeta_regente: 'Mercúrio',
  energia_numerica: 'Renovação constante, flexibilidade, adaptação aos ciclos, transcendência da monotonia',
};

/**
 * Obá - Sacred Number 15
 * The Defender - Strategy, protection, cunning
 */
const OBA: OrixaNumerology = {
  orixa: 'Obá',
  numero_sagrado: 15,
  significado_numerologico: 'A Defensora, A Estratégica - A feitiçaria pesada, as disputas por espaço e a proteção do lar',
  elemento: 'fogo',
  odu_associado: 'Ogbogbé',
  sephirah: 'Geburah',
  planeta_regente: 'Marte',
  energia_numerica: 'Estratégia de defesa, proteção contra feitiçarias, poder de proteger o espaço sagrado',
};

/**
 * Orunmilá - Sacred Number 11
 * The Oracle - Divine alignment, total peace
 */
const ORUNMILA: OrixaNumerology = {
  orixa: 'Orunmilá',
  numero_sagrado: 11,
  significado_numerologico: 'O Oráculo, O Alinhado - A paz absoluta, a luz total e a confirmação dos Deuses',
  elemento: 'éter',
  odu_associado: 'Alafia',
  sephirah: 'Kether / Tiphereth',
  planeta_regente: 'Netuno',
  energia_numerica: 'Intuição espiritual elevada, channeling, inspiração divina, alinhamento completo',
};

/**
 * Ibeji - Sacred Number 2
 * The Twins - Duality, partnership, balance
 */
const IBEJI: OrixaNumerology = {
  orixa: 'Ibeji',
  numero_sagrado: 2,
  significado_numerologico: 'Os Gêmeos, O Par - A dualidade, os caminhos duplos, a união após grandes lutas',
  elemento: 'água',
  odu_associado: 'Ejiokô',
  sephirah: 'Chokmah',
  planeta_regente: 'Lua',
  energia_numerica: 'Equilíbrio de opostos, parceria sagrada, alegria interior, cuidado da criança interior',
};

/**
 * Complete lookup table for Orixá numerologies
 */
const ORIXA_NUMEROLOGIA_MAP: Record<string, OrixaNumerology> = {
  'Oxalá': OXALA,
  'Iemanjá': IEMANJA,
  'Oxum': OXUM,
  'Ogum': OGUM,
  'Oxóssi': OXOSSI,
  'Xangô': XANGO,
  'Iansã': IANSA,
  'Omolu': OMOLU,
  'Nanã': NANA,
  'Exu': EXU,
  'Oxumaré': OXUMARE,
  'Obá': OBA,
  'Orunmilá': ORUNMILA,
  'Ibeji': IBEJI,
};

/**
 * Get Orixá numerology mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaNumerology mapping or undefined if not found
 */
export function getOrixaNumerology(orixa: string): OrixaNumerology | undefined {
  const normalized = orixa
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Direct match first
  const direct = ORIXA_NUMEROLOGIA_MAP[orixa];
  if (direct) return direct;
  
  // Case-insensitive search
  const entry = Object.entries(ORIXA_NUMEROLOGIA_MAP).find(
    ([key]) => key.toLowerCase() === normalized
  );
  
  return entry ? entry[1] : undefined;
}

/**
 * Get all numerology mappings keyed by number
 * @returns Record mapping numbers to their associated Orixás
 */
export function getNumerologyOrixa(): Record<number, OrixaNumerology[]> {
  const result: Record<number, OrixaNumerology[]> = {};
  
  for (const orixa of Object.values(ORIXA_NUMEROLOGIA_MAP)) {
    const num = orixa.numero_sagrado;
    if (!result[num]) result[num] = [];
    result[num].push(orixa);
  }
  
  return result;
}

/**
 * Get all Orixá numerology mappings
 * @returns Array of all OrixaNumerology objects
 */
export function getAllOrixaNumerologies(): OrixaNumerology[] {
  return Object.values(ORIXA_NUMEROLOGIA_MAP);
}

/**
 * Get Orixás by sacred number
 * @param numero - Sacred number (1-14)
 * @returns Array of Orixás with that sacred number
 */
export function getOrixasByNumber(numero: number): OrixaNumerology[] {
  return Object.values(ORIXA_NUMEROLOGIA_MAP).filter(
    (o) => o.numero_sagrado === numero
  );
}

/**
 * Get Orixás by element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Array of Orixás with that elemental connection
 */
export function getOrixasByElement(
  elemento: OrixaNumerology['elemento']
): OrixaNumerology[] {
  return Object.values(ORIXA_NUMEROLOGIA_MAP).filter(
    (o) => o.elemento === elemento
  );
}

export default {
  getOrixaNumerology,
  getNumerologyOrixa,
  getAllOrixaNumerologies,
  getOrixasByNumber,
  getOrixasByElement,
};