/**
 * Zodiac Signo Spiritual Correlation
 * Maps each zodiac sign to its elemental, modal, planetary, and spiritual attributes.
 * Based on classical Western astrology integrated with the Cabala dos Caminhos system.
 */

import type { Elemento, Qualidade, Natureza } from './element-sign';

/** The twelve zodiac signs in Portuguese */
export type Signo =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
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
  | 'Plutão'
  | 'Júpiter'
  | 'Saturno'
  | 'Urano'
  | 'Neptuno';

/** Modalities (qualities) of the signs */
export type Modalidade = 'Cardinal' | 'Fixed' | 'Mutable';

/**
 * Complete sign-to-spiritual correlation mapping.
 * Each sign is classified by element, quality (modality), polarity (nature),
 * traditional planetary ruler, key characteristics, and spiritual meaning.
 */
export interface ZodiacSigno {
  /** Sign name in Portuguese */
  signo: Signo;
  /** Element classification (fogo, água, ar, terra) */
  elemento: Elemento;
  /** Modal quality (Cardinal = initiating, Fixed = stabilizing, Mutable = adapting) */
  modalidade: Modalidade;
  /** Polarity: Yang (active/expressive) or Yin (receptive/intuitive) */
  natureza: Natureza;
  /** Traditional planetary ruler */
  planeta_regente: PlanetaRegente;
  /** Key personality traits */
  caracteristicas: readonly string[];
  /** Spiritual meaning in the Cabala dos Caminhos system */
  significado_espiritual: string;
}

/**
 * Complete mapping of all 12 zodiac signs with their spiritual attributes.
 * Based on classical Western astrology integrated with Brazilian spiritual traditions.
 */
