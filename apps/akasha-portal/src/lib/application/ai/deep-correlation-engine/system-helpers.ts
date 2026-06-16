import type { UserSpiritualData } from '../types';
import type { SpiritualSource } from '../deep-correlation-engine';

// ============================================================
// ENERGY MAPPINGS
// ============================================================

export const SYSTEM_ENERGIES: Record<SpiritualSource, { primary: string; elements: string[]; qualities: string[] }> = {
  kabbalah: { primary: 'Divine Light', elements: ['fire', 'water', 'air', 'earth'], qualities: ['wisdom', 'compassion', 'mercy', 'severity'] },
  ifa: { primary: 'Ikin', elements: ['earth', 'air'], qualities: ['wisdom', 'truth', 'divination'] },
  candomble: { primary: 'Axé', elements: ['fire', 'water', 'earth', 'air'], qualities: ['vitality', 'ancestor_connection', 'nature_spirits'] },
  tarot: { primary: 'Elemental Forces', elements: ['fire', 'water', 'air', 'earth'], qualities: ['intuition', 'symbolism', 'fate'] },
  astrology: { primary: 'Cosmic Energy', elements: ['fire', 'earth', 'air', 'water'], qualities: ['celestial_influence', 'planetary_power'] },
  numerology: { primary: 'Vibrational Frequency', elements: ['odd', 'even'], qualities: ['essence', 'life_path'] },
};

// ============================================================
// SYSTEM DATA HELPERS
// ============================================================

/** Major Arcana 0–21 → canonical Portuguese name */
export function getTarotName(arcanaNum: number): string {
  const tarotNames: Record<number, string> = {
    0: 'O Louco', 1: 'O Mago', 2: 'A Alta Sacerdotisa', 3: 'A Imperatriz',
    4: 'O Imperador', 5: 'O Hierofante', 6: 'Os Enamorados', 7: 'O Carro',
    8: 'A Força', 9: 'O Eremita', 10: 'A Roda da Fortuna', 11: 'A Justiça',
    12: 'O Enforcado', 13: 'A Morte', 14: 'A Temperança', 15: 'O Diabo',
    16: 'A Torre', 17: 'A Estrela', 18: 'A Lua', 19: 'O Sol',
    20: 'O Julgamento', 21: 'O Mundo',
  };
  return tarotNames[arcanaNum] || `Arcana ${arcanaNum}`;
}

/** Whether the user has any data populated for the given spiritual system */
export function hasDataForSystem(userData: UserSpiritualData, system: SpiritualSource): boolean {
  switch (system) {
    case 'kabbalah':
      return (userData.sefirotDominante?.length ?? 0) > 0;
    case 'ifa':
      return userData.odu !== undefined;
    case 'candomble':
      return userData.orixaRegente !== undefined;
    case 'tarot':
      return (userData.arcoMaior?.length ?? 0) > 0;
    case 'astrology':
      return userData.sign !== undefined || userData.rashi !== undefined;
    case 'numerology':
      return userData.numeroPessoal !== undefined;
    default:
      return false;
  }
}

/** Targets (specific values) the system has for this user, used to enumerate correlations */
export function getSystemTargets(userData: UserSpiritualData, source: SpiritualSource): string[] {
  switch (source) {
    case 'kabbalah':
      return userData.sefirotDominante ?? [];
    case 'ifa':
      return userData.odu ? [userData.odu] : [];
    case 'candomble':
      return userData.orixaRegente ? [userData.orixaRegente] : [];
    case 'tarot':
      return userData.arcoMaior?.map(n => `Arcana ${n}`) ?? [];
    case 'astrology': {
      const targets: string[] = [];
      if (userData.sign) targets.push(userData.sign);
      if (userData.rashi) targets.push(userData.rashi);
      return targets;
    }
    case 'numerology':
      return userData.numeroPessoal ? [`Number ${userData.numeroPessoal}`] : [];
    default:
      return [];
  }
}

/** 0..1 multiplier that boosts correlation when the user has more complete system data */
export function getDataPresenceMultiplier(userData: UserSpiritualData, source: SpiritualSource, _target: string): number {
  let multiplier = 0.5;

  if (hasDataForSystem(userData, source)) {
    multiplier += 0.3;
  }

  switch (source) {
    case 'kabbalah':
      if (userData.sefirotDominante?.length === 1) multiplier += 0.2;
      break;
    case 'ifa':
      if (userData.odu) multiplier += 0.2;
      break;
    case 'candomble':
      if (userData.orixaRegente) multiplier += 0.2;
      break;
    case 'astrology':
      if (userData.sign || userData.rashi) multiplier += 0.2;
      break;
    case 'numerology':
      if (userData.numeroPessoal) multiplier += 0.2;
      break;
  }

  const otherSystems = getSystemTargets(userData, source);
  if (otherSystems.length > 0) {
    multiplier += 0.1;
  }

  return Math.min(1, multiplier);
}

/** Short label describing the shared energy between a source system and a target value */
export function findSharedEnergy(source: SpiritualSource, target: string): string {
  const sourceEnergies = SYSTEM_ENERGIES[source];

  if (target.includes('sefirot') || source === 'kabbalah') {
    return sourceEnergies.qualities[0];
  }
  if (target.includes('Arcana')) {
    return 'Mystical symbolism';
  }
  if (target.includes('Number') || source === 'numerology') {
    return 'Vibrational essence';
  }

  return sourceEnergies.primary || 'Spiritual energy';
}

// ============================================================
// HARMONY CALCULATIONS
// ============================================================

/** 0..1 harmony score for a single system given the user's data completeness */
export function calculateSystemHarmony(userData: UserSpiritualData, system: SpiritualSource): number {
  if (!hasDataForSystem(userData, system)) return 0;

  let harmony = 0.7;

  const targets = getSystemTargets(userData, system);
  if (targets.length === 1) {
    harmony += 0.15;
  } else if (targets.length >= 3) {
    harmony += 0.1;
  }

  const energies = SYSTEM_ENERGIES[system];
  if (energies.qualities.length > 0) {
    harmony += 0.05;
  }

  return Math.min(1, harmony);
}

/** 0..1 harmony score between two spiritual systems, based on known synergies */
export function calculatePairHarmony(_userData: UserSpiritualData, s1: SpiritualSource, s2: SpiritualSource): number {
  const baseHarmony = 0.5;

  const synergies: [SpiritualSource, SpiritualSource, number][] = [
    ['kabbalah', 'tarot', 0.8],
    ['kabbalah', 'numerology', 0.75],
    ['ifa', 'candomble', 0.85],
    ['astrology', 'tarot', 0.7],
    ['astrology', 'numerology', 0.65],
    ['candomble', 'astrology', 0.6],
  ];

  for (const [sys1, sys2, value] of synergies) {
    if ((s1 === sys1 && s2 === sys2) || (s1 === sys2 && s2 === sys1)) {
      return value;
    }
  }

  return baseHarmony;
}
