/**
 * Sound-Zodiac Spiritual Correlation Module
 * Maps sacred sounds and mantras to zodiac signs with healing frequencies.
 * Based on ancient sound healing traditions integrated with Western astrology.
 */

import type { Signo } from './zodiac-signo';

/**
 * Complete sound-to-zodiac correlation mapping.
 * Each mapping includes the sacred sound/mantra, associated zodiac sign,
 * elemental connection, and healing properties.
 */
export interface SoundZodiac {
  /** Sacred sound or mantra */
  som: string;
  /** Sanskrit/ritual pronunciation */
  pronunciacao: string;
  /** Associated zodiac sign in Portuguese */
  signo: Signo;
  /** Sign number in the zodiac cycle (1-12) */
  signo_numero: number;
  /** Element associated with this sound-sign correlation */
  elemento: string;
  /** Healing frequency in Hertz */
  frequencia_healing: number;
  /** Chakra alignment for this sound */
  chakra: string;
  /** Healing properties and spiritual benefits */
  propriedades_cura: string[];
  /** Primary intention for this sound practice */
  intencao_primaria: string;
  /** Description of the sound-zodiac relationship */
  descricao: string;
}

/**
 * Map of all sacred sounds/mantras with their zodiac correlations.
 * Each sound resonates with a specific sign's energy and can be used
 * for healing and spiritual alignment with that zodiac archetype.
 */
