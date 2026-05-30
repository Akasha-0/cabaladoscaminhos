/**
 * Tarot-Element Correlation Mapping
 * Aligns Tarot Major Arcana cards with the four classical elements
 * Each arcano represents a spiritual doorway connecting conscious energy
 */

import type { TarotElementMapping } from './tarot-element';

export type { TarotElementMapping };

/**
 * Represents the correlation between a Tarot Major Arcana card and its element
 */
export interface TarotElementMapping {
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana (1-21) */
  numero_carta: number;
  /** The associated classical element */
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra';
  /** The primary chakra associated with this arcano */
  chakra: string;
  /** The secondary chakra (if applicable) */
  chakra_secundario?: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Practical energy guidance */
  orientacao_energetica: string;
}

// ─── Tarot Major Arcana to Element Mapping ─────────────────────────────────────

export const TAROT_ELEMENT_MAPPINGS: Record<string, TarotElementMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    elemento: 'Ar',
    chakra: 'Sahassara',
    chakra_secundario: 'Ajna',
    significado_espiritual: 'Libertação infinita, salto de fé, potencial não realizado. O inicio da jornada antes do primeiro passo.',
    orientacao_energetica: 'Permita-se ao novo, aceitando o desconhecido.勇者无畏。勇敢面对转变，拥抱无限可能。',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    elemento: 'Ar',
    chakra: 'Ajna',
    significado_espiritual: 'Mestria das ferramentas internas, poder de transformação através da vontade. O princípio Yang da capacidade criativa.',
    orientacao_energetica: 'Canalize sua intenção com clareza mental. Use palavras e pensamentos como ferramentas de criação. Favorece iniziativas e estratégia.',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    elemento: 'Água',
    chakra: 'Ajna',
    chakra_secundario: 'Anahata',
    significado_espiritual: 'Sabedoria oculta, intuição sagrada, mistério do interior. O princípio Yin da percepção divina.',
    orientacao_energetica: 'Confie em sua voz interior. Pratique contemplação e俊杰敏锐。允许自己沉入宁静的水域深处。',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    elemento: 'Terra',
    chakra: 'Anahata',
    chakra_secundario: 'Muladhara',
    significado_espiritual: 'Fertilidade criativa, abundância natural, nutrição divina. A mãe terra que sustenta toda vida.',
    orientacao_energetica: 'Cultive seu jardim interior. Permita que projetos amadureçam naturalmente. Cuide do coração e da autoestima.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    elemento: 'Fogo',
    chakra: 'Manipura',
    significado_espiritual: 'Força de vontade, autoridade estruturada, disciplina marcial. O guerreiro que impõe ordem ao caos.',
    orientacao_energetica: 'Assert sua posição com clareza. Estabeleça limites necessários. Ideal para ação decisiva e estratégia.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    elemento: 'Ar',
    chakra: 'Vishuddha',
    significado_espiritual: 'Sabedoria tradicional, iniciação sagrada, doutrina divina. O mestre que abre portais de conhecimento.',
    orientacao_energetica: 'Busque orientação em tradições. Expanda sua mente através de estudos profundos. Favorece ensinamentos e expansão.',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    elemento: 'Ar',
    chakra: 'Anahata',
    significado_espiritual: 'União, escolha sagrada, harmonia de opostos. O casamento interno entre razão e emoção.',
    orientacao_energetica: 'Siga seu coração com discernimento. Une opposing forces através do amor. Dia favorável para parcerias.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    elemento: 'Fogo',
    chakra: 'Manipura',
    chakra_secundario: 'Svadhisthana',
    significado_espiritual: 'Conquista, domínio próprio, navegação através de opposition. A vitória através da vontade.',
    orientacao_energetica: 'Avance com determinação focada. Equilibre extremos com maestria. Use fogo interno para superar obstáculos.',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    elemento: 'Ar',
    chakra: 'Vishuddha',
    significado_espiritual: 'Equilíbrio cósmico, lei divina, verdade manifesta. O karma em ação através da balança.',
    orientacao_energetica: 'Avalie com imparcialidade. Tome decisões baseadas em verdade. Favorece contratos e acordos justos.',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    elemento: 'Terra',
    chakra: 'Ajna',
    significado_espiritual: 'Iluminação interior, solidão sagrada, busca da verdade. A luz que guia através da escuridão.',
    orientacao_energetica: 'Volte-se para dentro. Busca clareza no silêncio. Ideal para meditação profunda e reflexão.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    elemento: 'Fogo',
    chakra: 'Sahassara',
    significado_espiritual: 'Ciclos cósmicos, destino, mudança inevitável. A roda do tempo girando eternamente.',
    orientacao_energetica: 'Aceita a mudança com graça. Confie no fluxo dos eventos. Momento para alinhamento com o destino.',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    elemento: 'Fogo',
    chakra: 'Anahata',
    significado_espiritual: 'Coragem interior, compaixão feroz, domínio da besta interior. A força do amor que tudo vence.',
    orientacao_energetica: 'Use gentileza como sua arma principal. Contenha o fogo com compaixão. Dia para vencer medos.',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    elemento: 'Água',
    chakra: 'Vishuddha',
    significado_espiritual: 'Sacrifício, nova perspectiva, entrega total. O salto através da água para renascimento.',
    orientacao_energetica: 'Pratique render-se ao fluxo. Abra mão para receber. Momento para sacrifício consciente.',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    elemento: 'Água',
    chakra: 'Svadhisthana',
    chakra_secundario: 'Muladhara',
    significado_espiritual: 'Transformação profunda, fim de ciclos, metamorfose. A saída necessária para novo começo.',
    orientacao_energetica: 'Libere o que não serve mais. Abrace a mudança com coragem. Ciclo de morte e renascimento.',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    elemento: 'Água',
    chakra: 'Svadhisthana',
    significado_espiritual: 'Equilíbrio fluido, integração de opostos, alquimia interior. O diálogo entre céu e terra.',
    orientacao_energetica: 'Mistura opposites com harmonia. Busque equilíbrio em todas as coisas. Favorece guérison e reconciliação.',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    elemento: 'Terra',
    chakra: 'Muladhara',
    significado_espiritual: 'Ilusão, apego, sombra materialize. O espelho que reflete nossas correntes internas.',
    orientacao_energetica: 'Identifica suas prisões interiores. Rompa correntes de dependência. Use energia terrena para libertação.',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    elemento: 'Fogo',
    chakra: 'Manipura',
    significado_espiritual: 'Destruição sagrada, revelação súbita, purificação através de crise. O raio que ilumina a verdade.',
    orientacao_energetica: 'Aceita a destruição como libertação. não resista à mudança forçada. Renascimento segue a queda.',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    elemento: 'Água',
    chakra: 'Anahata',
    significado_espiritual: 'Esperança, inspiração divina, restauração após crise. A luz que guia através da noite.',
    orientacao_energetica: 'Semeia sementes de esperança. Deixe sua luz brilhar para outros. Período de cura e renovação.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    elemento: 'Água',
    chakra: 'Ajna',
    significado_espiritual: 'Intuição profunda, inconsciente, ciclos noturnos. O reino das águas onde habita o mistério.',
    orientacao_energetica: 'Confie na intuição mesmo na escuridão. Evite decisões impulsivas. Trabalhe com sonhos e processos internos.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    elemento: 'Fogo',
    chakra: 'Manipura',
    chakra_secundario: 'Anahata',
    significado_espiritual: 'Vitalidade, sucesso, clareza radiante. O filho do sol que manifesta seu brilho interior.',
    orientacao_energetica: 'Maximiza tua energia Yang. Busca reconhecimento e liderança. Manifesta talentos com confiança.',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    elemento: 'Fogo',
    chakra: 'Vishuddha',
    significado_espiritual: 'Renascimento, chiamata divina, julgamento interior. A trombeta que acorda os mortos.',
    orientacao_energetica: 'Responde à tua chiamata sagrada. Deixe velhas versões de ti morrerem. Momento de despertar e propósito.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    elemento: 'Terra',
    chakra: 'Sahassara',
    significado_espiritual: 'Completude, réalisation, dança cósmica. O círculo que fecha abrindo novo spiral.',
    orientacao_energetica: 'Celebra tuas conquistas. Completa ciclos pendientes. Período de réalisation e novo começo.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_ELEMENT_MAPPINGS);
