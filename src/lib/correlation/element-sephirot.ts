/**
 * Element-Sephirot Spiritual Correlation Mapping
 * Maps the five classical elements to their corresponding Sephiroth on the Tree of Life
 * Based on traditional Kabbalistic and esoteric correspondences
 */

import type { Elemento } from './sephirot-element';

export type ElementoTipo = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

/**
 * Represents the correlation between an element and its Sephiroth correspondences
 */
export interface ElementSephirotMapping {
  /** Element name (lowercase) */
  elemento: ElementoTipo;
  /** Human-readable element name in Portuguese */
  elemento_nome_portugues: string;
  /** Primary associated Sephirah */
  sephirah_principal: string;
  /** Secondary associated Sephiroth */
  sephirot_secundarios: string[];
  /** Chakra connection for this element-sephirot correlation */
  chakra: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Spiritual meaning of this element-sephirot connection */
  significado_espiritual: string;
  /** Path number on the Tree of Life (primary) */
  numero_caminho: number;
  /** Elemental qualities for spiritual work */
  qualidades_elementais: string[];
  /** Practices for elemental-spiritual work */
  praticas_espirituais: string[];
  /** Planetary associations */
  planetas: string[];
  /** Sacred colors */
  cores: string[];
}

// Element to Sephirot mappings derived from sephirot-element.ts reverse correlation
const ELEMENT_SEPHIROT_MAP: Record<ElementoTipo, ElementSephirotMapping> = {
  fogo: {
    elemento: 'fogo',
    elemento_nome_portugues: 'Fogo',
    sephirah_principal: 'Geburah',
    sephirot_secundarios: ['Tiphereth'],
    chakra: '3º Plexo Solar',
    chakra_numero: 3,
    significado_espiritual: 'Força Transmutadora / Guerra Santa / Propósito de Vida',
    numero_caminho: 5,
    qualidades_elementais: [
      'Coragem e determinação',
      'Energia de transformação',
      'Vontade forte e ação',
      'Justiça e equilíbrio',
      'Liderança e dinamismo',
      'Purificação por meio do calor'
    ],
    praticas_espirituais: [
      'Meditações diante do fogo',
      'Rituais de proteção (Geburah)',
      'Visualizações solares',
      'Cerimônias de coragem',
      'Trabalho com espadas e elementos ígneos',
      'Afirmações de poder pessoal'
    ],
    planetas: ['Sol', 'Marte'],
    cores: ['Vermelho', 'Laranja', 'Dourado']
  },
  água: {
    elemento: 'água',
    elemento_nome_portugues: 'Água',
    sephirah_principal: 'Chesed',
    sephirot_secundarios: ['Netzach', 'Yesod'],
    chakra: '2º Sacro',
    chakra_numero: 2,
    significado_espiritual: 'Expansão Abundante / Emoções Fluidas / Imaginação Profunda',
    numero_caminho: 4,
    qualidades_elementais: [
      'Intuição e sabedoria emocional',
      'Fluidez e adaptabilidade',
      'Amor incondicional',
      'Maternidade e nutrição',
      'Purificação e limpeza',
      'Conexão com o inconsciente'
    ],
    praticas_espirituais: [
      'Meditações à beira d\'água',
      'Rituais de Chesed (misericórdia)',
      'Banhos de ervas purificadoras',
      'Visualizações aquáticas',
      'Trabalho com a lua',
      'Afirmações de abundância emocional'
    ],
    planetas: ['Lua', 'Vênus', 'Netuno'],
    cores: ['Azul', 'Azul Escuro', 'Prata']
  },
  ar: {
    elemento: 'ar',
    elemento_nome_portugues: 'Ar',
    sephirah_principal: 'Hod',
    sephirot_secundarios: ['Binah'],
    chakra: '5º Laríngeo',
    chakra_numero: 5,
    significado_espiritual: 'Glória Intelectual / Comunicação Divina / Verdade e Estrutura',
    numero_caminho: 8,
    qualidades_elementais: [
      'Comunicação clara e expressão',
      'Intelecto e análise',
      'Liberdade mental',
      'Discernimento superior',
      'Verdade e integridade',
      'Conexão com saberes ocultos'
    ],
    praticas_espirituais: [
      'Exercícios de respiração consciente',
      'Rituais de Hod (glória)',
      'Defumações com ervas aromáticas',
      'Práticas de meditação vocal',
      'Estudo de textos sagrados',
      'Afirmações de clareza mental'
    ],
    planetas: ['Mercúrio', 'Júpiter'],
    cores: ['Amarelo', 'Branco', 'Azul Claro']
  },
  terra: {
    elemento: 'terra',
    elemento_nome_portugues: 'Terra',
    sephirah_principal: 'Malkuth',
    sephirot_secundarios: [],
    chakra: '1º Básico',
    chakra_numero: 1,
    significado_espiritual: 'Manifestação Material / Aterramento / Reino Corpóreo',
    numero_caminho: 10,
    qualidades_elementais: [
      'Ancoramento e estabilidade',
      'Força física e resistência',
      'Abundância material',
      'Ancestralidade e tradição',
      'Paciência e perseverança',
      'Conexão com o mundo físico'
    ],
    praticas_espirituais: [
      'Rituais de aterramento',
      'Trabalho com Malkuth (reino)',
      'Conexão com ancestrais',
      'Trabalho com cristais e pedras',
      'Cultivo da terra e plantas',
      'Afirmações de prosperidade'
    ],
    planetas: ['Júpiter', 'Saturno'],
    cores: ['Verde', 'Marrom', 'Preto']
  },
  éter: {
    elemento: 'éter',
    elemento_nome_portugues: 'Éter',
    sephirah_principal: 'Kether',
    sephirot_secundarios: ['Chokmah'],
    chakra: '7º Coronário',
    chakra_numero: 7,
    significado_espiritual: 'Pureza Divina / Coroa Espiritual / Impulso Primordial',
    numero_caminho: 11,
    qualidades_elementais: [
      'Transcendência espiritual',
      'Conexão com o divino',
      'Pureza de intenção',
      'Unidade primordial',
      'Criação e manifestação',
      'Sabedoria além da forma'
    ],
    praticas_espirituais: [
      'Meditações profundas de expansão',
      'Rituais de Kether (coroa)',
      'Visualizações de luz branca',
      'Cerimônias de consagração',
      'Trabalho com a glândula pineal',
      'Afirmações de alinhamento divino'
    ],
    planetas: ['Sol', 'Júpiter'],
    cores: ['Branco', 'Dourado', 'Violeta']
  }
};