export const ZODIAC_SIGNO_MAPPINGS: Readonly<Record<Signo, ZodiacSigno>> = {
  /** Fogo - Cardinal - Yang - Marte - pioneiro, corajoso, líder natural */
  Áries: {
    signo: 'Áries',
    elemento: 'Fogo',
    modalidade: 'Cardinal',
    natureza: 'Yang',
    planeta_regente: 'Marte',
    caracteristicas: ['Pioneiro', 'Corajoso', 'Impulsivo', 'Energético', 'Independente', 'Competitivo'],
    significado_espiritual: 'O guerreiro cósmico que inicia novos ciclos. Representa o impulso primitivo de criação e a coragem de abrir novos caminhos. No contexto da Cabala, conecta-se ao Sephirah Geburah (Severidade) e ao Orixá Ogum, señor de los caminos y la justicia divina.',
  },
  /** Terra - Fixed - Yin - Vénus - estável, paciente, sensual, prático */
  Touro: {
    signo: 'Touro',
    elemento: 'Terra',
    modalidade: 'Fixed',
    natureza: 'Yin',
    planeta_regente: 'Vénus',
    caracteristicas: ['Estável', 'Paciente', 'Sensual', 'Prático', 'Determinado', 'Resistente'],
    significado_espiritual: 'O ancoradouro terreno que nutre e sustenta. Simboliza a abundância material e espiritual, a beleza sagrada e a conexão com a natureza. Relaciona-se ao Sephirah Venus (Beleza/Hod) e ao Orixá Oxum, señora del amor y la prosperidad.',
  },
  /** Ar - Mutable - Yang - Mercúrio - comunicativo, curioso, versátil, intelectual */
  Gémeos: {
    signo: 'Gémeos',
    elemento: 'Ar',
    modalidade: 'Mutable',
    natureza: 'Yang',
    planeta_regente: 'Mercúrio',
    caracteristicas: ['Comunicativo', 'Curioso', 'Versátil', 'Intelectual', 'Adaptável', 'Social'],
    significado_espiritual: 'A dualidade manifestada, o princípio da comunicação e do pensamento. Representa a mente em movimento, a aprendizagem constante e a capacidade de conectar opostos. No sistema cabalístico, conecta-se a Hod (Gloria) e ao Orixá Oxumaré.',
  },
  /** Água - Cardinal - Yin - Lua - emocional, intuitivo, protetor, doméstico */
  Câncer: {
    signo: 'Câncer',
    elemento: 'Água',
    modalidade: 'Cardinal',
    natureza: 'Yin',
    planeta_regente: 'Lua',
    caracteristicas: ['Emocional', 'Intuitivo', 'Protetor', 'Doméstico', 'Imaginativo', 'Caridoso'],
    significado_espiritual: 'A mãe cósmica, guardiã do lar e da memória ancestral. Simboliza a nutrição espiritual, a sensibilidade às ondas emocionais e a proteção dos vulneráveis. Conecta-se ao Sephirah Yesod (Fundación) e ao Orixá Iemanjá, madre de las aguas y la Fertilidad.',
  },
  /** Fogo - Fixed - Yang - Sol - criativo, generoso, magnânimo, líder */
  Leão: {
    signo: 'Leão',
    elemento: 'Fogo',
    modalidade: 'Fixed',
    natureza: 'Yang',
    planeta_regente: 'Sol',
    caracteristicas: ['Criativo', 'Generoso', 'Magnânimo', 'Orgulhoso', 'Confiante', 'Carismático'],
    significado_espiritual: 'O rei solar irradiando luz e poder. Representa a expressão do self, a creatividad dramatica y el brillo personal. No contexto da Cabala, conecta-se a Tiphereth (Belleza/Discordia) y al Orixá Xangô, señor del rayo y la justicia.',
  },
  /** Terra - Mutable - Yin - Mercúrio - analítico, detalhista, útil, puro */
  Virgem: {
    signo: 'Virgem',
    elemento: 'Terra',
    modalidade: 'Mutable',
    natureza: 'Yin',
    planeta_regente: 'Mercúrio',
    caracteristicas: ['Analítico', 'Detalhista', 'Útil', 'Puro', 'Modesto', 'Organizado'],
    significado_espiritual: 'A servidora sagrada que busca a perfeição através do serviço. Simboliza a purificação, o análisis методичный y el trabajo discreto. Conecta-se ao Sephirah Netzach (Victoria) y al Orixá Oxóssi, señor de la caza y la sabiduría.',
  },
  /** Ar - Cardinal - Yang - Vénus - harmonioso, diplomatico, justo, social */
  Libra: {
    signo: 'Libra',
    elemento: 'Ar',
    modalidade: 'Cardinal',
    natureza: 'Yang',
    planeta_regente: 'Vénus',
    caracteristicas: ['Harmonioso', 'Diplomático', 'Justo', 'Social', 'Romântico', 'Indeciso'],
    significado_espiritual: 'A balança cósmica que busca o equilibrio entre opuestos. Representa la armonía, la justicia social y la capacidad de ver múltiples perspectivas. En el sistema cabalístico, conecta-se a Chesed (Misericordia) y al Orixá Oxalá, padre de la paz y la pureza.',
  },
  /** Água - Fixed - Yin - Plutão - intenso, transformação, oculto, profundo */
  Escorpião: {
    signo: 'Escorpião',
    elemento: 'Água',
    modalidade: 'Fixed',
    natureza: 'Yin',
    planeta_regente: 'Plutão',
    caracteristicas: ['Intenso', 'Transformador', 'Oculto', 'Profundo', 'Passionado', 'Vingativo'],
    significado_espiritual: 'El escorpión que renace de sus cenizas. Simboliza la transformación radical, los misterios ocultos y la muerte y resurrección espiritual. En la Cabala, conecta-se a Netzach (Victoria) y al Orixá Oxumaré, señor de los ciclos y la regeneración.',
  },
  /** Fogo - Mutable - Yang - Júpiter - filosofico, otimista, aventureiro, expansive */
  Sagitário: {
    signo: 'Sagitário',
    elemento: 'Fogo',
    modalidade: 'Mutable',
    natureza: 'Yang',
    planeta_regente: 'Júpiter',
    caracteristicas: ['Filosófico', 'Otimista', 'Aventureiro', 'Expansivo', 'Honesto', 'Impaciente'],
    significado_espiritual: 'O arqueiro que dispara hacia la verdad suprema. Representa la búsqueda de significado, la expansión de la consciencia y la conexión con lo divino. Conecta-se ao Sephirah Chesed (Misericordia) y al Orixá Oxóssi, senhor da sabedoria e da abundância.',
  },
  /** Terra - Cardinal - Yin - Saturno - ambicioso, disciplinado, responsável, paciente */
  Capricórnio: {
    signo: 'Capricórnio',
    elemento: 'Terra',
    modalidade: 'Cardinal',
    natureza: 'Yin',
    planeta_regente: 'Saturno',
    caracteristicas: ['Ambicioso', 'Disciplinado', 'Responsável', 'Paciente', 'Pragmático', 'Frío'],
    significado_espiritual: 'El cabrón que escala la montaña de la réussite. Simboliza la disciplina, la estructura y la conquista de las alturas através del esfuerzo. Conecta-se ao Sephirah Binah (Entendimiento) y al Orixá Omolu, señor de la enfermedad y la sanación.',
  },
  /** Ar - Fixed - Yang - Urano - humanitário, original, independiente, rebelde */
  Aquário: {
    signo: 'Aquário',
    elemento: 'Ar',
    modalidade: 'Fixed',
    natureza: 'Yang',
    planeta_regente: 'Urano',
    caracteristicas: ['Humanitário', 'Original', 'Independente', 'Rebelde', 'Progressista', 'Detached'],
    significado_espiritual: 'El portador de agua cósmica que derrama luz sobre la humanidad. Representa la iluminación collective, la originalidad y la conexión com el todo. En el sistema cabalístico, conecta-se a Chokmah (Sabiduría) y al Orixá Nanã, señora de la sabiduría antigua.',
  },
  /** Água - Mutable - Yin - Neptuno - compassivo, sonhador, artístico, intuitivo */
  Peixes: {
    signo: 'Peixes',
    elemento: 'Água',
    modalidade: 'Mutable',
    natureza: 'Yin',
    planeta_regente: 'Neptuno',
    caracteristicas: ['Compassivo', 'Sonhador', 'Artístico', 'Intuitivo', 'Espiritual', 'Vulnerável'],
    significado_espiritual: 'Los peces nadando em águas trascendentales. Simboliza la unify com lo divino, la compasión universal y la capacidade de dissolver los límites del ego. Conecta-se ao Sephirah Kether (Corona) y al Orixá Iemanjá, mãe das águas eternas.',
  },
} as const;

