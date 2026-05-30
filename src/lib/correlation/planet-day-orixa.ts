/**
 * Planet-Day-Orixá Correlation Engine
 * Convergência entre a astrologia clássica occidental e o sistema de Orixás
 * Baseado em: IDEIA.md 'Correspondências dos Orixás' e 'Calendário e Janelas'
 */

export interface PlanetDayOrixa {
  planeta: string;
  dia: string;
  orixa: string;
  elemento: string;
  energia: string;
  praticas: string[];
}

/**
 * Mapa de correspondências planeta-día-orixá
 * Cada planeta tem seu dia de máxima energia com seu Orixá regente
 */
const PLANET_DAY_ORIXA_MAP: Record<string, PlanetDayOrixa> = {
  // ============================================================
  // SOL - Dia de maior energia: Domingo
  // Regente: Xangô (vibração solar)
  // ============================================================
  'Sol-Domingo': {
    planeta: 'Sol',
    dia: 'Domingo',
    orixa: 'Xangô',
    elemento: 'Fogo',
    energia: 'Quente / Radiante',
    praticas: [
      'Recarregar energia vital com banhos de sol ritualístico',
      'Meditar na frequência 528 Hz para ativar o Plexo Solar',
      'Acender vela dourada para Xangô ao amanhecer',
      'Praticar afirmações de poder pessoal e propósito de vida',
      'Usar cores amarelo-dourado para potencializar o brilho',
      'Consagrar amuletos e patuás de poder',
 ],
  },

  // ============================================================
  // LUA - Dia de maior energia: Segunda-feira
  // Regente: Omolu/Obaluaê (transmutação e ancestralidade)
  // ============================================================
  'Lua-Segunda-feira': {
    planeta: 'Lua',
    dia: 'Segunda-feira',
    orixa: 'Omolu',
    elemento: 'Água',
    energia: 'Fria / Receptiva',
    praticas: [
      'Banhos de limpeza com ervas frias (saião, colônia, alfazema)',
      'Macerar ervas sob o luar para uso ritual noturno',
      'Lavar o Ori (cabeça) antes de dormir para pacificação emocional',
      'Despachos em encruzilhadas para abertura de caminhos',
      'Conexão com ancestrais e respeito às almas',
      'Rituais de transmutação e fim de ciclos pesados',
    ],
  },

  // ============================================================
  // MARTE - Dia de maior energia: Terça-feira
  // Regente: Iansã/Oyá (força, guerra e transformação)
  // ============================================================
  'Marte-Terça-feira': {
    planeta: 'Marte',
    dia: 'Terça-feira',
    orixa: 'Iansã',
    elemento: 'Fogo',
    energia: 'Quente / Ígnea',
    praticas: [
      'Decocção pesada de pinhão roxo e guiné (do pescoço para baixo)',
      'Rituais de quebra de demandas e feitiços',
      'Banimento de obsessores com defumações pesadas',
      'Saudação firme "Eparrei Iansã!" em momentos de necessidade',
      'Ativação do Sacro com ervas de descarrego',
      'Cortês espirituais com firmeza de Ogum',
    ],
  },

  // ============================================================
  // MERCÚRIO - Dia de maior energia: Quarta-feira
  // Regente: Xangô (justiça e equilíbrio mental)
  // ============================================================
  'Mercúrio-Quarta-feira': {
    planeta: 'Mercúrio',
    dia: 'Quarta-feira',
    orixa: 'Xangô',
    elemento: 'Ar',
    energia: 'Neutra / Volátil',
    praticas: [
      'Defumação residencial com estoraque ou alecrim pela manhã',
      'Estudos, leitura e trabalho intelectual',
      'Rituais de equilíbrio mental e estratégia',
      'Abafados de manjericão para clareza de pensamentos',
      'Abertura de caminhos comerciais e negócios',
      'Mantras de verdade e justiça (HAM - 741 Hz)',
    ],
  },

  // ============================================================
  // JÚPITER - Dia de maior energia: Quinta-feira
  // Regente: Oxóssi (fartura, conhecimento e cura)
  // ============================================================
  'Júpiter-Quinta-feira': {
    planeta: 'Júpiter',
    dia: 'Quinta-feira',
    orixa: 'Oxóssi',
    elemento: 'Ar / Água',
    energia: 'Fria / Expansiva',
    praticas: [
      'Infusões de samambaia, eucalipto e boldo para limpeza áurica',
      'Rituais de fartura e expansão de projetos',
      'Banhos de prosperidade com ervas das matas',
      'Busca por conhecimento e encontro com mentores',
      'Saudação "Okê Arô!" para atrair fartura',
      'Cura através das matas e ervas sagradas',
    ],
  },

  // ============================================================
  // VÊNUS - Dia de maior energia: Sexta-feira
  // Regente: Oxalá (paz, pureza e conexão divina)
  // ============================================================
  'Vênus-Sexta-feira': {
    planeta: 'Vênus',
    dia: 'Sexta-feira',
    orixa: 'Oxalá',
    elemento: 'Água',
    energia: 'Fria / Magnética',
    praticas: [
      'Banhos de mel, caldas de frutas e rosas para amor próprio',
      'Macerados com mel nas noites de Lua Cheia',
      'Bori espiritual e harmonização do Ori',
      'Silêncio, quietude e gratidão profunda',
      'Vestir-se de branco para purificação total',
      'Acender velas brancas e incenso puro (olíbano)',
      'Saudação "Epà Babá!" para paz absoluta',
    ],
  },

  // ============================================================
  // SATURNO - Dia de maior energia: Sábado
  // Regente: Oxum e Iemanjá (amor incondicional e águas geradoras)
  // ============================================================
  'Saturno-Sábado': {
    planeta: 'Saturno',
    dia: 'Sábado',
    orixa: 'Oxum',
    elemento: 'Água',
    energia: 'Quente / Densa',
    praticas: [
      'Decocção de canela-de-velho para lavar pés e solo',
      'Rituais de limpeza kármica e encerramento de ciclos',
      'Banhos de arruda e assa-peixe para ancoramento',
      'Oferecer six tipos de frutas e amalá para fartura',
      'Conexão com as Grandes Mães (Oxum e Iemanjá)',
      'Práticas de fertilidade e magnetismo pessoal',
      'Saudação "Ora Yê Yê Ô!" para Oxum',
    ],
  },
};