/**
 * Get Element-Sephirot correlation mapping
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns ElementSephirotMapping or undefined if not found
 */
export function getElementSephirot(elemento: string): ElementSephirotMapping | undefined {
  const normalized = elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const mapping: Record<string, ElementoTipo> = {
    'fogo': 'fogo',
    'agua': 'água',
    'ar': 'ar',
    'terra': 'terra',
    'eter': 'éter'
  };
  const key = mapping[normalized];
  return key ? ELEMENT_SEPHIROT_MAP[key] : undefined;
}

/**
 * Get reverse mapping: Sephirah to their primary element
 * @returns Record mapping each Sephirah name to their element
 */
export function getSephirotElement(): Record<string, ElementoTipo> {
  return {
    'Kether': 'éter',
    'Chokmah': 'éter',
    'Binah': 'ar',
    'Chesed': 'água',
    'Geburah': 'fogo',
    'Tiphereth': 'fogo',
    'Netzach': 'água',
    'Hod': 'ar',
    'Yesod': 'água',
    'Malkuth': 'terra'
  };
}

/**
 * Get all Element-Sephirot mappings
 * @returns Array of all ElementSephirotMapping objects
 */
export function getAllElementSephiroths(): ElementSephirotMapping[] {
  return Object.values(ELEMENT_SEPHIROT_MAP);
}

/**
 * Get the primary Sephirah for an element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns The primary Sephirah name or undefined
 */
export function getPrimarySephirot(elemento: string): string | undefined {
  return getElementSephirot(elemento)?.sephirah_principal;
}

/**
 * Get secondary Sephiroth for an element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Array of secondary Sephirah names or empty array
 */
export function getSecondarySephirot(elemento: string): string[] {
  return getElementSephirot(elemento)?.sephirot_secundarios ?? [];
}

export default {
  getElementSephirot,
  getSephirotElement,
  getAllElementSephiroths,
  getPrimarySephirot,
  getSecondarySephirot
};