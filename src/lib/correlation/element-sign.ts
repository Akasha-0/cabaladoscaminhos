/**
 * Element-Sign Spiritual Correlation
 * Maps the four classical elements to their ruling zodiac signs with
 * astrological qualities, energetic characteristics, and elemental directions.
 * Based on Western astrological traditions and Cabala dos Caminhos system.
 */

/** The four classical elements plus quintessence */
export type Elemento = 'Fogo' | 'Terra' | 'Ar' | 'Água';

/** Quality modality of each sign within an element */
export type Qualidade = 'Cardinal' | 'Fixed' | 'Mutable';

/** Polarity: Yang (active) or Yin (receptive) */
export type Natureza = 'Yang' | 'Yin';

/** The twelve zodiac signs */
export type Signo = 'Áries' | 'Touro' | 'Gémeos' | 'Caranguejo' | 'Leão' | 'Virgem' | 'Balança' | 'Escorpião' | 'Sagitário' | 'Capricórnio' | 'Aquário' | 'Peixes';

/**
 * Complete element-to-sign mapping with astrological attributes.
 * Each element groups three signs representing the three qualities
 * (Cardinal/Fixed/Mutable) expressing that element's nature.
 */
export interface ElementSign {
  /** Element name (Fogo, Terra, Ar, Água) */
  elemento: Elemento;
  /** The three signs belonging to this element */
  signos_pertencentes: {
    cardinal: string;
    fixed: string;
    mutable: string;
  };
  /** Quality modalities for each sign */
  qualidade: {
    cardinal: Qualidade;
    fixed: Qualidade;
    mutable: Qualidade;
  };
  /** Energetic characteristics of this element */
  energia_caracteristica: string;
  /** Predominant cardinal direction */
  direcao_predominante: 'Norte' | 'Sul' | 'Leste' | 'Oeste';
  /** Polarity: Yang (active) or Yin (receptive) */
  natureza: Natureza;
}

/** Maps element names to their complete ElementSign data */
export const ELEMENT_SIGN_MAPPINGS: Readonly<Record<Elemento, ElementSign>> = {
  Fogo: {
    elemento: 'Fogo',
    signos_pertencentes: {
      cardinal: 'Áries',
      fixed: 'Leão',
      mutable: 'Sagitário',
    },
    qualidade: {
      cardinal: 'Cardinal',
      fixed: 'Fixed',
      mutable: 'Mutable',
    },
    energia_caracteristica: 'Transformação, paixão, coragem, vontade, brilho, inspiração e ação espontânea',
    direcao_predominante: 'Sul',
    natureza: 'Yang',
  },
  Terra: {
    elemento: 'Terra',
    signos_pertencentes: {
      cardinal: 'Capricórnio',
      fixed: 'Touro',
      mutable: 'Virgem',
    },
    qualidade: {
      cardinal: 'Cardinal',
      fixed: 'Fixed',
      mutable: 'Mutable',
    },
    energia_caracteristica: 'Estabilidade, estrutura, concretude, prosperidade material, disciplina e ancoramento',
    direcao_predominante: 'Norte',
    natureza: 'Yin',
  },
  Ar: {
    elemento: 'Ar',
    signos_pertencentes: {
      cardinal: 'Balança',
      fixed: 'Aquário',
      mutable: 'Gémeos',
    },
    qualidade: {
      cardinal: 'Cardinal',
      fixed: 'Fixed',
      mutable: 'Mutable',
    },
    energia_caracteristica: 'Comunicação, intelectual, troca, ideias, liberdade mental e objetividade',
    direcao_predominante: 'Leste',
    natureza: 'Yang',
  },
  Água: {
    elemento: 'Água',
    signos_pertencentes: {
      cardinal: 'Caranguejo',
      fixed: 'Escorpião',
      mutable: 'Peixes',
    },
    qualidade: {
      cardinal: 'Cardinal',
      fixed: 'Fixed',
      mutable: 'Mutable',
    },
    energia_caracteristica: 'Emoção, intuição, sensibilidade, profundidade, cura emocional e conexão com o inconsciente',
    direcao_predominante: 'Oeste',
    natureza: 'Yin',
  },
} as const;

/**
 * Returns the complete element-sign mapping for a given element name.
 * Case-insensitive matching with accent normalization.
 *
 * @param elemento - The element name (Fogo, Terra, Ar, Água)
 * @returns The complete ElementSign mapping or null if not found
 */
export function getElementSign(elemento: string): ElementSign | null {
  const normalized = elemento
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  // Map normalized lowercase to PascalCase keys
  const keyMap: Record<string, Elemento> = {
    fogo: 'Fogo', terra: 'Terra', ar: 'Ar', agua: 'Água',
  };
  const key = keyMap[normalized] ?? (normalized.charAt(0).toUpperCase() + normalized.slice(1)) as Elemento;
  return ELEMENT_SIGN_MAPPINGS[key] ?? null;
}

/**
 * Returns all elements with their sign mappings.
 *
 * @returns Array of all ElementSign mappings
 */
export function getAllElementSigns(): ElementSign[] {
  return Object.values(ELEMENT_SIGN_MAPPINGS);
}

/**
 * Returns the three signs belonging to a given element.
 *
 * @param elemento - The element name
 * @returns Array of the three signs or null if element not found
 */
export function getSignsByElement(elemento: string): Signo[] | null {
  const mapping = getElementSign(elemento);
  if (!mapping) return null;
  return [
    mapping.signos_pertencentes.cardinal as Signo,
    mapping.signos_pertencentes.fixed as Signo,
    mapping.signos_pertencentes.mutable as Signo,
  ];
}

/**
 * Returns the nature (Yang or Yin) of a given element.
 *
 * @param elemento - The element name
 * @returns The nature or null if element not found
 */
export function getElementNature(elemento: string): Natureza | null {
  const mapping = getElementSign(elemento);
  return mapping?.natureza ?? null;
}

/**
 * Returns the cardinal direction associated with a given element.
 *
 * @param elemento - The element name
 * @returns The direction or null if element not found
 */
export function getElementDirection(elemento: string): ElementSign['direcao_predominante'] | null {
  const mapping = getElementSign(elemento);
  return mapping?.direcao_predominante ?? null;
}

/**
 * Checks if a given sign belongs to the specified element.
 *
 * @param elemento - The element name
 * @param signo - The zodiac sign name
 * @returns True if the sign belongs to the element, false otherwise
 */
export function isSignOfElement(elemento: string, signo: string): boolean {
  const signs = getSignsByElement(elemento);
  if (!signs) return false;
  const normalizedSigno = signo
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return signs.some(s => {
    const normalized = s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return normalized === normalizedSigno;
  });
}
