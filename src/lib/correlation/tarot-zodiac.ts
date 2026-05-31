/**
 * Tarot-Zodiac Spiritual Correlation Module
 * Maps Tarot Major Arcana cards to zodiac signs with elemental and spiritual connections.
 * Source: Cabala dos Caminhos spiritual system
 */

import type { SignoZodiac } from './zodiac-element';

/**
 * Represents the correlation between a Tarot card and a zodiac sign
 */
export interface TarotZodiacMapping {
  /** Tarot Major Arcana card name in Portuguese */
  arcano: string;
  /** Card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Associated zodiac sign in Portuguese */
  signo: SignoZodiac;
  /** Element associated with this arcano-sign correlation */
  elemento: string;
  /** Core spiritual meaning of this arcano-sign combination */
  significado_espiritual: string;
}

/**
 * Complete mapping of Tarot Major Arcana cards to zodiac signs.
 * Based on ancient esoteric traditions integrated with the Cabala dos Caminhos system.
 * Each arcano carries the archetypal energy of its corresponding zodiac sign.
 */
export const TAROT_ZODIAC_MAP: Record<string, TarotZodiacMapping> = {
  /** Áries - O Guerreiro que Conquista */
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    signo: 'Áries',
    elemento: 'Fogo',
    significado_espiritual: 'Liderança marcial, pioneirismo espiritual, força de vontade, comando sobre o caos, estruturação da energia vital em direção ao propósito. O imperador representa a autoridade interior que manifesta a coragem e ação direta de Áries.',
  },
  /** Touro - A Mãe Nutridora */
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    signo: 'Touro',
    elemento: 'Terra',
    significado_espiritual: 'Fertilidade espiritual, abundância material e emocional, sensualidade sagrada, conexão com a natureza, manifestação da beleza interior. A imperatriz representa a energia maternal que encarna na nutrição do corpo, mente e espírito.',
  },
  /** Gémeos - O Comunicador Dual */
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    signo: 'Gémeos',
    elemento: 'Ar',
    significado_espiritual: 'Escolha entre polaridades, integração dos opostos, comunicação sagrada, dualidade transcendida, amor como decisão espiritual. Os Enamorados representam a necessidade de harmonizar as múltiplas facetas da mente e do coração.',
  },
  /** Câncer - O Guardião do Lar */
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    signo: 'Câncer',
    elemento: 'Água',
    significado_espiritual: 'Intuição profunda, emoções fluidas, memória ancestral, proteção do espaço sagrado interior, ciclos emocionais, mundo inconsciente. A Lua representa as águas emocionais que Câncer navega com sensibilidade e percepção além do véu.',
  },
  /** Leão - O Rei Criativo */
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    signo: 'Leão',
    elemento: 'Fogo',
    significado_espiritual: 'Vitalidade irradiante, propósito de vida, brilho próprio, amor próprio autêntico, criatividade solar, liderança magnética. O Sol representa a luz interior que irradia para iluminar o caminho dos outros com generosidade e autenticidade.',
  },
  /** Virgem - O Discernidor Perfeito */
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    signo: 'Virgem',
    elemento: 'Terra',
    significado_espiritual: 'Purificação necessária, destruição das ilusões de perfeição, transformação através da análise, renascimento espiritual, libertação dos padrões de autocrítica. A Torre representa a catarse que purifica das crenças limitantes sobre si mesma.',
  },
  /** Libra - O Equilibrador das Balanças */
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 11,
    signo: 'Libra',
    elemento: 'Ar',
    significado_espiritual: 'Equilíbrio cósmico, harmonia relacional, verdade interior, decisão sagrada, integridade, lei divina que equilibra ações e consequências. A Justiça representa a busca pela harmonia através do discernimento e da equidade.',
  },
  /** Escorpião - O Transformador Profundo */
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    signo: 'Escorpião',
    elemento: 'Água',
    significado_espiritual: 'Regeneração profunda, transformação essencial, renascimento, poder pessoal, investigação dos mistérios ocultos, transcendência do ego. A Morte representa a jornada através das águas profundas da transformação onde o antigo self morre para renascer.',
  },
  /** Sagitário - O Filosofo Busca-Verdade */
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    signo: 'Sagitário',
    elemento: 'Fogo',
    significado_espiritual: 'Sabedoria sagrada, expansão da consciência, tradição espiritual, busca da verdade, filosofia de vida, ensino e iniciação. O Hierofante representa o mestre interior que busca para expandir a compreensão do divino e transmitir ensinamentos.',
  },
  /** Capricórnio - O Arquitecto do Destino */
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    signo: 'Capricórnio',
    elemento: 'Terra',
    significado_espiritual: 'Estruturação do poder pessoal, domínio das paixões, materialização de objetivos, superação de limitações autopostas, disciplina interior. O Diabo representa a energia que transforma ambiciónedra em realizações concretas através da vontade focada.',
  },
  /** Aquário - O Revoluciário do Pensamento */
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    signo: 'Aquário',
    elemento: 'Ar',
    significado_espiritual: 'Esperança restaurada, pensamento humanitário, liberdade mental, inovação espiritual, uniqueness collectif, serviço à humanidade. A Estrela representa a luz que irradia como farol de esperança e renovação para a coletividade.',
  },
  /** Peixes - O Místico Unicversitário */
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    signo: 'Peixes',
    elemento: 'Água',
    significado_espiritual: 'Iluminação interior, solitude sagrada, sabedoria da escuridão, intuição transcendente, dissolução do ego, união com o divino. O Eremita representa a jornada através da interioridade profunda onde a sabedoria é encontrada no silêncio.',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(TAROT_ZODIAC_MAP);
