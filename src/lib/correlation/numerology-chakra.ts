/**
 * Numerology-Chakra Spiritual Correlation
 * Maps numerology numbers (1-13) to their corresponding chakras, energy meanings,
 * and aligned spiritual practices.
 * 
 * Based on Cabala dos Caminhos hermetic principles and IDEIA.md system data.
 */

import type { ChakraName } from './chakra-element';

export type ChakraName = 
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

/**
 * Numerology-Chakra spiritual correlation mapping
 */
export interface NumerologyChakra {
  /** The numerology number (1-13) */
  numero: number;
  /** The chakra influenced by this number */
  chakra: ChakraName;
  /** Chakra position description */
  chakra_posicao: string;
  /** The energy meaning / archetype vibration */
  energia_significado: string;
  /** Aligned spiritual practice for this number-chakra correlation */
  pratica_espiritual: string;
}

/**
 * Number 1 - Muladhara (Root Chakra)
 * O Iniciador - Impulse, beginning, leadership, individual identity
 * Chakra: Raiz - Conexão com a terra, força de vontade primal
 */
const UM: NumerologyChakra = {
  numero: 1,
  chakra: 'Muladhara',
  chakra_posicao: '1º Chakra - Raiz',
  energia_significado: 'Força de vontade, pioneirismo, identidade individual, impulso de criar e liderar',
  pratica_espiritual: 'Aterramento profundo com visualização da raiz vermelha, meditação LAM (396 Hz), trabalho com medos de sobrevivência',
};

/**
 * Number 2 - Svadhisthana (Sacral Chakra)
 * O Diplomata - Duality, partnerships, receptivity, emotional flow
 * Chakra: Sacral - Criatividade, fluidez emocional, intimidade
 */
const DOIS: NumerologyChakra = {
  numero: 2,
  chakra: 'Svadhisthana',
  chakra_posicao: '2º Chakra - Sacral',
  energia_significado: 'Receptividade, parcerias, adaptabilidade, sensibilidade emocional e conexão íntima',
  pratica_espiritual: 'Transmutação criativa com dança sagrada,练习 fluidez emocional, meditação VAM (417 Hz)',
};

/**
 * Number 3 - Manipura (Solar Plexus Chakra)
 * O Comunicador - Expression, creativity, optimism, social energy
 * Chakra: Plexo Solar - Poder pessoal, vontade, transformação
 */
const TRES: NumerologyChakra = {
  numero: 3,
  chakra: 'Manipura',
  chakra_posicao: '3º Chakra - Plexo Solar',
  energia_significado: 'Criatividade, comunicação expressiva, otimismo, sociabilidade e expressão artística',
  pratica_espiritual: 'Quebra de medos com fogo interior, prática de autoexpressão autêntica, meditação RAM (528 Hz)',
};

/**
 * Number 4 - Manipura (Solar Plexus Chakra)
 * O Construtor - Structure, stability, discipline, foundation
 * Chakra: Plexo Solar - Disciplina, organização, trabalho perseverante
 */
const QUATRO: NumerologyChakra = {
  numero: 4,
  chakra: 'Manipura',
  chakra_posicao: '3º Chakra - Plexo Solar',
  energia_significado: 'Estabilidade, disciplina, organização, construção de bases sólidas e trabalho perseverante',
  pratica_espiritual: 'Ativação do fogo interior com rotina de disciplina, práticas de organização sagrada, visualização solar',
};

/**
 * Number 5 - Anahata (Heart Chakra)
 * O Viajante - Freedom, change, learning, heart-centered expansion
 * Chakra: Cardíaco - Amor incondicional, expansão, compaixão
 */
const CINCO: NumerologyChakra = {
  numero: 5,
  chakra: 'Anahata',
  chakra_posicao: '4º Chakra - Cardíaco',
  energia_significado: 'Liberdade interior, adaptação, curiosidade, expansão do amor e transformação alquímica',
  pratica_espiritual: 'Expansão do afeto incondicional com metta bhavana, práticas de perdão, meditação YAM (639 Hz)',
};

