/**
 * Element-Orixá Correlation Module
 * Maps spiritual elements to Orixás with their qualities and sacred practices
 * Reverse mapping of Orixá-Element correlations in the Cabala dos Caminhos framework
 */

import type { OrixaElement } from './orixa-element';

export type Elemento = OrixaElement['elemento_principal'];

export interface ElementOrixaMapping {
  elemento: Elemento;
  elemento_nome_portugues: string;
  orixa_principal: string;
  orixas_secundarios: string[];
  qualidades_espirituais: string[];
  praticas_sagradas: string[];
  associacoes_planetarias: string[];
  direcao_cardinal: string;
  estacao: string;
  momento_dia: string;
}

export type ElementoQualidade = {
  forca: string;
  desafio: string;
  licao: string;
  afirmacao: string;
};

// Element to Orixá mappings derived from orixa-element.ts reverse correlation
const ELEMENT_ORIXA_MAP: Record<Elemento, ElementOrixaMapping> = {
  fogo: {
    elemento: 'fogo',
    elemento_nome_portugues: 'Fogo',
    orixa_principal: 'Xangô',
    orixas_secundarios: ['Iansã', 'Ogum'],
    qualidades_espirituais: [
      'Paixão e propósito',
      'Coragem e transformação',
      'Liderança e determinação',
      'Energia criativa e ação',
      'Proteção e justiça',
      'Força de vontade'
    ],
    praticas_sagradas: [
      'Rezas a Xangô',
      'Consagração de espadas',
      'Defumação com Pau-brasil',
      'Rituais de proteção (Ogum)',
      'Danças guerreiras (Iansã)',
      'Acender velas vermelhas e laranjas'
    ],
    associacoes_planetarias: ['Sol', 'Marte'],
    direcao_cardinal: 'Sul',
    estacao: 'Verão',
    momento_dia: 'Meio-dia'
  },
  água: {
    elemento: 'água',
    elemento_nome_portugues: 'Água',
    orixa_principal: 'Iemanjá',
    orixas_secundarios: ['Oxum', 'Nanã'],
    qualidades_espirituais: [
      'Intuição e sabedoria emocional',
      'Maternidade e nutrição',
      'Purificação e limpeza espiritual',
      'Amor incondicional',
      'Fluidez e adaptabilidade',
      'Conexão com o inconsciente'
    ],
    praticas_sagradas: [
      'Oferendas na praia (Iemanjá)',
      'Banhos de ervas (Oxum)',
      'Rituais de limpeza',
      'Meditações à beira d\'água',
      'Rezas à Oxum (sábado)',
      'Rituais de fertilidade (Nanã)'
    ],
    associacoes_planetarias: ['Lua', 'Vênus', 'Netuno'],
    direcao_cardinal: 'Oeste',
    estacao: 'Inverno',
    momento_dia: 'Noite'
  },
  ar: {
    elemento: 'ar',
    elemento_nome_portugues: 'Ar',
    orixa_principal: 'Xangô',
    orixas_secundarios: ['Iansã', 'Oxalá'],
    qualidades_espirituais: [
      'Comunicação e expressão',
      'Liberdade e expansão mental',
      'Sabedoria e conhecimento',
      'Equilíbrio emocional',
      'Conexão espiritual',
      'Criatividade intelectual'
    ],
    praticas_sagradas: [
      'SOPÉ de Xangô',
      'Defumações com ervas secas',
      'Oração e meditação (Oxalá)',
      'Práticas de respiração',
      'Rituais de comunicação',
      'Xilogravuras de orixás'
    ],
    associacoes_planetarias: ['Mercúrio', 'Júpiter'],
    direcao_cardinal: 'Leste',
    estacao: 'Primavera',
    momento_dia: 'Manhã'
  },
  terra: {
    elemento: 'terra',
    elemento_nome_portugues: 'Terra',
    orixa_principal: 'Oxóssi',
    orixas_secundarios: ['Ogum', 'Omolu'],
    qualidades_espirituais: [
      'Abundância e prosperidade',
      'Ancoramento e estabilidade',
      'Conexão com a natureza',
      'Força física e resistência',
      'Sabedoria ancestral',
      'Cura e renovação'
    ],
    praticas_sagradas: [
      'Caminhadas na natureza (Oxóssi)',
      'Consagração de ferramentas',
      'Plantio de mudas',
      'Rituais de cura (Omolu)',
      'Oferendas de frutas frescas',
      'Catação de olhos de Oxóssi'
    ],
    associacoes_planetarias: ['Júpiter', 'Saturno'],
    direcao_cardinal: 'Norte',
    estacao: 'Outono',
    momento_dia: 'Entardecer'
  },
  éter: {
    elemento: 'éter',
    elemento_nome_portugues: 'Éter',
    orixa_principal: 'Oxalá',
    orixas_secundarios: ['Iemanjá'],
    qualidades_espirituais: [
      'Transcendência espiritual',
      'Paz interior e harmonia',
      'Sabedoria divina',
      'Criação e manifestação',
      'Pureza de intenção',
      'Conexão com o divino'
    ],
    praticas_sagradas: [
      'Rezas a Oxalá (sexta-feira)',
      'Uso do tapete sagrado (Xiré)',
      'Cerimônias de consagração',
      'Meditações profundas',
      'Rituais de cura espiritual',
      'Consagração de objetos brancos'
    ],
    associacoes_planetarias: ['Sol', 'Júpiter'],
    direcao_cardinal: 'Centro',
    estacao: 'Todas',
    momento_dia: 'Aurora e anoitecer'
  }
};