const SOUND_ZODIACS: Record<string, SoundZodiac> = {
  RAM: {
    som: 'RAM',
    pronunciacao: 'Raam',
    signo: 'Áries',
    signo_numero: 1,
    elemento: 'Fogo',
    frequencia_healing: 432,
    chakra: 'Raiz (Muladhara)',
    propriedades_cura: [
      'Fortalecimento da vontade',
      'Superamento de medos',
      'Energia vital e coragem',
      'Proteção contra energias negativas',
    ],
    intencao_primaria: 'Coragem e ação',
    descricao: 'Mantra de proteção e força vital. Ativa a energia de Áries para superação de obstáculos.',
  },
  VAM: {
    som: 'VAM',
    pronunciacao: 'Vaam',
    signo: 'Touro',
    signo_numero: 2,
    elemento: 'Terra',
    frequencia_healing: 396,
    chakra: 'Sacro (Svadhisthana)',
    propriedades_cura: [
      'Estabilidade emocional',
      'Conexão com os sentidos',
      'Abundância e prosperidade',
      'Relaxamento profundo',
    ],
    intencao_primaria: 'Abundância e prazer',
    descricao: 'Mantra de fartura e conexão terrena. Alinha com a energia estável de Touro.',
  },
  KAM: {
    som: 'KAM',
    pronunciacao: 'Kaam',
    signo: 'Gémeos',
    signo_numero: 3,
    elemento: 'Ar',
    frequencia_healing: 417,
    chakra: 'Plexo Solar (Manipura)',
    propriedades_cura: [
      'clareza mental',
      'Comunicação clara',
      'Flexibilidade intelectual',
      'Alívio da ansiedade',
    ],
    intencao_primaria: 'Comunicação e mente',
    descricao: 'Mantra da mente curiosa. Abre os canais de comunicação de Gémeos.',
  },
  DAM: {
    som: 'DAM',
    pronunciacao: 'Daam',
    signo: 'Câncer',
    signo_numero: 4,
    elemento: 'Água',
    frequencia_healing: 528,
    chakra: 'Cardíaco (Anahata)',
    propriedades_cura: [
      'Proteção emocional',
      'Cura de feridas emocionais',
      'Conexão com ancestrais',
      'Nutrição da alma',
    ],
    intencao_primaria: 'Proteção e lar',
    descricao: 'Mantra de proteção do lar interior. Cura as emoções sensíveis de Câncer.',
  },
  MAM: {
    som: 'MAM',
    pronunciacao: 'Maam',
    signo: 'Leão',
    signo_numero: 5,
    elemento: 'Fogo',
    frequencia_healing: 639,
    chakra: 'Cardíaco (Anahata)',
    propriedades_cura: [
      'Autoestima e confiança',
      'Expressão criativa',
      'Abertura do coração',
      'Liderança natural',
    ],
    intencao_primaria: 'Criatividade e coração',
    descricao: 'Mantra do coração radiante. Desperta a criatividade soberana de Leão.',
  },
  PAM: {
    som: 'PAM',
    pronunciacao: 'Paam',
    signo: 'Virgem',
    signo_numero: 6,
    elemento: 'Terra',
    frequencia_healing: 741,
    chakra: 'Garganta (Vishuddha)',
    propriedades_cura: [
      'Purificação mental',
      'Ordem e organização',
      'Análise clara',
      'Serviço altruísta',
    ],
    intencao_primaria: 'Pureza e serviço',
    descricao: 'Mantra de purificação e discernimento. Alinha com a energia analítica de Virgem.',
  },
  TAM: {
    som: 'TAM',
    pronunciacao: 'Taam',
    signo: 'Libra',
    signo_numero: 7,
    elemento: 'Ar',
    frequencia_healing: 852,
    chakra: 'Terceiro Olho (Ajna)',
    propriedades_cura: [
      'Harmonia relacional',
      'Equilíbrio emocional',
      'Justiça e diplomacia',
      'Beleza e arte',
    ],
    intencao_primaria: 'Harmonia e justiça',
    descricao: 'Mantra do equilíbrio e da paz. Restaura a harmonia nas relações de Libra.',
  },
  SAM: {
    som: 'SAM',
    pronunciacao: 'Saam',
    signo: 'Escorpião',
    signo_numero: 8,
    elemento: 'Água',
    frequencia_healing: 963,
    chakra: 'Coroa (Sahasrara)',
    propriedades_cura: [
      'Transformação profunda',
      'Regeneração emocional',
      'Cura de traumas',
      'Sabedoria oculta',
    ],
    intencao_primaria: 'Transformação e regeneração',
    descricao: 'Mantra de morte e renascimento. Ativa a transformação profunda de Escorpião.',
  },
  NAM: {
    som: 'NAM',
    pronunciacao: 'Naam',
    signo: 'Sagitário',
    signo_numero: 9,
    elemento: 'Fogo',
    frequencia_healing: 174,
    chakra: 'Plexo Solar (Manipura)',
    propriedades_cura: [
      'Expansão espiritual',
      'Otimismo e esperança',
      'Busca de verdades',
      'Aventura interior',
    ],
    intencao_primaria: 'Expansão e sabedoria',
    descricao: 'Mantra da busca espiritual. Abre portas para a expansão de Sagitário.',
  },
  SHAM: {
    som: 'SHAM',
    pronunciacao: 'Shaam',
    signo: 'Capricórnio',
    signo_numero: 10,
    elemento: 'Terra',
    frequencia_healing: 285,
    chakra: 'Raiz (Muladhara)',
    propriedades_cura: [
      'Disciplina e perseverança',
      'Estrutura e objetivo',
      'Superacao de obstáculos',
      'Maturidade espiritual',
    ],
    intencao_primaria: 'Disciplina e conquista',
    descricao: 'Mantra da disciplina conquistadora. Fortalece a ambição estruturada de Capricórnio.',
  },
  HUM: {
    som: 'HUM',
    pronunciacao: 'Hoong',
    signo: 'Aquário',
    signo_numero: 11,
    elemento: 'Ar',
    frequencia_healing: 396,
    chakra: 'Terceiro Olho (Ajna)',
    propriedades_cura: [
      'Inovação e originalidade',
      'Fraternidade universal',
      'Libertação de padrões',
      'Humanitarismo',
    ],
    intencao_primaria: 'Inovação e fraternidade',
    descricao: 'Mantra da liberdade mental. Desperta a consciência humanitária de Aquário.',
  },
  OM: {
    som: 'OM',
    pronunciacao: 'Aum',
    signo: 'Peixes',
    signo_numero: 12,
    elemento: 'Água',
    frequencia_healing: 432,
    chakra: 'Coroa (Sahasrara)',
    propriedades_cura: [
      'Transcendência espiritual',
      'Conexão cósmica',
      'Compaixão universal',
      'Liberdade do ego',
    ],
    intencao_primaria: 'Transcendência e compaixão',
    descricao: 'Mantra supremo de transcendência. Abre a porta para a consciência universal de Peixes.',
  },
};

