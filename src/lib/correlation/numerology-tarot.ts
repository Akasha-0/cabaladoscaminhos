/**
 * Numerology-Tarot Minor Arcana Correlation
 * Correlates numbers 1-10 with Tarot Minor Arcana cards
 * Based on IDEIA.md "Matriz de Numerologia e Odús de Nascimento" and Traditional Tarot symbolism
 */

/**
 * Represents the correlation between a numerology number and its Tarot Minor Arcana correspondence
 */
export interface NumerologyTarotMapping {
  /** The numerology number (1-10) */
  numero: number;
  /** The Minor Arcana card name */
  carta: string;
  /** The suit of the Minor Arcana card */
  naipe: string;
  /** The card number in the Minor Arcana (1-10) */
  numero_carta: number;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Elemental association (Fogo, Água, Terra, Ar) */
  elemento: string;
  /** Associated Orixá from Candomblé tradition */
  orixa: string;
  /** Associated Kabbalistic Sephirah */
  sephirah: string;
  /** Practical interpretation for daily life */
  interpretacao: string;
}

// ─── Numerology-to-Tarot Minor Arcana Mapping ─────────────────────────────────────

export const NUMEROLOGY_TAROT_MAPPINGS: Record<number, NumerologyTarotMapping> = {
  1: {
    numero: 1,
    carta: 'Ás de Bastões',
    naipe: 'Bastões',
    numero_carta: 1,
    significado_espiritual: 'O Iniciador, impulso criativo, novo começo, força vital, confiança e liderança. A centelha divina que acende a ação.',
    elemento: 'Fogo',
    orixa: 'Ogum',
    sephirah: 'Kether',
    interpretacao: 'Momento de iniciar novos projetos com entusiasmo. A energia do fogo催促 você a agir com coragem e相信自己. Favorece开创精神和领导力.',
  },
  2: {
    numero: 2,
    carta: 'Dois de Copas',
    naipe: 'Copas',
    numero_carta: 2,
    significado_espiritual: 'A União, parceria, dualidade, amor, relacionamentos, equilíbrio emocional e diplomacią. A harmonia entre dois corações.',
    elemento: 'Água',
    orixa: 'Ibeji',
    sephirah: 'Chokmah',
    interpretacao: 'Período propício para unir forças, criar alianças e cultivar relacionamentos. A energia aquática traz sensibilidade e receptividade emocional.',
  },
  3: {
    numero: 3,
    carta: 'Três de Copas',
    naipe: 'Copas',
    numero_carta: 3,
    significado_espiritual: 'A Celebração, criatividade, expressão artística, amizade, comunidade, fartura emocional e alegria de viver.',
    elemento: 'Água',
    orixa: 'Oxum',
    sephirah: 'Binah',
    interpretacao: 'Momento de colheitas e celebrações. A energia de Oxum traz doçura, abundância afetiva e conexão com a beleza. Favorece atividades criativas e sociais.',
  },
  4: {
    numero: 4,
    carta: 'Quatro de Ouros',
    naipe: 'Ouros',
    numero_carta: 4,
    significado_espiritual: 'A Estabilidade, controle, segurança material, organização, persistência e ancoramento. A fundação sólida do mundo material.',
    elemento: 'Terra',
    orixa: 'Oxóssi',
    sephirah: 'Chesed',
    interpretacao: 'Período de consolidation financeira e organização. A energia de Oxóssi favorece a estruturação de projetos de longo prazo e a gestão prudente de recursos.',
  },
  5: {
    numero: 5,
    carta: 'Cinco de Ouros',
    naipe: 'Ouros',
    numero_carta: 5,
    significado_espiritual: 'O Desafio, adversidade, conflito temporário, superação de obstáculos, mudança e transição. A tempestade que precede a calma.',
    elemento: 'Terra',
    orixa: 'Xangô',
    sephirah: 'Geburah',
    interpretacao: 'Momento de enfrentar dificuldades com perseverança. A energia de Xangô traz a justiça necessária para superar obstáculos. Não desista — a vitória está próxima.',
  },
  6: {
    numero: 6,
    carta: 'Seis de Copas',
    naipe: 'Copas',
    numero_carta: 6,
    significado_espiritual: 'A Harmonia, generosidade, cuidado, infância, memórias, paz interior e reciprocidade. A doçura de servir aos outros.',
    elemento: 'Água',
    orixa: 'Iemanjá',
    sephirah: 'Tiphereth',
    interpretacao: 'Período de paz emocional e generosidade. A energia de Iemanjá traz harmonia familiar, cura de feridas passadas e conexão com a inner child.',
  },
  7: {
    numero: 7,
    carta: 'Sete de Copas',
    naipe: 'Copas',
    numero_carta: 7,
    significado_espiritual: 'A Escolha, ilusões, fantasia, introspecção, busca espiritual e avaliação de opções. O momento de discernir entre sonho e realidade.',
    elemento: 'Água',
    orixa: 'Iansã',
    sephirah: 'Netzach',
    interpretacao: 'Momento de refletir sobre seus desejos e escolher sabiamente. A energia de Iansã traz transformação e a sabedoria para distinguir o real do ilusório.',
  },
  8: {
    numero: 8,
    carta: 'Oito de Ouros',
    naipe: 'Ouros',
    numero_carta: 8,
    significado_espiritual: 'O Profissionalismo, maestria, dedicação, habilidade, progresso contínuo e karma. O artesão que aperfeiçoa sua arte.',
    elemento: 'Terra',
    orixa: 'Oxalá',
    sephirah: 'Hod',
    interpretacao: 'Período de trabalho disciplinado e aperfeiçoamento de habilidades. A energia de Oxalá traz paz e a maestria que vem da prática constante e da cabeça fria.',
  },
  9: {
    numero: 9,
    carta: 'Nove de Ouros',
    naipe: 'Ouros',
    numero_carta: 9,
    significado_espiritual: 'A Abundância, realização, autoconfiança, independência, sucesso material e gratificação. A colheita dos esforços.',
    elemento: 'Terra',
    orixa: 'Oxum',
    sephirah: 'Yesod',
    interpretacao: 'Momento de celebrar conquistas e abundância. A energia de Oxum traz realizeação financeira, auto-estima elevada e a doçura do sucesso merecido.',
  },
  10: {
    numero: 10,
    carta: 'Dez de Ouros',
    naipe: 'Ouros',
    numero_carta: 10,
    significado_espiritual: 'O Finais, completude, legado familiar, tradição, responsabilidade e ciclos completos. A roda que retorna ao início.',
    elemento: 'Terra',
    orixa: 'Oxalá',
    sephirah: 'Malkuth',
    interpretacao: 'Período de encerramento de ciclos importantes. A energia de Oxalá traz estabilidade, conexão com ancestrais e a sabedoria de que endings são também beginnings.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(NUMEROLOGY_TAROT_MAPPINGS);
// Freeze nested objects
Object.values(NUMEROLOGY_TAROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the numerology-to-Tarot correlation mapping
 * @param numero - Number from 1 to 10
 * @returns The correlation mapping or null if not found
 */
export function getNumerologyTarot(numero: number): NumerologyTarotMapping | null {
  return NUMEROLOGY_TAROT_MAPPINGS[numero] ?? null;
}

/**
 * Get the numerology number corresponding to a Tarot Minor Arcana card
 * @param carta - The card name (e.g., 'Ás de Bastões', 'Dez de Ouros')
 * @returns The numerology number or null if not found
 */
export function getTarotNumerology(carta: string): number | null {
  for (const [num, mapping] of Object.entries(NUMEROLOGY_TAROT_MAPPINGS)) {
    if (mapping.carta === carta) {
      return Number(num);
    }
  }
  return null;
}

/**
 * Get all available numerology-Tarot mappings
 * @returns Array of all correlation mappings
 */
export function getAllNumerologyTarots(): NumerologyTarotMapping[] {
  return Object.values(NUMEROLOGY_TAROT_MAPPINGS).sort((a, b) => a.numero - b.numero);
}

/**
 * Get all numerology numbers
 * @returns Array of numbers 1-10
 */
export function getAllNumerologyNumbers(): number[] {
  return Object.keys(NUMEROLOGY_TAROT_MAPPINGS).map(Number).sort((a, b) => a - b);
}

/**
 * Check if a number exists in the mapping
 * @param numero - Number to check
 * @returns True if number exists in mapping
 */
export function hasNumerologyTarot(numero: number): boolean {
  return numero in NUMEROLOGY_TAROT_MAPPINGS;
}

/**
 * Get mapping by card name
 * @param carta - The card name
 * @returns The correlation mapping or null if not found
 */
export function getMappingByCard(carta: string): NumerologyTarotMapping | null {
  for (const mapping of Object.values(NUMEROLOGY_TAROT_MAPPINGS)) {
    if (mapping.carta === carta) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar)
 * @returns Array of NumerologyTarotMapping objects matching the element
 */
export function getNumerologyByElement(elemento: string): NumerologyTarotMapping[] {
  return Object.values(NUMEROLOGY_TAROT_MAPPINGS)
    .filter(mapping => mapping.elemento === elemento)
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Get mappings filtered by Orixá
 * @param orixa - Orixá name to search for
 * @returns Array of NumerologyTarotMapping objects associated with the Orixá
 */
export function getNumerologyByOrixa(orixa: string): NumerologyTarotMapping[] {
  return Object.values(NUMEROLOGY_TAROT_MAPPINGS)
    .filter(mapping => mapping.orixa === orixa)
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Get mappings filtered by suit
 * @param naipe - Suit name to filter by (Bastões, Copas, Ouros, Espadas)
 * @returns Array of NumerologyTarotMapping objects matching the suit
 */
export function getNumerologyBySuit(naipe: string): NumerologyTarotMapping[] {
  return Object.values(NUMEROLOGY_TAROT_MAPPINGS)
    .filter(mapping => mapping.naipe === naipe)
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Get mappings filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of NumerologyTarotMapping objects with the matching Sephirah
 */
export function getNumerologyBySephirah(sephirah: string): NumerologyTarotMapping[] {
  return Object.values(NUMEROLOGY_TAROT_MAPPINGS)
    .filter(mapping => mapping.sephirah === sephirah)
    .sort((a, b) => a.numero - b.numero);
}
