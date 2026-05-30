/**
 * Sephirot-Day Spiritual Correlation Mapping
 * Maps the 10 Sephiroth of the Kabbalistic Tree of Life to days of the week
 * Based on SpiritualCorrelationEngine.ts day-sefirah mappings and traditional Kabbalah
 */

/**
 * Represents the correlation between a Sephirah and its day of week correspondence
 */
export interface SephirahDay {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** The associated day of the week in Portuguese */
  dia: string;
  /** The day of the week in English */
  day: string;
  /** The associated classical element */
  elemento: string;
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Spiritual meaning and energy of the day-sephirah correlation */
  significado_espiritual: string;
  /** Associated spiritual practices for this day */
  praticas: string[];
  /** Primary color associated with this sephirah-day */
  cor_primaria: string;
  /** Chakra associated with this day-sephirah energy */
  chakra: string;
}

// ─── Sephirot-to-Day Mapping ──────────────────────────────────────────────────

export const SEPHIROT_DAY_MAPPINGS: Record<string, SephirahDay> = {
  // Domingo (Sunday) - Tiphereth (Beleza) - Fogo
  // The day of the Sun, representing harmony, purpose of life, and solar vitality
  Tiphereth: {
    sephirah: 'Tiphereth',
    dia: 'Domingo',
    day: 'sunday',
    elemento: 'Fogo',
    numero_caminho: 6,
    significado_espiritual: 'Harmonia vital, propósito de vida, a luz solar que ilumina o caminho. Dia de recarga energética e alinhamento com oEU Superior. A beleza que irradia do centro do ser.',
    praticas: ['Meditação solar', 'Rituais de renovação', 'Conexão com oEU Superior', 'Afirmações de propósito'],
    cor_primaria: '#eab308',
    chakra: '3º Plexo Solar',
  },

  // Segunda-feira (Monday) - Malkuth (Reino) / Yesod (Fundação) - Terra/Água
  // Day of the Moon, representing grounding, spiritual cleansing, and ancestral connection
  Malkuth: {
    sephirah: 'Malkuth',
    dia: 'Segunda-feira',
    day: 'monday',
    elemento: 'Terra',
    numero_caminho: 10,
    significado_espiritual: 'Aterramento, manifestação material, respeito aos ancestrais. O reino onde a energia se ancora e se torna tangível. Limpeza espiritual e transmutação de energias densas.',
    praticas: ['Aterramento', 'Limpesa espiritual', 'Rituais de proteção', 'Honra aos ancestrais'],
    cor_primaria: '#dc2626',
    chakra: '1º Básico',
  },

  // Segunda-feira (Monday) - Yesod (Fundação) - Água
  // Foundation of the subconscious, imagination, and lunar energy
  Yesod: {
    sephirah: 'Yesod',
    dia: 'Segunda-feira',
    day: 'monday',
    elemento: 'Água',
    numero_caminho: 9,
    significado_espiritual: 'Fundação do subconsciente, imaginação ativa, lua interior. A base sobre a qual toda manifestação se ancora. O subconscious que guarda memórias e padrões ancestrais.',
    praticas: ['Visualização criativa', 'Trabalho com memórias', 'Sonhos lúcidos', 'Conexão lunar'],
    cor_primaria: '#dc2626',
    chakra: '6º Frontal',
  },

  // Terça-feira (Tuesday) - Geburah (Severidade) - Fogo
  // Day of Mars, representing strength, courage, cutting through obstacles
  Geburah: {
    sephirah: 'Geburah',
    dia: 'Terça-feira',
    day: 'tuesday',
    elemento: 'Fogo',
    numero_caminho: 5,
    significado_espiritual: 'Força cortante, coragem, a justiça que poda o excesso. A severidade sagrada que transforma e remove obstáculos. Poder de ação e determinação inabalável.',
    praticas: ['Quebra de demandas', 'Enfrentamento de desafios', 'Corte de energias pesadas', 'Ação decisiva'],
    cor_primaria: '#ea580c',
    chakra: '2º Sacro',
  },

  // Quarta-feira (Wednesday) - Hod (Glória) - Ar
  // Day of Mercury, representing intellect, communication, divine truth
  Hod: {
    sephirah: 'Hod',
    dia: 'Quarta-feira',
    day: 'wednesday',
    elemento: 'Ar',
    numero_caminho: 8,
    significado_espiritual: 'Glória intelectual, comunicação da verdade, vitória da mente. O intelecto superior que articula o divino. Estudos, razão e busca pela verdademanifestada.',
    praticas: ['Estudos sagrados', 'Comunicação espiritual', 'Verdade e transparência', 'Rituais de proteção mental'],
    cor_primaria: '#eab308',
    chakra: '3º Plexo Solar',
  },

  // Quinta-feira (Thursday) - Chesed (Misericórdia) - Água
  // Day of Jupiter, representing expansion, mercy, abundance, divine grace
  Chesed: {
    sephirah: 'Chesed',
    dia: 'Quinta-feira',
    day: 'thursday',
    elemento: 'Água',
    numero_caminho: 4,
    significado_espiritual: 'Misericórdia divina, expansão abundante, fartura espiritual. A graça que se derrama sobre quem busca. Conhecimento, cura e conexão com a abundância universal.',
    praticas: ['Rituais de prosperidade', 'Orações de благословение', 'Expansão de consciência', 'Cura energética'],
    cor_primaria: '#22c55e',
    chakra: '4º Cardíaco',
  },

  // Sexta-feira (Friday) - Kether (Coroa) - Éter
  // Day of Venus, representing purity, peace, divine connection
  Kether: {
    sephirah: 'Kether',
    dia: 'Sexta-feira',
    day: 'friday',
    elemento: 'Éter',
    numero_caminho: 11,
    significado_espiritual: 'Pureza original, conexão direta com o Divino, silêncio sagrado. A coroa que precede toda forma. Paz interior, gratidão e acesso aoEU Superior.',
    praticas: ['Silêncio contemplativo', 'Gratidão profunda', 'Conexão divina', 'Purificação energética'],
    cor_primaria: '#ffffff',
    chakra: '7º Coronário',
  },

  // Sábado (Saturday) - Binah (Entendimento) - Ar
  // Day of Saturn, representing understanding, limitation, structure
  Binah: {
    sephirah: 'Binah',
    dia: 'Sábado',
    day: 'saturday',
    elemento: 'Ar',
    numero_caminho: 3,
    significado_espiritual: 'Entendimento superior, limitação formativa, discernimento. A energia feminina que dá forma e estrutura. A compreensão das leis universais que governam a existência.',
    praticas: ['Contemplação profunda', 'Estruturação de projetos', 'Discernimento espiritual', 'Meditação estruturada'],
    cor_primaria: '#9333ea',
    chakra: '4º Cardíaco',
  },

  // Sábado (Saturday) - Tiphereth (Beleza) - Fogo
  // Also associated with Saturday - harmony and beauty
  'Tiphereth-Sabado': {
    sephirah: 'Tiphereth',
    dia: 'Sábado',
    day: 'saturday',
    elemento: 'Fogo',
    numero_caminho: 6,
    significado_espiritual: 'Harmonia e equilíbrio, amor incondicional, fertilidade. A beleza que se manifesta no receptacle doBinah. Intuição e águas geradoras de vida.',
    praticas: ['Amor unconditional', 'Intuição ativada', 'Fertilidade espiritual', 'Rituais de criação'],
    cor_primaria: '#ec4899',
    chakra: '6º Frontal',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_DAY_MAPPINGS);
// Freeze nested objects
Object.values(SEPHIROT_DAY_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Sephirah-day correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah', 'Tiphereth')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotDay(sephirah: string): SephirahDay | null {
  return SEPHIROT_DAY_MAPPINGS[sephirah] ?? null;
}

/**
 * Alias for getSephirotDay - Get the Sephirah-day correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah', 'Tiphereth')
 * @returns The correlation mapping or null if not found
 */
export function getSephirahDay(sephirah: string): SephirahDay | null {
  return getSephirotDay(sephirah);
}

/**
 * Get the day-Sephirot correlation (reverse lookup)
 * @param dia - The day name in Portuguese (e.g., 'Domingo', 'Segunda-feira')
 * @returns Array of SephirahDay mappings for that day
 */
export function getDaySephirot(dia: string): SephirahDay[] {
  return Object.values(SEPHIROT_DAY_MAPPINGS).filter(
    mapping => mapping.dia.toLowerCase() === dia.toLowerCase() || 
               mapping.day.toLowerCase() === dia.toLowerCase()
  );
}

/**
 * Alias for getDaySephirot - Get Sephiroth associated with a specific day
 * @param dia - The day name in Portuguese or English
 * @returns Array of SephirahDay mappings for that day
 */
export function getDaySephirah(dia: string): SephirahDay[] {
  return getDaySephirot(dia);
}

/**
 * Get all available Sephirot-day mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotDays(): SephirahDay[] {
  return Object.values(SEPHIROT_DAY_MAPPINGS);
}

/**
 * Alias for getAllSephirotDays - Get all Sephirah-day mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirahDays(): SephirahDay[] {
  return getAllSephirotDays();
}

/**
 * Get all Sephirah names
 * @returns Array of Sephirah names
 */
export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_DAY_MAPPINGS);
}