/**
 * Returns the complete zodiac-signo mapping for a given sign name.
 *
 * @param signo - The sign name to look up
 * @returns The ZodiacSigno mapping or null if not found
 */
export function getZodiacSigno(signo: string): ZodiacSigno | null {
  const normalized = normalizarSigno(signo);
  const standard = NORMALIZED_TO_SIGNO[normalized];
  return standard ? ZODIAC_SIGNO_MAPPINGS[standard] ?? null : null;
}

/**
 * Returns the element of a given sign.
 *
 * @param signo - The sign name to look up
 * @returns The element type or null if not found
 */
export function getSignoElemento(signo: string): Elemento | null {
  return getZodiacSigno(signo)?.elemento ?? null;
}

/**
 * Returns the modality (quality) of a given sign.
 *
 * @param signo - The sign name to look up
 * @returns The modality or null if not found
 */
export function getSignoModalidade(signo: string): Modalidade | null {
  return getZodiacSigno(signo)?.modalidade ?? null;
}

/**
 * Returns the nature (polarity) of a given sign.
 *
 * @param signo - The sign name to look up
 * @returns The nature or null if not found
 */
export function getSignoNatureza(signo: string): Natureza | null {
  return getZodiacSigno(signo)?.natureza ?? null;
}

/**
 * Returns the planetary ruler of a given sign.
 *
 * @param signo - The sign name to look up
 * @returns The planetary ruler or null if not found
 */
