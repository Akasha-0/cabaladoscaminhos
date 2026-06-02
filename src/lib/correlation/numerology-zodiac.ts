/**
 * Normalize a string for accent-insensitive, case-insensitive comparison
 */
function normalizeSigno(signo: string): string {
  return signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Numerology-Zodiac Correlation
 * Correlates numerology numbers with Zodiac signs
 * Based on Traditional Numerology symbolism and Western Astrology
 */

/**
 * Represents the correlation between a numerology number and its Zodiac correspondence
 */
export interface NumerologyZodiacMapping {
  /** The numerology number (1-10) */
  numero: number;
  /** The associated Zodiac sign */
  signo: string;
  /** Elemental association (Fogo, Água, Terra, Ar) */
  elemento: string;
  /** Modalidade: Cardinal, Fixed, Mutable */
  modalidade: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Associated Orixá from Candomblé tradition */
  orixa: string;
  /** Associated Kabbalistic Sephirah */
  sephirah: string;
  /** Planetary ruler */
  planeta: string;
  /** Practical interpretation for daily life */
  interpretacao: string;
}

// ─── Numerology-to-Zodiac Mapping ─────────────────────────────────────────────

export const NUMEROLOGY_ZODIAC_MAPPINGS: Record<number, NumerologyZodiacMapping> = {
  1: {
    numero: 1,
    signo: 'Áries',
    elemento: 'Fogo',
    modalidade: 'Cardinal',
    significado_espiritual: 'O Iniciador, impulso criativo, novo começo, força vital, confiança e liderança. A centelha divina que acende a ação.',
    orixa: 'Ogum',
    sephirah: 'Kether',
    planeta: 'Marte',
    interpretacao: 'Momento de iniciar novos projetos com entusiasmo. A energia de Áries催促您采取勇敢行动相信自己. Favorece开创精神和领导力.',
  },
  2: {
    numero: 2,
    signo: 'Touro',
    elemento: 'Terra',
    modalidade: 'Fixed',
    significado_espiritual: 'A União, parceria, dualidade, receptividade, equilíbrio e perseverança. A estabilidade que sustenta a vida.',
    orixa: 'Ibeji',
    sephirah: 'Chokmah',
    planeta: 'Vênus',
    interpretacao: 'Período propício para unir forças, criar alianças e cultivar relacionamentos. A energia de Touro traz praticidade e beleza às suas uniões.',
  },
  3: {
    numero: 3,
    signo: 'Gêmeos',
    elemento: 'Ar',
    modalidade: 'Mutable',
    significado_espiritual: 'A Expressão, criatividade, comunicação, curiosidade, múltiplos caminhos e diversidade. O mensageiro que conecta mundos.',
    orixa: 'Oxum',
    sephirah: 'Binah',
    planeta: 'Mercúrio',
    interpretacao: 'Momento de colher e celebrar. A energia de Gêmeos favorece a comunicação criativa, conexões sociais e a expressão do intelecto.',
  },
  4: {
    numero: 4,
    signo: 'Câncer',
    elemento: 'Água',
    modalidade: 'Cardinal',
    significado_espiritual: 'A Fundação, lar, família, emoções profundas, segurança e nutrição. A Lua que protege e sustenta.',
    orixa: 'Iemanjá',
    sephirah: 'Chesed',
    planeta: 'Lua',
    interpretacao: 'Período de consolidação emocional e organização. A energia de Câncer favorece o ancoramento familiar e a cura de feridas emocionais.',
  },
  5: {
    numero: 5,
    signo: 'Leão',
    elemento: 'Fogo',
    modalidade: 'Fixed',
    significado_espiritual: 'A Liberdade, aventura, vitalidade, autoconfiança, criatividade e autoexpressão. O Sol que brilha com propósito.',
    orixa: 'Xangô',
    sephirah: 'Geburah',
    planeta: 'Sol',
    interpretacao: 'Momento de viver plenamente e expressar sua verdadeira essência. A energia de Leão traz coragem para ser quem você realmente é.',
  },
  6: {
    numero: 6,
    signo: 'Virgem',
    elemento: 'Terra',
    modalidade: 'Mutable',
    significado_espiritual: 'A Harmonia, serviço, análise, perfeição, saúde e rotina. O anjo guardião que serve aos outros.',
    orixa: 'Nanã',
    sephirah: 'Tiphereth',
    planeta: 'Mercúrio',
    interpretacao: 'Período de organização e serviço altruísta. A energia de Virgem traz discernimento para otimizar projetos e cuidar da saúde.',
  },
  7: {
    numero: 7,
    signo: 'Libra',
    elemento: 'Ar',
    modalidade: 'Cardinal',
    significado_espiritual: 'A Equilíbrio, justiça, relacionamentos, harmonia, arte e parcerias. A balança que busca a verdade.',
    orixa: 'Iansã',
    sephirah: 'Netzach',
    planeta: 'Vênus',
    interpretacao: 'Momento de refletir sobre suas relações e buscar equilíbrio. A energia de Libra traz paz interior e sabedoria para decisões importantes.',
  },
  8: {
    numero: 8,
    signo: 'Escorpião',
    elemento: 'Água',
    modalidade: 'Fixed',
    significado_espiritual: 'A Transformação, poder, mistério, regeneração, profundidade e intensidade. A águia que renasce das cinzas.',
    orixa: 'Oxumaré',
    sephirah: 'Hod',
    planeta: 'Plutão',
    interpretacao: 'Período de profunda transformação e renovação. A energia de Escorpião traz poder para superar obstáculos e revelar verdades ocultas.',
  },
  9: {
    numero: 9,
    signo: 'Sagitário',
    elemento: 'Fogo',
    modalidade: 'Mutable',
    significado_espiritual: 'A Sabedoria, expansão, optimismo, filosofia, viagens e Purpose. O arqueiro que mira o infinito.',
    orixa: 'Oxóssi',
    sephirah: 'Yesod',
    planeta: 'Júpiter',
    interpretacao: 'Momento de ampliar horizontes e buscar significado mais profundo. A energia de Sagitário traz otimismo e inspiração para sua jornada.',
  },
  10: {
    numero: 10,
    signo: 'Capricórnio',
    elemento: 'Terra',
    modalidade: 'Cardinal',
    significado_espiritual: 'A Disciplina, ambição, responsabilidade, karma, tradição e realizações materiais. A cabra que escala montanhas.',
    orixa: 'Oxalá',
    sephirah: 'Malkuth',
    planeta: 'Saturno',
    interpretacao: 'Período de encerramento de ciclos importantes e conquistas tangíveis. A energia de Capricórnio traz estrutura e perseverança para realizar seus objetivos.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(NUMEROLOGY_ZODIAC_MAPPINGS);
// Freeze nested objects
Object.values(NUMEROLOGY_ZODIAC_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the numerology-to-zodiac correlation mapping
 * @param numero - The numerology number (1-10)
 * @returns The correlation mapping or null if not found
 */
function getNumerologyZodiacMapping(numero: number): NumerologyZodiacMapping | null {
  if (numero < 1 || numero > 10) {
    return null;
  }
  return NUMEROLOGY_ZODIAC_MAPPINGS[numero] ?? null;
}

/**
 * Get the zodiac sign corresponding to a numerology number
 * @param numero - The numerology number (1-10)
 * @returns The zodiac sign or null if not found
 */
export function getNumerologyZodiac(numero: number): NumerologyZodiacMapping | null {
  return getNumerologyZodiacMapping(numero);
}

/**
 * Get the numerology number corresponding to a Zodiac sign
 * @param signo - The sign name (e.g., 'Áries', 'Touro')
 * @returns The numerology number or null if not found
 */
export function getZodiacNumerology(signo: string): number | null {
  const normalized = normalizeSigno(signo);
  
  // Build reverse lookup from signo to numero
  const reverseMap: Record<string, number> = {};
  for (const mapping of Object.values(NUMEROLOGY_ZODIAC_MAPPINGS)) {
    const key = normalizeSigno(mapping.signo);
    reverseMap[key] = mapping.numero;
  }
  
  return reverseMap[normalized] ?? null;
}

/**
 * Get all available numerology-zodiac mappings
 * @returns Array of all correlation mappings sorted by numero
 */
export function getAllNumerologyZodiacs(): NumerologyZodiacMapping[] {
  return Object.values(NUMEROLOGY_ZODIAC_MAPPINGS).sort((a, b) => a.numero - b.numero);
}

/**
 * Get all available numerology numbers (1-10)
 * @returns Array of all numerology numbers sorted ascending
 */
export function getAllNumerologyNumbers(): number[] {
  return Object.keys(NUMEROLOGY_ZODIAC_MAPPINGS).map(Number).sort((a, b) => a - b);
}

/**
 * Check if a numerology number exists in the mapping
 * @param numero - Number to check
 * @returns True if number exists in mapping
 */
export function hasNumerologyZodiac(numero: number): boolean {
  return getNumerologyZodiacMapping(numero) !== null;
}

/**
 * Get mapping by sign name
 * @param signo - The sign name (e.g., 'Áries', 'Touro')
 * @returns The correlation mapping or null if not found
 */
export function getMappingBySigno(signo: string): NumerologyZodiacMapping | null {
  const normalized = normalizeSigno(signo);
  
  for (const mapping of Object.values(NUMEROLOGY_ZODIAC_MAPPINGS)) {
    if (normalizeSigno(mapping.signo) === normalized) {
      return mapping;
    }
  }
  
  return null;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar)
 * @returns Array of NumerologyZodiacMapping objects matching the element
 */
export function getNumerologyByElement(elemento: string): NumerologyZodiacMapping[] {
  const normalizedElemento = normalizeSigno(elemento);
  return Object.values(NUMEROLOGY_ZODIAC_MAPPINGS).filter(
    m => normalizeSigno(m.elemento) === normalizedElemento
  );
}

/**
 * Get mappings filtered by Orixá
 * @param orixa - Orixá name to search for
 * @returns Array of NumerologyZodiacMapping objects associated with the Orixá
 */
export function getNumerologyByOrixa(orixa: string): NumerologyZodiacMapping[] {
  const normalizedOrixa = normalizeSigno(orixa);
  return Object.values(NUMEROLOGY_ZODIAC_MAPPINGS).filter(
    m => normalizeSigno(m.orixa) === normalizedOrixa
  );
}

/**
 * Get mappings filtered by modality
 * @param modalidade - Modality to filter by (Cardinal, Fixed, Mutable)
 * @returns Array of NumerologyZodiacMapping objects matching the modality
 */
export function getNumerologyByModalidade(modalidade: string): NumerologyZodiacMapping[] {
  const normalizedModalidade = normalizeSigno(modalidade);
  return Object.values(NUMEROLOGY_ZODIAC_MAPPINGS).filter(
    m => normalizeSigno(m.modalidade) === normalizedModalidade
  );
}

/**
 * Get mappings filtered by planet
 * @param planeta - Planet name to search for
 * @returns Array of NumerologyZodiacMapping objects with the matching planet
 */
export function getNumerologyByPlaneta(planeta: string): NumerologyZodiacMapping[] {
  const normalizedPlaneta = normalizeSigno(planeta);
  return Object.values(NUMEROLOGY_ZODIAC_MAPPINGS).filter(
    m => normalizeSigno(m.planeta) === normalizedPlaneta
  );
}

/**
 * Get mappings filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of NumerologyZodiacMapping objects with the matching Sephirah
 */
export function getNumerologyBySephirah(sephirah: string): NumerologyZodiacMapping[] {
  const normalizedSephirah = normalizeSigno(sephirah);
  return Object.values(NUMEROLOGY_ZODIAC_MAPPINGS).filter(
    m => normalizeSigno(m.sephirah) === normalizedSephirah
  );
}