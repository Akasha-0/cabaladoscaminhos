/**
 * Zodiac-Sound Spiritual Correlation Module
 * Maps the 12 zodiac signs to their sacred sounds, healing frequencies, and musical notes.
 * Based on classical Western astrology integrated with sound healing traditions.
 */

import type { Signo } from './zodiac-signo';

/**
 * Complete zodiac sign to sound correlation mapping.
 * Each mapping includes the sign's ruling planet's sound, Solfeggio healing frequency,
 * and the most resonant musical note for that sign's energy.
 */
export interface ZodiacSound {
  /** Zodiac sign name in Portuguese */
  signo: Signo;
  /** Sign number in the zodiac cycle (1-12) */
  signo_numero: number;
  /** Associated sacred/frequency sound */
  som_sagrado: string;
  /** Healing frequency in Hertz (Solfeggio-based) */
  frequencia_cura: number;
  /** Musical note most resonant with this sign's energy */
  nota_musical: string;
  /** Element associated with the sign */
  elemento: string;
  /** Description of the sound healing properties */
  descricao: string;
}

/**
 * Map of all 12 zodiac signs with their spiritual sound correlations.
 * Frequencies are based on Solfeggio scale adapted to zodiac archetypes.
 * Each sign resonates with a specific frequency that can aid in healing
 * and balancing the qualities associated with that sign.
 */
const ZODIAC_SOUNDS: Record<Signo, ZodiacSound> = {
  Áries: {
    signo: 'Áries',
    signo_numero: 1,
    som_sagrado: 'RAM',
    frequencia_cura: 432,
    nota_musical: 'C#',
    elemento: 'Fogo',
    descricao: 'Som de coragem e iniciativa. Frequência da ação decisiva e pioneirismo.',
  },
  Touro: {
    signo: 'Touro',
    signo_numero: 2,
    som_sagrado: 'VAM',
    frequencia_cura: 396,
    nota_musical: 'D',
    elemento: 'Terra',
    descricao: 'Som de estabilidade e fartura. Frequência da conexão com a natureza e os sentidos.',
  },
  Gémeos: {
    signo: 'Gémeos',
    signo_numero: 3,
    som_sagrado: 'KAM',
    frequencia_cura: 417,
    nota_musical: 'D#',
    elemento: 'Ar',
    descricao: 'Som de comunicação e adaptabilidade. Frequência da mente curiosa e versátil.',
  },
  Câncer: {
    signo: 'Câncer',
    signo_numero: 4,
    som_sagrado: 'DAM',
    frequencia_cura: 528,
    nota_musical: 'E',
    elemento: 'Água',
    descricao: 'Som de proteção e nutrição emocional. Frequência do lar e da família.',
  },
  Leão: {
    signo: 'Leão',
    signo_numero: 5,
    som_sagrado: 'MAM',
    frequencia_cura: 639,
    nota_musical: 'F',
    elemento: 'Fogo',
    descricao: 'Som de criatividade e autoexpressão radiante. Frequência do coração generoso.',
  },
  Virgem: {
    signo: 'Virgem',
    signo_numero: 6,
    som_sagrado: 'PAM',
    frequencia_cura: 741,
    nota_musical: 'F#',
    elemento: 'Terra',
    descricao: 'Som de organização e serviço altruísta. Frequência da purificação e análise.',
  },
  Libra: {
    signo: 'Libra',
    signo_numero: 7,
    som_sagrado: 'TAM',
    frequencia_cura: 852,
    nota_musical: 'G',
    elemento: 'Ar',
    descricao: 'Som de harmonia e equilíbrio relacional. Frequência da justiça e diplomacia.',
  },
  Escorpião: {
    signo: 'Escorpião',
    signo_numero: 8,
    som_sagrado: 'SAM',
    frequencia_cura: 963,
    nota_musical: 'G#',
    elemento: 'Água',
    descricao: 'Som de transformação e regeneração profunda. Frequência da sabedoria oculta.',
  },
  Sagitário: {
    signo: 'Sagitário',
    signo_numero: 9,
    som_sagrado: 'NAM',
    frequencia_cura: 174,
    nota_musical: 'A',
    elemento: 'Fogo',
    descricao: 'Som de aventura e busca espiritual. Frequência da expansão e otimismo.',
  },
  Capricórnio: {
    signo: 'Capricórnio',
    signo_numero: 10,
    som_sagrado: 'SHAM',
    frequencia_cura: 285,
    nota_musical: 'A#',
    elemento: 'Terra',
    descricao: 'Som de disciplina e ambição estruturada. Frequência da perseverança e大师.',
  },
  Aquário: {
    signo: 'Aquário',
    signo_numero: 11,
    som_sagrado: 'HUM',
    frequencia_cura: 396,
    nota_musical: 'B',
    elemento: 'Ar',
    descricao: 'Som de inovação e fraternidade universal. Frequência da originalidade e humanitarismo.',
  },
  Peixes: {
    signo: 'Peixes',
    signo_numero: 12,
    som_sagrado: 'OM',
    frequencia_cura: 432,
    nota_musical: 'C',
    elemento: 'Água',
    descricao: 'Som de transcendência e conexão espiritual. Frequência da compaixão universal.',
  },
};