/**
 * Normalizes a sound/mantra for lookup.
 * Handles variations in spelling, case, and transliteration.
 */
function normalizarSom(som: string): string {
  const normalizations: Record<string, string> = {
    'ram': 'RAM',
    'vam': 'VAM',
    'kam': 'KAM',
    'dam': 'DAM',
    'mam': 'MAM',
    'pam': 'PAM',
    'tam': 'TAM',
    'sam': 'SAM',
    'nam': 'NAM',
    'sham': 'SHAM',
    'hum': 'HUM',
    'om': 'OM',
    'aum': 'OM',
    'ohm': 'OM',
  };

  const lowerSom = som.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalizations[lowerSom] || som.toUpperCase();
}

/**
 * Retrieves the sound-zodiac correlation for a given sacred sound or mantra.
 * @param som - Sacred sound (e.g., "RAM", "OM") or frequency in Hz
 * @returns SoundZodiac mapping or undefined if not found
 */
export function getSoundZodiac(som: string | number): SoundZodiac | undefined {
  if (!som && som !== 0) return undefined;

  const somStr = String(som);
  const upperSom = somStr.toUpperCase();
  const lowerSom = somStr.toLowerCase();

  // Try exact match by sacred sound
  const exactMatch = SOUND_ZODIACS[upperSom];
  if (exactMatch) return exactMatch;

  // Try normalized match
  const normalizedSom = normalizarSom(somStr);
  const normalizedMatch = SOUND_ZODIACS[normalizedSom];
  if (normalizedMatch) return normalizedMatch;

  // Try match by frequency (as string or number)
  const freqNum = typeof som === 'number' ? som : parseFloat(somStr);
  if (!isNaN(freqNum)) {
    const byFrequency = Object.values(SOUND_ZODIACS).find(
      (s) => s.frequencia_healing === freqNum
    );
    if (byFrequency) return byFrequency;
  }

  // Try partial match
  const partialMatch = Object.values(SOUND_ZODIACS).find(
    (s) =>
      s.som.toLowerCase().includes(lowerSom) ||
      s.pronunciacao.toLowerCase().includes(lowerSom)
  );
  if (partialMatch) return partialMatch;

  return undefined;
}

/**
 * Retrieves the sacred sound associated with a given zodiac sign.
 * @param signo - Sign name (e.g., "Áries", "Leão") or number as string
 * @returns SoundZodiac mapping or undefined if not found
 */
export function getZodiacSound(signo: string): SoundZodiac | undefined {
  if (!signo) return undefined;

  // Try exact match by sign name
  const bySigno = Object.values(SOUND_ZODIACS).find(
    (s) => s.signo === signo
  );
  if (bySigno) return bySigno;

  // Try matching by sign number (e.g., "1", "12")
  const numMatch = parseInt(signo, 10);
  if (!isNaN(numMatch) && numMatch >= 1 && numMatch <= 12) {
    const signByNumber = Object.values(SOUND_ZODIACS).find(
      (s) => s.signo_numero === numMatch
    );
    if (signByNumber) return signByNumber;
  }

  // Try normalized/partial match
  const lowerSigno = signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const partialMatch = Object.values(SOUND_ZODIACS).find(
    (s) =>
      s.signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(lowerSigno) ||
      lowerSigno.includes(s.signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );
  if (partialMatch) return partialMatch;

  return undefined;
}

/**
 * Get all sound-zodiac mappings.
 * @returns Array of all SoundZodiac objects ordered by sign number
 */
export function getAllSoundZodiacs(): SoundZodiac[] {
  return Object.values(SOUND_ZODIACS).sort((a, b) => a.signo_numero - b.signo_numero);
}
