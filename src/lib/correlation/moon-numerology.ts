/**
 * Moon-Numerology Spiritual Correlation Module
 * Maps the 8 lunar phases to numerology numbers (1-9) with spiritual meanings
 * and elemental connections.
 * 
 * Based on Cabala dos Caminhos hermetic principles and lunar numerological alchemy.
 */

export type FaseLua = 
  | 'lua-nova'
  | 'lua-crescente'
  | 'quarto-crescente'
  | 'lua-cheia'
  | 'quarto-minguante'
  | 'lua-minguante'
  | 'quarto-descrescente'
  | 'lua-velha';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export interface MoonNumerologyMapping {
  fase: string;
  nome_fase: string;
  numero: number;
  numero_reduzido: number;
  elemento_primario: Elemento;
  elemento_secundario: Elemento;
  significado_espiritual: {
    palavra_chave: string;
    energia: string;
    manifestacao: string;
    lição_ciclica: string;
  };
  correlacao_numerologica: {
    arcanjo: string;
    planeta_exaltação: string;
    chakra: number;
    tarot_carta: string;
  };
}

/**
 * Complete mapping of lunar phases to numerology numbers and spiritual meanings.
 * Derived from lunar numerological alchemy and hermetic correspondences.
 */
export const MOON_NUMEROLOGY_MAPPINGS: Record<FaseLua, MoonNumerologyMapping> = {
  'lua-nova': {
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    numero: 1,
    numero_reduzido: 1,
    elemento_primario: 'Terra',
    elemento_secundario: 'Éter',
    significado_espiritual: {
      palavra_chave: 'Iniciação',
      energia: 'Potencial puro adormecido',
      manifestacao: 'Semente de toda criação',
      lição_ciclica: 'Novos começos exigem coragem de começar',
    },
    correlacao_numerologica: {
      arcanjo: 'Metatron',
      planeta_exaltação: 'Sol',
      chakra: 1,
      tarot_carta: 'O Mago',
    },
  },
  'lua-crescente': {
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    numero: 2,
    numero_reduzido: 2,
    elemento_primario: 'Água',
    elemento_secundario: 'Terra',
    significado_espiritual: {
      palavra_chave: 'Crescimento',
      energia: 'Nutrição e expansão vital',
      manifestacao: 'Broto que busca a luz',
      lição_ciclica: 'O crescimento pede paciência e confiança',
    },
    correlacao_numerologica: {
      arcanjo: 'Gabriel',
      planeta_exaltação: 'Lua',
      chakra: 2,
      tarot_carta: 'A Sacerdotisa',
    },
  },
  'quarto-crescente': {
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    numero: 3,
    numero_reduzido: 3,
    elemento_primario: 'Fogo',
    elemento_secundario: 'Ar',
    significado_espiritual: {
      palavra_chave: 'Ação',
      energia: 'Força transformadora em movimento',
      manifestacao: 'Chama que queima o que impede',
      lição_ciclica: 'A ação corretiva demanda coragem e discernimento',
    },
    correlacao_numerologica: {
      arcanjo: 'Samael',
      planeta_exaltação: 'Marte',
      chakra: 3,
      tarot_carta: 'A Imperatriz',
    },
  },
  'lua-cheia': {
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    numero: 4,
    numero_reduzido: 4,
    elemento_primario: 'Água',
    elemento_secundario: 'Éter',
    significado_espiritual: {
      palavra_chave: 'Culminação',
      energia: 'Plenitude e iluminação',
      manifestacao: 'Oceano de luz manifestada',
      lição_ciclica: 'A plenitude pede gratidão e generosidade',
    },
    correlacao_numerologica: {
      arcanjo: 'Rafael',
      planeta_exaltação: 'Júpiter',
      chakra: 4,
      tarot_carta: 'O Imperador',
    },
  },
  'quarto-minguante': {
    fase: 'quarto-minguante',
    nome_fase: 'Quarto Minguante',
    numero: 5,
    numero_reduzido: 5,
    elemento_primario: 'Ar',
    elemento_secundario: 'Fogo',
    significado_espiritual: {
      palavra_chave: 'Libertação',
      energia: 'Dissolução do que não serve',
      manifestacao: 'Vento que limpa e transforma',
      lição_ciclica: 'A libertação pede soltar com amor',
    },
    correlacao_numerologica: {
      arcanjo: 'Carmen',
      planeta_exaltação: 'Mercúrio',
      chakra: 5,
      tarot_carta: 'O Hierofante',
    },
  },
  'lua-minguante': {
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    numero: 6,
    numero_reduzido: 6,
    elemento_primario: 'Éter',
    elemento_secundario: 'Terra',
    significado_espiritual: {
      palavra_chave: 'Transmutação',
      energia: 'Dissolução no invisível',
      manifestacao: 'Fumaça que revela verdades ocultas',
      lição_ciclica: 'A transmutação pede fé no processo invisível',
    },
    correlacao_numerologica: {
      arcanjo: 'Azrael',
      planeta_exaltação: 'Saturno',
      chakra: 6,
      tarot_carta: 'Os Enamorados',
    },
  },
  'quarto-descrescente': {
    fase: 'quarto-descrescente',
    nome_fase: 'Quarto Descrescente',
    numero: 7,
    numero_reduzido: 7,
    elemento_primario: 'Terra',
    elemento_secundario: 'Água',
    significado_espiritual: {
      palavra_chave: 'Integração',
      energia: 'Consolidação do aprendizado',
      manifestacao: 'Raiz que absorve águas profundas',
      lição_ciclica: 'A integração pede perdão e sabedoria',
    },
    correlacao_numerologica: {
      arcanjo: 'Hamiel',
      planeta_exaltação: 'Netuno',
      chakra: 7,
      tarot_carta: 'O Carro',
    },
  },
  'lua-velha': {
    fase: 'lua-velha',
    nome_fase: 'Lua Velha',
    numero: 8,
    numero_reduzido: 8,
    elemento_primario: 'Éter',
    elemento_secundario: 'Ar',
    significado_espiritual: {
      palavra_chave: 'Renovação',
      energia: 'Ancestralidade e limiar',
      manifestacao: 'Portal entre mundos',
      lição_ciclica: 'A renovação pede despedida e confiança no renascimento',
    },
    correlacao_numerologica: {
      arcanjo: 'Azrael',
      planeta_exaltação: 'Plutão',
      chakra: 8,
      tarot_carta: 'A Justiça',
    },
  },
};