/**
 * Number 6 - Anahata (Heart Chakra)
 * O Harmonizador - Balance, beauty, responsibility, unconditional love
 * Chakra: Cardíaco - Harmonia, beleza, serviço ao próximo
 */
const SEIS: NumerologyChakra = {
  numero: 6,
  chakra: 'Anahata',
  chakra_posicao: '4º Chakra - Cardíaco',
  energia_significado: 'Harmonia, amor incondicional, responsabilidade, beleza e equilíbrio entre dar e receber',
  pratica_espiritual: 'Cura emocional através do coração, prática de compaixão infinita, abertura do peito para luz verde',
};

/**
 * Number 7 - Ajna (Third Eye Chakra)
 * O Filósofo - Introspection, wisdom, understanding, inner truth
 * Chakra: Frontal - Intuição, visão clara, percepção além dos sentidos
 */
const SETE: NumerologyChakra = {
  numero: 7,
  chakra: 'Ajna',
  chakra_posicao: '6º Chakra - Frontal',
  energia_significado: 'Introspecção, sabedoria interior, misticismo, busca da verdade e compreensão profunda',
  pratica_espiritual: 'Despertar da intuição com visualização do terceiro olho, prática de silêncio interior, meditação OM (852 Hz)',
};

/**
 * Number 8 - Vishuddha (Throat Chakra)
 * O Executivo - Authority, efficiency, karma, manifestation through speech
 * Chakra: Laríngeo - Comunicação verdadeira, expressão autêntica, poder da palavra
 */
const OITO: NumerologyChakra = {
  numero: 8,
  chakra: 'Vishuddha',
  chakra_posicao: '5º Chakra - Laríngeo',
  energia_significado: 'Resiliência, autoridade interior, verdade falada, gestão de recursos e poder de ação',
  pratica_espiritual: 'Purificação da comunicação com canto de mantras, prática da verdade autêntica, despertar do poder da palavra',
};

/**
 * Number 9 - Sahasrara (Crown Chakra)
 * O Sábio - Completion, humanitarianism, spiritual wisdom, universal compassion
 * Chakra: Coronário - Iluminação, transcendência, conexão com o divino
 */
const NOVE: NumerologyChakra = {
  numero: 9,
  chakra: 'Sahasrara',
  chakra_posicao: '7º Chakra - Coronário',
  energia_significado: 'Humanitarismo, compaixão universal, sabedoria espiritual, encerramento de ciclos e iluminação',
  pratica_espiritual: 'Conexão espiritual direta com prática de silêncio profundo, meditação AUM (963 Hz), surrender ao divino',
};

/**
 * Number 10 - Muladhara (Root Chakra)
 * O Renovador - Endings, beginnings, transformation, practical manifestation
 * Chakra: Raiz - Renovação, transformação profunda, manifestação material
 */
const DEZ: NumerologyChakra = {
  numero: 10,
  chakra: 'Muladhara',
  chakra_posicao: '1º Chakra - Raiz',
  energia_significado: 'Renovação, transformação profunda, manifestação prática, fim de ciclos e retorno ao centro',
  pratica_espiritual: 'Dissolução de padrões antigos com visualização da raiz vermelha expandida, trabalho com medos de transformação',
};

/**
 * Number 11 - Ajna (Third Eye Chakra) - Master Number
 * O Canalizador - Intuition, spiritual insight, awakened consciousness
 * Chakra: Frontal - Canalização espiritual, inspiração divina, intuição elevada
 */
const ONZE: NumerologyChakra = {
  numero: 11,
  chakra: 'Ajna',
  chakra_posicao: '6º Chakra - Frontal',
  energia_significado: 'Intuição espiritual elevada, channeling, inspiração divina, iluminação e alinhamento completo com a alma',
  pratica_espiritual: 'Despertar da visão clara com prática de percepção sutil, meditação de intuição direta, abertura do selo de Salomão',
};

