/**
 * Planet-Sound Spiritual Correlation Module
 * Maps classical planets to their sacred sounds, healing frequencies, and musical correspondences.
 * Based on classical Western astrology integrated with sound healing traditions.
 */

import type { PlanetQualidadeEnergetica } from './planet-chakra';

/**
 * Types of planetary sounds
 */
export type PlanetSomType = 
  | 'Solar'      // Sol
  | 'Lunar'      // Lua
  | 'Martial'    // Marte
  | 'Mercurial'  // Mercúrio
  | 'Jovian'     // Júpiter
  | 'Venusian'   // Vênus
  | 'Saturnian'; // Saturno

/**
 * Complete planet to sound correlation mapping.
 * Each mapping includes the planet's sacred sound/mantra, Solfeggio healing frequency,
 * musical note, and spiritual description.
 */
export interface PlanetSound {
  /** Planet name in Portuguese */
  planeta: string;
  /** Planet number (traditional order: 1-7) */
  planeta_numero: number;
  /** Associated sacred sound or mantra */
  som_sagrado: string;
  /** Healing frequency in Hertz (Solfeggio-based) */
  frequencia_hz: number;
  /** Musical note most resonant with this planet's energy */
  nota_musical: string;
  /** Element associated with the planet */
  elemento: string;
  /** Energetic quality classification */
  qualidade_energetica: PlanetQualidadeEnergetica;
  /** Description of the sound healing properties */
  descricao: string;
  /** Chakra correspondence for sound healing */
  chakra_correspondencia: string;
}

/**
 * Map of all 7 classical planets with their spiritual sound correlations.
 * Frequencies are based on Solfeggio scale adapted to planetary archetypes.
 * Each planet resonates with a specific frequency that can aid in healing
 * and balancing the qualities associated with that planetary energy.
 */
const PLANET_SOUNDS: Record<string, PlanetSound> = {
  Sol: {
    planeta: 'Sol',
    planeta_numero: 1,
    som_sagrado: 'RAM',
    frequencia_hz: 528,
    nota_musical: 'E',
    elemento: 'Fogo',
    qualidade_energetica: 'Quente / Radiante',
    descricao: 'Som da luz interior e propósito divino. Frequência da transformação e criação miracles.',
    chakra_correspondencia: 'Sahasrara (7º - Coronário)',
  },
  Lua: {
    planeta: 'Lua',
    planeta_numero: 2,
    som_sagrado: 'OM',
    frequencia_hz: 852,
    nota_musical: 'A',
    elemento: 'Água',
    qualidade_energetica: 'Fria / Receptiva',
    descricao: 'Som da intuição e receptividade lunar. Frequência da conexão com o inconsciente.',
    chakra_correspondencia: 'Muladhara (1º - Básico)',
  },
  Marte: {
    planeta: 'Marte',
    planeta_numero: 3,
    som_sagrado: 'VAM',
    frequencia_hz: 432,
    nota_musical: 'D',
    elemento: 'Fogo',
    qualidade_energetica: 'Quente / Radiante',
    descricao: 'Som de coragem e força vital. Frequência da ação decisiva e transmutação.',
    chakra_correspondencia: 'Svadhisthana (2º - Sacro)',
  },
  Mercúrio: {
    planeta: 'Mercúrio',
    planeta_numero: 4,
    som_sagrado: 'AUM',
    frequencia_hz: 741,
    nota_musical: 'F#',
    elemento: 'Ar',
    qualidade_energetica: 'Neutra / Volátil',
    descricao: 'Som da comunicação e mentalidade clara. Frequência da expressão e abertura de caminhos.',
    chakra_correspondencia: 'Manipura (3º - Plexo Solar)',
  },
  Júpiter: {
    planeta: 'Júpiter',
    planeta_numero: 5,
    som_sagrado: 'HAM',
    frequencia_hz: 396,
    nota_musical: 'G',
    elemento: 'Fogo / Água',
    qualidade_energetica: 'Fria / Expansiva',
    descricao: 'Som da expansão e sabedoria. Frequência da libertação de medos e expansão espiritual.',
    chakra_correspondencia: 'Anahata (4º - Cardíaco)',
  },
  Vênus: {
    planeta: 'Vênus',
    planeta_numero: 6,
    som_sagrado: 'YAM',
    frequencia_hz: 639,
    nota_musical: 'G#',
    elemento: 'Água',
    qualidade_energetica: 'Fria / Receptiva',
    descricao: 'Som do amor e harmonia. Frequência da reconciliação e conexão divina.',
    chakra_correspondencia: 'Anahata (4º - Cardíaco)',
  },
  Saturno: {
    planeta: 'Saturno',
    planeta_numero: 7,
    som_sagrado: 'DUM',
    frequencia_hz: 963,
    nota_musical: 'C',
    elemento: 'Terra',
    qualidade_energetica: 'Quente / Densa',
    descricao: 'Som da disciplite e proteção espiritual. Frequência da conexão com o divino.',
    chakra_correspondencia: 'Muladhara (1º - Básico)',
  },
};

