/**
 * Numerology-Element Spiritual Correlation
 * Maps numerology numbers 1-13 to their corresponding elements,
 * energy qualities, and spiritual meanings.
 * 
 * Based on 'Numerologia Cabalística' section from IDEIA.md and
 * the element correlations in number-mysticism.ts.
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export interface NumerologyElementMapping {
  /** The numerology number (1-13) */
  numero: number;
  /** Associated element */
  elemento: Elemento;
  /** Energy quality type */
  qualidade_energetica: {
    tipo: 'Quente' | 'Frio' | 'Neutro';
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
    vibração: string;
  };
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Archetype/role name */
  arquétipo: string;
  /** Associated orixá */
  orixa: string;
  /** Associated sephirah */
  sephirah: string;
  /** Chakra alignment */
  chakra: string;
}

/**
 * Complete mapping of numerology numbers 1-13 to their element correspondences.
 * Derived from IDEIA.md and number-mysticism.ts data.
 */
export const NUMERO_ELEMENTO_MAP: Record<number, NumerologyElementMapping> = {
  1: {
    numero: 1,
    elemento: 'Fogo',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Iniciação, força primal, liderança, manifestação',
    },
    significado_espiritual: 'O começo divino, o impulso de criação, a força de vontade que move o universo. Primeiro número representa a chama primordial da existência.',
    arquétipo: 'O Iniciador / O Líder',
    orixa: 'Exu / Okaran',
    sephirah: 'Kether',
    chakra: '3º Plexo Solar',
  },
  2: {
    numero: 2,
    elemento: 'Água',
    qualidade_energetica: {
      tipo: 'Frio',
      polaridade: 'Yin',
      vibração: 'Receptividade, dualidade, equilíbrio, fluídez emocional',
    },
    significado_espiritual: 'A polaridade divina, os caminhos duplos, a união entre opostos. Representa a capacidade de receber e adaptar-se às correntes universais.',
    arquétipo: 'O Diplomata / O Par',
    orixa: 'Ibeji / Ejiokô',
    sephirah: 'Chokmah',
    chakra: '2º Sacro',
  },
  3: {
    numero: 3,
    elemento: 'Fogo',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Criatividade, expressão, expansão, socialização',
    },
    significado_espiritual: 'A expansão da chama criativa, a expressão divina em movimento. Terceiro número representa a festividade da existência e a comunicação com o sagrado.',
    arquétipo: 'O Comunicador / O Criador',
    orixa: 'Ogum / Etaogundá',
    sephirah: 'Binah',
    chakra: '3º Plexo Solar',
  },
  4: {
    numero: 4,
    elemento: 'Terra',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Estrutura, estabilidade, foundations sólidos, trabalho perseverante',
    },
    significado_espiritual: 'A materialização divina, a estabilidade do reino físico. Quarto número representa a construção de alicerces que sustentam a evolução espiritual.',
    arquétipo: 'O Construtor / A Estrutura',
    orixa: 'Iemanjá / Irosun',
    sephirah: 'Chesed',
    chakra: '1º Básico',
  },
  5: {
    numero: 5,
    elemento: 'Água',
    qualidade_energetica: {
      tipo: 'Frio',
      polaridade: 'Yin',
      vibração: 'Liberdade, adaptabilidade, transformação, alquimia interior',
    },
    significado_espiritual: 'A fluidez alquímica, a liberdade dentro do fluxo. Quinto número representa a mudança interior e a sabedoria adquirida pela experiência.',
    arquétipo: 'O Viajante / O Alquimista',
    orixa: 'Oxum / Oxé',
    sephirah: 'Geburah',
    chakra: '2º Sacro',
  },
  6: {
    numero: 6,
    elemento: 'Fogo',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Harmonia, amor, beleza, responsabilidade, serviço',
    },
    significado_espiritual: 'O fogo do amor harmonioso, o equilíbrio entre dar e receber. Sexto número representa a integração entre coração e ação.',
    arquétipo: 'O Harmonizador / O Conciliador',
    orixa: 'Xangô / Obará',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
  },
  7: {
    numero: 7,
    elemento: 'Ar',
    qualidade_energetica: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
      vibração: 'Introspecção, sabedoria, misticismo, busca da verdade',
    },
    significado_espiritual: 'O sopro da sabedoria divina, a introspecção que revela verdades ocultas. Sétimo número representa a busca espiritual e a compreensão profunda.',
    arquétipo: 'O Filósofo / O Ocultista',
    orixa: 'Iansã / Odi',
    sephirah: 'Netzach',
    chakra: '5º Laríngeo',
  },
  8: {
    numero: 8,
    elemento: 'Ar',
    qualidade_energetica: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
      vibração: 'Resiliência, autoridade interior, gestão, perseverança',
    },
    significado_espiritual: 'O vento da justiça kármica, o equilíbrio entre esforço e recompensa. Oitavo número representa o poder pessoal e a autoridade interior.',
    arquétipo: 'O Executivo / A Justiça Kármica',
    orixa: 'Oxalá / EjiOníle',
    sephirah: 'Hod',
    chakra: '4º Cardíaco',
  },
  9: {
    numero: 9,
    elemento: 'Água',
    qualidade_energetica: {
      tipo: 'Frio',
      polaridade: 'Yin',
      vibração: 'Humanitarismo, compaixão, sabedoria universal, iluminação',
    },
    significado_espiritual: 'A água da sabedoria universal, a compaixão que transcende o individual. Nono número representa o fim de ciclos e a iluminação espiritual.',
    arquétipo: 'O Sábio / O Integrador',
    orixa: 'Ossá',
    sephirah: 'Yesod',
    chakra: '6º Frontal',
  },
  10: {
    numero: 10,
    elemento: 'Terra',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Renovação, transformação, ciclos, manifestação material',
    },
    significado_espiritual: 'A terra da transformação profunda, o retorno ao centro e a manifestação prática. Décimo número representa o fim de um ciclo e o início de outro.',
    arquétipo: 'O Renovador / A Mudança',
    orixa: 'Oxalá / Ofun',
    sephirah: 'Malkuth',
    chakra: '1º Básico',
  },
  11: {
    numero: 11,
    elemento: 'Éter',
    qualidade_energetica: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
      vibração: 'Intuição espiritual, channeling, inspiração divina, iluminação',
    },
    significado_espiritual: 'O éter da intuição desperta, o canal entre o humano e o divino. Número mestre que representa o alinhamento completo com a vontade divina.',
    arquétipo: 'O Canalizador / O Desperto',
    orixa: 'Alafia / Orunmilá',
    sephirah: 'Kether / Tiphereth',
    chakra: '7º Coronário',
  },
  12: {
    numero: 12,
    elemento: 'Fogo',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Justiça divina, coragem moral, fogo purificador, integridade',
    },
    significado_espiritual: 'O fogo purificador da justiça divina, a guerra justa e a transformação por provações. Décimo segundo número representa o equilíbrio entre razão e emoção.',
    arquétipo: 'A Justiça / O Fogo Purificador',
    orixa: 'Xangô / Ejilsebora',
    sephirah: 'Geburah',
    chakra: '3º Plexo Solar',
  },
  13: {
    numero: 13,
    elemento: 'Terra',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Transformação profunda, encerramento de ciclos, sabedoria dos ancestrais',
    },
    significado_espiritual: 'A terra da morte e renascimento, o fim de ciclos e a evolução espiritual. Décimo terceiro número representa a sabedoria dos mais velhos e a transformação física.',
    arquétipo: 'A Evolução / A Morte e Renascimento',
    orixa: 'Nanã / Omolu / Olobón',
    sephirah: 'Malkuth',
    chakra: '1º Básico',
  },
};

