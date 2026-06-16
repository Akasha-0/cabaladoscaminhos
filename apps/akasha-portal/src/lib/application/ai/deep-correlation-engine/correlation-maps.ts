import type { SpiritualSource } from '../deep-correlation-engine';

// ============================================================
// COMPREHENSIVE SPIRITUAL SYSTEM CORRELATIONS
// ============================================================

// Life Path Number to Zodiac Sign correlations
export const LIFE_PATH_ZODIAC_MAP: Record<number, string[]> = {
  1: ['Aries', 'Leo', 'Sagittarius'],
  2: ['Taurus', 'Libra', 'Capricorn'],
  3: ['Gemini', 'Libra', 'Aquarius'],
  4: ['Cancer', 'Virgo', 'Scorpio'],
  5: ['Aries', 'Sagittarius', 'Aquarius'],
  6: ['Taurus', 'Libra', 'Pisces'],
  7: ['Cancer', 'Scorpio', 'Pisces'],
  8: ['Capricorn', 'Taurus', 'Virgo'],
  9: ['Aries', 'Scorpio', 'Sagittarius'],
  11: ['Pisces', 'Cancer', 'Libra'],
  22: ['Capricorn', 'Aquarius', 'Aries'],
};

// Major Arcana to Orixás correlation
export const TAROT_ORIXA_MAP: Record<number, string[]> = {
  0: ['Oxum'],
  1: ['Iemanjá'],
  2: ['Obatalá'],
  3: ['Oxum'],
  4: ['Ogum'],
  5: ['Oxossi'],
  6: ['Omulu'],
  7: ['Ogum'],
  8: ['Obatalá'],
  9: ['Oxumar'],
  10: ['Eshu'],
  11: ['Eshu'],
  12: ['Oxum'],
  13: ['Omulu'],
  14: ['Ogun'],
  15: ['Ogun'],
  16: ['Oxalufa'],
  17: ['Iemanjá'],
  18: ['Oxum'],
  19: ['Oloxum'],
  20: ['Oxalufa'],
  21: ['Olodumare'],
};

// Odú to Kabbalah Sephirot paths — canonical names from constants/odus.ts
export const ODU_SEPHIROT_MAP: Record<string, string[]> = {
  'Ogbe': ['Keter', 'Chokhmah'],
  'Ejiokô': ['Binah', 'Daat'],
  'Etogundá': ['Chokhmah', 'Keter'],
  'Irosun': ['Gevurah', 'Chesed'],
  'Oxê': ['Netzach', 'Hod'],
  'Obará': ['Chesed', 'Gevurah'],
  'Odi': ['Malkuth', 'Yesod'],
  'Ejionile': ['Netzach', 'Hod'],
  'Ossá': ['Hod', 'Yesod'],
  'Ofun': ['Tipheret', 'Malkuth'],
  'Owarin': ['Din', 'Gevurah'],
  'Ejilaxebô': ['Tipheret', 'Yesod'],
  'Oturupon': ['Malkuth', 'Yesod'],
  'Oturá': ['Netzach', 'Hod'],
  'Iká': ['Malkuth'],
  'Ofurufu': ['Keter', 'Tipheret'],
};

// Odú to Orixá mapping (Candomblé)
export const ODU_ORIXA_MAP: Record<number, string[]> = {
  1: ['Omulu'],
  2: ['Ogum'],
  3: ['Obatalá'],
  4: ['Oxumar'],
  5: ['Oxossi'],
  6: ['Omulu'],
  7: ['Ogum'],
  8: ['Obatalá'],
  9: ['Oxumar'],
  10: ['Eshu'],
  11: ['Eshu'],
  12: ['Oxum'],
  13: ['Omulu'],
  14: ['Ogun'],
  15: ['Ogun'],
  16: ['Oxalufa'],
  17: ['Iemanjá'],
  18: ['Oxum'],
  19: ['Oloxum'],
  20: ['Oxalufa'],
  21: ['Olodumare'],
};

// Tarot to Chakra correlations
export const TAROT_CHAKRA_MAP: Record<number, string> = {
  0: 'Ajna',
  1: 'Sahasrara',
  2: 'Anahata',
  3: 'Manipura',
  4: 'Vishuddha',
  5: 'Anahata',
  6: 'Muladhara',
  7: 'Svadhisthana',
  8: 'Ajna',
  9: 'Manipura',
  10: 'Muladhara',
  11: 'Ajna',
  12: 'Vishuddha',
  13: 'Anahata',
  14: 'Manipura',
  15: 'Ajna',
  16: 'Sahasrara',
  17: 'Ajna',
  18: 'Sahasrara',
  19: 'Vishuddha',
  20: 'Anahata',
  21: 'Sahasrara',
};

