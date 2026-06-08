/**
 * Number Mysticism Correlation
 * Correlates numbers 1-13 with Kabbalistic, Candomblé, Astrological and Elemental mappings
 * Based on 'Numerologia Cabalística' and 'Alquimia Numérica' sections from IDEIA.md
 */

/**
 * Mystical correlation for a number
 */
export interface NumberMysticism {
  /** The number itself (1-13) */
  numero: number;
  /** Mystical meaning / archetype */
  significado: string;
  /** Corresponding Kabbalistic Sephirah */
  sephirah_correspondente: string;
  /** Associated Candomblé Orixá */
  orixa_associado: string;
  /** Element associated with this number */
  elemento: string;
  /** Planetary ruler */
  planeta_regente: string;
  /** Characteristic energy vibration */
  energia_caracteristica: string;
}

/**
 * Number 1 - Kether (Crown) - Exu/Okaran
 * The Initiator - Impulse, beginning, leadership
 */
const UM: NumberMysticism = {
  numero: 1,
  significado: 'O Iniciador, O Líder - O começo, a força primal de criação, o impulso de iniciar',
  sephirah_correspondente: 'Kether',
  orixa_associado: 'Exu / Okaran',
  elemento: 'Fogo',
  planeta_regente: 'Sol',
  energia_caracteristica: 'Força de vontade, determinação, pioneirismo, originalidade e poder de manifestar',
};

/**
 * Number 2 - Chokmah/Binah - Ibeji/Ejiokô
 * The Diplomat - Polarity, duality, balance
 */
const DOIS: NumberMysticism = {
  numero: 2,
  significado: 'O Diplomata, O Par - A dualidade, os caminhos duplos, união e equilíbrio entre opostos',
  sephirah_correspondente: 'Chokmah',
  orixa_associado: 'Ibeji / Ejiokô',
  elemento: 'Água',
  planeta_regente: 'Lua',
  energia_caracteristica: 'Receptividade, adaptabilidade, cooperação, sensibilidade e intuição',
};

/**
 * Number 3 - Binah - Ogum/Etaogundá
 * The Communicator - Expression, creativity, growth
 */
const TRES: NumberMysticism = {
  numero: 3,
  significado: 'O Comunicador, O Criador - A expansão da matriz, expressão criativa e socialização',
  sephirah_correspondente: 'Binah',
  orixa_associado: 'Ogum / Etaogundá',
  elemento: 'Fogo',
  planeta_regente: 'Marte',
  energia_caracteristica: 'Criatividade, comunicação, otimismo, sociabilidade e expressão artística',
};

/**
 * Number 4 - Chesed - Iemanjá/Irosun
 * The Builder - Structure, stability, foundation
 */
const QUATRO: NumberMysticism = {
  numero: 4,
  significado: 'O Construtor, A Estrutura - A estabilidade, os fundamentos sólidos e o trabalho perseverante',
  sephirah_correspondente: 'Chesed',
  orixa_associado: 'Iemanjá / Irosun',
  elemento: 'Terra',
  planeta_regente: 'Júpiter',
  energia_caracteristica: 'Estabilidade, organização, disciplina, paciência e construção de bases duradouras',
};

/**
 * Number 5 - Geburah - Oxum/Oxé
 * The Traveler - Change, freedom, learning
 */
const CINCO: NumberMysticism = {
  numero: 5,
  significado: 'O Viajante, O Alquimista - A liberdade, a mudança e a sabedoria adquiridos pela experiência',
  sephirah_correspondente: 'Geburah',
  orixa_associado: 'Oxum / Oxé',
  elemento: 'Água',
  planeta_regente: 'Vênus',
  energia_caracteristica: 'Liberdade, adaptabilidade, curiosidade, alquimia interior e transformação',
};

/**
 * Number 6 - Tiphereth - Xangô/Obará
 * The Harmonizer - Balance, beauty, responsibility
 */
const SEIS: NumberMysticism = {
  numero: 6,
  significado: 'O Conciliador, A Família - A harmonia, o equilíbrio entre dar e receber, responsabilidade',
  sephirah_correspondente: 'Tiphereth',
  orixa_associado: 'Xangô / Obará',
  elemento: 'Fogo',
  planeta_regente: 'Sol',
  energia_caracteristica: 'Harmonia, beleza, amor incondicional, responsabilidade e serviço ao próximo',
};

/**
 * Number 7 - Netzach - Iansã/Odi
 * The Philosopher - introspection, wisdom, understanding
 */
const SETE: NumberMysticism = {
  numero: 7,
  significado: 'O Filósofo, O Ocultista - A sabedoria oculta, a introspecção e a compreensão profunda',
  sephirah_correspondente: 'Netzach',
  orixa_associado: 'Iansã / Odi',
  elemento: 'Ar',
  planeta_regente: 'Urano',
  energia_caracteristica: 'Introspecção, sabedoria interior, misticismo, análise e busca pela verdade',
};

/**
 * Number 8 - Hod - Oxalá/EjiOníle
 * The Executive - Efficiency, endurance, karma
 */
const OITO: NumberMysticism = {
  numero: 8,
  significado: 'O Executivo, A Justiça Kármica - O poder pessoal, a autoridade e o equilíbrio entre esforço e recompensa',
  sephirah_correspondente: 'Hod',
  orixa_associado: 'Oxalá / EjiOníle',
  elemento: 'Ar',
  planeta_regente: 'Saturno',
  energia_caracteristica: 'Resiliência, autoridade interior, gestão de recursos, perseverança e poder de ação',
};