Object.values(TAROT_ZODIAC_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 12 Major Arcana cards used in the mapping
 */
export const TODOS_ARCANOS_ZODIAC: readonly string[] = Object.freeze([
  'O Imperador', 'A Imperatriz', 'Os Enamorados', 'A Lua', 'O Sol',
  'A Torre', 'A Justiça', 'A Morte', 'O Hierofante', 'O Diabo',
  'A Estrela', 'O Eremita'
]);

/**
 * Normalizes arcano name for consistent lookup.
 * Handles variations like accents, case, and whitespace.
 */
function normalizarArcano(arcano: string): string | null {
  const normalizado = arcano.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const mapa: Record<string, string> = {
    'o imperador': 'O Imperador',
    'a imperatriz': 'A Imperatriz',
    'os enamorados': 'Os Enamorados',
    'a lua': 'A Lua',
    'o sol': 'O Sol',
    'a torre': 'A Torre',
    'a justica': 'A Justiça',
    'justica': 'A Justiça',
    'a morte': 'A Morte',
    'morte': 'A Morte',
    'o hierofante': 'O Hierofante',
    'hierofante': 'O Hierofante',
    'o diabo': 'O Diabo',
    'diabo': 'O Diabo',
    'a estrela': 'A Estrela',
    'estrela': 'A Estrela',
    'o eremita': 'O Eremita',
    'eremita': 'O Eremita',
  };

  return mapa[normalizado] ?? null;
}

/**
 * Get the tarot-zodiac mapping for a given arcano name.
 * @param arcano - Tarot Major Arcana card name (e.g., 'O Sol', 'A Lua')
 * @returns TarotZodiacMapping or null if not found
 */
export function getTarotZodiac(arcano: string): TarotZodiacMapping | null {
  const normalizado = normalizarArcano(arcano);
  return normalizado ? TAROT_ZODIAC_MAP[normalizado] ?? null : null;
}

/**
 * Get the zodiac sign for a given arcano name.
 * @param arcano - Tarot Major Arcana card name
 * @returns Zodiac sign or null if not found
 */
export function getSignoFromArcano(arcano: string): SignoZodiac | null {
  return getTarotZodiac(arcano)?.signo ?? null;
}

/**
 * Get the card number for a given arcano name.
 * @param arcano - Tarot Major Arcana card name
 * @returns Card number or null if not found
 */
export function getNumeroCartaFromArcano(arcano: string): number | null {
  return getTarotZodiac(arcano)?.numero_carta ?? null;
}

/**
 * Get the element for a given arcano name.
 * @param arcano - Tarot Major Arcana card name
 * @returns Element name or null if not found
 */
export function getElementoFromArcano(arcano: string): string | null {
  return getTarotZodiac(arcano)?.elemento ?? null;
}

/**
 * Get the spiritual meaning for a given arcano name.
 * @param arcano - Tarot Major Arcana card name
 * @returns Spiritual meaning or null if not found
 */
export function getSignificadoEspiritualFromArcano(arcano: string): string | null {
  return getTarotZodiac(arcano)?.significado_espiritual ?? null;
}

/**
 * Get the arcano for a given zodiac sign.
 * @param signo - Zodiac sign name (e.g., 'Áries', 'Touro')
 * @returns Arcano name or null if not found
 */
export function getZodiacTarot(signo: string): string | null {
  const normalizado = signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const mapa: Record<string, string> = {
    'aries': 'O Imperador',
    'touro': 'A Imperatriz',
    'gemeos': 'Os Enamorados',
    'gem': 'Os Enamorados',
    'cancer': 'A Lua',
    'canc': 'A Lua',
    'leao': 'O Sol',
    'leo': 'O Sol',
    'virgem': 'A Torre',
    'libra': 'A Justiça',
    'escorpiao': 'A Morte',
    'esc': 'A Morte',
    'sagitario': 'O Hierofante',
    'sag': 'O Hierofante',
    'capricornio': 'O Diabo',
    'cap': 'O Diabo',
    'aquario': 'A Estrela',
    'aqu': 'A Estrela',
    'peixes': 'O Eremita',
  };

  return mapa[normalizado] ?? null;
}

/**
 * Get all tarot-zodiac mappings.
 * @returns Array of all correlation mappings
 */
export function getAllTarotZodiacs(): TarotZodiacMapping[] {
  return Object.values(TAROT_ZODIAC_MAP);
}

/**
 * Get all zodiac signs used in the mapping.
 * @returns Array of zodiac sign names
 */
export function getAllSignos(): SignoZodiac[] {
  return Object.values(TAROT_ZODIAC_MAP).map((m) => m.signo);
}

/**
 * Get all arcanos mapped to a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of TarotZodiacMapping
 */
export function getTarotZodiacsByElement(elemento: string): TarotZodiacMapping[] {
  return Object.values(TAROT_ZODIAC_MAP).filter(
    (mapping) => mapping.elemento === elemento
  );
}

/**
 * Get the arcano by card number.
 * @param numero - The Major Arcana card number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_ZODIAC_MAP)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get the zodiac sign by card number.
 * @param numero - The Major Arcana card number (0-21)
 * @returns Zodiac sign or null if not found
 */
export function getSignoByNumber(numero: number): SignoZodiac | null {
  for (const mapping of Object.values(TAROT_ZODIAC_MAP)) {
    if (mapping.numero_carta === numero) {
      return mapping.signo;
    }
  }
  return null;
}

/**
 * Check if an arcano exists in the mapping.
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasArcano(arcano: string): boolean {
  return getTarotZodiac(arcano) !== null;
}

export default {
  getTarotZodiac,
  getSignoFromArcano,
  getNumeroCartaFromArcano,
  getElementoFromArcano,
  getSignificadoEspiritualFromArcano,
  getZodiacTarot,
  getAllTarotZodiacs,
  getAllSignos,
  getTarotZodiacsByElement,
  getArcanoByNumber,
  getSignoByNumber,
  hasArcano,
  TAROT_ZODIAC_MAP,
  TODOS_ARCANOS_ZODIAC,
};