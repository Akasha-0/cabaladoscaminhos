/**
 * Zodiac-Tarot Spiritual Correlation Module
 * Maps zodiac signs to Tarot Major Arcana cards with elemental and spiritual connections.
 * Source: Cabala dos Caminhos spiritual system
 */

import type { SignoZodiac } from './zodiac-element';

/**
 * Represents the correlation between a zodiac sign and its Tarot arcano
 */
export interface ZodiacTarotMapping {
  /** Zodiac sign name in Portuguese */
  signo: SignoZodiac;
  /** Associated Major Arcana card name in Portuguese */
  arcano: string;
  /** Card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Element associated with this sign-arcano correlation */
  elemento: string;
  /** Core spiritual meaning of this sign-arcano combination */
  significado_espiritual: string;
}

/**
 * Complete mapping of the 12 zodiac signs to their Tarot Major Arcana correspondences.
 * Based on ancient esoteric traditions integrated with the Cabala dos Caminhos system.
 * Each sign carries the archetypal energy of its corresponding arcano.
 */
export const ZODIAC_TAROT_MAP: Record<SignoZodiac, ZodiacTarotMapping> = {
  /** Fogo - O Guerreiro que Conquista */
  Áries: {
    signo: 'Áries',
    arcano: 'O Imperador',
    numero_carta: 4,
    elemento: 'Fogo',
    significado_espiritual: 'Liderança marcial, pioneirismo espiritual, força de vontade, comando sobre o caos, estruturação da energia vital em direção ao propósito. O arcano do imperador representa a autoridade interior que Áries manifesta através da ação direta e coragem.',
  },
  /** Terra - A Mãe Nutridora */
  Touro: {
    signo: 'Touro',
    arcano: 'A Imperatriz',
    numero_carta: 3,
    elemento: 'Terra',
    significado_espiritual: 'Fertilidade espiritual, abundância material e emocional, sensualidade sagrada, conexão com a natureza, manifestação da beleza interior. A imperatriz representa a energia maternal que Touro encarna na nutrição do corpo, mente e espírito.',
  },
  /** Ar - O Comunicador Dual */
  Gémeos: {
    signo: 'Gémeos',
    arcano: 'Os Enamorados',
    numero_carta: 6,
    elemento: 'Ar',
    significado_espiritual: 'Escolha entre polaridades, integração dos opostos, comunicação sagrada, dualidade transcendida, amor como decisão espiritual. Os Enamorados representam a necessidade de Gémeos de harmonizar as múltiplas facetas da mente e do coração.',
  },
  /** Água - O Guardião do Lar */
  Câncer: {
    signo: 'Câncer',
    arcano: 'A Lua',
    numero_carta: 18,
    elemento: 'Água',
    significado_espiritual: 'Intuição profunda, emoções fluidas, memória ancestral, proteção do espaço sagrado interior, ciclos emocionais, mundo inconsciente. A Lua representa as águas emocionais que Câncer navega com sensibilidade e percepção além do véu.',
  },
  /** Fogo - O Rei Criativo */
  Leão: {
    signo: 'Leão',
    arcano: 'O Sol',
    numero_carta: 19,
    elemento: 'Fogo',
    significado_espiritual: 'Vitalidade irradiante, propósito de vida, brilho próprio, amor próprio autêntico, criatividade solar, liderança magnética. O Sol representa a luz interior que León irradia para iluminar o caminho dos outros com generosidade e autenticidade.',
  },
  /** Terra - O Discernidor Perfeito */
  Virgem: {
    signo: 'Virgem',
    arcano: 'A Torre',
    numero_carta: 16,
    elemento: 'Terra',
    significado_espiritual: 'Purificação necessária, destruição das ilusões de perfeição, transformação através da análise, renascimento espiritual, libertação dos padrões de autocrítica. A Torre representa a catarse que purifica Virgem das crenças limitantes sobre si mesma.',
  },
  /** Ar - O Equilibrador das Balanças */
  Libra: {
    signo: 'Libra',
    arcano: 'A Justiça',
    numero_carta: 11,
    elemento: 'Ar',
    significado_espiritual: 'Equilíbrio cósmico, harmonia relacional, verdade interior, decisão sagrada, integridade, lei divina que equilibra ações e consequências. A Justiça representa a busca de Libra pela harmonia através do discernimento e da equidade.',
  },
  /** Água - O Transformador Profundo */
  Escorpião: {
    signo: 'Escorpião',
    arcano: 'A Morte',
    numero_carta: 13,
    elemento: 'Água',
    significado_espiritual: 'Regeneração profunda, transformação essencial, renascimento, poder pessoal, investigação dos mistérios ocultos, transcendência do ego. A Morte representa a jornada de Escorpião através das águas profundas da transformação onde o antigo self morre para renascer.',
  },
  /** Fogo - O Filosofo Busca-Verdade */
  Sagitário: {
    signo: 'Sagitário',
    arcano: 'O Hierofante',
    numero_carta: 5,
    elemento: 'Fogo',
    significado_espiritual: 'Sabedoria sagrada, expansão da consciência, tradição espiritual, busca da verdade, filosofia de vida, ensino e iniciação. O Hierofante representa o mestre interior que Sagitário busca para expandir sua compreensão do divino e transmitir ensinamentos.',
  },
  /** Terra - O Arquitecto do Destino */
  Capricórnio: {
    signo: 'Capricórnio',
    arcano: 'O Diabo',
    numero_carta: 15,
    elemento: 'Terra',
    significado_espiritual: 'Estruturação do poder pessoal, domínio das paixões, materialização de objetivos, superação de limitações autopostas, disciplina interior. O Diabo representa a energia de Capricórnio que transforma ambiciónedra em realizações concretas através da vontade focada.',
  },
  /** Ar - O Revoluciário do Pensamento */
  Aquário: {
    signo: 'Aquário',
    arcano: 'A Estrela',
    numero_carta: 17,
    elemento: 'Ar',
    significado_espiritual: 'Esperança restaurada, pensamento humanitário, liberdade mental, inovação espiritual, uniqueness collectif, serviço à humanidade. A Estrela representa a luz que Aquário irradia como farol de esperança e renovação para a coletividade.',
  },
  /** Água - O Místico Unicversitário */
  Peixes: {
    signo: 'Peixes',
    arcano: 'O Eremita',
    numero_carta: 9,
    elemento: 'Água',
    significado_espiritual: 'Iluminação interior, solitude sagrada, sabedoria da escuridão, intuição transcendente, dissolução do ego, união com o divino. O Eremita representa a jornada de Peixes através da interioridade profunda onde a sabedoria é encontrada no silêncio.',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ZODIAC_TAROT_MAP);
Object.values(ZODIAC_TAROT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 12 zodiac signs
 */
export const TODOS_SIGNOS_ZODIAC_TAROT: readonly SignoZodiac[] = Object.freeze([
  'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
]);

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarSigno(signo: string): SignoZodiac | null {
  const normalizado = signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const mapa: Record<string, SignoZodiac> = {
    'aries': 'Áries',
    'touro': 'Touro',
    'gemeos': 'Gémeos',
    'gem': 'Gémeos',
    'cancer': 'Câncer',
    'canc': 'Câncer',
    'leao': 'Leão',
    'leo': 'Leão',
    'virgem': 'Virgem',
    'libra': 'Libra',
    'escorpiao': 'Escorpião',
    'esc': 'Escorpião',
    'sagitario': 'Sagitário',
    'sag': 'Sagitário',
    'capricornio': 'Capricórnio',
    'cap': 'Capricórnio',
    'aquario': 'Aquário',
    'aqu': 'Aquário',
    'peixes': 'Peixes',
  };

  return mapa[normalizado] ?? null;
}

/**
 * Get the zodiac-tarot mapping for a given sign name.
 * @param signo - Zodiac sign name (e.g., 'Áries', 'Touro')
 * @returns ZodiacTarotMapping or null if not found
 */
export function getZodiacTarot(signo: string): ZodiacTarotMapping | null {
  const normalizado = normalizarSigno(signo);
  return normalizado ? ZODIAC_TAROT_MAP[normalizado] ?? null : null;
}

/**
 * Get the arcano for a given sign name.
 * @param signo - Zodiac sign name
 * @returns Arcano name or null if not found
 */
export function getArcanoFromSigno(signo: string): string | null {
  return getZodiacTarot(signo)?.arcano ?? null;
}

/**
 * Get the element for a given sign name.
 * @param signo - Zodiac sign name
 * @returns Element name or null if not found
 */
export function getElementoFromSigno(signo: string): string | null {
  return getZodiacTarot(signo)?.elemento ?? null;
}

/**
 * Get the spiritual meaning for a given sign name.
 * @param signo - Zodiac sign name
 * @returns Spiritual meaning or null if not found
 */
export function getSignificadoEspiritualFromSigno(signo: string): string | null {
  return getZodiacTarot(signo)?.significado_espiritual ?? null;
}

/**
 * Get the card number for a given sign name.
 * @param signo - Zodiac sign name
 * @returns Card number or null if not found
 */
export function getNumeroCartaFromSigno(signo: string): number | null {
  return getZodiacTarot(signo)?.numero_carta ?? null;
}

/**
 * Get the zodiac sign for a given arcano name.
 * @param arcano - Arcano name (e.g., 'O Sol', 'A Lua')
 * @returns Zodiac sign or null if not found
 */
export function getTarotZodiac(arcano: string): SignoZodiac | null {
  const normalizedArcano = arcano.trim();
  for (const [signo, mapping] of Object.entries(ZODIAC_TAROT_MAP)) {
    if (mapping.arcano === normalizedArcano) {
      return signo as SignoZodiac;
    }
  }
  return null;
}

/**
 * Get the sign for a given arcano name.
 * @param arcano - Arcano name (e.g., 'O Sol', 'A Lua')
 * @returns Sign name or null if not found
 */
export function getSignoFromArcano(arcano: string): string | null {
  return getTarotZodiac(arcano);
}

/**
 * Get all zodiac-tarot mappings.
 * @returns Array of all correlation mappings
 */
export function getAllZodiacTarots(): ZodiacTarotMapping[] {
  return Object.values(ZODIAC_TAROT_MAP);
}

/**
 * Get all arcano names used in the mapping.
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.values(ZODIAC_TAROT_MAP).map((m) => m.arcano);
}

/**
 * Get all signs mapped to a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of ZodiacTarotMapping
 */
export function getZodiacTarotsByElement(elemento: string): ZodiacTarotMapping[] {
  return Object.values(ZODIAC_TAROT_MAP).filter(
    (mapping) => mapping.elemento === elemento
  );
}

/**
 * Get all zodiac signs used in the mapping.
 * @returns Array of sign names
 */
export function getAllSigns(): SignoZodiac[] {
  return Object.values(ZODIAC_TAROT_MAP).map((m) => m.signo);
}