/**
 * Number 9 - Yesod - Ossá
 * The Sage - Completion, humanitarianism, wisdom
 */
const NOVE: NumberMysticism = {
  numero: 9,
  significado: 'O Sábio, O Integrador - A sabedoria além da matéria, a compaixão universal e o fim de ciclos',
  sephirah_correspondente: 'Yesod',
  orixa_associado: 'Ossá',
  elemento: 'Água',
  planeta_regente: 'Netuno',
  energia_caracteristica: 'Humanitarismo, compaixão universal, sabedoria, encerramento de ciclos e iluminação',
};

/**
 * Number 10 - Malkuth - Oxalá/Ofun
 * The Renovator - Endings, beginnings, transition
 */
const DEZ: NumberMysticism = {
  numero: 10,
  significado: 'O Renovador, A Mudança - A transformação, o retorno ao eixo central e a manifestação prática',
  sephirah_correspondente: 'Malkuth',
  orixa_associado: 'Oxalá / Ofun',
  elemento: 'Terra',
  planeta_regente: 'Plutão',
  energia_caracteristica: 'Renovação, transformação profunda, cycles de fim e começo, manifestação material',
};

/**
 * Number 11 - (Master Number) - Alafia
 * The Channel / Awakened - Intuition, spiritual insight
 */
const ONZE: NumberMysticism = {
  numero: 11,
  significado: 'O Canalizador, O Desperto - A intuição elevada, a espiritualidade e o alinhamento completo',
  sephirah_correspondente: 'Kether / Tiphereth',
  orixa_associado: 'Alafia / Orunmilá',
  elemento: 'Éter',
  planeta_regente: 'Netuno',
  energia_caracteristica: 'Intuição espiritual, channeling, inspiração divina, iluminação e alinhamento completo',
};

/**
 * Number 12 - Ejilsebora
 * The Justice - Purification, just war, transformation
 */
const DOZE: NumberMysticism = {
  numero: 12,
  significado: 'A Justiça, O Fogo Purificador - A guerra justa, a transformação por provações e o equilíbrio da lei',
  sephirah_correspondente: 'Geburah',
  orixa_associado: 'Xangô / Ejilsebora',
  elemento: 'Fogo',
  planeta_regente: 'Marte',
  energia_caracteristica: 'Justiça divina, coragem moral, integridade, fogo purificador e equilíbrio razão-emoção',
};

/**
 * Number 13 - Olobón
 * The Transformation - Death and rebirth, endings
 */
const TREZE: NumberMysticism = {
  numero: 13,
  significado: 'A Evolução, A Morte e Renascimento - O fim de ciclos, a transformação física e o recolhimento',
  sephirah_correspondente: 'Malkuth',
  orixa_associado: 'Nanã / Omolu / Olobón',
  elemento: 'Terra',
  planeta_regente: 'Saturno',
  energia_caracteristica: 'Transformação profunda, encerramento de ciclos, sabedoria dos mais velhos e evolução espiritual',
};

/**
 * Complete lookup table for numbers 1-13
 */
const NUMERO_MISTICISMO_MAP: Record<number, NumberMysticism> = {
  1: UM,
  2: DOIS,
  3: TRES,
  4: QUATRO,
  5: CINCO,
  6: SEIS,
  7: SETE,
  8: OITO,
  9: NOVE,
  10: DEZ,
  11: ONZE,
  12: DOZE,
  13: TREZE,
};

/**
 * Returns the mystical correlation for a given number (1-13)
 * @param numero - The number to look up (must be 1-13)
 * @returns NumberMysticism object with all correlations
 * @throws Error if number is outside valid range
 */
export function getNumberMysticism(numero: number): NumberMysticism {
  if (numero < 1 || numero > 13) {
    throw new Error(`Número fora do intervalo válido (1-13). Recebido: ${numero}`);
  }
  return NUMERO_MISTICISMO_MAP[numero];
}

/**
 * Get all number mysticism mappings
 * @returns Array of all NumberMysticism objects for numbers 1-13
 */
export function getAllNumberMysticism(): NumberMysticism[] {
  return Object.values(NUMERO_MISTICISMO_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Get numbers filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of NumberMysticism objects matching the element
 */
export function getNumbersByElement(elemento: string): NumberMysticism[] {
  return getAllNumberMysticism().filter(
    (m) => m.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get numbers filtered by Orixá
 * @param orixa - Orixá name to search for
 * @returns Array of NumberMysticism objects associated with the Orixá
 */
export function getNumbersByOrixa(orixa: string): NumberMysticism[] {
  return getAllNumberMysticism().filter((m) =>
    m.orixa_associado.toLowerCase().includes(orixa.toLowerCase())
  );
}

/**
 * Get numbers filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of NumberMysticism objects with the matching Sephirah
 */
export function getNumbersBySephirah(sephirah: string): NumberMysticism[] {
  return getAllNumberMysticism().filter((m) =>
    m.sephirah_correspondente.toLowerCase().includes(sephirah.toLowerCase())
  );
}

/**
 * Get numbers filtered by planet
 * @param planeta - Planet name to search for
 * @returns Array of NumberMysticism objects ruled by the planet
 */
export function getNumbersByPlaneta(planeta: string): NumberMysticism[] {
  return getAllNumberMysticism().filter((m) =>
    m.planeta_regente.toLowerCase().includes(planeta.toLowerCase())
  );
}