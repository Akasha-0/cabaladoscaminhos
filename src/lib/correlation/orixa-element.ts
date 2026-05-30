/**
 * Orixá-Element Correlation Module
 * Maps Orixás to spiritual elements, planets, days, colors and ritual tools
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

export interface OrixaElement {
  orixa: string;
  elemento_principal: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  planeta_regente: string;
  dia_da_semana: string;
  cores_principais: string[];
  ferramentas: string[];
  elementos_secundarios?: string[];
  planeta_secundario?: string;
}

// Main Orixá mappings based on IDEIA.md
const ORIXAS_MAP: Record<string, OrixaElement> = {
  'Oxalá': {
    orixa: 'Oxalá',
    elemento_principal: 'éter',
    planeta_regente: 'Sol',
    dia_da_semana: 'Sexta-feira',
    cores_principais: ['Branco', 'Marfim', 'Opala'],
    ferramentas: [
      'Boldo (Tapete de Oxalá)',
      'Saião',
      'Manjericão Branco',
      'Algodoeiro',
      'Colônia'
    ],
    elementos_secundarios: ['fogo'],
    planeta_secundario: 'Júpiter'
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    elemento_principal: 'água',
    planeta_regente: 'Lua',
    dia_da_semana: 'Sábado',
    cores_principais: ['Azul Escuro', 'Branco', 'Transparente'],
    ferramentas: [
      'Colônia',
      'Alcaparra',
      'Folha de Lágrima-de-Nossa-Senhora',
      'Pata-de-vaca',
      'Erva-de-Santa-Luzia'
    ],
    elementos_secundarios: ['éter'],
    planeta_secundario: 'Netuno'
  },
  'Oxum': {
    orixa: 'Oxum',
    elemento_principal: 'água',
    planeta_regente: 'Vênus',
    dia_da_semana: 'Sábado',
    cores_principais: ['Rosa', 'Amarelo-ouro', 'Azul-celeste'],
    ferramentas: [
      'Erva-doce',
      'Calêndula',
      'Camomila',
      'Folha de Dinheiro-em-penca',
      'Melissa',
      'Rosa Branca/Amarela'
    ]
  },
  'Ogum': {
    orixa: 'Ogum',
    elemento_principal: 'terra',
    planeta_regente: 'Marte',
    dia_da_semana: 'Terça-feira',
    cores_principais: ['Azul Claro', 'Vermelho', 'Verde'],
    ferramentas: [
      'Espada-de-são-jorge',
      'Quebra-demanda',
      'Guiné',
      'Aroeira',
      'Losna',
      'Folha de Manga'
    ],
    elementos_secundarios: ['fogo'],
    planeta_secundario: 'Plutão'
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    elemento_principal: 'terra',
    planeta_regente: 'Júpiter',
    dia_da_semana: 'Quinta-feira',
    cores_principais: ['Verde', 'Azul-turquesa'],
    ferramentas: [
      'Guiné',
      'Alecrim',
      'Samambaia',
      'Folha de Jurema',
      'Arruda',
      'Eucalipto',
      'Peregum Verde'
    ]
  },
  'Xangô': {
    orixa: 'Xangô',
    elemento_principal: 'fogo',
    planeta_regente: 'Sol',
    dia_da_semana: 'Quarta-feira',
    cores_principais: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    ferramentas: [
      'Quebra-pedra',
      'Erva-de-são-joão',
      'Folha de Café',
      'Manjericão Roxo',
      'Levante'
    ],
    elementos_secundarios: ['ar'],
    planeta_secundario: 'Marte'
  },
  'Iansã': {
    orixa: 'Iansã',
    elemento_principal: 'fogo',
    planeta_regente: 'Urano',
    dia_da_semana: 'Terça-feira',
    cores_principais: ['Laranja', 'Amarelo', 'Vermelho', 'Coral'],
    ferramentas: [
      'Pinhão Roxo',
      'Espada-de-santa-bárbara',
      'Bambu',
      'Folha de Fumo',
      'Louro',
      'Manjericão Roxo'
    ],
    elementos_secundarios: ['ar'],
    planeta_secundario: 'Plutão'
  },
  'Omolu': {
    orixa: 'Omolu',
    elemento_principal: 'terra',
    planeta_regente: 'Saturno',
    dia_da_semana: 'Segunda-feira',
    cores_principais: ['Preto', 'Branco', 'Vermelho', 'Violeta'],
    ferramentas: [
      'Canela-de-velho',
      'Assa-peixe',
      'Erva-de-bicho',
      'Vassourinha de Relógio',
      'Manjericão Roxo'
    ]
  },
  'Nanã': {
    orixa: 'Nanã',
    elemento_principal: 'água',
    planeta_regente: 'Saturno',
    dia_da_semana: 'Terça-feira',
    cores_principais: ['Lilás', 'Roxo', 'Azul-violeta'],
    ferramentas: [
      'Manjericão Roxo',
      'Assa-peixe',
      'Folha de Mostarda',
      'Trapoeraba Roxa',
      'Avenca'
    ],
    elementos_secundarios: ['terra'],
    planeta_secundario: 'Lua'
  }
};

/**
 * Get Orixá element correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaElement mapping or undefined if not found
 */
export function getOrixaElement(orixa: string): OrixaElement | undefined {
  const normalized = orixa.trim();
  return ORIXAS_MAP[normalized] || Object.values(ORIXAS_MAP).find(
    entry => entry.orixa.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get all registered Orixás
 * @returns Array of all Orixá names
 */
export function getAllOrixas(): string[] {
  return Object.keys(ORIXAS_MAP);
}

/**
 * Get Orixás by element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Array of Orixás with that primary element
 */
export function getOrixasByElement(elemento: OrixaElement['elemento_principal']): OrixaElement[] {
  return Object.values(ORIXAS_MAP).filter(
    entry => entry.elemento_principal === elemento
  );
}

/**
 * Get Orixás by day of week
 * @param dia - Day of week (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns Array of Orixás associated with that day
 */
export function getOrixasByDay(dia: string): OrixaElement[] {
  return Object.values(ORIXAS_MAP).filter(
    entry => entry.dia_da_semana.toLowerCase() === dia.toLowerCase()
  );
}

export default {
  getOrixaElement,
  getAllOrixas,
  getOrixasByElement,
  getOrixasByDay
};