/**
 * Normalizes a planet name for lookup.
 * Handles variations in spelling, case, and common aliases.
 */
function normalizePlanetName(planeta: string): string {
  const normalized = planeta.toLowerCase().trim();
  
  const aliases: Record<string, string> = {
    'sol': 'Sol',
    'lua': 'Lua',
    'marte': 'Marte',
    'mercurio': 'Mercúrio',
    'mercúrio': 'Mercúrio',
    'jupiter': 'Júpiter',
    'júpiter': 'Júpiter',
    'venus': 'Vênus',
    'vénus': 'Vênus',
    'saturno': 'Saturno',
  };
  
  return aliases[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Retrieves the sound correlation mapping for a given planet.
 * @param planeta - Planet name (e.g., "Sol", "Lua", "Marte") or number as string
 * @returns PlanetSound mapping or undefined if not found
 */
export function getPlanetSound(planeta: string): PlanetSound | undefined {
  if (!planeta) return undefined;
  
  // Check if it's a number (planet number)
  const num = parseInt(planeta, 10);
  if (!isNaN(num) && num >= 1 && num <= 7) {
    const entries = Object.entries(PLANET_SOUNDS);
    const found = entries.find(([, mapping]) => mapping.planeta_numero === num);
    return found?.[1];
  }
  
  const normalized = normalizePlanetName(planeta);
  return PLANET_SOUNDS[normalized];
}

/**
 * Retrieves the planet associated with a given sacred sound or frequency.
 * @param som - Sacred sound (e.g., "RAM", "OM", "AUM"), frequency in Hz, or musical note
 * @returns PlanetSound mapping or undefined if not found
 */
export function getSoundPlanet(som: string | number): PlanetSound | undefined {
  if (!som && som !== 0) return undefined;
  
  const somStr = String(som).toLowerCase().trim();
  
  // Check by frequency (number or string number)
  if (typeof som === 'number' || (!isNaN(parseFloat(somStr)) && isFinite(parseFloat(somStr)))) {
    const freq = typeof som === 'number' ? som : parseFloat(somStr);
    const found = Object.values(PLANET_SOUNDS).find(p => p.frequencia_hz === freq);
    if (found) return found;
  }
  
  // Check by sacred sound
  const foundBySound = Object.values(PLANET_SOUNDS).find(
    p => p.som_sagrado.toLowerCase() === somStr
  );
  if (foundBySound) return foundBySound;
  
  // Check by musical note
  const foundByNote = Object.values(PLANET_SOUNDS).find(
    p => p.nota_musical.toLowerCase() === somStr || p.nota_musical.toLowerCase().replace('#', 'sharp') === somStr
  );
  if (foundByNote) return foundByNote;
  
  return undefined;
}

/**
 * Get all planet-sound mappings.
 * @returns Array of all PlanetSound objects ordered by planet number
 */
export function getAllPlanetSounds(): PlanetSound[] {
  return Object.values(PLANET_SOUNDS).sort((a, b) => a.planeta_numero - b.planeta_numero);
}

export default {
  getPlanetSound,
  getSoundPlanet,
  getAllPlanetSounds,
};