/**
 * Number 12 - Manipura (Solar Plexus Chakra)
 * A Justiça - Purification, just war, transformation through trials
 * Chakra: Plexo Solar - Justiça divina, fogo purificador, integridade
 */
const DOZE: NumerologyChakra = {
  numero: 12,
  chakra: 'Manipura',
  chakra_posicao: '3º Chakra - Plexo Solar',
  energia_significado: 'Justiça divina, coragem moral, integridade, fogo purificador e equilíbrio entre razão e emoção',
  pratica_espiritual: 'Purificação do ego com práticas de fogo interior, trabalho com sombras, integração do guerreiro sagrado',
};

/**
 * Number 13 - Sahasrara (Crown Chakra)
 * A Evolução - Death and rebirth, endings, profound transformation
 * Chakra: Coronário - Transformação espiritual, encerramento de ciclos, evolução da consciência
 */
const TREZE: NumerologyChakra = {
  numero: 13,
  chakra: 'Sahasrara',
  chakra_posicao: '7º Chakra - Coronário',
  energia_significado: 'Transformação profunda, encerramento de ciclos kármicos, sabedoria dos mestres, evolução espiritual radical',
  pratica_espiritual: 'Morte e renascimento interior com prática de soltar o ego, meditação de transcendência, conexão com mestres ascensionados',
};

/**
 * Complete lookup table for numbers 1-13
 */
const NUMEROLOGIA_CHAKRA_MAP: Record<number, NumerologyChakra> = {
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
 * Returns the numerology-chakra correlation for a given number (1-13).
 * @param numero - The numerology number to look up (must be 1-13)
 * @returns NumerologyChakra object with chakra correlation
 * @throws Error if number is outside valid range
 */
export function getNumerologyChakra(numero: number): NumerologyChakra {
  if (numero < 1 || numero > 13) {
    throw new Error(`Número fora do intervalo válido (1-13). Recebido: ${numero}`);
  }
  return NUMEROLOGIA_CHAKRA_MAP[numero];
}

/**
 * Returns all numerology numbers associated with a given chakra.
 * @param chakra - The chakra name to search for
 * @returns Array of NumerologyChakra objects associated with the chakra
 */
export function getChakraNumerology(chakra: string): NumerologyChakra[] {
  const normalizedChakra = normalizeChakraName(chakra);
  return getAllNumerologyChakras().filter(
    (nc) => nc.chakra.toLowerCase() === normalizedChakra.toLowerCase()
  );
}

/**
 * Returns all numerology-chakra mappings (1-13).
 * @returns Array of all NumerologyChakra objects
 */
export function getAllNumerologyChakras(): NumerologyChakra[] {
  return Object.values(NUMEROLOGIA_CHAKRA_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Normalizes chakra name to match ChakraName type.
 */
function normalizeChakraName(chakra: string): string {
  const chakraMap: Record<string, string> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    'raiz': 'Muladhara',
    '1º básico': 'Muladhara',
    '1º Básico': 'Muladhara',
    'sacral': 'Svadhisthana',
    '2º sacro': 'Svadhisthana',
    '2º Sacro': 'Svadhisthana',
    'plexo solar': 'Manipura',
    '3º plexo solar': 'Manipura',
    '3º Plexo Solar': 'Manipura',
    'cardíaco': 'Anahata',
    '4º cardíaco': 'Anahata',
    '4º Cardíaco': 'Anahata',
    'laríngeo': 'Vishuddha',
    '5º laríngeo': 'Vishuddha',
    '5º Laríngeo': 'Vishuddha',
    'frontal': 'Ajna',
    '6º frontal': 'Ajna',
    '6º Frontal': 'Ajna',
    'terceiro olho': 'Ajna',
    'coronário': 'Sahasrara',
    '7º coronário': 'Sahasrara',
    '7º Coronário': 'Sahasrara',
    'coroa': 'Sahasrara',
  };
  return chakraMap[chakra.toLowerCase()] ?? chakra;
}
