/**
 * Planet-Orixá Correlation Mapping
 * Based on IDEIA.md Tabela de Correspondência Macro
 * Aligns classical planets with their Candomblé/Umbanda Orixá rulers
 */

export interface PlanetOrixaMapping {
  /** Classical planet name (Portuguese) */
  planet: string;
  /** Primary Orixá ruler */
  orixa: string;
  /** Sacred day(s) of the week */
  dia: string;
  /** Traditional colors */
  cores: string[];
  /** Elemental correspondence */
  elemento: string;
  /** Energetic quality classification */
  qualidade_energetica: string;
}

// ─── Planet-to-Orixá Mapping ──────────────────────────────────────────────────

export const PLANET_ORIXA_MAPPINGS: Record<string, PlanetOrixaMapping> = {
  Sol: {
    planet: 'Sol',
    orixa: 'Xangô',
    dia: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    elemento: 'Fogo',
    qualidade_energetica: 'Quente / Radiante',
  },
  Lua: {
    planet: 'Lua',
    orixa: 'Iemanjá',
    dia: 'Segunda-feira',
    cores: ['Azul Escuro', 'Branco'],
    elemento: 'Água',
    qualidade_energetica: 'Fria / Receptiva',
  },
  Marte: {
    planet: 'Marte',
    orixa: 'Ogum',
    dia: 'Terça-feira',
    cores: ['Azul Claro', 'Vermelho', 'Verde'],
    elemento: 'Fogo',
    qualidade_energetica: 'Quente / Ígnea',
  },
  Mercurio: {
    planet: 'Mercúrio',
    orixa: 'Oxumaré',
    dia: 'Quarta-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde'],
    elemento: 'Ar / Água',
    qualidade_energetica: 'Neutra / Volátil',
  },
  Jupiter: {
    planet: 'Júpiter',
    orixa: 'Oxóssi',
    dia: 'Quinta-feira',
    cores: ['Verde', 'Azul-turquesa'],
    elemento: 'Terra / Fogo',
    qualidade_energetica: 'Fria / Expansiva',
  },
  Venus: {
    planet: 'Vênus',
    orixa: 'Oxum',
    dia: 'Sexta-feira / Sábado',
    cores: ['Rosa', 'Amarelo-ouro', 'Azul-celeste'],
    elemento: 'Água',
    qualidade_energetica: 'Fria / Magnética',
  },
  Saturno: {
    planet: 'Saturno',
    orixa: 'Omolu',
    dia: 'Segunda-feira',
    cores: ['Preto e Branco', 'Vermelho e Preto'],
    elemento: 'Terra',
    qualidade_energetica: 'Quente / Densa',
  },
};
// Freeze the mapping object to prevent modifications
Object.freeze(PLANET_ORIXA_MAPPINGS);
// Freeze nested objects
Object.values(PLANET_ORIXA_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the planet-to-orixá correlation mapping
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetOrixa(planeta: string): PlanetOrixaMapping | null {
  return PLANET_ORIXA_MAPPINGS[planeta] ?? null;
}

/**
 * Get all available planet-orixá mappings
 * @returns Array of all correlation mappings
 */
export function getAllPlanetOrixaMappings(): PlanetOrixaMapping[] {
  return Object.values(PLANET_ORIXA_MAPPINGS);
}

/**
 * Get all planet names
 * @returns Array of planet names
 */
export function getAllPlanets(): string[] {
  return Object.keys(PLANET_ORIXA_MAPPINGS);
}

/**
 * Check if a planet exists in the mapping
 * @param planeta - Planet name to check
 * @returns True if planet exists in mapping
 */
export function hasPlanetOrixa(planeta: string): boolean {
  return planeta in PLANET_ORIXA_MAPPINGS;
}