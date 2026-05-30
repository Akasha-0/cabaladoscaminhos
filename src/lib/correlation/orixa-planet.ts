/**
 * Orixá-Planet Correlation Mapping
 * Based on IDEIA.md Tabela de Correspondência Macro
 * Maps Candomblé/Umbanda Orixás to their corresponding classical planets
 */

export interface OrixaPlanetMapping {
  /** Orixá name (Portuguese) */
  orixa: string;
  /** Classical planet ruler */
  planet: string;
  /** Sacred day(s) of the week */
  dia: string;
  /** Traditional colors */
  cores: string[];
  /** Elemental correspondence */
  elemento: string;
  /** Energetic quality classification */
  qualidade_energetica: string;
  /** Spiritual meaning */
  significado_espiritual: string;
}

// ─── Orixá-to-Planet Mapping ─────────────────────────────────────────────────

export const ORIXA_PLANET_MAPPINGS: Record<string, OrixaPlanetMapping> = {
  'Xangô': {
    orixa: 'Xangô',
    planet: 'Sol',
    dia: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    elemento: 'Fogo',
    qualidade_energetica: 'Quente / Radiante',
    significado_espiritual: 'Justiça, lei cósmica, equilíbrio entre opostos. Governa a verdade e a ordem social.',
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    planet: 'Lua',
    dia: 'Segunda-feira',
    cores: ['Azul Escuro', 'Branco'],
    elemento: 'Água',
    qualidade_energetica: 'Fria / Receptiva',
    significado_espiritual: 'Maternidade divina, emoções profundas, intuição e ciclos. Protetora dos oceanos e da fertilidade.',
  },
  'Ogum': {
    orixa: 'Ogum',
    planet: 'Marte',
    dia: 'Terça-feira',
    cores: ['Azul Claro', 'Vermelho', 'Verde'],
    elemento: 'Fogo',
    qualidade_energetica: 'Quente / Ígnea',
    significado_espiritual: 'Guerra, conquista e inovação. Abre caminhos e preside sobre o ferro e as artes mecânicas.',
  },
  'Oxumaré': {
    orixa: 'Oxumaré',
    planet: 'Mercúrio',
    dia: 'Quarta-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde'],
    elemento: 'Ar / Água',
    qualidade_energetica: 'Neutra / Volátil',
    significado_espiritual: 'Ciclos cósmicos, renovação constante. A serpente arco-íris que une céu e terra.',
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    planet: 'Júpiter',
    dia: 'Quinta-feira',
    cores: ['Verde', 'Azul-turquesa'],
    elemento: 'Terra / Fogo',
    qualidade_energetica: 'Fria / Expansiva',
    significado_espiritual: 'Caça, abundância e prosperidade. Caçador visionário que busca a luz da verdade.',
  },
  'Oxum': {
    orixa: 'Oxum',
    planet: 'Vênus',
    dia: 'Sexta-feira / Sábado',
    cores: ['Rosa', 'Amarelo-ouro', 'Azul-celeste'],
    elemento: 'Água',
    qualidade_energetica: 'Fria / Magnética',
    significado_espiritual: 'Amor, beleza e riqueza. Dona das águas doces, do ouro e dos segredos divinos.',
  },
  'Omolu': {
    orixa: 'Omolu',
    planet: 'Saturno',
    dia: 'Segunda-feira',
    cores: ['Preto e Branco', 'Vermelho e Preto'],
    elemento: 'Terra',
    qualidade_energetica: 'Quente / Densa',
    significado_espiritual: 'Doenças e cura, transformação. Mestre das epidemias e senhor das terras cultivadas.',
  },
  'Nanã': {
    orixa: 'Nanã',
    planet: 'Saturno',
    dia: 'Segunda-feira',
    cores: ['Roxo', 'Branco', 'Azul-marinho'],
    elemento: 'Terra / Água',
    qualidade_energetica: 'Fria / Densa',
    significado_espiritual: 'Velhice, sabedoria ancestral, morte e renascimento. Mãe de todos os Orixás.',
  },
  'Iansã': {
    orixa: 'Iansã',
    planet: 'Marte',
    dia: 'Quarta-feira',
    cores: ['Vermelho', 'Laranja', 'Amarelo'],
    elemento: 'Ar / Fogo',
    qualidade_energetica: 'Quente / Volátil',
    significado_espiritual: 'Tempestades, ventos e relâmpagos. Guerreira feroz que abre caminhos e vence inimigos.',
  },
  'Obá': {
    orixa: 'Obá',
    planet: 'Vênus',
    dia: 'Sexta-feira',
    cores: ['Dourado', 'Laranja', 'Vermelho'],
    elemento: 'Fogo / Água',
    qualidade_energetica: 'Quente / Magnética',
    significado_espiritual: 'Guerra e amor, força e paixão. Preside o trabalho do ferro e a força do coração.',
  },
  'Ossaim': {
    orixa: 'Ossaim',
    planet: 'Mercúrio',
    dia: 'Quarta-feira',
    cores: ['Verde', 'Amarelo', 'Branco'],
    elemento: 'Terra / Ar',
    qualidade_energetica: 'Neutra / Vegetal',
    significado_espiritual: 'Senhor das folhas sagradas e das ervas medicinais. Guarda os segredos da cura natural.',
  },
  'Logunedé': {
    orixa: 'Logunedé',
    planet: 'Júpiter',
    dia: 'Quinta-feira',
    cores: ['Verde', 'Amarelo', 'Branco'],
    elemento: 'Água / Terra',
    qualidade_energetica: 'Morna / Harmônica',
    significado_espiritual: 'Caçador elegante, guerreiro e caçador. Unifica a energia de Oxóssi e Oxum.',
  },
  'Aeremi': {
    orixa: 'Aeremi',
    planet: 'Netuno',
    dia: 'Segunda-feira',
    cores: ['Azul-celeste', 'Branco', 'Prata'],
    elemento: 'Água',
    qualidade_energetica: 'Fria / Etérea',
    significado_espiritual: 'Ventos, mensagens celestiais e inspirado nos mestres. Transporta oração ao divino.',
  },
  'Inhana': {
    orixa: 'Inhana',
    planet: 'Plutão',
    dia: 'Terça-feira',
    cores: ['Vermelho-escuro', 'Preto', 'Azul-noturno'],
    elemento: 'Terra',
    qualidade_energetica: 'Quente / Transformadora',
    significado_espiritual: 'Guerreira da noite, metamorfose e regeneração. Desperta a força interior adormecida.',
  },
};
// Freeze the mapping object to prevent modifications
Object.freeze(ORIXA_PLANET_MAPPINGS);
// Freeze nested objects
Object.values(ORIXA_PLANET_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Normalize string for comparison (lowercase + accent removal)
 */
function normalizeString(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Get the orixá-to-planet correlation mapping
 * @param orixa - Orixá name (e.g., 'Xangô', 'Iemanjá', 'Ogum', 'xango')
 * @returns The correlation mapping or null if not found
 */
export function getOrixaPlanet(orixa: string): OrixaPlanetMapping | null {
  // First try direct key lookup
  if (orixa in ORIXA_PLANET_MAPPINGS) {
    return ORIXA_PLANET_MAPPINGS[orixa];
  }
  // Fallback: search by normalized display name (handles 'xango' -> 'Xangô')
  const normalized = normalizeString(orixa);
  for (const mapping of Object.values(ORIXA_PLANET_MAPPINGS)) {
    if (normalizeString(mapping.orixa) === normalized) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get the planet-to-orixá reverse correlation mapping
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte', 'mercurio')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetOrixa(planeta: string): OrixaPlanetMapping | null {
  const normalized = normalizeString(planeta);
  for (const mapping of Object.values(ORIXA_PLANET_MAPPINGS)) {
    if (normalizeString(mapping.planet) === normalized) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get all available orixá-planet mappings
 * @returns Array of all correlation mappings
 */
export function getAllOrixaPlanets(): OrixaPlanetMapping[] {
  return Object.values(ORIXA_PLANET_MAPPINGS);
}

/**
 * Get all orixá names
 * @returns Array of Orixá names
 */
export function getAllOrixas(): string[] {
  return Object.keys(ORIXA_PLANET_MAPPINGS);
}

/**
 * Check if an orixá exists in the mapping
 * @param orixa - Orixá name to check
 * @returns True if orixá exists in mapping
 */
export function hasOrixaPlanet(orixa: string): boolean {
  return orixa in ORIXA_PLANET_MAPPINGS;
}

/**
 * Get orixás filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter, etc.)
 * @returns Array of OrixaPlanetMapping matching the element
 */
export function getOrixasByElement(elemento: string): OrixaPlanetMapping[] {
  const normalizedElemento = normalizeString(elemento);
  return getAllOrixaPlanets().filter(mapping =>
    normalizeString(mapping.elemento).includes(normalizedElemento)
  );
}

/**
 * Get orixás filtered by planet
 * @param planeta - Planet name to filter by
 * @returns Array of OrixaPlanetMapping matching the planet
 */
export function getOrixasByPlanet(planeta: string): OrixaPlanetMapping[] {
  const normalizedPlaneta = normalizeString(planeta);
  return getAllOrixaPlanets().filter(mapping =>
    normalizeString(mapping.planet) === normalizedPlaneta
  );
}