/**
 * Returns the complete moon-numerology mapping for a given lunar phase.
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonNumerologyMapping or null if phase not found
 */
export function getMoonNumerology(fase: string): MoonNumerologyMapping | null {
  const faseNormalizada = fase.toLowerCase().trim() as FaseLua;
  return MOON_NUMEROLOGY_MAPPINGS[faseNormalizada] || null;
}

/**
 * Get the numerology number for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The numerology number or null if not found
 */
export function getNumerologyMoon(fase: string): number | null {
  const mapping = getMoonNumerology(fase);
  return mapping?.numero || null;
}

/**
 * Get all moon-numerology mappings.
 * @returns Array of all MoonNumerologyMapping
 */
export function getAllMoonNumerology(): MoonNumerologyMapping[] {
  return Object.values(MOON_NUMEROLOGY_MAPPINGS);
}

/**
 * Get the lunar phase for a given numerology number.
 * @param numero - The numerology number (1-9)
 * @returns The MoonNumerologyMapping or null if not found
 */
export function getMoonByNumerology(numero: number): MoonNumerologyMapping | null {
  const mappings = getAllMoonNumerology();
  return mappings.find(m => m.numero === numero) || null;
}

/**
 * Get the primary element for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The primary element or null if not found
 */
export function getElementFromMoonNumerology(fase: string): Elemento | null {
  const mapping = getMoonNumerology(fase);
  return mapping?.elemento_primario || null;
}

/**
 * Get the secondary element for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The secondary element or null if not found
 */
export function getSecondaryElementFromMoonNumerology(fase: string): Elemento | null {
  const mapping = getMoonNumerology(fase);
  return mapping?.elemento_secundario || null;
}

/**
 * Get the spiritual meaning for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The spiritual meaning or null if not found
 */
export function getSpiritualMeaning(fase: string): MoonNumerologyMapping['significado_espiritual'] | null {
  const mapping = getMoonNumerology(fase);
  return mapping?.significado_espiritual || null;
}

/**
 * Get the numerological correlations for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The numerological correlations or null if not found
 */
export function getNumerologicalCorrelations(fase: string): MoonNumerologyMapping['correlacao_numerologica'] | null {
  const mapping = getMoonNumerology(fase);
  return mapping?.correlacao_numerologica || null;
}

/**
 * Get the chakra associated with a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The chakra number or null if not found
 */
export function getChakraFromMoon(fase: string): number | null {
  const mapping = getMoonNumerology(fase);
  return mapping?.correlacao_numerologica.chakra || null;
}

/**
 * Get the Tarot card associated with a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The Tarot card or null if not found
 */
export function getTarotFromMoon(fase: string): string | null {
  const mapping = getMoonNumerology(fase);
  return mapping?.correlacao_numerologica.tarot_carta || null;
}

/**
 * Get the Archangel associated with a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The Archangel or null if not found
 */
export function getArchangelFromMoon(fase: string): string | null {
  const mapping = getMoonNumerology(fase);
  return mapping?.correlacao_numerologica.arcanjo || null;
}

/**
 * Get all available lunar phases.
 * @returns Array of phase identifiers
 */
export function getAvailableMoonPhases(): FaseLua[] {
  return Object.keys(MOON_NUMEROLOGY_MAPPINGS) as FaseLua[];
}

/**
 * Get all moon phases associated with a specific element.
 * @param elemento - The element to filter by
 * @returns Array of MoonNumerologyMapping where the element is primary
 */
export function getMoonByElement(elemento: string): MoonNumerologyMapping[] {
  return getAllMoonNumerology().filter(
    m => m.elemento_primario === elemento
  );
}

/**
 * Get all moon phases associated with a specific chakra.
 * @param chakra - The chakra number (1-8)
 * @returns Array of MoonNumerologyMapping where the chakra matches
 */
export function getMoonByChakra(chakra: number): MoonNumerologyMapping[] {
  return getAllMoonNumerology().filter(
    m => m.correlacao_numerologica.chakra === chakra
  );
}
