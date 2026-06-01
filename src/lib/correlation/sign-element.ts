/**
 * Sign-Element Spiritual Correlation
 * Maps each zodiac sign to its elemental, modal, and directional attributes.
 * Based on classical Western astrology and the Cabala dos Caminhos system.
 */

import type { Elemento, Qualidade, Natureza } from './element-sign';

/** The twelve zodiac signs */
export type Signo =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Caranguejo'
  | 'Leão'
  | 'Virgem'
  | 'Balança'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

/** Traditional planetary rulers for each sign */
export type PlanetaRegente =
  | 'Marte'
  | 'Vénus'
  | 'Mercúrio'
  | 'Lua'
  | 'Sol'
  | 'Mercúrio'
  | 'Vénus'
  | 'Plutão'
  | 'Júpiter'
  | 'Saturno'
  | 'Urano'
  | 'Neptuno';

/** Cardinal directions associated with each sign */
export type Direcao = 'Norte' | 'Sul' | 'Leste' | 'Oeste';

/**
 * Complete sign-to-element mapping with all astrological attributes.
 * Each sign is classified by element, quality (modality), polarity (nature),
 * traditional planetary ruler, and cardinal direction.
 */
export interface SignElement {
  /** Sign name */
  signo: Signo;
  /** Element classification */
  elemento: Elemento;
  /** Modal quality (Cardinal = initiating, Fixed = stabilizing, Mutable = adapting) */
  qualidade: Qualidade;
  /** Polarity: Yang (active/expressive) or Yin (receptive/receptive) */
  natureza: Natureza;
  /** Traditional planetary ruler */
  planeta_regente: PlanetaRegente;
  /** Associated cardinal direction */
  direcao: Direcao;
}

/**
 * Complete mapping of all 12 zodiac signs with their spiritual attributes.
 * Based on classical Western astrology with traditional rulers.
 */
export const SIGN_ELEMENT_MAPPINGS: Readonly<Record<Signo, SignElement>> = {
  /** Fogo - Cardinal - Yang - Marte - Sul */
  Áries: {
    signo: 'Áries',
    elemento: 'Fogo',
    qualidade: 'Cardinal',
    natureza: 'Yang',
    planeta_regente: 'Marte',
    direcao: 'Sul',
  },
  /** Terra - Fixed - Yin - Vénus - Norte */
  Touro: {
    signo: 'Touro',
    elemento: 'Terra',
    qualidade: 'Fixed',
    natureza: 'Yin',
    planeta_regente: 'Vénus',
    direcao: 'Norte',
  },
  /** Ar - Mutable - Yang - Mercúrio - Leste */
  Gémeos: {
    signo: 'Gémeos',
    elemento: 'Ar',
    qualidade: 'Mutable',
    natureza: 'Yang',
    planeta_regente: 'Mercúrio',
    direcao: 'Leste',
  },
  /** Água - Cardinal - Yin - Lua - Oeste */
  Caranguejo: {
    signo: 'Caranguejo',
    elemento: 'Água',
    qualidade: 'Cardinal',
    natureza: 'Yin',
    planeta_regente: 'Lua',
    direcao: 'Oeste',
  },
  /** Fogo - Fixed - Yang - Sol - Sul */
  Leão: {
    signo: 'Leão',
    elemento: 'Fogo',
    qualidade: 'Fixed',
    natureza: 'Yang',
    planeta_regente: 'Sol',
    direcao: 'Sul',
  },
  /** Terra - Mutable - Yin - Mercúrio - Norte */
  Virgem: {
    signo: 'Virgem',
    elemento: 'Terra',
    qualidade: 'Mutable',
    natureza: 'Yin',
    planeta_regente: 'Mercúrio',
    direcao: 'Norte',
  },
  /** Ar - Cardinal - Yang - Vénus - Leste */
  Balança: {
    signo: 'Balança',
    elemento: 'Ar',
    qualidade: 'Cardinal',
    natureza: 'Yang',
    planeta_regente: 'Vénus',
    direcao: 'Leste',
  },
  /** Água - Fixed - Yin - Plutão - Oeste */
  Escorpião: {
    signo: 'Escorpião',
    elemento: 'Água',
    qualidade: 'Fixed',
    natureza: 'Yin',
    planeta_regente: 'Plutão',
    direcao: 'Oeste',
  },
  /** Fogo - Mutable - Yang - Júpiter - Sul */
  Sagitário: {
    signo: 'Sagitário',
    elemento: 'Fogo',
    qualidade: 'Mutable',
    natureza: 'Yang',
    planeta_regente: 'Júpiter',
    direcao: 'Sul',
  },
  /** Terra - Cardinal - Yin - Saturno - Norte */
  Capricórnio: {
    signo: 'Capricórnio',
    elemento: 'Terra',
    qualidade: 'Cardinal',
    natureza: 'Yin',
    planeta_regente: 'Saturno',
    direcao: 'Norte',
  },
  /** Ar - Fixed - Yang - Urano - Leste */
  Aquário: {
    signo: 'Aquário',
    elemento: 'Ar',
    qualidade: 'Fixed',
    natureza: 'Yang',
    planeta_regente: 'Urano',
    direcao: 'Leste',
  },
  /** Água - Mutable - Yin - Neptuno - Oeste */
  Peixes: {
    signo: 'Peixes',
    elemento: 'Água',
    qualidade: 'Mutable',
    natureza: 'Yin',
    planeta_regente: 'Neptuno',
    direcao: 'Oeste',
  },
} as const;