Object.values(TAROT_ELEMENT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot-to-Element correlation mapping
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Imperador')
 * @returns The correlation mapping or null if not found
 */
export function getTarotElement(arcano: string): TarotElementMapping | null {
  return TAROT_ELEMENT_MAPPINGS[arcano] ?? null;
}

/**
 * Get the arcano name corresponding to an element
 * @param elemento - Element name ('Fogo', 'Água', 'Ar', 'Terra')
 * @returns The first arcano associated with that element, or null if not found
 */
export function getElementTarot(elemento: string): string | null {
  const entry = Object.values(TAROT_ELEMENT_MAPPINGS).find(
    mapping => mapping.elemento === elemento
  );
  return entry?.arcano ?? null;
}

/**
 * Get all available Tarot-Element mappings
 * @returns Array of all correlation mappings
 */
export function getAllTarotElements(): TarotElementMapping[] {
  return Object.values(TAROT_ELEMENT_MAPPINGS);
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_ELEMENT_MAPPINGS);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotElement(arcano: string): boolean {
  return arcano in TAROT_ELEMENT_MAPPINGS;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  const entry = Object.values(TAROT_ELEMENT_MAPPINGS).find(
    mapping => mapping.numero_carta === numero
  );
  return entry?.arcano ?? null;
}

/**
 * Get element by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The element name or null if not found
 */
export function getElementByNumber(numero: number): string | null {
  const entry = Object.values(TAROT_ELEMENT_MAPPINGS).find(
    mapping => mapping.numero_carta === numero
  );
  return entry?.elemento ?? null;
}

/**
 * Get chakra by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The chakra name or null if not found
 */
export function getChakraByNumber(numero: number): string | null {
  const entry = Object.values(TAROT_ELEMENT_MAPPINGS).find(
    mapping => mapping.numero_carta === numero
  );
  return entry?.chakra ?? null;
}

/**
 * Get all arcanos by element
 * @param elemento - Element name ('Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of arcano names for that element
 */
export function getArcanosByElement(elemento: string): string[] {
  return Object.values(TAROT_ELEMENT_MAPPINGS)
    .filter(mapping => mapping.elemento === elemento)
    .map(mapping => mapping.arcano);
}

/**
 * Get all arcanos by chakra
 * @param chakra - Chakra name (e.g., 'Ajna', 'Sahassara')
 * @returns Array of arcano names for that chakra
 */
export function getArcanosByChakra(chakra: string): string[] {
  return Object.values(TAROT_ELEMENT_MAPPINGS)
    .filter(mapping => mapping.chakra === chakra || mapping.chakra_secundario === chakra)
    .map(mapping => mapping.arcano);
}

/**
 * Get element distribution
 * @returns Object with element counts
 */
export function getElementDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {
    Fogo: 0,
    Água: 0,
    Ar: 0,
    Terra: 0,
  };
  Object.values(TAROT_ELEMENT_MAPPINGS).forEach(mapping => {
    distribution[mapping.elemento]++;
  });
  return distribution;
}

export default {
  getTarotElement,
  getElementTarot,
  getAllTarotElements,
  getAllArcanos,
  hasTarotElement,
  getArcanoByNumber,
  getElementByNumber,
  getChakraByNumber,
  getArcanosByElement,
  getArcanosByChakra,
  getElementDistribution,
  TAROT_ELEMENT_MAPPINGS,
};