/**
 * Normaliza o nome do dia para busca
 */
function normalizeDay(dia: string): string {
  const dayMap: Record<string, string> = {
    domingo: 'Domingo',
    'segunda-feira': 'Segunda-feira',
    'segunda': 'Segunda-feira',
    'terça-feira': 'Terça-feira',
    'terca-feira': 'Terça-feira',
    'terca': 'Terça-feira',
    'quarta-feira': 'Quarta-feira',
    'quarta': 'Quarta-feira',
    'quinta-feira': 'Quinta-feira',
    'quinta': 'Quinta-feira',
    'sexta-feira': 'Sexta-feira',
    'sexta': 'Sexta-feira',
    sábado: 'Sábado',
    sabado: 'Sábado',
    'sábado': 'Sábado',
  };
  return dayMap[dia.toLowerCase()] || dia;
}

/**
 * Normaliza o nome do planeta para busca
 */
function normalizePlanet(planeta: string): string {
  const planetMap: Record<string, string> = {
    sol: 'Sol',
    lua: 'Lua',
    mercurio: 'Mercúrio',
    mercúrio: 'Mercúrio',
    marte: 'Marte',
    jupiter: 'Júpiter',
    júpiter: 'Júpiter',
    venus: 'Vênus',
    vênus: 'Vênus',
    saturno: 'Saturno',
  };
  return planetMap[planeta.toLowerCase()] || planeta;
}

/**
 * Obtém a correlação planeta-día-orixá
 * @param planeta - Nome do planeta (ex: 'Sol', 'Lua', 'Marte')
 * @param dia - Nome do dia da semana (ex: 'Domingo', 'Segunda-feira')
 * @returns A correlação correspondente ou null se não encontrada
 */
export function getPlanetDayOrixa(planeta: string, dia: string): PlanetDayOrixa | null {
  const normalizedPlanet = normalizePlanet(planeta);
  const normalizedDay = normalizeDay(dia);
  const key = `${normalizedPlanet}-${normalizedDay}`;
  return PLANET_DAY_ORIXA_MAP[key] || null;
}

/**
 * Obtém todas as correlações planeta-día-orixá
 * @returns Array com todas as 7 correlações (uma por planeta)
 */
export function getAllPlanetDayMappings(): PlanetDayOrixa[] {
  return Object.values(PLANET_DAY_ORIXA_MAP);
}

/**
 * Obtém o Orixá regente de um planeta no dia mais forte
 * @param planeta - Nome do planeta
 * @returns O Orixá regente ou null se planeta não reconhecido
 */
export function getPlanetRulingOrixa(planeta: string): string | null {
  const normalizedPlanet = normalizePlanet(planeta);
  const entry = Object.values(PLANET_DAY_ORIXA_MAP).find(
    (mapping) => mapping.planeta === normalizedPlanet
  );
  return entry?.orixa || null;
}

/**
 * Obtém o dia mais forte para um planeta
 * @param planeta - Nome do planeta
 * @returns O dia da semana ou null se planeta não reconhecido
 */
export function getPlanetStrongestDay(planeta: string): string | null {
  const normalizedPlanet = normalizePlanet(planeta);
  const entry = Object.values(PLANET_DAY_ORIXA_MAP).find(
    (mapping) => mapping.planeta === normalizedPlanet
  );
  return entry?.dia || null;
}

/**
 * Lista todos os planetas clássicos disponíveis
 */
export const CLASSICAL_PLANETS = [
  'Sol',
  'Lua',
  'Mercúrio',
  'Vênus',
  'Marte',
  'Júpiter',
  'Saturno',
] as const;

export type ClassicalPlanet = (typeof CLASSICAL_PLANETS)[number];
