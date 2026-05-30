/**
 * Orixá-Day Correlation Module
 * Maps Orixás to sacred days with ritual practices
 * Based on IDEIA.md 'Calendário e Janelas de Ativação Energética' and 'Orixás' tables
 */

export interface OrixaDay {
  /** Name of the Orixá */
  orixa: string;
  /** Sacred day of the week */
  dia_da_semana: string;
  /** Primary element of the Orixá */
  elemento: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  /** Sacred color(s) associated with the Orixá */
  cor: string;
  /** Ritual practices recommended for this Orixá */
  praticas_rituais: string[];
}

/** Orixá-to-Day mapping with ritual practices based on IDEIA.md */
const ORIXA_DAY_MAP: Record<string, OrixaDay> = {
  'Oxalá': {
    orixa: 'Oxalá',
    dia_da_semana: 'Sexta-feira',
    elemento: 'éter',
    cor: 'Branco / Violeta',
    praticas_rituais: [
      'Oração do Credo e Pai-Nosso',
      'Saudação ritual (Eparrei)',
      'Oferenda de alimentos brancos (farinhas, pães)',
      'Banho de descarrego com folhas sagradas',
      'Acendimento de velas brancas',
      'Homenagem aos Eguns (ancestrais)'
    ]
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    dia_da_semana: 'Sábado',
    elemento: 'água',
    cor: 'Azul Escuro / Branco',
    praticas_rituais: [
      'Oferenda de velas azuis e brancos',
      'Banho de sal e alfazema',
      'Oferendas na beira d\'água (flores, perfumes)',
      'Peticão por fertilidade e proteção',
      'Saudação ritual (Opanijé)',
      'Ação de graças pela semana'
    ]
  },
  'Oxum': {
    orixa: 'Oxum',
    dia_da_semana: 'Sábado',
    elemento: 'água',
    cor: 'Rosa / Amarelo-ouro',
    praticas_rituais: [
      'Oferenda de mel e flores rosas',
      'Peticionamento por amor e prosperidade',
      'Banho de infusão de ervas douradas',
      'Acendimento de velas douradas',
      'Pecúlio ritual (moedas douradas)',
      'Saudação ritual (O SSê)',
    ]
  },
  'Ogum': {
    orixa: 'Ogum',
    dia_da_semana: 'Terça-feira',
    elemento: 'terra',
    cor: 'Azul Claro / Verde',
    praticas_rituais: [
      'Corte de demandas e feitiçarias',
      'Saudação ritual (Eyo)',
      'Fogueiras de limpeza',
      'Banho de Arruda e Guiné',
      'Rituais de proteção e vitória',
      'Abertura de caminhos'
    ]
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    dia_da_semana: 'Quinta-feira',
    elemento: 'terra',
    cor: 'Verde / Azul-turquesa',
    praticas_rituais: [
      'Saudação ritual (Okê Arô)',
      'Oferendas na natureza (matas, florestas)',
      'Peticionamento por fartura e saúde',
      'Banho de ervas protetoras',
      'Rituais de caça espiritual',
      'Busca por conhecimento e sabedoria'
    ]
  },
  'Xangô': {
    orixa: 'Xangô',
    dia_da_semana: 'Quarta-feira',
    elemento: 'fogo',
    cor: 'Amarelo / Vermelho',
    praticas_rituais: [
      'Saudação ritual (Erori)',
      'Rituais de justiça divina',
      'Acendimento de velas amarelas e vermelhas',
      'Oferendas de comidas apimentadas epipoca',
      'Pedidos de verdade e retidão',
      'Rituais de equilíbrio e ordem'
    ]
  },
  'Iansã': {
    orixa: 'Iansã',
    dia_da_semana: 'Terça-feira',
    elemento: 'fogo',
    cor: 'Laranja / Vermelho',
    praticas_rituais: [
      'Saudação ritual (Eputá)',
      'Rituais de guerreira e protetora',
      'Quebra de demandas e feitiçarias',
      'Banho de limpeza energética forte',
      'Peticionamento por coragem e força',
      'Rituais de tempestade e transformação'
    ]
  },
  'Omolu': {
    orixa: 'Omolu',
    dia_da_semana: 'Segunda-feira',
    elemento: 'terra',
    cor: 'Preto / Vermelho / Branco',
    praticas_rituais: [
      'Saudação ritual (Etu)',
      'Rituais de cura e saúde',
      'Respeito aos antepassados (Eguns)',
      'Limpeza espiritual profunda',
      'Rituais de finitude e recomeço',
      'Proteção contra epidemias e doenças'
    ]
  },
  'Nanã': {
    orixa: 'Nanã',
    dia_da_semana: 'Terça-feira',
    elemento: 'água',
    cor: 'Lilás / Roxo',
    praticas_rituais: [
      'Saudação ritual (Saluba)',
      'Rituais de maternidade e sabedoria',
      'Oferendas de alimentos liláses',
      'Petições por humildade e paciência',
      'Banho de purificação com ervas roxas',
      'Veneração aos ancestrais antigos'
    ]
  },
  'Exu': {
    orixa: 'Exu',
    dia_da_semana: 'Segunda-feira',
    elemento: 'fogo',
    cor: 'Vermelho / Preto',
    praticas_rituais: [
      'Saudação ritual (Lará)',
      'Abertura de todos os rituais',
      'Rituais de comunicação e mensageria',
      'Propiciação para caminhos abertos',
      'Pagamento de demandas e obrigações',
      'Proteção contra magia negra'
    ]
  }
};

/**
 * Get Orixá day correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaDay mapping or undefined if not found
 */
export function getOrixaDay(orixa: string): OrixaDay | undefined {
  const normalized = orixa.trim();
  return ORIXA_DAY_MAP[normalized] || Object.values(ORIXA_DAY_MAP).find(
    entry => entry.orixa.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get all Orixá-day mappings
 * @returns Object with all Orixá day correlations
 */
export function getDayOrixa(): Record<string, OrixaDay> {
  return { ...ORIXA_DAY_MAP };
}

/**
 * Get all Orixá day entries as array
 * @returns Array of all OrixaDay entries
 */
export function getAllOrixaDays(): OrixaDay[] {
  return Object.values(ORIXA_DAY_MAP);
}

export default {
  getOrixaDay,
  getDayOrixa,
  getAllOrixaDays
};