/**
 * Check if a Sephirah exists in the mapping
 * @param sephirah - The name of the Sephirah to check
 * @returns True if Sephirah exists in mapping
 */
export function hasSephirotDay(sephirah: string): boolean {
  return sephirah in SEPHIROT_DAY_MAPPINGS;
}

/**
 * Check if a day exists in the mapping
 * @param dia - The day name to check
 * @returns True if day exists in mapping
 */
export function hasDaySephirot(dia: string): boolean {
  return getDaySephirot(dia).length > 0;
}

/**
 * Get spiritual practices for a Sephirah-day
 * @param sephirah - The name of the Sephirah
 * @returns Array of spiritual practices or null if not found
 */
export function getSephirotDayPractices(sephirah: string): string[] | null {
  const mapping = getSephirotDay(sephirah);
  return mapping?.praticas ?? null;
}
  // Quarta-feira (Wednesday) - Hod (Glória) - Ar
  Hod: {
    sephirah: 'Hod',
    dia: 'Quarta-feira',
    day: 'wednesday',
    elemento: 'Ar',
    numero_caminho: 8,
    significado_espiritual: 'Glória intelectual, comunicação da verdade, vitória da mente. O intelecto superior que articula o divino. Estudos, razão e busca pela verdade manifestada.',
    praticas: ['Estudos sagrados', 'Comunicação espiritual', 'Verdade e transparência', 'Rituais de proteção mental'],
    cor_primaria: '#eab308',
    chakra: '3º Plexo Solar',
  },
  // Quinta-feira (Thursday) - Chesed (Misericórdia) - Água
  Chesed: {
    sephirah: 'Chesed',
    dia: 'Quinta-feira',
    day: 'thursday',
    elemento: 'Água',
    numero_caminho: 4,
    significado_espiritual: 'Misericórdia divina, expansão abundante, fartura espiritual. A graça que se derrama sobre quem busca. Conhecimento, cura e conexão com a abundância universal.',
    praticas: ['Rituais de prosperidade', 'Orações de bênção', 'Expansão de consciência', 'Cura energética'],
    cor_primaria: '#22c55e',
    chakra: '4º Cardíaco',
  },