// Qualities associated with each element for spiritual diagnosis
const ELEMENTO_QUALIDADES: Record<Elemento, ElementoQualidade> = {
  fogo: {
    forca: 'Determinação, coragem, paixão transformadora',
    desafio: 'Impaciência, agressividade, controle excessivo',
    licao: 'Canalizar a energia em propósito construtivo',
    afirmacao: 'Eu transformo minha paixão em ação sagrada'
  },
  água: {
    forca: 'Intuição profunda, compaixão, adaptabilidade',
    desafio: 'Dificuldade em estabelecer limites, volatilidade emocional',
    licao: 'Manter a clareza emocional sem perder a sensibilidade',
    afirmacao: 'Eu fluo com a vida mantendo minha essência'
  },
  ar: {
    forca: 'Comunicação clara, objetividade, visão ampla',
    desafio: 'Superficialidade, indecisão, excesso de análise',
    licao: 'Ancorar pensamentos em ação concreta',
    afirmacao: 'Eu comunico minha verdade com clareza e amor'
  },
  terra: {
    forca: 'Paciência, confiabilidade, prática, ancoramento',
    desafio: 'Rigidez, materialismo, resistência a mudanças',
    licao: 'Equilibrar estabilidade com flexibilidade',
    afirmacao: 'Eu sou abundante e merecedor de prosperidade'
  },
  éter: {
    forca: 'Sabedoria, espiritualidade, conexão divina',
    desafio: 'Desconexão da realidade, idealismo excessivo',
    licao: 'Manifestar a luz espiritual no mundo físico',
    afirmacao: 'Eu sou um canal de luz e paz divina'
  }
};

/**
 * Get Element-Orixá correlation mapping
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns ElementOrixaMapping or undefined if not found
 */
export function getElementOrixa(elemento: string): ElementOrixaMapping | undefined {
  const normalized = elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const mapping: Record<string, Elemento> = {
    'fogo': 'fogo',
    'agua': 'água',
    'ar': 'ar',
    'terra': 'terra',
    'eter': 'éter'
  };
  const key = mapping[normalized];
  return key ? ELEMENT_ORIXA_MAP[key] : undefined;
}

/**
 * Get reverse mapping: Orixá to their primary element
 * @returns Record mapping each Orixá name to their element
 */
export function getOrixaElement(): Record<string, Elemento> {
  return {
    'Oxalá': 'éter',
    'Iemanjá': 'água',
    'Oxum': 'água',
    'Ogum': 'terra',
    'Oxóssi': 'terra',
    'Xangô': 'fogo',
    'Iansã': 'fogo',
    'Omolu': 'terra',
    'Nanã': 'água'
  };
}

/**
 * Get all Element-Orixá mappings
 * @returns Array of all ElementOrixaMapping objects
 */
export function getAllElementOrixas(): ElementOrixaMapping[] {
  return Object.values(ELEMENT_ORIXA_MAP);
}

/**
 * Get elemental quality and affirmation for spiritual diagnosis
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns ElementoQualidade with spiritual guidance or undefined
 */
export function getElementoQualidade(elemento: string): ElementoQualidade | undefined {
  const mapping = getElementOrixa(elemento);
  return mapping ? ELEMENTO_QUALIDADES[mapping.elemento] : undefined;
}

/**
 * Get Orixás by element type
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Object with primary and secondary Orixás
 */
export function getOrixasPorElemento(elemento: string): { principal: string; secundarios: string[] } | undefined {
  const mapping = getElementOrixa(elemento);
  if (!mapping) return undefined;
  return {
    principal: mapping.orixa_principal,
    secundarios: mapping.orixas_secundarios
  };
}

export default {
  getElementOrixa,
  getOrixaElement,
  getAllElementOrixas,
  getElementoQualidade,
  getOrixasPorElemento
};