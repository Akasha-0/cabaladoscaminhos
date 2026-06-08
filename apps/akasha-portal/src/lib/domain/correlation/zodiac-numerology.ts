/**
 * Normalize a string for accent-insensitive, case-insensitive comparison
 */
function normalizeSigno(signo: string): string {
  return signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Zodiac-Numerology Correlation
 * Correlates Zodiac signs with numerology numbers
 * Based on Traditional Numerology symbolism and Western Astrology
 */

/**
 * Represents the correlation between a Zodiac sign and its numerology correspondence
 */
export interface ZodiacNumerologyMapping {
  /** The associated Zodiac sign */
  signo: string;
  /** The numerology number (1-10, with 11 and 12 for Aquário and Peixes) */
  numero: number;
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

// ─── Zodiac-to-Numerology Mapping ─────────────────────────────────────────────

export const ZODIAC_NUMEROLOGY_MAPPINGS: Record<string, ZodiacNumerologyMapping> = {
  Áries: {
    signo: 'Áries',
    numero: 1,
    elemento: 'Fogo',
    modalidade: 'Cardinal',
    significado_espiritual: 'O Iniciador, impulso criativo, novo começo, força vital, confiança e liderança. A centelha divina que acende a ação.',
    orixa: 'Ogum',
    sephirah: 'Kether',
    planeta: 'Marte',
    interpretacao: 'Momento de iniciar novos projetos com entusiasmo. A energia de Áries催促您采取勇敢行动相信自己. Favorece开创精神和领导力.',
  },
  Touro: {
    signo: 'Touro',
    numero: 2,
    elemento: 'Terra',
    modalidade: 'Fixed',
    significado_espiritual: 'A União, parceria, dualidade, receptividade, equilíbrio e perseverança. A estabilidade que sustenta a vida.',
    orixa: 'Ibeji',
    sephirah: 'Chokmah',
    planeta: 'Vênus',
    interpretacao: 'Período propício para unir forças, criar alianças e cultivar relacionamentos. A energia de Touro traz praticidade e beleza às suas uniões.',
  },
  Gêmeos: {
    signo: 'Gêmeos',
    numero: 3,
    elemento: 'Ar',
    modalidade: 'Mutable',
    significado_espiritual: 'A Expressão, criatividade, comunicação, curiosidade, múltiplos caminhos e diversidade. O mensageiro que conecta mundos.',
    orixa: 'Oxum',
    sephirah: 'Binah',
    planeta: 'Mercúrio',
    interpretacao: 'Momento de colher e celebrar. A energia de Gêmeos favorece a comunicação criativa, conexões sociais e a expressão do intelecto.',
  },
  Câncer: {
    signo: 'Câncer',
    numero: 4,
    elemento: 'Água',
    modalidade: 'Cardinal',
    significado_espiritual: 'A Fundação, lar, família, emoções profundas, segurança e nutrição. A Lua que protege e sustenta.',
    orixa: 'Iemanjá',
    sephirah: 'Chesed',
    planeta: 'Lua',
    interpretacao: 'Período de consolidação emocional e organização. A energia de Câncer favorece o ancoramento familiar e a cura de feridas emocionais.',
  },
  Leão: {
    signo: 'Leão',
    numero: 5,
    elemento: 'Fogo',
    modalidade: 'Fixed',
    significado_espiritual: 'A Liberdade, aventura, vitalidade, autoconfiança, criatividade e autoexpressão. O Sol que brilha com propósito.',
    orixa: 'Xangô',
    sephirah: 'Geburah',
    planeta: 'Sol',
    interpretacao: 'Momento de viver plenamente e expressar sua verdadeira essência. A energia de Leão traz coragem para ser quem você realmente é.',
  },
  Virgem: {
    signo: 'Virgem',
    numero: 6,
    elemento: 'Terra',
    modalidade: 'Mutable',
    significado_espiritual: 'A Harmonia, serviço, análise, perfeição, saúde e rotina. O anjo guardião que serve aos outros.',
    orixa: 'Nanã',
    sephirah: 'Tiphereth',
    planeta: 'Mercúrio',
    interpretacao: 'Período de organização e serviço altruísta. A energia de Virgem traz discernimento para otimizar projetos e cuidar da saúde.',
  },
  Libra: {
    signo: 'Libra',
    numero: 7,
    elemento: 'Ar',
    modalidade: 'Cardinal',
    significado_espiritual: 'A Equilíbrio, justiça, relacionamentos, harmonia, arte e parcerias. A balança que busca a verdade.',
    orixa: 'Iansã',
    sephirah: 'Netzach',
    planeta: 'Vênus',
    interpretacao: 'Momento de refletir sobre suas relações e buscar equilíbrio. A energia de Libra traz paz interior e sabedoria para decisões importantes.',
  },
  Escorpião: {
    signo: 'Escorpião',
    numero: 8,
    elemento: 'Água',
    modalidade: 'Fixed',
    significado_espiritual: 'A Transformação, poder, mistério, regeneração, profundidade e intensidade. A águia que renasce das cinzas.',
    orixa: 'Oxumaré',
    sephirah: 'Hod',
    planeta: 'Plutão',
    interpretacao: 'Período de profunda transformação e renovação. A energia de Escorpião traz poder para superar obstáculos e revelar verdades ocultas.',
  },
  Sagitário: {
    signo: 'Sagitário',
    numero: 9,
    elemento: 'Fogo',
    modalidade: 'Mutable',
    significado_espiritual: 'A Sabedoria, expansão, optimismo, filosofia, viagens e Purpose. O arqueiro que mira o infinito.',
    orixa: 'Oxóssi',
    sephirah: 'Yesod',
    planeta: 'Júpiter',
    interpretacao: 'Momento de ampliar horizontes e buscar significado mais profundo. A energia de Sagitário traz otimismo e inspiração para sua jornada.',
  },
  Capricórnio: {
    signo: 'Capricórnio',
    numero: 10,
    elemento: 'Terra',
    modalidade: 'Cardinal',
    significado_espiritual: 'A Disciplina, ambição, responsabilidade, karma, tradição e realizações materiais. A cabra que escala montanhas.',
    orixa: 'Oxalá',
    sephirah: 'Malkuth',
    planeta: 'Saturno',
    interpretacao: 'Período de encerramento de ciclos importantes e conquistas tangíveis. A energia de Capricórnio traz estrutura e perseverança para realizar seus objetivos.',
  },
  Aquário: {
    signo: 'Aquário',
    numero: 11,
    elemento: 'Ar',
    modalidade: 'Fixed',
    significado_espiritual: 'A Humanitarismo, inovação, independência, visão futurista, liberdade e fraternidade. O aquário que verte água para a humanidade.',
    orixa: 'Oxumaré',
    sephirah: 'Daath',
    planeta: 'Urano',
    interpretacao: 'Momento de libertação de padrões antigos e abraçar a inovação. A energia de Aquário traz visões progressistas e conexões universais.',
  },
  Peixes: {
    signo: 'Peixes',
    numero: 12,
    elemento: 'Água',
    modalidade: 'Mutable',
    significado_espiritual: 'A Intuição, compaixão, transcendência, sonhadora, espiritualidade e conexão com o divino. Os dois peixes que nadam em direções opostas.',
    orixa: 'Iemanjá',
    sephirah: 'Malkuth',
    planeta: 'Netuno',
    interpretacao: 'Período de profundas reflexões e conexões espirituais. A energia de Peixes traz sensibilidade aguçada e abertura para a transcendência.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(ZODIAC_NUMEROLOGY_MAPPINGS);
// Freeze nested objects
Object.values(ZODIAC_NUMEROLOGY_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the zodiac-to-numerology correlation mapping
 * @param signo - The sign name (e.g., 'Áries', 'Touro')
 * @returns The correlation mapping or null if not found
 */
export function getZodiacNumerologyMapping(signo: string): ZodiacNumerologyMapping | null {
  const normalized = normalizeSigno(signo);
  for (const [key, mapping] of Object.entries(ZODIAC_NUMEROLOGY_MAPPINGS)) {
    if (normalizeSigno(key) === normalized) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get the numerology number corresponding to a Zodiac sign
 * @param signo - The sign name (e.g., 'Áries', 'Touro')
 * @returns The numerology number or null if not found
 */
export function getZodiacNumerology(signo: string): number | null {
  const mapping = getZodiacNumerologyMapping(signo);
  return mapping?.numero ?? null;
}
/**
 * Get the zodiac-to-numerology correlation mapping by sign name
 * Alias for getZodiacNumerologyMapping for reverse-lookup naming consistency
 * @param signo - The sign name (e.g., 'Áries', 'Touro')
 * @returns The correlation mapping or null if not found
 */
export function getNumerologyZodiac(signo: string): ZodiacNumerologyMapping | null {
  return getZodiacNumerologyMapping(signo);
}

/**
 * Get all available zodiac-numerology mappings
 * @returns Array of all correlation mappings
 */
export function getAllZodiacNumerology(): ZodiacNumerologyMapping[] {
  return Object.values(ZODIAC_NUMEROLOGY_MAPPINGS);
}
/**
 * Get all available zodiac-numerology mappings
 * Alias for getAllZodiacNumerology for naming consistency
 * @returns Array of all correlation mappings
 */
export function getAllZodiacNumerologies(): ZodiacNumerologyMapping[] {
  return getAllZodiacNumerology();
}
/**
 * Get all zodiac signs
 * @returns Array of all sign names
 */
export function getAllZodiacSigns(): string[] {
  return Object.keys(ZODIAC_NUMEROLOGY_MAPPINGS);
}

/**
 * Check if a sign exists in the mapping
 * @param signo - Sign name to check
 * @returns True if sign exists in mapping
 */
export function hasZodiacNumerology(signo: string): boolean {
  return getZodiacNumerologyMapping(signo) !== null;
}

/**
 * Get mapping by numerology number
 * @param numero - The numerology number
 * @returns The correlation mapping or null if not found
 */
export function getMappingByNumero(numero: number): ZodiacNumerologyMapping[] {
  return Object.values(ZODIAC_NUMEROLOGY_MAPPINGS).filter(m => m.numero === numero);
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar)
 * @returns Array of ZodiacNumerologyMapping objects matching the element
 */
export function getZodiacByElement(elemento: string): ZodiacNumerologyMapping[] {
  const normalized = elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(ZODIAC_NUMEROLOGY_MAPPINGS).filter(
    m => m.elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized
  );
}

/**
 * Get mappings filtered by Orixá
 * @param orixa - Orixá name to search for
 * @returns Array of ZodiacNumerologyMapping objects associated with the Orixá
 */
export function getZodiacByOrixa(orixa: string): ZodiacNumerologyMapping[] {
  const normalized = orixa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(ZODIAC_NUMEROLOGY_MAPPINGS).filter(
    m => m.orixa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized
  );
}

/**
 * Get mappings filtered by modality
 * @param modalidade - Modality to filter by (Cardinal, Fixed, Mutable)
 * @returns Array of ZodiacNumerologyMapping objects matching the modality
 */
export function getZodiacByModalidade(modalidade: string): ZodiacNumerologyMapping[] {
  const normalized = modalidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(ZODIAC_NUMEROLOGY_MAPPINGS).filter(
    m => m.modalidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized
  );
}

/**
 * Get mappings filtered by planet
 * @param planeta - Planet name to search for
 * @returns Array of ZodiacNumerologyMapping objects with the matching planet
 */
export function getZodiacByPlaneta(planeta: string): ZodiacNumerologyMapping[] {
  const normalized = planeta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(ZODIAC_NUMEROLOGY_MAPPINGS).filter(
    m => m.planeta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized
  );
}

/**
 * Get mappings filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of ZodiacNumerologyMapping objects with the matching Sephirah
 */
export function getZodiacBySephirah(sephirah: string): ZodiacNumerologyMapping[] {
  const normalized = sephirah.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(ZODIAC_NUMEROLOGY_MAPPINGS).filter(
    m => m.sephirah.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized
  );
}