/**
 * Returns the complete sign-element mapping for a given sign name.
 *
 * @param signo - Name of the zodiac sign (case-insensitive)
 * @returns SignElement mapping or null if sign not found
 *
 * @example
 * getSignElement('Áries')?.elemento // 'Fogo'
 * getSignElement('Escorpião')?.planeta_regente // 'Plutão'
 */
export function getSignElement(signo: string): SignElement | null {
  const normalized = normalizarSigno(signo);
  const standard = NORMALIZED_TO_SIGNO[normalized];
  return standard ? SIGN_ELEMENT_MAPPINGS[standard] ?? null : null;
}

/**
 * Returns the element of a given sign.
 *
 * @param signo - Name of the zodiac sign
 * @returns Element name or null if sign not found
 */
export function getSignElementType(signo: string): Elemento | null {
  return getSignElement(signo)?.elemento ?? null;
}

/**
 * Returns the quality (modality) of a given sign.
 *
 * @param signo - Name of the zodiac sign
 * @returns Quality or null if sign not found
 */
export function getSignQuality(signo: string): Qualidade | null {
  return getSignElement(signo)?.qualidade ?? null;
}

/**
 * Returns the nature (polarity) of a given sign.
 *
 * @param signo - Name of the zodiac sign
 * @returns Nature ('Yang' or 'Yin') or null if sign not found
 */
export function getSignNature(signo: string): Natureza | null {
  return getSignElement(signo)?.natureza ?? null;
}

/**
 * Returns the planetary ruler of a given sign.
 *
 * @param signo - Name of the zodiac sign
 * @returns Planet name or null if sign not found
 */
export function getSignRuler(signo: string): PlanetaRegente | null {
  return getSignElement(signo)?.planeta_regente ?? null;
}

/**
 * Returns the cardinal direction of a given sign.
 *
 * @param signo - Name of the zodiac sign
 * @returns Direction or null if sign not found
 */
export function getSignDirection(signo: string): Direcao | null {
  return getSignElement(signo)?.direcao ?? null;
}

/**
 * Returns all signs belonging to a given element.
 *
 * @param elemento - Element name (Fogo, Terra, Ar, Água)
 * @returns Array of signs for that element
 */
export function getSignsByElement(elemento: string): Signo[] {
  return (Object.keys(SIGN_ELEMENT_MAPPINGS) as Signo[]).filter(
    (signo) => getSignElement(signo)?.elemento === elemento
  );
}

/**
 * Returns all signs of a given quality.
 *
 * @param qualidade - Quality name (Cardinal, Fixed, Mutable)
 * @returns Array of signs with that quality
 */
export function getSignsByQuality(qualidade: string): Signo[] {
  return (Object.keys(SIGN_ELEMENT_MAPPINGS) as Signo[]).filter(
    (signo) => getSignElement(signo)?.qualidade === qualidade
  );
}

/**
 * Returns all signs ruled by a given planet.
 *
 * @param planeta - Planet name
 * @returns Array of signs ruled by that planet
 */
export function getSignsByRuler(planeta: string): Signo[] {
  return (Object.keys(SIGN_ELEMENT_MAPPINGS) as Signo[]).filter(
    (signo) => getSignElement(signo)?.planeta_regente === planeta
  );
}

/**
 * Returns all signs associated with a given direction.
 *
 * @param direcao - Cardinal direction (Norte, Sul, Leste, Oeste)
 * @returns Array of signs with that direction
 */
export function getSignsByDirection(direcao: string): Signo[] {
  return (Object.keys(SIGN_ELEMENT_MAPPINGS) as Signo[]).filter(
    (signo) => getSignElement(signo)?.direcao === direcao
  );
}

/**
 * Returns all signs with Yang (active) nature.
 *
 * @returns Array of Yang signs
 */
export function getYangSigns(): Signo[] {
  return (Object.keys(SIGN_ELEMENT_MAPPINGS) as Signo[]).filter(
    (signo) => getSignElement(signo)?.natureza === 'Yang'
  );
}

/**
 * Returns all signs with Yin (receptive) nature.
 *
 * @returns Array of Yin signs
 */
export function getYinSigns(): Signo[] {
  return (Object.keys(SIGN_ELEMENT_MAPPINGS) as Signo[]).filter(
    (signo) => getSignElement(signo)?.natureza === 'Yin'
  );
}

/**
 * Returns all sign-element mappings.
 *
 * @returns Array of all SignElement mappings
 */
export function getAllSignElements(): SignElement[] {
  return Object.values(SIGN_ELEMENT_MAPPINGS);
}

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents and case.
 */
function normalizarSigno(signo: string): string {
  return signo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/caranguejo/g, 'caranguejo')
    .replace(/peixes/g, 'peixes');
}

// Lookup map for normalized to standard name
const NORMALIZED_TO_SIGNO: Readonly<Record<string, Signo>> = {
  aries: 'Áries',
  touro: 'Touro',
  gemeos: 'Gémeos',
  gemeus: 'Gémeos',
  cancer: 'Caranguejo',
  caranguejo: 'Caranguejo',
  leao: 'Leão',
  leon: 'Leão',
  virgem: 'Virgem',
  balanca: 'Balança',
  escorpiao: 'Escorpião',
  sagitario: 'Sagitário',
  capricornio: 'Capricórnio',
  aquario: 'Aquário',
  peixes: 'Peixes',
};