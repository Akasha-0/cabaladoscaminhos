/**
 * Orixá-Sephirah Spiritual Correlation Module
 * Maps Orixás from Candomblé/Umbanda to the Kabbalistic Sephiroth (Tree of Life)
 * Based on Cabala dos Caminhos framework
 */

import type { ElementoTipo } from './sephirot-element';

/**
 * Represents the correlation between an Orixá and a Sephirah
 */
export interface OrixaSephirah {
  /** The Orixá name in Portuguese */
  orixa: string;
  /** The associated Sephirah name (Hebrew/English) */
  sephirah: string;
  /** The primary element connecting Orixá to Sephirah */
  elemento: ElementoTipo;
  /** Spiritual meaning of this Orixá-Sephirah correlation */
  significado_espiritual: string;
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Secondary Sephiroth connections if any */
  sephirot_secundarias?: string[];
}

/**
 * Main Orixá-Sephirah mappings based on traditional correlations
 * Integrates Candomblé/Umbanda energy systems with Kabbalistic Tree of Life
 */
const ORIXAS_SEPHIROT_MAP: Record<string, OrixaSephirah> = {
  'Oxalá': {
    orixa: 'Oxalá',
    sephirah: 'Kether',
    elemento: 'Éter',
    significado_espiritual: 'Pureza Divina — Oxalá, o Criador, conecta-se a Kether, a Coroa da Árvore da Vida. Ambos representam a origem absoluta, o princípio primeiro antes da manifestação. O éter de Oxalá é a luz primordial que precede todos os elementos.',
    numero_caminho: 1,
    sephirot_secundarias: ['Chokmah'],
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    sephirah: 'Binah',
    elemento: 'Água',
    significado_espiritual: 'Mãe Divina — Iemanjá, a Rainha do Mar, alinha-se com Binah, a Entendimento. Ambas são forças matriciais, geradoras de vida. A água de Iemanjá representa o fluxo criativo primordial que Binah canaliza na formação do universo.',
    numero_caminho: 3,
    sephirot_secundarias: ['Chokmah'],
  },
  'Oxum': {
    orixa: 'Oxum',
    sephirah: 'Tiphereth',
    elemento: 'Água',
    significado_espiritual: 'Beleza e Harmonia — Oxum, a riqueza das águas doces, corresponde a Tiphereth, a Beleza no centro da Árvore. Ambas representam o ponto de equilíbrio entre polaridades, a harmonização das águas superiores e inferiores.',
    numero_caminho: 6,
    sephirot_secundarias: ['Netzach', 'Yesod'],
  },
  'Ogum': {
    orixa: 'Ogum',
    sephirah: 'Geburah',
    elemento: 'Fogo',
    significado_espiritual: 'Força e Conquista — Ogum, o guerreiro ferreiro, conecta-se a Geburah, a Severidade. Ambos são agentes de transformação através da ação, o fogo que corta e forja. A energia marciana de Ogum corresponde à ira divina de Geburah.',
    numero_caminho: 5,
    sephirot_secundarias: ['Hod'],
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    sephirah: 'Chesed',
    elemento: 'Terra',
    significado_espiritual: 'Abundância e Verdade — Oxóssi, o caçador divisor de destinos, alinha-se com Chesed, a Misericórdia. Ambos governam sobre a distribuição de recursos e o conhecimento das leis naturais. O excesso de Oxóssi corresponde à expansão infinita de Chesed.',
    numero_caminho: 4,
    sephirot_secundarias: ['Netzach'],
  },
  'Xangô': {
    orixa: 'Xangô',
    sephirah: 'Tiphereth',
    elemento: 'Fogo',
    significado_espiritual: 'Justiça e Poder — Xangô, o rei do trovão, conecta-se a Tiphereth através do Sol. Ambas são fontes de luz, comando e equilíbrio entre extremos. O fogo de Xangô ilumina como o Sol de Tiphereth, despertando a consciência e revelando verdades ocultas.',
    numero_caminho: 6,
    sephirot_secundarias: ['Geburah', 'Hod'],
  },
  'Iansã': {
    orixa: 'Iansã',
    sephirah: 'Netzach',
    elemento: 'Fogo',
    significado_espiritual: 'Vitória e Tempestade — Iansã, senhora das batalhas e ventos, corresponde a Netzach, a Vitória. Ambas representam a força que supera obstáculos, o vento que limpa e renova. A urânica Iansã antecipa a transformação de Netzach.',
    numero_caminho: 7,
    sephirot_secundarias: ['Geburah', 'Tiphereth'],
  },
  'Omolu': {
    orixa: 'Omolu',
    sephirah: 'Malkuth',
    elemento: 'Terra',
    significado_espiritual: 'Aterramento e Transformação — Omolu, senhor das doenças e curas, conecta-se a Malkuth, o Reino. Ambos governam sobre a materialidade, o corpo físico e os processos de decomposição e regeneração. O接地 de Omolu é a manifestação última de Malkuth.',
    numero_caminho: 10,
    sephirot_secundarias: ['Yesod'],
  },
  'Nanã': {
    orixa: 'Nanã',
    sephirah: 'Binah',
    elemento: 'Água',
    significado_espiritual: 'Sabedoria Ancestral — Nanã, a anciã das águas primordiais, conecta-se a Binah pelo limiar do tempo. Ambas são forças de encerramento e renovação, governando sobre a transformação através da dissolução. A saturniana Nanã aguarda a sabedoria de Binah.',
    numero_caminho: 3,
    sephirot_secundarias: ['Chokmah', 'Yesod'],
  },
};

/**
 * Get Orixá-Sephirah correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaSephirah mapping or undefined if not found
 */
export function getOrixaSephirot(orixa: string): OrixaSephirah | undefined {
  const normalized = orixa.trim();
  return ORIXAS_SEPHIROT_MAP[normalized] || Object.values(ORIXAS_SEPHIROT_MAP).find(
    entry => entry.orixa.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get the reverse mapping: Sephirah to associated Orixás
 * @returns Record mapping each Sephirah name to its associated Orixá names
 */
export function getSephirotOrixa(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  
  for (const entry of Object.values(ORIXAS_SEPHIROT_MAP)) {
    const sephirah = entry.sephirah;
    if (!result[sephirah]) {
      result[sephirah] = [];
    }
    result[sephirah].push(entry.orixa);
    
    // Also include secondary sephirot
    if (entry.sephirot_secundarias) {
      for (const secondary of entry.sephirot_secundarias) {
        if (!result[secondary]) {
          result[secondary] = [];
        }
        if (!result[secondary].includes(entry.orixa)) {
          result[secondary].push(entry.orixa);
        }
      }
    }
  }
  
  return result;
}

/**
 * Get all Orixá-Sephirah mappings
 * @returns Array of all OrixaSephirah objects
 */
export function getAllOrixaSephiroths(): OrixaSephirah[] {
  return Object.values(ORIXAS_SEPHIROT_MAP);
}

export default {
  getOrixaSephirot,
  getSephirotOrixa,
  getAllOrixaSephiroths,
};