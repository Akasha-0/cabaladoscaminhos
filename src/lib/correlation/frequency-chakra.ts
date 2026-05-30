/**
 * Frequency-Chakra Correlation Module
 * Based on Solfeggio frequencies mapped to spiritual geometry
 * Source: IDEIA.md - Matriz de Geometria Sagrada, Frequências Solfeggio e Sons Divinos
 */

export interface FrequencyChakra {
  frequencia: number;
  chakra: string;
  chakra_numero: number;
  poliedro_platao: string;
  mantram_som_semente: string;
  nome_divino_cabala: string;
  direcao_elemental: string;
  elemento_regente: string;
  dinamica: string;
}

/**
 * Complete mapping of the 7 Solfeggio frequencies to their corresponding
 * chakra, Platonic solid, seed sound, divine name, and elemental direction
 */
export const FREQUENCY_CHAKRA_MAP: Record<number, FrequencyChakra> = {
  396: {
    frequencia: 396,
    chakra: '1º Básico',
    chakra_numero: 1,
    poliedro_platao: 'Ponto / Cubo de Base',
    mantram_som_semente: 'LAM',
    nome_divino_cabala: 'ADONAI HA-ARETZ',
    direcao_elemental: 'Norte',
    elemento_regente: 'Terra',
    dinamica: 'Dissolução de medos de sobrevivência, ancoramento e firmeza material.',
  },
  417: {
    frequencia: 417,
    chakra: '2º Sacro',
    chakra_numero: 2,
    poliedro_platao: 'Cubo / Hexaedro',
    mantram_som_semente: 'VAM',
    nome_divino_cabala: 'ELOHIM GIBOR',
    direcao_elemental: 'Oeste',
    elemento_regente: 'Água',
    dinamica: 'Limpeza de traumas do passado, transmutação criativa e fluidez vital.',
  },
  528: {
    frequencia: 528,
    chakra: '3º Plexo Solar',
    chakra_numero: 3,
    poliedro_platao: 'Tetraedro',
    mantram_som_semente: 'RAM',
    nome_divino_cabala: 'SHADDAI EL CHAI',
    direcao_elemental: 'Oeste',
    elemento_regente: 'Fogo',
    dinamica: 'Transformação da força de vontade, quebra de medos e ativação do brilho.',
  },
  639: {
    frequencia: 639,
    chakra: '4º Cardíaco',
    chakra_numero: 4,
    poliedro_platao: 'Octaedro',
    mantram_som_semente: 'YAM',
    nome_divino_cabala: 'YHVH ELOAH VA-DAATH',
    direcao_elemental: 'Sul',
    elemento_regente: 'Ar / Água',
    dinamica: 'Expansão do afeto incondicional, harmonização de relacionamentos e cura.',
  },
  741: {
    frequencia: 741,
    chakra: '5º Laríngeo',
    chakra_numero: 5,
    poliedro_platao: 'Dodecaedro',
    mantram_som_semente: 'HAM',
    nome_divino_cabala: 'ELOHIM SABAOTH',
    direcao_elemental: 'Leste',
    elemento_regente: 'Ar',
    dinamica: 'Expressão da verdade interna, purificação e poder da palavra falada.',
  },
  852: {
    frequencia: 852,
    chakra: '6º Frontal',
    chakra_numero: 6,
    poliedro_platao: 'Icosaedro',
    mantram_som_semente: 'OM',
    nome_divino_cabala: 'YAH',
    direcao_elemental: 'Leste',
    elemento_regente: 'Éter / Ar',
    dinamica: 'Despertar da intuição profunda, visão clara e dissolução de ilusões.',
  },
  963: {
    frequencia: 963,
    chakra: '7º Coronário',
    chakra_numero: 7,
    poliedro_platao: 'Esfera (Unidade Total)',
    mantram_som_semente: 'AUM / SILÊNCIO',
    nome_divino_cabala: 'EHEIEH',
    direcao_elemental: 'Centro / Zênite',
    elemento_regente: 'Éter (Quintessência)',
    dinamica: 'Conexão espiritual direta com a Fonte e iluminação da mente.',
  },
};

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the frequency-chakra mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencyChakra mapping or null if not found
 */
export function getFrequencyChakra(frequencia: number): FrequencyChakra | null {
  return FREQUENCY_CHAKRA_MAP[frequencia] ?? null;
}

/**
 * Get all frequencies mapped to a specific chakra number (1-7)
 * @param chakraNumero - Chakra number (1-7)
 * @returns Array of FrequencyChakra mappings
 */
export function getFrequenciesByChakra(chakraNumero: number): FrequencyChakra[] {
  return Object.values(FREQUENCY_CHAKRA_MAP).filter(
    (mapping) => mapping.chakra_numero === chakraNumero
  );
}

/**
 * Get the seed sound (mantram) for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Mantram string or null if not found
 */
export function getMantramByFrequency(frequencia: number): string | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.mantram_som_semente ?? null;
}

/**
 * Get the divine name from Kabbalah for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Divine name string or null if not found
 */
export function getDivineNameByFrequency(frequencia: number): string | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.nome_divino_cabala ?? null;
}

/**
 * Get the Platonic solid geometry for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Platonic solid name or null if not found
 */
export function getPoliedroByFrequency(frequencia: number): string | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.poliedro_platao ?? null;
}

/**
 * Get the elemental direction for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Direction string or null if not found
 */
export function getDirectionByFrequency(frequencia: number): string | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.direcao_elemental ?? null;
}