/**
 * Get the primary color for a Sephirah-day
 * @param sephirah - The name of the Sephirah
 * @returns Primary color hex code or null if not found
 */
export function getSephirotDayColor(sephirah: string): string | null {
  return getSephirotDay(sephirah)?.cor_primaria ?? null;
}

/**
 * Get Sephiroth by day of week (numeric 0-6, where 0=Sunday)
 * @param dayNumber - Day number (0=Sunday, 1=Monday, ..., 6=Saturday)
 * @returns Array of SephirahDay mappings for that day
 */
export function getSephirotByDayNumber(dayNumber: number): SephirahDay[] {
  const dayMap: Record<number, string> = {
    0: 'domingo',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  const dayName = dayMap[dayNumber];
  if (!dayName) return [];
  return Object.values(SEPHIROT_DAY_MAPPINGS).filter(
    mapping => mapping.day === dayName
  );
}

/**
 * Get the element association for a Sephirah-day
 * @param sephirah - The name of the Sephirah
 * @returns Element name or null if not found
 */
export function getSephirotDayElement(sephirah: string): string | null {
  return getSephirotDay(sephirah)?.elemento ?? null;
}

/**
 * Get the spiritual meaning for a Sephirah-day
 * @param sephirah - The name of the Sephirah
 * @returns Spiritual meaning or null if not found
 */
export function getSephirotDayMeaning(sephirah: string): string | null {
  return getSephirotDay(sephirah)?.significado_espiritual ?? null;
}

/**
 * Default export with all functions
 */
export default {
  getSephirotDay,
  getSephirahDay,
  getDaySephirot,
  getDaySephirah,
  getAllSephirotDays,
  getAllSephirahDays,
  getAllSephiroth,
  hasSephirotDay,
  hasDaySephirot,
  getSephirotDayPractices,
  getSephirotDayColor,
  getSephirotByDayNumber,
  getSephirotDayElement,
  getSephirotDayMeaning,
};