/**
 * Returns the element correlation for a given numerology number (1-13)
 * @param numero - The number to look up (must be 1-13)
 * @returns NumerologyElementMapping object with all correlations
 * @throws Error if number is outside valid range
 */
export function getNumerologyElement(numero: number): NumerologyElementMapping {
  if (!Number.isInteger(numero) || numero < 1 || numero > 13) {
    throw new Error(`Número fora do intervalo válido (1-13). Recebido: ${numero}`);
  }
  return NUMERO_ELEMENTO_MAP[numero];
}

/**
 * Get all numerology element mappings
 * @returns Array of all NumerologyElementMapping objects for numbers 1-13
 */
export function getAllNumerologyElements(): NumerologyElementMapping[] {
  return Object.values(NUMERO_ELEMENTO_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Returns all numbers associated with a given element
 * @param elemento - Element name (Fogo, Água, Ar, Terra, Éter)
 * @returns Array of NumerologyElementMapping objects for the element
 */
export function getElementNumerology(elemento: string): NumerologyElementMapping[] {
  const normalized = elemento
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const elementMap: Record<string, Elemento> = {
    fogo: 'Fogo',
    agua: 'Água',
    ar: 'Ar',
    terra: 'Terra',
    eter: 'Éter',
  };

  const key = elementMap[normalized];
  if (!key) return [];

  return getAllNumerologyElements().filter((m) => m.elemento === key);
}

/**
 * Returns the element name for a given number
 * @param numero - The number to look up (1-13)
 * @returns Elemento string or null if invalid
 */
export function getElementByNumero(numero: number): Elemento | null {
  if (numero < 1 || numero > 13) return null;
  return NUMERO_ELEMENTO_MAP[numero].elemento;
}

/**
 * Returns the energy quality type for a given number
 * @param numero - The number to look up (1-13)
 * @returns Energy quality type or null if invalid
 */
export function getEnergiaByNumero(numero: number): 'Quente' | 'Frio' | 'Neutro' | null {
  if (numero < 1 || numero > 13) return null;
  return NUMERO_ELEMENTO_MAP[numero].qualidade_energetica.tipo;
}