// Chakra to 5 Elements mapping
export const CHAKRA_ELEMENT_MAP: Record<string, string> = {
  'Muladhara': 'Terra',
  'Svadhisthana': 'Água',
  'Manipura': 'Fogo',
  'Anahata': 'Ar',
  'Vishuddha': 'Éter',
  'Ajna': 'Luz',
  'Sahasrara': 'Vazio',
};

// Planet to Orixá regents mapping
export const PLANET_ORIXA_MAP: Record<string, string> = {
  'Sol': 'Oxum',
  'Lua': 'Iemanjá',
  'Mercúrio': 'Oxossi',
  'Vênus': 'Oxum',
  'Marte': 'Ogum',
  'Júpiter': 'Olodumare',
  'Saturno': 'Omulu',
  'Urano': 'Oxumar',
  'Netuno': 'Iemanjá',
  'Plutão': 'Ogun',
};

// Day of week to spiritual energy mapping
export const DAY_ENERGY_MAP: Record<string, { energy: string; orixa: string; element: string; practice: string }> = {
  'Domingo': { energy: 'Solar', orixa: 'Oxum', element: 'Fogo', practice: 'Oração solar, banhos de luz' },
  'Segunda-feira': { energy: 'Lunar', orixa: 'Iemanjá', element: 'Água', practice: 'Meditação aquática, oferendas de água' },
  'Terça-feira': { energy: 'Marcial', orixa: 'Ogum', element: 'Fogo', practice: 'Trabalho com ferro, proteção' },
  'Quarta-feira': { energy: 'Mercurial', orixa: 'Oxossi', element: 'Ar', practice: 'Caça espiritual, busca de conhecimento' },
  'Quinta-feira': { energy: 'Joviana', orixa: 'Olodumare', element: 'Éter', practice: 'Orações de bênção, gratidão' },
  'Sexta-feira': { energy: 'Vênus', orixa: 'Oxum', element: 'Terra', practice: 'Rituais de amor, autoconhecimento' },
  'Sábado': { energy: 'Saturniana', orixa: 'Omulu', element: 'Terra', practice: 'Trabalho de cura, limpeza espiritual' },
};

// Sephirot to Planet mapping
export const SEPHIROT_PLANET_MAP: Record<string, string> = {
  'Keter': 'Sem planeta',
  'Chokhmah': 'Sem planeta',
  'Binah': 'Saturno',
  'Chesed': 'Júpiter',
  'Gevurah': 'Marte',
  'Tipheret': 'Sol',
  'Netzach': 'Vênus',
  'Hod': 'Mercúrio',
  'Yesod': 'Lua',
  'Malkuth': 'Terra',
};

// Sephirot to Astrology Sign mapping
export const SEPHIROT_SIGN_MAP: Record<string, string> = {
  'Keter': 'Nenhum',
  'Chokhmah': 'Aries',
  'Binah': 'Capricornio',
  'Chesed': 'Sagitário',
  'Gevurah': 'Escorpião',
  'Tipheret': 'Leão',
  'Netzach': 'Touro',
  'Hod': 'Gêmeos',
  'Yesod': 'Câncer',
  'Malkuth': 'Virgem',
};

// Sephirot to Orixá mapping
export const SEPHIROT_ORIXA_MAP: Record<string, string> = {
  'Keter': 'Olodumare',
  'Chokhmah': 'Oxossi',
  'Binah': 'Omulu',
  'Chesed': 'Obatalá',
  'Gevurah': 'Ogum',
  'Tipheret': 'Oxum',
  'Netzach': 'Oxum',
  'Hod': 'Oxossi',
  'Yesod': 'Iemanjá',
  'Malkuth': 'Obatalá',
};

// ============================================================
// CORRELATION MATRIX
// ============================================================

export function calculateBaseCorrelation(source: SpiritualSource, target: string): number {
  const correlations: Record<string, Record<string, number>> = {
    kabbalah: {
      sefirot: 0.9,
      orixa: 0.6,
      numerology: 0.7,
      tarot: 0.8,
      astrology: 0.5,
    },
    ifa: {
      odu: 0.9,
      orixa: 0.85,
      astrology: 0.5,
      tarot: 0.4,
    },
    candomble: {
      orixa: 0.9,
      ifa: 0.85,
      ancestors: 0.7,
      tarot: 0.3,
    },
    tarot: {
      major_arcana: 0.85,
      numerology: 0.75,
      astrology: 0.7,
      kabbalah: 0.8,
    },
    astrology: {
      planets: 0.9,
      signs: 0.85,
      houses: 0.8,
      numerology: 0.6 as number,
      tarot: 0.7,
    },
    numerology: {
      life_path: 0.9,
      personal_number: 0.85,
      kabbalah: 0.7,
      tarot: 0.75,
    },
  };

  return correlations[source]?.[target] ?? 0.3;
}