export function getSignoPlaneta(signo: string): PlanetaRegente | null {
  return getZodiacSigno(signo)?.planeta_regente ?? null;
}

/**
 * Returns the key characteristics of a given sign.
 *
 * @param signo - The sign name to look up
 * @returns Array of characteristics or null if not found
 */
export function getSignoCaracteristicas(signo: string): readonly string[] | null {
  return getZodiacSigno(signo)?.caracteristicas ?? null;
}

/**
 * Returns the spiritual meaning of a given sign.
 *
 * @param signo - The sign name to look up
 * @returns The spiritual meaning or null if not found
 */
export function getSignoSignificado(signo: string): string | null {
  return getZodiacSigno(signo)?.significado_espiritual ?? null;
}

/**
 * Returns all signs belonging to a given element.
 *
 * @param elemento - The element to filter by
 * @returns Array of signs belonging to the element
 */
export function getSignosByElemento(elemento: string): Signo[] {
  return (Object.keys(ZODIAC_SIGNO_MAPPINGS) as Signo[]).filter(
    (signo) => ZODIAC_SIGNO_MAPPINGS[signo].elemento === elemento
  );
}

/**
 * Returns all signs of a given modality.
 *
 * @param modalidade - The modality to filter by
 * @returns Array of signs with the modality
 */
export function getSignosByModalidade(modalidade: string): Signo[] {
  return (Object.keys(ZODIAC_SIGNO_MAPPINGS) as Signo[]).filter(
    (signo) => ZODIAC_SIGNO_MAPPINGS[signo].modalidade === modalidade
  );
}

/**
 * Returns all signs ruled by a given planet.
 *
 * @param planeta - The planet to filter by
 * @returns Array of signs ruled by the planet
 */
export function getSignosByPlaneta(planeta: string): Signo[] {
  return (Object.keys(ZODIAC_SIGNO_MAPPINGS) as Signo[]).filter(
    (signo) => ZODIAC_SIGNO_MAPPINGS[signo].planeta_regente === planeta
  );
}

/**
 * Returns all signs with Yang (active) nature.
 *
 * @returns Array of Yang signs
 */
export function getSignosYang(): Signo[] {
  return (Object.keys(ZODIAC_SIGNO_MAPPINGS) as Signo[]).filter(
    (signo) => ZODIAC_SIGNO_MAPPINGS[signo].natureza === 'Yang'
  );
}

/**
 * Returns all signs with Yin (receptive) nature.
 *
 * @returns Array of Yin signs
 */
export function getSignosYin(): Signo[] {
  return (Object.keys(ZODIAC_SIGNO_MAPPINGS) as Signo[]).filter(
    (signo) => ZODIAC_SIGNO_MAPPINGS[signo].natureza === 'Yin'
  );
}

/**
 * Returns all zodiac-signo mappings.
 *
 * @returns Array of all ZodiacSigno mappings
 */
export function getAllSignos(): ZodiacSigno[] {
  return Object.values(ZODIAC_SIGNO_MAPPINGS);
}

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarSigno(signo: string): string {
  return signo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
const NORMALIZED_TO_SIGNO: Readonly<Record<string, Signo>> = {
  áries: 'Áries',
  aries: 'Áries',
  touro: 'Touro',
  gémeos: 'Gémeos',
  gemeos: 'Gémeos',
  gemeus: 'Gémeos',
  câncer: 'Câncer',
  cancer: 'Câncer',
  caranguejo: 'Câncer',
  leão: 'Leão',
  leon: 'Leão',
  leao: 'Leão',
  virgem: 'Virgem',
  libra: 'Libra',
  balança: 'Libra',
  escorpião: 'Escorpião',
  escorpiao: 'Escorpião',
  sagitário: 'Sagitário',
  sagitario: 'Sagitário',
  capricórnio: 'Capricórnio',
  capricornio: 'Capricórnio',
  aquário: 'Aquário',
  aquario: 'Aquário',
  peixes: 'Peixes',
};