/**
 * Normalizes a sign name for lookup.
 * Handles variations in spelling, case, and common aliases.
 */
function normalizarSigno(signo: string): string {
  const normalizations: Record<string, string> = {
    'aries': 'Áries',
    'touro': 'Touro',
    'gemeos': 'Gémeos',
    'gêmeos': 'Gémeos',
    'cancer': 'Câncer',
    'leao': 'Leão',
    'leão': 'Leão',
    'virgem': 'Virgem',
    'libra': 'Libra',
    'escorpiao': 'Escorpião',
    'escorpião': 'Escorpião',
    'sagitario': 'Sagitário',
    'sagitário': 'Sagitário',
    'capricornio': 'Capricórnio',
    'capricórnio': 'Capricórnio',
    'aquario': 'Aquário',
    'aquário': 'Aquário',
    'peixes': 'Peixes',
  };

  const lowerSigno = signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalized = normalizations[lowerSigno];
  return normalized || signo;
}

/**
 * Retrieves the sound correlation mapping for a given zodiac sign.
 * @param signo - Sign name (e.g., "Áries", "Leão") or number as string
 * @returns ZodiacSound mapping or undefined if not found
 */
export function getZodiacSound(signo: string): ZodiacSound | undefined {
  if (!signo) return undefined;

  // Try exact match by sign name
  const exactMatch = ZODIAC_SOUNDS[signo as Signo];
  if (exactMatch) return exactMatch;

  // Try matching by sign number (e.g., "1", "12")
  const numMatch = parseInt(signo, 10);
  if (!isNaN(numMatch) && numMatch >= 1 && numMatch <= 12) {
    const signByNumber = Object.values(ZODIAC_SOUNDS).find(
      (z) => z.signo_numero === numMatch
    );
    if (signByNumber) return signByNumber;
  }

  // Try normalized match
  const normalizedSigno = normalizarSigno(signo);
  const normalizedMatch = ZODIAC_SOUNDS[normalizedSigno as Signo];
  if (normalizedMatch) return normalizedMatch;

  // Try partial match (e.g., "Ari", "Le")
  const lowerSigno = signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const partialMatch = Object.values(ZODIAC_SOUNDS).find(
    (z) => z.signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(lowerSigno)
  );
  if (partialMatch) return partialMatch;
  return undefined;
}

/**
 * Retrieves the zodiac sign associated with a given sacred sound or frequency.
 * @param som - Sacred sound (e.g., "RAM", "OM"), frequency in Hz, or musical note
 * @returns ZodiacSound mapping or undefined if not found
 */
export function getSoundZodiac(som: string | number): ZodiacSound | undefined {
  if (!som && som !== 0) return undefined;
  const somStr = String(som);
  const upperSom = somStr.toUpperCase();
  const lowerSom = somStr.toLowerCase();
  // Try exact match by sacred sound
  const bySacredSound = Object.values(ZODIAC_SOUNDS).find(
    (z) => z.som_sagrado.toUpperCase() === upperSom
  );
  if (bySacredSound) return bySacredSound;
  // Try match by frequency (as string or number)
  const freqNum = typeof som === 'number' ? som : parseFloat(somStr);
  if (!isNaN(freqNum)) {
    const byFrequency = Object.values(ZODIAC_SOUNDS).find(
      (z) => z.frequencia_cura === freqNum
    );
    if (byFrequency) return byFrequency;
  }

  // Try match by musical note
  const byNote = Object.values(ZODIAC_SOUNDS).find(
    (z) => z.nota_musical.toUpperCase() === upperSom
  );
  if (byNote) return byNote;

  // Try partial match
  const partialMatch = Object.values(ZODIAC_SOUNDS).find(
    (z) =>
      z.som_sagrado.toLowerCase().includes(lowerSom) ||
      z.nota_musical.toLowerCase().includes(lowerSom)
  );
  if (partialMatch) return partialMatch;

  return undefined;
}
/**
 * Get all zodiac sound mappings.
 * @returns Array of all ZodiacSound objects ordered by sign number
 */
export function getAllZodiacSounds(): ZodiacSound[] {
  return Object.values(ZODIAC_SOUNDS).sort((a, b) => a.signo_numero - b.signo_numero);
}